// src/components/EditProfileModal.js - UPDATE with cropper
import React, { useState } from "react";
import { updateUserProfile } from "../api";
import ImageCropper from "./ImageCropper";

function EditProfileModal({ user, isOpen, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || "",
    isPrivate: user.isPrivate || false,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user.profilePic || "");
  const [loading, setLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState("");

  if (!isOpen) return null;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageUrl) => {
    setPreviewUrl(croppedImageUrl);
    setSelectedFile(true); // Mark that we have a cropped image
    setShowCropper(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile({
        ...formData,
        profilePic: previewUrl, // This is now the cropped image
      });

      onUpdate({
        ...formData,
        profilePic: previewUrl,
      });
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      {/* Cropper Modal */}
      {showCropper && (
        <ImageCropper
          imageSrc={originalImage}
          onCrop={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}

      {/* Edit Profile Modal */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            width: "400px",
            maxWidth: "90vw",
          }}
        >
          <h2 style={{ margin: "0 0 20px 0" }}>Edit Profile</h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {/* Profile Picture Upload */}
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: "15px" }}>
                <img
                  src={previewUrl || "/default-avatar.png"}
                  alt="Profile preview"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #dbdbdb",
                  }}
                />
              </div>

              <label
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  backgroundColor: "#0095f6",
                  color: "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
              </label>

              {previewUrl && previewUrl !== user.profilePic && (
                <p
                  style={{
                    margin: "10px 0 0 0",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  New photo selected
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                }}
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #dbdbdb",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                }}
              >
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell something about yourself..."
                rows="3"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #dbdbdb",
                  borderRadius: "4px",
                  fontSize: "14px",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ fontWeight: "500" }}>Private Account</label>
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isPrivate: e.target.checked,
                  })
                }
                style={{
                  width: "16px",
                  height: "16px",
                }}
              />
              <span style={{ fontSize: "12px", color: "#666" }}>
                {formData.isPrivate
                  ? "Users must request to follow you"
                  : "Anyone can follow you"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "10px",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #dbdbdb",
                  borderRadius: "4px",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: "#0095f6",
                  color: "white",
                  cursor: "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditProfileModal;
