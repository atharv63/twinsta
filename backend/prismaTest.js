// prismaTest.js
import { PrismaClient } from "@prisma/client"; // ESM import
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Prisma client:", !!prisma);
    console.log("Chat model available:", !!prisma.chat);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
