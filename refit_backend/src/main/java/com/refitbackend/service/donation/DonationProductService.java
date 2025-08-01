package com.refitbackend.service.donation;

import com.refitbackend.dto.donation.DonationProductsDetailDTO;
import com.refitbackend.dto.donation.DonationRequestDTO;
import com.refitbackend.domain.donation.DonationProduct;
import com.refitbackend.domain.donation.DonationStatus;
import com.refitbackend.domain.member.Member;
import com.refitbackend.dto.donation.DonationProductSummaryDTO;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface DonationProductService {

    List<DonationProductsDetailDTO> getApprovedDonationProducts();

    List<DonationProductsDetailDTO> getAllByOriginalId(Long originalId);

    List<DonationProductSummaryDTO> getInspectingDonationProducts();


    Member findMemberByEmail(String email);


    //나눔 등록 등록 등록 등록 등록ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ
    DonationProduct saveDonation(DonationRequestDTO dto, Member donor, MultipartFile[] images) throws Exception;

       // 상세 조회
    DonationProductsDetailDTO getDonationProductDetailById(Long id);

    // [추가] 기부상품 상태 변경 메서드 (관리자 검수 완료용)
    // @Transactional 추가는 구현체에 작성
    DonationProduct updateDonationProductStatus(Long donationProductId, DonationStatus newStatus);

     // 카테고리별 나눔옷들가져오기
     List<DonationProductsDetailDTO> getApprovedDonationProductsByCategory(Long categoryId);

     void receiveDonationProduct(Long donationProductId, Member receiver);
}
