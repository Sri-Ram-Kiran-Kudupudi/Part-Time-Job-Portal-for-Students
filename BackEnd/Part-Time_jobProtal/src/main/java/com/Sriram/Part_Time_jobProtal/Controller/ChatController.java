package com.Sriram.Part_Time_jobProtal.Controller;

import com.Sriram.Part_Time_jobProtal.Config.CustomUserDetails;
import com.Sriram.Part_Time_jobProtal.Model.ChatMessage;
import com.Sriram.Part_Time_jobProtal.Model.ChatRoom;
import com.Sriram.Part_Time_jobProtal.Repository.ChatRoomRepository;
import com.Sriram.Part_Time_jobProtal.Repository.JobApplicationRepository;
import com.Sriram.Part_Time_jobProtal.Service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRoomRepository chatRoomRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ChatService chatService;

    // ---------------------------------------------------------
    // 1️⃣ SEND MESSAGE (WEBSOCKET) — FINAL & SAFE
    // ---------------------------------------------------------
    @MessageMapping("/chat/{roomId}")
    public void receiveMessage(
            @DestinationVariable Long roomId,
            @Payload ChatMessage incoming,
            Principal principal
    ) {
        if (principal == null) return;

        Long userId = Long.valueOf(principal.getName());

        incoming.setSenderId(userId);
        incoming.setSentAt(LocalDateTime.now());
        incoming.setRead(false);

        ChatRoom room = chatRoomRepository.findById(roomId).orElse(null);
        if (room == null) return;

        Long seekerId = jobApplicationRepository.findSeekerIdByRoomId(roomId);
        Long providerId = jobApplicationRepository.findProviderIdByRoomId(roomId);

        incoming.setReceiverId(
                userId.equals(seekerId) ? providerId : seekerId
        );

        incoming.setChatRoom(room);

        ChatMessage saved = chatService.saveMessage(incoming);

        messagingTemplate.convertAndSend("/topic/chat/" + roomId, saved);
    }



    // ---------------------------------------------------------
    // 2️⃣ FETCH CHAT HISTORY
    // ---------------------------------------------------------
    @GetMapping("/{roomId}/messages")
    public List<ChatMessage> getMessages(@PathVariable Long roomId) {
        return chatService.getMessagesForRoom(roomId);
    }

    // ---------------------------------------------------------
    // 3️⃣ FETCH CHAT PARTNER NAME
    // ---------------------------------------------------------
    @GetMapping("/{roomId}/user")
    public Map<String, String> getChatUser(
            @PathVariable Long roomId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Long loggedUserId = user.getId();

        Long seekerId = jobApplicationRepository.findSeekerIdByRoomId(roomId);

        String seekerName = jobApplicationRepository.findSeekerNameByRoomId(roomId);
        String providerName = jobApplicationRepository.findProviderNameByRoomId(roomId);

        String chatPartner =
                loggedUserId.equals(seekerId) ? providerName : seekerName;

        return Map.of("name", chatPartner);
    }

    // ---------------------------------------------------------
    // 4️⃣ UNREAD COUNT
    // ---------------------------------------------------------
    @GetMapping("/{roomId}/unread-count")
    public long getUnreadCount(
            @PathVariable Long roomId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return chatService.getUnreadCount(roomId, user.getId());
    }

    // ---------------------------------------------------------
    // 5️⃣ MARK AS READ
    // ---------------------------------------------------------
    @PostMapping("/{roomId}/read")
    public void markAsRead(
            @PathVariable Long roomId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        chatService.markMessagesAsRead(roomId, user.getId());
    }
}
