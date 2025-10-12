// backend/controllers/userController.js
import prisma from "../config/db.js";

// SEARCH USERS
export const searchUsers = async (req, res) => {
  const { q } = req.query;

  try {
    if (!q || q.trim() === "") {
      return res.status(200).json([]);
    }

    const users = await prisma.user.findMany({
      where: {
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
        isPrivate: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      },
      take: 20 // Limit results
    });

    res.status(200).json(users);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error during search" });
  }
};

// GET USER PROFILE BY ID
export const getUserProfile = async (req, res) => {
  const { userId } = req.params;

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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Profile error:", err);
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