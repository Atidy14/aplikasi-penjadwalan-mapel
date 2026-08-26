import { getClassGroups, addClassGroup } from "@/app/actions/masterDataActions";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import {
  School,
  Plus,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClassesPage() {
  const activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  const academicYearId = activeYear?.id || "";

  const classes = await prisma.classGroup.findMany({
    where: { academicYearId },
    include: {
      schedules: {
        where: { validUntil: null },
      },
      teachingLoads: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6 pb-32">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-300 pb-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase mb-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
            ROMBONGAN BELAJAR (ROMBEL)
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
            Struktur Kelas & Progres Jam
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar kelas aktif Tahun Ajaran {activeYear?.name || "2026/2027 Ganjil"} beserta pemenuhan jam kurikulum.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Link
              href="/master/teaching-load"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-600" />
              <span>Kertas Kerja</span>
            </Link>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-56 animate-in fade-in zoom-in-95">
              <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                📋 <strong>Kertas Kerja:</strong> Atur beban mengajar guru dan mapel untuk kelas-kelas ini.
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
            </div>
          </div>

          <div className="relative group">
            <Link
              href="/master/auto-generate"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Generator</span>
            </Link>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-56 animate-in fade-in zoom-in-95">
              <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                ⚡ <strong>Auto-Generator:</strong> Susun jadwal seluruh rombel kelas ini secara otomatis.
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form Tambah Kelas */}
        <div className="lg:col-span-1">
          <div className="p-5 border border-slate-200 rounded-2xl shadow-xs bg-white space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Tambah Rombel Baru</h2>
            </div>

            <form action={addClassGroup} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Rombongan Belajar
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  placeholder="Misal: Kelas VII-1 / X-A"
                />
              </div>

              <div className="relative group">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg shadow-xs transition text-xs flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Simpan Rombel
                </button>

                {/* Hanging Pop Penjelasan */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-56 animate-in fade-in zoom-in-95">
                  <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                    💾 <strong>Simpan Rombel:</strong> Daftarkan kelas baru ke dalam tahun ajaran yang sedang aktif.
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Tabel Daftar Kelas & Progres */}
        <div className="lg:col-span-2">
          <div className="border border-slate-200 rounded-2xl shadow-xs overflow-hidden bg-white">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                Daftar Rombel ({classes.length} Kelas)
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="px-5 py-3">Nama Kelas</th>
                  <th className="px-4 py-3 text-center">Beban / Terisi</th>
                  <th className="px-4 py-3">Progres Keterpenuhan</th>
                  <th className="px-5 py-3 text-right">Papan Jadwal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      Belum ada data kelas pada tahun ajaran ini.
                    </td>
                  </tr>
                ) : (
                  classes.map((c) => {
                    const targetJam = c.teachingLoads.reduce((sum, tl) => sum + tl.targetPeriods, 0) || 30;
                    const jamTerisi = c.schedules.length;
                    const persen = Math.min(100, Math.round((jamTerisi / (targetJam || 1)) * 100));

                    let barColor = "bg-emerald-600";
                    if (jamTerisi === 0) {
                      barColor = "bg-rose-500";
                    } else if (jamTerisi < targetJam) {
                      barColor = "bg-amber-500";
                    }

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <School className="w-4 h-4 text-emerald-700 shrink-0" />
                          {c.name}
                        </td>
                        <td className="px-4 py-3.5 text-center font-medium text-slate-700">
                          {jamTerisi} / {targetJam} JP
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${barColor}`}
                                style={{ width: `${persen}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">
                              {persen}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          
                          {/* Tombol Atur Jadwal dengan Hanging Popup */}
                          <div className="relative group inline-block">
                            <Link
                              href={`/master/classes/${c.id}/scheduler`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-xs font-bold transition"
                            >
                              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                              Papan Jadwal
                              <ArrowRight className="w-3 h-3" />
                            </Link>

                            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-56 animate-in fade-in zoom-in-95">
                              <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                                📅 <strong>Papan Jadwal:</strong> Buka lembar grid jadwal mingguan khusus kelas {c.name}.
                              </div>
                              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
                            </div>
                          </div>

                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
