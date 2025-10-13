// backend/controllers/postController.js
import prisma from "../config/db.js";

// CREATE POST
export const createPost = async (req, res) => {
  const { caption, imageUrl } = req.body;
  const authorId = req.user.id;

  console.log("📝 Creating post for user:", authorId);
  console.log("🖼️ Post data:", { caption, imageUrl: imageUrl ? "has image" : "no image" });

  try {
    const post = await prisma.post.create({
      data: {
        caption,
        imageUrl,
        authorId: parseInt(authorId)
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePic: true
          }
        },
        likes: true,
        _count: {
          select: {
            likes: true
          }
        }
      }
    });

    console.log("✅ Post created successfully:", post.id);
    res.status(201).json(post);
  } catch (err) {
    console.error("❌ Create post error:", err);
    res.status(500).json({ message: "Error creating post" });
  }
};

// GET ALL POSTS (for feed)
export const getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePic: true
          }
        },
        likes: true,
        _count: {
          select: {
            likes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(posts);
  } catch (err) {
    console.error("❌ Get posts error:", err);
    res.status(500).json({ message: "Error fetching posts" });
  }
};