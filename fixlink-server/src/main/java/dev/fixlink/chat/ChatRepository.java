package dev.fixlink.chat;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findBySessionIdOrderBySentAtAsc(String sessionId);
}
