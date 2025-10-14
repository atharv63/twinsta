// backend/controllers/userController.js
import prisma from "../config/db.js";
// import prisma from "../models/prismaClient.js";

// SEARCH USERS
export const searchUsers = async (req, res) => {
  const { q } = req.query;
  const currentUserId = req.user.id;

  console.log("🔍 SEARCH REQUEST RECEIVED - Query:", q, "by user:", currentUserId);

  try {
    if (!q || q.trim() === "") {
      console.log("Empty search query");
      return res.status(200).json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { 
            name: { 
              contains: q
            } 
          },
          { 
            email: { 
              contains: q
            } 
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        bio: true,
        isPrivate: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      },
      take: 20
    });

    // Add follow status for each user in search results
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        let isFollowing = false;
        let hasPendingRequest = false;
        
        if (user.id !== currentUserId) {
          // Check if following
          const follow = await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: user.id
              }
            }
          });
          isFollowing = !!follow;

          // Check if pending follow request (for private accounts)
          if (user.isPrivate && !isFollowing) {
            const request = await prisma.followRequest.findUnique({
              where: {
                followerId_followingId: {
                  followerId: currentUserId,
                  followingId: user.id
                }
              }
            });
            hasPendingRequest = !!request && request.status === 'PENDING';
          }
        }

        return {
          ...user,
          isFollowing,
          hasPendingRequest,
          isCurrentUser: user.id === currentUserId
        };
      })
    );

    console.log("📊 USERS FOUND:", usersWithStatus.length);
    
    res.status(200).json(usersWithStatus);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ message: "Server error during search" });
  }
};

// GET USER PROFILE BY ID (with private account logic)
export const getUserProfile = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  console.log("🔍 Fetching profile for user ID:", userId, "by user:", currentUserId);

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        bio: true,
        isPrivate: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      }
    });

    console.log("📊 User found:", user ? `Yes (${user.name})` : "No");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current user can see posts
    let canSeePosts = false;
    
    if (parseInt(userId) === currentUserId) {
      // Own profile - can see all posts
      canSeePosts = true;
    } else if (!user.isPrivate) {
      // Public account - anyone can see posts
      canSeePosts = true;
    } else {
      // Private account - check if following
      const isFollowing = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: parseInt(userId)
          }
        }
      });
      canSeePosts = !!isFollowing;
    }

    console.log("👀 Can see posts:", canSeePosts);

    // Get posts only if user can see them
    let posts = [];
    if (canSeePosts) {
      posts = await prisma.post.findMany({
        where: { authorId: parseInt(userId) },
        orderBy: { createdAt: 'desc' },
        include: {
          likes: true,
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      });
    }

    console.log("📦 Posts to show:", posts.length);

    res.status(200).json({
      ...user,
      posts,
      canSeePosts // Send this to frontend
    });
  } catch (err) {
    console.error("❌ Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET CURRENT USER PROFILE
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        bio: true,
        isPrivate: true,
        posts: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            likes: true,
            _count: {
              select: {
                likes: true,
                comments: true
              }
            }
          }
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      }
    });

    res.status(200).json(user);
  } catch (err) {
    console.error("Current user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, bio, profilePic, isPrivate } = req.body; // ADD isPrivate

  try {
    console.log("🔄 Updating profile for user:", userId);
    console.log("📝 Update data:", { name, bio, profilePic: profilePic ? "has image" : "no image", isPrivate });

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        name,
        bio,
        profilePic,
        isPrivate: isPrivate || false // ADD this line
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        bio: true,
        isPrivate: true, // ADD this
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      }
    });

    console.log("✅ Profile updated successfully");
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

