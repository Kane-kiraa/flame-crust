package com.flamecrust.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import com.flamecrust.api.model.Product;
import com.flamecrust.api.model.Category;
import com.flamecrust.api.repository.ProductRepository;
import com.flamecrust.api.repository.CategoryRepository;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository products;
    private final CategoryRepository categories;

    public ProductController(ProductRepository products, CategoryRepository categories) {
        this.products = products;
        this.categories = categories;
    }

    @GetMapping
    public List<Product> all() {
        return products.findByActiveTrueOrderByIdAsc();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categories.findByActiveTrueOrderBySortOrderAsc());
    }

    @GetMapping("/{category}")
    public ResponseEntity<List<Product>> byCategory(@PathVariable String category) {
        return ResponseEntity.ok(products.findByCategoryIgnoreCase(category).stream()
                .filter(Product::isActive)
                .toList());
    }
}
