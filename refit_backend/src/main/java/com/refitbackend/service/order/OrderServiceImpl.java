package com.refitbackend.service.order;

import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.member.MemberPoint;
import com.refitbackend.domain.member.DonationLevel;
import com.refitbackend.domain.order.Order;
import com.refitbackend.domain.order.OrderItem;
import com.refitbackend.domain.order.OrderStatus;
import com.refitbackend.domain.order.Payment;
import com.refitbackend.domain.product.Product;
import com.refitbackend.domain.product.ProductOption;
import com.refitbackend.dto.order.OrderItemDetailDTO;
import com.refitbackend.dto.order.OrderItemDTO;
import com.refitbackend.dto.order.OrderRequestDTO;
import com.refitbackend.repository.cart.CartItemRepository;
import com.refitbackend.repository.member.MemberPointRepository;
import com.refitbackend.repository.member.MemberRepository;
import com.refitbackend.repository.order.OrderRepository;
import com.refitbackend.repository.order.PaymentRepository;
import com.refitbackend.repository.product.ProductOptionRepository;
import com.refitbackend.repository.product.ProductRepository;
import com.refitbackend.service.order.PortoneService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
public class OrderServiceImpl implements OrderService {

    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;
    private final ProductOptionRepository optionRepository;
    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final PaymentRepository paymentRepository;
    private final PortoneService portoneService;
    private final MemberPointRepository memberPointRepository;


@Override
@Transactional
public Long placeOrder(String memberEmail, OrderRequestDTO orderRequestDTO) {
    Member member = memberRepository.findById(memberEmail)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원"));

    List<OrderItem> orderItems = new ArrayList<>();
    List<ProductOption> orderedOptions = new ArrayList<>();

    for (OrderItemDTO itemDTO : orderRequestDTO.getItems()) {
        Product product = productRepository.findById(itemDTO.getProductId())
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품"));

        ProductOption option = optionRepository.findById(itemDTO.getOptionId())
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 옵션"));

        option.decreaseStock(itemDTO.getQuantity());
        orderedOptions.add(option);

        int price = option.calculateFinalPrice();

        OrderItem orderItem = OrderItem.builder()
            .product(product)
            .option(option)
            .quantity(itemDTO.getQuantity())
            .price(price)
            .build();

        orderItems.add(orderItem);
    }

    Order order = Order.builder()
        .member(member)
        .orderItems(orderItems)
        .status(OrderStatus.ORDERED)
        .orderDate(LocalDateTime.now())
        .build();

    for (OrderItem item : orderItems) {
        item.setOrder(order);
    }

    // 장바구니 삭제 먼저 flush까지 강제 실행
    cartItemRepository.deleteByMemberAndOptionIn(member, orderedOptions);
    cartItemRepository.flush();

    // 주문 저장
    orderRepository.save(order);

    return order.getId();
}
 @Override
    public List<OrderItemDetailDTO> getOrdersByEmail(String email) {
        return orderRepository.findOrderItemsByEmail(email);
    }

    @Override
    @Transactional
    public Long placeOrderWithPayment(String memberEmail, OrderRequestDTO orderRequestDTO) {
        log.info("=== 결제 주문 시작 ===");
        log.info("회원 이메일: {}", memberEmail);
        log.info("주문 DTO: {}", orderRequestDTO);
        
        // 결제 검증
        if (orderRequestDTO.getImpUid() == null || orderRequestDTO.getMerchantUid() == null) {
            log.error("결제 정보 누락 - impUid: {}, merchantUid: {}", 
                orderRequestDTO.getImpUid(), orderRequestDTO.getMerchantUid());
            throw new IllegalArgumentException("결제 정보가 없습니다.");
        }

        // 총 주문 금액 계산
        int totalAmount = 0;
        for (OrderItemDTO itemDTO : orderRequestDTO.getItems()) {
            ProductOption option = optionRepository.findById(itemDTO.getOptionId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 옵션"));
            totalAmount += option.calculateFinalPrice() * itemDTO.getQuantity();
        }

        // 적립금 사용 처리
        int usedCredit = orderRequestDTO.getUsedCredit() != null ? orderRequestDTO.getUsedCredit() : 0;
        int finalAmount = totalAmount - usedCredit;
        
        // 적립금 계산 (최종 결제 금액의 8%)
        int earnedCredit = (int) Math.round(finalAmount * 0.08);
        
        // 적립금 결제인 경우 적립금을 0으로 설정
        String paymentMethod = orderRequestDTO.getPaymentMethod();
        if ("point".equals(paymentMethod)) {
            earnedCredit = 0;
            log.info("적립금 결제 감지 - 적립금을 0으로 설정");
        }
        
        log.info("적립금 처리 - 총 주문 금액: {}, 사용할 적립금: {}, 최종 결제 금액: {}, 적립될 적립금: {}, 결제 수단: {}", 
            totalAmount, usedCredit, finalAmount, earnedCredit, paymentMethod);
        
        if (finalAmount < 0) {
            log.error("적립금 초과 사용 - 총 주문 금액: {}, 사용할 적립금: {}", totalAmount, usedCredit);
            throw new IllegalArgumentException("적립금 사용 금액이 총 주문 금액을 초과할 수 없습니다.");
        }

        // 적립금 차감 처리
        log.info("적립금 차감 확인 - usedCredit: {}, paymentMethod: {}", usedCredit, paymentMethod);
        if (usedCredit > 0) {
            log.info("적립금 차감 시작 - 회원: {}, 차감액: {}", memberEmail, usedCredit);
            
            Member member = memberRepository.findById(memberEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원"));
            
            // MemberPoint 조회 또는 생성
            MemberPoint memberPoint = memberPointRepository.findByMemberEmail(memberEmail)
                .orElseGet(() -> {
                    log.info("MemberPoint가 없어서 새로 생성합니다. 회원: {}", memberEmail);
                    MemberPoint newMemberPoint = new MemberPoint();
                    newMemberPoint.setMember(member);
                    newMemberPoint.setCredit(0);
                    newMemberPoint.setDonationPoint(0);
                    newMemberPoint.setDonationLevel(DonationLevel.LEVEL_1);
                    return memberPointRepository.save(newMemberPoint);
                });
            
            log.info("현재 적립금 잔액: {}", memberPoint.getCredit());
            
            if (memberPoint.getCredit() < usedCredit) {
                log.error("적립금 부족 - 보유: {}, 필요: {}", memberPoint.getCredit(), usedCredit);
                throw new IllegalArgumentException("보유 적립금이 부족합니다.");
            }
            
            // 적립금 차감
            memberPoint.setCredit(memberPoint.getCredit() - usedCredit);
            memberPointRepository.save(memberPoint);
            
            log.info("적립금 차감 완료 - 회원: {}, 차감액: {}, 잔액: {}", 
                memberEmail, usedCredit, memberPoint.getCredit());
        } else {
            log.info("적립금 사용 없음");
        }

        // 0원 결제인 경우 포트원 검증 건너뛰기
        if (finalAmount == 0) {
            log.info("0원 결제 - 포트원 검증 건너뛰고 바로 주문 처리");
        } else {
            // 포트원 결제 검증 (최종 결제 금액으로)
            log.info("결제 검증 시작 - imp_uid: {}, merchant_uid: {}, finalAmount: {}, usedCredit: {}", 
                orderRequestDTO.getImpUid(), orderRequestDTO.getMerchantUid(), finalAmount, usedCredit);
            
            boolean isPaymentValid = portoneService.verifyPayment(
                orderRequestDTO.getImpUid(),
                orderRequestDTO.getMerchantUid(),
                finalAmount
            );

            if (!isPaymentValid) {
                log.error("결제 검증 실패 - imp_uid: {}, merchant_uid: {}, finalAmount: {}", 
                    orderRequestDTO.getImpUid(), orderRequestDTO.getMerchantUid(), finalAmount);
                throw new IllegalArgumentException("결제 검증에 실패했습니다.");
            }
            
            log.info("결제 검증 성공 - imp_uid: {}, merchant_uid: {}, finalAmount: {}", 
                orderRequestDTO.getImpUid(), orderRequestDTO.getMerchantUid(), finalAmount);
        }

        // 주문 생성
        log.info("주문 생성 시작");
        Long orderId = placeOrder(memberEmail, orderRequestDTO);
        log.info("주문 생성 완료 - 주문 ID: {}", orderId);

        // 주문 정보 업데이트 (적립금 정보 포함)
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        
        order.setTotalAmount(totalAmount);
        order.setUsedCredit(usedCredit);
        order.setFinalAmount(finalAmount);
        order.setEarnedCredit(earnedCredit);
        orderRepository.save(order);
        
        log.info("주문 정보 업데이트 완료 - 적립금: {}", earnedCredit);

        // 결제 정보 저장
        log.info("결제 정보 저장 시작");
        
        Member member = memberRepository.findById(memberEmail)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원"));

        // 결제 수단에 따른 설정
        String pgProvider = getPgProvider(orderRequestDTO.getPaymentMethod());
        String payMethod = getPayMethod(orderRequestDTO.getPaymentMethod());
        
        log.info("결제 수단 설정 - pgProvider: {}, payMethod: {}", pgProvider, payMethod);

        Payment payment = Payment.builder()
            .order(order)
            .member(member)
            .impUid(orderRequestDTO.getImpUid())
            .merchantUid(orderRequestDTO.getMerchantUid())
            .pgProvider(pgProvider)
            .payMethod(payMethod)
            .amount(finalAmount) // 최종 결제 금액 (적립금 차감 후)
            .status("paid")
            .paidAt(LocalDateTime.now())
            .createdAt(LocalDateTime.now())
            .build();

        paymentRepository.save(payment);
        log.info("결제 정보 저장 완료 - 결제 ID: {}", payment.getId());

        // 적립금 지급 (적립금 결제가 아닌 경우만)
        if (earnedCredit > 0 && !"point".equals(paymentMethod)) {
            MemberPoint memberPoint = memberPointRepository.findByMemberEmail(memberEmail)
                .orElseGet(() -> {
                    MemberPoint newMemberPoint = new MemberPoint();
                    newMemberPoint.setMember(member);
                    newMemberPoint.setCredit(0);
                    newMemberPoint.setDonationPoint(0);
                    newMemberPoint.setDonationLevel(DonationLevel.LEVEL_1);
                    return memberPointRepository.save(newMemberPoint);
                });
            
            memberPoint.setCredit(memberPoint.getCredit() + earnedCredit);
            memberPointRepository.save(memberPoint);
            
            log.info("적립금 지급 완료 - 회원: {}, 적립액: {}, 총 적립금: {}", 
                memberEmail, earnedCredit, memberPoint.getCredit());
        } else if ("point".equals(paymentMethod)) {
            log.info("적립금 결제 - 적립금 지급 없음");
        }

        log.info("결제 완료 - 주문ID: {}, 결제ID: {}, 결제수단: {}, 적립금사용: {}, 최종결제금액: {}, 적립금: {}", 
            orderId, payment.getId(), orderRequestDTO.getPaymentMethod(), usedCredit, finalAmount, earnedCredit);
        return orderId;
    }

    // 결제 수단에 따른 PG사 반환
    private String getPgProvider(String paymentMethod) {
        if (paymentMethod == null) {
            return "kakaopay"; // 기본값
        }
        
        switch (paymentMethod.toLowerCase()) {
            case "credit":
                return "credit"; // 적립금 결제
            case "kakaopay":
                return "kakaopay";
            case "tosspay":
                return "tosspay"; // 토스페이먼츠 일반결제
            case "tosspayments":
                return "tosspayments"; // 토스페이먼츠 (기존)
            default:
                return "kakaopay"; // 기본값
        }
    }

    // 결제 수단에 따른 결제 방법 반환
    private String getPayMethod(String paymentMethod) {
        if (paymentMethod == null) {
            return "kakaopay"; // 기본값
        }
        
        switch (paymentMethod.toLowerCase()) {
            case "credit":
                return "credit"; // 적립금 결제
            case "kakaopay":
                return "kakaopay";
            case "tosspay":
                return "card"; // 토스페이먼츠 일반결제
            case "tosspayments":
                return "card"; // 토스페이먼츠 (기존)
            default:
                return "kakaopay"; // 기본값
        }
    }

    @Override
    @Transactional
    public boolean cancelOrderWithPayment(Long orderId, String reason) {
        try {
            Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

            Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다."));

            // 포트원 결제 취소
            boolean isCancelled = portoneService.cancelPayment(payment.getImpUid(), reason);

            if (isCancelled) {
                // 주문 상태 변경
                order.setStatus(OrderStatus.CANCELED);
                orderRepository.save(order);

                // 결제 상태 변경
                payment.setStatus("cancelled");
                paymentRepository.save(payment);

                log.info("주문 취소 완료 - 주문ID: {}, 결제ID: {}", orderId, payment.getId());
                return true;
            }

            return false;
        } catch (Exception e) {
            log.error("주문 취소 중 오류 발생: {}", e.getMessage(), e);
            return false;
        }
    }
}