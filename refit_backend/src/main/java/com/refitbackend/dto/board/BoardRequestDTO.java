package com.refitbackend.dto.board;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class BoardRequestDTO {
    private String title;
    private String content;
    private String memberEmail; // writer 대신 memberEmail 사용
    private String boardType; // "freedom", "secret", "share"
    private List<String> existingImages;
}
