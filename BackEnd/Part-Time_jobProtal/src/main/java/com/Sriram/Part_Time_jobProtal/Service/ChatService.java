package com.Sriram.Part_Time_jobProtal.Service;

import com.Sriram.Part_Time_jobProtal.Model.ChatMessage;
import java.util.List;

public interface ChatService {

    ChatMessage saveMessage(ChatMessage message);

    List<ChatMessage> getMessagesForRoom(Long roomId);
}
