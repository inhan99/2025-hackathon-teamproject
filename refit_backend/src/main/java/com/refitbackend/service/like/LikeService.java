package com.refitbackend.service.like;

import java.util.List;

import com.refitbackend.domain.product.Product;

public interface LikeService {
    void likeProduct(Long productId, String email);

    void unlikeProduct(Long productId, String email);

    List<Product> getLikedProducts(String email);

    long countLikes(Long productId);
}
