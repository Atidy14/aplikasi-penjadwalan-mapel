"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
import { validateSubjectPeriods, ValidationResult } from "../lib/services/scheduleValidationService";

// =======================
// SCHEDULER ACTIONS
// =======================

export async function getSchedulesByClass(classGroupId: string) {
  return await prisma.schedule.findMany({
    where: {
      classGroupId,
      validUntil: null,
    },
    include: {
      subject: true,
      teacher: true,
    },
  });
}

export async function getAllTimeSettings() {
  return await prisma.timeSetting.findMany({
    orderBy: { periodNumber: "asc" },
  });
}

export async function getSchedulerDropdownData() {
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  const teachers = await prisma.teacher.findMany({ 
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" } 
  });
  return { subjects, teachers };
}

export async function assignScheduleSlot(
  classGroupId: string,
  dayOfWeek: DayOfWeek,
  periodNumber: number,
  subjectId: string,
  teacherId: string
) {
  // 1. Validasi Bentrok Guru: Pastikan guru ini belum mengajar di kelas lain pada hari & jam yang sama
  const teacherConflict = await prisma.schedule.findFirst({
    where: {
      teacherId,
      dayOfWeek,
      periodNumber,
      validUntil: null, // Cek hanya jadwal yang masih aktif
      NOT: {
        classGroupId // Abaikan jika ini adalah update slot yang sama di kelas yang sama
      }
    },
    include: {
      classGroup: true
    }
  });

  if (teacherConflict) {
    throw new Error(`BENTROK: Guru ini sudah dijadwalkan mengajar di ${teacherConflict.classGroup.name} pada jam ini.`);
  }

  // 2. Nonaktifkan (soft-delete) jadwal yang ada di slot ini saat ini (jika ada)
  const existingSchedule = await prisma.schedule.findFirst({
    where: {
      classGroupId,
      dayOfWeek,
      periodNumber,
      validUntil: null,
    }
  });

  if (existingSchedule) {
    await prisma.schedule.update({
      where: { id: existingSchedule.id },
      data: { validUntil: new Date() },
    });
  }

  const classGroup = await prisma.classGroup.findUniqueOrThrow({ where: { id: classGroupId }});

  // 3. Buat jadwal baru
  await prisma.schedule.create({
    data: {
      academicYearId: classGroup.academicYearId,
      classGroupId,
      dayOfWeek,
      periodNumber,
      subjectId,
      teacherId,
    }
  });

  revalidatePath(`/master/classes/${classGroupId}/scheduler`);
}

export async function clearScheduleSlot(
  classGroupId: string,
  dayOfWeek: DayOfWeek,
  periodNumber: number
) {
  const existingSchedule = await prisma.schedule.findFirst({
    where: {
      classGroupId,
      dayOfWeek,
      periodNumber,
      validUntil: null,
    }
  });

  if (existingSchedule) {
    await prisma.schedule.update({
      where: { id: existingSchedule.id },
      data: { validUntil: new Date() },
    });
    revalidatePath(`/master/classes/${classGroupId}/scheduler`);
  }
}

export async function getClassSubjectValidations(classGroupId: string) {
  const subjects = await prisma.subject.findMany();
  
  const validations = await Promise.all(
    subjects.map(async (subject) => {
      const result = await validateSubjectPeriods(classGroupId, subject.id);
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        ...result
      };
    })
  );

  return validations;
}

