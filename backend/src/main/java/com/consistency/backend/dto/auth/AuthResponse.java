package com.consistency.backend.dto.auth;

public class AuthResponse {
    private String token;
    private String name;
    private String email;
    private Long userId;

    public AuthResponse(String token, String name, String email, Long userId) {
        this.token = token;
        this.name = name;
        this.email = email;
        this.userId = userId;
    }

    public String getToken() { return token; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public Long getUserId() { return userId; }
}
