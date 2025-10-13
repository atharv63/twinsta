// src/components/LikeButton.js
import React, { useState, useEffect } from "react";
import { likePost, getPostLikes } from "../api";

function LikeButton({ post, currentUser }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [loading, setLoading] = useState(false);

  // Check if current user has liked this post
  useEffect(() => {
    if (post.likes && currentUser) {
      const userLike = post.likes.find(like => like.userId === currentUser.id);
      setIsLiked(!!userLike);
    }
  }, [post.likes, currentUser]);

  const handleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await likePost(post.id);
      
      if (response.data.liked) {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      } else {
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        padding: "5px",
        opacity: loading ? 0.6 : 1
      }}
      title={isLiked ? "Unlike" : "Like"}
    >
      <span style={{ 
        color: isLiked ? "#ed4956" : "#262626",
        marginRight: "5px"
      }}>
        {isLiked ? "❤️" : "🤍"}
      </span>
      {likeCount} {likeCount === 1 ? 'like' : 'likes'}
    </button>
  );
}

export default LikeButton;