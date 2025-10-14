// backend/routes/chatRoutes.js
import express from "express";
import {
  getChatsForUser,
  getChatMessages,
  createOrGetChat,
  postMessageToChat
} from "../controllers/chatController.js";
import prisma from "../models/prismaClient.js";

const router = express.Router();

// Debug route to test database connection
router.get("/debug/db-test", async (req, res) => {
  try {
    console.log("Testing database connection...");
    const result = await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      success: true, 
      message: "Database connected successfully",
      prisma: !!prisma,
      chatModel: !!prisma.chat
    });
  } catch (error) {
    console.error("Database test failed:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      prisma: !!prisma
    });
  }
});

// GET /api/chats/:userId  -> list of chats for user (with last message)
router.get("/:userId", getChatsForUser);

// POST /api/chats/ -> create or fetch chat (body: { userIds: [..], name? })
router.post("/", createOrGetChat);

// GET /api/chats/messages/:chatId?page=1&limit=50
router.get("/messages/:chatId", getChatMessages);

// POST /api/chats/message -> body { chatId, senderId, content, imageUrl? }
router.post("/message", postMessageToChat);

export default router;