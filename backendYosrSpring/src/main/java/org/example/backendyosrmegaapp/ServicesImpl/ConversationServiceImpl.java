package org.example.backendyosrmegaapp.ServicesImpl;


import lombok.RequiredArgsConstructor;

import org.example.backendyosrmegaapp.Repositories.ConversationParticipantRepository;
import org.example.backendyosrmegaapp.Repositories.ConversationRepository;
import org.example.backendyosrmegaapp.Repositories.MessageRepository;
import org.example.backendyosrmegaapp.Repositories.UserRepository;

import org.example.backendyosrmegaapp.Services.ConversationService;

import org.example.backendyosrmegaapp.entities.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ConversationServiceImpl
        implements ConversationService {

    private final ConversationRepository conversationRepository;

    private final ConversationParticipantRepository participantRepository;

    private final MessageRepository messageRepository;

    private final UserRepository userRepository;

    @Override
    public Conversation getOrCreatePrivateConversation(
            Long user1Id,
            Long user2Id
    ) {

        if (user1Id.equals(user2Id)) {
            throw new RuntimeException(
                    "Impossible de créer une conversation avec soi-même"
            );
        }

        var user1 = userRepository.findById(user1Id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Utilisateur introuvable : " + user1Id
                        )
                );

        var user2 = userRepository.findById(user2Id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Utilisateur introuvable : " + user2Id
                        )
                );

        List<Conversation> existing =
                participantRepository
                        .findConversationBetweenUsers(
                                user1Id,
                                user2Id
                        );

        if (!existing.isEmpty()) {
            return existing.get(0);
        }

        Conversation conversation =
                Conversation.builder()
                        .nom(null)
                        .build();

        conversation =
                conversationRepository.save(conversation);

        ConversationParticipant participant1 =
                ConversationParticipant.builder()
                        .conversation(conversation)
                        .user(user1)
                        .build();

        ConversationParticipant participant2 =
                ConversationParticipant.builder()
                        .conversation(conversation)
                        .user(user2)
                        .build();

        participantRepository.save(participant1);
        participantRepository.save(participant2);

        return conversation;
    }

    @Override
    @Transactional(readOnly = true)
    public Conversation getConversationById(
            Long conversationId
    ) {

        return conversationRepository
                .findById(conversationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Conversation introuvable : "
                                        + conversationId
                        )
                );
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isParticipant(
            Long conversationId,
            Long userId
    ) {

        return participantRepository
                .existsByConversationIdAndUserId(
                        conversationId,
                        userId
                );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse>
    getUserConversations(Long userId) {

        List<ConversationParticipant> participants =
                participantRepository.findByUserId(userId);

        return participants.stream()
                .map(participant ->
                        buildConversationResponse(
                                participant.getConversation(),
                                userId
                        )
                )
                .toList();
    }
    @Override
    public ConversationResponse buildConversationResponse(
            Conversation conversation,
            Long currentUserId
    ) {

        List<ConversationParticipant> participants =
                participantRepository
                        .findByConversationId(conversation.getId());

        ConversationParticipant otherParticipant =
                participants.stream()
                        .filter(p ->
                                !p.getUser().getId()
                                        .equals(currentUserId)
                        )
                        .findFirst()
                        .orElse(null);

        ChatMessageResponse lastMessage = null;

        List<Message> messages =
                messageRepository
                        .findByConversationIdOrderBySentAtDesc(
                                conversation.getId()
                        );

        if (!messages.isEmpty()) {
            lastMessage =
                    toMessageResponse(messages.get(0));
        }

        long unreadCount =
                messageRepository
                        .countByConversationIdAndIsReadFalseAndSenderIdNot(
                                conversation.getId(),
                                currentUserId
                        );

        return ConversationResponse.builder()
                .id(conversation.getId())
                .nom(conversation.getNom())
                .image(conversation.getImage())
                .createdAt(conversation.getCreatedAt())
                .otherUserId(
                        otherParticipant != null
                                ? otherParticipant.getUser().getId()
                                : null
                )
                .otherUserFirstName(
                        otherParticipant != null
                                ? otherParticipant.getUser().getFirstName()
                                : null
                )
                .otherUserLastName(
                        otherParticipant != null
                                ? otherParticipant.getUser().getLastName()
                                : null
                )
                .otherUserProfileImage(
                        otherParticipant != null
                                ? otherParticipant.getUser().getProfileImage()
                                : null
                )
                .lastMessage(lastMessage)
                .unreadCount(unreadCount)
                .build();
    }
    @Override
    public ChatMessageResponse toMessageResponse(
            Message message
    ) {

        User sender = message.getSender();

        return ChatMessageResponse.builder()
                .id(message.getId())
                .conversationId(
                        message.getConversation().getId()
                )
                .senderId(sender.getId())
                .senderFirstName(sender.getFirstName())
                .senderLastName(sender.getLastName())
                .senderProfileImage(
                        sender.getProfileImage()
                )
                .contenu(message.getContenu())
                .image(message.getImage())
                .sentAt(message.getSentAt())
                .isRead(message.getIsRead())
                .build();
    }
}
