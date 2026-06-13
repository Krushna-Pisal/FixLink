package dev.fixlink.livekit;

import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LiveKitService {

    @Value("${livekit.api-key}")
    private String apiKey;

    @Value("${livekit.api-secret}")
    private String apiSecret;

    public String generateToken(String roomName, String participantName, boolean isAgent) {
        AccessToken token = new AccessToken(apiKey, apiSecret);
        token.setName(participantName);
        token.setIdentity(participantName.replaceAll("[^a-zA-Z0-9_]", "_") + "_" + System.currentTimeMillis());
        // TTL in seconds (2 hours)
        token.setTtl(7200L);

        // RoomJoin(canPublish=true) + RoomName(room)
        token.addGrants(new RoomJoin(true), new RoomName(roomName));

        return token.toJwt();
    }
}
