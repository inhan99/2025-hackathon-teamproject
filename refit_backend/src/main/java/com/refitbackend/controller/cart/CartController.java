package com.refitbackend.controller.cart;

import com.refitbackend.dto.cart.CartItemRequestDTO;
import com.refitbackend.dto.cart.CartItemResponseDTO;
import com.refitbackend.service.cart.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/cart")
@Slf4j
public class CartController {

    private final CartService cartService;

    @PreAuthorize("authentication.name == principal.name")
    @PostMapping("/add")
    public List<CartItemResponseDTO> changeCart(@RequestBody CartItemRequestDTO itemDTO, Principal principal) {
        String email = principal.getName();
        log.info("장바구니 요청: {}, 사용자 이메일: {}", itemDTO, email);

        if (itemDTO.getQuantity() <= 0) {
            cartService.removeCartItem(itemDTO.getCartItemId());
        } else {
            cartService.addCartItem(email, itemDTO);
        }

        return cartService.getCartItemsByEmail(email);
    }

    @GetMapping("/items")
    public List<CartItemResponseDTO> getCartItems(Principal principal) {
        log.info("principla", principal.getName()); 

        String email = principal.getName();
        log.info("장바구니 조회: {}", email);
        return cartService.getCartItemsByEmail(email);
    }
     @PostMapping("/change")
    public ResponseEntity<?> changeCartItemQuantity(@RequestBody CartItemRequestDTO dto, Principal principal) {
        log.info("changeCartItemQuantity 호출, dto: {}", dto);
        if (dto.getQuantity() <= 0) {
            cartService.removeCartItem(dto.getCartItemId());
        } else {
            cartService.updateCartItemQuantity(dto.getCartItemId(), dto.getQuantity());
        }
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @DeleteMapping("/{cartItemId}")
    public List<CartItemResponseDTO> removeFromCart(@PathVariable Long cartItemId, Principal principal) {
        log.info("장바구니 아이템 삭제: {}", cartItemId);
        cartService.removeCartItem(cartItemId);

        return cartService.getCartItemsByEmail(principal.getName());
    }
}
