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
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8 pb-32">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <School className="w-4 h-4" />
            Rombongan Belajar (Rombel)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Manajemen Struktur Kelas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar kelas aktif Tahun Ajaran {activeYear?.name || "2026/2027 Ganjil"} beserta progres keterisian jam belajar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/master/teaching-load"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition"
          >
            <BookOpen className="w-4 h-4 text-slate-600" />
            Kertas Kerja
          </Link>
          <Link
            href="/master/auto-generate"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition"
          >
            <Sparkles className="w-4 h-4" />
            Auto-Generator
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Form Tambah Kelas */}
        <div className="lg:col-span-1">
          <div className="p-6 border border-slate-200 rounded-2xl shadow-xs bg-white sticky top-24 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Tambah Rombel Baru</h2>
            </div>

            <form action={addClassGroup} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kelas / Rombel
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Misal: Kelas VII-A / X-1"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Otomatis terhubung dengan Tahun Ajaran yang aktif.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Simpan Rombel
              </button>
            </form>
          </div>
        </div>

        {/* Daftar Kelas & Progres */}
        <div className="lg:col-span-2">
          <div className="border border-slate-200 rounded-2xl shadow-xs overflow-hidden bg-white">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Daftar Rombel ({classes.length} Kelas)
              </span>
              <span className="text-xs text-slate-500">
                Klik Atur Jadwal untuk membuka Papan Interaktif
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Nama Kelas</th>
                  <th className="px-4 py-3.5 text-center">Beban / Jam Terisi</th>
                  <th className="px-4 py-3.5">Keterpenuhan</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Belum ada data kelas pada tahun ajaran ini.
                    </td>
                  </tr>
                ) : (
                  classes.map((c) => {
                    const targetJam = c.teachingLoads.reduce((sum, tl) => sum + tl.targetPeriods, 0) || 30;
                    const jamTerisi = c.schedules.length;
                    const persen = Math.min(100, Math.round((jamTerisi / (targetJam || 1)) * 100));

                    let badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
                    let barColor = "bg-emerald-500";

                    if (jamTerisi === 0) {
                      badgeClass = "bg-rose-100 text-rose-800 border-rose-200";
                      barColor = "bg-rose-500";
                    } else if (jamTerisi < targetJam) {
                      badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                      barColor = "bg-amber-500";
                    }

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                          <School className="w-4 h-4 text-emerald-600 shrink-0" />
                          {c.name}
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-slate-700">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {jamTerisi} / {targetJam} jam
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${barColor} transition-all duration-500`}
                                style={{ width: `${persen}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">
                              {persen}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/master/classes/${c.id}/scheduler`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Atur Jadwal
                            <ArrowRight className="w-3 h-3" />
                          </Link>
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
