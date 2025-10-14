// backend/controllers/chatSearchController.js
import prisma from "../models/prismaClient.js";

/**
 * Search users to chat with — only if the logged-in user follows them
 */
export const searchUsersToChat = async (req, res) => {
  const { q } = req.query;
  const currentUserId = req.user.id;

  try {
    if (!q || q.trim() === "") {
      return res.status(200).json([]);
    }

    // Get IDs of users the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true }
    });
    const followingIds = following.map(f => f.followingId);

    // Search among followed users
    const users = await prisma.user.findMany({
      where: {
        id: { in: followingIds },
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        bio: true
      },
      take: 20
    });

    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error in searchUsersToChat:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Start a chat only if following
 */
export const startChatWithUser = async (req, res) => {
  const { targetUserId } = req.body;
  const currentUserId = req.user.id;

  try {
    if (parseInt(targetUserId) === currentUserId) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }

    // Check follow relationship
    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: parseInt(targetUserId)
        }
      }
    });

    if (!isFollowing) {
      return res.status(403).json({ message: "You can only chat with users you follow" });
    }

    // Check if chat already exists
    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { user1Id: currentUserId, user2Id: parseInt(targetUserId) },
          { user1Id: parseInt(targetUserId), user2Id: currentUserId }
        ]
      }
    });

    // If not, create new chat
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          user1Id: currentUserId,
          user2Id: parseInt(targetUserId)
        }
      });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error("❌ Error in startChatWithUser:", err);
    res.status(500).json({ message: "Server error while starting chat" });
  }
};
