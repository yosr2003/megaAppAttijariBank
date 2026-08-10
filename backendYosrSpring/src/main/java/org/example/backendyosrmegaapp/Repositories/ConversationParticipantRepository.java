package org.example.backendyosrmegaapp.Repositories;
import org.example.backendyosrmegaapp.entities.Conversation;
import org.example.backendyosrmegaapp.entities.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationParticipantRepository
        extends JpaRepository<ConversationParticipant, Long> {

    List<ConversationParticipant>
    findByUserId(Long userId);

    List<ConversationParticipant>
    findByConversationId(Long conversationId);

    Optional<ConversationParticipant>
    findByConversationIdAndUserId(
            Long conversationId,
            Long userId
    );

    boolean existsByConversationIdAndUserId(
            Long conversationId,
            Long userId
    );

    long countByConversationId(Long conversationId);
    @Query("""
    SELECT cp1.conversation
    FROM ConversationParticipant cp1
    JOIN ConversationParticipant cp2
        ON cp1.conversation.id = cp2.conversation.id
    WHERE cp1.user.id = :user1Id
      AND cp2.user.id = :user2Id
""")
    List<Conversation> findConversationBetweenUsers(
            @Param("user1Id") Long user1Id,
            @Param("user2Id") Long user2Id
    );
}
