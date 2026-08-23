import { prisma } from "../app/lib/prisma";
import {
  generateAutomaticSchedule,
  undoLastScheduleGeneration,
} from "../app/lib/services/autoGeneratorService";
import { processTeacherHandover } from "../app/actions/handoverActions";

interface TestResult {
  controlId: string;
  domain: string;
  name: string;
  passed: boolean;
  metric: string;
  details: string;
}

const results: TestResult[] = [];

function recordTest(
  controlId: string,
  domain: string,
  name: string,
  passed: boolean,
  metric: string,
  details: string
) {
  results.push({ controlId, domain, name, passed, metric, details });
  const statusIcon = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`[${statusIcon}] [${controlId}] ${name}`);
  console.log(`       ↳ Metrik: ${metric}`);
  if (!passed) console.log(`       ↳ Error: ${details}`);
}

async function runCisaAuditTestSuite() {
  console.log("================================================================================");
  console.log("      ISACA / CISA COMPLIANCE UNIT TEST & ASSURANCE TEST SUITE v2.0            ");
  console.log("      Standard: ITAF (IT Assurance Framework) & ISO/IEC 25010 Quality Model     ");
  console.log("================================================================================\n");

  const activeYear = await prisma.academicYear.findFirst({
    where: { isActive: true },
  });

  if (!activeYear) {
    console.error("FATAL: Tidak ditemukan Tahun Ajaran Aktif di database.");
    process.exit(1);
  }

  const academicYearId = activeYear.id;

  // -------------------------------------------------------------------------
  // 1. SETUP BASELINE: Pastikan Jadwal Ter-Generate untuk Diuji
  // -------------------------------------------------------------------------
  console.log("▶ [SETUP] Menjalankan Auto-Generator untuk membangun baseline dataset...");
  const genResult = await generateAutomaticSchedule(academicYearId);
  console.log(`       ↳ Baseline terbangun dengan ${genResult.generatedCount} blok jadwal.\n`);

  // -------------------------------------------------------------------------
  // CONTROL DOMAIN 1: DATA INTEGRITY & ZERO CONFLICT (AC-1)
  // -------------------------------------------------------------------------
  console.log("--- DOMAIN 1: INTEGRITY & ZERO CONFLICT ASSURANCE (AC-1) ---");

  // TEST 1.1: Teacher Slot Uniqueness (Guru tidak boleh mengajar di 2 kelas di waktu yang sama)
  try {
    const allSchedules = await prisma.schedule.findMany({
      where: { academicYearId, validUntil: null },
    });

    const teacherSlotMap = new Map<string, number>();
    let teacherConflicts = 0;

    for (const s of allSchedules) {
      const key = `${s.teacherId}_${s.dayOfWeek}_${s.periodNumber}`;
      const count = (teacherSlotMap.get(key) || 0) + 1;
      teacherSlotMap.set(key, count);
      if (count > 1) teacherConflicts++;
    }

    recordTest(
      "AC-1.1",
      "Data Integrity",
      "Teacher Multi-Booking Invariant (Zero Conflict Guru)",
      teacherConflicts === 0,
      `Bentrok Guru: ${teacherConflicts} slot (Toleransi: 0)`,
      teacherConflicts > 0 ? "Ditemukan guru mengajar ganda di jam yang sama" : "Ok"
    );
  } catch (err: any) {
    recordTest("AC-1.1", "Data Integrity", "Teacher Multi-Booking Invariant", false, "Error", err.message);
  }

  // TEST 1.2: Class Slot Collision Invariant (Satu kelas tidak boleh diisi 2 mapel/guru sekaligus)
  try {
    const allSchedules = await prisma.schedule.findMany({
      where: { academicYearId, validUntil: null },
    });

    const classSlotMap = new Map<string, number>();
    let classCollisions = 0;

    for (const s of allSchedules) {
      const key = `${s.classGroupId}_${s.dayOfWeek}_${s.periodNumber}`;
      const count = (classSlotMap.get(key) || 0) + 1;
      classSlotMap.set(key, count);
      if (count > 1) classCollisions++;
    }

    recordTest(
      "AC-1.2",
      "Data Integrity",
      "Class Room Collision Invariant (Zero Collision Kelas)",
      classCollisions === 0,
      `Tabrakan Kelas: ${classCollisions} slot (Toleransi: 0)`,
      classCollisions > 0 ? "Ditemukan kelas memiliki 2 mapel bersamaan" : "Ok"
    );
  } catch (err: any) {
    recordTest("AC-1.2", "Data Integrity", "Class Room Collision Invariant", false, "Error", err.message);
  }

  // -------------------------------------------------------------------------
  // CONTROL DOMAIN 2: BUSINESS RULES & CONSTRAINT COMPLIANCE (AC-2)
  // -------------------------------------------------------------------------
  console.log("\n--- DOMAIN 2: BUSINESS RULES & CONSTRAINT COMPLIANCE (AC-2) ---");

  // TEST 2.1: Teacher Constraints (Larangan / Izin Guru Dihormati 100%)
  try {
    const constraints = await prisma.teacherConstraint.findMany();
    let constraintViolations = 0;

    for (const c of constraints) {
      const violatedSchedule = await prisma.schedule.findFirst({
        where: {
          academicYearId,
          teacherId: c.teacherId,
          dayOfWeek: c.dayOfWeek as any,
          periodNumber: c.periodNumber,
          validUntil: null,
        },
      });

      if (violatedSchedule) {
        constraintViolations++;
      }
    }

    recordTest(
      "AC-2.1",
      "Compliance",
      "Teacher Availability Constraint Adherence (Kepatuhan Izin Guru)",
      constraintViolations === 0,
      `Pelanggaran Izin Guru: ${constraintViolations} / ${constraints.length} batasan teruji`,
      constraintViolations > 0 ? "Algoritma menempatkan jadwal pada jam libur guru" : "Ok"
    );
  } catch (err: any) {
    recordTest("AC-2.1", "Compliance", "Teacher Availability Constraint Adherence", false, "Error", err.message);
  }

  // TEST 2.2: Daily Subject Period Ceiling (Maksimal 2 jam mapel yang sama per hari per kelas)
  try {
    const allSchedules = await prisma.schedule.findMany({
      where: { academicYearId, validUntil: null },
    });

    const subjectDayMap = new Map<string, number>();
    let dailyLimitViolations = 0;

    for (const s of allSchedules) {
      const key = `${s.classGroupId}_${s.subjectId}_${s.dayOfWeek}`;
      const count = (subjectDayMap.get(key) || 0) + 1;
      subjectDayMap.set(key, count);
      if (count > 2) dailyLimitViolations++;
    }

    recordTest(
      "AC-2.2",
      "Compliance",
      "Pedagogical Fatigue Limit (Maksimal 2 Jam Mapel Serupa per Hari)",
      dailyLimitViolations === 0,
      `Pelanggaran Jam Harian: ${dailyLimitViolations} kasus`,
      dailyLimitViolations > 0 ? "Ada mapel diajarkan lebih dari 2 jam dalam 1 hari di kelas yang sama" : "Ok"
    );
  } catch (err: any) {
    recordTest("AC-2.2", "Compliance", "Pedagogical Fatigue Limit", false, "Error", err.message);
  }

  // -------------------------------------------------------------------------
  // CONTROL DOMAIN 3: TRACEABILITY & AUDIT TRAIL (AC-3)
  // -------------------------------------------------------------------------
  console.log("\n--- DOMAIN 3: TRACEABILITY & AUDIT TRAIL LOGGING (AC-3) ---");

  // TEST 3.1: Immutability & Completeness of Audit Trail
  try {
    const recentAudit = await prisma.auditLog.findFirst({
      where: { action: "AUTO_GENERATE_SCHEDULE" },
      orderBy: { timestamp: "desc" },
    });

    const hasAuditRecord =
      recentAudit !== null &&
      recentAudit.timestamp !== undefined &&
      recentAudit.performedBy !== null;

    recordTest(
      "AC-3.1",
      "Auditability",
      "Non-Repudiation Audit Log Verification (Pencatatan Audit Trail)",
      hasAuditRecord,
      `Log ID: ${recentAudit?.id || "N/A"} | Timestamp: ${recentAudit?.timestamp.toISOString() || "N/A"}`,
      hasAuditRecord ? "Ok" : "Tidak ditemukan log pencatatan aksi auto-generator"
    );
  } catch (err: any) {
    recordTest("AC-3.1", "Auditability", "Non-Repudiation Audit Log Verification", false, "Error", err.message);
  }

  // -------------------------------------------------------------------------
  // CONTROL DOMAIN 4: RESILIENCE & ROLLBACK RECOVERY (AC-4)
  // -------------------------------------------------------------------------
  console.log("\n--- DOMAIN 4: RESILIENCE & ROLLBACK RECOVERY (AC-4) ---");

  // TEST 4.1: Snapshot Backup & Undo Rollback Accuracy
  try {
    // 1. Simpan count awal
    const countBeforeNewGen = await prisma.schedule.count({
      where: { academicYearId, validUntil: null },
    });

    // 2. Jalankan generate baru (akan otomatis membuat backup snapshot)
    await generateAutomaticSchedule(academicYearId);

    // 3. Jalankan Undo Rollback
    const undoRes = await undoLastScheduleGeneration(academicYearId);

    const countAfterUndo = await prisma.schedule.count({
      where: { academicYearId, validUntil: null },
    });

    const undoSuccess = countAfterUndo === countBeforeNewGen && countAfterUndo > 0;

    recordTest(
      "AC-4.1",
      "Resilience",
      "Snapshot State Recovery & Undo Precision (Presisi Pemulihan Snapshot)",
      undoSuccess,
      `Jadwal Awal: ${countBeforeNewGen} | Dipulihkan: ${countAfterUndo} (Delta: ${Math.abs(countBeforeNewGen - countAfterUndo)})`,
      undoSuccess ? "Ok" : "Jumlah jadwal setelah undo tidak sama persis dengan baseline awal"
    );
  } catch (err: any) {
    recordTest("AC-4.1", "Resilience", "Snapshot State Recovery & Undo Precision", false, "Error", err.message);
  }

  // TEST 4.2: Historical Soft-Delete Handover Integrity (Non-Destructive Turnover)
  try {
    const teachers = await prisma.teacher.findMany({ where: { status: "ACTIVE" } });
    if (teachers.length >= 2) {
      const oldTeacher = teachers[0];
      const newTeacher = teachers[1];

      // Ambil jadwal guru lama yang aktif
      const oldSchedules = await prisma.schedule.findMany({
        where: { teacherId: oldTeacher.id, validUntil: null },
      });

      if (oldSchedules.length > 0) {
        const formData = new FormData();
        formData.append("oldTeacherId", oldTeacher.id);
        formData.append("newTeacherId", newTeacher.id);
        formData.append("effectiveDate", "2026-09-01");

        // Eksekusi Serah Terima
        await processTeacherHandover(formData);

        // Verifikasi arsip lama tidak terhapus (soft-deleted with validUntil)
        const archivedOldCount = await prisma.schedule.count({
          where: { teacherId: oldTeacher.id, NOT: { validUntil: null } },
        });

        // Verifikasi jadwal baru terbentuk untuk guru baru
        const newTeacherActiveCount = await prisma.schedule.count({
          where: { teacherId: newTeacher.id, validUntil: null },
        });

        const handoverIntegrity = archivedOldCount > 0 && newTeacherActiveCount > 0;

        recordTest(
          "AC-4.2",
          "Resilience",
          "Non-Destructive Turnover & Soft-Delete Preservation",
          handoverIntegrity,
          `Arsip Guru Lama Tersimpan: ${archivedOldCount} | Jadwal Baru Guru Pengganti: ${newTeacherActiveCount}`,
          handoverIntegrity ? "Ok" : "Gagal memverifikasi rantai masa berlaku validFrom/validUntil"
        );
      }
    }
  } catch (err: any) {
    recordTest("AC-4.2", "Resilience", "Non-Destructive Turnover Integrity", false, "Error", err.message);
  }

  // -------------------------------------------------------------------------
  // CONTROL DOMAIN 5: UPSERT INTEGRITY & BOUNDARY CONTROLS (AC-5)
  // -------------------------------------------------------------------------
  console.log("\n--- DOMAIN 5: BOUNDARY CONTROLS & UPSERT INTEGRITY (AC-5) ---");

  // TEST 5.1: Duplicate Teaching Load Upsert Invariant
  try {
    const sampleLoad = await prisma.teachingLoad.findFirst({
      where: { academicYearId },
    });

    if (sampleLoad) {
      const originalCount = await prisma.teachingLoad.count({
        where: { academicYearId },
      });

      // Lakukan upsert pada kombinasi yang sama (Class, Subject, AcademicYear) dengan targetPeriods diubah
      await prisma.teachingLoad.upsert({
        where: {
          academicYearId_classGroupId_subjectId: {
            academicYearId,
            classGroupId: sampleLoad.classGroupId,
            subjectId: sampleLoad.subjectId,
          },
        },
        update: { targetPeriods: sampleLoad.targetPeriods },
        create: {
          academicYearId,
          classGroupId: sampleLoad.classGroupId,
          subjectId: sampleLoad.subjectId,
          teacherId: sampleLoad.teacherId,
          targetPeriods: sampleLoad.targetPeriods,
        },
      });

      const countAfterUpsert = await prisma.teachingLoad.count({
        where: { academicYearId },
      });

      const upsertInvariantPassed = countAfterUpsert === originalCount;

      recordTest(
        "AC-5.1",
        "Data Integrity",
        "Unique Compound Constraint & Upsert Idempotence",
        upsertInvariantPassed,
        `Total Record: ${originalCount} -> ${countAfterUpsert} (Delta: 0 Duplikasi)`,
        upsertInvariantPassed ? "Ok" : "Terjadi duplikasi penugasan mapel pada kelas yang sama"
      );
    }
  } catch (err: any) {
    recordTest("AC-5.1", "Data Integrity", "Unique Compound Constraint", false, "Error", err.message);
  }

  // -------------------------------------------------------------------------
  // REKAPITULASI LAPORAN AUDIT CISA
  // -------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("                   RINGKASAN HASIL AUDIT TEKNIS CISA                            ");
  console.log("================================================================================");

  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.filter((r) => !r.passed).length;
  const complianceRate = ((totalPassed / results.length) * 100).toFixed(2);

  console.log(`Total Kontrol Audit Diuji : ${results.length} Unit Tests`);
  console.log(`Hasil Lolos (PASS)        : ${totalPassed}`);
  console.log(`Hasil Gagal (FAIL)        : ${totalFailed}`);
  console.log(`Tingkat Kepatuhan (Score) : ${complianceRate}%`);
  console.log(`Status Opini Auditor     : ${totalFailed === 0 ? "UNQUALIFIED OPINION (CLEAN / MEMENUHI STANDAR TINGGI)" : "QUALIFIED OPINION (PERLU PERBAIKAN)"}`);
  console.log("================================================================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runCisaAuditTestSuite()
  .catch((err) => {
    console.error("FATAL ERROR DALAM TEST SUITE:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
