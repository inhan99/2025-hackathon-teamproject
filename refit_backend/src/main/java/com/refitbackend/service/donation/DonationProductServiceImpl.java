package com.refitbackend.service.donation;

import com.refitbackend.domain.donation.DonationImage;
import com.refitbackend.domain.donation.DonationOption;
import com.refitbackend.domain.donation.DonationProduct;
import com.refitbackend.domain.donation.DonationStatus;
import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.member.MemberPoint;
import com.refitbackend.domain.member.MemberRole;
import com.refitbackend.domain.product.Product;
import com.refitbackend.dto.donation.DonationImageDTO;
import com.refitbackend.dto.donation.DonationOptionDTO;
import com.refitbackend.dto.donation.DonationProductsDetailDTO;
import com.refitbackend.dto.donation.DonationProductSummaryDTO;
import com.refitbackend.dto.donation.DonationRequestDTO;
import com.refitbackend.repository.donation.DonationImageRepository;
import com.refitbackend.repository.donation.DonationProductRepository;
import com.refitbackend.repository.member.MemberPointRepository;
import com.refitbackend.repository.member.MemberRepository;
import com.refitbackend.repository.product.ProductRepository;
import com.refitbackend.service.FileStorageService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationProductServiceImpl implements DonationProductService {

    private final DonationProductRepository donationProductRepository;
    private final ProductRepository productRepository;
    private final MemberRepository memberRepository;
    private final DonationImageRepository donationImageRepository;
    private final FileStorageService fileStorageService;        
    private final MemberPointRepository memberPointRepository;

    @Override
    public List<DonationProductsDetailDTO> getApprovedDonationProducts() {
        return donationProductRepository.findByStatusOrderByDonatedAtDesc(DonationStatus.APPROVED)
                .stream()
                .map(this::toDetailDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DonationProductSummaryDTO> getInspectingDonationProducts() {
        return donationProductRepository.findByStatusOrderByDonatedAtDesc(DonationStatus.INSPECTING)
                .stream()
                .map(product -> {
                    // 업로드된 이미지들을 DTO로 변환
                    List<DonationImageDTO> imageDTOs = product.getImages().stream()
                            .map(image -> DonationImageDTO.builder()
                                    .id(image.getId())
                                    .url(image.getImageUrl())
                                    .altText("기부 상품 이미지")
                                    .build())
                            .collect(Collectors.toList());

                    return DonationProductSummaryDTO.builder()
                            .donationProductId(product.getId())
                            .productName(product.getOriginalProduct().getName())
                            .brandName(product.getOriginalProduct().getBrand().getName())
                            .categoryName(product.getOriginalProduct().getCategory().getName())
                            .categorySubName(product.getOriginalProduct().getCategorySub() != null ? 
                                product.getOriginalProduct().getCategorySub().getName() : null)
                            .mainImageUrl(
                                product.getImages().stream()
                                    .findFirst()
                                    .map(DonationImage::getImageUrl)
                                    .orElse(null)
                            )
                            .images(imageDTOs)
                            .conditionNote(product.getConditionNote())
                            .donorNickname(product.getDonor().getNickname())
                            .donatedAt(product.getDonatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<DonationProductsDetailDTO> getAllByOriginalId(Long originalId) {
        List<DonationProduct> products = donationProductRepository
            .findWithOptionsAndImagesByProductIdAndStatus(
                originalId, DonationStatus.APPROVED);

        if (products.isEmpty()) {
            throw new RuntimeException("해당 id에 대한 승인된 기부상품이 없습니다.");
        }

        return products.stream()
            .map(this::toDetailDTO)
            .collect(Collectors.toList());
    }

    @Override
    public Member findMemberByEmail(String email) {
        return memberRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. email=" + email));
    }

    @Override
    @Transactional
    public DonationProduct saveDonation(DonationRequestDTO dto, Member donor, MultipartFile[] images) throws Exception {
        // 1. 원본 상품 조회
        Product originalProduct = productRepository.findById(dto.getProductId())
            .orElseThrow(() -> new IllegalArgumentException("원본 상품을 찾을 수 없습니다. ID=" + dto.getProductId()));

        // 2. DonationProduct 생성
        DonationProduct donationProduct = DonationProduct.builder()
            .originalProduct(originalProduct)
            .donor(donor)
            .conditionNote(dto.getCondition())
            .status(DonationStatus.INSPECTING) // 검수 대기 상태
            .donatedAt(LocalDateTime.now()) // 기부 시간 설정
            .build();

        // 3. 옵션 등록
        DonationOption option = DonationOption.builder()
            .donationProduct(donationProduct)
            .size(dto.getSize())
            .stock(1)
            .build();
        donationProduct.getOptions().add(option);

        // 4. DonationProduct 저장 (ID 획득용)
        DonationProduct savedDonationProduct = donationProductRepository.save(donationProduct);

        // 5. 이미지 저장 및 DB 등록
        if (images != null) {
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    String imageUrl = fileStorageService.storeFile(image, "donation");

                    DonationImage donationImage = DonationImage.builder()
                        .imageUrl(imageUrl)
                        .donationProduct(savedDonationProduct)
                        .build();
                    donationImageRepository.save(donationImage);
                }
            }
        }

        // 6. 리워드 및 경험치 계산 후 MemberPoint 업데이트
        MemberPoint memberPoint = memberPointRepository.findByMemberEmail(donor.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("포인트 정보를 찾을 수 없습니다. 회원 이메일=" + donor.getEmail()));

        BigDecimal basePrice = originalProduct.getBasePrice() != null 
            ? BigDecimal.valueOf(originalProduct.getBasePrice()) 
            : BigDecimal.ZERO;

        int rewardAmount = 0;

        if ("credit".equalsIgnoreCase(dto.getRewardMethod())) {
            rewardAmount = basePrice.multiply(BigDecimal.valueOf(0.15)).intValue();
            memberPoint.setCredit(memberPoint.getCredit() + rewardAmount);
        } else if ("point".equalsIgnoreCase(dto.getRewardMethod())) {
            rewardAmount = basePrice.multiply(BigDecimal.valueOf(0.25)).intValue();
            memberPoint.addPoint(rewardAmount);  // 기존 포인트 적립 + 레벨업 가능
        }

        // 경험치 적립 및 레벨업 처리 (가격 그대로 경험치로 가정)
        int experienceGain = basePrice.intValue();
        memberPoint.addDonationExp(experienceGain); // 경험치, 레벨업 처리 메서드

        memberPointRepository.save(memberPoint);

        return savedDonationProduct;
    }

    @Override
    public DonationProductsDetailDTO getDonationProductDetailById(Long id) {
        DonationProduct donationProduct = donationProductRepository.findWithOptionsAndImagesById(id)
            .orElseThrow(() -> new IllegalArgumentException("기부상품을 찾을 수 없습니다. id=" + id));

        return toDetailDTO(donationProduct);
    }

    @Override
    @Transactional
    public DonationProduct updateDonationProductStatus(Long donationProductId, DonationStatus newStatus) {
        DonationProduct product = donationProductRepository.findById(donationProductId)
            .orElseThrow(() -> new IllegalArgumentException("기부상품을 찾을 수 없습니다. id=" + donationProductId));

        product.setStatus(newStatus);
        return donationProductRepository.save(product);
    }

    @Override
    public List<DonationProductsDetailDTO> getApprovedDonationProductsByCategory(Long categoryId) {
        List<DonationProduct> products = donationProductRepository
            .findByCategoryIdAndStatusOrderByDonatedAtDesc(categoryId, DonationStatus.APPROVED);

        return products.stream()
                .map(this::toDetailDTO)
                .collect(Collectors.toList());
    }


    // --- 신규 추가: 나눔 상품 수령 메서드 ---
    @Transactional
    public void receiveDonationProduct(Long donationProductId, Member receiver) {
        // 1. 기부상품 조회
        DonationProduct donationProduct = donationProductRepository.findById(donationProductId)
            .orElseThrow(() -> new IllegalArgumentException("기부상품을 찾을 수 없습니다. id=" + donationProductId));

        // 2. 수령자 MemberPoint 조회
        MemberPoint memberPoint = memberPointRepository.findByMemberEmail(receiver.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("포인트 정보를 찾을 수 없습니다. 회원 이메일=" + receiver.getEmail()));

        // 3. 수령자 권한 체크
        if (!receiver.getRoleList().contains(MemberRole.BENEFICIARY)) {
            // 일반 유저는 레벨과 사용 횟수 체크
            int currentLevel = memberPoint.getDonationLevelInt();
            int usedCount = memberPoint.getUsedDonationCount();

            // 레벨당 받을 수 있는 최대 횟수 = 현재 레벨 (예: 2레벨이면 2회)
            if (usedCount >= currentLevel) {
                throw new IllegalStateException("해당 레벨에서 받을 수 있는 나눔 횟수를 모두 사용했습니다.");
            }

            // 사용 횟수 1 증가
            memberPoint.setUsedDonationCount(usedCount + 1);
            memberPointRepository.save(memberPoint);
        }

        // 4. 수령 처리 로직 추가 (예: 재고 감소, 수령 기록 등)
        // TODO: 실제 수령 로직 필요하면 추가

    }


    private DonationProductsDetailDTO toDetailDTO(DonationProduct product) {
        return DonationProductsDetailDTO.builder()
                .donationProductId(product.getId())
                .originalProductId(product.getOriginalProduct().getId())
                .productName(product.getOriginalProduct().getName())
                .productDescription(product.getOriginalProduct().getDescription())
                .conditionNote(product.getConditionNote())
                .donorNickname(product.getDonor().getNickname())
                .status(product.getStatus().name())
                .rejectionReason(product.getRejectionReason())
                .images(product.getImages().stream()
                        .map(img -> DonationImageDTO.builder()
                                .id(img.getId())
                                .url(img.getImageUrl())
                                .altText("기부 상품 이미지")
                                .build())
                        .collect(Collectors.toList()))
                .options(product.getOptions().stream()
                        .map(opt -> DonationOptionDTO.builder()
                                .id(opt.getId())
                                .size(opt.getSize())
                                .stock(opt.getStock())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

}
