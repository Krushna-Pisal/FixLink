package dev.fixlink.session;

import dev.fixlink.session.dto.CreateSessionRequest;
import dev.fixlink.session.dto.JoinSessionRequest;
import dev.fixlink.shared.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<SupportSession>> createSession(
            @RequestBody CreateSessionRequest req,
            HttpServletRequest httpReq) {
        String agentId = (String) httpReq.getAttribute("userId");
        String agentName = (String) httpReq.getAttribute("userName");
        SupportSession session = sessionService.createSession(agentId, agentName, req);
        return ResponseEntity.ok(ApiResponse.ok("Session created", session));
    }

    @GetMapping("/join/{token}")
    public ResponseEntity<ApiResponse<SupportSession>> getSessionByToken(@PathVariable String token) {
        SupportSession session = sessionService.getSessionByToken(token);
        return ResponseEntity.ok(ApiResponse.ok(session));
    }

    @PostMapping("/join/{token}")
    public ResponseEntity<ApiResponse<SupportSession>> joinSession(
            @PathVariable String token,
            @RequestBody JoinSessionRequest req) {
        SupportSession session = sessionService.joinSession(token, req);
        return ResponseEntity.ok(ApiResponse.ok("Joined session", session));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupportSession>> getSession(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getSession(id)));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<ApiResponse<SupportSession>> endSession(
            @PathVariable String id,
            HttpServletRequest httpReq) {
        String agentId = (String) httpReq.getAttribute("userId");
        SupportSession session = sessionService.endSession(id, agentId);
        return ResponseEntity.ok(ApiResponse.ok("Session ended", session));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupportSession>>> listSessions() {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getAllSessions()));
    }
}
