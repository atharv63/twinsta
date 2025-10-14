// backend/routes/postRoutes.js
import express from "express";
import { createPost, getPosts, deletePost } from "../controllers/postController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, createPost);
router.get("/", authenticateToken, getPosts);
router.delete("/:postId", authenticateToken, deletePost);

export default router;