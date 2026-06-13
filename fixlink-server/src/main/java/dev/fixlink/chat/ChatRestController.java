package dev.fixlink.chat;

import dev.fixlink.shared.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class ChatRestController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/{sessionId}/chat")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable String sessionId) {
        return ResponseEntity.ok(chatService.getSessionMessages(sessionId));
    }
}
