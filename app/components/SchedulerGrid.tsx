"use client";

import React, { useState, useTransition } from "react";
import { assignScheduleSlot, clearScheduleSlot } from "@/app/actions/schedulerActions";

export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

type ScheduleItem = {
  id: string;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  subject: { id: string; name: string };
  teacher: { id: string; name: string };
};

type ValidationItem = {
  subjectId: string;
  subjectName: string;
  scheduledPeriods: number;
  targetPeriods: number;
  status: "MATCH" | "UNDER" | "OVER";
  message: string;
};

type Props = {
  classGroupId: string;
  classGroupName: string;
  schedules: ScheduleItem[];
  timeSettings: { periodNumber: number; startTime: string; endTime: string }[];
  dropdownData: {
    subjects: { id: string; name: string }[];
    teachers: { id: string; name: string }[];
  };
  validations: ValidationItem[];
};

const DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jumat",
  SATURDAY: "Sabtu",
  SUNDAY: "Minggu"
};

export default function SchedulerGrid({ 
  classGroupId, 
  classGroupName, 
  schedules, 
  timeSettings, 
  dropdownData,
  validations 
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedSlot, setSelectedSlot] = useState<{day: DayOfWeek, period: number} | null>(null);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const handleSlotClick = (day: DayOfWeek, period: number) => {
    setSelectedSlot({ day, period });
    setErrorMsg("");
    
    const existing = schedules.find(s => s.dayOfWeek === day && s.periodNumber === period);
    if (existing) {
      setSelectedSubject(existing.subject.id);
      setSelectedTeacher(existing.teacher.id);
    } else {
      setSelectedSubject("");
      setSelectedTeacher("");
    }
  };

  const handleSave = () => {
    if (!selectedSlot || !selectedSubject || !selectedTeacher) return;
    setErrorMsg("");
    
    startTransition(async () => {
      try {
        await assignScheduleSlot(
          classGroupId,
          selectedSlot.day,
          selectedSlot.period,
          selectedSubject,
          selectedTeacher
        );
        setSelectedSlot(null);
      } catch (err: any) {
        setErrorMsg(err.message || "Terjadi kesalahan.");
      }
    });
  };

  const handleClear = () => {
    if (!selectedSlot) return;
    
    startTransition(async () => {
      await clearScheduleSlot(classGroupId, selectedSlot.day, selectedSlot.period);
      setSelectedSlot(null);
    });
  };

  return (
    <div className="space-y-8">
      {/* Validation Warning Badges & Progress Bars */}
      <div className="bg-white p-6 border rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Progress Pemenuhan Jam Pelajaran</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {validations.map(val => (
            <div key={val.subjectId} className="border p-4 rounded-lg bg-slate-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">{val.subjectName}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  val.status === "MATCH" ? "bg-green-100 text-green-700" :
                  val.status === "UNDER" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {val.scheduledPeriods} / {val.targetPeriods} Jam
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    val.status === "MATCH" ? "bg-green-600" :
                    val.status === "UNDER" ? "bg-amber-500" : "bg-red-600"
                  }`}
                  style={{ width: `${Math.min((val.scheduledPeriods / val.targetPeriods) * 100, 100)}%` }}
                ></div>
              </div>
              {val.status !== "MATCH" && (
                <p className="text-xs text-slate-500 mt-2">{val.message}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grid Penjadwalan */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-4 py-3 border-r border-slate-700 w-24 text-center">Jam / Waktu</th>
                {DAYS.map(day => (
                  <th key={day} className="px-4 py-3 border-r border-slate-700 text-center w-40">
                    {DAY_LABELS[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {timeSettings.map((ts) => {
                const isBreakTime = ts.periodNumber === 5; // Istirahat ditaruh tepat sebelum jam 5
                
                return (
                  <React.Fragment key={ts.periodNumber}>
                    {isBreakTime && (
                      <tr className="bg-slate-100">
                        <td className="px-4 py-2 border-r text-center font-bold text-slate-500 text-xs">ISTIRAHAT</td>
                        <td colSpan={DAYS.length} className="px-4 py-2 text-center text-slate-500 tracking-[0.2em] font-semibold">
                          I S T I R A H A T
                        </td>
                      </tr>
                    )}
                    <tr className="hover:bg-slate-50">
                      <td className="px-2 py-3 border-r align-top text-center bg-slate-50">
                        <div className="font-bold text-slate-700">Jam {ts.periodNumber}</div>
                        <div className="text-xs text-slate-500">{ts.startTime} - {ts.endTime}</div>
                      </td>
                      
                      {DAYS.map(day => {
                        const cellSchedule = schedules.find(s => s.dayOfWeek === day && s.periodNumber === ts.periodNumber);
                        const isSelected = selectedSlot?.day === day && selectedSlot?.period === ts.periodNumber;

                        return (
                          <td 
                            key={`${day}-${ts.periodNumber}`} 
                            className={`border-r p-2 align-top transition-colors cursor-pointer min-h-[80px]
                              ${isSelected ? "ring-2 ring-inset ring-blue-500 bg-blue-50" : "hover:bg-blue-50/50"}`}
                            onClick={() => handleSlotClick(day, ts.periodNumber)}
                          >
                            {cellSchedule ? (
                              <div className="h-full flex flex-col justify-between bg-white border border-slate-200 p-2 rounded shadow-sm">
                                <div className="font-semibold text-blue-900 text-xs leading-tight mb-1">
                                  {cellSchedule.subject.name}
                                </div>
                                <div className="text-[11px] text-slate-600 font-medium">
                                  {cellSchedule.teacher.name}
                                </div>
                              </div>
                            ) : (
                              <div className="h-full min-h-[60px] w-full flex items-center justify-center border border-dashed border-slate-200 rounded text-slate-300 text-xs font-medium">
                                Kosong
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal / Bottom Panel */}
      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-50 animate-in slide-in-from-bottom-10">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1">
              <h4 className="font-bold mb-1">Atur Jadwal: {DAY_LABELS[selectedSlot.day]} - Jam {selectedSlot.period}</h4>
              <p className="text-sm text-slate-500 mb-4">Pilih Mata Pelajaran dan Guru untuk slot ini di kelas {classGroupName}.</p>
              
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-medium border border-red-200 rounded-md">
                  {errorMsg}
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select 
                    value={selectedSubject} 
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Mapel --</option>
                    {dropdownData.subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guru Pengajar</label>
                  <select 
                    value={selectedTeacher} 
                    onChange={e => setSelectedTeacher(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Guru --</option>
                    {dropdownData.teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedSlot(null)}
                className="px-4 py-2 border rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button 
                onClick={handleClear}
                disabled={isPending}
                className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 disabled:opacity-50"
              >
                Kosongkan
              </button>
              <button 
                onClick={handleSave}
                disabled={isPending || !selectedSubject || !selectedTeacher}
                className="px-6 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
              >
                {isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
