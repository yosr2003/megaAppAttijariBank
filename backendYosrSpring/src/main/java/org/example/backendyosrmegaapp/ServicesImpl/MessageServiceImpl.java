package org.example.backendyosrmegaapp.ServicesImpl;

import lombok.RequiredArgsConstructor;

import org.example.backendyosrmegaapp.Repositories.ConversationParticipantRepository;
import org.example.backendyosrmegaapp.Repositories.MessageRepository;
import org.example.backendyosrmegaapp.Repositories.UserRepository;

import org.example.backendyosrmegaapp.Services.MessageService;
import org.example.backendyosrmegaapp.entities.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    private final ConversationParticipantRepository
            participantRepository;

    private final UserRepository userRepository;

    /*
     * Dossier de stockage des photos des messages.
     *
     * Exemple dans application.properties :
     *
     * app.upload.message-images=C:/shared_uploads/messages
     */
    @Value("${app.upload.message-images}")
    private String messageImagesDirectory;


    // =========================================================
    // ENVOI MESSAGE HTTP
    // TEXTE + PHOTO
    // =========================================================

    @Override
    public ChatMessageResponse sendMessage(
            Long conversationId,
            Long senderId,
            String contenu,
            MultipartFile image
    ) throws IOException {

        boolean hasText =
                contenu != null
                        && !contenu.trim().isEmpty();

        boolean hasImage =
                image != null
                        && !image.isEmpty();

        if (!hasText && !hasImage) {

            throw new RuntimeException(
                    "Le message ne peut pas être vide"
            );
        }


        // Vérifier le participant

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


        // Récupérer l'utilisateur

        User sender =
                userRepository.findById(senderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Utilisateur introuvable"
                                )
                        );


        // URL de l'image

        String imageUrl = null;


        // Sauvegarder la photo

        if (hasImage) {

            imageUrl =
                    saveMessageImage(image);
        }


        // Créer le message

        Message message =
                Message.builder()
                        .contenu(
                                hasText
                                        ? contenu.trim()
                                        : null
                        )
                        .image(imageUrl)
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


    // =========================================================
    // WEBSOCKET
    // MESSAGE TEXTE
    // =========================================================

    @Override
    public ChatMessageResponse sendTextMessage(
            Long conversationId,
            Long senderId,
            String contenu,
            String image
    ) {

        boolean hasText =
                contenu != null
                        && !contenu.trim().isEmpty();

        boolean hasImage =
                image != null
                        && !image.isBlank();

        if (!hasText && !hasImage) {

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
                                hasText
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


    // =========================================================
    // SAUVEGARDE PHOTO
    // =========================================================

    private String saveMessageImage(
            MultipartFile image
    ) throws IOException {


        // Vérifier le type

        String contentType =
                image.getContentType();

        if (
                contentType == null
                        || !contentType.startsWith("image/")
        ) {

            throw new RuntimeException(
                    "Le fichier doit être une image"
            );
        }


        // Taille maximale : 10 MB

        if (
                image.getSize()
                        > 10 * 1024 * 1024
        ) {

            throw new RuntimeException(
                    "L'image ne doit pas dépasser 10 MB"
            );
        }


        // Créer le dossier

        Path directory =
                Paths.get(
                        messageImagesDirectory
                );

        Files.createDirectories(
                directory
        );


        // Récupérer extension

        String originalName =
                image.getOriginalFilename();

        String extension = "";


        if (
                originalName != null
                        && originalName.contains(".")
        ) {

            extension =
                    originalName.substring(
                            originalName.lastIndexOf(".")
                    );
        }


        // Nom unique

        String filename =
                UUID.randomUUID()
                        + extension;


        // Chemin final

        Path target =
                directory.resolve(filename);


        // Copier le fichier

        Files.copy(
                image.getInputStream(),
                target,
                StandardCopyOption.REPLACE_EXISTING
        );


        /*
         * URL enregistrée dans la DB.
         *
         * Exemple :
         *
         * /api/messages/images/abc.jpg
         */

        return "/api/messages/images/" + filename;
    }


    // =========================================================
    // RÉCUPÉRER MESSAGES
    // =========================================================

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


    // =========================================================
    // MARQUER UN MESSAGE COMME LU
    // =========================================================

    @Override
    public void markMessageAsRead(
            Long messageId,
            Long userId
    ) {

        Message message =
                messageRepository
                        .findById(messageId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Message introuvable"
                                )
                        );


        boolean participant =
                participantRepository
                        .existsByConversationIdAndUserId(
                                message
                                        .getConversation()
                                        .getId(),
                                userId
                        );


        if (!participant) {

            throw new RuntimeException(
                    "Accès interdit"
            );
        }


        if (
                !message
                        .getSender()
                        .getId()
                        .equals(userId)
        ) {

            message.setIsRead(true);

            messageRepository.save(message);
        }
    }


    // =========================================================
    // MARQUER UNE CONVERSATION COMME LUE
    // =========================================================

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


        messages.forEach(
                message ->
                        message.setIsRead(true)
        );


        messageRepository.saveAll(
                messages
        );
    }


    // =========================================================
    // COMPTER NON LUS
    // =========================================================

    @Transactional(readOnly = true)
    @Override
    public long countUnreadMessages(
            Long userId
    ) {

        return participantRepository
                .findByUserId(userId)
                .stream()
                .mapToLong(
                        participant ->
                                messageRepository
                                        .countByConversationIdAndIsReadFalseAndSenderIdNot(
                                                participant
                                                        .getConversation()
                                                        .getId(),
                                                userId
                                        )
                )
                .sum();
    }


    // =========================================================
    // SUPPRIMER MESSAGE
    // =========================================================

    @Override
    public void deleteMessage(
            Long messageId,
            Long userId
    ) {

        Message message =
                messageRepository
                        .findById(messageId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Message introuvable"
                                )
                        );


        if (
                !message
                        .getSender()
                        .getId()
                        .equals(userId)
        ) {

            throw new RuntimeException(
                    "Vous ne pouvez supprimer que vos messages"
            );
        }


        messageRepository.delete(
                message
        );
    }


    // =========================================================
    // CONVERSION ENTITY → RESPONSE
    // =========================================================

    private ChatMessageResponse toResponse(
            Message message
    ) {

        User sender =
                message.getSender();


        return ChatMessageResponse.builder()

                .id(
                        message.getId()
                )

                .conversationId(
                        message
                                .getConversation()
                                .getId()
                )

                .senderId(
                        sender.getId()
                )

                .senderFirstName(
                        sender.getFirstName()
                )

                .senderLastName(
                        sender.getLastName()
                )

                .senderProfileImage(
                        sender.getProfileImage()
                )

                .contenu(
                        message.getContenu()
                )

                .image(
                        message.getImage()
                )

                .sentAt(
                        message.getSentAt()
                )

                .isRead(
                        message.getIsRead()
                )

                .build();
    }
}