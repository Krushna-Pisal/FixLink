package dev.fixlink.dashboard;

import dev.fixlink.session.SupportSession;
import dev.fixlink.shared.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getOverview()));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<SupportSession>>> getSessions() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getSessions()));
    }
}
