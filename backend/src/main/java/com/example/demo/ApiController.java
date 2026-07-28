package com.example.demo;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"*"})
public class ApiController {

    private double walletBalance = 12540.000;
    private final List<Map<String, Object>> transactions = new ArrayList<>();

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "UP", "service", "supertounsi-backend");
    }

    @GetMapping("/wallet/balance")
    public Map<String, Object> getWalletBalance() {
        return Map.of("balance", walletBalance, "currency", "TND");
    }

    @PostMapping("/wallet/pay")
    public Map<String, Object> processPayment(@RequestBody Map<String, Object> payload) {
        double amount = Double.parseDouble(payload.getOrDefault("amount", "0").toString());
        String title = payload.getOrDefault("title", "Purchase").toString();

        if (walletBalance < amount) {
            return Map.of("success", false, "message", "Insufficient wallet balance.");
        }

        walletBalance -= amount;
        Map<String, Object> tx = new HashMap<>();
        tx.put("id", System.currentTimeMillis());
        tx.put("title", title);
        tx.put("amount", -amount);
        tx.put("currency", "TND");
        transactions.add(0, tx);

        return Map.of(
            "success", true,
            "newBalance", walletBalance,
            "transaction", tx
        );
    }

    @PostMapping("/orders/food")
    public Map<String, Object> placeFoodOrder(@RequestBody Map<String, Object> orderData) {
        return Map.of(
            "orderId", "SD-2025-" + (int)(Math.random() * 90000 + 10000),
            "status", "CONFIRMED",
            "message", "Order placed successfully"
        );
    }
}



