package com.Sriram.Part_Time_jobProtal.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long senderId;
    private String senderName;
    private Long receiverId;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(length = 2000)
    private String content;

    private LocalDateTime sentAt;


    @ManyToOne(fetch = FetchType.LAZY)//Many Messages → One ChatRoom
    @JoinColumn(name = "chat_room_id")
    @JsonIgnore
    private ChatRoom chatRoom;
}
