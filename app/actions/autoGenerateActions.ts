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
      data: { name: "2026/2027 Ganjil", isActive: true }
    });
  }
  return activeYear.id;
}

export async function runAutoGenerator() {
  try {
    const academicYearId = await getActiveAcademicYearId();
    const result = await generateAutomaticSchedule(academicYearId);
    
    revalidatePath("/master/classes");
    revalidatePath("/master/auto-generate");
    revalidatePath("/master/print");
    revalidatePath("/");
    return result;
  } catch (err: any) {
    console.error("Error saat Auto-Generate:", err);
    return {
      success: false,
      error: err.message || "Gagal menyusun jadwal otomatis.",
      generatedCount: 0,
      unassigned: [],
    };
  }
}

export async function runUndoGenerator() {
  try {
    const academicYearId = await getActiveAcademicYearId();
    const result = await undoLastScheduleGeneration(academicYearId);

    revalidatePath("/master/classes");
    revalidatePath("/master/auto-generate");
    revalidatePath("/master/print");
    revalidatePath("/");
    return result;
  } catch (err: any) {
    console.error("Error saat Undo:", err);
    return {
      success: false,
      error: err.message || "Gagal memulihkan jadwal sebelumnya.",
      restoredCount: 0,
    };
  }
}

export async function getCanUndoStatus() {
  try {
    return await checkCanUndo();
  } catch {
    return false;
  }
}
