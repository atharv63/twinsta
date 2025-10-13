// src/components/CommentSection.js
import React, { useState, useEffect } from "react";
import { createComment, getPostComments } from "../api";

function CommentSection({ post, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const loadComments = async () => {
    try {
      const response = await getPostComments(post.id);
      setComments(response.data);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await createComment(post.id, newComment);
      setComments(prev => [response.data, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "15px" }}>
      {/* Toggle Comments Button */}
      <button
        onClick={() => setShowComments(!showComments)}
        style={{
          background: "none",
          border: "none",
          color: "#666",
          cursor: "pointer",
          fontSize: "14px",
          marginBottom: "10px"
        }}
      >
        💬 {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
      </button>

      {/* Comments Section */}
      {showComments && (
        <div>
          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <img
                src={currentUser.profilePic || "/default-avatar.png"}
                alt={currentUser.name}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />
              <div style={{ flex: 1 }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows="2"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #dbdbdb",
                    borderRadius: "8px",
                    fontSize: "14px",
                    resize: "vertical",
                    fontFamily: "inherit"
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  style={{
                    marginTop: "5px",
                    padding: "6px 12px",
                    backgroundColor: "#0095f6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    opacity: (loading || !newComment.trim()) ? 0.7 : 1
                  }}
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "12px",
                  padding: "8px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px"
                }}
              >
                <img
                  src={comment.author.profilePic || "/default-avatar.png"}
                  alt={comment.author.name}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    objectFit: "cover"
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "13px" }}>{comment.author.name}</strong>
                    <span style={{ fontSize: "11px", color: "#666" }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.4" }}>
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentSection;