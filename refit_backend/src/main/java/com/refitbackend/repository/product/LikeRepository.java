package com.refitbackend.repository.product;

import com.refitbackend.domain.product.Like;
import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {

    boolean existsByMemberAndProduct(Member member, Product product);

    Optional<Like> findByMemberAndProduct(Member member, Product product);

    List<Like> findAllByMember(Member member);

    long countByProduct(Product product);
}
