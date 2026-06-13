package dev.fixlink.auth.dto;

public class AuthResponse {
    private String token;
    private String userId;
    private String email;
    private String displayName;
    private String role;

    public AuthResponse() {}

    public AuthResponse(String token, String userId, String email, String displayName, String role) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.displayName = displayName;
        this.role = role;
    }

    public String getToken() { return token; }
    public String getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getDisplayName() { return displayName; }
    public String getRole() { return role; }
}
