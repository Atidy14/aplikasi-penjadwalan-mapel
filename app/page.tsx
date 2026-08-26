import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import PersistentSidebar from "@/app/components/PersistentSidebar";
import {
  Calendar,
  Zap,
  BookOpen,
  Users,
  GraduationCap,
  School,
  History,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default async function Home() {
  // 1. Query data statistik & master dari database secara real-time
  const [
    activeYear,
    totalTeachers,
    totalSubjects,
    totalClasses,
    totalLoads,
    totalSchedules,
    classGroups,
    recentAudits,
  ] = await Promise.all([
    prisma.academicYear.findFirst({ where: { isActive: true } }),
    prisma.teacher.count({ where: { status: "ACTIVE" } }),
    prisma.subject.count(),
    prisma.classGroup.count(),
    prisma.teachingLoad.count(),
    prisma.schedule.count({ where: { validUntil: null } }),
    prisma.classGroup.findMany({
      include: {
        schedules: {
          where: { validUntil: null },
        },
        teachingLoads: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 4,
    }),
  ]);

  // 2. Hitung progres penyusunan per rombel
  const rombelProgress = classGroups.map((cls) => {
    const targetJam = cls.teachingLoads.reduce((sum, tl) => sum + tl.targetPeriods, 0) || 30;
    const jamTerisi = cls.schedules.length;
    const persen = Math.min(100, Math.round((jamTerisi / (targetJam || 1)) * 100));

    let status = "Terkunci";
    let badgeClass = "bg-emerald-50 text-emerald-800 border-emerald-300";
    let aksiLabel = "Lihat";

    if (jamTerisi === 0) {
      status = "Kosong";
      badgeClass = "bg-rose-50 text-rose-800 border-rose-300";
      aksiLabel = "Susun";
    } else if (jamTerisi < targetJam) {
      status = "Draf";
      badgeClass = "bg-amber-50 text-amber-800 border-amber-300";
      aksiLabel = "Lanjutkan";
    }

    return {
      id: cls.id,
      nama: cls.name,
      waliKelas: "Wali Kelas " + cls.name,
      jamTerisi,
      targetJam,
      persen,
      status,
      badgeClass,
      aksiLabel,
    };
  });

  const pendingClasses = rombelProgress.filter((r) => r.persen < 100);

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-[#201e1d] flex font-sans antialiased selection:bg-emerald-200">
      
      {/* ══ PERSISTENT SIDEBAR FRAME (KIRI) ══ */}
      <PersistentSidebar academicYearName={activeYear?.name || "2026/2027 Ganjil"} />

      {/* ══ AREA KONTEN UTAMA (KANAN - PERSIS MEDIA_1787744155604.PNG) ══ */}
      <div className="flex-1 min-w-0 overflow-y-auto px-6 sm:px-10 py-8">
        
        {/* Header Kicker, Title & Top Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
          <div>
            <div className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase mb-1 flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 bg-emerald-600 rounded-xs"></span>
              PORTAL TERPADU
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-bold text-[#201e1d] tracking-tight leading-tight mb-1">
              Penjadwalan mata pelajaran
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              T.A. {activeYear?.name || "2026/2027 · Ganjil"} · Yayasan Annida Al Islamy Setu Bekasi (Ponpes Annida Al Islamy 2 • SMP Annida)
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/master/auto-generate"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-md text-xs sm:text-sm font-semibold shadow-2xs transition"
            >
              <Zap className="w-4 h-4 text-slate-700" />
              Auto-Generator
            </Link>
            <Link
              href="/master/classes"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs sm:text-sm font-semibold shadow-2xs transition"
            >
              <Calendar className="w-4 h-4" />
              Buka papan jadwal
            </Link>
          </div>
        </div>

        {/* ══ 4 METRIK STATISTIK BESAR DENGAN IKON DUOTONE ══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-slate-300 mb-10">
          <div>
            <Users className="w-6 h-6 text-emerald-700 mb-2" />
            <div className="font-serif font-bold text-4xl sm:text-5xl text-[#201e1d] tracking-tight leading-none">
              {totalTeachers}
            </div>
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-2">
              Guru Aktif
            </div>
          </div>

          <div>
            <School className="w-6 h-6 text-emerald-700 mb-2" />
            <div className="font-serif font-bold text-4xl sm:text-5xl text-[#201e1d] tracking-tight leading-none">
              {totalClasses}
            </div>
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-2">
              Rombel Kelas
            </div>
          </div>

          <div>
            <GraduationCap className="w-6 h-6 text-emerald-700 mb-2" />
            <div className="font-serif font-bold text-4xl sm:text-5xl text-[#201e1d] tracking-tight leading-none">
              {totalSubjects}
            </div>
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-2">
              Mata Pelajaran
            </div>
          </div>

          <div>
            <Clock className="w-6 h-6 text-emerald-700 mb-2" />
            <div className="font-serif font-bold text-4xl sm:text-5xl text-[#201e1d] tracking-tight leading-none">
              {totalSchedules.toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-2">
              Blok Jadwal Aktif
            </div>
          </div>
        </div>

        {/* ══ DUA KOLOM: STATUS ROMBEL (KIRI) & PERLU PERHATIAN / AUDIT (KANAN) ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Kolom Kiri: Status Penyusunan per Rombel */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              STATUS PENYUSUNAN PER ROMBEL
            </h2>

            <div className="bg-white border border-slate-300 rounded-sm shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                    <th className="px-4 py-3 w-[22%]">Rombel</th>
                    <th className="px-4 py-3 w-[24%]">Wali Kelas</th>
                    <th className="px-3 py-3 w-[16%] text-center">Jam Terisi</th>
                    <th className="px-4 py-3">Progres</th>
                    <th className="px-3 py-3 w-[18%] text-center">Status</th>
                    <th className="px-3 py-3 w-[10%] text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rombelProgress.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Belum ada data rombel kelas.
                      </td>
                    </tr>
                  ) : (
                    rombelProgress.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          {r.nama}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {r.waliKelas}
                        </td>
                        <td className="px-3 py-3.5 text-center font-medium text-slate-800">
                          {r.jamTerisi} / {r.targetJam}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 transition-all duration-300"
                              style={{ width: `${r.persen}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${r.badgeClass}`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <Link
                            href={`/master/classes/${r.id}/scheduler`}
                            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                          >
                            {r.aksiLabel}
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kolom Kanan: Sidebar Perlu Perhatian & Audit Log */}
          <aside className="space-y-8">
            
            {/* Box 1: Perlu Perhatian */}
            <div>
              <h3 className="text-xs font-bold tracking-wider text-slate-700 uppercase mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-pink-700" />
                PERLU PERHATIAN
              </h3>

              {pendingClasses.length === 0 ? (
                <div className="border-l-2 border-emerald-600 pl-3 py-1 text-xs">
                  <div className="font-bold text-slate-900">Seluruh Kelas Terpenuhi</div>
                  <p className="text-slate-500 mt-0.5">Semua rombel telah mencapai 100% target jam pelajaran.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingClasses.slice(0, 3).map((pc) => (
                    <div key={pc.id} className="border-l-2 border-pink-600 pl-3 py-1 text-xs">
                      <div className="font-bold text-slate-900">
                        {pc.nama} Belum Lengkap
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        Tersisa {pc.targetJam - pc.jamTerisi} jam kosong yang perlu dijadwalkan.
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Box 2: Audit Log Terakhir */}
            <div>
              <h3 className="text-xs font-bold tracking-wider text-slate-700 uppercase mb-3 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-emerald-700" />
                AUDIT LOG TERAKHIR
              </h3>

              <div className="space-y-2.5 text-xs">
                {recentAudits.length === 0 ? (
                  <p className="text-slate-400">Belum ada aktivitas tercatat.</p>
                ) : (
                  recentAudits.map((a) => (
                    <div key={a.id} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0"></span>
                      <div className="text-slate-700">
                        <span className="text-slate-400 font-mono text-[10.5px]">
                          {new Date(a.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>{" "}
                        <span className="font-semibold text-slate-900">{a.action}</span> · {a.performedBy}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link
                href="/master/audit"
                className="text-[11px] font-bold text-emerald-800 hover:underline inline-block mt-3"
              >
                Lihat semua
              </Link>
            </div>

          </aside>

        </div>

      </div>

    </div>
  );
}
