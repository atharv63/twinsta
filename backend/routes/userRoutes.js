// backend/routes/userRoutes.js
import express from "express";
import {
  searchUsers,
  getUserProfile,
  getCurrentUser,
  updateProfile,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  followUser,
  unfollowUser,
  checkFollowing,
  cancelFollowRequest,
  getPendingFollowRequests,
  approveFollowRequest,
  rejectFollowRequest
} from "../controllers/userController.js";

const router = express.Router();

// Search users
router.get("/search", authenticateToken, searchUsers); // ADD middleware

// Get user profile by ID
router.get("/profile/:userId", authenticateToken, getUserProfile); // ADD middleware

// Get current user profile
router.get("/me", authenticateToken, getCurrentUser); // ADD middleware

router.put("/profile", authenticateToken, updateProfile);

router.post("/follow/:userId", authenticateToken, followUser);

router.delete("/unfollow/:userId", authenticateToken, unfollowUser);

router.get("/follows/:userId", authenticateToken, checkFollowing);

router.delete("/follow-request/:userId", authenticateToken, cancelFollowRequest);

router.get("/follow-requests", authenticateToken, getPendingFollowRequests);

router.post("/follow-requests/:requestId/approve", authenticateToken, approveFollowRequest);

router.post("/follow-requests/:requestId/reject", authenticateToken, rejectFollowRequest);


export default router;
