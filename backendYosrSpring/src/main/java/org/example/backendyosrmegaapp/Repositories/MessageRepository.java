package org.example.backendyosrmegaapp.Repositories;


import org.example.backendyosrmegaapp.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
