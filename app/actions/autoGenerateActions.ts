"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import {
  generateAutomaticSchedule,
  undoLastScheduleGeneration,
  checkCanUndo,
} from "../lib/services/autoGeneratorService";

async function getActiveAcademicYearId() {
  let activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  if (!activeYear) {
    activeYear = await prisma.academicYear.create({
      data: { name: "Default Tahun Ajaran", isActive: true }
    });
  }
  return activeYear.id;
}

export async function runAutoGenerator() {
  const academicYearId = await getActiveAcademicYearId();
  const result = await generateAutomaticSchedule(academicYearId);
  
  revalidatePath("/master/classes");
  revalidatePath("/master/auto-generate");
  revalidatePath("/master/print");
  revalidatePath("/");
  return result;
}

export async function runUndoGenerator() {
  const academicYearId = await getActiveAcademicYearId();
  const result = await undoLastScheduleGeneration(academicYearId);

  revalidatePath("/master/classes");
  revalidatePath("/master/auto-generate");
  revalidatePath("/master/print");
  revalidatePath("/");
  return result;
}

export async function getCanUndoStatus() {
  return await checkCanUndo();
}
