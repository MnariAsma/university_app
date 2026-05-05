import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  Role,
  CourseType,
  SessionType,
  AbsenceStatus,
  GradeStatus,
  RequestCategory,
  RequestStatus,
  RequestType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type SeedStudent = {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
};

type SessionSeedInput = {
  title: string;
  type: SessionType;
  subjectId: string;
  teacherId: string;
  groupId: string;
  roomId: string;
  adminId: string;
  startDate: Date;
  endDate: Date;
  recurring?: boolean;
};

function setTime(baseDate: Date, hours: number, minutes = 0) {
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getWeekStart(baseDate: Date) {
  const weekStart = new Date(baseDate);
  const day = weekStart.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

async function ensureSession(data: SessionSeedInput) {
  const existing = await prisma.session.findFirst({
    where: { title: data.title },
  });

  if (existing) {
    return prisma.session.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.session.create({ data });
}

async function ensureGrade(data: {
  studentId: string;
  subjectId: string;
  teacherId: string;
  value: number;
  evaluationType: string;
  status: GradeStatus;
  comment?: string;
  academicYearId: string;
  semester: number;
}) {
  const existing = await prisma.grade.findFirst({
    where: {
      studentId: data.studentId,
      subjectId: data.subjectId,
      evaluationType: data.evaluationType,
      academicYearId: data.academicYearId,
      semester: data.semester,
    },
  });

  if (existing) {
    return prisma.grade.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.grade.create({ data });
}

async function ensureDocumentRequest(data: {
  studentId: string;
  category: RequestCategory;
  type: RequestType;
  academicYearId?: string;
  reason?: string;
  studentFileUrl?: string;
  adminFileUrl?: string;
  status: RequestStatus;
}) {
  const existing = await prisma.documentRequest.findFirst({
    where: {
      studentId: data.studentId,
      type: data.type,
      reason: data.reason ?? null,
    },
  });

  if (existing) {
    return prisma.documentRequest.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.documentRequest.create({ data });
}

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
  // programId and levelId are optional but part of unique constraint
  // =====================================================
  const existingTs1 = await prisma.teacherSubject.findFirst({
    where: {
      teacherId: teacher!.id,
      subjectId: subject1.id,
      academicYearId: academicYear.id,
      programId: program.id,
      levelId: level.id,
    },
  });
  if (!existingTs1) {
    await prisma.teacherSubject.create({
      data: {
        teacherId: teacher!.id,
        subjectId: subject1.id,
        academicYearId: academicYear.id,
        courseType: CourseType.COURSE,
        programId: program.id,
        levelId: level.id,
      },
    });
  }

  const existingTs2 = await prisma.teacherSubject.findFirst({
    where: {
      teacherId: teacher!.id,
      subjectId: subject2.id,
      academicYearId: academicYear.id,
      programId: program.id,
      levelId: level.id,
    },
  });
  if (!existingTs2) {
    await prisma.teacherSubject.create({
      data: {
        teacherId: teacher!.id,
        subjectId: subject2.id,
        academicYearId: academicYear.id,
        courseType: CourseType.COURSE,
        programId: program.id,
        levelId: level.id,
      },
    });
  }

  if (!admin || !teacher) {
    throw new Error('Admin or teacher profile is missing after seed setup');
  }

  // =====================================================
  // Students (5 students)
  // =====================================================
  const students: SeedStudent[] = [];

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
    }

    let student = await prisma.student.findUnique({
      where: { userId: studentUser.id },
      include: { user: true },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          matricule: `S-000${i}`,
          userId: studentUser.id,
          departmentId: department.id,
          programId: program.id,
          groupId: group.id,
          academicYearId: academicYear.id,
        },
        include: { user: true },
      });
    }

    students.push({
      id: student.id,
      userId: student.userId,
      email: student.user.email,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
    });
  }

  // =====================================================
  // Clean up legacy titled demo sessions from older seeds
  // =====================================================
  await prisma.session.deleteMany({
    where: {
      teacherId: teacher.id,
      OR: [
        { title: { startsWith: 'Demo Morning Session (' } },
        { title: { startsWith: 'Demo Afternoon Session (' } },
        { title: 'Passed Session (7:00–8:00)' },
        { title: 'Passed Session (9:00–10:00)' },
        { title: 'Current Session (now)' },
        { title: 'Upcoming Session (in 2h)' },
      ],
    },
  });

  // =====================================================
  // Timetable + presence sessions for teacher and group
  // =====================================================
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekStart = getWeekStart(today);

  const weeklySessions = [
    { title: 'Seed Timetable Monday Morning', dayOffset: 0, startHour: 8, endHour: 10, type: SessionType.COURSE, subjectId: subject1.id },
    { title: 'Seed Timetable Monday Afternoon', dayOffset: 0, startHour: 13, endHour: 15, type: SessionType.TD, subjectId: subject2.id },
    { title: 'Seed Timetable Tuesday Morning', dayOffset: 1, startHour: 9, endHour: 11, type: SessionType.COURSE, subjectId: subject2.id },
    { title: 'Seed Timetable Tuesday Afternoon', dayOffset: 1, startHour: 14, endHour: 16, type: SessionType.TP, subjectId: subject1.id },
    { title: 'Seed Timetable Wednesday Morning', dayOffset: 2, startHour: 8, endHour: 10, type: SessionType.COURSE, subjectId: subject1.id },
    { title: 'Seed Timetable Wednesday Afternoon', dayOffset: 2, startHour: 13, endHour: 15, type: SessionType.TD, subjectId: subject2.id },
    { title: 'Seed Timetable Thursday Morning', dayOffset: 3, startHour: 10, endHour: 12, type: SessionType.COURSE, subjectId: subject2.id },
    { title: 'Seed Timetable Thursday Afternoon', dayOffset: 3, startHour: 14, endHour: 16, type: SessionType.TP, subjectId: subject1.id },
    { title: 'Seed Timetable Friday Morning', dayOffset: 4, startHour: 8, endHour: 10, type: SessionType.COURSE, subjectId: subject1.id },
    { title: 'Seed Timetable Friday Afternoon', dayOffset: 4, startHour: 13, endHour: 15, type: SessionType.TD, subjectId: subject2.id },
    { title: 'Seed Timetable Saturday Morning', dayOffset: 5, startHour: 9, endHour: 11, type: SessionType.COURSE, subjectId: subject2.id },
    { title: 'Seed Timetable Saturday Workshop', dayOffset: 5, startHour: 11, endHour: 13, type: SessionType.TP, subjectId: subject1.id },
  ];

  for (const session of weeklySessions) {
    const sessionDate = new Date(weekStart);
    sessionDate.setDate(weekStart.getDate() + session.dayOffset);

    await ensureSession({
      title: session.title,
      type: session.type,
      subjectId: session.subjectId,
      teacherId: teacher.id,
      groupId: group.id,
      roomId: room.id,
      adminId: admin.id,
      startDate: setTime(sessionDate, session.startHour),
      endDate: setTime(sessionDate, session.endHour),
      recurring: true,
    });
  }

  const todayDoneSession = await ensureSession({
    title: 'Seed Presence Today Done Session',
    type: SessionType.TD,
    subjectId: subject2.id,
    teacherId: teacher.id,
    groupId: group.id,
    roomId: room.id,
    adminId: admin.id,
    startDate: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() - 2 * 60 * 60 * 1000),
  });

  const activeSession = await ensureSession({
    title: 'Seed Presence Active Session',
    type: SessionType.COURSE,
    subjectId: subject1.id,
    teacherId: teacher.id,
    groupId: group.id,
    roomId: room.id,
    adminId: admin.id,
    startDate: new Date(now.getTime() - 15 * 60 * 1000),
    endDate: new Date(now.getTime() + 45 * 60 * 1000),
  });

  const demoSoonSession = await ensureSession({
    title: 'Seed Presence Demo In 10 Minutes',
    type: SessionType.TP,
    subjectId: subject2.id,
    teacherId: teacher.id,
    groupId: group.id,
    roomId: room.id,
    adminId: admin.id,
    startDate: new Date(now.getTime() + 10 * 60 * 1000),
    endDate: new Date(now.getTime() + 70 * 60 * 1000),
  });

  const upcomingSession = await ensureSession({
    title: 'Seed Presence Later Today Session',
    type: SessionType.COURSE,
    subjectId: subject1.id,
    teacherId: teacher.id,
    groupId: group.id,
    roomId: room.id,
    adminId: admin.id,
    startDate: new Date(now.getTime() + 2 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 3 * 60 * 60 * 1000),
  });

  const yesterdaySession = await ensureSession({
    title: 'Seed Presence Yesterday Session',
    type: SessionType.COURSE,
    subjectId: subject1.id,
    teacherId: teacher.id,
    groupId: group.id,
    roomId: room.id,
    adminId: admin.id,
    startDate: setTime(yesterday, 9, 0),
    endDate: setTime(yesterday, 11, 0),
  });

  // =====================================================
  // Absences for presence/history testing
  // =====================================================
  const absencePlans = [
    {
      sessionId: todayDoneSession.id,
      subjectId: subject2.id,
      statuses: [
        AbsenceStatus.PRESENT,
        AbsenceStatus.PRESENT,
        AbsenceStatus.ABSENT,
        AbsenceStatus.PRESENT,
        AbsenceStatus.ABSENT,
      ],
    },
    {
      sessionId: activeSession.id,
      subjectId: subject1.id,
      statuses: [
        AbsenceStatus.PRESENT,
        AbsenceStatus.ABSENT,
        AbsenceStatus.PRESENT,
        AbsenceStatus.ABSENT,
        AbsenceStatus.PRESENT,
      ],
    },
    {
      sessionId: yesterdaySession.id,
      subjectId: subject1.id,
      statuses: [
        AbsenceStatus.PRESENT,
        AbsenceStatus.PRESENT,
        AbsenceStatus.ABSENT,
        AbsenceStatus.ABSENT,
        AbsenceStatus.ABSENT,
      ],
    },
  ];

  for (const plan of absencePlans) {
    for (const [index, student] of students.entries()) {
      await prisma.absence.upsert({
        where: {
          studentId_sessionId: {
            studentId: student.id,
            sessionId: plan.sessionId,
          },
        },
        update: {
          subjectId: plan.subjectId,
          status: plan.statuses[index],
          justification:
            plan.statuses[index] === AbsenceStatus.ABSENT && index === 2
              ? 'SEED: justification pending'
              : null,
          justified: false,
        },
        create: {
          studentId: student.id,
          subjectId: plan.subjectId,
          sessionId: plan.sessionId,
          status: plan.statuses[index],
          justification:
            plan.statuses[index] === AbsenceStatus.ABSENT && index === 2
              ? 'SEED: justification pending'
              : null,
          justified: false,
        },
      });
    }
  }

  for (const student of students) {
    for (const subjectId of [subject1.id, subject2.id]) {
      const count = await prisma.absence.count({
        where: { studentId: student.id, subjectId, status: AbsenceStatus.ABSENT },
      });

      await prisma.studentSubjectStatus.upsert({
        where: { studentId_subjectId: { studentId: student.id, subjectId } },
        create: {
          studentId: student.id,
          subjectId,
          absenceCount: count,
          eliminated: count >= 3,
        },
        update: {
          absenceCount: count,
          eliminated: count >= 3,
        },
      });
    }
  }

  // =====================================================
  // Grades
  // =====================================================
  const gradeSeeds = [
    {
      subjectId: subject1.id,
      evaluationType: 'CC1',
      semester: 1,
      status: GradeStatus.FINAL,
      values: [14.5, 13.25, 11.75, 10.5, 15.75],
      comment: 'SEED: controle continu programmation web',
    },
    {
      subjectId: subject1.id,
      evaluationType: 'EXAM',
      semester: 1,
      status: GradeStatus.PROVISIONAL,
      values: [15, 14, 12, 11, 16.5],
      comment: 'SEED: examen final programmation web',
    },
    {
      subjectId: subject2.id,
      evaluationType: 'TP1',
      semester: 1,
      status: GradeStatus.FINAL,
      values: [13.5, 12.75, 10.25, 11.5, 14.25],
      comment: 'SEED: travaux pratiques base de donnees',
    },
  ];

  for (const gradeSeed of gradeSeeds) {
    for (const [index, student] of students.entries()) {
      await ensureGrade({
        studentId: student.id,
        subjectId: gradeSeed.subjectId,
        teacherId: teacher.id,
        value: gradeSeed.values[index],
        evaluationType: gradeSeed.evaluationType,
        status: gradeSeed.status,
        comment: gradeSeed.comment,
        academicYearId: academicYear.id,
        semester: gradeSeed.semester,
      });
    }
  }

  // =====================================================
  // Document requests
  // =====================================================
  await ensureDocumentRequest({
    studentId: students[0].id,
    category: RequestCategory.UNIVERSITY,
    type: RequestType.CERTIFICATE_ATTENDANCE,
    academicYearId: academicYear.id,
    reason: 'SEED: scholarship renewal certificate',
    adminFileUrl: '/uploads/seed/attendance-certificate-student1.pdf',
    status: RequestStatus.ACCEPTED,
  });

  await ensureDocumentRequest({
    studentId: students[1].id,
    category: RequestCategory.UNIVERSITY,
    type: RequestType.CERTIFICATE_SUCCESS,
    academicYearId: academicYear.id,
    reason: 'SEED: master application dossier',
    status: RequestStatus.PENDING,
  });

  await ensureDocumentRequest({
    studentId: students[2].id,
    category: RequestCategory.INTERNSHIP,
    type: RequestType.INTERNSHIP_DOC,
    reason: 'SEED: internship agreement for summer placement',
    studentFileUrl: '/uploads/seed/internship-supporting-documents-student3.pdf',
    adminFileUrl: '/uploads/seed/internship-request-response-student3.pdf',
    status: RequestStatus.REFUSED,
  });

  await ensureDocumentRequest({
    studentId: students[3].id,
    category: RequestCategory.UNIVERSITY,
    type: RequestType.CERTIFICATE_ATTENDANCE,
    academicYearId: academicYear.id,
    reason: 'SEED: transport subscription renewal',
    status: RequestStatus.PENDING,
  });

  console.log('Seed completed successfully');
  console.log('---------------------------------------------');
  console.log('Admin:    admin@test.com        / 123456');
  console.log('Teacher:  teacher1@test.com     / 123456');
  console.log('Students: students1-5@test.com  / 123456');
  console.log('---------------------------------------------');
  console.log(`Active presence session:   ${activeSession.id}`);
  console.log(`Demo in 10 minutes session: ${demoSoonSession.id}`);
  console.log(`Completed today session:   ${todayDoneSession.id}`);
  console.log(`Completed yesterday session: ${yesterdaySession.id}`);
  console.log(`Upcoming session:          ${upcomingSession.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });