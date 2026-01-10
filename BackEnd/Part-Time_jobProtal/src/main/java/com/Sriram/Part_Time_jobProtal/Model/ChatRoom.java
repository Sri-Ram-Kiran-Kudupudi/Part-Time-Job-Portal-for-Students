package com.Sriram.Part_Time_jobProtal.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "chatRoom", fetch = FetchType.LAZY)
    @JsonIgnore
    private JobApplication jobApplication;

    @OneToMany(
            mappedBy = "chatRoom",    //If ChatRoom is deleted → Messages are deleted
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonIgnore
    private List<ChatMessage> messages = new ArrayList<>();
}


//One ChatRoom → Many Messages
//If ChatRoom deleted → messages automatically deleted
//orphanRemoval = true ensures no garbage messages remainOne ChatRoom → Many Messages