package com.flamecrust.api.controller;

import com.flamecrust.api.security.JwtUtil;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import com.flamecrust.api.service.EmailService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final JdbcTemplate jdbc;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final SecureRandom secureRandom = new SecureRandom();

    // Rate limiting buckets per IP/Email
    private final Map<String, Bucket> otpBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();

    public AuthController(JdbcTemplate jdbc, EmailService emailService, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.jdbc = jdbc;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    private Bucket getOtpBucket(String key) {
        return otpBuckets.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(Bandwidth.builder().capacity(100).refillIntervally(100, Duration.ofMinutes(10)).build())
                .build());
    }

    private Bucket getLoginBucket(String key) {
        return loginBuckets.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(Bandwidth.builder().capacity(100).refillIntervally(100, Duration.ofMinutes(15)).build())
                .build());
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        Bucket bucket = getOtpBucket(email);
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", "Too many OTP requests. Please wait."));
        }

        String otp = String.format("%06d", secureRandom.nextInt(999999));
        Timestamp expiresAt = Timestamp.from(Instant.now().plusSeconds(5 * 60)); // 5 minutes expiration

        jdbc.update("INSERT INTO otps (target, otp_code, is_used, expires_at) VALUES (?, ?, ?, ?)",
                email, otp, false, expiresAt);

        // For local development, log the OTP code so we can test without SMTP
        log.info("Generated OTP for {}: {}", email, otp);
        try {
            emailService.sendOtpEmail(email, otp);
        } catch (Exception e) {
            log.warn("Could not send OTP email (SMTP not configured). OTP is printed above for local testing. Error: {}", e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "OTP generated successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
        }

        Bucket bucket = getLoginBucket(email);
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", "Too many attempts. Please wait."));
        }

        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT id FROM otps WHERE target = ? AND otp_code = ? AND is_used = false AND expires_at > ? ORDER BY id DESC LIMIT 1",
                email, otp, Timestamp.from(Instant.now()));

        if (rows.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired OTP"));
        }

        long otpId = ((Number) rows.get(0).get("id")).longValue();
        jdbc.update("UPDATE otps SET is_used = true WHERE id = ?", otpId);

        // Fetch or Create Customer
        List<Map<String, Object>> customers = jdbc.queryForList("SELECT * FROM customers WHERE email = ? LIMIT 1", email);
        Map<String, Object> customer;
        if (customers.isEmpty()) {
            String name = email.contains("@") ? email.substring(0, email.indexOf("@")) : "User";
            jdbc.update("INSERT INTO customers (name, email) VALUES (?, ?)", name, email);
            customer = jdbc.queryForList("SELECT * FROM customers WHERE email = ? LIMIT 1", email).getFirst();
        } else {
            customer = customers.getFirst();
        }

        String token = jwtUtil.generateToken(email, "CUSTOMER");
        return ResponseEntity.ok(Map.of("customer", customer, "token", token));
    }
    
    @PostMapping("/customer-login")
    public ResponseEntity<?> customerLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Bucket bucket = getLoginBucket(email);
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", "Too many attempts. Please wait."));
        }

        List<Map<String, Object>> customers = jdbc.queryForList(
                "SELECT * FROM customers WHERE email = ? AND status = 'ACTIVE' LIMIT 1", email);

        if (customers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }

        Map<String, Object> customer = customers.getFirst();
        String passwordHash = (String) customer.get("password_hash");

        if (passwordHash == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Password not set. Please use OTP to login first."));
        }

        // Support both old SHA-256 (temporarily) and new BCrypt. 
        // We will just verify using BCrypt, or if it matches the sha-256 for backward compatibility during migration.
        boolean isMatch = passwordEncoder.matches(password, passwordHash);
        
        // Backward compatibility for old unsalted sha256
        if (!isMatch && passwordHash.length() == 64) {
            String sha256Hex = hashPasswordSha256(password);
            if (passwordHash.equals(sha256Hex)) {
                isMatch = true;
                // Upgrade hash
                jdbc.update("UPDATE customers SET password_hash = ? WHERE id = ?", passwordEncoder.encode(password), customer.get("id"));
            }
        }

        if (!isMatch) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }

        String token = jwtUtil.generateToken(email, "CUSTOMER");
        return ResponseEntity.ok(Map.of("customer", customer, "token", token));
    }

    @PostMapping("/customer-register")
    public ResponseEntity<?> customerRegister(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String phone = body.get("phone");
        String password = body.get("password");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        if (password == null || password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }
        if (name == null || name.isBlank()) {
            name = email.contains("@") ? email.substring(0, email.indexOf("@")) : "Customer";
        }

        // Check if customer already exists
        List<Map<String, Object>> existing = jdbc.queryForList("SELECT id FROM customers WHERE email = ? LIMIT 1", email);
        if (!existing.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "An account with this email already exists. Please sign in."));
        }

        String encodedPassword = passwordEncoder.encode(password);
        jdbc.update("INSERT INTO customers (name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
                name, email, phone, encodedPassword);

        Map<String, Object> customer = jdbc.queryForList("SELECT * FROM customers WHERE email = ? LIMIT 1", email).getFirst();
        customer.remove("password_hash");

        String token = jwtUtil.generateToken(email, "CUSTOMER");
        return ResponseEntity.ok(Map.of(
                "type", "CUSTOMER",
                "role", "CUSTOMER",
                "customer", customer,
                "token", token
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> unifiedLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        System.out.println("unifiedLogin attempt for: " + email);

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Bucket bucket = getLoginBucket(email);
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", "Too many attempts. Please wait."));
        }

        // 1. Check users (Staff / Admin / Manager)
        List<Map<String, Object>> users = jdbc.queryForList(
                "SELECT u.id, u.name, u.email, u.status, u.password_hash, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ? AND u.status = 'ACTIVE' LIMIT 1",
                email);
        System.out.println("users found: " + users.size());

        if (!users.isEmpty()) {
            Map<String, Object> user = users.getFirst();
            String passwordHash = (String) user.get("password_hash");
            if (verifyPassword(password, passwordHash, "users", user.get("id"))) {
                String role = (String) user.get("role");
                String token = jwtUtil.generateToken(email, role != null ? role.toUpperCase() : "ADMIN");
                return ResponseEntity.ok(Map.of(
                        "type", "ADMIN",
                        "role", role != null ? role.toUpperCase() : "ADMIN",
                        "user", user,
                        "token", token
                ));
            }
            System.out.println("verifyPassword failed for user");
        }

        // 2. Check customers
        List<Map<String, Object>> customers = jdbc.queryForList(
                "SELECT * FROM customers WHERE email = ? AND status = 'ACTIVE' LIMIT 1", email);
        System.out.println("customers found: " + customers.size());

        if (!customers.isEmpty()) {
            Map<String, Object> customer = customers.getFirst();
            String passwordHash = (String) customer.get("password_hash");
            if (verifyPassword(password, passwordHash, "customers", customer.get("id"))) {
                String token = jwtUtil.generateToken(email, "CUSTOMER");
                return ResponseEntity.ok(Map.of(
                        "type", "CUSTOMER",
                        "role", "CUSTOMER",
                        "customer", customer,
                        "token", token
                ));
            }
            System.out.println("verifyPassword failed for customer");
        }

        // 3. Check drivers
        List<Map<String, Object>> drivers = jdbc.queryForList(
                "SELECT * FROM drivers WHERE email = ? AND status != 'SUSPENDED' LIMIT 1", email);
        System.out.println("drivers found: " + drivers.size());

        if (!drivers.isEmpty()) {
            Map<String, Object> driver = drivers.getFirst();
            if (verifyPassword(password, (String) driver.get("password_hash"), "drivers", driver.get("id"))) {
                String token = jwtUtil.generateToken(email, "DRIVER");
                driver.remove("password_hash");
                return ResponseEntity.ok(Map.of(
                        "type", "DRIVER",
                        "role", "DRIVER",
                        "driver", driver,
                        "token", token
                ));
            }
            System.out.println("verifyPassword failed for driver");
        }

        // 4. Check kitchen staff
        List<Map<String, Object>> kitchenStaffList = jdbc.queryForList(
                "SELECT * FROM kitchen_staff WHERE email = ? LIMIT 1", email);
        System.out.println("kitchen staff found: " + kitchenStaffList.size());

        if (!kitchenStaffList.isEmpty()) {
            Map<String, Object> staff = kitchenStaffList.getFirst();
            if (verifyPassword(password, (String) staff.get("password_hash"), "kitchen_staff", staff.get("id"))) {
                String token = jwtUtil.generateToken(email, "KITCHEN_STAFF");
                staff.remove("password_hash");
                return ResponseEntity.ok(Map.of(
                        "type", "KITCHEN_STAFF",
                        "role", "KITCHEN_STAFF",
                        "user", staff,
                        "token", token
                ));
            }
            System.out.println("verifyPassword failed for kitchen staff");
        }

        System.out.println("Returning 401 Unauthorized");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name = body.get("name");
        String avatar = body.get("avatar");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        Bucket bucket = getLoginBucket(email);
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", "Too many attempts. Please wait."));
        }

        List<Map<String, Object>> customers = jdbc.queryForList("SELECT * FROM customers WHERE email = ? LIMIT 1", email);
        Map<String, Object> customer;
        if (customers.isEmpty()) {
            if (name == null || name.isBlank()) {
                name = email.contains("@") ? email.substring(0, email.indexOf("@")) : "User";
            }
            jdbc.update("INSERT INTO customers (name, email, avatar) VALUES (?, ?, ?)", name, email, avatar);
            customer = jdbc.queryForList("SELECT * FROM customers WHERE email = ? LIMIT 1", email).getFirst();
        } else {
            customer = customers.getFirst();
            if (avatar != null && !avatar.isBlank()) {
                jdbc.update("UPDATE customers SET avatar = ? WHERE id = ? AND (avatar IS NULL OR avatar = '')", avatar, customer.get("id"));
                customer = jdbc.queryForList("SELECT * FROM customers WHERE email = ? LIMIT 1", email).getFirst();
            }
        }

        customer.remove("password_hash");
        String token = jwtUtil.generateToken(email, "CUSTOMER");
        return ResponseEntity.ok(Map.of(
                "type", "CUSTOMER",
                "role", "CUSTOMER",
                "customer", customer,
                "token", token,
                "avatar", customer.get("avatar") != null ? customer.get("avatar") : (avatar != null ? avatar : "")
        ));
    }

    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Bucket bucket = getLoginBucket(email);
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", "Too many attempts. Please wait."));
        }

        List<Map<String, Object>> users = jdbc.queryForList(
                "SELECT u.id, u.name, u.email, u.status, u.password_hash, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ? AND u.status = 'ACTIVE' LIMIT 1",
                email);

        if (users.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials or inactive account"));
        }

        Map<String, Object> user = users.getFirst();
        String passwordHash = (String) user.get("password_hash");
        
        if (!verifyPassword(password, passwordHash, "users", user.get("id"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }

        String role = (String) user.get("role");
        String token = jwtUtil.generateToken(email, role.toUpperCase());
        return ResponseEntity.ok(Map.of("user", user, "token", token));
    }
    
    @PostMapping("/driver-login")
    public ResponseEntity<?> driverLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Bucket bucket = getLoginBucket("driver:" + email);
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", "Too many attempts. Please wait."));
        }

        List<Map<String, Object>> drivers = jdbc.queryForList(
                "SELECT * FROM drivers WHERE email = ? LIMIT 1", email);

        if (drivers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }

        Map<String, Object> driver = drivers.getFirst();
        String passwordHash = (String) driver.get("password_hash");

        if (passwordHash == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Password not set"));
        }

        if (!verifyPassword(password, passwordHash, "drivers", driver.get("id"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }

        String token = jwtUtil.generateToken(email, "DRIVER");
        // Remove password_hash from response
        driver.remove("password_hash");
        return ResponseEntity.ok(Map.of("driver", driver, "token", token));
    }

    @PostMapping("/kitchen-login")
    public ResponseEntity<?> kitchenLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Bucket bucket = getLoginBucket("kitchen:" + email);
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", "Too many attempts. Please wait."));
        }

        List<Map<String, Object>> staffList = jdbc.queryForList(
                "SELECT * FROM kitchen_staff WHERE email = ? LIMIT 1", email);

        if (staffList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }

        Map<String, Object> staff = staffList.getFirst();
        String passwordHash = (String) staff.get("password_hash");

        if (passwordHash == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Password not set"));
        }

        if (!verifyPassword(password, passwordHash, "kitchen_staff", staff.get("id"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }

        String token = jwtUtil.generateToken(email, "KITCHEN_STAFF");
        staff.remove("password_hash");
        return ResponseEntity.ok(Map.of("user", staff, "token", token, "type", "KITCHEN_STAFF"));
    }

    @PostMapping("/driver-register")
    public ResponseEntity<?> driverRegister(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String phone = body.get("phone");
        String password = body.get("password");

        if (name == null || email == null || phone == null || password == null
                || name.isBlank() || email.isBlank() || phone.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email, phone, and password are all required"));
        }

        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        // Check if email or phone already exists
        List<Map<String, Object>> existing = jdbc.queryForList(
                "SELECT id FROM drivers WHERE email = ? OR phone = ? LIMIT 1", email, phone);
        if (!existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "A driver with this email or phone already exists"));
        }

        String hashedPassword = passwordEncoder.encode(password);
        jdbc.update("INSERT INTO drivers (name, phone, email, password_hash) VALUES (?, ?, ?, ?)",
                name, phone, email, hashedPassword);

        Map<String, Object> driver = jdbc.queryForList("SELECT * FROM drivers WHERE email = ? LIMIT 1", email).getFirst();
        String token = jwtUtil.generateToken(email, "DRIVER");
        driver.remove("password_hash");
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("driver", driver, "token", token));
    }

    @GetMapping("/driver-me")
    public ResponseEntity<?> driverMe(jakarta.servlet.http.HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        String email;
        try {
            email = jwtUtil.extractEmail(token);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
        }

        List<Map<String, Object>> drivers = jdbc.queryForList("SELECT * FROM drivers WHERE email = ? LIMIT 1", email);
        if (drivers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Driver not found"));
        }
        Map<String, Object> driver = drivers.getFirst();
        driver.remove("password_hash");
        return ResponseEntity.ok(driver);
    }

    @PutMapping("/driver-profile")
    public ResponseEntity<?> driverProfile(jakarta.servlet.http.HttpServletRequest request, @RequestBody Map<String, Object> body) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        String email;
        try {
            email = jwtUtil.extractEmail(token);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
        }

        List<Map<String, Object>> drivers = jdbc.queryForList("SELECT id FROM drivers WHERE email = ? LIMIT 1", email);
        if (drivers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Driver not found"));
        }
        long driverId = ((Number) drivers.getFirst().get("id")).longValue();

        // Build dynamic UPDATE
        java.util.LinkedHashMap<String, Object> updates = new java.util.LinkedHashMap<>();
        java.util.Set<String> allowed = java.util.Set.of(
                "name", "phone", "profile_photo", "date_of_birth", "national_id",
                "address", "emergency_contact", "vehicle_info", "license_plate", "profile_completed");
        body.forEach((key, value) -> {
            if (allowed.contains(key)) {
                updates.put(key, value);
            }
        });

        if (updates.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No valid fields to update"));
        }

        String assignments = updates.keySet().stream().map(col -> "`" + col + "` = ?")
                .collect(java.util.stream.Collectors.joining(", "));
        Object[] args = new Object[updates.size() + 1];
        int i = 0;
        for (Object val : updates.values()) {
            args[i++] = val;
        }
        args[i] = driverId;

        jdbc.update("UPDATE drivers SET " + assignments + " WHERE id = ?", args);

        Map<String, Object> updated = jdbc.queryForList("SELECT * FROM drivers WHERE id = ? LIMIT 1", driverId).getFirst();
        updated.remove("password_hash");
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/driver-location")
    public ResponseEntity<?> driverLocation(jakarta.servlet.http.HttpServletRequest request, @RequestBody Map<String, Object> body) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        String email;
        try {
            email = jwtUtil.extractEmail(token);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
        }

        Object lat = body.get("latitude");
        Object lng = body.get("longitude");
        if (lat == null || lng == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "latitude and longitude are required"));
        }

        jdbc.update("UPDATE drivers SET latitude = ?, longitude = ?, location_updated_at = CURRENT_TIMESTAMP WHERE email = ?",
                lat, lng, email);

        return ResponseEntity.ok(Map.of("message", "Location updated"));
    }

    @PostMapping("/customer-change-password")
    public ResponseEntity<?> customerChangePassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        String otp = body.get("otp");

        if (email == null || email.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and new password are required"));
        }

        List<Map<String, Object>> customers = jdbc.queryForList("SELECT * FROM customers WHERE email = ? LIMIT 1", email);
        if (customers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Customer not found"));
        }

        Map<String, Object> customer = customers.getFirst();
        long customerId = ((Number) customer.get("id")).longValue();
        String currentHash = (String) customer.get("password_hash");

        // If customer already has a password and no OTP is provided, verify old password
        if (currentHash != null && !currentHash.isBlank() && (otp == null || otp.isBlank())) {
            if (oldPassword == null || oldPassword.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is required to change password"));
            }
            boolean isOldMatch = verifyPassword(oldPassword, currentHash, "customers", customerId);
            if (!isOldMatch) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Current password is incorrect"));
            }
        }

        // Hash and save new password with BCrypt
        String encoded = passwordEncoder.encode(newPassword);
        jdbc.update("UPDATE customers SET password_hash = ? WHERE id = ?", encoded, customerId);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully", "hasPassword", true));
    }

    @PostMapping("/customer-update-profile")
    public ResponseEntity<?> customerUpdateProfile(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        String name = (String) body.get("name");
        String phone = (String) body.get("phone");
        String avatar = (String) body.get("avatar");
        String password = (String) body.get("password");

        List<Map<String, Object>> customers = jdbc.queryForList("SELECT id FROM customers WHERE email = ? LIMIT 1", email);
        if (customers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Customer not found"));
        }
        long customerId = ((Number) customers.getFirst().get("id")).longValue();

        if (name != null) {
            jdbc.update("UPDATE customers SET name = ? WHERE id = ?", name, customerId);
        }
        if (phone != null) {
            jdbc.update("UPDATE customers SET phone = ? WHERE id = ?", phone, customerId);
        }
        if (avatar != null) {
            jdbc.update("UPDATE customers SET avatar = ? WHERE id = ?", avatar, customerId);
        }
        if (password != null && !password.isBlank() && password.length() >= 6) {
            jdbc.update("UPDATE customers SET password_hash = ? WHERE id = ?", passwordEncoder.encode(password), customerId);
        }

        Map<String, Object> updated = jdbc.queryForList("SELECT * FROM customers WHERE id = ? LIMIT 1", customerId).getFirst();
        updated.remove("password_hash");
        return ResponseEntity.ok(updated);
    }

    private boolean verifyPassword(String rawPassword, String passwordHash, String table, Object id) {
        if (passwordHash == null) return false;
        boolean isMatch = false;
        
        // 1. Try BCrypt match
        try {
            isMatch = passwordEncoder.matches(rawPassword, passwordHash);
        } catch (Exception ignored) {}
        
        // 2. Try Plain text match (and auto-upgrade to BCrypt)
        if (!isMatch && passwordHash.equals(rawPassword)) {
            isMatch = true;
            try {
                jdbc.update("UPDATE " + table + " SET password_hash = ? WHERE id = ?", passwordEncoder.encode(rawPassword), id);
            } catch (Exception ignored) {}
        }
        
        // 3. Try SHA-256 match (and auto-upgrade to BCrypt)
        if (!isMatch && passwordHash.length() == 64) {
            String sha256Hex = hashPasswordSha256(rawPassword);
            if (passwordHash.equals(sha256Hex)) {
                isMatch = true;
                try {
                    jdbc.update("UPDATE " + table + " SET password_hash = ? WHERE id = ?", passwordEncoder.encode(rawPassword), id);
                } catch (Exception ignored) {}
            }
        }
        return isMatch;
    }

    private String hashPasswordSha256(String password) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
