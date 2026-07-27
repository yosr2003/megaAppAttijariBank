package com.example.demo;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"*"})
public class ApiController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "UP", "service", "supertounsi-backend");
    }
}


