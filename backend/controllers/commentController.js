// backend/controllers/commentController.js
import prisma from "../config/db.js";

// CREATE COMMENT
export const createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const authorId = req.user.id;

  console.log("💬 Creating comment for post:", postId);

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: parseInt(authorId),
        postId: parseInt(postId)
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePic: true
          }
        }
      }
    });

    console.log("✅ Comment created successfully");
    res.status(201).json(comment);
  } catch (err) {
    console.error("❌ Create comment error:", err);
    res.status(500).json({ message: "Error creating comment" });
  }
};

// GET COMMENTS FOR A POST
export const getPostComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: parseInt(postId)
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePic: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(comments);
  } catch (err) {
    console.error("❌ Get comments error:", err);
    res.status(500).json({ message: "Error fetching comments" });
  }
};

// DELETE COMMENT
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    // Check if comment exists and user owns it
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.authorId !== parseInt(userId)) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({
      where: { id: parseInt(commentId) }
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("❌ Delete comment error:", err);
    res.status(500).json({ message: "Error deleting comment" });
  }
};