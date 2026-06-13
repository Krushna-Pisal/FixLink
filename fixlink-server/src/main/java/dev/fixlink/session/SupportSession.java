package dev.fixlink.session;

import dev.fixlink.shared.Severity;
import dev.fixlink.shared.SessionStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

@Document(collection = "support_sessions")
public class SupportSession {
    @Id
    private String id;

    private String sessionCode;

    @Indexed(unique = true)
    private String inviteToken;

    private String agentId;
    private String agentName;
    private String customerName;
    private SessionStatus status;
    private String issueTitle;
    private Severity severity;
    private Instant startedAt;
    private Instant endedAt;
    private String livekitRoomName;
    private String aiSummary;

    public SupportSession() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSessionCode() { return sessionCode; }
    public void setSessionCode(String sessionCode) { this.sessionCode = sessionCode; }

    public String getInviteToken() { return inviteToken; }
    public void setInviteToken(String inviteToken) { this.inviteToken = inviteToken; }

    public String getAgentId() { return agentId; }
    public void setAgentId(String agentId) { this.agentId = agentId; }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public String getIssueTitle() { return issueTitle; }
    public void setIssueTitle(String issueTitle) { this.issueTitle = issueTitle; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getEndedAt() { return endedAt; }
    public void setEndedAt(Instant endedAt) { this.endedAt = endedAt; }

    public String getLivekitRoomName() { return livekitRoomName; }
    public void setLivekitRoomName(String livekitRoomName) { this.livekitRoomName = livekitRoomName; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
}
