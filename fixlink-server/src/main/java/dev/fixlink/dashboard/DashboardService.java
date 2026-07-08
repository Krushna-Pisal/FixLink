package dev.fixlink.dashboard;

import dev.fixlink.session.SessionRepository;
import dev.fixlink.session.SupportSession;
import dev.fixlink.shared.SessionStatus;
import dev.fixlink.shared.Severity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private SessionRepository sessionRepo;

    public Map<String, Object> getOverview(String agentId) {
        List<SupportSession> all = sessionRepo.findByAgentId(agentId);

        long activeSessions = all.stream()
            .filter(s -> s.getStatus() == SessionStatus.ACTIVE)
            .count();

        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
        long totalToday = all.stream()
            .filter(s -> s.getStatus() != SessionStatus.CANCELLED
                && s.getStartedAt() != null
                && s.getStartedAt().isAfter(startOfDay))
            .count();

        OptionalDouble avgDuration = all.stream()
            .filter(s -> s.getStatus() == SessionStatus.ENDED
                && s.getStartedAt() != null
                && s.getEndedAt() != null)
            .mapToLong(s -> ChronoUnit.MINUTES.between(s.getStartedAt(), s.getEndedAt()))
            .average();

        Map<String, Long> severityBreakdown = Arrays.stream(Severity.values())
            .collect(Collectors.toMap(
                Enum::name,
                sev -> all.stream().filter(s -> s.getStatus() != SessionStatus.CANCELLED && sev == s.getSeverity()).count()
            ));

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("activeSessions", activeSessions);
        overview.put("totalToday", totalToday);
        overview.put("totalAll", all.stream().filter(s -> s.getStatus() != SessionStatus.CANCELLED).count());
        overview.put("avgDurationMinutes", avgDuration.isPresent() ? Math.round(avgDuration.getAsDouble()) : 0);
        overview.put("severityBreakdown", severityBreakdown);

        return overview;
    }

    public List<SupportSession> getSessions(String agentId) {
        List<SupportSession> all = sessionRepo.findByAgentId(agentId);
        all.sort(Comparator.comparing(
            s -> s.getStartedAt() == null ? Instant.EPOCH : s.getStartedAt(),
            Comparator.reverseOrder()
        ));
        return all;
    }
}
