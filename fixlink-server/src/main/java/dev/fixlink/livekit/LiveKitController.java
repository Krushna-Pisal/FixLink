package dev.fixlink.livekit;

import dev.fixlink.shared.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/livekit")
public class LiveKitController {

    @Autowired
    private LiveKitService liveKitService;

    @PostMapping("/token")
    public ResponseEntity<ApiResponse<Map<String, String>>> getToken(
            @RequestBody Map<String, String> body,
            HttpServletRequest httpReq) {
        String roomName = body.get("roomName");
        String participantName = body.get("participantName");
        String role = (String) httpReq.getAttribute("userRole");
        boolean isAgent = "AGENT".equals(role);

        String token = liveKitService.generateToken(roomName, participantName, isAgent);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("token", token)));
    }
}
