import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany();
  console.log("All courses:", courses);
  const teachers = await prisma.teacher.findMany();
  console.log("All teachers:", teachers);
}

main().catch(console.error).finally(() => prisma.$disconnect());
