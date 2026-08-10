package org.example.backendyosrmegaapp.Controllers;

import lombok.RequiredArgsConstructor;

import org.example.backendyosrmegaapp.Services.MessageService;
import org.example.backendyosrmegaapp.entities.ChatMessageRequest;
import org.example.backendyosrmegaapp.entities.ChatMessageResponse;
import org.example.backendyosrmegaapp.entities.MessageResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @RequestBody ChatMessageRequest request
    ) {

        return ResponseEntity.ok(
                messageService.sendMessage(
                        request.getConversationId(),
                        request.getSenderId(),
                        request.getContenu(),
                        request.getImage()
                )
        );
    }
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<ChatMessageResponse>>
    getMessages(
            @PathVariable Long conversationId,
            @RequestParam Long userId
    ) {

        return ResponseEntity.ok(
                messageService.getMessages(
                        conversationId,
                        userId
                )
        );
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long messageId,
            @RequestParam Long userId
    ) {

        messageService.markMessageAsRead(
                messageId,
                userId
        );

        return ResponseEntity.ok().build();
    }

    @PutMapping("/conversation/{conversationId}/read")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable Long conversationId,
            @RequestParam Long userId
    ) {

        messageService.markConversationAsRead(
                conversationId,
                userId
        );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<Long> countUnread(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                messageService.countUnreadMessages(userId)
        );
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId,
            @RequestParam Long userId
    ) {

        messageService.deleteMessage(
                messageId,
                userId
        );

        return ResponseEntity.noContent().build();
    }
}
