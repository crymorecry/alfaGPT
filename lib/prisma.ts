import { PrismaClient } from "@prisma/client";
import { metricsStore } from "./metrics";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClient = global.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

export const prisma = prismaClient.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }: any) {
        const startTime = Date.now()
        try {
          const result = await query(args)
          const responseTime = Date.now() - startTime
          
          metricsStore.addDBMetric({
            timestamp: Date.now(),
            query: operation,
            table: model || 'unknown',
            responseTime,
            success: true
          })
          
          return result
        } catch (error) {
          const responseTime = Date.now() - startTime
          
          metricsStore.addDBMetric({
            timestamp: Date.now(),
            query: operation,
            table: model || 'unknown',
            responseTime,
            success: false
          })
          
          throw error
        }
      },
    },
  },
}) as unknown as PrismaClient;

if (process.env.NODE_ENV !== "production") global.prisma = prisma as any;

export default prisma;
