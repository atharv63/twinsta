// backend/routes/chatRoutes.js
import express from "express";
import {
  getChatsForUser,
  getChatMessages,
  createOrGetChat,
  postMessageToChat
} from "../controllers/chatController.js";

const router = express.Router();

// GET /api/chats/:userId  -> list of chats for user (with last message)
router.get("/:userId", getChatsForUser);

// POST /api/chats/ -> create or fetch chat (body: { userIds: [..], name? })
router.post("/createorget", createOrGetChat);

// GET /api/chats/messages/:chatId?page=1&limit=50
router.get("/messages/:chatId", getChatMessages);

// POST /api/chats/message -> body { chatId, senderId, content, imageUrl? }
router.post("/message", postMessageToChat);

export default router;