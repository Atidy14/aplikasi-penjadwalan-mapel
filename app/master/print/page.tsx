import { prisma } from "@/app/lib/prisma";
import SchedulePrintView from "@/app/components/SchedulePrintView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PrintSchedulePage() {
  const activeYear = await prisma.academicYear.findFirst({
    where: { isActive: true },
  });

  const academicYearId = activeYear?.id || "";

  // Ambil TimeSettings
  const timeSettings = await prisma.timeSetting.findMany({
    orderBy: { periodNumber: "asc" },
  });

  // Ambil Kelas beserta Jadwal aktifnya
  const classes = await prisma.classGroup.findMany({
    where: { academicYearId },
    include: {
      schedules: {
        where: { validUntil: null },
        include: {
          subject: true,
          teacher: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Ambil Guru beserta Jadwal aktifnya
  const teachers = await prisma.teacher.findMany({
    where: { status: "ACTIVE" },
    include: {
      schedules: {
        where: {
          academicYearId,
          validUntil: null,
        },
        include: {
          classGroup: true,
          subject: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <SchedulePrintView
      academicYearName={activeYear?.name || "2026/2027 Ganjil"}
      timeSettings={timeSettings}
      classes={classes}
      teachers={teachers}
    />
  );
}
