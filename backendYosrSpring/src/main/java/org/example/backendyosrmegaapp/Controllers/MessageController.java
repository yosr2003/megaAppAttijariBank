package org.example.backendyosrmegaapp.Controllers;

import lombok.RequiredArgsConstructor;

import org.example.backendyosrmegaapp.Services.MessageService;
import org.example.backendyosrmegaapp.entities.ChatMessageRequest;
import org.example.backendyosrmegaapp.entities.ChatMessageResponse;
import org.example.backendyosrmegaapp.entities.MessageResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    @Value("${app.upload.message-images}")
    private String messageImagesDirectory;
    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @RequestParam Long conversationId,
            @RequestParam Long senderId,
            @RequestParam(required = false) String contenu,
            @RequestPart(
                    value = "image",
                    required = false
            ) MultipartFile image
    ) throws IOException {

        return ResponseEntity.ok(
                messageService.sendMessage(
                        conversationId,
                        senderId,
                        contenu,
                        image
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
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getMessageImage(
            @PathVariable String filename
    ) {

        try {

            Path file =
                    Paths.get(
                                    messageImagesDirectory
                            )
                            .resolve(filename)
                            .normalize();

            Resource resource =
                    new UrlResource(
                            file.toUri()
                    );

            if (!resource.exists()
                    || !resource.isReadable()) {

                return ResponseEntity.notFound().build();
            }

            String contentType =
                    Files.probeContentType(file);

            MediaType mediaType =
                    contentType != null
                            ? MediaType.parseMediaType(contentType)
                            : MediaType.APPLICATION_OCTET_STREAM;

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(resource);

        } catch (Exception e) {

            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/unread-conversations/{userId}")
    public long countUnreadConversations(
            @PathVariable Long userId
    ) {
        return messageService.countUnreadConversations(userId);
    }
}
