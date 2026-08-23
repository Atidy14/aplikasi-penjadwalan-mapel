import { getSubjects, addSubject } from "@/app/actions/masterDataActions";
import Link from "next/link";

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Mata Pelajaran</h1>
        <div className="space-x-4">
          <Link href="/master/teachers" className="text-sm text-blue-600 hover:underline">Kelola Guru</Link>
          <Link href="/master/classes" className="text-sm text-blue-600 hover:underline">Kelola Kelas</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form Tambah Mapel */}
        <div className="md:col-span-1">
          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-4">Tambah Mapel Baru</h2>
            <form action={addSubject} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Mapel</label>
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  required 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Misal: Matematika Dasar"
                />
              </div>
              <div>
                <label htmlFor="targetPeriodsPerWeek" className="block text-sm font-medium text-gray-700 mb-1">Target Jam/Minggu</label>
                <input 
                  type="number" 
                  name="targetPeriodsPerWeek" 
                  id="targetPeriodsPerWeek" 
                  min="1"
                  required 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Misal: 4"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white font-medium py-2 rounded-md hover:bg-slate-800 transition"
              >
                Simpan
              </button>
            </form>
          </div>
        </div>

        {/* Daftar Mapel */}
        <div className="md:col-span-2">
          <div className="border rounded-xl shadow-sm overflow-hidden bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b text-slate-700">
                <tr>
                  <th className="px-6 py-3 font-medium">Nama Mapel</th>
                  <th className="px-6 py-3 font-medium text-center">Target Jam</th>
                  <th className="px-6 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">Belum ada data mata pelajaran.</td>
                  </tr>
                ) : (
                  subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">{s.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">
                          {s.targetPeriodsPerWeek} Jam
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          Edit
                        </button>
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

