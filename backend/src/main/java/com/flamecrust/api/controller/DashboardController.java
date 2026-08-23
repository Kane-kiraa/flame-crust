package com.flamecrust.api.controller;

import com.flamecrust.api.repository.ProductRepository;
import com.flamecrust.api.repository.CustomerRepository;
import com.flamecrust.api.repository.AddressRepository;
import com.flamecrust.api.repository.OrderRepository;
import com.flamecrust.api.repository.OrderItemRepository;
import com.flamecrust.api.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;

    @GetMapping
    public Map<String, Object> overview() {
        Map<String, Object> result = new LinkedHashMap<>();
        
        result.put("products", productRepository.findAll(Sort.by(Sort.Direction.ASC, "id")));
        result.put("customers", customerRepository.findAll(Sort.by(Sort.Direction.DESC, "id")));
        result.put("addresses", addressRepository.findAll(Sort.by(Sort.Direction.DESC, "id")));
        result.put("orders", orderRepository.findAll(Sort.by(Sort.Direction.DESC, "id")));
        result.put("orderItems", orderItemRepository.findAll(Sort.by(Sort.Direction.DESC, "id")));
        result.put("payments", paymentRepository.findAll(Sort.by(Sort.Direction.DESC, "id")));
        
        return result;
    }
}
