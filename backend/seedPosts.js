import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dummyPosts = [
  {
    caption: "Beautiful sunset at the beach! 🌅 #sunset #beach",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=500&fit=crop"
  },
  {
    caption: "Coffee and code ☕💻 #programming #coffee",
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=500&fit=crop"
  },
  {
    caption: "Morning workout done! 💪 #fitness #gym",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop"
  },
  {
    caption: "New painting I'm working on 🎨 #art #painting",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop"
  },
  {
    caption: "Exploring new places! 🌍 #travel #adventure",
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=500&fit=crop"
  }
];

async function seedPosts() {
  try {
    console.log('🌱 Seeding dummy posts...');

    // Get all users
    const users = await prisma.user.findMany();
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const postData = dummyPosts[i % dummyPosts.length]; // Cycle through posts
      
      await prisma.post.create({
        data: {
          caption: postData.caption,
          imageUrl: postData.imageUrl,
          authorId: user.id
        }
      });
      console.log(`✅ Created post for: ${user.name}`);
    }

    console.log('🎉 Post seeding completed!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPosts();