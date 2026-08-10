package org.example.backendyosrmegaapp.entities;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {

    private Long id;

    private Long conversationId;

    private Long senderId;

    private String senderFirstName;

    private String senderLastName;

    private String senderProfileImage;

    private String contenu;

    private String image;

    private LocalDateTime sentAt;

    private Boolean isRead;
}


