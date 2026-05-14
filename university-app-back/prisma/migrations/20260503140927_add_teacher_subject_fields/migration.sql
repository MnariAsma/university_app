/*
  Warnings:

  - A unique constraint covering the columns `[subjectId,teacherId,courseType,academicYearId,programId,levelId]` on the table `teacher_subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX IF EXISTS "teacher_subjects_subjectId_teacherId_courseType_academicYea_key";

-- AlterTable
ALTER TABLE "teacher_subjects" ADD "levelId" VARCHAR(255);
ALTER TABLE "teacher_subjects" ADD "programId" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_subjects_subjectId_teacherId_courseType_academicYea_key" ON "teacher_subjects"("subjectId", "teacherId", "courseType", "academicYearId", "programId", "levelId");

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;