import { getTeachers, addTeacher, toggleTeacherStatus } from "@/app/actions/masterDataActions";
import { getAllTimeSettings } from "@/app/actions/schedulerActions";
import Link from "next/link";
import HandoverModal from "@/app/components/HandoverModal";
import ConstraintModal from "@/app/components/ConstraintModal";
import DeleteTeacherButton from "@/app/components/DeleteTeacherButton";
import { Users, Plus, ShieldAlert, ArrowRight, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeachersPage() {
  const teachers = await getTeachers();
  const timeSettings = await getAllTimeSettings();

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-300 pb-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase mb-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
            MANAJEMEN TENAGA PENDIDIK
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
            Data Guru & Batasan Izin Mengajar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola profil pengajar, jadwal ketersediaan khusus, mutasi tugas, dan status keaktifan guru.
          </p>
        </div>

        {/* Tombol Serah Terima & Shortcut dengan Hanging Popup */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <HandoverModal teachers={teachers} />
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-60 animate-in fade-in zoom-in-95">
              <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                🔄 <strong>Serah Terima Tugas:</strong> Alihkan beban mengajar dan jadwal kelas ke guru pengganti secara otomatis.
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
            </div>
          </div>

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
                📋 <strong>Kertas Kerja:</strong> Buka matriks penugasan jam mengajar guru per rombel kelas.
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form Tambah Guru Baru */}
        <div className="lg:col-span-1">
          <div className="p-5 border border-slate-200 rounded-2xl shadow-xs bg-white space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Tambah Guru Baru</h2>
            </div>

            <form action={addTeacher} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  required 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  placeholder="Misal: Ustadz Abdullah, S.Pd.I"
                />
              </div>

              <div className="relative group">
                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-lg hover:bg-slate-800 transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Simpan Guru
                </button>

                {/* Hanging Pop Penjelasan */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-56 animate-in fade-in zoom-in-95">
                  <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                    💾 <strong>Simpan Guru Baru:</strong> Mendaftarkan guru baru ke dalam basis data sistem akademik.
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Tabel Daftar Guru & Aksi */}
        <div className="lg:col-span-2">
          <div className="border border-slate-200 rounded-2xl shadow-xs overflow-hidden bg-white">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daftar Tenaga Pendidik Terdaftar ({teachers.length} Guru)
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="px-5 py-3">Nama Guru</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Aksi & Pengaturan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                      Belum ada data guru yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {t.name}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${
                          t.status === "ACTIVE" 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}>
                          {t.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-3">
                        
                        {/* Tombol Atur Batasan Waktu */}
                        <div className="relative group inline-block">
                          <ConstraintModal teacher={t} constraints={t.constraints || []} timeSettings={timeSettings} />
                          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-56 animate-in fade-in zoom-in-95">
                            <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                              ⏰ <strong>Batasan Waktu:</strong> Kunci hari & jam libur/kuliah agar tidak terplot jadwal.
                            </div>
                            <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
                          </div>
                        </div>

                        {/* Tombol Ubah Status (Aktif/Nonaktif) */}
                        <div className="relative group inline-block">
                          <form action={toggleTeacherStatus.bind(null, t.id, t.status)} className="inline">
                            <button 
                              type="submit" 
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Ubah Status
                            </button>
                          </form>
                          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-52 animate-in fade-in zoom-in-95">
                            <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                              🔄 <strong>Ubah Status:</strong> Nonaktifkan sementara guru cuti tanpa menghapus rekam jejaknya.
                            </div>
                            <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
                          </div>
                        </div>

                        {/* Tombol Hapus Guru Baru */}
                        <DeleteTeacherButton teacherId={t.id} teacherName={t.name} />

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
