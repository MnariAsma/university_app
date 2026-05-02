import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, CourseType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash('123456', 10);

  // =====================================================
  // Academic Year
  // =====================================================
  const academicYear = await prisma.academicYear.upsert({
    where: { label: '2025-2026' },
    update: {},
    create: {
      label: '2025-2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-06-30'),
      active: true,
    },
  });

  // =====================================================
  // Department
  // =====================================================
  const department = await prisma.department.upsert({
    where: { code: 'INFO' },
    update: {},
    create: {
      name: 'Informatique',
      code: 'INFO',
    },
  });

  // =====================================================
  // Program
  // =====================================================
  const program = await prisma.program.upsert({
    where: { code: 'ING-INFO' },
    update: {},
    create: {
      name: 'Ingénierie Informatique',
      code: 'ING-INFO',
      level: 'ING',
      departmentId: department.id,
    },
  });

  // =====================================================
  // Level
  // =====================================================
  const level = await prisma.level.create({
    data: {
      name: '2ème année',
      order: 2,
      programId: program.id,
    },
  });

  // =====================================================
  // Group
  // =====================================================
  const group = await prisma.group.create({
    data: {
      name: 'Groupe 1',
      code: 'Gr-1',
      levelId: level.id,
    },
  });

  // =====================================================
  // Subjects
  // =====================================================
  const subject1 = await prisma.subject.create({
    data: {
      name: 'Programmation Web',
      code: 'WEB02',
      semester: 1,
      programId: program.id,
    },
  });

  const subject2 = await prisma.subject.create({
    data: {
      name: 'Base de Données',
      code: 'DB02',
      semester: 1,
      programId: program.id,
    },
  });

  // =====================================================
  // Teacher
  // =====================================================
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher1@test.com',
      password,
      role: Role.TEACHER,
      firstName: 'Ali',
      lastName: 'Teacher',
    },
  });

  const teacher = await prisma.teacher.create({
    data: {
      matricule: 'T-002',
      userId: teacherUser.id,
      departmentId: department.id,
      specialty: 'Informatique',
    },
  });

  // =====================================================
  // Assign subjects to teacher
  // =====================================================
  await prisma.teacherSubject.createMany({
    data: [
      {
        teacherId: teacher.id,
        subjectId: subject1.id,
        academicYearId: academicYear.id,
        programId: program.id,
        levelId: level.id,
        courseType: CourseType.COURSE,
      },
      {
        teacherId: teacher.id,
        subjectId: subject2.id,
        academicYearId: academicYear.id,
        programId: program.id,
        levelId: level.id,
        courseType: CourseType.COURSE,
      },
    ],
  });

  // =====================================================
  // Students
  // =====================================================
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `students${i}@test.com`,
        password,
        role: Role.STUDENT,
        firstName: `Student${i}`,
        lastName: 'Test',
      },
    });

    await prisma.student.create({
      data: {
        matricule: `S-000${i}`,
        userId: user.id,
        departmentId: department.id,
        programId: program.id,
        groupId: group.id,
        academicYearId: academicYear.id,
      },
    });
  }

  console.log('✅ SEED terminé avec succès');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
