package dev.fixlink.timeline;

import dev.fixlink.shared.EventType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TimelineService {

    @Autowired
    private TimelineRepository timelineRepo;

    public TimelineEvent record(String sessionId, String actorName, EventType type, String detail) {
        TimelineEvent event = new TimelineEvent();
        event.setSessionId(sessionId);
        event.setActorName(actorName);
        event.setType(type);
        event.setDetail(detail);
        event.setOccurredAt(Instant.now());
        return timelineRepo.save(event);
    }

    public List<TimelineEvent> getTimeline(String sessionId) {
        return timelineRepo.findBySessionIdOrderByOccurredAtAsc(sessionId);
    }
}
