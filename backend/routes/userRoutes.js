// backend/routes/userRoutes.js
import express from "express";
import { searchUsers, getUserProfile, getCurrentUser } from "../controllers/userController.js";

const router = express.Router();

// Search users
router.get("/search", searchUsers);

// Get user profile by ID
router.get("/profile/:userId", getUserProfile);

// Get current user profile
router.get("/me", getCurrentUser);

export default router;