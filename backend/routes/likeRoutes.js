// backend/routes/likeRoutes.js
import express from "express";
import { likePost, getPostLikes } from "../controllers/likeController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/post/:postId", authenticateToken, likePost);
router.get("/post/:postId", getPostLikes);

export default router;