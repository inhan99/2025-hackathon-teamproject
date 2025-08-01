package com.refitbackend.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.refitbackend.dto.product.ProductDetailDTO;
import com.refitbackend.service.product.ProductService;

import lombok.extern.log4j.Log4j2;

@SpringBootTest
@Log4j2

public class ProductServiceTests {
    @Autowired
    ProductService productService;
    @Test
    public void getOneProduct(){

        Long id=2L;
        ProductDetailDTO productDTO=productService.get(id);
        log.info(productDTO);
    }

    
}
