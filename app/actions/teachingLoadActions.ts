"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

async function getActiveAcademicYearId() {
  let activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  if (!activeYear) {
    activeYear = await prisma.academicYear.create({
      data: { name: "Default Tahun Ajaran", isActive: true }
    });
  }
  return activeYear.id;
}

export async function getTeachingLoads() {
  const academicYearId = await getActiveAcademicYearId();
  return await prisma.teachingLoad.findMany({
    where: { academicYearId },
    include: {
      classGroup: true,
      subject: true,
      teacher: true,
    },
    orderBy: [
      { classGroup: { name: "asc" } },
      { subject: { name: "asc" } }
    ]
  });
}

export async function getDropdownData() {
  const academicYearId = await getActiveAcademicYearId();
  const classes = await prisma.classGroup.findMany({ where: { academicYearId }, orderBy: { name: "asc" } });
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  const teachers = await prisma.teacher.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } });
  
  return { classes, subjects, teachers };
}

export async function addTeachingLoad(formData: FormData) {
  const academicYearId = await getActiveAcademicYearId();
  const classGroupId = formData.get("classGroupId") as string;
  const subjectId = formData.get("subjectId") as string;
  const teacherId = formData.get("teacherId") as string;
  const targetPeriods = Number(formData.get("targetPeriods"));

  if (!classGroupId || !subjectId || !teacherId || isNaN(targetPeriods)) {
    throw new Error("Data tidak lengkap.");
  }

  // Gunakan upsert agar tidak ada duplikasi data (1 mapel 1 kelas 1 guru)
  await prisma.teachingLoad.upsert({
    where: {
      academicYearId_classGroupId_subjectId: {
        academicYearId,
        classGroupId,
        subjectId
      }
    },
    update: {
      teacherId,
      targetPeriods
    },
    create: {
      academicYearId,
      classGroupId,
      subjectId,
      teacherId,
      targetPeriods
    }
  });

  revalidatePath("/master/teaching-load");
}

export async function deleteTeachingLoad(id: string) {
  await prisma.teachingLoad.delete({ where: { id } });
  revalidatePath("/master/teaching-load");
}

