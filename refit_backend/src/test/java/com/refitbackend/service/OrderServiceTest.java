package com.refitbackend.service;

import com.refitbackend.dto.order.OrderItemDetailDTO;

import com.refitbackend.service.order.OrderService;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
@Transactional // 테스트 끝나면 자동 롤백됨
class OrderServiceTest {

    @Autowired
    private OrderService orderService;


    @Test
    void getOrderList() {
        // given
        String email = "user4@aaa.com";

        // when
        List<OrderItemDetailDTO> orderItems = orderService.getOrdersByEmail(email);

        // then
        OrderItemDetailDTO firstOrder = orderItems.get(0);
        System.out.println("조회된 주문 상품명: " + firstOrder.getProductName());

       
}}
