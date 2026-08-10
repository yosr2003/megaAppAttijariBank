package org.example.backendyosrmegaapp.Controllers;

import lombok.RequiredArgsConstructor;

import org.example.backendyosrmegaapp.Services.ConversationService;
import org.example.backendyosrmegaapp.entities.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping("/private")
    public ResponseEntity<Conversation> createPrivateConversation(
            @RequestBody CreateConversationRequest request
    ) {

        Conversation conversation =
                conversationService.getOrCreatePrivateConversation(
                        request.getUser1Id(),
                        request.getUser2Id()
                );

        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ConversationResponse>>
    getUserConversations(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                conversationService.getUserConversations(userId)
        );
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<Conversation>
    getConversation(
            @PathVariable Long conversationId
    ) {

        return ResponseEntity.ok(
                conversationService.getConversationById(
                        conversationId
                )
        );
    }
}
