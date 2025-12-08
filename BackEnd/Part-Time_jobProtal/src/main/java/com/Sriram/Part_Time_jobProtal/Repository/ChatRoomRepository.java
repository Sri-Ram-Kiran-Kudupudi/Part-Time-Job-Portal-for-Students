package com.Sriram.Part_Time_jobProtal.Repository;

import com.Sriram.Part_Time_jobProtal.Model.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    @Modifying
    @Transactional
    void deleteById(Long id);
}
