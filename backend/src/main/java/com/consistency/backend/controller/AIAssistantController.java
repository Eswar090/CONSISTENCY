package com.consistency.backend.controller;

import com.consistency.backend.dto.AIChatRequest;
import com.consistency.backend.dto.AIChatResponse;
import com.consistency.backend.service.AIAssistantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIAssistantController {

    private final AIAssistantService aiAssistantService;

    public AIAssistantController(AIAssistantService aiAssistantService) {
        this.aiAssistantService = aiAssistantService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AIChatResponse> chat(@RequestBody AIChatRequest request) {
        AIChatResponse response = aiAssistantService.processChatRequest(request);
        return ResponseEntity.ok(response);
    }
}
