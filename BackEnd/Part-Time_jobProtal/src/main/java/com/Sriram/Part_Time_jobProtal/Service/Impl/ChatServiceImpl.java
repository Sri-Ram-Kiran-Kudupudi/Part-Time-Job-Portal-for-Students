package com.Sriram.Part_Time_jobProtal.Service.Impl;

import com.Sriram.Part_Time_jobProtal.Model.ChatMessage;
import com.Sriram.Part_Time_jobProtal.Repository.ChatMessageRepository;
import com.Sriram.Part_Time_jobProtal.Service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository messageRepository;

    // ✅ KEEP ONLY THIS
    @Override
    @Transactional
    public ChatMessage saveMessage(ChatMessage msg) {
        return messageRepository.save(msg);
    }

    @Override
    public List<ChatMessage> getMessagesForRoom(Long roomId) {
        return messageRepository.findByChatRoom_IdOrderBySentAtAsc(roomId);
    }

    @Override
    public long getUnreadCount(Long roomId, Long userId) {
        return messageRepository
                .countByChatRoom_IdAndReceiverIdAndReadFalse(roomId, userId);
    }

    @Override
    @Transactional
    public void markMessagesAsRead(Long roomId, Long userId) {
        List<ChatMessage> msgs =
                messageRepository.findByChatRoom_IdAndReceiverIdAndReadFalse(
                        roomId, userId
                );

        msgs.forEach(m -> m.setRead(true));
        messageRepository.saveAll(msgs);
    }
}
