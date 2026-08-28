package com.flamecrust.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final JdbcTemplate jdbc;

    @GetMapping
    public Map<String, Object> overview() {
        Map<String, Object> result = new LinkedHashMap<>();
        
        try {
            // 1. High performance aggregated stats
            BigDecimal totalRevenue = jdbc.queryForObject(
                    "SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'CANCELLED'", BigDecimal.class);
            Long totalOrders = jdbc.queryForObject("SELECT COUNT(*) FROM orders", Long.class);
            Long totalProducts = jdbc.queryForObject("SELECT COUNT(*) FROM products", Long.class);
            Long activeDrivers = jdbc.queryForObject("SELECT COUNT(*) FROM drivers", Long.class);

            result.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
            result.put("totalOrders", totalOrders != null ? totalOrders : 0L);
            result.put("totalProducts", totalProducts != null ? totalProducts : 0L);
            result.put("activeDrivers", activeDrivers != null ? activeDrivers : 0L);

            // 2. Optimized recent orders with customer names (fast index scan)
            List<Map<String, Object>> recentOrders = jdbc.queryForList(
                    "SELECT o.id, o.order_number, o.customer_id, c.name AS customer_name, c.phone AS customer_phone, o.total, o.status, o.created_at " +
                    "FROM orders o LEFT JOIN customers c ON o.customer_id = c.id " +
                    "ORDER BY o.id DESC LIMIT 10");
            result.put("recentOrders", recentOrders);
            result.put("orders", recentOrders);

            // 3. Fast 7-day revenue aggregation
            List<Map<String, Object>> chartPoints = jdbc.queryForList(
                    "SELECT DATE(created_at) as order_date, COALESCE(SUM(total), 0) as daily_revenue " +
                    "FROM orders WHERE status != 'CANCELLED' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) " +
                    "GROUP BY DATE(created_at) ORDER BY order_date ASC");
            result.put("chartData", chartPoints);

        } catch (Exception e) {
            result.put("totalRevenue", BigDecimal.ZERO);
            result.put("totalOrders", 0);
            result.put("totalProducts", 0);
            result.put("activeDrivers", 0);
            result.put("recentOrders", List.of());
            result.put("orders", List.of());
            result.put("chartData", List.of());
        }
        
        return result;
    }
}
