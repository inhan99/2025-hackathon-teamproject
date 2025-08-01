package com.refitbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {
     @GetMapping("/protected")
    public ResponseEntity<String> protectedRoute() {
        return ResponseEntity.ok("백엔드에 있는 TestController..............");
}
}