"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { DayOfWeek } from "../lib/services/autoGeneratorService";

export async function getTeacherConstraints(teacherId: string) {
  return await prisma.teacherConstraint.findMany({
    where: { teacherId },
  });
}

export async function toggleTeacherConstraint(teacherId: string, dayOfWeek: DayOfWeek, periodNumber: number) {
  // Cek apakah sudah ada
  const existing = await prisma.teacherConstraint.findUnique({
    where: {
      teacherId_dayOfWeek_periodNumber: {
        teacherId,
        dayOfWeek,
        periodNumber
      }
    }
  });

  if (existing) {
    await prisma.teacherConstraint.delete({ where: { id: existing.id } });
  } else {
    await prisma.teacherConstraint.create({
      data: {
        teacherId,
        dayOfWeek,
        periodNumber
      }
    });
  }

  revalidatePath("/master/teachers");
}

