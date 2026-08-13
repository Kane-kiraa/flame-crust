package com.flamecrust.api.dashboard;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final JdbcTemplate jdbc;

    public DashboardController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public Map<String, Object> overview() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("products", rows("SELECT id, name, category, price, image, popular, spicy, vegetarian FROM products ORDER BY id"));
        result.put("customers", rows("SELECT id, name, email, phone, created_at FROM customers ORDER BY id DESC"));
        result.put("addresses", rows("SELECT id, customer_id, label, address_line, city, postal_code, is_default FROM addresses ORDER BY id DESC"));
        result.put("orders", rows("SELECT id, order_number, customer_id, address_id, status, subtotal, delivery_fee, total, created_at FROM orders ORDER BY id DESC"));
        result.put("orderItems", rows("SELECT id, order_id, product_id, quantity, unit_price, line_total FROM order_items ORDER BY id DESC"));
        result.put("payments", rows("SELECT id, order_id, method, status, amount, transaction_id, paid_at, created_at FROM payments ORDER BY id DESC"));
        return result;
    }

    private List<Map<String, Object>> rows(String sql) {
        return jdbc.queryForList(sql);
    }
}
