// backend/controllers/chatController.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Get all chats for a user.
 * Returns chat basic info + last message + participants (other user info)
 */
export const getChatsForUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const chats = await prisma.chat.findMany({
      where: {
        users: {
          some: { userId }
        }
      },
      include: {
        users: {
          include: {
            user: { select: { id: true, name: true, profilePic: true } }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: { id: true, name: true, profilePic: true } } }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    const result = chats.map((c) => {
      const others = c.users.map((cu) => cu.user).filter((u) => u.id !== userId);

      return {
        id: c.id,
        name: c.name || (others.length === 1 ? others[0].name : null),
        participants: c.users.map((cu) => cu.user),
        lastMessage: c.messages[0] || null,
        updatedAt: c.updatedAt
      };
    });

    res.json(result);
  } catch (err) {
    console.error("getChatsForUser error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create (or fetch) a 1:1 chat between two users, or create a group chat.
 * Client sends { userIds: [currentId, otherId], name? }
 */
export const createOrGetChat = async (req, res) => {
  try {
    const { userIds, name } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "userIds required" });
    }

    // Convert all to numbers
    const ids = userIds.map((id) => parseInt(id, 10));
    
    // Validate user IDs
    if (ids.some(isNaN)) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    // For 1:1 chats, check if a chat already exists with exactly these 2 users
    if (ids.length === 2) {
      const existingChat = await prisma.chat.findFirst({
        where: {
          AND: [
            {
              users: {
                every: {
                  userId: { in: ids }
                }
              }
            }
          ]
        },
        include: {
          users: { 
            include: { 
              user: { select: { id: true, name: true, profilePic: true } } 
            } 
          },
          messages: { 
            orderBy: { createdAt: "desc" }, 
            take: 1, 
            include: { sender: true } 
          }
        }
      });

      if (existingChat && existingChat.users.length === 2) {
        return res.json(existingChat);
      }
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        name: name || null,
        users: {
          create: ids.map((uid) => ({ user: { connect: { id: uid } } }))
        }
      },
      include: {
        users: { 
          include: { 
            user: { select: { id: true, name: true, profilePic: true } } 
          } 
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: { id: true, name: true, profilePic: true } } }
        }
      }
    });

    res.status(201).json(chat);
  } catch (err) {
    console.error("createOrGetChat error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get a chat's messages (paginated)
 */
export const getChatMessages = async (req, res) => {
  try {
    const chatId = parseInt(req.params.chatId, 10);
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "50", 10);

    const messages = await prisma.chatMessage.findMany({
      where: { chatId },
      include: { sender: { select: { id: true, name: true, profilePic: true } } },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit
    });

    res.json(messages);
  } catch (err) {
    console.error("getChatMessages error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Post a message to a chat
 */
export const postMessageToChat = async (req, res) => {
  try {
    const { chatId, senderId, content, imageUrl } = req.body;

    if (!chatId || !senderId) return res.status(400).json({ message: "chatId and senderId required" });

    const msg = await prisma.chatMessage.create({
      data: {
        chatId: parseInt(chatId, 10),
        senderId: parseInt(senderId, 10),
        content: content || null,
        imageUrl: imageUrl || null
      },
      include: {
        sender: { select: { id: true, name: true, profilePic: true } }
      }
    });

    // Update chat updatedAt
    await prisma.chat.update({
      where: { id: parseInt(chatId, 10) },
      data: { updatedAt: new Date() }
    });

    res.json(msg);
  } catch (err) {
    console.error("postMessageToChat error:", err);
    res.status(500).json({ message: err.message });
  }
};