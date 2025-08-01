package com.refitbackend.dto.order;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDTO {

    private List<OrderItemDTO> items; // 주문할 상품 목록
    
    // 결제 관련 추가 정보
    private String impUid; // 포트원 결제 고유번호
    private String merchantUid; // 주문번호
    private String buyerName; // 구매자 이름
    private String buyerEmail; // 구매자 이메일
    private String buyerTel; // 구매자 전화번호
    private String buyerAddr; // 구매자 주소
    private String buyerPostcode; // 구매자 우편번호
    private String paymentMethod; // 결제 수단 (kakaopay, tosspay)
    
    // 적립금 관련 필드 추가
    private Integer usedCredit; // 사용할 적립금 금액
}
