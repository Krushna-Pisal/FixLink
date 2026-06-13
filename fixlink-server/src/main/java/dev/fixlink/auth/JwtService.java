package dev.fixlink.auth;

import dev.fixlink.shared.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {

    @Value("${spring.security.jwt.secret}")
    private String secret;

    @Value("${spring.security.jwt.expiry-ms}")
    private long expiryMs;

    public String generate(AppUser user) {
        return Jwts.builder()
            .subject(user.getId())
            .claim("email", user.getEmail())
            .claim("role", user.getRole().name())
            .claim("name", user.getDisplayName())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiryMs))
            .signWith(Keys.hmacShaKeyFor(secret.getBytes()))
            .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
            .verifyWith(Keys.hmacShaKeyFor(secret.getBytes()))
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
