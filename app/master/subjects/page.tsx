import { getSubjects, addSubject } from "@/app/actions/masterDataActions";
import Link from "next/link";
import { GraduationCap, Plus, ArrowRight, BookOpenCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-300 pb-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase mb-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
            MANAJEMEN KURIKULUM & MAPEL
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
            Mata Pelajaran & Target Jam
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar kurikulum mata pelajaran standar dan alokasi kuota jam pelajaran (JP) per minggu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Link
              href="/master/teaching-load"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
            >
              <span>Kertas Kerja</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-56 animate-in fade-in zoom-in-95">
              <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                📋 <strong>Kertas Kerja:</strong> Petakan penugasan mata pelajaran ini ke guru dan rombel kelas.
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form Tambah Mapel */}
        <div className="lg:col-span-1">
          <div className="p-5 border border-slate-200 rounded-2xl shadow-xs bg-white space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Tambah Mapel Baru</h2>
            </div>

            <form action={addSubject} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Mata Pelajaran
                </label>
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  required 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  placeholder="Misal: Fiqih Ibadah"
                />
              </div>

              <div>
                <label htmlFor="targetPeriodsPerWeek" className="block text-xs font-bold text-slate-700 mb-1">
                  Standar Jam Pelajaran (JP/Minggu)
                </label>
                <input 
                  type="number" 
                  name="targetPeriodsPerWeek" 
                  id="targetPeriodsPerWeek" 
                  min="1"
                  defaultValue="2"
                  required 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div className="relative group">
                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-lg hover:bg-slate-800 transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <BookOpenCheck className="w-3.5 h-3.5" />
                  Simpan Mapel
                </button>

                {/* Hanging Pop Penjelasan */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-56 animate-in fade-in zoom-in-95">
                  <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                    💾 <strong>Simpan Mapel:</strong> Mendaftarkan mata pelajaran baru ke standar kurikulum sekolah.
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Tabel Daftar Mapel */}
        <div className="lg:col-span-2">
          <div className="border border-slate-200 rounded-2xl shadow-xs overflow-hidden bg-white">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daftar Mata Pelajaran ({subjects.length} Mapel)
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="px-5 py-3">Nama Mata Pelajaran</th>
                  <th className="px-4 py-3 text-center">Standar JP</th>
                  <th className="px-5 py-3 text-right">Kategori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                      Belum ada data mata pelajaran.
                    </td>
                  </tr>
                ) : (
                  subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {s.name}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-block bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-0.5 rounded text-[11px] font-bold">
                          {s.targetPeriodsPerWeek} JP/Minggu
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-500 font-medium">
                        Kurikulum Nasional / Pesantren
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
