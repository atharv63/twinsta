// src/pages/Home.js - FIXED IMAGE SIZE
import React, { useState, useEffect } from "react";
import { getPosts, getCurrentUser } from "../api";
import CreatePostModal from "../components/CreatePostModal";
import LikeButton from "../components/LikeButton";
import CommentSection from "../components/CommentSection";

function Home() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const fetchData = async () => {
    try {
      // Get current user info
      const userResponse = await getCurrentUser();
      setCurrentUser(userResponse.data);

      // Get all posts for feed
      const postsResponse = await getPosts();
      setPosts(postsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePostCreated = () => {
    fetchData(); // Refresh posts
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Loading feed...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      {/* Posts Feed */}
      <div>
        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#8e8e8e" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📷</div>
            <h3 style={{ margin: "0 0 10px 0", fontWeight: "300", fontSize: "20px" }}>No Posts Yet</h3>
            <p style={{ margin: 0, fontSize: "14px" }}>When people share photos, they'll appear here.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #dbdbdb",
                borderRadius: "8px",
                marginBottom: "20px",
                backgroundColor: "white"
              }}
            >
              {/* Post Header */}
              <div
                style={{
                  padding: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  borderBottom: "1px solid #efefef",
                  cursor: "pointer"
                }}
                onClick={() => window.location.href = `/profile/${post.author.id}`}
              >
                <img
                  src={post.author.profilePic || "/default-avatar.png"}
                  alt={post.author.name}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    objectFit: "cover"
                  }}
                />
                <strong style={{ fontSize: "14px" }}>{post.author.name}</strong>
              </div>

              {/* Post Image - FIXED SIZE */}
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  style={{
                    width: "100%",
                    maxHeight: "500px", // RESTORED original size
                    objectFit: "cover"  // RESTORED original property
                  }}
                />
              )}

              {/* Post Content */}
              <div style={{ padding: "15px" }}>
                {/* Action Buttons */}
                <div style={{ marginBottom: "10px" }}>
                  <LikeButton post={post} currentUser={currentUser} />
                </div>

                {/* Likes Count */}
                {post._count?.likes > 0 && (
                  <p style={{ 
                    margin: "0 0 8px 0", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    color: "#262626"
                  }}>
                    {post._count.likes} {post._count.likes === 1 ? 'like' : 'likes'}
                  </p>
                )}

                {/* Caption */}
                {post.caption && (
                  <p style={{ 
                    margin: "0 0 8px 0", 
                    fontSize: "14px",
                    lineHeight: "1.4"
                  }}>
                    <strong style={{ marginRight: "5px" }}>{post.author.name}</strong>
                    {post.caption}
                  </p>
                )}

                {/* Comment Section */}
                <CommentSection post={post} currentUser={currentUser} />

                {/* Post Date */}
                <p style={{ 
                  fontSize: "10px", 
                  color: "#8e8e8e", 
                  margin: "8px 0 0 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}

export default Home;