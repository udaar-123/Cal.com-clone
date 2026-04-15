import "../src/loadEnv.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.booking.deleteMany();
  await prisma.dateOverride.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: "Demo Host",
      email: "demo@calclone.dev",
      timezone: "Asia/Kolkata",
    },
  });

  const eventType = await prisma.eventType.create({
    data: {
      userId: user.id,
      title: "30 min Intro Call",
      description: "Quick consultation for product and roadmap discussion.",
      duration: 30,
      slug: "demo-intro-call",
      bufferTime: 10,
      questions: [
        { id: "company", label: "Company name", type: "text", required: false },
        { id: "goal", label: "What do you want to discuss?", type: "textarea", required: true },
      ],
    },
  });

  await prisma.availability.createMany({
    data: [
      { userId: user.id, dayOfWeek: 1, startTime: "09:00", endTime: "17:00", timezone: "Asia/Kolkata" },
      { userId: user.id, dayOfWeek: 2, startTime: "09:00", endTime: "17:00", timezone: "Asia/Kolkata" },
      { userId: user.id, dayOfWeek: 3, startTime: "09:00", endTime: "17:00", timezone: "Asia/Kolkata" },
      { userId: user.id, dayOfWeek: 4, startTime: "09:00", endTime: "17:00", timezone: "Asia/Kolkata" },
      { userId: user.id, dayOfWeek: 5, startTime: "09:00", endTime: "17:00", timezone: "Asia/Kolkata" },
    ],
  });

  await prisma.dateOverride.create({
    data: {
      eventTypeId: eventType.id,
      date: new Date("2026-12-25T00:00:00.000Z"),
      isBlocked: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
