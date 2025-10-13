// backend/routes/commentRoutes.js
import express from "express";
import { createComment, getPostComments, deleteComment } from "../controllers/commentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/post/:postId", authenticateToken, createComment);
router.get("/post/:postId", getPostComments);
router.delete("/:commentId", authenticateToken, deleteComment);

export default router;