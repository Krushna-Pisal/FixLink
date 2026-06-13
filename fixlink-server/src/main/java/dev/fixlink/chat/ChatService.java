package dev.fixlink.chat;

import dev.fixlink.timeline.TimelineEvent;
import dev.fixlink.timeline.TimelineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepo;

    @Autowired
    private TimelineRepository timelineRepo;

    public ChatMessage persist(ChatMessage message) {
        message.setSentAt(Instant.now());
        return chatRepo.save(message);
    }

    public TimelineEvent persistEvent(TimelineEvent event) {
        event.setOccurredAt(Instant.now());
        return timelineRepo.save(event);
    }

    public List<ChatMessage> getSessionMessages(String sessionId) {
        return chatRepo.findBySessionIdOrderBySentAtAsc(sessionId);
    }
}
