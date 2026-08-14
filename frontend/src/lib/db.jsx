import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ["query"]
});
if (true) globalForPrisma.prisma = db;
export {
  db
};
