import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const dummyUsers = [
  {
    name: "Alex Johnson",
    email: "alex@example.com",
    password: "password123",
    bio: "Photography enthusiast 📸",
    profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Sarah Miller",
    email: "sarah@example.com",
    password: "password123", 
    bio: "Travel lover 🌍 | Foodie 🍕",
    profilePic: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Mike Chen",
    email: "mike@example.com",
    password: "password123",
    bio: "Tech geek 💻 | Coffee addict ☕",
    profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Emma Wilson",
    email: "emma@example.com", 
    password: "password123",
    bio: "Artist 🎨 | Dreamer 🌙",
    profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "David Brown",
    email: "david@example.com",
    password: "password123",
    bio: "Fitness coach 💪 | Healthy living",
    profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  }
];

async function seedUsers() {
  try {
    console.log('🌱 Seeding dummy users...');

    for (const userData of dummyUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Create user
        await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword
          }
        });
        console.log(`✅ Created user: ${userData.name}`);
      } else {
        console.log(`⚠️ User already exists: ${userData.name}`);
      }
    }

    console.log(' Seeding completed!');
  } catch (error) {
    console.error(' Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
