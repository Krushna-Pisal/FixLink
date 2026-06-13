package dev.fixlink.config;

import dev.fixlink.auth.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/sessions/join/**").permitAll()
                // LiveKit token: customers have no JWT, validate by room membership instead
                .requestMatchers("/api/livekit/**").permitAll()
                // Chat/timeline reads needed by both agent and customer
                .requestMatchers("/api/sessions/*/chat").permitAll()
                .requestMatchers("/api/sessions/*/timeline").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/api/dashboard/**").hasRole("AGENT")
                .requestMatchers("/api/sessions/create").hasRole("AGENT")
                .requestMatchers("/api/sessions/*/end").hasRole("AGENT")
                .requestMatchers("/api/insights/**").hasRole("AGENT")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
