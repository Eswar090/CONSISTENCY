package com.consistency.backend.dto;

public class AIChatResponse {

    private String message;
    private boolean contextUsed;
    private ProductivityContextDTO summaryContext;

    public AIChatResponse() {}

    public AIChatResponse(String message, boolean contextUsed, ProductivityContextDTO summaryContext) {
        this.message = message;
        this.contextUsed = contextUsed;
        this.summaryContext = summaryContext;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isContextUsed() {
        return contextUsed;
    }

    public void setContextUsed(boolean contextUsed) {
        this.contextUsed = contextUsed;
    }

    public ProductivityContextDTO getSummaryContext() {
        return summaryContext;
    }

    public void setSummaryContext(ProductivityContextDTO summaryContext) {
        this.summaryContext = summaryContext;
    }
}
