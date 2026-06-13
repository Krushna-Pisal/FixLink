package dev.fixlink.auth;

import dev.fixlink.auth.dto.AuthResponse;
import dev.fixlink.auth.dto.LoginRequest;
import dev.fixlink.auth.dto.RegisterRequest;
import dev.fixlink.shared.AppUser;
import dev.fixlink.shared.Role;
import dev.fixlink.shared.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        AppUser user = new AppUser();
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setDisplayName(req.getDisplayName());
        user.setRole(Role.AGENT);
        user.setCreatedAt(Instant.now());

        AppUser saved = userRepository.save(user);
        String token = jwtService.generate(saved);
        return new AuthResponse(token, saved.getId(), saved.getEmail(), saved.getDisplayName(), saved.getRole().name());
    }

    public AuthResponse login(LoginRequest req) {
        AppUser user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtService.generate(user);
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getDisplayName(), user.getRole().name());
    }
}
