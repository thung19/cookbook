// Bring in the PrismaClient class (auto-generated from schema.prisma)
import { PrismaClient } from "@prisma/client";

// Extend the global object to allow storing a Prisma instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Export a single Prisma client: reuse if already set, otherwise create new
export const prisma =
  globalForPrisma.prisma ||                      // reuse cached client if present
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });  // otherwise create new with logging

// In development, cache the client on global so it survives hot reloads
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
