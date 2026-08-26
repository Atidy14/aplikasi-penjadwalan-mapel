import { getTeachingLoads, getDropdownData, addTeachingLoad, deleteTeachingLoad } from "@/app/actions/teachingLoadActions";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  School,
  GraduationCap,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeachingLoadPage() {
  const loads = await getTeachingLoads();
  const { classes, subjects, teachers } = await getDropdownData();

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            Matriks Penugasan Mengajar
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Kertas Kerja (Teaching Load)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tentukan Guru mana yang mengajar Mata Pelajaran apa di Kelas yang mana beserta alokasi jam/minggu.
          </p>
        </div>

        {/* Tombol Lanjut ke Auto-Generator dengan Hanging Tooltip */}
        <div className="relative group">
          <Link
            href="/master/auto-generate"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-indigo-500/25 transition transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            Lanjut ke Auto-Generator
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Tooltip Mengambang */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-end z-40 pointer-events-none w-64 animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-3 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
              ⚡ <strong>Auto-Generator:</strong> Susun seluruh jadwal otomatis secara instan berdasarkan Kertas Kerja ini.
            </div>
            <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 mr-6 border-r border-b border-slate-700"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ============================================================ */}
        {/* FORM TAMBAH PENUGASAN */}
        {/* ============================================================ */}
        <div className="lg:col-span-1">
          <div className="p-6 border border-slate-200 rounded-2xl shadow-sm bg-white sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Tambah Penugasan</h2>
            </div>

            <form action={addTeachingLoad} className="space-y-4">
              {/* Field Kelas */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Rombel Kelas</label>
                  {/* Tooltip Info Kelas */}
                  <div className="relative group inline-block">
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                    <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:flex flex-col items-end z-40 pointer-events-none w-48">
                      <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-md text-center">
                        Pilih kelas sasaran yang akan diajar.
                      </div>
                      <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-0.5 mr-1"></div>
                    </div>
                  </div>
                </div>
                <select
                  name="classGroupId"
                  required
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field Mata Pelajaran */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Mata Pelajaran</label>
                  {/* Tooltip Info Mapel */}
                  <div className="relative group inline-block">
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                    <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:flex flex-col items-end z-40 pointer-events-none w-52">
                      <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-md text-center">
                        Pilih mata pelajaran yang dialokasikan.
                      </div>
                      <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-0.5 mr-1"></div>
                    </div>
                  </div>
                </div>
                <select
                  name="subjectId"
                  required
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Mapel --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.targetPeriodsPerWeek} jam)
                    </option>
                  ))}
                </select>
              </div>

              {/* Field Guru Pengajar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Guru Pengajar</label>
                  {/* Tooltip Info Guru */}
                  <div className="relative group inline-block">
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                    <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:flex flex-col items-end z-40 pointer-events-none w-52">
                      <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-md text-center">
                        Pilih guru yang bertanggung jawab mengajar.
                      </div>
                      <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-0.5 mr-1"></div>
                    </div>
                  </div>
                </div>
                <select
                  name="teacherId"
                  required
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field Beban Jam */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Beban Jam / Minggu</label>
                  {/* Tooltip Info Jam */}
                  <div className="relative group inline-block">
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                    <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:flex flex-col items-end z-40 pointer-events-none w-56">
                      <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-md text-center">
                        Jumlah jam pelajaran per minggu yang wajib dijadwalkan oleh algoritma.
                      </div>
                      <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-0.5 mr-1"></div>
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  name="targetPeriods"
                  min="1"
                  max="20"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Misal: 4"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Default otomatis mengikuti target jam standar Mapel.
                </p>
              </div>

              {/* Tombol Simpan dengan Hanging Tooltip */}
              <div className="relative group pt-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-md transition text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Simpan Penugasan
                </button>

                {/* Hanging Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-40 pointer-events-none w-60 animate-in fade-in zoom-in-95">
                  <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                    💾 <strong>Simpan:</strong> Masukkan penugasan ini ke dalam matriks Kertas Kerja.
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TABEL DAFTAR KERTAS KERJA */}
        {/* ============================================================ */}
        <div className="lg:col-span-2">
          <div className="border border-slate-200 rounded-2xl shadow-sm overflow-hidden bg-white">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Daftar Penugasan Aktif ({loads.length} Baris)
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Tersusun untuk Tahun Ajaran Berjalan
              </span>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/70 border-b text-slate-700 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Kelas</th>
                  <th className="px-6 py-3.5">Mata Pelajaran</th>
                  <th className="px-6 py-3.5">Guru Pengajar</th>
                  <th className="px-6 py-3.5 text-center">Beban Jam</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                      <div className="max-w-xs mx-auto text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center font-bold">
                          📋
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Belum ada data Kertas Kerja</p>
                        <p className="text-xs text-slate-400">
                          Gunakan formulir di samping untuk menambahkan penugasan guru per kelas.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  loads.map((load) => (
                    <tr key={load.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <School className="w-4 h-4 text-slate-400 shrink-0" />
                        {load.classGroup.name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-indigo-950">
                        {load.subject.name}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {load.teacher.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {/* Tooltip Badge Jam */}
                        <div className="relative group inline-block">
                          <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold cursor-default">
                            <Clock className="w-3 h-3" />
                            {load.targetPeriods} Jam
                          </span>
                          
                          {/* Hanging Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-40 pointer-events-none w-44 animate-in fade-in zoom-in-95">
                            <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-md text-center">
                              Target {load.targetPeriods} jam pelajaran per minggu
                            </div>
                            <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-0.5 border-r border-b border-slate-700"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* Tombol Hapus dengan Hanging Tooltip */}
                        <div className="relative group inline-block">
                          <form action={deleteTeachingLoad.bind(null, load.id)}>
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Hapus
                            </button>
                          </form>

                          {/* Hanging Tooltip */}
                          <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:flex flex-col items-end z-40 pointer-events-none w-48 animate-in fade-in zoom-in-95">
                            <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-md text-center">
                              🗑️ Hapus penugasan ini dari Kertas Kerja
                            </div>
                            <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-0.5 mr-3 border-r border-b border-slate-700"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
