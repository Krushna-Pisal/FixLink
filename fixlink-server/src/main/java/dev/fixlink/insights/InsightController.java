package dev.fixlink.insights;

import dev.fixlink.shared.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/insights")
public class InsightController {

    @Autowired
    private InsightService insightService;

    @PostMapping("/{sessionId}/generate")
    public ResponseEntity<ApiResponse<String>> generateSummary(@PathVariable String sessionId) {
        String summary = insightService.generateSummary(sessionId);
        return ResponseEntity.ok(ApiResponse.ok("Summary generated", summary));
    }
}
