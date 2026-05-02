-- CreateTable
CREATE TABLE "student_subject_status" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "absenceCount" INTEGER NOT NULL DEFAULT 0,
    "eliminated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "student_subject_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_subject_status_studentId_subjectId_key" ON "student_subject_status"("studentId", "subjectId");

-- AddForeignKey
ALTER TABLE "student_subject_status" ADD CONSTRAINT "student_subject_status_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_subject_status" ADD CONSTRAINT "student_subject_status_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
