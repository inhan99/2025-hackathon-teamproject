package com.refitbackend.service.cart;

import com.refitbackend.dto.cart.CartItemRequestDTO;
import com.refitbackend.dto.cart.CartItemResponseDTO;

import java.util.List;

public interface CartService {
    void addCartItem(String userEmail, CartItemRequestDTO dto);
    List<CartItemResponseDTO> getCartItemsByEmail(String email);
    void updateCartItemQuantity(Long cartItemId, int quantity);
    void removeCartItem(Long cartItemId);
}
