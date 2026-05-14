require('dotenv').config();
const { Client } = require('./node_modules/.pnpm/pg@8.20.0/node_modules/pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });

c.connect().then(async () => {
  const courses = await c.query(
    'SELECT c.id, c.title, c.published, s.name as subject_name, s."programId" as subject_program_id FROM courses c JOIN subjects s ON c."subjectId" = s.id ORDER BY c."createdAt" DESC LIMIT 10'
  );
  console.log('\n=== ALL COURSES ===');
  console.table(courses.rows);

  const students = await c.query(
    'SELECT u."firstName", u."lastName", st."programId" as student_program_id FROM students st JOIN users u ON st."userId" = u.id LIMIT 10'
  );
  console.log('\n=== STUDENTS (programId) ===');
  console.table(students.rows);

  await c.end();
}).catch(e => { console.error(e.message); c.end(); });
