package com.refitbackend.repository.cart;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.refitbackend.domain.cart.Cart;

@Repository
public interface CartRepository extends JpaRepository<Cart,Long> {
    
    Optional<Cart> findByMember_Email(String email);
    
}