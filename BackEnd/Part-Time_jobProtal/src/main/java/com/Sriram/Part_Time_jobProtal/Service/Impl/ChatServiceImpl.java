package com.Sriram.Part_Time_jobProtal.Service.Impl;

import com.Sriram.Part_Time_jobProtal.Model.ChatMessage;
import com.Sriram.Part_Time_jobProtal.Repository.ChatMessageRepository;
import com.Sriram.Part_Time_jobProtal.Service.ChatService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository messageRepository;

    @Override
    public ChatMessage saveMessage(ChatMessage msg) {
        return messageRepository.save(msg);
    }

    @Override
    public List<ChatMessage> getMessagesForRoom(Long roomId) {
        return messageRepository.findByChatRoomIdOrderBySentAtAsc(roomId);
    }
}
