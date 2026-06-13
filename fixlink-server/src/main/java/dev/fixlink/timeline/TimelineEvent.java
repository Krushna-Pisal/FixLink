package dev.fixlink.timeline;

import dev.fixlink.shared.EventType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "timeline_events")
public class TimelineEvent {
    @Id
    private String id;
    private String sessionId;
    private String actorName;
    private EventType type;
    private String detail;
    private Instant occurredAt;

    public TimelineEvent() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public EventType getType() { return type; }
    public void setType(EventType type) { this.type = type; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }

    public Instant getOccurredAt() { return occurredAt; }
    public void setOccurredAt(Instant occurredAt) { this.occurredAt = occurredAt; }
}
