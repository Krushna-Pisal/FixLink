package dev.fixlink.auth;

import dev.fixlink.auth.dto.LoginRequest;
import dev.fixlink.auth.dto.RegisterRequest;
import dev.fixlink.auth.dto.AuthResponse;
import dev.fixlink.shared.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest req) {
        AuthResponse data = authService.register(req);
        return ResponseEntity.ok(ApiResponse.ok("Account created", data));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest req) {
        AuthResponse data = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", data));
    }
}
