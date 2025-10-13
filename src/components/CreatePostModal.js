// src/components/CreatePostModal.js - UPDATED with compression
import React, { useState } from "react";
import { createPost } from "../api";

function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;
const compressImage = (base64String, maxDimension = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64String;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        // Horizontal image - limit by width
        if (width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        }
      } else {
        // Vertical image - limit by height (more aggressive)
        if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      console.log(`📊 Image compressed: ${width}x${height} (${Math.round(compressedBase64.length / 1024)}KB)`);
      resolve(compressedBase64);
    };
    
    img.onerror = () => {
      console.log("❌ Compression failed, using original");
      resolve(base64String);
    };
  });
};


  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (optional)
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("Please select an image smaller than 10MB");
        return;
      }
      
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select an image");
      return;
    }

    setLoading(true);
    
    try {
      // Compress the image before sending
      console.log("🔄 Compressing image...");
      const compressedImage = await compressImage(previewUrl, 800, 0.7);
      console.log("✅ Image compressed");
      
      await createPost({
        caption,
        imageUrl: compressedImage
      });
      
      // Reset form
      setCaption("");
      setSelectedFile(null);
      setPreviewUrl("");
      
      onPostCreated();
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. The image might be too large.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCaption("");
    setSelectedFile(null);
    setPreviewUrl("");
    onClose();
  };

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
        padding: "30px",
        borderRadius: "12px",
        width: "500px",
        maxWidth: "90vw",
        maxHeight: "90vh",
        overflow: "auto"
      }}>
        <h2 style={{ margin: "0 0 20px 0", textAlign: "center" }}>Create New Post</h2>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Image Upload */}
          <div style={{ textAlign: "center" }}>
            {previewUrl ? (
              <div style={{ marginBottom: "15px" }}>
                <img
                  src={previewUrl}
                  alt="Post preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    border: "1px solid #dbdbdb"
                  }}
                />
              </div>
            ) : (
              <div style={{
                border: "2px dashed #dbdbdb",
                borderRadius: "8px",
                padding: "40px",
                textAlign: "center",
                marginBottom: "15px"
              }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>📷</div>
                <p style={{ margin: 0, color: "#666" }}>Select a photo to share</p>
              </div>
            )}
            
            <label style={{
              display: "inline-block",
              padding: "10px 20px",
              backgroundColor: "#0095f6",
              color: "white",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              {previewUrl ? "Change Photo" : "Select Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </label>
            
            <p style={{ fontSize: "12px", color: "#666", margin: "10px 0 0 0" }}>
              Images will be compressed to reduce size
            </p>
          </div>

          {/* Caption Input */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows="3"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #dbdbdb",
                borderRadius: "8px",
                fontSize: "14px",
                resize: "vertical",
                fontFamily: "inherit"
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "10px 20px",
                border: "1px solid #dbdbdb",
                borderRadius: "8px",
                backgroundColor: "transparent",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFile}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#0095f6",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                opacity: (loading || !selectedFile) ? 0.7 : 1
              }}
            >
              {loading ? "Sharing..." : "Share Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;