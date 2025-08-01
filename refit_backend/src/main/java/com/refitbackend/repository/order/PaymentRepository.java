package com.refitbackend.repository.order;

import com.refitbackend.domain.order.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // imp_uid로 결제 정보 조회
    Optional<Payment> findByImpUid(String impUid);
    
    // merchant_uid로 결제 정보 조회
    Optional<Payment> findByMerchantUid(String merchantUid);
    
    // 주문 ID로 결제 정보 조회
    @Query("SELECT p FROM Payment p WHERE p.order.id = :orderId")
    Optional<Payment> findByOrderId(@Param("orderId") Long orderId);
} 