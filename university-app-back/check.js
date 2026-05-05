"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const courses = await prisma.course.findMany();
    console.log("All courses:", courses);
    const teachers = await prisma.teacher.findMany();
    console.log("All teachers:", teachers);
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=check.js.map