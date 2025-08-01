package com.refitbackend.domain.product;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories_sub")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "category")
public class CategorySub {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
} 