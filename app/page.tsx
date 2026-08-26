import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
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
  AlertCircle,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
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

    let status = "Lengkap";
    let badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
    let barColor = "bg-emerald-500";

    if (jamTerisi === 0) {
      status = "Belum Terjadwal";
      badgeClass = "bg-rose-100 text-rose-800 border-rose-200";
      barColor = "bg-rose-500";
    } else if (jamTerisi < targetJam) {
      status = `Kurang ${targetJam - jamTerisi} Jam`;
      badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
      barColor = "bg-amber-500";
    } else if (jamTerisi > targetJam) {
      status = `Lebih ${jamTerisi - targetJam} Jam`;
      badgeClass = "bg-purple-100 text-purple-800 border-purple-200";
      barColor = "bg-purple-500";
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
      barColor,
    };
  });

  // 3. Deteksi Peringatan Perlu Perhatian
  const pendingClasses = rombelProgress.filter((r) => r.persen < 100);
  const totalWarnings = pendingClasses.length;

  const menuItems = [
    {
      title: "Auto-Generator Jadwal",
      category: "Layanan Otomatis",
      desc: "Susun ratusan blok jadwal seluruh kelas dalam sekali klik bebas bentrok guru & ruang.",
      href: "/master/auto-generate",
      icon: Zap,
      badge: "Utama & Cepat",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      color: "from-indigo-600 to-blue-700",
      iconBg: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
      highlight: true,
    },
    {
      title: "Papan Penjadwalan Kelas",
      category: "Jadwal Interaktif",
      desc: "Lihat dan sesuaikan grid jadwal per kelas (Senin-Sabtu) dengan progress target jam.",
      href: "/master/classes",
      icon: Calendar,
      badge: `${totalClasses} Kelas Aktif`,
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      color: "from-emerald-600 to-teal-700",
      iconBg: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
      highlight: false,
    },
    {
      title: "Kertas Kerja Penugasan",
      category: "Matriks Beban",
      desc: "Atur penugasan Guru apa mengajar Mapel apa di Kelas mana beserta alokasi jam/minggu.",
      href: "/master/teaching-load",
      icon: BookOpen,
      badge: `${totalLoads} Penugasan`,
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      color: "from-blue-600 to-indigo-700",
      iconBg: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
      highlight: false,
    },
    {
      title: "Manajemen Guru & Izin",
      category: "Tenaga Pendidik",
      desc: "Kelola status keaktifan guru dan atur jadwal berhalangan / request izin hari tertentu.",
      href: "/master/teachers",
      icon: Users,
      badge: `${totalTeachers} Guru`,
      badgeColor: "bg-violet-100 text-violet-800 border-violet-200",
      color: "from-violet-600 to-purple-700",
      iconBg: "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
      highlight: false,
    },
    {
      title: "Pusat Deteksi Bentrok",
      category: "Validasi Mutlak",
      desc: "Periksa dan pantau integritas jadwal dari potensi bentrok jam guru & ruang kelas.",
      href: "/master/conflicts",
      icon: ShieldCheck,
      badge: "Zero Conflict",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      color: "from-teal-600 to-emerald-700",
      iconBg: "bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
      highlight: false,
    },
    {
      title: "Cetak & Ekspor PDF",
      category: "Dokumen Resmi",
      desc: "Cetak lembar jadwal resmi per kelas atau per guru lengkap dengan kop surat dan kolom tanda tangan.",
      href: "/master/print",
      icon: FileText,
      badge: "Siap Cetak",
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
      color: "from-cyan-600 to-blue-700",
      iconBg: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
      highlight: false,
    },
    {
      title: "Mata Pelajaran",
      category: "Kurikulum",
      desc: "Daftar mata pelajaran beserta target jam pelajaran standar per minggu.",
      href: "/master/subjects",
      icon: GraduationCap,
      badge: `${totalSubjects} Mapel`,
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      color: "from-amber-600 to-orange-700",
      iconBg: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
      highlight: false,
    },
    {
      title: "Riwayat & Audit Log",
      category: "Pengawasan Sistem",
      desc: "Pantau catatan aktivitas perubahan jadwal, mutasi guru, dan histori auto-generator.",
      href: "/master/audit",
      icon: History,
      badge: "Log Aktivitas",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
      color: "from-slate-700 to-slate-900",
      iconBg: "bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Bar Informasi */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-2 px-6 border-b border-emerald-900/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-200">
              Yayasan Annida Al Islamy Setu Bekasi • Ponpes Annida Al Islamy 2 • SMP Annida Al Islamy
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Tahun Ajaran: <strong className="text-white font-bold">{activeYear?.name || "2026/2027 Ganjil"}</strong></span>
            <span>|</span>
            <span className="text-emerald-300 font-medium">Status: Siap Beroperasi</span>
          </div>
        </div>
      </div>

      {/* Header Portal Utama */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          
          {/* Logo & 3-Tier Compact Institutional Title */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo 5 Buku Hijau */}
            <div className="w-12 h-14 rounded-lg overflow-hidden border border-emerald-200 bg-emerald-50 p-0.5 shadow-xs group-hover:scale-105 transition shrink-0 flex items-center justify-center">
              <img
                src="/annida-logo.jpg"
                alt="Logo Annida Al Islamy"
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* 3 Baris Nama Lembaga (Format Kecil & Rapi) */}
            <div className="flex flex-col justify-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 tracking-tight leading-tight uppercase">
                Yayasan Annida Al Islamy Setu Bekasi
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                Ponpes Annida Al Islamy 2 Setu Bekasi
              </span>
              <div className="text-[11px] sm:text-xs font-bold text-emerald-700 leading-tight flex items-center gap-2 mt-0.5">
                <span>SMP Annida Al Islamy</span>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                  SIP-MAPEL v2.0 Pro
                </span>
              </div>
            </div>
          </Link>

          {/* Kaligrafi Arab & Aksi Cepat */}
          <div className="flex items-center gap-5">
            {/* Tulisan Arab Elegan */}
            <div dir="rtl" className="hidden lg:block text-xl sm:text-2xl font-black text-emerald-800 tracking-wide font-serif">
              معهد النداء الإسلامي ٢
            </div>

            {/* Tombol Pintas */}
            <div className="flex items-center gap-2">
              <Link
                href="/master/classes"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                <Calendar className="w-4 h-4 text-emerald-600" />
                Papan Jadwal
              </Link>
              <Link
                href="/master/auto-generate"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                Auto-Generate
              </Link>
            </div>
          </div>

        </div>
      </header>

      {/* Hero Section Banner ala Portal BPJS / Lembaga Pendidikan */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white py-14 px-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            
            <div className="max-w-3xl">
              {/* Badge Lembaga Dwibahasa */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Annida Al Islamy 2 Islamic Boarding School</span>
                <span>•</span>
                <span dir="rtl" className="font-bold">معهد النداء الإسلامي ٢</span>
              </div>
              
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3 text-white">
                Sistem Penjadwalan Pembelajaran Terpadu
              </h1>
              
              <p className="text-emerald-300 font-semibold text-sm sm:text-base mb-2">
                SMP Annida Al Islamy — Ponpes Annida Al Islamy 2 Setu Bekasi
              </p>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 max-w-2xl">
                Portal terpadu manajemen penugasan guru pengampu dan penyusunan jadwal belajar mengajar bebas bentrok. Dilengkapi modul ketersediaan waktu guru, serah terima jabatan historis, dan cetak PDF resmi.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/master/auto-generate"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition transform hover:-translate-y-0.5 text-xs sm:text-sm"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  Mulai Auto-Generate Jadwal
                </Link>
                <Link
                  href="/master/teaching-load"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-5 py-3 rounded-xl backdrop-blur-sm transition text-xs sm:text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Kertas Kerja Penugasan
                </Link>
                <Link
                  href="/master/conflicts"
                  className="inline-flex items-center gap-2 bg-teal-900/60 hover:bg-teal-900 text-teal-100 border border-teal-700/60 font-semibold px-5 py-3 rounded-xl backdrop-blur-sm transition text-xs sm:text-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Pusat Bentrok
                </Link>
                <Link
                  href="/master/print"
                  className="inline-flex items-center gap-2 bg-emerald-800/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60 font-semibold px-5 py-3 rounded-xl backdrop-blur-sm transition text-xs sm:text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Cetak Rekap PDF
                </Link>
              </div>
            </div>

            {/* Kaligrafi Arab Besar di Banner Kanan */}
            <div className="hidden lg:flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-center">
              <div dir="rtl" className="text-3xl font-black text-emerald-300 font-serif leading-relaxed">
                معهد النداء الإسلامي ٢
              </div>
              <div className="text-[11px] font-bold text-slate-300 tracking-wider uppercase mt-1">
                Annida Al Islamy 2
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">
                Setu, Bekasi - Jawa Barat
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Quick Statistics Bar */}
      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{totalTeachers}</div>
              <div className="text-xs font-semibold text-slate-500">Guru Terdaftar</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{totalClasses}</div>
              <div className="text-xs font-semibold text-slate-500">Total Rombel Kelas</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{totalLoads}</div>
              <div className="text-xs font-semibold text-slate-500">Matriks Kertas Kerja</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{totalSchedules}</div>
              <div className="text-xs font-semibold text-slate-500">Blok Jam Terjadwal</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION BARU (DARI PROTOTYPE CLAUDE): STATUS ROMBEL & PANEL AUDIT */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Kolom Kiri: Tabel Status Penyusunan per Rombel (2 Kolom) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Status Penyusunan Jadwal per Rombel
                </h3>
                <p className="text-xs text-slate-500">
                  Monitoring keterpenuhan jam pelajaran per kelas terhadap target Kertas Kerja.
                </p>
              </div>
              <Link
                href="/master/classes"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                Lihat Semua Kelas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Rombel</th>
                    <th className="px-4 py-3.5 text-center">Jam Terisi</th>
                    <th className="px-4 py-3.5">Progres Keterpenuhan</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rombelProgress.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                        Belum ada kelas yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    rombelProgress.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {r.nama}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-700">
                          {r.jamTerisi} / {r.targetJam} jam
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${r.barColor} transition-all duration-500`}
                              style={{ width: `${r.persen}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.badgeClass}`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            href={`/master/classes/${r.id}/scheduler`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded-md hover:bg-emerald-50 transition"
                          >
                            Buka Papan <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kolom Kanan: Panel Perlu Perhatian & Feed Audit (1 Kolom) */}
          <div className="space-y-6">
            
            {/* Box 1: Perlu Perhatian */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Perlu Perhatian</span>
                {totalWarnings > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {totalWarnings} Kelas
                  </span>
                )}
              </div>

              {totalWarnings === 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Seluruh kelas telah 100% lengkap terjadwal!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingClasses.slice(0, 3).map((pc) => (
                    <div
                      key={pc.id}
                      className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-slate-700 flex justify-between items-center"
                    >
                      <div>
                        <strong className="text-slate-900">{pc.nama}</strong>
                        <p className="text-[11px] text-amber-800">
                          Masih tersisa {pc.targetJam - pc.jamTerisi} jam kosong.
                        </p>
                      </div>
                      <Link
                        href={`/master/classes/${pc.id}/scheduler`}
                        className="text-[11px] font-bold text-amber-900 underline"
                      >
                        Lengkapi
                      </Link>
                    </div>
                  ))}
                  {totalWarnings > 3 && (
                    <p className="text-[11px] text-slate-400 text-center pt-1">
                      + {totalWarnings - 3} kelas lainnya memerlukan pengisian.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Box 2: Feed Audit Log Terakhir */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-slate-900 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Aktivitas Sistem Terakhir</span>
                </div>
                <Link
                  href="/master/audit"
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Lihat Semua
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentAudits.length === 0 ? (
                  <p className="text-xs text-slate-400">Belum ada aktivitas tercatat.</p>
                ) : (
                  recentAudits.map((a) => (
                    <div key={a.id} className="text-xs flex items-start gap-2 border-b border-slate-100 pb-2 last:border-none last:pb-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                      <div>
                        <span className="font-bold text-slate-800">{a.action}</span>
                        <p className="text-[10px] text-slate-400">
                          {new Date(a.timestamp).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })} • oleh {a.performedBy}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Grid Menu Portal (8 Layanan Utama) */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Menu Layanan Terintegrasi
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pusat Navigasi Kurikulum & Penjadwalan
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Pilih modul di bawah ini untuk mengelola data master guru, rombel kelas, menyusun kertas kerja, hingga mencetak dokumen jadwal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`group relative p-6 bg-white rounded-2xl border transition duration-200 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 ${
                  item.highlight
                    ? "border-indigo-300 ring-2 ring-indigo-500/20 shadow-md"
                    : "border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${item.iconBg}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {item.category}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-emerald-600 transition">
                  <span>Buka Modul</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Alur Kerja 4 Langkah */}
      <section className="bg-slate-100 border-y border-slate-200 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              4 Langkah Mudah Menyusun Jadwal Sekolah
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Ikuti alur standar berikut untuk memastikan seluruh jadwal terdistribusi optimal tanpa bentrok.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-xs border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Lengkapi Master Data</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Daftarkan Guru, Mata Pelajaran, dan Struktur Kelas di menu master.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-xs border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Atur Kertas Kerja</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tentukan penugasan guru pengampu dan target jam mengajar per minggu di menu Kertas Kerja.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-xs border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-black text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Jalankan Auto-Generator</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Klik tombol Auto-Generate untuk memetakan ratusan jam pelajaran secara instan dan bebas bentrok.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-xs border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Tinjau & Cetak PDF</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Periksa hasil di Papan Jadwal dan cetak dokumen resmi per kelas atau per guru siap tanda tangan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Resmi Lembaga */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-10 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <img
              src="/annida-logo.jpg"
              alt="Logo Annida Al Islamy"
              className="w-10 h-12 object-contain rounded bg-white/10 p-1"
            />
            <div>
              <div className="font-bold text-slate-200 text-sm">
                Yayasan Annida Al Islamy Setu Bekasi
              </div>
              <p className="text-[11px] text-slate-400">
                Ponpes Annida Al Islamy 2 Setu Bekasi • SMP Annida Al Islamy
              </p>
              <p className="text-[10px] text-emerald-400 font-semibold" dir="rtl">
                معهد النداء الإسلامي ٢
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            <p>© 2026 Yayasan Annida Al Islamy Setu Bekasi. Seluruh Hak Cipta Dilindungi.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Sistem Informasi Penjadwalan Pelajaran Sekolah (SIP-MAPEL v2.0 Pro)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
