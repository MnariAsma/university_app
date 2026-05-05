require('dotenv').config();
const { Client } = require('./node_modules/.pnpm/pg@8.20.0/node_modules/pg');
const fs = require('fs');
const path = require('path');

const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect().then(() =>
  client.query('SELECT title, "fileUrl" FROM courses ORDER BY "createdAt" DESC')
).then(res => {
  console.log('\n=== COURSE FILE STATUS ===\n');
  res.rows.forEach(c => {
    if (!c.fileUrl) { console.log('NO FILE  | ' + c.title); return; }
    const full = path.join(process.cwd(), 'uploads', c.fileUrl);
    const exists = fs.existsSync(full);
    console.log((exists ? 'OK      ' : 'MISSING ') + '| ' + c.title + ' | ' + c.fileUrl);
  });
  return client.end();
}).catch(e => { console.error(e.message); return client.end(); });
