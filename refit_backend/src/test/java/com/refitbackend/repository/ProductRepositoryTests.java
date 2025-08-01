package com.refitbackend.repository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;

import com.refitbackend.domain.product.*;
import com.refitbackend.repository.product.*;
import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.member.MemberRole;
import com.refitbackend.repository.member.MemberRepository;
import com.refitbackend.domain.review.Review;
import com.refitbackend.repository.review.ReviewRepository;
import com.refitbackend.domain.board.Board;
import com.refitbackend.repository.board.BoardRepository;

import jakarta.transaction.Transactional;
import lombok.extern.log4j.Log4j2;

@SpringBootTest
@Log4j2
public class ProductRepositoryTests {

@Autowired private ProductRepository productRepository;
@Autowired private CategoryRepository categoryRepository;
@Autowired private BrandRepository brandRepository;
@Autowired private CategorySubRepository subCategoryRepository;
@Autowired private ProductOptionRepository productOptionRepository;
@Autowired private MemberRepository memberRepository;
@Autowired private ReviewRepository reviewRepository;
@Autowired private BoardRepository boardRepository;
@Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

@Test
@Commit
@Transactional
public void createAllDataIntegrationTest() throws Exception {
    log.info("🚀 통합 테스트 시작 - 모든 데이터 생성");
    
    // 이미 데이터가 있는지 확인
    if (productRepository.count() > 0) {
        log.warn("⚠️ 이미 상품 데이터가 존재합니다. 테스트를 건너뜁니다.");
        log.info("📊 현재 데이터 현황:");
        log.info("   - 상품: {}개", productRepository.count());
        log.info("   - 카테고리: {}개", categoryRepository.count());
        log.info("   - 브랜드: {}개", brandRepository.count());
        return;
    }
    
    // 1. 카테고리 생성
    log.info("📂 카테고리 생성 중...");
    createCategories();
    
    // 2. 브랜드 생성
    log.info("🏷️ 브랜드 생성 중...");
    createBrands();
    
    // 3. 상의 상품 생성 (1-20번 이미지)
    log.info("👕 상의 상품 생성 중...");
    List<String> topNames = List.of(
        "숏 블랙 티셔츠", "프린팅 티셔츠-블랙", "프린팅 티셔츠-화이트", "카라리스 반팔 니트",
        "곰돌이 프린팅 티셔츠", "캐릭터 티셔츠-블랙", "화난 캐릭터 티셔츠-카키", "반팔 로고 티셔츠-그레이",
        "박시핏 셔츠", "린넨 셔츠", "캐쥬얼 티셔트-블랙", "V넥 티셔츠-그레이",
        "무지 맨투맨-화이트", "스트라이프 오버핏 7부 티", "단색 기본티", "라운드넥 무지티",
        "오리지날 프린팅 반팔", "레귤러핏 맨투만-화이트", "로고 반팔 티-블랙", "로고 맨투맨-블랙"
    );
    createProductsWithNamesAndImages(1L, "상의", topNames, 1);
    
    // 4. 하의 상품 생성 (21-30번 이미지)
    log.info("👖 하의 상품 생성 중...");
    List<String> bottomNames = List.of(
        "블랙 7부 바지", "연청 데님", "화이트 와이드 팬츠", "크롭 조거팬츠",
        "라이트 베이지 치노", "기모 트레이닝 팬츠", "하이웨이스트 스커트", "디스트로이드 진",
        "스트레이트 핏 바지", "밴딩 조거팬츠"
    );
    createProductsWithNamesAndImages(2L, "하의", bottomNames, 21);
    
    // 5. 상의 아우터 생성 (31-40번 이미지)
    log.info("🧥 상의 아우터 생성 중...");
    List<String> topOuterNames = List.of(
        "아메리칸 스크립트 후드집업 아우터","포시즌 에센셜 후드집업 아우터","레드 하트로고 후드집업 아우터","스몰 트위치 로고 후드집업 아우터","다이스 후드집업 아우터",
        "상의사이드 라인 후드집업 아우터","워시드 카모 후드집업 아우터","캣 풋프린트 후드집업 아우터","129 로고패치 후드집업 아우터","센트로 니트 후드집업 아우터"
    );
    createProductsWithNamesAndImages(1L, "상의", topOuterNames, 31);
    
    // 6. 하의 반바지/치마 생성 (41-60번 이미지)
    log.info("🩳 하의 반바지/치마 생성 중...");
    List<String> bottomShortNames = List.of(
        // 41~50번 이미지: 하의 반바지
        "라이크린넨 원턱 반바지","원턱 버뮤다 트랙 반바지","데님 퍼티그 반바지","루즈핏 반바지","코튼 퍼티그 버뮤다 워크 반바지",
        "나일론 이지 반바지","버뮤다 와이드 원턱 데님 반바지","공용 썸머 밴딩 샴브레이 반바지","핀턱 카펜터 버뮤다 스웨트 반바지","라이트 밴딩 반바지",
        // 51~60번 이미지: 하의 치마
        "카고 미니 스커트","플리츠 화이트 스커트","듀엣 미니 프릴 플레어 레이어드 랩스커트","미니 데님 스커트","미니 플리츠 스커트",
        "베르카나 스커트","돌 셔링 레이어드 플레어 스커트","펄 플라워 버튼 펌킨 스커트","플리츠 코튼 데님 스커트","체크 플리츠 스커트"
    );
    createProductsWithNamesAndImages(2L, "하의", bottomShortNames, 41);
    
    // 7. 임산복 생성 (61-70번 이미지)
    log.info("🤱 임산복 생성 중...");
    List<String> maternityNames = List.of(
        "스몰쇼 여성 V넥 임부복","여성 임신 셔츠를 위한 푸티 임부 셔츠","빅사이즈 원피스 임산부 티","여성 V넥 임부복 티셔츠","스몰쇼 여성용 임산부 셔츠",
        "사계절 임산부 레깅스 9부 바지","임산부 요가복 레깅스 7부 바지","시크릿 핏 밤부 바지","BABY MOCO 임산부 롱팬츠","심리스 컨투어 벨리 서포트 레깅스"
    );
    createProductsWithNamesAndImages(3L, "임산복", maternityNames, 61);
    
    // 8. 아동복 생성 (71-80번 이미지)
    log.info("👶 아동복 생성 중...");
    List<String> kidsNames = List.of(
        "빅 포니 코튼 메시 폴로 키즈 티","민트 패턴 프린트 후드 키즈 셔츠","라벨 포인트 오버핏 주니어 후드 키즈 티셔츠","키즈 캔디 티셔츠","코튼 메시 폴로 키즈 셔츠",
        "쿠퍼 로고 돌핀 배색 키즈 쇼츠","주니어 기모 릴렉스 조거팬츠","컬러워싱 카고 키즈 데님 팬츠","시리얼 키즈 쇼츠","레인보우 테리 키즈 숏츠"
    );
    createProductsWithNamesAndImages(4L, "아동복", kidsNames, 71);

    // 9. 서브카테고리 생성
    log.info("🏷️ 서브카테고리 생성 중...");
    createSubCategories();
    
    // 10. 제품 카테고리 업데이트
    log.info("🔄 제품 카테고리 업데이트 중...");
    updateProductCategories();
    
    // 11. 상품 옵션 생성 (사이즈별 재고)
    log.info("📦 상품 옵션 생성 중...");
    createProductOptions();
    
    // 12. 관리자 계정 생성
    log.info("👨‍💼 관리자 계정 생성 중...");
    createAdminAccount();
    
    // 13. 리뷰 더미데이터 생성
    log.info("📝 리뷰 더미데이터 생성 중...");
    createReviewDummyData();
    
    log.info("🎉 통합 테스트 완료! 모든 데이터가 성공적으로 생성되었습니다.");
    log.info("📊 생성된 데이터 요약:");
    log.info("   - 카테고리: 4개 (상의, 하의, 임산복, 아동복)");
    log.info("   - 서브카테고리: 10개");
    log.info("   - 브랜드: 6개");
    log.info("   - 상품: 총 81개 (상의 30개, 하의 30개, 임산복 10개, 아동복 10개, 단일상품 1개)");
    log.info("   - 상품 옵션: 총 320개 (80개 상품 × 4개 사이즈)");
    log.info("   - 관리자 계정: 1개 (admin@refit.com)");
    log.info("   - 리뷰: 총 2400개 (80개 상품 × 평균 30개)");
}

@Test
@Commit
@Transactional
public void createCommunityBoardsTest() {
    log.info("📝 커뮤니티 글 생성 시작 (각 게시판당 30개씩, 총 90개)...");
    
    // 이미 커뮤니티 글이 있는지 확인
    if (boardRepository.count() > 0) {
        log.warn("⚠️ 이미 커뮤니티 글이 존재합니다. 테스트를 건너뜁니다.");
        log.info("📊 현재 커뮤니티 글 수: {}개", boardRepository.count());
        return;
    }
    
    // 게시판 타입별 제목과 내용 템플릿
    List<String> boardTypes = List.of("freedom", "secret", "share");
    
    // 자유게시판 제목 템플릿 (30개)
    List<String> freedomTitles = List.of(
        "오늘 옷장 정리했는데 너무 뿌듯해요!", "새로 산 옷 스타일링 조언 부탁드려요", "패션 포인트 꿀팁 공유합니다",
        "이번 시즌 트렌드 어떻게 생각하세요?", "옷장 정리 꿀팁 모음", "패션 블로그 추천해주세요",
        "옷 사는 기준이 궁금해요", "패션 쇼핑몰 추천 부탁드려요", "스타일링 고민 상담해주세요", "패션 인플루언서 추천해주세요",
        "오늘 코디 어떻게 보이세요?", "패션 포인트 꿀팁 공유해요", "이번 시즌 아이템 추천해주세요", "옷장 정리 후기 공유합니다",
        "패션 블로그 구독하고 계신 분들?", "옷 사는 기준 궁금해요", "패션 쇼핑몰 리뷰 부탁드려요", "스타일링 조언 부탁드려요",
        "패션 인플루언서 팔로우하고 계신 분들?", "오늘 코디 어때 보이세요?", "패션 포인트 꿀팁 공유합니다",
        "이번 시즌 트렌드 아이템 추천해주세요", "옷장 정리 꿀팁 모음", "패션 블로그 추천해주세요", "옷 사는 기준이 궁금해요",
        "패션 쇼핑몰 추천 부탁드려요", "스타일링 고민 상담해주세요", "패션 인플루언서 추천해주세요", "오늘 코디 어떻게 보이세요?",
        "패션 포인트 꿀팁 공유해요", "이번 시즌 아이템 추천해주세요"
    );
    
    // 비밀게시판 제목 템플릿 (30개)
    List<String> secretTitles = List.of(
        "패션 고민 상담 부탁드려요", "옷 사는 것에 대한 고민이 있어요", "스타일링에 대한 조언 부탁드려요",
        "패션에 대한 고민 상담해주세요", "옷장 정리에 대한 조언 부탁드려요", "패션 쇼핑에 대한 고민이 있어요",
        "스타일에 대한 고민 상담해주세요", "패션에 대한 조언 부탁드려요", "옷 사는 것에 대한 고민이 있어요", "패션에 대한 고민 상담해주세요",
        "패션 고민 상담 부탁드려요", "옷 사는 것에 대한 고민이 있어요", "스타일링에 대한 조언 부탁드려요",
        "패션에 대한 고민 상담해주세요", "옷장 정리에 대한 조언 부탁드려요", "패션 쇼핑에 대한 고민이 있어요",
        "스타일에 대한 고민 상담해주세요", "패션에 대한 조언 부탁드려요", "옷 사는 것에 대한 고민이 있어요", "패션에 대한 고민 상담해주세요",
        "패션 고민 상담 부탁드려요", "옷 사는 것에 대한 고민이 있어요", "스타일링에 대한 조언 부탁드려요",
        "패션에 대한 고민 상담해주세요", "옷장 정리에 대한 조언 부탁드려요", "패션 쇼핑에 대한 고민이 있어요",
        "스타일에 대한 고민 상담해주세요", "패션에 대한 조언 부탁드려요", "옷 사는 것에 대한 고민이 있어요", "패션에 대한 고민 상담해주세요"
    );
    
    // 나눔게시판 제목 템플릿 (30개)
    List<String> shareTitles = List.of(
        "좋은 옷 나눔합니다", "깨끗한 옷 기부합니다", "사이즈가 안 맞는 옷 나눔해요", "아이 옷 나눔합니다", "임산부 옷 나눔해요",
        "좋은 옷 기부합니다", "사이즈가 안 맞는 옷 기부해요", "아이 옷 기부합니다", "임산부 옷 기부해요", "좋은 옷 나눔합니다",
        "깨끗한 옷 기부합니다", "사이즈가 안 맞는 옷 나눔해요", "아이 옷 나눔합니다", "임산부 옷 나눔해요", "좋은 옷 기부합니다",
        "사이즈가 안 맞는 옷 기부해요", "아이 옷 기부합니다", "임산부 옷 기부해요", "좋은 옷 나눔합니다", "깨끗한 옷 기부합니다",
        "사이즈가 안 맞는 옷 나눔해요", "아이 옷 나눔합니다", "임산부 옷 나눔해요", "좋은 옷 기부합니다", "사이즈가 안 맞는 옷 기부해요",
        "아이 옷 기부합니다", "임산부 옷 기부해요", "좋은 옷 나눔합니다", "깨끗한 옷 기부합니다", "사이즈가 안 맞는 옷 나눔해요"
    );
    
    // 내용 템플릿 (30개)
    List<String> contentTemplates = List.of(
        "안녕하세요! 오늘은 정말 특별한 순간을 공유하고 싶어서 글을 남겨봅니다. 정말 만족스러운 하루였어요.",
        "여러분의 조언이 정말 필요해요. 어떻게 하면 좋을지 의견 부탁드립니다.",
        "이런 경험을 해보신 분들이 계신가요? 궁금해서 글을 남겨봅니다.",
        "정말 좋은 정보를 발견했어요! 여러분과 함께 공유하고 싶습니다.",
        "오늘 정말 특별한 순간이 있었어요. 여러분과 함께 나누고 싶어서 글을 남겨봅니다.",
        "이런 고민이 있으신 분들이 계신가요? 함께 이야기해보고 싶어요.",
        "정말 유용한 팁을 발견했어요! 여러분도 활용해보세요.",
        "오늘 정말 만족스러운 하루였어요. 여러분과 함께 나누고 싶습니다.",
        "이런 경험을 해보신 분들이 있으시면 조언 부탁드려요.",
        "정말 좋은 정보를 공유하고 싶어서 글을 남겨봅니다.",
        "안녕하세요! 오늘은 정말 특별한 순간을 공유하고 싶어서 글을 남겨봅니다. 정말 만족스러운 하루였어요.",
        "여러분의 조언이 정말 필요해요. 어떻게 하면 좋을지 의견 부탁드립니다.",
        "이런 경험을 해보신 분들이 계신가요? 궁금해서 글을 남겨봅니다.",
        "정말 좋은 정보를 발견했어요! 여러분과 함께 공유하고 싶습니다.",
        "오늘 정말 특별한 순간이 있었어요. 여러분과 함께 나누고 싶어서 글을 남겨봅니다.",
        "이런 고민이 있으신 분들이 계신가요? 함께 이야기해보고 싶어요.",
        "정말 유용한 팁을 발견했어요! 여러분도 활용해보세요.",
        "오늘 정말 만족스러운 하루였어요. 여러분과 함께 나누고 싶습니다.",
        "이런 경험을 해보신 분들이 있으시면 조언 부탁드려요.",
        "정말 좋은 정보를 공유하고 싶어서 글을 남겨봅니다.",
        "안녕하세요! 오늘은 정말 특별한 순간을 공유하고 싶어서 글을 남겨봅니다. 정말 만족스러운 하루였어요.",
        "여러분의 조언이 정말 필요해요. 어떻게 하면 좋을지 의견 부탁드립니다.",
        "이런 경험을 해보신 분들이 계신가요? 궁금해서 글을 남겨봅니다.",
        "정말 좋은 정보를 발견했어요! 여러분과 함께 공유하고 싶습니다.",
        "오늘 정말 특별한 순간이 있었어요. 여러분과 함께 나누고 싶어서 글을 남겨봅니다.",
        "이런 고민이 있으신 분들이 계신가요? 함께 이야기해보고 싶어요.",
        "정말 유용한 팁을 발견했어요! 여러분도 활용해보세요.",
        "오늘 정말 만족스러운 하루였어요. 여러분과 함께 나누고 싶습니다.",
        "이런 경험을 해보신 분들이 있으시면 조언 부탁드려요.",
        "정말 좋은 정보를 공유하고 싶어서 글을 남겨봅니다."
    );
    
    // 닉네임 리스트 (30개)
    List<String> nicknames = List.of(
        "패션러버", "스타일리스트", "옷장관리자", "코디네이터", "패션블로거",
        "스타일마스터", "패션인플루언서", "옷장컬렉터", "스타일러", "패션디자이너",
        "코디왕", "스타일퀸", "패션에디터", "옷장큐레이터", "스타일리더",
        "패션매니아", "코디마스터", "스타일가이드", "옷장매니저", "패션스타",
        "패션러버2", "스타일리스트2", "옷장관리자2", "코디네이터2", "패션블로거2",
        "스타일마스터2", "패션인플루언서2", "옷장컬렉터2", "스타일러2", "패션디자이너2", "코디왕2"
    );
    
    int totalBoards = 0;
    
    // 커뮤니티 회원 1명 생성
    String communityMemberEmail = "community@test.com";
    Member communityMember = memberRepository.findByEmail(communityMemberEmail)
        .orElseGet(() -> {
            Member newMember = Member.builder()
                .email(communityMemberEmail)
                .pw("1234")
                .nickname("커뮤니티회원")
                .social(false)
                .build();
            newMember.addRole(MemberRole.MEMBER);
            return memberRepository.save(newMember);
        });
    
    // 각 게시판 타입별로 30개씩 생성
    for (String boardType : boardTypes) {
        log.info("📝 {} 게시판 글 30개 생성 중...", getBoardTypeName(boardType));
        
        for (int i = 0; i < 30; i++) {
            final int currentIndex = i; // effectively final로 만들기 위해 final 변수로 복사
            
            // 게시판 타입에 따른 제목 선택
            String title;
            switch (boardType) {
                case "freedom":
                    title = freedomTitles.get(currentIndex);
                    break;
                case "secret":
                    title = secretTitles.get(currentIndex);
                    break;
                case "share":
                    title = shareTitles.get(currentIndex);
                    break;
                default:
                    title = "커뮤니티 글 제목";
            }
            
            // 랜덤 내용 선택
            String content = contentTemplates.get((int)(Math.random() * contentTemplates.size()));
            
            // 랜덤 닉네임 선택 (회원과 별개로 글 작성자 닉네임)
            String writerNickname = nicknames.get((int)(Math.random() * nicknames.size())) + (currentIndex + 1);
            
            // 커뮤니티 글 생성 (회원은 동일하게 사용, 작성자 닉네임만 변경)
            Board board = Board.builder()
                .title(title)
                .content(content)
                .writer(writerNickname)
                .boardType(boardType)
                .createdAt(LocalDateTime.now().minusDays((long)(Math.random() * 30))) // 최근 30일 내 랜덤 날짜
                .updatedAt(LocalDateTime.now().minusDays((long)(Math.random() * 30)))
                .member(communityMember)
                .build();
            
            boardRepository.save(board);
            totalBoards++;
            
            log.debug("✅ 커뮤니티 글 생성 완료 - ID: {}, 제목: {}, 타입: {}, 작성자: {}", 
                board.getId(), title, boardType, writerNickname);
        }
        
        log.info("✅ {} 게시판 글 30개 생성 완료!", getBoardTypeName(boardType));
    }
    
    log.info("🎉 커뮤니티 글 생성 완료!");
    log.info("📊 총 생성된 글: {}개", totalBoards);
    log.info("📊 게시판 타입별 분포:");
    log.info("   - 자유게시판: {}개", boardRepository.findByBoardTypeOrderByCreatedAtDesc("freedom").size());
    log.info("   - 비밀게시판: {}개", boardRepository.findByBoardTypeOrderByCreatedAtDesc("secret").size());
    log.info("   - 나눔게시판: {}개", boardRepository.findByBoardTypeOrderByCreatedAtDesc("share").size());
}

private String getBoardTypeName(String boardType) {
    switch (boardType) {
        case "freedom":
            return "자유게시판";
        case "secret":
            return "비밀게시판";
        case "share":
            return "나눔게시판";
        default:
            return "커뮤니티";
    }
}

private void createCategories() {
    createCategoryIfNotExists(1L, "상의");
    createCategoryIfNotExists(2L, "하의");
    createCategoryIfNotExists(3L, "임산복");
    createCategoryIfNotExists(4L, "아동복");
}

private void createCategoryIfNotExists(Long id, String name) {
    if (categoryRepository.existsById(id)) {
        log.warn("⚠️ 이미 존재하는 카테고리 - ID: {}, 이름: {}", id, name);
        return;
    }

    Category category = Category.builder()
        .id(id)
        .name(name)
        .build();

    categoryRepository.save(category);
    log.info(" 카테고리 생성 완료 - ID: {}, 이름: {}", id, name);
}

private void createBrands() {
    List<String> brandNames = List.of(
        "MONVE",
        "VOIDCRASH",
        "softgrain",
        "NEOSHELL",
        "Reweave",
        "LAIN STUDIO"
    );

    brandNames.forEach(name -> {
        createBrandIfNotExists(name);
    });
}

private void createBrandIfNotExists(String name) {
    Brand brand = Brand.builder()
        .name(name)
        .build();

    brandRepository.save(brand);
    log.info("✅ 브랜드 생성 완료 - 이름: {}", name);
}

private void createProductsWithNamesAndImages(Long categoryId, String categoryName, List<String> productNames, int startImageIdx) throws Exception {
    Category category = categoryRepository.findById(categoryId)
        .orElseThrow(() -> new RuntimeException("❌ 해당 카테고리 없음: " + categoryId));

    for (int i = 0; i < productNames.size(); i++) {
        int imageNum = startImageIdx + i;

        // 1~6번 브랜드 랜덤 사용
        long brandId = (long)(Math.random() * 6) + 1;
        Brand brand = brandRepository.findById(brandId)
            .orElseThrow(() -> new RuntimeException("❌ 해당 브랜드 없음: " + brandId));

        Product product = Product.builder()
            .name(productNames.get(i))
            .description(productNames.get(i) + " 실착용 제품입니다.")
            .basePrice(30000 + (i * 1000))
            .status(ProductStatus.ACTIVE)
            .rating(4.0 + (Math.random() * 1.0)) // 4.0~5.0 사이 랜덤 평점
            .category(category)
            .brand(brand)
            .build();

        productRepository.save(product);
        addImageAndThumbnail(product, imageNum);
    }

    log.info("✅ {} 상품 {}개 생성 및 이미지 저장 완료", categoryName, productNames.size());
}

private void addImageAndThumbnail(Product product, int imageNum) throws Exception {
    String imageName = imageNum + ".jpg";
    String thumbName = imageNum + "_thumbnail.jpg";

    String source = "src/main/resources/static/images/" + imageName;
    String thumbDest = "src/main/resources/static/thumbs/" + thumbName;

    // 이미지 파일 존재 여부 확인
    if (!Files.exists(Path.of(source))) {
        log.warn("⚠️ 원본 이미지 없음: {} - 건너뜀", source);
        return;
    }

    if (!Files.exists(Path.of(thumbDest))) {
        log.warn("⚠️ 썸네일 이미지 없음: {} - 건너뜀", thumbDest);
        return;
    }

    // 원본 이미지 경로 저장
    ProductImage newImage = new ProductImage();
    newImage.setUrl("/images/" + imageName);
    newImage.setUrlThumbnail("/thumbs/" + thumbName);
    newImage.setAltText("상품 " + product.getId() + " 이미지");
    newImage.setIsThumbnail(false);
    newImage.setImageOrder(1);
    newImage.setProduct(product);
    product.getImages().add(newImage);

    // 썸네일 경로 저장
    ProductThumbnail productThumb = new ProductThumbnail();
    productThumb.setUrlThumbnail("/thumbs/" + thumbName);
    productThumb.setAltText("상품 " + product.getId() + " 썸네일");
    productThumb.setImageOrder(1);
    productThumb.setProduct(product);
    product.getThumbnails().add(productThumb);

    productRepository.save(product);

    log.info("🖼️ 이미지 저장 완료 - ID: {}, 원본: {}, 썸네일: {}",
        product.getId(), newImage.getUrl(), productThumb.getUrlThumbnail());
}


private void createSubCategories() {
    // 카테고리가 없다면 먼저 생성
    Category topCategory = categoryRepository.findById(1L).orElseGet(() ->
        categoryRepository.save(Category.builder().name("상의").build())
    );
    
    Category bottomCategory = categoryRepository.findById(2L).orElseGet(() ->
        categoryRepository.save(Category.builder().name("하의").build())
    );

    Category pregnantCategory = categoryRepository.findById(3L).orElseGet(() ->
        categoryRepository.save(Category.builder().name("임산복").build())
    );
    
    Category kidsCategory = categoryRepository.findById(4L).orElseGet(() ->
        categoryRepository.save(Category.builder().name("아동복").build())
    );
    
    // 상의 서브카테고리
    CategorySub shortSleeve = CategorySub.builder()
        .name("반팔")
        .category(topCategory)
        .build();
    
    CategorySub longSleeve = CategorySub.builder()
        .name("긴팔")
        .category(topCategory)
        .build();
    
    CategorySub outer = CategorySub.builder()
        .name("아우터")
        .category(topCategory)
        .build();

    // 하의 서브카테고리
    CategorySub shorts = CategorySub.builder()
        .name("반바지")
        .category(bottomCategory)
        .build();

    CategorySub longPants = CategorySub.builder()
        .name("긴바지")
        .category(bottomCategory)
        .build();

    CategorySub skirt = CategorySub.builder()
        .name("치마")
        .category(bottomCategory)
        .build();

    // 임산부 서브카테고리
    CategorySub pregnantTop = CategorySub.builder()
        .name("상의")
        .category(pregnantCategory)
        .build();

    CategorySub pregnantBottom = CategorySub.builder()
        .name("하의")
        .category(pregnantCategory)
        .build();

    // 아동복 서브카테고리
    CategorySub kidsTop = CategorySub.builder()
        .name("상의")
        .category(kidsCategory)
        .build();

    CategorySub kidsBottom = CategorySub.builder()
        .name("하의")
        .category(kidsCategory)
        .build();

    // DB에 저장
    subCategoryRepository.save(shortSleeve);
    subCategoryRepository.save(longSleeve);
    subCategoryRepository.save(outer);
    subCategoryRepository.save(shorts);
    subCategoryRepository.save(longPants);
    subCategoryRepository.save(skirt);
    subCategoryRepository.save(pregnantTop);
    subCategoryRepository.save(pregnantBottom);
    subCategoryRepository.save(kidsTop);
    subCategoryRepository.save(kidsBottom);

    log.info("✅ 서브카테고리 데이터 생성 완료");
    log.info("상의 카테고리: 반팔, 긴팔, 아우터");
    log.info("하의 카테고리: 반바지, 긴바지, 치마");
    log.info("임산부 카테고리: 상의, 하의");
    log.info("아동복 카테고리: 상의, 하의");
}

private void updateProductCategories() {
    // 기존 서브카테고리 조회 (ID로 직접 조회)
    CategorySub shortSleeve = subCategoryRepository.findById(1L)
        .orElseThrow(() -> new RuntimeException("반팔 카테고리를 찾을 수 없습니다."));
    
    CategorySub longSleeve = subCategoryRepository.findById(2L)
        .orElseThrow(() -> new RuntimeException("긴팔 카테고리를 찾을 수 없습니다."));
    
    CategorySub outer = subCategoryRepository.findById(3L)
        .orElseThrow(() -> new RuntimeException("아우터 카테고리를 찾을 수 없습니다."));
    
    CategorySub shorts = subCategoryRepository.findById(4L)
        .orElseThrow(() -> new RuntimeException("반바지 카테고리를 찾을 수 없습니다."));
    
    CategorySub longPants = subCategoryRepository.findById(5L)
        .orElseThrow(() -> new RuntimeException("긴바지 카테고리를 찾을 수 없습니다."));
    
    CategorySub skirt = subCategoryRepository.findById(6L)
        .orElseThrow(() -> new RuntimeException("치마 카테고리를 찾을 수 없습니다."));

    CategorySub pregnantTop = subCategoryRepository.findById(7L)
        .orElseThrow(() -> new RuntimeException("임산복 상의 카테고리를 찾을 수 없습니다."));
    
    CategorySub pregnantBottom = subCategoryRepository.findById(8L)
        .orElseThrow(() -> new RuntimeException("임산복 하의 카테고리를 찾을 수 없습니다."));
    
    CategorySub kidsTop = subCategoryRepository.findById(9L)
        .orElseThrow(() -> new RuntimeException("아동복 상의 카테고리를 찾을 수 없습니다."));
    
    CategorySub kidsBottom = subCategoryRepository.findById(10L)
        .orElseThrow(() -> new RuntimeException("아동복 하의 카테고리를 찾을 수 없습니다."));

    // 제품별 카테고리 매핑 (기존 제품들을 새로운 카테고리에 맞게 재분류)
    // 상의 제품들
    updateProductCategory(1L, shortSleeve);
    updateProductCategory(2L, shortSleeve);
    updateProductCategory(3L, shortSleeve);
    updateProductCategory(4L, shortSleeve);
    updateProductCategory(5L, shortSleeve);
    updateProductCategory(6L, shortSleeve);
    updateProductCategory(7L, shortSleeve);
    updateProductCategory(8L, shortSleeve);
    updateProductCategory(9L, longSleeve);
    updateProductCategory(10L, longSleeve);
    updateProductCategory(11L, shortSleeve);
    updateProductCategory(12L, shortSleeve);
    updateProductCategory(13L, longSleeve);
    updateProductCategory(14L, shortSleeve);
    updateProductCategory(15L, shortSleeve);
    updateProductCategory(16L, shortSleeve);
    updateProductCategory(17L, shortSleeve);
    updateProductCategory(18L, longSleeve);
    updateProductCategory(19L, shortSleeve);
    updateProductCategory(20L, longSleeve);
    
    // 하의 제품들
    updateProductCategory(21L, shorts);
    updateProductCategory(22L, shorts);
    updateProductCategory(23L, longPants);
    updateProductCategory(24L, longPants);
    updateProductCategory(25L, longPants);
    updateProductCategory(26L, longPants);
    updateProductCategory(27L, longPants);
    updateProductCategory(28L, longPants);
    updateProductCategory(29L, longPants);
    updateProductCategory(30L, shorts);

    // 아우터 제품들
    updateProductCategory(31L, outer);
    updateProductCategory(32L, outer);
    updateProductCategory(33L, outer);
    updateProductCategory(34L, outer);
    updateProductCategory(35L, outer);
    updateProductCategory(36L, outer);
    updateProductCategory(37L, outer);
    updateProductCategory(38L, outer);
    updateProductCategory(39L, outer);
    updateProductCategory(40L, outer);

    // 반바지 제품들
    updateProductCategory(41L, shorts);
    updateProductCategory(42L, shorts);
    updateProductCategory(43L, shorts);
    updateProductCategory(44L, shorts);
    updateProductCategory(45L, shorts);
    updateProductCategory(46L, shorts);
    updateProductCategory(47L, shorts);
    updateProductCategory(48L, shorts);
    updateProductCategory(49L, shorts);
    updateProductCategory(50L, shorts);

    // 치마 제품들
    updateProductCategory(51L, skirt);
    updateProductCategory(52L, skirt);
    updateProductCategory(53L, skirt);
    updateProductCategory(54L, skirt);
    updateProductCategory(55L, skirt);
    updateProductCategory(56L, skirt);
    updateProductCategory(57L, skirt);
    updateProductCategory(58L, skirt);
    updateProductCategory(59L, skirt);
    updateProductCategory(60L, skirt);  

    // 임산복 제품들
    updateProductCategory(61L, pregnantTop);
    updateProductCategory(62L, pregnantTop);
    updateProductCategory(63L, pregnantTop);
    updateProductCategory(64L, pregnantTop);
    updateProductCategory(65L, pregnantTop);

    updateProductCategory(66L, pregnantBottom);
    updateProductCategory(67L, pregnantBottom);
    updateProductCategory(68L, pregnantBottom);
    updateProductCategory(69L, pregnantBottom);
    updateProductCategory(70L, pregnantBottom);

    // 아동복 제품들
    updateProductCategory(71L, kidsTop);    
    updateProductCategory(72L, kidsTop);
    updateProductCategory(73L, kidsTop);
    updateProductCategory(74L, kidsTop);
    updateProductCategory(75L, kidsTop);

    updateProductCategory(76L, kidsBottom);
    updateProductCategory(77L, kidsBottom);
    updateProductCategory(78L, kidsBottom);
    updateProductCategory(79L, kidsBottom);
    updateProductCategory(80L, kidsBottom);

    log.info("✅ 제품 카테고리 업데이트 완료");

    log.info("반팔: 10개");
    log.info("긴팔: 5개");
    log.info("아우터: 10개");
    log.info("반바지: 10개");
    log.info("긴바지: 10개");
    log.info("치마: 10개");
    log.info("임산복 상의: 5개");
    log.info("임산복 하의: 5개");
    log.info("아동복 상의: 5개");
    log.info("아동복 하의: 5개");
    log.info("총 제품: 80개");      
}

private void updateProductCategory(Long productId, CategorySub categorySub) {
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new RuntimeException("제품 ID " + productId + "를 찾을 수 없습니다."));
    
