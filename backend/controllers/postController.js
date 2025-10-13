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

    // Get all posts with author information
    const allPosts = await prisma.post.findMany({
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

    // Filter posts based on privacy settings
    const visiblePosts = await Promise.all(
      allPosts.map(async (post) => {
        // If post author is current user, always show
        if (post.author.id === currentUserId) {
          return post;
        }

        // If author account is public, show post
        if (!post.author.isPrivate) {
          return post;
        }

        // If author account is private, check if current user is following
        const isFollowing = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: post.author.id
            }
          }
        });

        // Only show post if following the private account
        return isFollowing ? post : null;
      })
    );

    // Remove null values (posts from private accounts that user doesn't follow)
    const filteredPosts = visiblePosts.filter(post => post !== null);

    res.status(200).json(filteredPosts);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};