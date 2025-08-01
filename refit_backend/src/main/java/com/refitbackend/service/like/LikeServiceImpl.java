package com.refitbackend.service.like;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.product.Like;
import com.refitbackend.domain.product.Product;
import com.refitbackend.repository.member.MemberRepository;
import com.refitbackend.repository.product.LikeRepository;
import com.refitbackend.repository.product.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class LikeServiceImpl implements LikeService {

    private final LikeRepository likeRepository;
    private final ProductRepository productRepository;
    private final MemberRepository memberRepository;

    @Override
    public void likeProduct(Long productId, String email) {
        Member member = memberRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("회원 없음"));

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("상품 없음"));

        if (likeRepository.existsByMemberAndProduct(member, product)) {
            throw new RuntimeException("이미 좋아요 누름");
        }

        Like like = Like.builder()
                .member(member)
                .product(product)
                .build();

        likeRepository.save(like);
    }

    @Override
    public void unlikeProduct(Long productId, String email) {
        Member member = memberRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("회원 없음"));

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("상품 없음"));

        Like like = likeRepository.findByMemberAndProduct(member, product)
            .orElseThrow(() -> new RuntimeException("좋아요 안 누름"));

        likeRepository.delete(like);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> getLikedProducts(String email) {
        Member member = memberRepository.findById(email)
            .orElseThrow(() -> new RuntimeException("회원 없음"));

        return likeRepository.findAllByMember(member).stream()
                .map(Like::getProduct)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countLikes(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("상품 없음"));

        return likeRepository.countByProduct(product);
    }
}