    // categorySub 필드 직접 설정
    product.setCategorySub(categorySub);
    productRepository.save(product);
    log.info("제품 ID {} -> {} 서브카테고리로 설정", productId, categorySub.getName());
}

private void createProductOptions() {
    log.info("📦 상품 옵션 생성 시작...");
    
    List<String> sizes = List.of("S", "M", "L", "XL");
    int stockPerSize = 100;
    int totalOptions = 0;
    
    // 1~80번 상품에 대해 사이즈별 옵션 생성
    for (long productId = 1; productId <= 80; productId++) {
        final long currentProductId = productId;
        Product product = productRepository.findById(currentProductId)
            .orElseThrow(() -> new RuntimeException("제품 ID " + currentProductId + "를 찾을 수 없습니다."));
        
        for (String size : sizes) {
            ProductOption option = new ProductOption();
            option.setSize(size);
            option.setStock(stockPerSize);
            option.setPriceAdjustment(0); // 사이즈별 가격 조정 없음
            option.setProduct(product);
            
            productOptionRepository.save(option);
            totalOptions++;
            
            log.debug("✅ 상품 ID {} - {} 사이즈 옵션 생성 (재고: {})", 
                currentProductId, size, stockPerSize);
        }
        
        // 진행상황 로그 (10개마다)
        if (currentProductId % 10 == 0) {
            log.info("📊 상품 옵션 생성 진행률: {}/80 완료", currentProductId);
        }
    }
    
    log.info("✅ 상품 옵션 생성 완료!");
    log.info("📊 총 생성된 옵션: {}개 (80개 상품 × 4개 사이즈)", totalOptions);
    log.info("📊 사이즈별 재고: S, M, L, XL 각각 {}개씩", stockPerSize);
}

