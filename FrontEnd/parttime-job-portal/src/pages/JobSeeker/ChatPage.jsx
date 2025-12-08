import React, { useState, useRef, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { AuthContext } from "../../context/AuthContext";
import "./ChatPage.css";

const ChatPage = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [messages, setMessages] = useState([]);
    const [chatUserName, setChatUserName] = useState("");
    const [inputMessage, setInputMessage] = useState("");

    const messagesEndRef = useRef(null);
    const stompClientRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadChatUser = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `http://localhost:8080/api/chat/${chatId}/user`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (!res.ok) return;
            const data = await res.json();
            setChatUserName(data.name);
        } catch (e) {
            console.error("Failed to load chat user:", e);
        }
    };

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
            scrollToBottom();
        } catch (error) {
            console.error(error);
        }
    };

    const connectWebSocket = () => {
        const token = localStorage.getItem("token");
        const socket = new SockJS(`http://localhost:8080/ws?token=${token}`);

        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 3000,
            debug: () => {},
        });

        stompClient.onConnect = () => {
            stompClient.subscribe(`/topic/chat/${chatId}`, (message) => {
                const newMsg = JSON.parse(message.body);
                setMessages((prev) => [...prev, newMsg]);
                setTimeout(scrollToBottom, 0);
            });
        };

        stompClient.activate();
        stompClientRef.current = stompClient;
    };

    useEffect(() => {
        loadChatUser();
        loadChatHistory();
        connectWebSocket();
        return () => stompClientRef.current?.deactivate();
    }, [chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        if (!stompClientRef.current || !stompClientRef.current.connected) {
            console.error("STOMP not connected yet!");
            return;
        }

        const payload = {
            senderId: user?.id,
            senderName: user?.fullName || "User",
            content: inputMessage.trim(),
        };

        stompClientRef.current.publish({
            destination: `/app/chat/${chatId}`,
            body: JSON.stringify(payload),
        });

        setInputMessage("");
    };

    const isUserSender = (senderId) => senderId === user?.id;

    return (
        <div className="chat-page-container">

            {/* FIXED HEADER */}
            <div className="fixed-header-full">
                <div className="chat-header-content">
                    {/* The Back button and recipient name are placed here */}
                    <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                    <h3 className="chat-recipient-name">{chatUserName || "Chat"}</h3>
                </div>
            </div>

            <main className="chat-main-area">
                <div className="messages-area">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message-row ${
                                isUserSender(msg.senderId) ? "justify-end" : "justify-start"
                            }`}
                        >
                            <div
                                className={`message-bubble ${
                                    isUserSender(msg.senderId) ? "bubble-user" : "bubble-other"
                                }`}
                            >
                                {!isUserSender(msg.senderId) && (
                                    <span className="sender-name">{msg.senderName}</span>
                                )}

                                <p>{msg.content}</p>

                                <span className="timestamp-text">
                                    {new Date(msg.sentAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* FIXED INPUT BAR */}
            <div className="fixed-input-bar-full">
                <form onSubmit={handleSend} className="input-form-flex">
                    <input
                        type="text"
                        placeholder="Type message..."
                        className="form-control-base large-input"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                    />
                    <button className="btn btn-primary large-button" disabled={!inputMessage}>
                        Send
                    </button>
                </form>
            </div>

        </div>
    );
};

export default ChatPage;