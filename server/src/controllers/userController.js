import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma.js";

function prismaErrorMessage(error) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }
  if (error.code === "P2021" || error.code === "P2010") {
    return "Database tables are missing. Run migrations: cd server && npx prisma migrate deploy";
  }
  if (error.code === "P1001" || error.code === "P1002") {
    return "Cannot reach the database. Check DATABASE_URL and that PostgreSQL is running.";
  }
  return `Database error (${error.code})`;
}

export async function getDefaultUser(_req, res, next) {
  try {
    const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (!user) {
      return next({ status: 404, message: "No user found. Run: cd server && npm run prisma:seed" });
    }
    return res.json(user);
  } catch (error) {
    const mapped = prismaErrorMessage(error);
    if (mapped) {
      return next({ status: 503, message: mapped });
    }
    return next(error);
  }
}
