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

    // 1️ SEND MESSAGE (WEBSOCKET) — FINAL & SAFE
    @MessageMapping("/chat/{roomId}")
    public void receiveMessage(
            @DestinationVariable Long roomId, //which chat room user is sending to
            @Payload ChatMessage incoming, //Whatever message object frontend sends → Spring converts it → stores inside incoming
            Principal principal
    ) {
        if (principal == null) return; //If not logged in → stop.

        Long userId = Long.valueOf(principal.getName()); //geting the user id

        incoming.setSenderId(userId);
        incoming.setSentAt(LocalDateTime.now());
        incoming.setRead(false);
       //Set chat message properties:
        //senderId = current user
        //sent time = now
        //unread by default


        ChatRoom room = chatRoomRepository.findById(roomId).orElse(null);
        if (room == null) return;

        Long seekerId = jobApplicationRepository.findSeekerIdByRoomId(roomId);
        Long providerId = jobApplicationRepository.findProviderIdByRoomId(roomId);

        incoming.setReceiverId(
                userId.equals(seekerId) ? providerId : seekerId
        );
        //Smart logic:
        //If sender is seeker → receiver is provider, If sender is provider → receiver is seeker

        incoming.setChatRoom(room); //Attach chat room to message.

        ChatMessage saved = chatService.saveMessage(incoming);

        messagingTemplate.convertAndSend("/topic/chat/" + roomId, saved);
        /*
        Spring sends (broadcasts) it to a WebSocket channel
        The channel name is:
        /topic/chat/{roomId}
        Everyone who has subscribed to this channel receives the message instantly
        All connected users in that chat room will get it.
        or

        is used to broadcast the chat message to all users in that chat room in real-time through WebSockets. Whoever subscribed to that topic will instantly receive the message.”
         */
    }


    // 2️ FETCH CHAT HISTORY
    @GetMapping("/{roomId}/messages")
    public List<ChatMessage> getMessages(@PathVariable Long roomId) {
        return chatService.getMessagesForRoom(roomId);
    }


    // 3️ FETCH CHAT PARTNER NAME
    @GetMapping("/{roomId}/user")
    public Map<String, String> getChatUser(
            @PathVariable Long roomId,
            @AuthenticationPrincipal CustomUserDetails user //gets the currently logged-in user from security context
    ) {
        Long loggedUserId = user.getId();

        Long seekerId = jobApplicationRepository.findSeekerIdByRoomId(roomId);

        String seekerName = jobApplicationRepository.findSeekerNameByRoomId(roomId);
        String providerName = jobApplicationRepository.findProviderNameByRoomId(roomId);

        String chatPartner =
                loggedUserId.equals(seekerId) ? providerName : seekerName;  //If I am the seeker → partner = provider else seeker

        return Map.of("name", chatPartner);
        //this returns json resposnse like
        //{"name": "Rahul"}
    }

    // 4️ UNREAD COUNT
    @GetMapping("/{roomId}/unread-count")
    public long getUnreadCount(
            @PathVariable Long roomId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return chatService.getUnreadCount(roomId, user.getId());
    }

    // 5️ MARK AS READ
    @PostMapping("/{roomId}/read")
    public void markAsRead(
            @PathVariable Long roomId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        chatService.markMessagesAsRead(roomId, user.getId());
    }
}

/*
Frontend will do something like:
stompClient.subscribe("/topic/chat/5", (message) => {
     receive message live
});
So:
Backend sends to /topic/chat/5
All connected users who subscribed receive message instantly
This is how realtime chat works.
 */
