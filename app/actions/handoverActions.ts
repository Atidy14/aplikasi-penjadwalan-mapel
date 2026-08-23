"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

export async function processTeacherHandover(formData: FormData) {
  const oldTeacherId = formData.get("oldTeacherId") as string;
  const newTeacherId = formData.get("newTeacherId") as string;
  const effectiveDateStr = formData.get("effectiveDate") as string; // format YYYY-MM-DD
  
  if (!oldTeacherId || !newTeacherId || !effectiveDateStr) {
    throw new Error("Semua field wajib diisi.");
  }
  
  if (oldTeacherId === newTeacherId) {
    throw new Error("Guru pengganti tidak boleh sama dengan guru lama.");
  }

  const effectiveDate = new Date(effectiveDateStr);
  effectiveDate.setHours(0, 0, 0, 0); // Set ke awal hari

  await prisma.$transaction(async (tx) => {
    // 1. Ambil data guru untuk log
    const oldTeacher = await tx.teacher.findUnique({ where: { id: oldTeacherId } });
    const newTeacher = await tx.teacher.findUnique({ where: { id: newTeacherId } });
    
    if (!oldTeacher || !newTeacher) throw new Error("Data guru tidak valid.");

    // 2. Cari jadwal aktif guru lama
    const activeSchedules = await tx.schedule.findMany({
      where: {
        teacherId: oldTeacherId,
        validUntil: null, // Yang saat ini masih aktif
      },
    });

    if (activeSchedules.length === 0) {
      throw new Error("Guru lama tidak memiliki jadwal aktif yang bisa diserahterimakan.");
    }

    // 3. Update jadwal lama (validUntil) & buat jadwal baru (validFrom)
    for (const schedule of activeSchedules) {
      // Tutup jadwal lama
      await tx.schedule.update({
        where: { id: schedule.id },
        data: { validUntil: effectiveDate },
      });

      // Buka jadwal baru untuk guru pengganti
      await tx.schedule.create({
        data: {
          academicYearId: schedule.academicYearId,
          classGroupId: schedule.classGroupId,
          subjectId: schedule.subjectId,
          teacherId: newTeacherId,
          dayOfWeek: schedule.dayOfWeek,
          periodNumber: schedule.periodNumber,
          validFrom: effectiveDate,
          validUntil: null,
        }
      });
    }

    // 4. Catat ke AuditLog
    await tx.auditLog.create({
      data: {
        action: "TEACHER_HANDOVER",
        details: {
          oldTeacher: { id: oldTeacher.id, name: oldTeacher.name },
          newTeacher: { id: newTeacher.id, name: newTeacher.name },
          affectedSchedulesCount: activeSchedules.length,
          effectiveDate: effectiveDate.toISOString()
        },
        performedBy: "System Administrator" // Hardcode sementara, di sistem asli ambil dari user session
      }
    });
  });

  try {
    revalidatePath("/master/teachers");
    revalidatePath("/master/classes");
  } catch {}
}

export async function getAuditLogs() {
  return await prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 100, // Ambil 100 log terbaru
  });
}

