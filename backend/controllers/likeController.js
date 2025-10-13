// backend/controllers/likeController.js
import prisma from "../config/db.js";

// LIKE A POST
export const likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  console.log("❤️ Liking post:", postId, "by user:", userId);

  try {
    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: parseInt(userId),
          postId: parseInt(postId)
        }
      }
    });

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });
      console.log("💔 Post unliked");
      return res.status(200).json({ liked: false });
    }

    // Like the post
    await prisma.like.create({
      data: {
        userId: parseInt(userId),
        postId: parseInt(postId)
      }
    });

    console.log("❤️ Post liked successfully");
    res.status(201).json({ liked: true });
  } catch (err) {
    console.error("❌ Like error:", err);
    res.status(500).json({ message: "Error liking post" });
  }
};

// GET LIKES FOR A POST
export const getPostLikes = async (req, res) => {
  const { postId } = req.params;

  try {
    const likes = await prisma.like.findMany({
      where: {
        postId: parseInt(postId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePic: true
          }
        }
      }
    });

    res.status(200).json(likes);
  } catch (err) {
    console.error("❌ Get likes error:", err);
    res.status(500).json({ message: "Error fetching likes" });
  }
};