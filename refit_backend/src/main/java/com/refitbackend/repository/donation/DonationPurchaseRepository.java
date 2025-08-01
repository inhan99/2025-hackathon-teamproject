package com.refitbackend.repository.donation;

import com.refitbackend.domain.donation.DonationPurchase;
import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.donation.DonationProduct;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationPurchaseRepository extends JpaRepository<DonationPurchase, Long> {

    // 특정 회원이 구매한 모든 나눔 구매 기록 조회
    List<DonationPurchase> findAllByMember(Member member);

    // 특정 회원이 특정 기부상품을 구매한 기록 조회
    List<DonationPurchase> findAllByMemberAndDonationProduct(Member member, DonationProduct donationProduct);

    // 특정 회원이 구매한 전체 나눔 구매 수량 합 조회
    // (서비스 단에서 직접 합산할 수도 있고, 필요시 커스텀 쿼리 작성 가능)
}
