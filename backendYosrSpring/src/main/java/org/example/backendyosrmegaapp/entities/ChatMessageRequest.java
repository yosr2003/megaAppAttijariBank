package org.example.backendyosrmegaapp.entities;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {

    private Long conversationId;

    private Long senderId;

    private String contenu;

    private String image;
}
