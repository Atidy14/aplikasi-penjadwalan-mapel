"use client";

import { useState, useTransition } from "react";
import { DayOfWeek } from "@/app/actions/schedulerActions";
import { toggleTeacherConstraint } from "@/app/actions/teacherConstraintActions";

type Teacher = { id: string; name: string };

const DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function ConstraintModal({ 
  teacher, 
  constraints, 
  timeSettings 
}: { 
  teacher: Teacher;
  constraints: { dayOfWeek: string; periodNumber: number }[];
  timeSettings: { periodNumber: number; startTime: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (day: DayOfWeek, period: number) => {
    startTransition(async () => {
      await toggleTeacherConstraint(teacher.id, day, period);
    });
  };

  const isBlocked = (day: string, period: number) => {
    return constraints.some(c => c.dayOfWeek === day && c.periodNumber === period);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs text-amber-600 hover:text-amber-800 font-medium bg-amber-50 px-2 py-1 rounded"
      >
        Atur Libur/Izin
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 my-8">
            <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Ketersediaan Waktu (Constraint)</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Pilih jam di mana <strong>{teacher.name}</strong> TIDAK BISA mengajar (warna merah).
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                Tutup
              </button>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-slate-100">Jam</th>
                      {DAYS.map(d => <th key={d} className="border p-2 bg-slate-100">{d.substring(0,3)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSettings.map(ts => (
                      <tr key={ts.periodNumber}>
                        <td className="border p-2 bg-slate-50 font-medium text-slate-600">
                          {ts.periodNumber}
                        </td>
                        {DAYS.map(day => {
                          const blocked = isBlocked(day, ts.periodNumber);
                          return (
                            <td 
                              key={`${day}-${ts.periodNumber}`}
                              className="border p-1"
                            >
                              <button
                                onClick={() => handleToggle(day, ts.periodNumber)}
                                disabled={isPending}
                                className={`w-full h-8 rounded text-xs font-bold transition-colors ${
                                  blocked ? "bg-red-500 text-white shadow-inner" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                } disabled:opacity-50`}
                              >
                                {blocked ? "X" : "✓"}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex gap-4 text-xs text-slate-500 justify-center">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-100 inline-block rounded"></span> Tersedia</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 inline-block rounded"></span> Tidak Bisa</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
