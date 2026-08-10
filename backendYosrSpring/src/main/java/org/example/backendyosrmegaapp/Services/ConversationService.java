package org.example.backendyosrmegaapp.Services;

import org.example.backendyosrmegaapp.entities.ChatMessageResponse;
import org.example.backendyosrmegaapp.entities.Conversation;
import org.example.backendyosrmegaapp.entities.ConversationResponse;
import org.example.backendyosrmegaapp.entities.Message;

import java.util.List;

public interface ConversationService {

    Conversation getOrCreatePrivateConversation(
            Long user1Id,
            Long user2Id
    );

    List<ConversationResponse>
    getUserConversations(Long userId);

    Conversation getConversationById(Long conversationId);

    boolean isParticipant(
            Long conversationId,
            Long userId
    );

    ConversationResponse buildConversationResponse(
            Conversation conversation,
            Long currentUserId
    );

    ChatMessageResponse toMessageResponse(
            Message message
    );
}