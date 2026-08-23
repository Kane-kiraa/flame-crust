package com.flamecrust.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.flamecrust.api.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrueOrderByIdAsc();
    List<Product> findByCategoryIgnoreCase(String category);
}
