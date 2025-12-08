package com.Sriram.Part_Time_jobProtal.Repository;

import com.Sriram.Part_Time_jobProtal.Model.ChatMessage;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatRoomIdOrderBySentAtAsc(Long chatRoomId);
    @Query("SELECT a.chatRoom.id FROM JobApplication a WHERE a.applicant.user.id = :userId")
    List<Long> findChatRoomIdsByApplicantUserId(Long userId);

    @Query("SELECT a.chatRoom.id FROM JobApplication a WHERE a.job.id = :jobId")
    List<Long> findChatRoomIdsByJobId(Long jobId);

    @Modifying
    @Transactional
    void deleteByChatRoom_Id(Long roomId);

}
