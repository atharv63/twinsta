import React, { useEffect, useState, useRef } from "react";
import socket from "../utils/socket";
import "../styles/message.css";
import { searchUsers } from "../api";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// helper to get logged-in user id
function getCurrentUserId() {
  const id = localStorage.getItem("userId");
  return id ? parseInt(id, 10) : null;
}

export default function Messages() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");
  const userId = getCurrentUserId();
  const messagesEndRef = useRef(null);

  // fetch chats on mount
  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE}/chats/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        console.log("Chats fetched:", data);
        if (Array.isArray(data)) {
          setChats(data);
        } else {
          setChats([]);
        }
      })
      .catch((e) => console.error("Chat fetch error:", e));
  }, [userId]);

  // socket: receive new messages
  useEffect(() => {
    socket.on("chat_message", (msg) => {
      if (selectedChat && msg.chatId === selectedChat.id) {
        setMessages((prev) => [...prev, msg]);
      }

      setChats((prev) =>
        prev
          .map((c) =>
            c.id === msg.chatId
              ? { ...c, lastMessage: msg, updatedAt: msg.createdAt }
              : c
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    });

    return () => socket.off("chat_message");
  }, [selectedChat]);

  // scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // open a chat
  const openChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const res = await fetch(`${API_BASE}/chats/messages/${chat.id}`);
      const msgs = await res.json();
      setMessages(Array.isArray(msgs) ? msgs : []);
      socket.emit("join_chat", chat.id);
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  // send message
  const handleSend = async () => {
    if (!text.trim() || !selectedChat) return;
    const payload = { chatId: selectedChat.id, senderId: userId, content: text.trim() };

    try {
      const res = await fetch(`${API_BASE}/chats/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();

      socket.emit("chat_message", saved);
      setMessages((prev) => [...prev, saved]);
      setText("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  // search users
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      console.log("🔍 Searching users:", searchTerm);
      
      const results = await searchUsers(searchTerm);
      console.log("🔍 Search results:", results.data);

      if (!results.data || !Array.isArray(results.data)) {
        setError("No users found");
        setSearchResults([]);
        return;
      }

      const availableUsers = results.data || [];
      
      setSearchResults(availableUsers);
      
      if (availableUsers.length === 0) {
        setError("No users found");
      } else {
        setError("");
      }
      
    } catch (err) {
      console.error("Search error:", err);
      console.error("Error details:", err.response?.data || err.message);
      setError("Search failed. Try again.");
    }
  };

  // start chat with searched user
  const startChatWithUser = async (otherUserId) => {
    const user = searchResults.find((u) => u.id === otherUserId);
    if (!user) {
      setError("Cannot start chat with this user.");
      return;
    }

    try {
      console.log("Starting chat with user:", user.id, user.name);
      
      const body = { userIds: [Number(userId), Number(otherUserId)] };
      const res = await fetch(`${API_BASE}/chats`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("Create chat response status:", res.status);

      if (!res.ok) {
        const errData = await res.json();
        console.error("Create chat error:", errData);
        setError(errData.message || "Cannot start chat.");
        return;
      }

      const chat = await res.json();
      console.log("Chat created:", chat);
      
      // Refresh chats list
      const refreshRes = await fetch(`${API_BASE}/chats/${userId}`);
      const updatedChats = await refreshRes.json();
      setChats(Array.isArray(updatedChats) ? updatedChats : []);
      
      // Open the new chat
      openChat(chat);
      setSearchTerm("");
      setSearchResults([]);
      setError("");
      
    } catch (err) {
      console.error("Start chat error:", err);
      setError("Unable to start chat. Try again.");
    }
  };

  return (
    <div className="chat-page" style={{ display: "flex", height: "85vh" }}>
      {/* LEFT SIDE — chat list + search */}
      <div
        className="chat-list"
        style={{
          width: "30%",
          borderRight: "1px solid #ddd",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
          <h3>Chats</h3>
        </div>

        <div style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users to chat..."
            style={{
              width: "100%",
              padding: "6px",
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              width: "100%",
              marginTop: 6,
              background: "#007bff",
              color: "white",
              padding: "6px 0",
              borderRadius: 6,
              border: "none",
            }}
          >
            Search
          </button>
        </div>

        {error && (
          <div style={{ color: "red", fontSize: 13, padding: "5px 10px" }}>
            {error}
          </div>
        )}

        {/* search results */}
        {searchResults.length > 0 && (
          <div style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
            <strong>Search Results</strong>
            {searchResults.map((u) => (
              <div
                key={u.id}
                style={{
                  padding: "6px",
                  cursor: "pointer",
                  borderRadius: 6,
                  marginTop: 4,
                  background: "#f9f9f9",
                }}
                onClick={() => startChatWithUser(u.id)}
              >
                {u.name}
              </div>
            ))}
          </div>
        )}

        {/* chat list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {chats.map((c) => {
            const other =
              c.participants?.find((p) => p.id !== userId) || c.participants?.[0] || {};
            return (
              <div
                key={c.id}
                className="chat-user"
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid #eee",
                }}
                onClick={() => openChat(c)}
              >
                <img
                  src={other.profilePic || "/default.jpg"}
                  alt=""
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    marginRight: 10,
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600" }}>
                    {c.name || other.name}
                  </div>
                  <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                    {c.lastMessage
                      ? c.lastMessage.content?.slice(0, 60)
                      : "No messages yet"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE — chat box */}
      <div
        className="chat-box"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        {!selectedChat ? (
          <div style={{ padding: 20 }}>Select a chat to view messages</div>
        ) : (
          <>
            <div
              style={{
                padding: "10px 15px",
                borderBottom: "1px solid #eee",
                background: "#fafafa",
              }}
            >
              <strong>
                {selectedChat.name ||
                  selectedChat.participants?.find((p) => p.id !== userId)?.name}
              </strong>
            </div>

            <div
              className="messages"
              style={{ flex: 1, padding: 15, overflowY: "auto" }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent:
                      m.senderId === userId ? "flex-end" : "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      background:
                        m.senderId === userId ? "#007bff" : "#f1f1f1",
                      color: m.senderId === userId ? "white" : "black",
                      padding: "8px 12px",
                      borderRadius: 12,
                      maxWidth: "70%",
                    }}
                  >
                    {m.content}
                    <div
                      style={{
                        fontSize: 10,
                        marginTop: 4,
                        opacity: 0.8,
                        textAlign:
                          m.senderId === userId ? "right" : "left",
                      }}
                    >
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div
              style={{
                display: "flex",
                padding: 10,
                borderTop: "1px solid #eee",
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  marginLeft: 8,
                  padding: "8px 12px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}