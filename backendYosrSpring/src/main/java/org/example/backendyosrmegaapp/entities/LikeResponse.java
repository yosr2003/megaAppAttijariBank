package org.example.backendyosrmegaapp.entities;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LikeResponse {

    private Long postId;

    private long likeCount;

    private boolean likedByCurrentUser;
}
