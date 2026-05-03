import dotenv from "dotenv";
dotenv.config();

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, CourseType, SessionType } from '@prisma/client';
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
  let level;
  const existingLevel = await prisma.level.findFirst({
    where: { name: '2ème année', programId: program.id },
  });
  if (existingLevel) {
    level = existingLevel;
  } else {
    level = await prisma.level.create({
      data: { name: '2ème année', order: 2, programId: program.id },
    });
  }

  // =====================================================
  // Group
  // =====================================================
  let group;
  const existingGroup = await prisma.group.findUnique({ where: { code: 'Gr-1' } });
  if (existingGroup) {
    group = existingGroup;
  } else {
    group = await prisma.group.create({
      data: { name: 'Groupe 1', code: 'Gr-1', levelId: level.id },
    });
  }

  // =====================================================
  // Room
  // =====================================================
  let room;
  const existingRoom = await prisma.room.findUnique({ where: { name: 'Salle 101' } });
  if (existingRoom) {
    room = existingRoom;
  } else {
    room = await prisma.room.create({
      data: { name: 'Salle 101', capacity: 30, building: 'Bâtiment A' },
    });
  }

  // =====================================================
  // Subjects
  // =====================================================
  let subject1;
  const existingSubject1 = await prisma.subject.findUnique({ where: { code: 'WEB02' } });
  if (existingSubject1) {
    subject1 = existingSubject1;
  } else {
    subject1 = await prisma.subject.create({
      data: { name: 'Programmation Web', code: 'WEB02', semester: 1, programId: program.id },
    });
  }

  let subject2;
  const existingSubject2 = await prisma.subject.findUnique({ where: { code: 'DB02' } });
  if (existingSubject2) {
    subject2 = existingSubject2;
  } else {
    subject2 = await prisma.subject.create({
      data: { name: 'Base de Données', code: 'DB02', semester: 1, programId: program.id },
    });
  }

  // =====================================================
  // Admin User (needed for Session.adminId)
  // =====================================================
  let adminUser;
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
  if (existingAdmin) {
    adminUser = existingAdmin;
  } else {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password,
        role: Role.ADMIN,
        firstName: 'Admin',
        lastName: 'Test',
        admin: { create: {} },
      },
      include: { admin: true },
    });
  }

  const admin = await prisma.admin.findUnique({ where: { userId: adminUser.id } });

  // =====================================================
  // Teacher
  // =====================================================
  let teacherUser;
  let teacher;
  const existingTeacherUser = await prisma.user.findUnique({ where: { email: 'teacher1@test.com' } });
  if (existingTeacherUser) {
    teacherUser = existingTeacherUser;
    teacher = await prisma.teacher.findUnique({ where: { userId: teacherUser.id } });
  } else {
    teacherUser = await prisma.user.create({
      data: {
        email: 'teacher1@test.com',
        password,
        role: Role.TEACHER,
        firstName: 'Ali',
        lastName: 'Teacher',
      },
    });
    teacher = await prisma.teacher.create({
      data: {
        matricule: 'T-002',
        userId: teacherUser.id,
        departmentId: department.id,
        specialty: 'Informatique',
      },
    });
  }

  // =====================================================
  // Assign subjects to teacher
  // =====================================================
  const existingTs1 = await prisma.teacherSubject.findFirst({
    where: { teacherId: teacher!.id, subjectId: subject1.id, academicYearId: academicYear.id },
  });
  if (!existingTs1) {
    await prisma.teacherSubject.create({
      data: {
        teacherId: teacher!.id,
        subjectId: subject1.id,
        academicYearId: academicYear.id,
        courseType: CourseType.COURSE,
      },
    });
  }

  const existingTs2 = await prisma.teacherSubject.findFirst({
    where: { teacherId: teacher!.id, subjectId: subject2.id, academicYearId: academicYear.id },
  });
  if (!existingTs2) {
    await prisma.teacherSubject.create({
      data: {
        teacherId: teacher!.id,
        subjectId: subject2.id,
        academicYearId: academicYear.id,
        courseType: CourseType.COURSE,
      },
    });
  }

  // =====================================================
  // Students (5 students)
  // =====================================================
  const studentIds: string[] = [];

  for (let i = 1; i <= 5; i++) {
    const email = `students${i}@test.com`;
    let studentUser = await prisma.user.findUnique({ where: { email } });

    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: {
          email,
          password,
          role: Role.STUDENT,
          firstName: `Student${i}`,
          lastName: 'Test',
        },
      });

      await prisma.student.create({
        data: {
          matricule: `S-000${i}`,
          userId: studentUser.id,
          departmentId: department.id,
          programId: program.id,
          groupId: group.id,
          academicYearId: academicYear.id,
        },
      });
    }

    const student = await prisma.student.findUnique({ where: { userId: studentUser.id } });
    if (student) studentIds.push(student.id);
  }

  // =====================================================
  // Sessions
  // =====================================================
  const now = new Date();

  // Session 1: ACTIVE RIGHT NOW (started 30 min ago, ends in 1h30)
  const activeSession = await prisma.session.create({
    data: {
      type: SessionType.COURSE,
      subjectId: subject1.id,
      teacherId: teacher!.id,
      groupId: group.id,
      roomId: room.id,
      adminId: admin!.id,
      startDate: new Date(now.getTime() - 30 * 60 * 1000),   // 30 min ago
      endDate: new Date(now.getTime() + 90 * 60 * 1000),      // 1h30 from now
    },
  });

  // Session 2: UPCOMING (starts in 2 hours)
  await prisma.session.create({
    data: {
      type: SessionType.TD,
      subjectId: subject2.id,
      teacherId: teacher!.id,
      groupId: group.id,
      roomId: room.id,
      adminId: admin!.id,
      startDate: new Date(now.getTime() + 2 * 60 * 60 * 1000),  // 2h from now
      endDate: new Date(now.getTime() + 4 * 60 * 60 * 1000),    // 4h from now
    },
  });

  // Session 3: DONE (ended 2 hours ago) - with some absences already marked
  const doneSession = await prisma.session.create({
    data: {
      type: SessionType.COURSE,
      subjectId: subject2.id,
      teacherId: teacher!.id,
      groupId: group.id,
      roomId: room.id,
      adminId: admin!.id,
      startDate: new Date(now.getTime() - 4 * 60 * 60 * 1000),  // 4h ago
      endDate: new Date(now.getTime() - 2 * 60 * 60 * 1000),    // 2h ago
    },
  });

  // Session 4: DONE yesterday (for history testing)
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdaySession = await prisma.session.create({
    data: {
      type: SessionType.COURSE,
      subjectId: subject1.id,
      teacherId: teacher!.id,
      groupId: group.id,
      roomId: room.id,
      adminId: admin!.id,
      startDate: new Date(yesterday.setHours(9, 0, 0, 0)),
      endDate: new Date(yesterday.setHours(11, 0, 0, 0)),
    },
  });

  // =====================================================
  // Mark attendance for DONE session (session 3)
  // Students 1,2,3 = PRESENT | Students 4,5 = ABSENT
  // =====================================================
  if (studentIds.length >= 5) {
    const attendanceData = studentIds.map((studentId, index) => ({
      studentId,
      subjectId: subject2.id,
      sessionId: doneSession.id,
      status: index < 3 ? 'PRESENT' : 'ABSENT',
    }));

    for (const entry of attendanceData) {
      await prisma.absence.create({
        data: {
          studentId: entry.studentId,
          subjectId: entry.subjectId,
          sessionId: entry.sessionId,
          status: entry.status as any,
        },
      });
    }

    // Mark attendance for yesterday session too
    // Students 1,2 = PRESENT | Students 3,4,5 = ABSENT
    const yesterdayAttendance = studentIds.map((studentId, index) => ({
      studentId,
      subjectId: subject1.id,
      sessionId: yesterdaySession.id,
      status: index < 2 ? 'PRESENT' : 'ABSENT',
    }));

    for (const entry of yesterdayAttendance) {
      await prisma.absence.create({
        data: {
          studentId: entry.studentId,
          subjectId: entry.subjectId,
          sessionId: entry.sessionId,
          status: entry.status as any,
        },
      });
    }


  }

  console.log('✅ Seed terminé avec succès');
  console.log('─────────────────────────────────────');
  console.log('👤 Admin:   admin@test.com     / 123456');
  console.log('👨‍🏫 Teacher: teacher1@test.com  / 123456');
  console.log('👨‍🎓 Students: students1-5@test.com / 123456');
  console.log('─────────────────────────────────────');
  console.log(`📅 Active session ID:    ${activeSession.id}`);
  console.log(`📅 Done session ID:      ${doneSession.id}`);
  console.log(`📅 Yesterday session ID: ${yesterdaySession.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });