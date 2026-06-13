package dev.fixlink.timeline;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TimelineRepository extends MongoRepository<TimelineEvent, String> {
    List<TimelineEvent> findBySessionIdOrderByOccurredAtAsc(String sessionId);
}
