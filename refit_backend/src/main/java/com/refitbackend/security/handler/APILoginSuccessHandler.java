// package com.refitbackend.security.handler;

// import java.io.IOException;

// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;

// import org.springframework.security.core.Authentication;
// import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

// import com.fasterxml.jackson.databind.ObjectMapper;

// import java.util.HashMap;
// import java.util.Map;

// public class APILoginSuccessHandler implements AuthenticationSuccessHandler {

//     private final ObjectMapper objectMapper = new ObjectMapper();

//     @Override
//     public void onAuthenticationSuccess(
//             HttpServletRequest request,
//             HttpServletResponse response,
//             Authentication authentication
//     ) throws IOException, ServletException {

//         Map<String, Object> responseBody = new HashMap<>();
//         responseBody.put("message", "로그인 성공!");
//         responseBody.put("username", authentication.getName()); // 로그인한 사용자 이름

//         response.setStatus(HttpServletResponse.SC_OK);
//         response.setContentType("application/json");
//         response.setCharacterEncoding("UTF-8");

//         objectMapper.writeValue(response.getWriter(), responseBody);
//     }
// }