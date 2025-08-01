package com.refitbackend.security.filter;

import com.google.gson.Gson;
import com.refitbackend.dto.member.MemberDTO;
import com.refitbackend.util.JWTUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@Log4j2
@RequiredArgsConstructor
public class JWTCheckFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        // log.info("JWTCheckFilter shouldNotFilter - Request Path: " + path);

        if (path.startsWith("/api/member") && !path.startsWith("/api/members/")) {
            log.info("JWTCheckFilter - Excluding /api/member path (but not /api/members/)");
            return true;
        }
        if (path.startsWith("/api/products/")) {
            return true;
        }
        // 게시판 조회는 인증 없이 허용, 작성/수정/삭제는 인증 필요
        if (path.startsWith("/api/boards/") && request.getMethod().equals("GET")) {
            return true;
        }
        if (path.startsWith("/api/reviews/product/")) {
            return true; // 상품별 리뷰 조회는 인증 없이 허용
        }
        if (path.startsWith("/api/reviews/") && path.endsWith("/average-rating")) {
            return true; // 평균 평점 조회는 인증 없이 허용
        }
        if (path.startsWith("/thumbs")) {
            return true; 
        }
        if (path.startsWith("/images")) {
            return true; 
        }
        if (path.startsWith("/uploads")) {
            return true; 
        }
        if (path.startsWith("/reviewimages")) {
            return true; 
        }
        if (path.startsWith("/api/donation/")) {
            return true;
        }
        if (path.startsWith("/donation")) {
            return true; 
        }
        if (path.startsWith("/api/vision/")) {
            log.info("JWTCheckFilter - Excluding /api/vision path");
            return true; // Vision API는 인증 없이 허용
        }
        if (path.startsWith("/api/speech/")) {
            log.info("JWTCheckFilter - Excluding /api/speech path");
            return true; // Speech API는 인증 없이 허용
        }
        if (path.startsWith("/api/search/")) {
            log.info("JWTCheckFilter - Excluding /api/search path");
            return true; // 검색 API는 인증 없이 허용
        }
        if (path.startsWith("/api/beneficiary-applications/")) {
            log.info("JWTCheckFilter - Excluding /api/beneficiary-applications path");
            return true; // 수혜자 신청 API는 인증 없이 허용
        }
        if (path.startsWith("/api/files/")) {
            log.info("JWTCheckFilter - Excluding /api/files path");
            return true; // 파일 다운로드 API는 인증 없이 허용
        }

        log.info("JWTCheckFilter - Will filter this path: " + path);
        return false;
    }

    @Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

    log.info("------------------------JWTCheckFilter------------------");

    // 경로 체크 - Vision API는 인증 없이 통과
    String path = request.getRequestURI();
    String method = request.getMethod();
    log.info("JWTCheckFilter doFilterInternal - Request Path: " + path + ", Method: " + method);
    
    if (path.startsWith("/api/vision/")) {
        log.info("JWTCheckFilter - SKIPPING JWT CHECK FOR VISION API - PATH: " + path);
        filterChain.doFilter(request, response);
        return;
    }
    
    if (path.startsWith("/api/speech/")) {
        log.info("JWTCheckFilter - SKIPPING JWT CHECK FOR SPEECH API - PATH: " + path);
        filterChain.doFilter(request, response);
        return;
    }

    // 1. Authorization 헤더 단일 조회 로그
    String authHeaderStr = request.getHeader("Authorization");
    log.info("Authorization Header: " + authHeaderStr);

    // 2. Authorization 헤더 복수 조회 (혹시 여러개일 경우 체크)
    var authHeaders = request.getHeaders("Authorization");
    while (authHeaders.hasMoreElements()) {
        String headerValue = authHeaders.nextElement();
        log.info("Authorization Header element: " + headerValue);
    }

    try {
        if (authHeaderStr == null || !authHeaderStr.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header missing or invalid");
        }

        String accessToken = authHeaderStr.substring(7);
        log.info("Access Token: " + accessToken);

        Map<String, Object> claims = jwtUtil.validateToken(accessToken);
        log.info("JWT claims: " + claims);

        String email = (String) claims.get("email");
        String nickname = (String) claims.get("nickname");
        boolean socialFlag = Boolean.TRUE.equals(claims.get("social"));
        List<String> roleNames = (List<String>) claims.get("roleNames");
        int credit = (int)claims.get("credit");
        String donationLevel=(String) claims.get("donationLevel");
        if (roleNames == null) {
            roleNames = List.of();
        }

        double height = 0.0;
            try {
                Object hObj = claims.get("height");
                if (hObj instanceof Number) {
                    height = ((Number) hObj).doubleValue();
                }
            } catch (Exception e) {
                log.warn("height parsing 실패 - 기본값 사용 (0.0)");
            }

            double weight = 0.0;
            try {
                Object wObj = claims.get("weight");
                if (wObj instanceof Number) {
                    weight = ((Number) wObj).doubleValue();
                }
            } catch (Exception e) {
                log.warn("weight parsing 실패 - 기본값 사용 (0.0)");
            }
        
        // int donationLevelInt = (int) claims.get("donationLevelInt");
        // int donationLevelExp = (int) claims.get("donationLevelExp");
        // int usedDonationCount = (int) claims.get("usedDonationCount");

        MemberDTO memberDTO = new MemberDTO(
        email,
        nickname,
        socialFlag,
        roleNames,
        donationLevel,
        credit,
        height,
        weight
        // 0,   donationLevelInt
        // 0,   donationLevelExp
        // 0    usedDonationCount
        );


        log.info("-----------------------------------");
        log.info(memberDTO);
        log.info(memberDTO.getAuthorities());

        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(memberDTO, null, memberDTO.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authenticationToken);

        filterChain.doFilter(request, response);

    } catch (Exception e) {
        log.error("JWT Check Error..............");
        log.error(e.getMessage());

        Gson gson = new Gson();
        String msg = gson.toJson(Map.of("error", "ERROR_ACCESS_TOKEN"));

        response.setContentType("application/json");
        PrintWriter printWriter = response.getWriter();
        printWriter.println(msg);
        printWriter.close();
    }
}
}