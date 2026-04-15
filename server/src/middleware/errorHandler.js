import { Prisma } from "@prisma/client";

function mapMessage(err) {
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: 503,
      message: `Database connection failed: ${err.message}`,
    };
  }
  return null;
}

export function errorHandler(err, _req, res, _next) {
  const mapped = err.status ? null : mapMessage(err);
  const status = mapped?.status ?? err.status ?? 500;
  const message = mapped?.message ?? err.message ?? "Something went wrong";
  res.status(status).json({ message });
}
