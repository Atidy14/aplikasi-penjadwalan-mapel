import { getTeachingLoads, getDropdownData, addTeachingLoad, deleteTeachingLoad } from "@/app/actions/teachingLoadActions";
import Link from "next/link";

export default async function TeachingLoadPage() {
  const loads = await getTeachingLoads();
  const { classes, subjects, teachers } = await getDropdownData();

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kertas Kerja (Penugasan Mengajar)</h1>
          <p className="text-slate-500 mt-1">Tentukan Guru mana yang mengajar Mata Pelajaran apa di Kelas yang mana.</p>
        </div>
        <Link href="/master/auto-generate" className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700">
          Lanjut ke Auto-Generator &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Tambah Kertas Kerja */}
        <div className="lg:col-span-1">
          <div className="p-6 border rounded-xl shadow-sm bg-white sticky top-8">
            <h2 className="text-lg font-semibold mb-4">Tambah Penugasan</h2>
            <form action={addTeachingLoad} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
                <select name="classGroupId" required className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mata Pelajaran</label>
                <select name="subjectId" required className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Pilih Mapel --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.targetPeriodsPerWeek} jam)</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Guru Pengajar</label>
                <select name="teacherId" required className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Beban Jam (Per Minggu)</label>
                <input 
                  type="number" 
                  name="targetPeriods" 
                  min="1"
                  required 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Misal: 4"
                />
                <p className="text-xs text-slate-500 mt-1">Bisa diisi sesuai target Mapel atau disesuaikan.</p>
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white font-medium py-2 rounded-md hover:bg-slate-800 transition mt-2"
              >
                Simpan Penugasan
              </button>
            </form>
          </div>
        </div>

        {/* Daftar Kertas Kerja */}
        <div className="lg:col-span-2">
          <div className="border rounded-xl shadow-sm overflow-hidden bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b text-slate-700">
                <tr>
                  <th className="px-6 py-3 font-medium">Kelas</th>
                  <th className="px-6 py-3 font-medium">Mata Pelajaran</th>
                  <th className="px-6 py-3 font-medium">Guru</th>
                  <th className="px-6 py-3 font-medium text-center">Beban Jam</th>
                  <th className="px-6 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Belum ada kertas kerja penugasan. Silakan tambahkan dari form di samping.
                    </td>
                  </tr>
                ) : (
                  loads.map((load) => (
                    <tr key={load.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{load.classGroup.name}</td>
                      <td className="px-6 py-4 font-medium text-blue-900">{load.subject.name}</td>
                      <td className="px-6 py-4">{load.teacher.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">
                          {load.targetPeriods} Jam
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={deleteTeachingLoad.bind(null, load.id)}>
                          <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800">
                            Hapus
                          </button>
                        </form>
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
