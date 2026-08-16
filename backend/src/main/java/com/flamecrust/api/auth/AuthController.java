package com.flamecrust.api.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final JdbcTemplate jdbc;
    private final EmailService emailService;

    public AuthController(JdbcTemplate jdbc, EmailService emailService) {
        this.jdbc = jdbc;
        this.emailService = emailService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        Timestamp expiresAt = Timestamp.from(Instant.now().plusSeconds(5 * 60)); // 5 minutes expiration

        jdbc.update("INSERT INTO otps (target, otp_code, is_used, expires_at) VALUES (?, ?, ?, ?)",
                email, otp, false, expiresAt);

        log.info("Generated OTP for {}: {}", email, otp);
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
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
        if (customers.isEmpty()) {
            String name = email.contains("@") ? email.substring(0, email.indexOf("@")) : "User";
            jdbc.update("INSERT INTO customers (name, email) VALUES (?, ?)", name, email);
            customers = jdbc.queryForList("SELECT * FROM customers WHERE email = ? LIMIT 1", email);
        }

        return ResponseEntity.ok(customers.get(0));
    }
    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            String passwordHash = hexString.toString();

            List<Map<String, Object>> users = jdbc.queryForList(
                    "SELECT u.id, u.name, u.email, u.status, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ? AND u.password_hash = ? AND u.status = 'ACTIVE' LIMIT 1",
                    email, passwordHash);

            if (users.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials or inactive account"));
            }

            return ResponseEntity.ok(users.get(0));
        } catch (java.security.NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not found", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal server error"));
        }
    }
}
