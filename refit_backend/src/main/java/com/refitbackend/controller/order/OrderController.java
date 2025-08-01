package com.refitbackend.controller.order;

import com.refitbackend.dto.order.OrderItemDetailDTO;
import com.refitbackend.dto.order.OrderRequestDTO;
import com.refitbackend.service.order.OrderService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<?> placeOrder( @RequestBody OrderRequestDTO requestDTO, @RequestParam String email ) {
        Long orderId = orderService.placeOrder(email, requestDTO);
        return ResponseEntity.ok("구매 완료! 주문 ID: " + orderId);
    }
    
    @PostMapping("/payment")
    public ResponseEntity<?> placeOrderWithPayment(@RequestBody OrderRequestDTO requestDTO, @RequestParam String email) {
        try {
            Long orderId = orderService.placeOrderWithPayment(email, requestDTO);
            return ResponseEntity.ok("결제 완료! 주문 ID: " + orderId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("결제 실패: " + e.getMessage());
        }
    }
    
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId, @RequestParam String reason) {
        try {
            boolean isCancelled = orderService.cancelOrderWithPayment(orderId, reason);
            if (isCancelled) {
                return ResponseEntity.ok("주문 취소 완료");
            } else {
                return ResponseEntity.badRequest().body("주문 취소 실패");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("주문 취소 실패: " + e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<List<OrderItemDetailDTO>> getMyOrders(Authentication auteAuthentication){
        String email=auteAuthentication.getName();
        List<OrderItemDetailDTO> orders=orderService.getOrdersByEmail(email);
        return ResponseEntity.ok(orders);
    }
}
