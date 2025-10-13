// backend/controllers/postController.js
import prisma from "../config/db.js";

// CREATE POST
export const createPost = async (req, res) => {
  const { caption, imageUrl } = req.body;
  const authorId = req.user.id;

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
            profilePic: true,
            isPrivate: true // Include this
          }
        },
        likes: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Error creating post" });
  }
};

// GET ALL POSTS (with private account filtering)
export const getPosts = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    console.log("🔍 Fetching posts for user:", currentUserId);

    // Get ALL posts first to see what's in the database
    const allPosts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            isPrivate: true
          }
        }
      }
    });

    console.log("📦 ALL POSTS IN DATABASE:", allPosts);

    // Now get filtered posts
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { authorId: currentUserId },
          { 
            author: { 
              isPrivate: false
            } 
          },
          {
            author: {
              isPrivate: true,
              followers: {
                some: {
                  followerId: currentUserId
                }
              }
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            isPrivate: true
          }
        },
        likes: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    console.log(`📊 FILTERED POSTS: ${posts.length} posts`);
    console.log("👥 Posts details:", posts.map(p => ({
      id: p.id,
      author: p.author.name,
      isPrivate: p.author.isPrivate,
      caption: p.caption
    })));

    res.status(200).json(posts);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE POST
export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const currentUserId = req.user.id;

  try {
    // Find the post first
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) }
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if current user is the post author
    if (post.authorId !== currentUserId) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    // Delete the post (Prisma will handle related likes/comments due to cascade)
    await prisma.post.delete({
      where: { id: parseInt(postId) }
    });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Server error" });
  }
};