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

  // 2. SIMPAN BACKUP / SNAPSHOT JADWAL SEBELUMNYA (UNTUK FITUR UNDO)
  const previousSchedules = await prisma.schedule.findMany({
    where: { academicYearId },
    select: {
      academicYearId: true,
      classGroupId: true,
      subjectId: true,
      teacherId: true,
      dayOfWeek: true,
      periodNumber: true,
      validFrom: true,
      validUntil: true,
    }
  });

  if (previousSchedules.length > 0) {
    await prisma.auditLog.create({
      data: {
        action: "SCHEDULE_SNAPSHOT_BACKUP",
        details: {
          timestamp: new Date().toISOString(),
          totalBackedUp: previousSchedules.length,
          schedules: previousSchedules,
        },
        performedBy: "Auto-Generator Backup Service"
      }
    });
  }

  // 3. Hapus semua jadwal lama di tahun ajaran ini agar bersih (Fresh Generate)
  await prisma.schedule.deleteMany({
    where: { academicYearId }
  });

  // 4. Algoritma Greedy Heuristic
  for (const load of teachingLoads) {
    let periodsToAssign = load.targetPeriods;

    // Coba mencari slot kosong
    for (const day of DAYS) {
      if (periodsToAssign === 0) break;

      for (const ts of timeSettings) {
        if (periodsToAssign === 0) break;

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

  // 5. Simpan hasil secara batch
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
    unassigned,
    canUndo: previousSchedules.length > 0,
  };
}

export async function undoLastScheduleGeneration(academicYearId: string) {
  // Cari snapshot backup terbaru
  const lastSnapshot = await prisma.auditLog.findFirst({
    where: { action: "SCHEDULE_SNAPSHOT_BACKUP" },
    orderBy: { timestamp: "desc" }
  });

  if (!lastSnapshot || !lastSnapshot.details) {
    throw new Error("Tidak ditemukan riwayat backup jadwal sebelumnya untuk di-undo.");
  }

  const details = lastSnapshot.details as any;
  const backupSchedules = details.schedules || [];

  if (backupSchedules.length === 0) {
    throw new Error("Data backup jadwal kosong.");
  }

  // 1. Hapus jadwal yang ada saat ini
  await prisma.schedule.deleteMany({
    where: { academicYearId }
  });

  // 2. Pulihkan jadwal dari backup
  const formattedSchedules = backupSchedules.map((s: any) => ({
    academicYearId: s.academicYearId,
    classGroupId: s.classGroupId,
    subjectId: s.subjectId,
    teacherId: s.teacherId,
    dayOfWeek: s.dayOfWeek,
    periodNumber: s.periodNumber,
    validFrom: s.validFrom ? new Date(s.validFrom) : new Date(),
    validUntil: s.validUntil ? new Date(s.validUntil) : null,
  }));

  await prisma.schedule.createMany({
    data: formattedSchedules
  });

  // 3. Catat di Audit Log
  await prisma.auditLog.create({
    data: {
      action: "RESTORE_SCHEDULE_UNDO",
      details: {
        restoredCount: formattedSchedules.length,
        restoredFromDate: lastSnapshot.timestamp
      },
      performedBy: "User via Undo Button"
    }
  });

  // Hapus snapshot yang sudah di-restore
  await prisma.auditLog.delete({ where: { id: lastSnapshot.id } });

  return {
    success: true,
    restoredCount: formattedSchedules.length
  };
}

export async function checkCanUndo() {
  const lastSnapshot = await prisma.auditLog.findFirst({
    where: { action: "SCHEDULE_SNAPSHOT_BACKUP" },
    orderBy: { timestamp: "desc" }
  });
  return !!lastSnapshot;
}
