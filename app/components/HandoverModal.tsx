"use client";

import { useState, useTransition } from "react";
import { processTeacherHandover } from "@/app/actions/handoverActions";

type Teacher = {
  id: string;
  name: string;
  status: string;
};

export default function HandoverModal({ teachers }: { teachers: Teacher[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const activeTeachers = teachers.filter(t => t.status === "ACTIVE");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await processTeacherHandover(formData);
        setIsOpen(false);
        // alert("Serah terima jadwal berhasil!");
      } catch (err: any) {
        setErrorMsg(err.message || "Terjadi kesalahan saat memproses serah terima.");
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition"
      >
        Serah Terima Guru (Handover)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Serah Terima Jadwal Guru</h3>
              <p className="text-sm text-slate-500 mt-1">Pindahkan seluruh jadwal aktif dari satu guru ke guru lain.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                  {errorMsg}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Guru Lama (Yang Digantikan)</label>
                <select name="oldTeacherId" required className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Pilih Guru Lama --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} {t.status === "INACTIVE" ? "(Nonaktif)" : ""}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Guru Baru (Pengganti)</label>
                <select name="newTeacherId" required className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Pilih Guru Baru --</option>
                  {activeTeachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Berlaku (Effective Date)</label>
                <input 
                  type="date" 
                  name="effectiveDate" 
                  required 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-1">Mulai tanggal ini, jadwal akan beralih ke guru baru.</p>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-50 text-slate-700"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isPending ? "Memproses..." : "Proses Handover"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
