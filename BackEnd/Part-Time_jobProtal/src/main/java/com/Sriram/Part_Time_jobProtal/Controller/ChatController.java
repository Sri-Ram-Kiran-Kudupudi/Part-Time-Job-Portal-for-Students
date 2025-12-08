package com.Sriram.Part_Time_jobProtal.Controller;

import com.Sriram.Part_Time_jobProtal.Config.CustomUserDetails;
import com.Sriram.Part_Time_jobProtal.Model.ChatMessage;
import com.Sriram.Part_Time_jobProtal.Model.ChatRoom;
import com.Sriram.Part_Time_jobProtal.Model.JobApplication;
import com.Sriram.Part_Time_jobProtal.Model.User;
import com.Sriram.Part_Time_jobProtal.Repository.ChatRoomRepository;
import com.Sriram.Part_Time_jobProtal.Repository.UserRepository;
import com.Sriram.Part_Time_jobProtal.Service.ChatService;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatService chatService;
    private final UserRepository userRepository;

    // ---------------------------------------------------------
    // 1️⃣ SEND MESSAGE (WEBSOCKET)
    // ---------------------------------------------------------
    @MessageMapping("/chat/{roomId}")
    public void receiveMessage(
            @DestinationVariable Long roomId,
            @Payload ChatMessage incoming
    ) {
        incoming.setSentAt(LocalDateTime.now());

        ChatRoom room = chatRoomRepository.findById(roomId).orElse(null);

        if (room != null) {
            incoming.setChatRoom(room);
            ChatMessage saved = chatService.saveMessage(incoming);

            messagingTemplate.convertAndSend("/topic/chat/" + roomId, saved);
        }
    }

    // ---------------------------------------------------------
    // 2️⃣ FETCH CHAT HISTORY
    // ---------------------------------------------------------
    @GetMapping("/{roomId}/messages")
    public List<ChatMessage> getMessages(@PathVariable Long roomId) {
        return chatService.getMessagesForRoom(roomId);
    }

    // ---------------------------------------------------------
    // 3️⃣ FETCH CHAT PARTNER NAME (FIXED FOR 500 ERROR)
    // ---------------------------------------------------------
    @GetMapping("/{roomId}/user")
    public Map<String, String> getChatUser(
            @PathVariable Long roomId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {

        Long loggedUserId = user.getId();

        ChatRoom room = chatRoomRepository.findById(roomId).orElse(null);
        if (room == null || room.getJobApplication() == null) {
            return Map.of("name", "Unknown User (No App)");
        }

        JobApplication app = room.getJobApplication();

        // ⭐ FIX: Add robust null checks to prevent NullPointerException

        User seekerUser = null;
        if (app.getApplicant() != null) {
            seekerUser = app.getApplicant().getUser();
        }

        if (seekerUser == null) {
            // This indicates a data integrity issue, but we safely return a fallback
            return Map.of("name", "Error: Seeker Data Missing");
        }

        // ---------------------------------------------------------

        // ⭐ SEEKER DATA (Now safe to access)
        Long seekerId = seekerUser.getId();
        String seekerName = seekerUser.getFullName();

        // ⭐ PROVIDER DATA
        String providerName = "Provider";

        // Also check if job is null before trying to get providerId
        if (app.getJob() != null && app.getJob().getProviderId() != null) {
            Long providerId = app.getJob().getProviderId();
            User provider = userRepository.findById(providerId).orElse(null);
            if (provider != null) {
                providerName = provider.getFullName();
            }
        }

        // ⭐ Determine chat partner
        String chatPartnerName =
                loggedUserId.equals(seekerId) ? providerName : seekerName;

        return Map.of("name", chatPartnerName);
    }
}