package com.refitbackend.repository.cart;

import com.refitbackend.domain.cart.Cart;
import com.refitbackend.domain.cart.CartItem;
import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.product.Product;
import com.refitbackend.domain.product.ProductOption;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    Optional<CartItem> findByCartAndProductAndOption(Cart cart, Product product, ProductOption option);

    @Modifying
    @Transactional
    @Query("delete from CartItem c where c.member = :member and c.product = :product and c.option = :option")
    void deleteByMemberAndProductAndOption(
        @Param("member") Member member,
        @Param("product") Product product,
        @Param("option") ProductOption option);

    @Modifying
    @Transactional
    @Query("delete from CartItem c where c.member = :member and c.option in :options")
    void deleteByMemberAndOptionIn(
        @Param("member") Member member,
        @Param("options") List<ProductOption> options);
}
