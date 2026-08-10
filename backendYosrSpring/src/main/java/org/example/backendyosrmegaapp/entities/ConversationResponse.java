package org.example.backendyosrmegaapp.entities;



import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationResponse {

    private Long id;

    private String nom;

    private String image;

    private LocalDateTime createdAt;

    private Long otherUserId;

    private String otherUserFirstName;

    private String otherUserLastName;

    private String otherUserProfileImage;

    private ChatMessageResponse lastMessage;

    private long unreadCount;
}
