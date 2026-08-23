package com.flamecrust.api.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/** Generic CRUD endpoints for the 18 database resources. */
@RestController
@RequestMapping("/api/admin")
public class AdminCrudController {
    private static final Map<String, Resource> RESOURCES = resources();

    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public AdminCrudController(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.mapper = mapper;
    }

    @GetMapping("/{resource}")
    public List<Map<String, Object>> all(@PathVariable String resource) {
        Resource definition = definition(resource);
        return jdbc.queryForList("SELECT * FROM `" + definition.table() + "` ORDER BY id DESC");
    }

    @GetMapping("/{resource}/{id}")
    public ResponseEntity<?> one(@PathVariable String resource, @PathVariable long id) {
        Resource definition = definition(resource);
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT * FROM `" + definition.table() + "` WHERE id = ?", id);
        return rows.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(rows.getFirst());
    }

    @PostMapping("/{resource}")
    public ResponseEntity<?> create(@PathVariable String resource, @RequestBody Map<String, Object> body) {
        try {
            Resource definition = definition(resource);
            Map<String, Object> values = clean(definition, body);
            if (values.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request body has no writable fields"));
            }

            String columns = values.keySet().stream().map(column -> "`" + column + "`").collect(Collectors.joining(", "));
            String placeholders = values.keySet().stream().map(column -> "?").collect(Collectors.joining(", "));

            String sql = "INSERT INTO `" + definition.table() + "` (" + columns + ") VALUES (" + placeholders + ")";
            if ("reviews".equalsIgnoreCase(definition.table())) {
                sql += " ON DUPLICATE KEY UPDATE `rating` = VALUES(`rating`), `comment` = VALUES(`comment`), `created_at` = CURRENT_TIMESTAMP";
            }

            jdbc.update(sql, values.values().toArray());
            Number id = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Number.class);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id != null ? id.longValue() : 0, "message", "created"));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Database constraint failed: " + e.getMostSpecificCause().getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{resource}/{id}")
    public ResponseEntity<?> update(@PathVariable String resource, @PathVariable long id,
                                    @RequestBody Map<String, Object> body) {
        try {
            Resource definition = definition(resource);
            Map<String, Object> values = clean(definition, body);
            if (values.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request body has no writable fields"));
            }

            String assignments = values.keySet().stream().map(column -> "`" + column + "` = ?")
                    .collect(Collectors.joining(", "));
            Object[] args = Arrays.copyOf(values.values().toArray(), values.size() + 1);
            args[values.size()] = id;
            int changed = jdbc.update("UPDATE `" + definition.table() + "` SET " + assignments + " WHERE id = ?", args);
            return changed == 0 ? ResponseEntity.notFound().build() : ResponseEntity.ok(Map.of("message", "updated", "id", id));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Database constraint failed: " + e.getMostSpecificCause().getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{resource}/{id}")
    public ResponseEntity<?> delete(@PathVariable String resource, @PathVariable long id) {
        Resource definition = definition(resource);
        int deleted = jdbc.update("DELETE FROM `" + definition.table() + "` WHERE id = ?", id);
        return deleted == 0 ? ResponseEntity.notFound().build() : ResponseEntity.ok(Map.of("message", "deleted", "id", id));
    }


    private Resource definition(String name) {
        Resource resource = RESOURCES.get(name.toLowerCase());
        if (resource == null) {
            throw new IllegalArgumentException("Unknown API resource: " + name);
        }
        return resource;
    }

    private Map<String, Object> clean(Resource resource, Map<String, Object> body) {
        Map<String, Object> values = new LinkedHashMap<>();
        body.forEach((key, value) -> {
            if (!key.equals("id") && resource.columns().contains(key)) {
                values.put(key, sqlValue(value));
            } else if (key.equals("password") && value instanceof String password && !password.isBlank()) {
                if (resource.columns().contains("password_hash")) {
                    values.put("password_hash", new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(password));
                }
            }
        });
        return values;
    }

    private Object sqlValue(Object value) {
        if (value instanceof Map<?, ?> || value instanceof List<?>) {
            try {
                return mapper.writeValueAsString(value);
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Invalid JSON field", e);
            }
        }
        return value;
    }

    private record Resource(String table, Set<String> columns) {}

    private static Map<String, Resource> resources() {
        Map<String, Resource> map = new LinkedHashMap<>();
        add(map, "roles", "name", "permissions");
        add(map, "users", "role_id", "name", "email", "password_hash", "status", "deleted_at");
        add(map, "customers", "name", "email", "phone", "password_hash", "status", "deleted_at");
        add(map, "addresses", "customer_id", "label", "address_line", "city", "postal_code", "notes", "is_default");
        add(map, "categories", "slug", "name", "sort_order", "active");
        add(map, "products", "sku", "category_id", "name", "description", "price", "base_price", "category", "image", "tags", "rating", "popular", "spicy", "vegetarian", "active");
        add(map, "product_options", "product_id", "name", "is_required");
        add(map, "product_variants", "option_id", "name", "price_adjustment", "active");
        add(map, "reviews", "product_id", "customer_id", "rating", "comment");
        add(map, "carts", "customer_id");
        add(map, "cart_items", "cart_id", "product_id", "quantity", "options");
        add(map, "coupons", "code", "discount_type", "discount_value", "min_order_amount", "expires_at", "active");
        add(map, "orders", "order_number", "customer_id", "address_id", "coupon_id", "driver_id", "branch_id", "status", "subtotal", "discount_amount", "delivery_fee", "total", "notes", "idempotency_key");
        add(map, "order_status_history", "order_id", "status", "notes");
        add(map, "order_items", "order_id", "product_id", "product_name", "quantity", "unit_price", "line_total", "options");
        add(map, "payments", "order_id", "method", "status", "amount", "transaction_id", "paid_at");
        add(map, "payment_attempts", "order_id", "method", "status", "amount", "transaction_id", "error_message");
        add(map, "drivers", "name", "phone", "email", "password_hash", "vehicle_info", "profile_photo", "date_of_birth", "national_id", "address", "emergency_contact", "license_plate", "latitude", "longitude", "location_updated_at", "profile_completed", "status");
        add(map, "audit_logs", "user_id", "action", "table_name", "old_data", "new_data");
        add(map, "branches", "name", "address", "phone", "active");
        add(map, "branch_staff", "branch_id", "user_id");
        add(map, "inventory", "branch_id", "product_id", "stock_quantity", "low_stock_threshold");
        add(map, "kitchen_staff", "name", "phone", "email", "password_hash", "role_title", "status");
        return Map.copyOf(map);
    }

    private static void add(Map<String, Resource> map, String name, String... columns) {
        map.put(name, new Resource(name, Set.copyOf(Arrays.asList(columns))));
    }
}
