package com.flamecrust.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.flamecrust.api.dto.BakongVerificationRequest;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentVerificationController {

    private final JdbcTemplate jdbcTemplate;
    private final RestTemplate restTemplate;

    @Value("${bakong.api.url:https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5}")
    private String bakongApiUrl;

    @Value("${bakong.api.token:}")
    private String bakongApiToken;

    public PaymentVerificationController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.restTemplate = new RestTemplate();
    }

    @PostMapping("/verify-khqr")
    public ResponseEntity<Map<String, Object>> verifyKhqr(@RequestBody BakongVerificationRequest request) {
        Map<String, Object> response = new HashMap<>();

        boolean hasQr = request.getQrCodeString() != null && !request.getQrCodeString().trim().isEmpty();
        boolean hasMd5 = request.getMd5() != null && !request.getMd5().trim().isEmpty();

        if (!hasQr && !hasMd5) {
            response.put("status", "ERROR");
            response.put("message", "Missing qr_code_string or md5");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // 1. Generate MD5 of the QR Code string or use provided MD5
            String md5Hash = hasMd5 ? request.getMd5().trim() : DigestUtils.md5DigestAsHex(request.getQrCodeString().getBytes());
            System.out.println("Checking Bakong MD5: " + md5Hash);

            // 2. Call Bakong Open API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (bakongApiToken != null && !bakongApiToken.isEmpty()) {
                headers.setBearerAuth(bakongApiToken);
            }

            Map<String, String> body = new HashMap<>();
            body.put("md5", md5Hash);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> bakongResponse = restTemplate.exchange(
                    bakongApiUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            Map<String, Object> responseBody = bakongResponse.getBody();
            if (responseBody != null && responseBody.containsKey("responseCode")) {
                Object responseCodeObj = responseBody.get("responseCode");
                int responseCode = responseCodeObj instanceof Number ? ((Number) responseCodeObj).intValue() : Integer.parseInt(responseCodeObj.toString());

                if (responseCode == 0) {
                    // Success! Update payment and order in database if orderId exists
                    if (request.getOrderId() != null && !request.getOrderId().trim().isEmpty()) {
                        try {
                            Long orderId = Long.parseLong(request.getOrderId());
                            jdbcTemplate.update("UPDATE payments SET status = 'PAID', paid_at = CURRENT_TIMESTAMP WHERE order_id = ?", orderId);
                            jdbcTemplate.update("UPDATE orders SET status = 'CONFIRMED' WHERE id = ?", orderId);
                            jdbcTemplate.update("INSERT INTO order_status_history (order_id, status, notes) VALUES (?, 'CONFIRMED', 'Payment verified')", orderId);
                        } catch (Exception ex) {
                            // orderId might not be numeric or not found yet
                        }
                    }
                    
                    response.put("status", "SUCCESS");
                    response.put("message", "Payment verified successfully");
                    return ResponseEntity.ok(response);
                } else {
                    response.put("status", "PENDING");
                    response.put("message", "Payment not completed yet or failed. Code: " + responseCode);
                    return ResponseEntity.ok(response);
                }
            } else {
                response.put("status", "PENDING");
                response.put("message", "Payment pending on Bakong");
                return ResponseEntity.ok(response);
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "ERROR");
            response.put("message", "Verification failed due to error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
