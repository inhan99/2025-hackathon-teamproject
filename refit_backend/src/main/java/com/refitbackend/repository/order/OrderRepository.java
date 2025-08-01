package com.refitbackend.repository.order;

import com.refitbackend.domain.order.Order;
import com.refitbackend.dto.order.OrderItemDetailDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("""
    SELECT new com.refitbackend.dto.order.OrderItemDetailDTO(
        oi.product.name,
        oi.option.size,
        oi.quantity,
        oi.price,
        oi.product.id,
        o.id,
        o.orderDate,
        COALESCE(t.urlThumbnail, '') 
    )
    FROM Order o
    JOIN o.orderItems oi
    JOIN oi.product p
    LEFT JOIN p.thumbnail t
    WHERE o.member.email = :email
    ORDER BY o.orderDate DESC
""")
List<OrderItemDetailDTO> findOrderItemsByEmail(@Param("email") String email);

}
