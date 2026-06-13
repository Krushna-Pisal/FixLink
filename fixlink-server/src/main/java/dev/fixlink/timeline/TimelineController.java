package dev.fixlink.timeline;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class TimelineController {

    @Autowired
    private TimelineService timelineService;

    @GetMapping("/{sessionId}/timeline")
    public ResponseEntity<List<TimelineEvent>> getTimeline(@PathVariable String sessionId) {
        return ResponseEntity.ok(timelineService.getTimeline(sessionId));
    }
}
