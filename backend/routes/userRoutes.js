// backend/routes/userRoutes.js
import express from "express";
import { searchUsers, getUserProfile, getCurrentUser, updateProfile } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Search users
router.get("/search", authenticateToken, searchUsers); // ADD middleware

// Get user profile by ID  
router.get("/profile/:userId", authenticateToken, getUserProfile); // ADD middleware

// Get current user profile
router.get("/me", authenticateToken, getCurrentUser); // ADD middleware

router.put("/profile", authenticateToken, updateProfile);

export default router;