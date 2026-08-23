"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, School, Users, FileText } from "lucide-react";

type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";

const DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jumat",
  SATURDAY: "Sabtu",
};

type Props = {
  academicYearName: string;
  timeSettings: { periodNumber: number; startTime: string; endTime: string }[];
  classes: {
    id: string;
    name: string;
    schedules: {
      id: string;
      dayOfWeek: string;
      periodNumber: number;
      subject: { name: string };
      teacher: { name: string };
    }[];
  }[];
  teachers: {
    id: string;
    name: string;
    schedules: {
      id: string;
      dayOfWeek: string;
      periodNumber: number;
      classGroup: { name: string };
      subject: { name: string };
    }[];
  }[];
};

export default function SchedulePrintView({
  academicYearName,
  timeSettings,
  classes,
  teachers,
}: Props) {
  const [activeTab, setActiveTab] = useState<"CLASS" | "TEACHER">("CLASS");
  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("ALL");

  const filteredClasses =
    selectedClassId === "ALL"
      ? classes
      : classes.filter((c) => c.id === selectedClassId);

  const filteredTeachers =
    selectedTeacherId === "ALL"
      ? teachers.filter((t) => t.schedules.length > 0)
      : teachers.filter((t) => t.id === selectedTeacherId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 print:bg-white print:p-0 print:m-0">
      {/* Action Bar (Hidden during Print) */}
      <div className="bg-slate-900 text-white py-4 px-6 sticky top-0 z-50 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/master/auto-generate"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
            <div>
              <h1 className="text-base font-bold tracking-tight">
                Cetak & Rekapitulasi Jadwal Pelajaran
              </h1>
              <p className="text-xs text-slate-400">
                Tahun Ajaran: {academicYearName}
              </p>
            </div>
          </div>

          {/* Tab & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800 p-1 rounded-lg flex gap-1">
              <button
                onClick={() => setActiveTab("CLASS")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "CLASS"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <School className="w-3.5 h-3.5" />
                Per Kelas
              </button>
              <button
                onClick={() => setActiveTab("TEACHER")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "TEACHER"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Per Guru
              </button>
            </div>

            {/* Filter Dropdown */}
            {activeTab === "CLASS" ? (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none"
              >
                <option value="ALL">-- Cetak Semua Kelas ({classes.length}) --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none"
              >
                <option value="ALL">-- Cetak Semua Guru Mengajar --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.schedules.length} jam)
                  </option>
                ))}
              </select>
            )}

            {/* Tombol Cetak / PDF */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Print Container */}
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-12 print:p-0 print:m-0 print:max-w-none">
        
        {/* ============================================================ */}
        {/* TAB 1: CETAK JADWAL PER KELAS */}
        {/* ============================================================ */}
        {activeTab === "CLASS" && (
          <div className="space-y-10">
            {filteredClasses.map((cls, idx) => (
              <div
                key={cls.id}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-4 print:page-break-after-always"
                style={{ pageBreakAfter: "always" }}
              >
                {/* Kop Resmi Sekolah */}
                <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                  <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
                    SMA / SMK NEGERI CONTOH
                  </h2>
                  <h3 className="text-base font-bold text-slate-700">
                    JADWAL PELAJARAN TAHUN AJARAN {academicYearName.toUpperCase()}
                  </h3>
                  <div className="mt-2 inline-block bg-slate-900 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
                    {cls.name}
                  </div>
                </div>

                {/* Grid Jadwal Kelas */}
                <table className="w-full text-xs text-center border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-400 px-2 py-2.5 w-24">
                        Jam / Waktu
                      </th>
                      {DAYS.map((day) => (
                        <th
                          key={day}
                          className="border border-slate-400 px-2 py-2.5 w-36 uppercase tracking-wider"
                        >
                          {DAY_LABELS[day]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSettings.map((ts) => {
                      const isBreak = ts.periodNumber === 5;
                      return (
                        <React.Fragment key={ts.id}>
                          {isBreak && (
                            <tr className="bg-slate-200 text-slate-600 font-bold">
                              <td className="border border-slate-400 py-1 text-[11px]">
                                ISTIRAHAT
                              </td>
                              <td
                                colSpan={DAYS.length}
                                className="border border-slate-400 py-1 tracking-[0.3em] text-[11px]"
                              >
                                I S T I R A H A T
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td className="border border-slate-400 px-2 py-2 bg-slate-50 font-semibold">
                              <div className="font-bold text-slate-800">
                                Jam {ts.periodNumber}
                              </div>
                              <div className="text-[10px] text-slate-500 font-normal">
                                {ts.startTime} - {ts.endTime}
                              </div>
                            </td>

                            {DAYS.map((day) => {
                              const item = cls.schedules.find(
                                (s) =>
                                  s.dayOfWeek === day &&
                                  s.periodNumber === ts.periodNumber
                              );

                              return (
                                <td
                                  key={`${day}-${ts.periodNumber}`}
                                  className="border border-slate-400 p-1.5 align-middle min-h-[50px]"
                                >
                                  {item ? (
                                    <div className="flex flex-col justify-center items-center h-full">
                                      <span className="font-bold text-slate-900 text-[11px] leading-tight">
                                        {item.subject.name}
                                      </span>
                                      <span className="text-[10px] text-slate-600 font-medium mt-0.5">
                                        {item.teacher.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 text-[11px]">
                                      -
                                    </span>
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

                {/* Lembar Pengesahan / Tanda Tangan */}
                <div className="mt-8 pt-4 flex justify-between text-xs text-slate-800">
                  <div className="text-center w-48">
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Sekolah</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">
                      Dr. H. Mulyadi, M.Pd
                    </p>
                    <p className="text-[10px] text-slate-500">
                      NIP. 19750812 200003 1 002
                    </p>
                  </div>

                  <div className="text-center w-48">
                    <p>Ditetapkan di: Jakarta</p>
                    <p className="font-bold">Waka Kurikulum</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">
                      Siti Rahmawati, M.Pd
                    </p>
                    <p className="text-[10px] text-slate-500">
                      NIP. 19820415 200604 2 015
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: CETAK JADWAL PER GURU */}
        {/* ============================================================ */}
        {activeTab === "TEACHER" && (
          <div className="space-y-10">
            {filteredTeachers.map((tch) => (
              <div
                key={tch.id}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-4"
                style={{ pageBreakAfter: "always" }}
              >
                {/* Kop Guru */}
                <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                  <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
                    JADWAL MENGAJAR GURU
                  </h2>
                  <h3 className="text-base font-bold text-slate-700">
                    TAHUN AJARAN {academicYearName.toUpperCase()}
                  </h3>
                  <div className="mt-2 inline-block bg-indigo-900 text-white text-xs font-black px-4 py-1 rounded-full">
                    {tch.name} — Total: {tch.schedules.length} Jam Pelajaran / Minggu
                  </div>
                </div>

                {/* Grid Guru */}
                <table className="w-full text-xs text-center border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-400 px-2 py-2.5 w-24">
                        Jam / Waktu
                      </th>
                      {DAYS.map((day) => (
                        <th
                          key={day}
                          className="border border-slate-400 px-2 py-2.5 w-36 uppercase tracking-wider"
                        >
                          {DAY_LABELS[day]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSettings.map((ts) => {
                      const isBreak = ts.periodNumber === 5;
                      return (
                        <React.Fragment key={ts.id}>
                          {isBreak && (
                            <tr className="bg-slate-200 text-slate-600 font-bold">
                              <td className="border border-slate-400 py-1 text-[11px]">
                                ISTIRAHAT
                              </td>
                              <td
                                colSpan={DAYS.length}
                                className="border border-slate-400 py-1 tracking-[0.3em] text-[11px]"
                              >
                                I S T I R A H A T
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td className="border border-slate-400 px-2 py-2 bg-slate-50 font-semibold">
                              <div className="font-bold text-slate-800">
                                Jam {ts.periodNumber}
                              </div>
                              <div className="text-[10px] text-slate-500 font-normal">
                                {ts.startTime} - {ts.endTime}
                              </div>
                            </td>

                            {DAYS.map((day) => {
                              const item = tch.schedules.find(
                                (s) =>
                                  s.dayOfWeek === day &&
                                  s.periodNumber === ts.periodNumber
                              );

                              return (
                                <td
                                  key={`${day}-${ts.periodNumber}`}
                                  className={`border border-slate-400 p-1.5 align-middle min-h-[50px] ${
                                    item ? "bg-indigo-50/60 font-semibold" : ""
                                  }`}
                                >
                                  {item ? (
                                    <div className="flex flex-col justify-center items-center h-full">
                                      <span className="font-bold text-indigo-950 text-[11px] leading-tight">
                                        {item.classGroup.name}
                                      </span>
                                      <span className="text-[10px] text-slate-600 mt-0.5">
                                        {item.subject.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 text-[11px]">
                                      -
                                    </span>
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

                {/* Tanda Tangan */}
                <div className="mt-8 pt-4 flex justify-between text-xs text-slate-800">
                  <div className="text-center w-48">
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Sekolah</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">
                      Dr. H. Mulyadi, M.Pd
                    </p>
                  </div>

                  <div className="text-center w-48">
                    <p>Diterima oleh,</p>
                    <p className="font-bold">Guru Pengajar</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{tch.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
