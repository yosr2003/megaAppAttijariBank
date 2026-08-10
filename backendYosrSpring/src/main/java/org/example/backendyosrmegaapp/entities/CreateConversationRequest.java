package org.example.backendyosrmegaapp.entities;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {

    private Long user1Id;

    private Long user2Id;
}
