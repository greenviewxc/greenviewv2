/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useChatContext } from "../../contexts/ChatContext";
import { model } from "@services/firebase";
import "./Chatbot.css";

type Role = "user" | "model" | "system" | "function";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Content = {
  role: Role;
  parts: { text: string }[];
};

function Chatbot() {
  const { messages, addMessage, isVisible, setIsVisible } = useChatContext();
  const [input, setInput] = useState("");
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleNewMessage = async () => {
      if (messages.length > 0 && !isRequestPending) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.sender === "user" && lastMessage.needsResponse) {
          await handleSend(lastMessage.text, true);
        }
      }
    };
    handleNewMessage();
  }, [messages, isRequestPending]);

  const handleSend = async (messageText = input, isAutoResponse = false) => {
    if (!messageText.trim() || isRequestPending) return;

    try {
      setIsRequestPending(true);

      if (!isAutoResponse) {
        addMessage({ sender: "user", text: messageText, needsResponse: true });
        return;
      }

      const chat = model.startChat({
        history: messages.map((msg) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        })),
        generationConfig: { maxOutputTokens: 8192 },
      });

      const result = await chat.sendMessage(messageText);
      const response = await result.response;
      const botResponse = await response.text();

      addMessage({ sender: "bot", text: botResponse, needsResponse: false });
      setInput("");
    } catch (error) {
      console.error("Error:", error);
      addMessage({
        sender: "bot",
        text: "Sorry, something went wrong.",
        needsResponse: false,
      });
    } finally {
      setIsRequestPending(false);
    }
  };

  return (
    <div>
      {isVisible ? (
        <div className={`chat-container ${isExpanded ? "expanded" : ""}`}>
          <div className="top-bar">
            <button onClick={() => setIsExpanded(!isExpanded)}>
              <img
                src="/icons/arrow_green.png"
                alt="expand"
                className={`expand-button ${isExpanded ? "expanded" : ""}`}
              />
            </button>
            <button onClick={() => setIsVisible(false)}>
              <img
                src="/icons/close.png"
                alt="close"
                className="close-button"
              />
            </button>
          </div>
          <div className={`chat-history ${isExpanded ? "expanded" : ""}`}>
            {messages.length === 0 ? (
              <div className="empty-chat-message">
                Hey There! How can I help you today?
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={
                    msg.sender === "bot" ? "message-bot" : "message-user"
                  }
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ))
            )}
          </div>

          <div className="message-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
            />
            <button
              className="send-button"
              onClick={() => handleSend()}
              disabled={isRequestPending}
            >
              <img src="/icons/arrow.png" alt="chat" width="16px" />
            </button>
          </div>
        </div>
      ) : (
        <button className="open-chat-button" onClick={() => setIsVisible(true)}>
          <img src="/icons/chat.png" alt="chat" width="24px" />
        </button>
      )}
    </div>
  );
}

export default Chatbot;
