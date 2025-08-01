package com.refitbackend.dto.order;

import java.util.List;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {

    private Long orderId;
    private String orderStatus;
    private String orderDate;
    private List<OrderItemDetailDTO> items;
}

