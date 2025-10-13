// backend/controllers/userController.js
import prisma from "../config/db.js";

// SEARCH USERS
export const searchUsers = async (req, res) => {
  const { q } = req.query;

  console.log("🔍 SEARCH REQUEST RECEIVED - Query:", q);

  try {
    if (!q || q.trim() === "") {
      console.log("Empty search query");
      return res.status(200).json([]);
    }

    // For MySQL, we need to handle case-insensitive search differently
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { 
            name: { 
              contains: q
              // Remove mode: 'insensitive' for MySQL
            } 
          },
          { 
            email: { 
              contains: q
              // Remove mode: 'insensitive' for MySQL
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

    console.log("📊 USERS FOUND:", users.length);
    console.log("👥 USERS:", users.map(u => ({ name: u.name, email: u.email })));
    
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ message: "Server error during search" });
  }
};

// GET USER PROFILE BY ID
export const getUserProfile = async (req, res) => {
  const { userId } = req.params;

  console.log("🔍 Fetching profile for user ID:", userId);

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

    console.log("📊 User found:", user ? `Yes (${user.name})` : "No");
    console.log("📦 User posts:", user?.posts);
    console.log("📦 User posts length:", user?.posts?.length);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
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
  const { name, bio, profilePic } = req.body;

  try {
    console.log("🔄 Updating profile for user:", userId);
    console.log("📝 Update data:", { name, bio, profilePic: profilePic ? "has image" : "no image" });

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        name,
        bio,
        profilePic
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
      }
    });

    console.log("✅ Profile updated successfully");
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};