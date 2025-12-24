package com.Sriram.Part_Time_jobProtal.Repository;

import com.Sriram.Part_Time_jobProtal.Model.ChatMessage;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatRoom_IdOrderBySentAtAsc(Long chatRoomId);

    @Modifying
    @Transactional
    void deleteByChatRoom_Id(Long roomId);

    long countByChatRoom_IdAndReceiverIdAndReadFalse(Long chatRoomId, Long receiverId);

    List<ChatMessage> findByChatRoom_IdAndReceiverIdAndReadFalse(
            Long chatRoomId,
            Long receiverId
    );
}
