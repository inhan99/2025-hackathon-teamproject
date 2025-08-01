package com.refitbackend.service.member;

import java.util.LinkedHashMap;
import java.util.Optional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.member.MemberRole;
import com.refitbackend.dto.member.MemberDTO;
import com.refitbackend.repository.member.MemberRepository;
import com.refitbackend.repository.member.MemberBodyInfoRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@RequiredArgsConstructor
public class SocialMemberServiceImpl implements SocialMemberService {
    private final MemberRepository memberRepository;
    private final MemberBodyInfoRepository memberBodyInfoRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
  public MemberDTO getKakaoMember(String accessToken) {

    String email = getEmailFromKakaoAccessToken(accessToken);

    log.info("email: " + email );

    Optional<Member> result = memberRepository.findById(email);

    // 기존의 회원
    if(result.isPresent()){
      MemberDTO memberDTO = entityToDTO(result.get(), memberBodyInfoRepository);

      return memberDTO;
    }

    // 회원이 아니었다면
    // 닉네임은 '소셜회원'으로
    // 패스워드는 임의로 생성
    Member socialMember = makeSocialMember(email);
    memberRepository.save(socialMember);

    MemberDTO memberDTO = entityToDTO(socialMember, memberBodyInfoRepository);

    return memberDTO;
  }

  private String getEmailFromKakaoAccessToken(String accessToken){

    String kakaoGetUserURL = "https://kapi.kakao.com/v2/user/me";

    if(accessToken == null){
      throw new RuntimeException("Access Token is null");
    }
    RestTemplate restTemplate = new RestTemplate();

    HttpHeaders headers = new HttpHeaders();
    headers.add("Authorization", "Bearer " + accessToken);
    headers.add("Content-Type","application/x-www-form-urlencoded");
    HttpEntity<String> entity = new HttpEntity<>(headers);

    UriComponents uriBuilder = UriComponentsBuilder.fromHttpUrl(kakaoGetUserURL).build();

    ResponseEntity<LinkedHashMap> response = 
      restTemplate.exchange(
      uriBuilder.toString(), 
      HttpMethod.GET, 
      entity, 
      LinkedHashMap.class);

    log.info(response);

    LinkedHashMap<String, LinkedHashMap> bodyMap = response.getBody();

    log.info("------------------------------");
    log.info(bodyMap);

    LinkedHashMap<String, String> kakaoAccount = bodyMap.get("kakao_account");

    log.info("kakaoAccount: " + kakaoAccount);

    return kakaoAccount.get("email");

  }
  
  private String makeTempPassword() {

    StringBuffer buffer = new StringBuffer();

    for(int i = 0;  i < 10; i++){
      buffer.append(  (char) ( (int)(Math.random()*55) + 65  ));
    }
    return buffer.toString();
  }
  private Member makeSocialMember(String email) {

   String tempPassword = makeTempPassword();

   log.info("tempPassword: " + tempPassword);

   String nickname = "소셜회원";

   Member member = Member.builder()
   .email(email)
   .pw(passwordEncoder.encode(tempPassword))
   .nickname(nickname)
   .social(true)
   .build();

   member.addRole(MemberRole.MEMBER);

   return member;

  }
}
