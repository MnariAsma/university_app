const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany();
  console.log("ALL COURSES:", courses);
  const teachers = await prisma.teacher.findMany();
  console.log("ALL TEACHERS:", teachers);
  const users = await prisma.user.findMany({ where: { role: 'TEACHER' }});
  console.log("ALL TEACHER USERS:", users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
