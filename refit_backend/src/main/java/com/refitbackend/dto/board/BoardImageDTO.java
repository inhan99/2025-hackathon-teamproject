package com.refitbackend.dto.board;

import com.refitbackend.domain.board.BoardImage;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardImageDTO {
    private Long id;
    private String imageUrl;

    public static BoardImageDTO fromEntity(BoardImage entity) {
        return BoardImageDTO.builder()
                .id(entity.getId())
                .imageUrl(entity.getImageUrl())
                .build();
    }

    public BoardImage toEntity() {
        return BoardImage.builder()
                .id(this.id)
                .imageUrl(this.imageUrl)
                .build();
    }
}
