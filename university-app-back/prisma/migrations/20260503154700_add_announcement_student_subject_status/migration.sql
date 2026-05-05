-- DropForeignKey
ALTER TABLE "teacher_subjects" DROP CONSTRAINT "teacher_subjects_levelId_fkey";

-- DropForeignKey
ALTER TABLE "teacher_subjects" DROP CONSTRAINT "teacher_subjects_programId_fkey";

-- AlterTable
ALTER TABLE "teacher_subjects" ALTER COLUMN "levelId" SET DATA TYPE TEXT,
ALTER COLUMN "programId" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "teacherId" TEXT NOT NULL,
    "targetProgramId" TEXT,
    "targetLevelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_targetProgramId_fkey" FOREIGN KEY ("targetProgramId") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_targetLevelId_fkey" FOREIGN KEY ("targetLevelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
