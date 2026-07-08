package dev.fixlink.dashboard;

import dev.fixlink.session.SupportSession;
import dev.fixlink.shared.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview(HttpServletRequest request) {
        String agentId = (String) request.getAttribute("userId");
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getOverview(agentId)));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<SupportSession>>> getSessions(HttpServletRequest request) {
        String agentId = (String) request.getAttribute("userId");
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getSessions(agentId)));
    }
}
