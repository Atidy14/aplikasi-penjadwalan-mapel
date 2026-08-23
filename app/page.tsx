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
} from "lucide-react";

export default async function Home() {
  // Query data statistik dari database secara real-time
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
      title: "Mata Pelajaran",
      category: "Kurikulum",
      desc: "Daftar mata pelajaran beserta target jam pelajaran standar per minggu.",
      href: "/master/subjects",
      icon: GraduationCap,
      badge: `${totalSubjects} Mapel`,
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
      color: "from-cyan-600 to-blue-700",
      iconBg: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
      highlight: false,
    },
    {
      title: "Struktur Kelas",
      category: "Rombongan Belajar",
      desc: "Kelola kelas tingkat X, XI, dan XII yang dibuka pada tahun ajaran aktif.",
      href: "/master/classes",
      icon: School,
      badge: `${totalClasses} Rombel`,
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      color: "from-rose-600 to-pink-700",
      iconBg: "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
      highlight: false,
    },
    {
      title: "Serah Terima Guru",
      category: "Turnover Staf",
      desc: "Pindahkan seluruh jadwal mengajar antar-guru secara historis tanpa kehilangan data.",
      href: "/master/teachers",
      icon: ShieldCheck,
      badge: "Soft-Transfer",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
      color: "from-teal-600 to-emerald-700",
      iconBg: "bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
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
      <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Sistem Informasi Penjadwalan Mata Pelajaran Terpadu</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Tahun Ajaran Aktif: <strong className="text-white">{activeYear?.name || "2026/2027 Ganjil"}</strong></span>
            <span>|</span>
            <span className="text-emerald-300">Status: Siap Beroperasi</span>
          </div>
        </div>
      </div>

      {/* Header Portal Utama */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition">
              📅
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-2">
                SIP-MAPEL
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  v2.0 Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Sistem Penjadwalan Sekolah Otomatis</p>
            </div>
          </Link>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/master/classes"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Calendar className="w-4 h-4" />
              Papan Jadwal
            </Link>
            <Link
              href="/master/auto-generate"
              className="inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 fill-current" />
              Auto-Generate
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Banner ala Portal Publik BPJS Ketenagakerjaan */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white py-16 px-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Algoritma Penjadwalan Cerdas Bebas Bentrok
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4 text-white">
              Penyusunan Jadwal Sekolah Lebih <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Cepat, Akurat & Otomatis.</span>
            </h1>
            
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
              Portal manajemen penugasan guru dan penyusunan jadwal belajar mengajar terintegrasi. Dilengkapi validasi bentrok instan, ketersediaan guru, serta rekam jejak historis lengkap.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/master/auto-generate"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition transform hover:-translate-y-0.5 text-sm"
              >
                <Zap className="w-4 h-4 fill-current" />
                Mulai Auto-Generate Jadwal
              </Link>
              <Link
                href="/master/teaching-load"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-6 py-3.5 rounded-xl backdrop-blur-sm transition text-sm"
              >
                <BookOpen className="w-4 h-4" />
                Atur Kertas Kerja (Beban Guru)
              </Link>
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
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{totalSubjects}</div>
              <div className="text-xs font-semibold text-slate-500">Mata Pelajaran</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">{totalSchedules}</div>
              <div className="text-xs font-semibold text-slate-500">Blok Jadwal Aktif</div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Menu Portal Layanan Utama (ala BPJS Ketenagakerjaan) */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <div className="text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Menu Portal Terpadu
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pilihan Layanan & Pengelolaan Jadwal
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            Pilih menu layanan di bawah ini untuk mengakses modul konfigurasi, pengaturan guru, hingga eksekusi penjadwalan.
          </p>
        </div>

        {/* Grid Cards Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 ${
                  item.highlight
                    ? "border-indigo-200 ring-2 ring-indigo-500/20 bg-gradient-to-b from-indigo-50/30 to-white"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Card Header: Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition duration-300 ${item.iconBg}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Category & Title */}
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {item.category}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition mb-2">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {item.desc}
                  </p>
                </div>

                {/* Card Action Link */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>Buka Modul</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition duration-200" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Section Alur Kerja Ringkas (Workflow Steps) */}
      <section className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Panduan Langkah Mudah
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              4 Langkah Cepat Menghasilkan Jadwal Sempurna
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="font-bold text-base mb-1">Input Data Master</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tambahkan data Guru, Mata Pelajaran beserta target jam, dan Rombel Kelas yang dibuka.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="font-bold text-base mb-1">Susun Kertas Kerja</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tugaskan guru mana yang mengajar mapel apa di tiap kelas pada menu Kertas Kerja.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="font-bold text-base mb-1">Eksekusi Auto-Generate</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Klik tombol Auto-Generator. Algoritma akan mendistribusikan jadwal bebas bentrok.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h4 className="font-bold text-base mb-1">Tinjau Papan Jadwal</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lihat hasil grid jadwal per kelas, monitor pemenuhan jam, atau sesuaikan slot jika perlu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Portal */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} <strong>SIP-MAPEL</strong> — Sistem Informasi Penjadwalan Mata Pelajaran.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/master/teachers" className="hover:text-emerald-700">Guru</Link>
            <Link href="/master/classes" className="hover:text-emerald-700">Kelas</Link>
            <Link href="/master/subjects" className="hover:text-emerald-700">Mapel</Link>
            <Link href="/master/teaching-load" className="hover:text-emerald-700">Kertas Kerja</Link>
            <Link href="/master/auto-generate" className="hover:text-emerald-700 font-bold text-emerald-600">Auto-Generate</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
