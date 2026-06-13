package dev.fixlink.insights;

import dev.fixlink.chat.ChatMessage;
import dev.fixlink.chat.ChatRepository;
import dev.fixlink.session.SessionRepository;
import dev.fixlink.session.SupportSession;
import dev.fixlink.timeline.TimelineEvent;
import dev.fixlink.timeline.TimelineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InsightService {

    @Value("${groq.api-key:}")
    private String groqKey;

    @Value("${groq.model:llama3-70b-8192}")
    private String model;

    @Autowired
    private ChatRepository chatRepo;

    @Autowired
    private TimelineRepository timelineRepo;

    @Autowired
    private SessionRepository sessionRepo;

    @SuppressWarnings("unchecked")
    public String generateSummary(String sessionId) {
        SupportSession session = sessionRepo.findById(sessionId).orElseThrow();
        List<ChatMessage> messages = chatRepo.findBySessionIdOrderBySentAtAsc(sessionId);
        List<TimelineEvent> events = timelineRepo.findBySessionIdOrderByOccurredAtAsc(sessionId);

        // If no Groq API key, return a demo mock summary
        if (groqKey == null || groqKey.isBlank()) {
            String mock = buildMockSummary(session);
            session.setAiSummary(mock);
            sessionRepo.save(session);
            return mock;
        }

        String chatHistory = messages.stream()
            .map(m -> "[" + m.getRole() + "] " + m.getSenderName() + ": " + m.getContent())
            .collect(Collectors.joining("\n"));

        String eventLog = events.stream()
            .map(e -> e.getOccurredAt() + " — " + e.getActorName() + ": " + e.getType())
            .collect(Collectors.joining("\n"));

        long durationMinutes = Duration.between(
            session.getStartedAt(),
            session.getEndedAt() != null ? session.getEndedAt() : Instant.now()
        ).toMinutes();

        String prompt = """
            You are a senior technical support analyst preparing a formal resolution report.
            Analyze the following support session and return ONLY valid JSON with no preamble or markdown.

            Session ID: %s
            Issue Title: %s
            Agent: %s
            Customer: %s
            Duration: %d minutes

            CHAT TRANSCRIPT:
            %s

            SESSION EVENT LOG:
            %s

            Return ONLY this JSON structure, nothing else:
            {
              "customerIssue": "One sentence describing what the customer reported",
              "likelyRootCause": "Technical root cause based on the conversation",
              "troubleshootingStepsTaken": ["Step 1", "Step 2", "Step 3"],
              "resolutionStatus": "RESOLVED | PARTIALLY_RESOLVED | UNRESOLVED | ESCALATION_REQUIRED",
              "recommendedNextActions": ["Action 1", "Action 2"],
              "severityClassification": "LOW | MEDIUM | HIGH | CRITICAL",
              "confidenceScore": 0.0,
              "resolutionSummary": "2-3 sentence summary of what happened and the outcome"
            }
            """.formatted(
            session.getSessionCode(), session.getIssueTitle(),
            session.getAgentName(), session.getCustomerName(),
            durationMinutes, chatHistory, eventLog
        );

        try {
            RestTemplate rt = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(groqKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "temperature", 0.3
            );

            ResponseEntity<Map> response = rt.exchange(
                "https://api.groq.com/openai/v1/chat/completions",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Map.class
            );

            List<Map> choices = (List<Map>) response.getBody().get("choices");
            Map message = (Map) choices.get(0).get("message");
            String summary = (String) message.get("content");

            session.setAiSummary(summary);
            sessionRepo.save(session);
            return summary;
        } catch (Exception e) {
            // Fallback to mock on any error
            String mock = buildMockSummary(session);
            session.setAiSummary(mock);
            sessionRepo.save(session);
            return mock;
        }
    }

    private String buildMockSummary(SupportSession session) {
        return """
            {
              "customerIssue": "Customer reported: %s",
              "likelyRootCause": "Issue diagnosed through guided video troubleshooting session.",
              "troubleshootingStepsTaken": [
                "Agent confirmed the issue description with the customer",
                "Agent walked through diagnostic steps via live video",
                "Customer followed step-by-step instructions to resolve the issue"
              ],
              "resolutionStatus": "RESOLVED",
              "recommendedNextActions": [
                "Customer to monitor the device over the next 24 hours",
                "Agent to follow up if the issue recurs"
              ],
              "severityClassification": "%s",
              "confidenceScore": 0.72,
              "resolutionSummary": "The support session concluded successfully. The agent guided the customer through the issue via live video and the problem was resolved during the session."
            }
            """.formatted(
            session.getIssueTitle(),
            session.getSeverity() != null ? session.getSeverity().name() : "MEDIUM"
        );
    }
}
