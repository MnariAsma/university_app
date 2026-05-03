import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateGradesDto } from './dto/create-grades.dto';
import { TeacherSubject, Program, Level, Subject } from '@prisma/client';

@Injectable()
export class GradeService {
  constructor(private prisma: PrismaService) {}

  async findTeacherSubjects(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) return [];
    return this.prisma.teacherSubject.findMany({
      where: { teacherId: teacher.id },
      include: { subject: true },
    }) as Promise<(TeacherSubject & { subject: Subject })[]>;
  }

  async findPrograms(userId: string, subjectId?: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) return [];

    if (subjectId) {
      // find teacherSubject links for this teacher and subject and collect programs
      const links = await this.prisma.teacherSubject.findMany({
        where: { teacherId: teacher.id, subjectId },
        include: { program: true, subject: { include: { program: true } } },
      }) as Array<TeacherSubject & { program?: Program | null; subject?: Subject & { program?: Program | null } } >;

      const programsMap = new Map<string, Program>();
      for (const l of links) {
        if (l.program) programsMap.set(l.program.id, l.program);
        else if (l.subject?.program)
          programsMap.set(l.subject.program.id, l.subject.program);
      }

      return Array.from(programsMap.values());
    }

    return this.prisma.program.findMany();
  }

  async findLevels(programId: string, userId?: string, subjectId?: string) {
    // If subjectId and userId are provided, return only levels where the teacher teaches this subject in the program
    if (subjectId && userId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId },
      });
      if (!teacher) return [];

      const links = await this.prisma.teacherSubject.findMany({
        where: { teacherId: teacher.id, subjectId },
      });

      // Collect unique levelIds from links (force type for levelId)
      const levelIds = Array.from(new Set((links as Array<{ levelId?: string }> ).map(l => l.levelId).filter(Boolean)));
      if (levelIds.length === 0) return [];

      // Fetch levels by ids
      const levels = await this.prisma.level.findMany({
        where: { id: { in: levelIds as string[] } },
      });

      return levels;
    }

    return this.prisma.level.findMany({ where: { programId } });
  }

  async findStudents(
    programId: string, 
    levelId: string, 
    subjectId?: string, 
    evaluationType?: string, 
    semester?: number
  ) {
    let activeYearId: string | undefined;
    
    if (subjectId && evaluationType && semester) {
      const activeYear = await this.prisma.academicYear.findFirst({ where: { active: true } });
      if (activeYear) {
        activeYearId = activeYear.id;
      }
    }

    const students = await this.prisma.student.findMany({
      where: {
        programId,
        group: { is: { levelId } },
      },
      include: { 
        user: true, 
        group: true,
        ...(subjectId && evaluationType && semester && activeYearId ? {
          grades: {
            where: {
              subjectId,
              evaluationType,
              semester,
              academicYearId: activeYearId
            }
          }
        } : {})
      },
    });

    return students.map(s => {
      const { grades, ...rest } = s as any;
      const grade = grades?.[0]?.value;
      return { 
        ...rest, 
        _grade: grade !== undefined && grade !== null ? grade : "" 
      };
    });
  }

async upsertGrades(dto: CreateGradesDto, userId: string) {
  const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
  if (!teacher) throw new NotFoundException('Teacher not found');

  let academicYearId = dto.academicYearId;

  if (!academicYearId) {
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { active: true },
    });

    if (!activeYear) {
      throw new NotFoundException('Active academic year not found');
    }

    academicYearId = activeYear.id;
  }

  const results: any[] = [];

  for (const g of dto.grades) {
    const existing = await this.prisma.grade.findFirst({
      where: {
        studentId: g.studentId,
        subjectId: dto.subjectId,
        evaluationType: dto.evaluationType,
        academicYearId,
        semester: dto.semester,
      },
    });

    if (existing) {
      const updated = await this.prisma.grade.update({
        where: { id: existing.id },
        data: {
          value: g.value,
          comment: g.comment ?? null,
          teacherId: teacher.id,
        },
      });
      results.push(updated);
    } else {
      const created = await this.prisma.grade.create({
        data: {
          studentId: g.studentId,
          subjectId: dto.subjectId,
          teacherId: teacher.id,
          value: g.value,
          evaluationType: dto.evaluationType,
          academicYearId,
          semester: dto.semester,
          comment: g.comment ?? null,
        },
      });
      results.push(created);
    }
  }

  return results;
  }

  async findProgramLevelCombos(userId: string, subjectId: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) return [];

    const links = await this.prisma.teacherSubject.findMany({
      where: { teacherId: teacher.id, subjectId },
      include: { program: true, level: true, subject: { include: { program: true } } },
    }) as Array<TeacherSubject & { program?: Program | null; level?: Level | null; subject?: Subject & { program?: Program | null } }>;

    const combosMap = new Map<string, { program: Program; level: Level | null }>();
    for (const l of links) {
      const program = l.program ?? l.subject?.program;
      const level = l.level ?? null;
      if (!program) continue;
      const key = `${program.id}-${level?.id ?? 'null'}`;
      if (!combosMap.has(key)) combosMap.set(key, { program, level });
    }

    return Array.from(combosMap.values());
  }
}
