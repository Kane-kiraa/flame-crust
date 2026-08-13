package com.flamecrust.api.product;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository products;

    public ProductController(ProductRepository products) {
        this.products = products;
    }

    @GetMapping
    public List<Product> all() {
        return products.findAll();
    }

    @GetMapping("/{category}")
    public ResponseEntity<List<Product>> byCategory(@PathVariable String category) {
        return ResponseEntity.ok(products.findByCategoryIgnoreCase(category));
    }
}
