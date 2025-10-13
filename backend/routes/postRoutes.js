// backend/routes/postRoutes.js
import express from "express";
import { createPost, getPosts } from "../controllers/postController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, createPost);
router.get("/", getPosts);

export default router;