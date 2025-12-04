import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClient = global.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") global.prisma = prisma as any;

export default prisma;
