package com.consistency.backend.service;

import com.consistency.backend.dto.AIChatRequest;
import com.consistency.backend.dto.AIChatResponse;
import com.consistency.backend.dto.ProductivityContextDTO;
import org.springframework.stereotype.Service;

@Service
public class AIAssistantService {

    private final ProductivityContextService contextService;
    private final AIProviderService providerService;

    public AIAssistantService(ProductivityContextService contextService, AIProviderService providerService) {
        this.contextService = contextService;
        this.providerService = providerService;
    }

    public AIChatResponse processChatRequest(AIChatRequest request) {
        String message = request != null && request.getMessage() != null ? request.getMessage().trim() : "";
        if (message.isBlank()) {
            message = "How was my productivity this week?";
        }

        // 1. Gather authenticated user's real productivity context
        ProductivityContextDTO context = contextService.getContextForUser(message);

        // 2. Generate AI response using context
        String aiResponseText = providerService.generateProductivityInsight(message, context);

        return new AIChatResponse(aiResponseText, true, context);
    }
}
