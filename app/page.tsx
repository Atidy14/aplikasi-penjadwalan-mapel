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
    constraints,
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
    prisma.teacherConstraint.findMany(),
  ]);

  // 2. Hitung progres penyusunan per rombel
  let totalTargetAll = 0;
  let totalFilledAll = 0;
  let fullCount = 0;

  const rombelProgress = classGroups.map((cls) => {
    const targetJam = cls.teachingLoads.reduce((sum, tl) => sum + tl.targetPeriods, 0) || 30;
    const jamTerisi = cls.schedules.length;
    totalTargetAll += targetJam;
    totalFilledAll += jamTerisi;

    const persen = Math.min(100, Math.round((jamTerisi / (targetJam || 1)) * 100));
    if (persen >= 100) fullCount++;

    let status = "Lengkap";
    let badgeClass = "bg-emerald-50 text-emerald-800 border-emerald-300";
    let barColor = "bg-emerald-600";

    if (jamTerisi === 0) {
      status = "Kosong";
      badgeClass = "bg-rose-50 text-rose-800 border-rose-300";
      barColor = "bg-rose-500";
    } else if (jamTerisi < targetJam) {
      status = `Kurang ${targetJam - jamTerisi} JP`;
      badgeClass = "bg-amber-50 text-amber-800 border-amber-300";
      barColor = "bg-amber-500";
    } else if (jamTerisi > targetJam) {
      status = `Lebih ${jamTerisi - targetJam} JP`;
      badgeClass = "bg-purple-50 text-purple-800 border-purple-300";
      barColor = "bg-purple-500";
    }

    return {
      id: cls.id,
      nama: cls.name,
      waliKelas: "Wali " + cls.name,
      jamTerisi,
      targetJam,
      persen,
      status,
      badgeClass,
      barColor,
    };
  });

  const curriculumPercent = totalTargetAll > 0 ? Math.round((totalFilledAll / totalTargetAll) * 100) : 100;

  // 3. Deteksi Peringatan Perlu Perhatian
  const pendingClasses = rombelProgress.filter((r) => r.persen < 100);

  const menuItems = [
    {
      title: "Auto-Generator Jadwal",
      category: "Layanan Otomatis",
      desc: "Susun ratusan blok jadwal seluruh kelas dalam sekali klik bebas bentrok guru & ruang.",
      href: "/master/auto-generate",
      icon: Zap,
      badge: "Utama & Cepat",
      badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
    },
    {
      title: "Papan Penjadwalan Kelas",
      category: "Jadwal Interaktif",
      desc: "Lihat dan sesuaikan grid jadwal per kelas (Senin-Sabtu) dengan progress target jam.",
      href: "/master/classes",
      icon: Calendar,
      badge: `${totalClasses} Rombel`,
      badgeColor: "bg-emerald-50 text-emerald-900 border-emerald-200",
    },
    {
      title: "Kertas Kerja Penugasan",
      category: "Matriks Beban",
      desc: "Atur penugasan Guru apa mengajar Mapel apa di Kelas mana beserta alokasi jam/minggu.",
      href: "/master/teaching-load",
      icon: BookOpen,
      badge: `${totalLoads} Matriks`,
      badgeColor: "bg-blue-50 text-blue-900 border-blue-200",
    },
    {
      title: "Manajemen Guru & Izin",
      category: "Tenaga Pendidik",
      desc: "Kelola status keaktifan guru dan atur jadwal berhalangan / request izin hari tertentu.",
      href: "/master/teachers",
      icon: Users,
      badge: `${totalTeachers} Guru`,
      badgeColor: "bg-purple-50 text-purple-900 border-purple-200",
    },
    {
      title: "Pusat Deteksi Bentrok",
      category: "Validasi Mutlak",
      desc: "Periksa dan pantau integritas jadwal dari potensi bentrok jam guru & ruang kelas.",
      href: "/master/conflicts",
      icon: ShieldCheck,
      badge: "Zero Conflict",
      badgeColor: "bg-teal-50 text-teal-900 border-teal-200",
    },
    {
      title: "Cetak & Ekspor PDF",
      category: "Dokumen Resmi",
      desc: "Cetak lembar jadwal resmi per kelas atau per guru lengkap dengan kop surat dan kolom tanda tangan.",
      href: "/master/print",
      icon: FileText,
      badge: "Siap Cetak",
      badgeColor: "bg-cyan-50 text-cyan-900 border-cyan-200",
    },
    {
      title: "Mata Pelajaran",
      category: "Kurikulum",
      desc: "Daftar mata pelajaran beserta target jam pelajaran standar per minggu.",
      href: "/master/subjects",
      icon: GraduationCap,
      badge: `${totalSubjects} Mapel`,
      badgeColor: "bg-slate-100 text-slate-900 border-slate-300",
    },
    {
      title: "Riwayat & Audit Log",
      category: "Pengawasan Sistem",
      desc: "Pantau catatan aktivitas perubahan jadwal, mutasi guru, dan histori auto-generator.",
      href: "/master/audit",
      icon: History,
      badge: "Audit Trail",
      badgeColor: "bg-slate-100 text-slate-900 border-slate-300",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-[#201e1d] font-sans antialiased selection:bg-emerald-200">
      
      {/* ══ 1. TOP NAVBAR (PERSIS PROTOTYPE CLAUDE) ══ */}
      <header className="bg-[#f7f6f4]">
        <div className="max-w-[1340px] mx-auto px-6 sm:px-10 py-3.5 flex items-center justify-between gap-6 flex-wrap">
          
          {/* Logo & Identitas Lembaga */}
          <div className="flex items-center gap-3">
            <img
              src="/annida-logo.jpg"
              alt="Logo"
              className="w-10 h-12 object-contain rounded border border-slate-300 bg-white p-0.5 shadow-2xs shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-tight text-emerald-900 uppercase leading-tight">
                Yayasan Annida Al Islamy Setu Bekasi
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                Ponpes Annida Al Islamy 2 • SMP Annida
              </span>
              <span className="text-[10px] text-slate-500 font-semibold leading-none mt-0.5">
                SIP<span className="text-emerald-700 font-black">·</span>MAPEL v2.0 Pro
              </span>
            </div>
          </div>

          {/* Navigasi Utama */}
          <nav className="flex items-center gap-4 sm:gap-6 text-[13px] font-medium">
            <Link href="/" className="text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5">
              Beranda
            </Link>
            <Link href="/master/classes" className="text-slate-700 hover:text-emerald-800 transition">
              Papan Jadwal
            </Link>
            <Link href="/master/auto-generate" className="text-slate-700 hover:text-emerald-800 transition">
              Auto-Generator
            </Link>
            <Link href="/master/teaching-load" className="text-slate-700 hover:text-emerald-800 transition">
              Kertas Kerja
            </Link>
            <Link href="/master/teachers" className="text-slate-700 hover:text-emerald-800 transition">
              Guru & Izin
            </Link>
            <Link href="/master/conflicts" className="text-slate-700 hover:text-emerald-800 transition">
              Pusat Bentrok
            </Link>
            <Link href="/master/print" className="text-slate-700 hover:text-emerald-800 transition">
              Laporan PDF
            </Link>
          </nav>

          {/* Arab & Info T.A. di Kanan */}
          <div className="flex items-center gap-4 text-xs opacity-75 ml-auto">
            <div dir="rtl" className="hidden xl:block font-serif text-lg font-bold text-emerald-900 leading-none">
              معهد النداء الإسلامي ٢
            </div>
            <span className="hidden sm:inline w-px h-3.5 bg-slate-400 opacity-40"></span>
            <span className="font-semibold text-slate-700">T.A. {activeYear?.name || "2026/2027 Ganjil"}</span>
          </div>

        </div>

        {/* Double Rule Editorial (Garis Ganda Khas Broadsheet) */}
        <div className="max-w-[1340px] mx-auto px-6 sm:px-10">
          <div className="h-[2.5px] bg-[#201e1d]"></div>
          <div className="h-[1px] bg-[#201e1d] mt-[2px]"></div>
        </div>
      </header>

      {/* ══ 2. KONTEN UTAMA BERANDA (BROADSHEET EDITORIAL) ══ */}
      <main className="max-w-[1340px] mx-auto px-6 sm:px-10 py-8 sm:py-10">
        
        {/* Header Judul & Tombol Aksi */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <div className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase mb-1.5 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
              Portal Terpadu Manajemen Kurikulum
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#201e1d] tracking-tight leading-none mb-2">
              Penjadwalan Mata Pelajaran
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              Tahun Ajaran {activeYear?.name || "2026/2027 Ganjil"} · SMP Annida Al Islamy & Ponpes Annida Al Islamy 2 Setu Bekasi
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/master/auto-generate"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded text-xs sm:text-sm font-semibold shadow-2xs transition"
            >
              <Zap className="w-4 h-4 text-emerald-700" />
              Auto-Generator
            </Link>
            <Link
              href="/master/classes"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs sm:text-sm font-semibold shadow-2xs transition"
            >
              <Calendar className="w-4 h-4" />
              Buka Papan Jadwal
            </Link>
          </div>
        </div>

        {/* ══ 3. EMPAT KOLOM STATISTIK BESAR EDITORIAL ══ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-slate-300 mb-10">
          <div className="pr-4">
            <div className="font-serif font-bold text-4xl sm:text-5xl text-[#201e1d] tracking-tight leading-none">
              {fullCount}<span className="text-xl sm:text-2xl text-slate-400 font-normal">/{totalClasses}</span>
            </div>
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-2">
              Rombel Terjadwal Penuh
            </div>
          </div>

          <div className="pr-4 md:border-l border-slate-300 md:pl-6">
            <div className="font-serif font-bold text-4xl sm:text-5xl text-emerald-700 tracking-tight leading-none">
              0
            </div>
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-2">
              Bentrok Belum Selesai
            </div>
          </div>

          <div className="pr-4 md:border-l border-slate-300 md:pl-6">
            <div className="font-serif font-bold text-4xl sm:text-5xl text-[#201e1d] tracking-tight leading-none">
              {curriculumPercent}<span className="text-xl sm:text-2xl text-slate-400 font-normal">%</span>
            </div>
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-2">
              JP Kurikulum Terpenuhi
            </div>
          </div>

          <div className="md:border-l border-slate-300 md:pl-6">
            <div className="font-serif font-bold text-4xl sm:text-5xl text-[#201e1d] tracking-tight leading-none">
              {totalTeachers}
            </div>
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-2">
              Guru Aktif Mengajar
            </div>
          </div>
        </div>

        {/* ══ 4. DUA KOLOM: TABEL STATUS ROMBEL (KIRI) & SIDEBAR (KANAN) ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start mb-16">
          
          {/* Kolom Kiri: Tabel Status Penyusunan per Rombel */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg text-slate-900">
                Status Penyusunan per Rombel
              </h2>
              <Link
                href="/master/classes"
                className="text-xs font-semibold text-emerald-800 hover:underline"
              >
                Lihat Semua ({classGroups.length} Kelas) →
              </Link>
            </div>

            <div className="bg-white border border-slate-300 rounded shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-300 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-4 py-3 w-[20%]">Rombel</th>
                    <th className="px-4 py-3 w-[22%]">Wali Kelas</th>
                    <th className="px-3 py-3 w-[16%] text-center">JP Terisi</th>
                    <th className="px-4 py-3">Progres</th>
                    <th className="px-3 py-3 w-[18%] text-center">Status</th>
                    <th className="px-3 py-3 w-[10%] text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rombelProgress.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Belum ada data kelas yang terdaftar.
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
                              className={`h-full ${r.barColor}`}
                              style={{ width: `${r.persen}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${r.badgeClass}`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <Link
                            href={`/master/classes/${r.id}/scheduler`}
                            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                          >
                            Buka
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kolom Kanan: Sidebar (Perlu Perhatian & Audit Feed) */}
          <aside className="space-y-8">
            
            {/* Panel Perlu Perhatian */}
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Perlu Perhatian
              </h3>

              {pendingClasses.length === 0 ? (
                <div className="border-l-2 border-emerald-600 pl-3 py-1 text-xs">
                  <div className="font-bold text-slate-900">Seluruh Kelas Terpenuhi</div>
                  <p className="text-slate-500 mt-0.5">Semua rombel telah mencapai 100% target jam pelajaran.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingClasses.slice(0, 3).map((pc) => (
                    <div key={pc.id} className="border-l-2 border-amber-500 pl-3 py-1 text-xs">
                      <div className="font-bold text-slate-900">
                        {pc.nama} Belum Lengkap
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        Tersisa {pc.targetJam - pc.jamTerisi} jam pelajaran kosong yang belum dialokasikan.
                      </div>
                      <Link
                        href={`/master/classes/${pc.id}/scheduler`}
                        className="text-[11px] font-bold text-emerald-800 hover:underline inline-block mt-1"
                      >
                        Buka Papan Kelas →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel Audit Log Terakhir */}
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-700" />
                Audit Log Terakhir
              </h3>

              <div className="space-y-2 text-xs">
                {recentAudits.length === 0 ? (
                  <p className="text-slate-400">Belum ada aktivitas tercatat.</p>
                ) : (
                  recentAudits.map((a) => (
                    <div key={a.id} className="flex items-start gap-2 border-b border-slate-200 pb-2 last:border-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-1.5 shrink-0"></span>
                      <div>
                        <div className="text-slate-800 font-medium leading-tight">{a.action}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(a.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB · {a.performedBy}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link
                href="/master/audit"
                className="text-[11px] font-bold text-emerald-800 hover:underline inline-block mt-3"
              >
                Lihat Semua Riwayat Audit →
              </Link>
            </div>

          </aside>

        </div>

        {/* ══ 5. GRID MENU LAYANAN (8 KARTU) ══ */}
        <section className="pt-8 border-t border-slate-300">
          <div className="mb-6">
            <h2 className="font-serif font-bold text-xl text-slate-900 mb-1">
              Modul Manajemen & Layanan Kurikulum
            </h2>
            <p className="text-xs text-slate-500">
              Pusat navigasi cepat menuju seluruh fitur operasional sistem penjadwalan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="group bg-white p-4 rounded border border-slate-300 hover:border-emerald-700 transition flex flex-col justify-between shadow-2xs hover:shadow-xs"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-8 h-8 rounded bg-slate-100 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>

                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      {item.category}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition mb-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-800 group-hover:underline">
                    <span>Buka Modul</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </main>

      {/* ══ 6. FOOTER RESMI INSTITUSI ══ */}
      <footer className="border-t-2 border-slate-900 bg-[#f7f6f4] text-slate-600 text-xs py-8 mt-16">
        <div className="max-w-[1340px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/annida-logo.jpg"
              alt="Logo"
              className="w-8 h-10 object-contain rounded bg-white p-0.5 border border-slate-300"
            />
            <div>
              <div className="font-bold text-slate-900">Yayasan Annida Al Islamy Setu Bekasi</div>
              <div className="text-[11px] text-slate-500">Ponpes Annida Al Islamy 2 • SMP Annida Al Islamy</div>
            </div>
          </div>
          <div className="text-center sm:text-right text-[11px] text-slate-500">
            <div>© 2026 Yayasan Annida Al Islamy Setu Bekasi. Seluruh Hak Cipta Dilindungi.</div>
            <div className="text-[10px] text-slate-400">Sistem Informasi Penjadwalan Pelajaran Sekolah (SIP-MAPEL v2.0 Pro)</div>
          </div>
        </div>
      </footer>

    </div>
  );
}
