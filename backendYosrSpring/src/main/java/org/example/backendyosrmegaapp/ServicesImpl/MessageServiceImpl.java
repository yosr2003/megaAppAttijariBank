package org.example.backendyosrmegaapp.ServicesImpl;

import lombok.RequiredArgsConstructor;

import org.example.backendyosrmegaapp.Repositories.ConversationParticipantRepository;
import org.example.backendyosrmegaapp.Repositories.MessageRepository;
import org.example.backendyosrmegaapp.Repositories.UserRepository;


import org.example.backendyosrmegaapp.Services.MessageService;
import org.example.backendyosrmegaapp.entities.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageServiceImpl
        implements MessageService {

    private final MessageRepository messageRepository;

    private final ConversationParticipantRepository
            participantRepository;

    private final UserRepository userRepository;

    @Override
    public ChatMessageResponse sendMessage(
            Long conversationId,
            Long senderId,
            String contenu,
            String image
    ) {

        if ((contenu == null || contenu.trim().isEmpty())
                && (image == null || image.isBlank())) {

            throw new RuntimeException(
                    "Le message ne peut pas être vide"
            );
        }

        ConversationParticipant participant =
                participantRepository
                        .findByConversationIdAndUserId(
                                conversationId,
                                senderId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "L'utilisateur ne participe pas à cette conversation"
                                )
                        );

        User sender =
                userRepository.findById(senderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Utilisateur introuvable"
                                )
                        );

        Message message =
                Message.builder()
                        .contenu(
                                contenu != null
                                        ? contenu.trim()
                                        : null
                        )
                        .image(image)
                        .conversation(
                                participant.getConversation()
                        )
                        .sender(sender)
                        .isRead(false)
                        .build();

        Message saved =
                messageRepository.save(message);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public List<ChatMessageResponse> getMessages(
            Long conversationId,
            Long userId
    ) {

        boolean participant =
                participantRepository
                        .existsByConversationIdAndUserId(
                                conversationId,
                                userId
                        );

        if (!participant) {
            throw new RuntimeException(
                    "Accès interdit à cette conversation"
            );
        }

        return messageRepository
                .findByConversationIdOrderBySentAtAsc(
                        conversationId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void markMessageAsRead(
            Long messageId,
            Long userId
    ) {

        Message message =
                messageRepository.findById(messageId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Message introuvable"
                                )
                        );

        boolean participant =
                participantRepository
                        .existsByConversationIdAndUserId(
                                message.getConversation().getId(),
                                userId
                        );

        if (!participant) {
            throw new RuntimeException(
                    "Accès interdit"
            );
        }

        /*
         * Le sender n'a pas besoin de marquer
         * son propre message comme lu.
         */
        if (!message.getSender().getId().equals(userId)) {
            message.setIsRead(true);
            messageRepository.save(message);
        }
    }

    @Override
    public void markConversationAsRead(
            Long conversationId,
            Long userId
    ) {

        List<Message> messages =
                messageRepository
                        .findByConversationIdAndIsReadFalseAndSenderIdNot(
                                conversationId,
                                userId
                        );

        messages.forEach(message ->
                message.setIsRead(true)
        );

        messageRepository.saveAll(messages);
    }

    @Transactional(readOnly = true)
    @Override
    public long countUnreadMessages(Long userId) {

        return participantRepository
                .findByUserId(userId)
                .stream()
                .mapToLong(participant ->
                        messageRepository
                                .countByConversationIdAndIsReadFalseAndSenderIdNot(
                                        participant.getConversation().getId(),
                                        userId
                                )
                )
                .sum();
    }

    @Override
    public void deleteMessage(
            Long messageId,
            Long userId
    ) {

        Message message =
                messageRepository.findById(messageId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Message introuvable"
                                )
                        );

        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException(
                    "Vous ne pouvez supprimer que vos messages"
            );
        }

        messageRepository.delete(message);
    }

    private ChatMessageResponse toResponse(Message message) {

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
