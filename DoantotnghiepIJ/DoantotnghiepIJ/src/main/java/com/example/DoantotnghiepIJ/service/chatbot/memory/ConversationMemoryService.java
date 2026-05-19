package com.example.DoantotnghiepIJ.service.chatbot.memory;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ConversationMemoryService {

    // Lữu trữ dưới dạng danh sách các object: [{"role": "user", "content": "..."}, ...]
    private final Map<String, List<Map<String, String>>> memory = new HashMap<>();

    public void add(String sessionId, String role, String content) {
        memory.computeIfAbsent(sessionId, k -> new ArrayList<>()).add(Map.of("role", role, "content", content));
    }

    public List<Map<String, String>> get(String sessionId) {
        return memory.getOrDefault(sessionId, new ArrayList<>());
    }
}