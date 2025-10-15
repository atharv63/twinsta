import express from "express";
import prisma from "../models/prismaClient.js";

const router = express.Router();

// GET /api/chat/search?q=query&currentUserId=123
router.get("/search", async (req, res) => {
  try {
    const { q: query, currentUserId } = req.query;
    
    console.log("🔍 Chat search request:", { query, currentUserId });

    if (!currentUserId) {
      return res.status(400).json({ message: "currentUserId required" });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(currentUserId, 10) },
      include: {
        following: {
          include: {
            following: true
          }
        }
      }
    });

    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    // Get the IDs of users that current user follows
    const followingIds = currentUser.following.map(f => f.following.id);

    let users = [];
    
    if (query && query.trim() !== "") {
      // Search within followed users
      users = await prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
              ]
            },
            {
              id: { in: followingIds }
            }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          profilePic: true,
          isPrivate: true
        }
      });
    } else {
      // If no query, return all followed users
      users = await prisma.user.findMany({
        where: {
          id: { in: followingIds }
        },
        select: {
          id: true,
          name: true,
          email: true,
          profilePic: true,
          isPrivate: true
        }
      });
    }

    console.log("🔍 Found users:", users);
    res.json({ data: users });
  } catch (err) {
    console.error("Chat search error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;