private void createAdminAccount() {
    log.info("👨‍💼 관리자 계정 생성 시작...");
    
    // 이미 관리자 계정이 있는지 확인
    if (memberRepository.existsByEmail("admin@refit.com")) {
        log.warn("⚠️ 이미 관리자 계정이 존재합니다: admin@refit.com");
        return;
    }
    
    // 관리자 계정 생성
    Member adminMember = Member.builder()
        .email("admin@refit.com")
        .pw(passwordEncoder.encode("admin")) // 비밀번호 암호화
        .nickname("관리자")
        .social(false)
        .build();
    
    // ADMIN 역할 추가
    adminMember.addRole(MemberRole.ADMIN);
    
    // DB에 저장
    memberRepository.save(adminMember);
    
    log.info("✅ 관리자 계정 생성 완료!");
    log.info("📧 이메일: admin@refit.com");
    log.info("🔑 비밀번호: admin");
    log.info("👤 닉네임: 관리자");
    log.info("🔐 권한: ADMIN");
}

private void createReviewDummyData() {
    log.info("📝 리뷰 더미데이터 생성 시작...");
    
    // 리뷰 회원 1명 생성
    String reviewMemberEmail = "review@test.com";
    Member reviewMember = memberRepository.findByEmail(reviewMemberEmail)
        .orElseGet(() -> {
            Member newMember = Member.builder()
                .email(reviewMemberEmail)
                .pw("1234")
                .nickname("리뷰회원")
                .social(false)
                .build();
            newMember.addRole(MemberRole.MEMBER);
            return memberRepository.save(newMember);
        });
    
    // 리뷰 내용 템플릿
    List<String> reviewTemplates = List.of(
        "정말 만족스러운 구매였어요! 사이즈도 딱 맞고 품질도 좋습니다.",
        "기대 이상이었어요. 착용감이 정말 좋고 스타일링하기도 편해요.",
        "가격 대비 훌륭한 상품이에요. 다음에도 구매하고 싶어요.",
        "친구들이 다 예쁘다고 해요. 정말 추천합니다!",
        "배송도 빠르고 상품도 완벽해요. 감사합니다.",
        "사이즈가 정사이즈로 나와서 좋았어요. 착용감 최고!",
        "색상이 사진과 똑같아요. 정말 만족합니다.",
        "재질이 생각보다 훨씬 좋아요. 오래 입을 수 있을 것 같아요.",
        "스타일링하기 정말 편해요. 다양한 코디에 활용 가능해요.",
        "가격 대비 정말 좋은 상품이에요. 추천합니다!",
        "착용감이 정말 좋아요. 편안하면서도 스타일리시해요.",
        "친환경 소재라서 마음에 들어요. 지속가능한 패션을 응원합니다.",
        "세탁해도 변형이 없어서 좋아요. 오래 입을 수 있을 것 같아요.",
        "다음 시즌에도 활용할 수 있을 것 같아요. 만족합니다.",
        "친구들에게도 추천했어요. 정말 좋은 상품이에요."
    );
    
    // 옵션명 (사이즈)
    List<String> optionNames = List.of("S", "M", "L", "XL");
    
    // 닉네임 리스트 (리뷰 작성자용)
    List<String> reviewNicknames = List.of(
        "패션러버", "스타일리스트", "옷장관리자", "코디네이터", "패션블로거",
        "스타일마스터", "패션인플루언서", "옷장컬렉터", "스타일러", "패션디자이너",
        "코디왕", "스타일퀸", "패션에디터", "옷장큐레이터", "스타일리더",
        "패션매니아", "코디마스터", "스타일가이드", "옷장매니저", "패션스타",
        "패션러버2", "스타일리스트2", "옷장관리자2", "코디네이터2", "패션블로거2",
        "스타일마스터2", "패션인플루언서2", "옷장컬렉터2", "스타일러2", "패션디자이너2", "코디왕2"
    );
    
    int totalReviews = 0;

    // 1~80번 상품에 대해 리뷰 생성
    for (long productId = 1; productId <= 80; productId++) {
        final long finalProductId = productId; // effectively final로 만듦
        Product product = productRepository.findById(finalProductId)
            .orElseThrow(() -> new RuntimeException("제품 ID " + finalProductId + "를 찾을 수 없습니다."));

        // 각 상품당 20~50개 리뷰 생성 (랜덤)
        int reviewCount = 20 + (int)(Math.random() * 31); // 20~50개
        
        for (int i = 0; i < reviewCount; i++) {
            final int currentIndex = i; // effectively final로 만들기 위해 final 변수로 복사
            
            // 랜덤 평점 (4.0 ~ 5.0)
            double rating = 4.0 + (Math.random() * 1.0);
            rating = Math.round(rating * 10) / 10.0; // 소수점 첫째자리까지
            
            // 랜덤 리뷰 내용
            String content = reviewTemplates.get((int)(Math.random() * reviewTemplates.size()));
            
            // 랜덤 옵션명
            String optionName = optionNames.get((int)(Math.random() * optionNames.size()));
            
            // 랜덤 닉네임 (리뷰 작성자용)
            String reviewerNickname = reviewNicknames.get((int)(Math.random() * reviewNicknames.size())) + (currentIndex + 1);
            
            // 리뷰 생성 (회원은 동일하게 사용, 작성자 닉네임만 변경)
            Review review = Review.builder()
                .content(content)
                .rating(rating)
                .member(reviewMember) // 동일한 회원 사용
                .product(product)
                .orderId((long)(Math.random() * 1000) + 1) // 랜덤 주문 ID
                .optionName(optionName)
                .imageUrl(null) // 이미지 없음
                .height(160 + (int)(Math.random() * 30)) // 160~190cm
                .weight(50 + (int)(Math.random() * 30)) // 50~80kg
                .build();
            
            reviewRepository.save(review);
            totalReviews++;
            
            log.debug("✅ 리뷰 생성 완료 - 제품 ID: {}, 리뷰 ID: {}, 작성자: {}, 평점: {}", 
                finalProductId, review.getId(), reviewerNickname, rating);
        }
        
        // 진행상황 로그 (10개마다)
        if (productId % 10 == 0) {
            log.info("📊 리뷰 생성 진행률: {}/80 완료", productId);
        }
    }
    
    log.info("✅ 리뷰 더미데이터 생성 완료!");
    log.info("📊 총 생성된 리뷰: {}개", totalReviews);
    log.info("📊 평균 평점: 4.0 ~ 5.0");
    log.info("📊 상품당 리뷰: 20~50개 (랜덤)");
    log.info("📊 리뷰 적용 상품: 1~80번 상품");
    log.info("📊 사용된 회원: {} (이메일: {})", reviewMember.getNickname(), reviewMember.getEmail());
}
}