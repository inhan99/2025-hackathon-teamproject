package com.refitbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.refitbackend.controller.formatter.LocalDateFormatter;


@Configuration
public class CustomServletConfig implements WebMvcConfigurer{

  @Override
  
  public void addFormatters(FormatterRegistry registry) {
    
    registry.addFormatter(new LocalDateFormatter());
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {

    registry.addMapping("/**")
    .allowedOrigins("http://localhost:3000") 
    .allowedMethods("HEAD", "GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH")
            .maxAge(300)
            .allowedHeaders("Authorization", "Cache-Control", "Content-Type")
            .allowCredentials(true);

  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // uploads 폴더에 대한 정적 리소스 매핑
    registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:build/resources/main/static/uploads/")
            .setCachePeriod(3600)
            .resourceChain(true);
            
    // reviewimages 폴더에 대한 정적 리소스 매핑
    registry.addResourceHandler("/reviewimages/**")
            .addResourceLocations("file:build/resources/main/static/reviewimages/")
            .setCachePeriod(3600)
            .resourceChain(true);
            
    // donation 폴더에 대한 정적 리소스 매핑 (필요시 주석 해제)
    /*
    registry.addResourceHandler("/donation/**")
            .addResourceLocations("file:build/resources/main/static/donation/")
            .setCachePeriod(3600)
            .resourceChain(true);
    */
            
    // 기타 정적 리소스
    registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/static/", "file:build/resources/main/static/");
  }
}