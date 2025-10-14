import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar({ onOpenCreatePost }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        backgroundColor: "white",
        borderBottom: "1px solid #ddd",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: "60px",
      }}
    >
      {/* Logo */}
      <h1
        style={{
          margin: "0 0 10px 0",
          fontSize: "32px",
          color: "#262626",
          fontFamily: "'Brush Script MT', cursive",
        }}
      >
        Twinsta
      </h1>

      {/* Navigation Links */}
      <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
        <Link
          to="/home"
          style={{
            textDecoration: "none",
            color: location.pathname === "/home" ? "#0095f6" : "#262626",
            fontWeight: location.pathname === "/home" ? "600" : "400",
          }}
        >
          🏠 Home
        </Link>

        <button
          onClick={onOpenCreatePost}
          style={{
            padding: "6px 12px",
            backgroundColor: "transparent",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#262626",
          }}
          title="Create Post"
        >
          +
        </button>

        <Link
          to="/search"
          style={{
            textDecoration: "none",
            color: location.pathname === "/search" ? "#0095f6" : "#262626",
            fontWeight: location.pathname === "/search" ? "600" : "400",
          }}
        >
          🔍 Search
        </Link>

        {/* ADD FOLLOW REQUESTS LINK */}
        <Link
          to="/follow-requests"
          style={{
            textDecoration: "none",
            color:
              location.pathname === "/follow-requests"
                ? "#0095f6"
                : "#262626",
            fontWeight:
              location.pathname === "/follow-requests" ? "600" : "400",
          }}
        >
          📨 Requests
        </Link>

        {/* ✅ NEW CHAT LINK */}
        <Link
          to="/chat"
          style={{
            textDecoration: "none",
            color: location.pathname === "/chat" ? "#0095f6" : "#262626",
            fontWeight: location.pathname === "/chat" ? "600" : "400",
          }}
        >
          💬 Chats
        </Link>



        <Link
          to="/profile"
          style={{
            textDecoration: "none",
            color: location.pathname === "/profile" ? "#0095f6" : "#262626",
            fontWeight: location.pathname === "/profile" ? "600" : "400",
          }}
        >
          👤 Profile
        </Link>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          padding: "8px 16px",
          backgroundColor: "#efefef",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          color: "#262626",
          fontWeight: "500",
        }}
      >
        Logout
      </button>
    </nav>
  );
}

export default Navbar;
