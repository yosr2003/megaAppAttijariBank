package org.example.backendyosrmegaapp.Services;

import org.example.backendyosrmegaapp.entities.ChatMessageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface MessageService {

    ChatMessageResponse sendMessage(
            Long conversationId,
            Long senderId,
            String contenu,
            MultipartFile image
    ) throws IOException;

    ChatMessageResponse sendTextMessage(
            Long conversationId,
            Long senderId,
            String contenu,
            String image
    );

    List<ChatMessageResponse> getMessages(
            Long conversationId,
            Long userId
    );

    void markMessageAsRead(
            Long messageId,
            Long userId
    );

    void markConversationAsRead(
            Long conversationId,
            Long userId
    );

    long countUnreadMessages(
            Long userId
    );

    void deleteMessage(
            Long messageId,
            Long userId
    );

    long countUnreadConversations(Long userId);
}