package dev.fixlink.session;

import dev.fixlink.shared.SessionStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SessionRepository extends MongoRepository<SupportSession, String> {
    Optional<SupportSession> findByInviteToken(String inviteToken);
    List<SupportSession> findByAgentId(String agentId);
    List<SupportSession> findByStatus(SessionStatus status);
    List<SupportSession> findByStartedAtAfter(Instant since);
    long countByStatus(SessionStatus status);
}
