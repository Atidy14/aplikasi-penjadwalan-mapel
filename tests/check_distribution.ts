import { prisma } from "../app/lib/prisma";

async function main() {
  const schedules = await prisma.schedule.findMany({ where: { validUntil: null } });
  const dayCounts: Record<string, number> = {};
  for (const s of schedules) {
    dayCounts[s.dayOfWeek] = (dayCounts[s.dayOfWeek] || 0) + 1;
  }
  console.log("DISTRIBUSI_JAM_PER_HARI:", JSON.stringify(dayCounts, null, 2));
}

main().finally(() => process.exit(0));
