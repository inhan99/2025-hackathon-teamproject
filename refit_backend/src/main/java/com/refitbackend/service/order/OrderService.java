package com.refitbackend.service.order;

import java.util.List;

import com.refitbackend.dto.order.OrderItemDetailDTO;
import com.refitbackend.dto.order.OrderRequestDTO;

public interface OrderService {

    // 주문로직
    Long placeOrder(String memberEmail, OrderRequestDTO orderRequestDTO);
    
    // 결제 검증 후 주문 처리
    Long placeOrderWithPayment(String memberEmail, OrderRequestDTO orderRequestDTO);
    
    // 주문 내역 조회 로직
    List<OrderItemDetailDTO> getOrdersByEmail(String email);
    
    // 결제 취소
    boolean cancelOrderWithPayment(Long orderId, String reason);

}