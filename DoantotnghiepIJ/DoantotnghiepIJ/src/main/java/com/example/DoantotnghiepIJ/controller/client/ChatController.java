package com.example.DoantotnghiepIJ.controller.client;

import com.example.DoantotnghiepIJ.dto.Chat.ChatRequest;
import com.example.DoantotnghiepIJ.dto.Chat.ChatResponse;
import com.example.DoantotnghiepIJ.service.chatbot.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest req) {
        String reply = chatService.chat(req.getSessionId(), req.getMessage());
        return new ChatResponse(reply);
    }
}