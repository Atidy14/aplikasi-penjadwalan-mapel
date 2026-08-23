"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

// =======================
// TEACHER ACTIONS
// =======================
export async function getTeachers() {
  return await prisma.teacher.findMany({
    orderBy: { name: "asc" },
  });
}

export async function addTeacher(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.teacher.create({
    data: { name },
  });
  revalidatePath("/master/teachers");
}

export async function updateTeacher(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.teacher.update({
    where: { id },
    data: { name },
  });
  revalidatePath("/master/teachers");
}

export async function toggleTeacherStatus(id: string, currentStatus: "ACTIVE" | "INACTIVE") {
  await prisma.teacher.update({
    where: { id },
    data: { status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });
  revalidatePath("/master/teachers");
}

// =======================
// SUBJECT ACTIONS
// =======================
export async function getSubjects() {
  return await prisma.subject.findMany({
    orderBy: { name: "asc" },
  });
}

export async function addSubject(formData: FormData) {
  const name = formData.get("name") as string;
  const targetPeriodsPerWeek = Number(formData.get("targetPeriodsPerWeek"));
  if (!name || isNaN(targetPeriodsPerWeek)) return;

  await prisma.subject.create({
    data: { name, targetPeriodsPerWeek },
  });
  revalidatePath("/master/subjects");
}

export async function updateSubject(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const targetPeriodsPerWeek = Number(formData.get("targetPeriodsPerWeek"));
  if (!name || isNaN(targetPeriodsPerWeek)) return;

  await prisma.subject.update({
    where: { id },
    data: { name, targetPeriodsPerWeek },
  });
  revalidatePath("/master/subjects");
}

// =======================
// CLASSGROUP ACTIONS
// =======================
async function getActiveAcademicYearId() {
  let activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  if (!activeYear) {
    activeYear = await prisma.academicYear.create({
      data: { name: "Default Tahun Ajaran", isActive: true }
    });
  }
  return activeYear.id;
}

export async function getClassGroups() {
  const academicYearId = await getActiveAcademicYearId();
  return await prisma.classGroup.findMany({
    where: { academicYearId },
    orderBy: { name: "asc" },
  });
}

export async function addClassGroup(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  const academicYearId = await getActiveAcademicYearId();
  await prisma.classGroup.create({
    data: { name, academicYearId },
  });
  revalidatePath("/master/classes");
}

export async function updateClassGroup(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.classGroup.update({
    where: { id },
    data: { name },
  });
  revalidatePath("/master/classes");
}

