package com.refitbackend.service.cart;

import com.refitbackend.domain.cart.Cart;
import com.refitbackend.domain.cart.CartItem;
import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.product.Product;
import com.refitbackend.domain.product.ProductOption;
import com.refitbackend.dto.cart.CartItemRequestDTO;
import com.refitbackend.dto.cart.CartItemResponseDTO;
import com.refitbackend.repository.cart.CartItemRepository;
import com.refitbackend.repository.cart.CartRepository;
import com.refitbackend.repository.member.MemberRepository;
import com.refitbackend.repository.product.ProductOptionRepository;
import com.refitbackend.repository.product.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;
    private final ProductOptionRepository productOptionRepository;

    @Override
    @Transactional
    public void addCartItem(String userEmail, CartItemRequestDTO dto) {
        // 1. 회원 찾기
        Member member = memberRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원 이메일: " + userEmail));

        // 2. 회원의 장바구니 조회 또는 생성
        Cart cart = cartRepository.findByMember_Email(userEmail)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .member(member)
                            .build();
                    return cartRepository.save(newCart);
                });

        // 3. 상품 조회
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품 ID: " + dto.getProductId()));

        // 4. 옵션 조회
        ProductOption option = productOptionRepository.findById(dto.getOptionId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 옵션 ID: " + dto.getOptionId()));

        // 5. 장바구니에 이미 해당 상품+옵션이 있으면 수량 증가, 없으면 새 아이템 생성
        CartItem cartItem = cartItemRepository.findByCartAndProductAndOption(cart, product, option)
                .map(item -> {
                    item.changeQuantity(item.getQuantity() + dto.getQuantity());
                    return item;
                })
                .orElseGet(() -> {
                    CartItem newItem = CartItem.builder()
                            .cart(cart)
                            .member(member)
                            .product(product)
                            .option(option)
                            .quantity(dto.getQuantity())
                            .build();
                    return cartItemRepository.save(newItem);
                });

        // 6. 저장
        cartItemRepository.save(cartItem);
    }

    @Override
    public List<CartItemResponseDTO> getCartItemsByEmail(String email) {
        Cart cart = cartRepository.findByMember_Email(email)
                .orElseThrow(() -> new IllegalArgumentException("장바구니가 존재하지 않는 이메일: " + email));

        return cartItemRepository.findByCart(cart).stream()
                .map(item -> {
                    String thumbnailPath = null;
                    if (item.getProduct() != null && !item.getProduct().getThumbnails().isEmpty()) {
                        thumbnailPath = item.getProduct().getThumbnails().get(0).getUrlThumbnail();
                    }

                    return new CartItemResponseDTO(
                            item.getId(),
                            item.getQuantity(),
                            item.getProduct() != null ? item.getProduct().getId() : null,
                            item.getProduct() != null ? item.getProduct().getName() : null,
                            item.getProduct() != null ? item.getProduct().getBasePrice() : null,
                            thumbnailPath,
                            item.getOption() != null ? item.getOption().getId() : null,
                            item.getOption() != null ? item.getOption().getSize() : null
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateCartItemQuantity(Long cartItemId, int quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 아이템이 존재하지 않습니다: " + cartItemId));
        cartItem.changeQuantity(quantity);
        cartItemRepository.save(cartItem);
    }

    @Override
    @Transactional
    public void removeCartItem(Long cartItemId) {
        if (!cartItemRepository.existsById(cartItemId)) {
            throw new IllegalArgumentException("장바구니 아이템이 존재하지 않습니다: " + cartItemId);
        }
        cartItemRepository.deleteById(cartItemId);
    }
}
