package com.flamecrust.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flamecrust.api.model.*;
import com.flamecrust.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCrudController {

    private final ApplicationContext context;
    private final ObjectMapper mapper;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private record ResourceConfig(Class<?> entityClass, Class<? extends JpaRepository> repoClass) {}

    private static final Map<String, ResourceConfig> RESOURCES = new HashMap<>();

    static {
        Map<String, ResourceConfig> map = RESOURCES;
        map.put("addresses", new ResourceConfig(Address.class, AddressRepository.class));
        map.put("audit_logs", new ResourceConfig(AuditLog.class, AuditLogRepository.class));
        map.put("branch_staff", new ResourceConfig(BranchStaff.class, BranchStaffRepository.class));
        map.put("branches", new ResourceConfig(Branche.class, BrancheRepository.class));
        map.put("cart_items", new ResourceConfig(CartItem.class, CartItemRepository.class));
        map.put("carts", new ResourceConfig(Cart.class, CartRepository.class));
        map.put("cash_register_sessions", new ResourceConfig(CashRegisterSession.class, CashRegisterSessionRepository.class));
        map.put("categories", new ResourceConfig(Category.class, CategoryRepository.class));
        map.put("coupon_usages", new ResourceConfig(CouponUsage.class, CouponUsageRepository.class));
        map.put("coupons", new ResourceConfig(Coupon.class, CouponRepository.class));
        map.put("customers", new ResourceConfig(Customer.class, CustomerRepository.class));
        map.put("driver_locations", new ResourceConfig(DriverLocation.class, DriverLocationRepository.class));
        map.put("drivers", new ResourceConfig(Driver.class, DriverRepository.class));
        map.put("ingredient_stock", new ResourceConfig(IngredientStock.class, IngredientStockRepository.class));
        map.put("ingredients", new ResourceConfig(Ingredient.class, IngredientRepository.class));
        map.put("inventory", new ResourceConfig(Inventory.class, InventoryRepository.class));
        map.put("kitchen_staff", new ResourceConfig(KitchenStaff.class, KitchenStaffRepository.class));
        map.put("order_items", new ResourceConfig(OrderItem.class, OrderItemRepository.class));
        map.put("order_status_history", new ResourceConfig(OrderStatusHistory.class, OrderStatusHistoryRepository.class));
        map.put("orders", new ResourceConfig(Order.class, OrderRepository.class));
        map.put("otps", new ResourceConfig(Otp.class, OtpRepository.class));
        map.put("payment_attempts", new ResourceConfig(PaymentAttempt.class, PaymentAttemptRepository.class));
        map.put("payments", new ResourceConfig(Payment.class, PaymentRepository.class));
        map.put("product_options", new ResourceConfig(ProductOption.class, ProductOptionRepository.class));
        map.put("product_recipes", new ResourceConfig(ProductRecipe.class, ProductRecipeRepository.class));
        map.put("product_variants", new ResourceConfig(ProductVariant.class, ProductVariantRepository.class));
        map.put("products", new ResourceConfig(Product.class, ProductRepository.class));
        map.put("reviews", new ResourceConfig(Review.class, ReviewRepository.class));
        map.put("roles", new ResourceConfig(Role.class, RoleRepository.class));
        map.put("tables", new ResourceConfig(Table.class, TableRepository.class));
        map.put("users", new ResourceConfig(User.class, UserRepository.class));
    }

    @SuppressWarnings("unchecked")
    private <T, ID> JpaRepository<T, ID> getRepository(String resourceName) {
        ResourceConfig config = RESOURCES.get(resourceName.toLowerCase());
        if (config == null) throw new IllegalArgumentException("Unknown resource: " + resourceName);
        return context.getBean(config.repoClass());
    }
    
    private Class<?> getEntityClass(String resourceName) {
        ResourceConfig config = RESOURCES.get(resourceName.toLowerCase());
        if (config == null) throw new IllegalArgumentException("Unknown resource: " + resourceName);
        return config.entityClass();
    }

    @GetMapping("/{resource}")
    public Map<String, Object> all(
            @PathVariable String resource,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, defaultValue = "id") String sort,
            @RequestParam(required = false) String dir) {
        JpaRepository<Object, Long> repo = getRepository(resource);
        
        // All admin resources start from ID 1 ascending (1, 2, 3...)
        Sort.Direction sortDirection = (dir != null && "desc".equalsIgnoreCase(dir))
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        
        Sort sortObj = Sort.by(sortDirection, sort);

        if (limit != null && limit == -1) {
            List<Object> allItems = repo.findAll(sortObj);
            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("items", allItems);
            resp.put("total", allItems.size());
            resp.put("page", 0);
            resp.put("size", allItems.size());
            resp.put("totalPages", 1);
            return resp;
        }

        int pageSize = size != null ? size : (limit != null ? limit : 10);
        if (pageSize <= 0) pageSize = 10;
        if (pageSize > 200) pageSize = 200;

        org.springframework.data.domain.Page<Object> pageResult = repo.findAll(PageRequest.of(page, pageSize, sortObj));

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("items", pageResult.getContent());
        resp.put("total", pageResult.getTotalElements());
        resp.put("page", pageResult.getNumber());
        resp.put("size", pageResult.getSize());
        resp.put("totalPages", pageResult.getTotalPages());
        return resp;
    }

    @GetMapping("/{resource}/{id}")
    public ResponseEntity<?> one(@PathVariable String resource, @PathVariable long id) {
        JpaRepository<Object, Long> repo = getRepository(resource);
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{resource}")
    public ResponseEntity<?> create(@PathVariable String resource, @RequestBody Map<String, Object> body) {
        try {
            if (body.containsKey("password")) {
                body.put("passwordHash", passwordEncoder.encode(body.get("password").toString()));
            }
            Object entity = mapper.convertValue(body, getEntityClass(resource));
            JpaRepository<Object, Long> repo = getRepository(resource);
            Object saved = repo.save(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Database constraint failed: " + e.getMostSpecificCause().getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{resource}/{id}")
    public ResponseEntity<?> update(@PathVariable String resource, @PathVariable long id, @RequestBody Map<String, Object> body) {
        try {
            JpaRepository<Object, Long> repo = getRepository(resource);
            Optional<Object> existingOpt = repo.findById(id);
            if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
            Object existingEntity = existingOpt.get();
            
            if (body.containsKey("password") && body.get("password") != null && !body.get("password").toString().isBlank()) {
                body.put("passwordHash", passwordEncoder.encode(body.get("password").toString()));
            }
            
            body.put("id", id);
            String jsonBody = mapper.writeValueAsString(body);
            Object updatedEntity = mapper.readerForUpdating(existingEntity).readValue(jsonBody);
            
            Object saved = repo.save(updatedEntity);
            return ResponseEntity.ok(saved);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Database constraint failed: " + e.getMostSpecificCause().getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{resource}/{id}")
    public ResponseEntity<?> delete(@PathVariable String resource, @PathVariable long id) {
        JpaRepository<Object, Long> repo = getRepository(resource);
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "deleted", "id", id));
    }
}
