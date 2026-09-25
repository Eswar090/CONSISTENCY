package com.consistency.backend.service;

import com.consistency.backend.dto.ProductivityContextDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class AIProviderService {

    private static final Logger logger = LoggerFactory.getLogger(AIProviderService.class);

    @Value("${ai.api.key:#{null}}")
    private String apiKey;

    @Value("${ai.model:gemini-2.5-flash}")
    private String model;

    @Value("${ai.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    private final ObjectMapper mapper = new ObjectMapper();

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("none");
    }

    public String generateProductivityInsight(String userMessage, ProductivityContextDTO context) {
        if (!isConfigured()) {
            return generateHeuristicFallback(userMessage, context);
        }

        try {
            String prompt = buildPrompt(userMessage, context);
            RestClient restClient = RestClient.builder().baseUrl(baseUrl).build();

            // Format request body for Gemini REST API
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            String responseJson = restClient.post()
                    .uri("/models/" + model + ":generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = mapper.readTree(responseJson);
            JsonNode candidate = root.path("candidates").get(0);
            if (candidate != null) {
                String text = candidate.path("content").path("parts").get(0).path("text").asText();
                if (text != null && !text.isBlank()) {
                    return text.trim();
                }
            }

            return generateHeuristicFallback(userMessage, context);
        } catch (Exception e) {
            logger.error("AI Provider API call failed: {}", e.getMessage());
            return generateHeuristicFallback(userMessage, context);
        }
    }

    private String buildPrompt(String userMessage, ProductivityContextDTO context) {
        String contextStr = "";
        try {
            contextStr = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(context);
        } catch (Exception e) {
            contextStr = "{}";
        }

        return """
                You are the AI Productivity Assistant for the CONSISTENCY app ("Plan it. Do it. Track it.").
                
                SYSTEM RULES:
                1. Use ONLY the supplied productivity context for factual user claims.
                2. Never invent or fabricate task counts, habit percentages, streaks, focus time, dates, or productivity trends.
                3. If the user has 0 tasks/habits or no data, state clearly that there is not enough data yet.
                4. Distinguish clearly between factual observations and suggestions.
                5. Do NOT perform actions (creating/editing/deleting tasks or habits). Phase 8 provides analysis and suggestions only.
                6. Keep answers concise, structured (using markdown headers/bullets), actionable, and under 250 words.
                7. If the question is completely unrelated to productivity, politely decline and refocus on consistency and productivity tracking.
                
                PRODUCTIVITY CONTEXT:
                """ + contextStr + """
                
                USER QUESTION:
                """ + userMessage;
    }

    public String generateHeuristicFallback(String userMessage, ProductivityContextDTO context) {
        if (context == null || 
            (context.getTasks() != null && context.getTasks().getPlanned() != null && context.getTasks().getPlanned() == 0 &&
             context.getHabits() != null && context.getHabits().getScheduledOccurrences() != null && context.getHabits().getScheduledOccurrences() == 0)) {
            return "You don't have enough productivity data tracked yet for a full analysis. Add a few tasks in Daily Planner or habits in Habit Tracker, and check back as you complete them!";
        }

        String query = userMessage != null ? userMessage.toLowerCase() : "";

                if (query.contains("plan")) {
            StringBuilder sb = new StringBuilder();
            sb.append("### Smart Plan Analysis\n\n");
            if (context.getSmartPlan() != null) {
                sb.append("- **Capacity:** ").append(context.getSmartPlan().getPlanningCapacity()).append(" tasks/day\n");
                sb.append("- **Today's Plan:** ").append(context.getSmartPlan().getPlannedTaskCount()).append(" tasks (").append(context.getSmartPlan().getWorkloadStatus()).append(" workload)\n");
            }
            if (context.getGoals() != null && !context.getGoals().isEmpty()) {
                sb.append("- **Active Goals:** ").append(context.getGoals().size()).append("\n");
            }
            sb.append("\n### Suggestion\n");
            if (context.getSmartPlan() != null && "HEAVY".equals(context.getSmartPlan().getWorkloadStatus())) {
                sb.append("Your workload is heavier than usual. Focus on the most critical tasks first and consider moving lower priority tasks to tomorrow.");
            } else {
                sb.append("Your workload looks balanced. You have capacity to make steady progress on your goals today!");
            }
            return sb.toString();
        }

        if (query.contains("focus") || query.contains("today")) {
            StringBuilder sb = new StringBuilder();
            sb.append("### Today's Focus Overview\n\n");
            sb.append("- **Tasks Remaining:** ").append(context.getTodayTaskList() != null ? context.getTodayTaskList().size() : 0).append("\n");
            sb.append("- **Focus Time:** ").append(context.getFocus() != null && context.getFocus().getFocusedMinutes() != null ? context.getFocus().getFocusedMinutes() : 0).append(" mins\n");
            sb.append("- **Daily Consistency:** ").append(context.getConsistency() != null && context.getConsistency().getCurrent() != null ? Math.round(context.getConsistency().getCurrent()) + "%" : "Not enough data").append("\n\n");
            sb.append("### Suggestion\n");
            if (context.getTodayTaskList() != null && !context.getTodayTaskList().isEmpty()) {
                sb.append("Prioritize your top task: `").append(context.getTodayTaskList().get(0)).append("`. Use Focus Mode to knock out a 25-minute session first.");
            } else {
                sb.append("You have no pending tasks scheduled for today. Take time to plan tomorrow's key objectives!");
            }
            return sb.toString();
        }

        if (query.contains("habit") || query.contains("missing")) {
            StringBuilder sb = new StringBuilder();
            sb.append("### Habit Performance Analysis\n\n");
            sb.append("- **Overall Habit Completion:** ").append(context.getHabits() != null && context.getHabits().getCompletionPercentage() != null ? Math.round(context.getHabits().getCompletionPercentage()) + "%" : "N/A").append("\n");
            sb.append("- **Current Streak:** ").append(context.getConsistency() != null && context.getConsistency().getCurrentStreak() != null ? context.getConsistency().getCurrentStreak() : 0).append(" days\n\n");
            sb.append("### Suggestion\n");
            sb.append("Stick to small daily triggers to build momentum. Maintaining consistency on 1-2 core habits yields better long-term results than attempting too many at once.");
            return sb.toString();
        }

        // Default analysis
        StringBuilder sb = new StringBuilder();
        sb.append("### ");
        sb.append(context.getPeriod() != null ? context.getPeriod() : "Productivity").append(" Summary\n\n");
        sb.append("- **Task Execution:** ").append(context.getTasks() != null && context.getTasks().getCompleted() != null && context.getTasks().getPlanned() != null ? context.getTasks().getCompleted() + "/" + context.getTasks().getPlanned() : "0/0");
        sb.append(" (").append(context.getTasks() != null && context.getTasks().getCompletionPercentage() != null ? Math.round(context.getTasks().getCompletionPercentage()) + "%" : "N/A").append(")\n");
        sb.append("- **Habit Completion:** ").append(context.getHabits() != null && context.getHabits().getCompletionPercentage() != null ? Math.round(context.getHabits().getCompletionPercentage()) + "%" : "N/A").append("\n");
        sb.append("- **Average Consistency:** ").append(context.getConsistency() != null && context.getConsistency().getAverage() != null ? Math.round(context.getConsistency().getAverage()) + "%" : "Not enough data").append("\n\n");
        sb.append("### Key Takeaway\n");
        sb.append("Your consistency is built on small daily wins. Focus on completing your highest priority tasks early in the day to maintain momentum.");
        return sb.toString();
    }
}

