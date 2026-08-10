
package org.example.backendyosrmegaapp.Services;

import org.example.backendyosrmegaapp.entities.ChatMessageResponse;

import java.util.List;

public interface MessageService {

    ChatMessageResponse sendMessage(
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
}

