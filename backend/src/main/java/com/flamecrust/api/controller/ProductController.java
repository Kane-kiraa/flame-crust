package com.flamecrust.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import com.flamecrust.api.model.Product;
import com.flamecrust.api.repository.ProductRepository;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository products;
    private final org.springframework.jdbc.core.JdbcTemplate jdbc;

    public ProductController(ProductRepository products, org.springframework.jdbc.core.JdbcTemplate jdbc) {
        this.products = products;
        this.jdbc = jdbc;
    }

    @GetMapping
    public List<Product> all() {
        return products.findByActiveTrueOrderByIdAsc();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<java.util.Map<String, Object>>> getCategories() {
        return ResponseEntity.ok(jdbc.queryForList("SELECT * FROM categories WHERE active = TRUE ORDER BY sort_order ASC"));
    }

    @GetMapping("/{category}")
    public ResponseEntity<List<Product>> byCategory(@PathVariable String category) {
        return ResponseEntity.ok(products.findByCategoryIgnoreCase(category).stream()
                .filter(Product::isActive)
                .toList());
    }
}
