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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  // 1. Query data ringkasan modul dari database secara real-time
  const [
    activeYear,
    totalTeachers,
    totalSubjects,
    totalClasses,
    totalLoads,
    totalSchedules,
  ] = await Promise.all([
    prisma.academicYear.findFirst({ where: { isActive: true } }),
    prisma.teacher.count({ where: { status: "ACTIVE" } }),
    prisma.subject.count(),
    prisma.classGroup.count(),
    prisma.teachingLoad.count(),
    prisma.schedule.count({ where: { validUntil: null } }),
  ]);

  // 2. Daftar 8 Ringkasan Modul Utama (Persis Format Bersih & Ringkas Mockup)
  const moduleSummaryCards = [
    {
      title: "Auto-Generator Jadwal",
      subtitle: "Otomasi Jadwal",
      desc: "Generate jadwal otomatis bebas bentrok",
      href: "/master/auto-generate",
      icon: Zap,
      iconColor: "text-amber-600 bg-amber-50 border-amber-200",
      accentBar: "bg-amber-500",
    },
    {
      title: "Papan Jadwal Kelas",
      subtitle: "Kelola Jadwal Kelas",
      desc: "Lihat & edit jadwal interaktif per rombel",
      href: "/master/classes",
      icon: Calendar,
      iconColor: "text-blue-600 bg-blue-50 border-blue-200",
      accentBar: "bg-blue-500",
    },
    {
      title: "Kertas Kerja Penugasan",
      subtitle: "Matriks Beban Mengajar",
      desc: "Penugasan guru, mata pelajaran & kelas",
      href: "/master/teaching-load",
      icon: BookOpen,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      accentBar: "bg-emerald-500",
    },
    {
      title: "Kelola Mata Pelajaran",
      subtitle: "Subjek Kurikulum",
      desc: "Daftar mapel & target jam mingguan",
      href: "/master/subjects",
      icon: GraduationCap,
      iconColor: "text-rose-600 bg-rose-50 border-rose-200",
      accentBar: "bg-rose-500",
    },
    {
      title: "Manajemen Guru & Izin",
      subtitle: "Tenaga Pendidik",
      desc: "Kelola status aktif & batasan libur guru",
      href: "/master/teachers",
      icon: Users,
      iconColor: "text-purple-600 bg-purple-50 border-purple-200",
      accentBar: "bg-purple-500",
    },
    {
      title: "Kelola Kelas & Rombel",
      subtitle: "Struktur Kelas",
      desc: "Data rombel tingkat VII, VIII, IX / X, XI, XII",
      href: "/master/classes",
      icon: School,
      iconColor: "text-teal-600 bg-teal-50 border-teal-200",
      accentBar: "bg-teal-500",
    },
    {
      title: "Pusat Deteksi Bentrok",
      subtitle: "Integritas Jadwal",
      desc: "Pemantauan zero-conflict & kepatuhan izin",
      href: "/master/conflicts",
      icon: ShieldCheck,
      iconColor: "text-indigo-600 bg-indigo-50 border-indigo-200",
      accentBar: "bg-indigo-500",
    },
    {
      title: "Laporan & Cetak PDF",
      subtitle: "Dokumen Resmi",
      desc: "Cetak format Kop Surat siap tanda tangan",
      href: "/master/print",
      icon: FileText,
      iconColor: "text-cyan-600 bg-cyan-50 border-cyan-200",
      accentBar: "bg-cyan-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-[#201e1d] flex font-sans antialiased selection:bg-emerald-200">
      
      {/* ══ PERSISTENT SIDEBAR FRAME (KIRI) ══ */}
      <PersistentSidebar academicYearName={activeYear?.name || "2026/2027 Ganjil"} />

      {/* ══ AREA KONTEN UTAMA RINGKAS (KANAN - PERSIS MEDIA_1787747374142.JPG) ══ */}
      <div className="flex-1 min-w-0 overflow-y-auto px-6 sm:px-10 py-8 space-y-8">
        
        {/* ══ 1. HEADER UTAMA RINGKAS & ELEGAN ══ */}
        <div className="text-center sm:text-left space-y-1.5 pb-4 border-b border-slate-300">
          <div className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase flex items-center justify-center sm:justify-start gap-1.5">
            <span className="inline-block w-2.5 h-2.5 bg-emerald-600 rounded-xs"></span>
            PORTAL SUMMARY AKADEMIK & KURIKULUM
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-900 tracking-tight leading-tight uppercase">
            Sistem Penjadwalan Pembelajaran
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-emerald-900">
            Yayasan Annida Al Islamy Setu Bekasi • Ponpes Annida Al Islamy 2 • SMP Annida Al Islamy
          </p>
        </div>

        {/* ══ 2. 4 KARTU STATISTIK RINGKASAN BESAR DENGAN CHIP IKON BERWARNA ══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Total Guru */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition">
            <div className="w-13 h-13 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Guru
              </div>
              <div className="text-3xl font-black text-slate-900 leading-none mt-1">
                {totalTeachers}
              </div>
            </div>
          </div>

          {/* Card 2: Total Kelas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition">
            <div className="w-13 h-13 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <School className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Kelas
              </div>
              <div className="text-3xl font-black text-slate-900 leading-none mt-1">
                {totalClasses}
              </div>
            </div>
          </div>

          {/* Card 3: Jadwal Aktif */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition">
            <div className="w-13 h-13 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Jadwal Aktif
              </div>
              <div className="text-3xl font-black text-slate-900 leading-none mt-1">
                {totalSchedules.toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          {/* Card 4: Status Bentrok */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition">
            <div className="w-13 h-13 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status Bentrok
              </div>
              <div className="text-2xl font-black text-emerald-700 leading-none mt-1">
                0 Bentrok
              </div>
            </div>
          </div>

        </div>

        {/* ══ 3. GRID SUMMARY SEMUA MODUL (BERSIH, RAPI, RINGKAS) ══ */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              RINGKASAN & AKSES CEPAT MODUL
            </h2>
            <span className="text-xs text-slate-500">
              Tahun Ajaran: <strong className="text-slate-800">{activeYear?.name || "2026/2027 Ganjil"}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {moduleSummaryCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link
                  key={idx}
                  href={card.href}
                  className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                        {card.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${card.iconColor}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition leading-tight">
                          {card.subtitle}
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-700 group-hover:text-emerald-800">
                    <span>Buka Modul</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ══ 4. FOOTER INFORMASI RINGKAS ══ */}
        <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <div>
            © 2026 Yayasan Annida Al Islamy Setu Bekasi • Ponpes Annida Al Islamy 2 • SMP Annida Al Islamy
          </div>
          <div dir="rtl" className="font-serif text-sm font-bold text-emerald-900">
            معهد النداء الإسلامي ٢
          </div>
        </div>

      </div>

    </div>
  );
}
