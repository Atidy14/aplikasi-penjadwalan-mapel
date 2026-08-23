import { getTeachers, addTeacher, toggleTeacherStatus } from "@/actions/masterDataActions";
import Link from "next/link";
import HandoverModal from "@/components/HandoverModal";

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Guru</h1>
          <Link href="/master/audit" className="text-sm text-blue-600 hover:underline">Lihat Riwayat Perubahan (Audit)</Link>
        </div>
        <div className="space-x-4 flex items-center">
          <HandoverModal teachers={teachers} />
          <Link href="/master/subjects" className="text-sm text-blue-600 hover:underline">Kelola Mapel</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form Tambah Guru */}
        <div className="md:col-span-1">
          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-4">Tambah Guru Baru</h2>
            <form action={addTeacher} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  required 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Misal: Budi Santoso, S.Pd"
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

        {/* Daftar Guru */}
        <div className="md:col-span-2">
          <div className="border rounded-xl shadow-sm overflow-hidden bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b text-slate-700">
                <tr>
                  <th className="px-6 py-3 font-medium">Nama Guru</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">Belum ada data guru.</td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">{t.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          t.status === "ACTIVE" 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-rose-100 text-rose-700"
                        }`}>
                          {t.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={toggleTeacherStatus.bind(null, t.id, t.status)}>
                          <button 
                            type="submit" 
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Ubah Status
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

