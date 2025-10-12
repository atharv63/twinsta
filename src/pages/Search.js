// src/pages/Search.js
import React, { useState, useEffect } from "react";
import { searchUsers } from "../api";
import { Link } from "react-router-dom";

function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search users when query changes
  useEffect(() => {
    const search = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await searchUsers(searchQuery);
        setSearchResults(response.data);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search - wait 300ms after user stops typing
    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>Search Users</h2>
      
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "20px"
        }}
      />

      {/* Loading Indicator */}
      {loading && <p>Searching...</p>}

      {/* Search Results */}
      <div>
        {searchResults.length === 0 && searchQuery && !loading && (
          <p>No users found</p>
        )}

        {searchResults.map((user) => (
          <div
            key={user.id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "15px",
              border: "1px solid #eee",
              borderRadius: "8px",
              marginBottom: "10px",
              backgroundColor: "white"
            }}
          >
            {/* User Avatar */}
            <img
              src={user.profilePic || "/default-avatar.png"}
              alt={user.name}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                marginRight: "15px",
                objectFit: "cover"
              }}
            />

            {/* User Info */}
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: "0 0 5px 0" }}>{user.name}</h4>
              <p style={{ margin: "0", color: "#666" }}>{user.email}</p>
              {user.bio && (
                <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>{user.bio}</p>
              )}
              
              {/* Stats */}
              <div style={{ display: "flex", gap: "15px", marginTop: "8px", fontSize: "14px" }}>
                <span><strong>{user._count.posts}</strong> posts</span>
                <span><strong>{user._count.followers}</strong> followers</span>
                <span><strong>{user._count.following}</strong> following</span>
              </div>
            </div>

            {/* View Profile Button */}
            <Link
              to={`/profile/${user.id}`}
              style={{
                padding: "8px 16px",
                backgroundColor: "#0095f6",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                fontSize: "14px"
              }}
            >
              View Profile
            </Link>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!searchQuery && (
        <div style={{ textAlign: "center", color: "#666", marginTop: "50px" }}>
          <p>Search for users by name or email</p>
        </div>
      )}
    </div>
  );
}

export default Search;