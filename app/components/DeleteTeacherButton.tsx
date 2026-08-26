"use client";

import { useState, useTransition } from "react";
import { deleteTeacher } from "@/app/actions/masterDataActions";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteTeacherButtonProps {
  teacherId: string;
  teacherName: string;
}

export default function DeleteTeacherButton({
  teacherId,
  teacherName,
}: DeleteTeacherButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTeacher(teacherId);
      setIsOpen(false);
    });
  };

  return (
    <>
      <div className="relative group inline-block">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline inline-flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Hapus
        </button>

        {/* Hanging Pop Penjelasan */}
        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-52 animate-in fade-in zoom-in-95">
          <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
            🗑️ <strong>Hapus Guru:</strong> Menghapus data guru beserta jadwal dan batasan waktunya secara permanen.
          </div>
          <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 animate-in zoom-in-95 text-left">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1.5">
              Hapus Data Guru?
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus guru <strong>&quot;{teacherName}&quot;</strong> secara permanen?
              <br /><br />
              <span className="text-rose-700 font-semibold">
                ⚠️ Seluruh jadwal mengajar, penugasan di Kertas Kerja, dan batasan waktu izin guru ini akan ikut dibersihkan dari database.
              </span>
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md transition disabled:opacity-50"
              >
                {isPending ? "Sedang Menghapus..." : "Ya, Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
