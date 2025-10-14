// backend/routes/chatSearchRoutes.js
import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { searchUsersToChat, startChatWithUser } from "../controllers/chatSearchController.js";

const router = express.Router();

router.get("/search", authenticateToken, searchUsersToChat);
router.post("/start", authenticateToken, startChatWithUser);

export default router;