export const followUser = async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user.id;

  try {
    // Can't follow yourself
    if (parseInt(userId) === followerId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: parseInt(userId)
        }
      }
    });

    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Check if there's already a pending follow request
    const existingRequest = await prisma.followRequest.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: parseInt(userId)
        }
      }
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Follow request already sent" });
    }

    // PUBLIC/PRIVATE LOGIC
    if (userToFollow.isPrivate) {
      // For private accounts - create follow request
      const followRequest = await prisma.followRequest.create({
        data: {
          followerId: followerId,
          followingId: parseInt(userId),
          status: 'PENDING'
        }
      });

      return res.status(200).json({ 
        message: "Follow request sent", 
        isPrivate: true,
        requiresApproval: true,
        requestId: followRequest.id
      });
    } else {
      // For public accounts - follow directly
      const follow = await prisma.follow.create({
        data: {
          followerId: followerId,
          followingId: parseInt(userId)
        }
      });

      return res.status(200).json({ 
        message: "Followed successfully", 
        follow,
        isPrivate: false 
      });
    }
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UNFOLLOW USER
export const unfollowUser = async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user.id;

  try {
    const follow = await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: parseInt(userId)
        }
      }
    });

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkFollowing = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  try {
    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: parseInt(userId)
        }
      }
    });

    // Check if there's a pending follow request
    const pendingRequest = await prisma.followRequest.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: parseInt(userId)
        }
      }
    });

    res.status(200).json({ 
      isFollowing: !!existingFollow,
      hasPendingRequest: !!pendingRequest && pendingRequest.status === 'PENDING'
    });
  } catch (err) {
    console.error("Check following error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// CANCEL FOLLOW REQUEST
export const cancelFollowRequest = async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user.id;

  try {
    const followRequest = await prisma.followRequest.delete({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: parseInt(userId)
        }
      }
    });

    res.status(200).json({ message: "Follow request cancelled" });
  } catch (err) {
    console.error("Cancel follow request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET PENDING FOLLOW REQUESTS
export const getPendingFollowRequests = async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const pendingRequests = await prisma.followRequest.findMany({
      where: {
        followingId: currentUserId,
        status: 'PENDING'
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePic: true,
            bio: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(pendingRequests);
  } catch (err) {
    console.error("Get pending requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// APPROVE FOLLOW REQUEST
export const approveFollowRequest = async (req, res) => {
  const { requestId } = req.params;
  const currentUserId = req.user.id;

  try {
    // Find the request
    const followRequest = await prisma.followRequest.findUnique({
      where: { id: parseInt(requestId) }
    });

    if (!followRequest || followRequest.followingId !== currentUserId) {
      return res.status(404).json({ message: "Follow request not found" });
    }

    // Create the follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId: followRequest.followerId,
        followingId: followRequest.followingId
      }
    });

    // Delete the request
    await prisma.followRequest.delete({
      where: { id: parseInt(requestId) }
    });

    res.status(200).json({ message: "Follow request approved", follow });
  } catch (err) {
    console.error("Approve request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// REJECT FOLLOW REQUEST
export const rejectFollowRequest = async (req, res) => {
  const { requestId } = req.params;
  const currentUserId = req.user.id;

  try {
    const followRequest = await prisma.followRequest.findUnique({
      where: { id: parseInt(requestId) }
    });

    if (!followRequest || followRequest.followingId !== currentUserId) {
      return res.status(404).json({ message: "Follow request not found" });
    }

    await prisma.followRequest.delete({
      where: { id: parseInt(requestId) }
    });

    res.status(200).json({ message: "Follow request rejected" });
  } catch (err) {
    console.error("Reject request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// SEARCH USERS TO CHAT (only show users the current user follows)
export const searchChatUsers = async (req, res) => {
  const { q } = req.query;
  const currentUserId = req.user.id;

  try {
    if (!q || q.trim() === "") {
      return res.status(200).json([]);
    }

    // Get all users current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    const followingIds = following.map(f => f.followingId);

    // Search only among followed users
    const users = await prisma.user.findMany({
      where: {
        id: { in: followingIds },
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        bio: true,
      },
      take: 20
    });

    res.status(200).json(users);
  } catch (err) {
    console.error("❌ searchChatUsers error:", err);
    res.status(500).json({ message: "Server error during chat search" });
  }
};
