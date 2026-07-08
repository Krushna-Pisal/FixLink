package dev.fixlink.session;

import dev.fixlink.session.dto.CreateSessionRequest;
import dev.fixlink.session.dto.JoinSessionRequest;
import dev.fixlink.shared.SessionStatus;
import dev.fixlink.timeline.TimelineService;
import dev.fixlink.shared.EventType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepo;

    @Autowired
    private TimelineService timeline;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public SupportSession createSession(String agentId, String agentName, CreateSessionRequest req) {
        String code = "FX-" + (1000 + new Random().nextInt(8999));
        String token = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String roomName = "fixlink-room-" + code.toLowerCase();

        SupportSession session = new SupportSession();
        session.setSessionCode(code);
        session.setInviteToken(token);
        session.setAgentId(agentId);
        session.setAgentName(agentName);
        session.setIssueTitle(req.getIssueTitle());
        session.setSeverity(req.getSeverity() != null ? req.getSeverity() : dev.fixlink.shared.Severity.MEDIUM);
        session.setStatus(SessionStatus.WAITING);
        session.setLivekitRoomName(roomName);
        session.setStartedAt(Instant.now());

        SupportSession saved = sessionRepo.save(session);
        timeline.record(saved.getId(), agentName, EventType.SESSION_STARTED, null);
        return saved;
    }

    public SupportSession joinSession(String inviteToken, JoinSessionRequest req) {
        SupportSession session = sessionRepo.findByInviteToken(inviteToken)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid invite link"));

        if (session.getStatus() == SessionStatus.ENDED) {
            throw new ResponseStatusException(HttpStatus.GONE, "This session has already ended");
        }

        session.setCustomerName(req.getCustomerName());
        session.setStatus(SessionStatus.ACTIVE);
        SupportSession saved = sessionRepo.save(session);
        timeline.record(saved.getId(), req.getCustomerName(), EventType.JOINED, "Customer joined");

        // Notify agent's browser that a customer has joined
        messagingTemplate.convertAndSend(
            "/topic/session." + saved.getId() + ".events",
            Map.of("type", "CUSTOMER_JOINED", "customerName", req.getCustomerName())
        );

        return saved;
    }

    public SupportSession getSessionByToken(String inviteToken) {
        return sessionRepo.findByInviteToken(inviteToken)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
    }

    public SupportSession getSession(String sessionId) {
        return sessionRepo.findById(sessionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
    }

    public SupportSession endSession(String sessionId, String agentId) {
        SupportSession session = getSession(sessionId);

        if (!session.getAgentId().equals(agentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the session agent can end this session");
        }

        session.setStatus(SessionStatus.ENDED);
        session.setEndedAt(Instant.now());
        SupportSession saved = sessionRepo.save(session);
        timeline.record(saved.getId(), "System", EventType.SESSION_ENDED, null);

        // Push SESSION_ENDED event over STOMP so customer's browser reacts immediately
        messagingTemplate.convertAndSend(
            "/topic/session." + sessionId + ".events",
            Map.of("type", "SESSION_ENDED", "sessionId", sessionId)
        );

        return saved;
    }

    public SupportSession cancelSession(String sessionId, String agentId, String reason) {
        SupportSession session = getSession(sessionId);

        if (!session.getAgentId().equals(agentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the session agent can cancel this session");
        }

        if (session.getStatus() == SessionStatus.ENDED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel an already ended session");
        }

        session.setStatus(SessionStatus.CANCELLED);
        session.setCancellationReason(reason);
        session.setEndedAt(Instant.now());
        SupportSession saved = sessionRepo.save(session);
        timeline.record(saved.getId(), "System", EventType.SESSION_CANCELLED, "Reason: " + (reason != null ? reason : "No reason provided"));

        // Push SESSION_CANCELLED event over STOMP so customer's browser reacts immediately
        messagingTemplate.convertAndSend(
            "/topic/session." + sessionId + ".events",
            Map.of("type", "SESSION_CANCELLED", "sessionId", sessionId, "reason", reason != null ? reason : "")
        );

        return saved;
    }

    public SupportSession customerEndSession(String inviteToken, Integer rating, String feedback) {
        SupportSession session = sessionRepo.findByInviteToken(inviteToken)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        if (session.getStatus() == SessionStatus.ENDED || session.getStatus() == SessionStatus.CANCELLED) {
            if (rating != null) session.setRating(rating);
            if (feedback != null) session.setCustomerFeedback(feedback);
            return sessionRepo.save(session);
        }

        session.setStatus(SessionStatus.ENDED);
        session.setEndedAt(Instant.now());
        if (rating != null) session.setRating(rating);
        if (feedback != null) session.setCustomerFeedback(feedback);
        SupportSession saved = sessionRepo.save(session);

        timeline.record(saved.getId(), "Customer", EventType.SESSION_ENDED, "Customer ended session. Rating: " + rating + ", Feedback: " + feedback);

        // Push SESSION_ENDED event over STOMP so agent's browser reacts immediately
        messagingTemplate.convertAndSend(
            "/topic/session." + saved.getId() + ".events",
            Map.of("type", "SESSION_ENDED", "sessionId", saved.getId(), "rating", rating != null ? rating : 0, "feedback", feedback != null ? feedback : "")
        );

        return saved;
    }

    public List<SupportSession> getAllSessions() {
        return sessionRepo.findAll();
    }
}
