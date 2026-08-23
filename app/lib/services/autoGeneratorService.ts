import { prisma } from "../prisma";
export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

const DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export async function generateAutomaticSchedule(academicYearId: string) {
  // 1. Ambil semua Kertas Kerja, Pengaturan Waktu, dan Kelas
  const timeSettings = await prisma.timeSetting.findMany({ orderBy: { periodNumber: "asc" } });
  const teachingLoads = await prisma.teachingLoad.findMany({
    where: { academicYearId },
    include: { classGroup: true, subject: true, teacher: true }
  });
  
  if (timeSettings.length === 0) throw new Error("Time Settings belum diatur.");
  if (teachingLoads.length === 0) throw new Error("Belum ada Kertas Kerja untuk tahun ajaran ini.");

  // Urutkan beban mengajar dari yang terberat (jam terbanyak) ke yang paling ringan
  teachingLoads.sort((a, b) => b.targetPeriods - a.targetPeriods);

  // State Pelacakan (Tracking)
  const teacherBusy = new Set<string>(); // "teacherId-day-period"
  const classBusy = new Set<string>();   // "classId-day-period"
  const subjectDayCount = new Map<string, number>(); // "classId-subjectId-day" -> count

  // Muat "Permintaan Khusus" Guru (Hari/Jam Larangan)
  const allConstraints = await prisma.teacherConstraint.findMany();
  for (const c of allConstraints) {
    teacherBusy.add(`${c.teacherId}-${c.dayOfWeek}-${c.periodNumber}`);
  }

  const newSchedules: any[] = [];
  const unassigned: any[] = [];

  // 2. Hapus semua jadwal lama di tahun ajaran ini agar bersih (Fresh Generate)
  await prisma.schedule.deleteMany({
    where: { academicYearId }
  });

  // 3. Algoritma Greedy Sederhana
  for (const load of teachingLoads) {
    let periodsToAssign = load.targetPeriods;

    // Coba mencari slot kosong
    for (const day of DAYS) {
      if (periodsToAssign === 0) break;

      for (const ts of timeSettings) {
        if (periodsToAssign === 0) break;
        // Jangan taruh mapel di jam istirahat (jam istirahat bukan period valid untuk KBM jika disetup khusus)
        // Tapi asumsikan periodNumber 1-8 adalah jam KBM valid

        const teacherKey = `${load.teacherId}-${day}-${ts.periodNumber}`;
        const classKey = `${load.classGroupId}-${day}-${ts.periodNumber}`;
        const subjectDayKey = `${load.classGroupId}-${load.subjectId}-${day}`;

        const currentSubjectCount = subjectDayCount.get(subjectDayKey) || 0;

        // Cek bentrok Guru, bentrok Kelas, dan batasi max 2 jam mapel yang sama per hari
        if (!teacherBusy.has(teacherKey) && !classBusy.has(classKey) && currentSubjectCount < 2) {
          // Slot Ditemukan!
          newSchedules.push({
            academicYearId,
            classGroupId: load.classGroupId,
            subjectId: load.subjectId,
            teacherId: load.teacherId,
            dayOfWeek: day,
            periodNumber: ts.periodNumber,
            validFrom: new Date()
          });

          // Tandai slot sebagai terisi
          teacherBusy.add(teacherKey);
          classBusy.add(classKey);
          subjectDayCount.set(subjectDayKey, currentSubjectCount + 1);
          
          periodsToAssign--;
        }
      }
    }

    // Jika masih ada sisa jam yang tidak dapat dijadwalkan
    if (periodsToAssign > 0) {
      unassigned.push({
        class: load.classGroup.name,
        subject: load.subject.name,
        teacher: load.teacher.name,
        unassignedPeriods: periodsToAssign
      });
    }
  }

  // 4. Simpan hasil secara batch
  if (newSchedules.length > 0) {
    await prisma.schedule.createMany({
      data: newSchedules
    });
  }

  // Catat ke Audit Log
  await prisma.auditLog.create({
    data: {
      action: "AUTO_GENERATE_SCHEDULE",
      details: {
        totalGenerated: newSchedules.length,
        unassignedCount: unassigned.length,
        unassignedDetails: unassigned
      },
      performedBy: "Auto Generator Algorithm"
    }
  });

  return {
    success: true,
    generatedCount: newSchedules.length,
    unassigned
  };
}

