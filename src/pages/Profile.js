// src/pages/Profile.js
import React, { useState, useEffect } from "react";
import {
  getCurrentUser,
  getUserProfile,
  followUser,
  unfollowUser,
  checkFollowing,
  cancelFollowRequest,
} from "../api";
import { useParams, useLocation } from "react-router-dom";
import EditProfileModal from "../components/EditProfileModal";

function Profile() {
  const { userId } = useParams();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false); // ADD THIS LINE

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let userData;

        if (userId) {
          console.log("🟢 FETCHING USER PROFILE FOR ID:", userId);
          userData = await getUserProfile(userId);
          setIsOwnProfile(false);

          // Check if current user is following this profile
          const followStatus = await checkFollowing(userId);
          setIsFollowing(followStatus.data.isFollowing);
          setHasPendingRequest(followStatus.data.hasPendingRequest); // ADD THIS LINE
        } else {
          console.log("🟢 FETCHING CURRENT USER PROFILE");
          userData = await getCurrentUser();
          setIsOwnProfile(true);
        }

        setUser(userData.data);
      } catch (error) {
        console.error("❌ ERROR IN FETCH PROFILE:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, location.pathname]);

  const handleFollow = async () => {
    console.log("🟢🟢🟢 HANDLE FOLLOW FUNCTION CALLED 🟢🟢🟢");
    if (!userId) {
      console.log("❌ No userId found");
      return;
    }

    console.log("🟡 Button clicked - Current state:", {
      isFollowing,
      hasPendingRequest,
      userId,
    });
    setFollowLoading(true);
    try {
      // If there's a pending request, cancel it
      if (hasPendingRequest) {
        console.log("🟡 Cancelling follow request for user:", userId);
        await cancelFollowRequest(userId);
        setHasPendingRequest(false);
        console.log("✅ Follow request cancelled");
      }
      // If already following, unfollow
      else if (isFollowing) {
        console.log("🟡 Unfollowing user:", userId);
        await unfollowUser(userId);
        setIsFollowing(false);
        setUser((prev) => ({
          ...prev,
          _count: {
            ...prev._count,
            followers: prev._count.followers - 1,
          },
        }));
        console.log("✅ Unfollowed successfully");
      }
      // If not following, send follow request
      else {
        console.log("🟡 Sending follow request to user:", userId);
        const response = await followUser(userId);
        console.log("Follow response:", response);

        if (response.data.requiresApproval) {
          setHasPendingRequest(true);
          console.log("✅ Follow request sent");
        } else {
          setIsFollowing(true);
          setUser((prev) => ({
            ...prev,
            _count: {
              ...prev._count,
              followers: prev._count.followers + 1,
            },
          }));
          console.log("✅ Followed directly");
        }
      }
    } catch (error) {
      console.error("❌ Follow error details:", error);
      console.error("❌ Error response:", error.response);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to update follow status");
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleProfileUpdate = (updatedData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedData,
    }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "935px", margin: "auto", padding: "20px" }}>
      {/* Profile Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "40px 0",
          borderBottom: "1px solid #dbdbdb",
          marginBottom: "40px",
        }}
      >
        {/* Profile Picture */}
        <div style={{ marginRight: "80px" }}>
          <img
            src={user.profilePic || "/default-avatar.png"}
            alt={user.name}
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #dbdbdb",
            }}
          />
        </div>

        {/* Profile Info */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
              gap: "20px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "300",
              }}
            >
              {user.name}
            </h2>

            {isOwnProfile ? (
              <button
                onClick={() => setIsEditModalOpen(true)}
                style={{
                  padding: "5px 9px",
                  border: "1px solid #dbdbdb",
                  borderRadius: "4px",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollow}
                disabled={followLoading} // ONLY disable when loading, not for requested state
                style={{
                  padding: "5px 9px",
                  border:
                    isFollowing || hasPendingRequest
                      ? "1px solid #dbdbdb"
                      : "none",
                  borderRadius: "4px",
                  backgroundColor:
                    isFollowing || hasPendingRequest
                      ? "transparent"
                      : "#0095f6",
                  color: isFollowing || hasPendingRequest ? "#262626" : "white",
                  cursor: followLoading ? "default" : "pointer",
                  fontWeight: "600",
                  opacity: followLoading ? 0.7 : 1,
                }}
              >
                {followLoading
                  ? "..."
                  : hasPendingRequest
                  ? "Requested"
                  : isFollowing
                  ? "Following"
                  : "Follow"}
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
            <span>
              <strong>{user._count.posts}</strong> posts
            </span>
            <span>
              <strong>{user._count.followers}</strong> followers
            </span>
            <span>
              <strong>{user._count.following}</strong> following
            </span>
          </div>

          {/* Bio */}
          <div>
            <h4 style={{ margin: "0 0 5px 0" }}>{user.name}</h4>
            {user.bio && (
              <p style={{ margin: 0, lineHeight: "1.5" }}>{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid - WITH PRIVATE ACCOUNT CHECK */}
      <div>
        {user.canSeePosts === false && !isOwnProfile ? (
          <div
            style={{ textAlign: "center", padding: "60px", color: "#8e8e8e" }}
          >
            <div style={{ fontSize: "40px", marginBottom: "20px" }}>🔒</div>
            <h3 style={{ margin: "0 0 10px 0" }}>This account is private</h3>
            <p style={{ margin: 0 }}>
              Follow this account to see their photos and videos.
            </p>
          </div>
        ) : user.posts && user.posts.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "4px",
            }}
          >
            {user.posts.map((post) => (
              <div
                key={post.id}
                style={{
                  aspectRatio: "1",
                  backgroundColor: "#fafafa",
                  border: "1px solid #dbdbdb",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "#8e8e8e",
                    }}
                  >
                    No Image
                  </div>
                )}

                {/* Hover Overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                >
                  <div style={{ display: "flex", gap: "20px" }}>
                    <span>❤️ {post._count?.likes || 0}</span>
                    <span>💬 {post._count?.comments || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{ textAlign: "center", padding: "60px", color: "#8e8e8e" }}
          >
            <div style={{ fontSize: "40px", marginBottom: "20px" }}>📷</div>
            <h3 style={{ margin: "0 0 10px 0" }}>No Posts Yet</h3>
            <p style={{ margin: 0 }}>
              When you share photos, they will appear here.
            </p>
          </div>
        )}
      </div>

      <EditProfileModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}

export default Profile;
