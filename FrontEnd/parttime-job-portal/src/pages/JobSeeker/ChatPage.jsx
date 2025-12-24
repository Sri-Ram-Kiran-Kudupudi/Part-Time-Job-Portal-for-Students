import React, { useState, useRef, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { AuthContext } from "../../context/AuthContext";
import { markChatAsRead } from "../../service/api";
import "./ChatPage.css";

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [chatUserName, setChatUserName] = useState("");
  const [inputMessage, setInputMessage] = useState("");

  // ✅ IMPORTANT: ref for messages container
  const messagesContainerRef = useRef(null);
  const stompClientRef = useRef(null);

  // ✅ PROPER SCROLL FUNCTION (NO JUMPING)
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  };

  // ------------------ LOAD CHAT USER ------------------
  const loadChatUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/chat/${chatId}/user`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      setChatUserName(data.name);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ LOAD CHAT HISTORY ------------------
  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/chat/${chatId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ CONNECT WEBSOCKET ------------------
  const connectWebSocket = () => {
    const token = localStorage.getItem("token");

    if (stompClientRef.current?.active) {
      stompClientRef.current.deactivate();
    }

    const socket = new SockJS("http://localhost:8080/ws");

    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: () => {},
      onConnect: () => {
        stompClient.subscribe(`/topic/chat/${chatId}`, (message) => {
          const newMsg = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMsg]);
        });
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  // ------------------ INITIAL LOAD ------------------
  useEffect(() => {
    loadChatUser();
    loadChatHistory();
    connectWebSocket();

    return () => stompClientRef.current?.deactivate();
  }, [chatId]);

  // ------------------ AUTO SCROLL ON MESSAGE CHANGE ------------------
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ------------------ MARK AS READ ------------------
  useEffect(() => {
    markChatAsRead(chatId).catch(() => {});
  }, [chatId]);

  // ------------------ SEND MESSAGE ------------------
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    if (!stompClientRef.current?.connected) return;

    const payload = {
      content: inputMessage.trim(),
      senderName: user.fullName,
    };

    stompClientRef.current.publish({
      destination: `/app/chat/${chatId}`,
      body: JSON.stringify(payload),
    });

    setInputMessage("");
  };

  const isUserSender = (senderId) => senderId === user.id;

  return (
    <div className="chat-page-container">
      {/* ---------------- HEADER ---------------- */}
      <div className="fixed-header-full">
        <div className="chat-header-content">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h3 className="chat-recipient-name">
            {chatUserName || "Chat"}
          </h3>
        </div>
      </div>

      {/* ---------------- CHAT BODY ---------------- */}
      <main className="chat-main-area">
        <div className="messages-area" ref={messagesContainerRef}>
          {messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`message-row ${
                isUserSender(msg.senderId)
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`message-bubble ${
                  isUserSender(msg.senderId)
                    ? "bubble-user"
                    : "bubble-other"
                }`}
              >
                {!isUserSender(msg.senderId) && (
                  <span className="sender-name">
                    {chatUserName}
                  </span>
                )}

                <p>{msg.content}</p>

                <span className="timestamp-text">
                  {msg.sentAt &&
                    new Date(msg.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ---------------- INPUT BAR ---------------- */}
      <div className="fixed-input-bar-full">
        <form onSubmit={handleSend} className="input-form-flex">
          <input
            type="text"
            placeholder="Type message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button disabled={!inputMessage.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
