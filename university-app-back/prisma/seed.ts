import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Academic Year ───────────────────────────────────────
  const academicYear = await prisma.academicYear.upsert({
    where: { label: '2024-2025' },
    update: {},
    create: {
      label: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      active: true,
    },
  });
  console.log('✅ AcademicYear:', academicYear.id);

  // ─── Department ──────────────────────────────────────────
  const department = await prisma.department.upsert({
    where: { name: 'Computer Science' },
    update: {},
    create: {
      name: 'Computer Science',
      code: 'INFO',
      description: 'Department of Computer Science and Engineering',
    },
  });
  console.log('✅ Department:', department.id);

  // ─── Program ─────────────────────────────────────────────
  const program = await prisma.program.upsert({
    where: { code: 'GL' },
    update: {},
    create: {
      name: 'Software Engineering',
      code: 'GL',
      level: 'Master',
      description: 'Software Engineering program',
      departmentId: department.id,
    },
  });
  console.log('✅ Program:', program.id);

  // ─── Level ───────────────────────────────────────────────
  const level = await prisma.level.upsert({
    where: { id: 'seed-level-1' },
    update: {},
    create: {
      id: 'seed-level-1',
      name: '1st Year',
      order: 1,
      programId: program.id,
    },
  });
  console.log('✅ Level:', level.id);

  // ─── Group ───────────────────────────────────────────────
  const group = await prisma.group.upsert({
    where: { code: 'GL1-A' },
    update: {},
    create: {
      name: 'Group A',
      code: 'GL1-A',
      levelId: level.id,
    },
  });
  console.log('✅ Group:', group.id);

  // ─── Admin User ──────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@univ.tn' },
    update: {},
    create: {
      email: 'admin@univ.tn',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Super',
      lastName: 'Admin',
      active: true,
    },
  });

  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
    },
  });
  console.log('✅ Admin user: admin@univ.tn / admin123');

  // ─── Summary ─────────────────────────────────────────────
  console.log('\n📋 Use these IDs in your requests:');
  console.log(`  academicYearId : ${academicYear.id}`);
  console.log(`  departmentId   : ${department.id}`);
  console.log(`  programId      : ${program.id}`);
  console.log(`  groupId        : ${group.id}`);
  console.log('\n🔐 Admin login: admin@univ.tn / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
