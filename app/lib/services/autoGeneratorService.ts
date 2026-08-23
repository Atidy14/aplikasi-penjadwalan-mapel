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
  const classDayTotalPeriods = new Map<string, number>(); // "classId-day" -> total jam terisi

  // Muat "Permintaan Khusus" Guru (Hari/Jam Larangan / Izin)
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

  // 4. Algoritma Greedy Heuristic dengan Distribusi Hari Merata (Balanced Day Distribution)
  for (const load of teachingLoads) {
    let periodsToAssign = load.targetPeriods;

    while (periodsToAssign > 0) {
      // Urutkan hari berdasarkan hari yang jamnya paling sedikit terisi di kelas ini (Load Balancing)
      const sortedDays = [...DAYS].sort((a, b) => {
        const countA = classDayTotalPeriods.get(`${load.classGroupId}-${a}`) || 0;
        const countB = classDayTotalPeriods.get(`${load.classGroupId}-${b}`) || 0;
        if (countA !== countB) return countA - countB;
        return DAYS.indexOf(a) - DAYS.indexOf(b);
      });

      let placedInThisPass = false;

      for (const day of sortedDays) {
        if (periodsToAssign === 0) break;

        const subjectDayKey = `${load.classGroupId}-${load.subjectId}-${day}`;
        const currentSubjectCount = subjectDayCount.get(subjectDayKey) || 0;

        // Batasi maksimal 2 jam mapel yang sama dalam 1 hari di kelas yang sama
        if (currentSubjectCount >= 2) continue;

        for (const ts of timeSettings) {
          if (periodsToAssign === 0) break;

          const teacherKey = `${load.teacherId}-${day}-${ts.periodNumber}`;
          const classKey = `${load.classGroupId}-${day}-${ts.periodNumber}`;

          // Cek bentrok Guru dan bentrok Kelas
          if (!teacherBusy.has(teacherKey) && !classBusy.has(classKey)) {
            // Pasang slot utama
            newSchedules.push({
              academicYearId,
              classGroupId: load.classGroupId,
              subjectId: load.subjectId,
              teacherId: load.teacherId,
              dayOfWeek: day,
              periodNumber: ts.periodNumber,
              validFrom: new Date()
            });

            teacherBusy.add(teacherKey);
            classBusy.add(classKey);
            subjectDayCount.set(subjectDayKey, currentSubjectCount + 1);

            const currentClassDayTotal = classDayTotalPeriods.get(`${load.classGroupId}-${day}`) || 0;
            classDayTotalPeriods.set(`${load.classGroupId}-${day}`, currentClassDayTotal + 1);

            periodsToAssign--;
            placedInThisPass = true;

            // Jika masih butuh jam dan slot berikutnya langsung kosong di hari yang sama, buatkan jam gandeng/berurutan (consecutive block)
            if (periodsToAssign > 0 && currentSubjectCount + 1 < 2) {
              const nextPeriod = ts.periodNumber + 1;
              const nextTs = timeSettings.find((t) => t.periodNumber === nextPeriod);
              if (nextTs) {
                const nextTeacherKey = `${load.teacherId}-${day}-${nextPeriod}`;
                const nextClassKey = `${load.classGroupId}-${day}-${nextPeriod}`;
                if (!teacherBusy.has(nextTeacherKey) && !classBusy.has(nextClassKey)) {
                  newSchedules.push({
                    academicYearId,
                    classGroupId: load.classGroupId,
                    subjectId: load.subjectId,
                    teacherId: load.teacherId,
                    dayOfWeek: day,
                    periodNumber: nextPeriod,
                    validFrom: new Date()
                  });

                  teacherBusy.add(nextTeacherKey);
                  classBusy.add(nextClassKey);
                  subjectDayCount.set(subjectDayKey, currentSubjectCount + 2);
                  classDayTotalPeriods.set(`${load.classGroupId}-${day}`, currentClassDayTotal + 2);
                  periodsToAssign--;
                }
              }
            }

            break; // Lanjut distribusikan ke hari lain yang masih longgar
          }
        }
      }

      // Jika tidak ada slot yang bisa diisi lagi pada putaran ini (misal karena constraint penuh)
      if (!placedInThisPass) {
        break;
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
    canUndo: true,
  };
}

/**
 * Membatalkan (Undo) generate terakhir dan memulihkan snapshot jadwal sebelumnya
 */
export async function undoLastScheduleGeneration(academicYearId: string) {
  // 1. Cari snapshot backup terakhir di AuditLog
  const lastBackup = await prisma.auditLog.findFirst({
    where: { action: "SCHEDULE_SNAPSHOT_BACKUP" },
    orderBy: { timestamp: "desc" },
  });

  if (!lastBackup) {
    throw new Error("Tidak ditemukan data backup jadwal sebelumnya untuk dipulihkan.");
  }

  const details = lastBackup.details as any;
  const backupSchedules: any[] = details?.schedules || [];

  if (backupSchedules.length === 0) {
    throw new Error("Data backup kosong atau tidak memiliki riwayat jadwal.");
  }

  // 2. Hapus jadwal yang ada saat ini
  await prisma.schedule.deleteMany({
    where: { academicYearId }
  });

  // 3. Pulihkan data jadwal dari snapshot
  const restoredSchedules = backupSchedules.map((s) => ({
    academicYearId: s.academicYearId || academicYearId,
    classGroupId: s.classGroupId,
    subjectId: s.subjectId,
    teacherId: s.teacherId,
    dayOfWeek: s.dayOfWeek,
    periodNumber: s.periodNumber,
    validFrom: s.validFrom ? new Date(s.validFrom) : new Date(),
    validUntil: s.validUntil ? new Date(s.validUntil) : null,
  }));

  await prisma.schedule.createMany({
    data: restoredSchedules,
  });

  // 4. Hapus log snapshot yang baru saja digunakan agar tidak double undo ke snapshot yang sama
  await prisma.auditLog.delete({
    where: { id: lastBackup.id }
  });

  // 5. Catat aksi Undo ke Audit Log
  await prisma.auditLog.create({
    data: {
      action: "UNDO_SCHEDULE_GENERATION",
      details: {
        restoredCount: restoredSchedules.length,
        restoredFromTimestamp: details.timestamp,
      },
      performedBy: "Administrator (Undo Action)"
    }
  });

  return {
    success: true,
    restoredCount: restoredSchedules.length,
  };
}

/**
 * Cek apakah ada backup snapshot yang bisa di-undo
 */
export async function checkCanUndo() {
  const lastBackup = await prisma.auditLog.findFirst({
    where: { action: "SCHEDULE_SNAPSHOT_BACKUP" },
  });
  return lastBackup !== null;
}
