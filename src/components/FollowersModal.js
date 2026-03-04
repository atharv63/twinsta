import React, { useState, useEffect } from "react";
import { getFollowers, getFollowing } from "../api";

function FollowersModal({ type, userId, isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = type === 'followers'
        ? await getFollowers(userId)
        : await getFollowing(userId);
      setUsers(response.data);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        width: "400px",
        maxWidth: "90vw",
        maxHeight: "80vh",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px",
          borderBottom: "1px solid #dbdbdb",
          textAlign: "center",
          position: "relative"
        }}>
          <h3 style={{ margin: 0 }}>
            {type === 'followers' ? 'Followers' : 'Following'}
          </h3>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              right: "16px",
              top: "16px",
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            ✕
          </button>
        </div>

        {/* Users List */}
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center" }}>
              Loading...
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No {type} found
            </div>
          ) : (
            users.map(user => (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0"
                }}
              >
                <img
                  src={user.profilePic || "/default-avatar.png"}
                  alt={user.name}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginRight: "12px"
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: "14px" }}>
                    {user.name}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowersModal;