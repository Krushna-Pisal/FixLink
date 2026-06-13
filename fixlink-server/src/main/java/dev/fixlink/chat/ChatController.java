package dev.fixlink.chat;

import dev.fixlink.shared.ApiResponse;
import dev.fixlink.timeline.TimelineEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Controller
public class ChatController {

    @Autowired
    private ChatService chatService;

    // STOMP handler — receive a chat message and broadcast it
    @MessageMapping("/session.{sessionId}.chat")
    @SendTo("/topic/session.{sessionId}.chat")
    public ChatMessage handleChat(@DestinationVariable String sessionId, ChatMessage incoming) {
        incoming.setSessionId(sessionId);
        return chatService.persist(incoming);
    }

    // STOMP handler — receive a timeline event and broadcast it
    @MessageMapping("/session.{sessionId}.event")
    @SendTo("/topic/session.{sessionId}.events")
    public TimelineEvent handleEvent(@DestinationVariable String sessionId, TimelineEvent event) {
        event.setSessionId(sessionId);
        return chatService.persistEvent(event);
    }
}
