import { prisma } from "../prisma";

export type ValidationStatus = "MATCH" | "UNDER" | "OVER";

export interface ValidationResult {
  scheduledPeriods: number;
  targetPeriods: number;
  status: ValidationStatus;
  message: string;
}

/**
 * Fungsi ScheduleValidator
 * Menghitung jumlah jam pelajaran yang sudah dijadwalkan untuk mata pelajaran 
 * tertentu di suatu kelas, dan membandingkannya dengan target durasinya.
 * 
 * @param classGroupId ID dari Kelas (ClassGroup)
 * @param subjectId ID dari Mata Pelajaran (Subject)
 * @returns Objek ValidationResult yang berisi status dan pesan peringatan jika tidak sesuai target
 */
export async function validateSubjectPeriods(
  classGroupId: string,
  subjectId: string
): Promise<ValidationResult> {
  // 1. Ambil target jam pelajaran dari tabel Subject
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { name: true, targetPeriodsPerWeek: true },
  });

  if (!subject) {
    throw new Error("Mata pelajaran tidak ditemukan.");
  }

  // 2. Hitung jumlah jadwal yang saat ini AKTIF untuk kelas & mapel ini.
  // Jadwal aktif ditandai dengan validUntil yang bernilai null.
  const scheduledCount = await prisma.schedule.count({
    where: {
      classGroupId,
      subjectId,
      validUntil: null, // Hanya hitung yang sedang aktif saat ini
    },
  });

  const { targetPeriodsPerWeek } = subject;
  
  // 3. Bandingkan dan buat pesan hasil analisis
  let status: ValidationStatus = "MATCH";
  let message = `Jumlah jadwal pelajaran ${subject.name} sudah sesuai target (${targetPeriodsPerWeek} jam/minggu).`;

  if (scheduledCount < targetPeriodsPerWeek) {
    status = "UNDER";
    message = `?? Kurang jam: Mata pelajaran ${subject.name} baru dijadwalkan ${scheduledCount} kali dari target ${targetPeriodsPerWeek} kali per minggu.`;
  } else if (scheduledCount > targetPeriodsPerWeek) {
    status = "OVER";
    message = `?? Kelebihan jam: Mata pelajaran ${subject.name} dijadwalkan ${scheduledCount} kali, melebihi target ${targetPeriodsPerWeek} kali per minggu.`;
  }

  return {
    scheduledPeriods: scheduledCount,
    targetPeriods: targetPeriodsPerWeek,
    status,
    message,
  };
}

