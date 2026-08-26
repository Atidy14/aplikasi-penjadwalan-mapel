import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Zap,
  Users,
  School,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ConflictsPage() {
  const activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  const academicYearId = activeYear?.id || "";

  // 1. Ambil seluruh jadwal aktif
  const schedules = await prisma.schedule.findMany({
    where: { academicYearId, validUntil: null },
    include: {
      teacher: true,
      subject: true,
      classGroup: true,
    },
  });

  // 2. Ambil seluruh batasan libur/izin guru
  const constraints = await prisma.teacherConstraint.findMany({
    include: { teacher: true },
  });

  // 3. Pindai Bentrok Guru (1 Guru mengajar di 2 kelas pada jam yang sama)
  const teacherSlotMap = new Map<string, typeof schedules>();
  for (const s of schedules) {
    const key = `${s.teacherId}_${s.dayOfWeek}_${s.periodNumber}`;
    const list = teacherSlotMap.get(key) || [];
    list.push(s);
    teacherSlotMap.set(key, list);
  }

  const teacherConflicts: Array<{
    teacherName: string;
    day: string;
    period: number;
    classes: string[];
    subjects: string[];
  }> = [];

  for (const [_, list] of teacherSlotMap.entries()) {
    if (list.length > 1) {
      teacherConflicts.push({
        teacherName: list[0].teacher.name,
        day: list[0].dayOfWeek,
        period: list[0].periodNumber,
        classes: list.map((l) => l.classGroup.name),
        subjects: list.map((l) => l.subject.name),
      });
    }
  }

  // 4. Pindai Tabrakan Kelas (1 Kelas memiliki 2 mapel bersamaan)
  const classSlotMap = new Map<string, typeof schedules>();
  for (const s of schedules) {
    const key = `${s.classGroupId}_${s.dayOfWeek}_${s.periodNumber}`;
    const list = classSlotMap.get(key) || [];
    list.push(s);
    classSlotMap.set(key, list);
  }

  const classCollisions: Array<{
    className: string;
    day: string;
    period: number;
    teachers: string[];
    subjects: string[];
  }> = [];

  for (const [_, list] of classSlotMap.entries()) {
    if (list.length > 1) {
      classCollisions.push({
        className: list[0].classGroup.name,
        day: list[0].dayOfWeek,
        period: list[0].periodNumber,
        teachers: list.map((l) => l.teacher.name),
        subjects: list.map((l) => l.subject.name),
      });
    }
  }

  // 5. Pindai Pelanggaran Izin Guru
  const constraintViolations: Array<{
    teacherName: string;
    day: string;
    period: number;
    className: string;
    subjectName: string;
  }> = [];

  for (const c of constraints) {
    const match = schedules.find(
      (s) =>
        s.teacherId === c.teacherId &&
        s.dayOfWeek === c.dayOfWeek &&
        s.periodNumber === c.periodNumber
    );
    if (match) {
      constraintViolations.push({
        teacherName: match.teacher.name,
        day: match.dayOfWeek,
        period: match.periodNumber,
        className: match.classGroup.name,
        subjectName: match.subject.name,
      });
    }
  }

  const totalConflicts =
    teacherConflicts.length + classCollisions.length + constraintViolations.length;

  const DAY_LABELS: Record<string, string> = {
    MONDAY: "Senin",
    TUESDAY: "Selasa",
    WEDNESDAY: "Rabu",
    THURSDAY: "Kamis",
    FRIDAY: "Jumat",
    SATURDAY: "Sabtu",
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8 pb-32">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Pusat Pengawasan Integritas Jadwal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pusat Deteksi Bentrok (Conflict Center)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pemindaian otomatis integritas data: jadwal ganda pengajar, tabrakan ruangan kelas, dan pelanggaran izin waktu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/master/auto-generate"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition"
          >
            <Zap className="w-4 h-4 fill-current" />
            Auto-Generate Ulang
          </Link>
        </div>
      </div>

      {/* Banner Status Keseluruhan */}
      {totalConflicts === 0 ? (
        <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-1">
                <Sparkles className="w-3 h-3" />
                Zero Conflict • 100% Bersih
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Integritas Jadwal Sempurna!
              </h2>
              <p className="text-xs text-slate-600">
                Tidak ditemukan bentrok guru, tabrakan kelas, maupun pelanggaran izin mengajar di seluruh {schedules.length} blok jam aktif.
              </p>
            </div>
          </div>
          <Link
            href="/master/print"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shrink-0"
          >
            Cetak Rekap Jadwal
          </Link>
        </div>
      ) : (
        <div className="p-6 bg-rose-50 border-2 border-rose-300 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-black text-rose-950">
              Terdeteksi {totalConflicts} Potensi Bentrok!
            </h2>
            <p className="text-xs text-rose-800">
              Periksa daftar detail di bawah ini dan lakukan penyesuaian manual di Papan Jadwal atau jalankan Auto-Generator Cerdas.
            </p>
          </div>
        </div>
      )}

      {/* Grid 3 Kartu Analisis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Bentrok Guru */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <Users className="w-4 h-4 text-blue-600" />
              Bentrok Multi-Booking Guru
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                teacherConflicts.length === 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {teacherConflicts.length} Kasus
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kondisi seorang guru terjadwal mengajar di lebih dari satu kelas pada hari dan jam yang persis sama.
          </p>
          {teacherConflicts.length === 0 ? (
            <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Bebas bentrok jadwal guru.
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar">
              {teacherConflicts.map((tc, i) => (
                <div key={i} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-rose-950">{tc.teacherName}</div>
                  <div className="text-slate-600">
                    Hari {DAY_LABELS[tc.day] || tc.day}, Jam ke-{tc.period}
                  </div>
                  <div className="text-rose-700 font-semibold">
                    Kelas: {tc.classes.join(" vs ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: Tabrakan Ruang Kelas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <School className="w-4 h-4 text-amber-600" />
              Tabrakan Mapel Kelas
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                classCollisions.length === 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {classCollisions.length} Kasus
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kondisi satu kelas memiliki dua mata pelajaran atau guru berbeda di jam yang bersamaan.
          </p>
          {classCollisions.length === 0 ? (
            <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Bebas tabrakan kelas.
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar">
              {classCollisions.map((cc, i) => (
                <div key={i} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-rose-950">{cc.className}</div>
                  <div className="text-slate-600">
                    Hari {DAY_LABELS[cc.day] || cc.day}, Jam ke-{cc.period}
                  </div>
                  <div className="text-rose-700 font-semibold">
                    Mapel: {cc.subjects.join(" vs ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 3: Pelanggaran Izin Guru */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <Calendar className="w-4 h-4 text-purple-600" />
              Pelanggaran Izin Guru
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                constraintViolations.length === 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {constraintViolations.length} Kasus
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Jadwal mengajar yang terpasang pada jam di mana guru telah mengajukan izin libur/kuliah.
          </p>
          {constraintViolations.length === 0 ? (
            <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Seluruh izin guru ditaati 100%.
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar">
              {constraintViolations.map((cv, i) => (
                <div key={i} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-rose-950">{cv.teacherName}</div>
                  <div className="text-slate-600">
                    Hari {DAY_LABELS[cv.day] || cv.day}, Jam ke-{cv.period}
                  </div>
                  <div className="text-rose-700 font-semibold">
                    Di {cv.className} ({cv.subjectName})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
