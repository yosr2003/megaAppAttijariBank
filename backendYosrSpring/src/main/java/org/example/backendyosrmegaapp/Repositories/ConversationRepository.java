package org.example.backendyosrmegaapp.Repositories;

import org.example.backendyosrmegaapp.entities.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationRepository
        extends JpaRepository<Conversation, Long> {
}
