package org.example.backendyosrmegaapp.Repositories;


import org.example.backendyosrmegaapp.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository
        extends JpaRepository<Message, Long> {

    List<Message>
    findByConversationIdOrderBySentAtAsc(
            Long conversationId
    );

    List<Message>
    findByConversationIdOrderBySentAtDesc(
            Long conversationId
    );

    long countByConversationIdAndIsReadFalse(
            Long conversationId
    );

    long countByConversationIdAndIsReadFalseAndSenderIdNot(
            Long conversationId,
            Long senderId
    );

    List<Message>
    findByConversationIdAndIsReadFalseAndSenderIdNot(
            Long conversationId,
            Long senderId
    );


    @Query("""
    SELECT COUNT(DISTINCT m.conversation.id)
    FROM Message m
    JOIN ConversationParticipant cp
        ON cp.conversation.id = m.conversation.id
    WHERE m.isRead = false
      AND m.sender.id <> :userId
      AND cp.user.id = :userId
""")
    long countUnreadConversations(@Param("userId") Long userId);
}
