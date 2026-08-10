package org.example.backendyosrmegaapp.Controllers;

import lombok.RequiredArgsConstructor;

import org.example.backendyosrmegaapp.Services.MessageService;
import org.example.backendyosrmegaapp.entities.ChatMessageRequest;
import org.example.backendyosrmegaapp.entities.ChatMessageResponse;
import org.example.backendyosrmegaapp.entities.MessageResponse;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final MessageService messageService;

    @MessageMapping("/chat.send")
    @SendTo("/topic/chat")
    public ChatMessageResponse sendMessage(
            ChatMessageRequest request
    ) {

        return messageService.sendMessage(
                request.getConversationId(),
                request.getSenderId(),
                request.getContenu(),
                request.getImage()
        );
    }
}