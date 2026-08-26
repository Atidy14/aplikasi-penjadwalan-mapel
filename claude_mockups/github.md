repo: Atidy14/aplikasi-penjadwalan-mapel
branch: main

## Last sync

date: 2026-08-23T17:23:03Z

### Updated in this project

- Prototipe SIP-MAPEL bisa diklik, memakai rute dan kosakata asli repo
- Grid jadwal disesuaikan: 8 jam × 40 menit dari 07.00, ISTIRAHAT sebelum Jam 5
- Toggle variasi: navigasi, kepadatan, layout jadwal, tampilan bentrok, alur generate
- Layar baru yang belum ada di repo: Ruangan, Laporan & Ekspor, peran Kepsek/Wali Kelas

## Screen map

| Layar prototipe | Rute aplikasi | File repo acuan |
| --- | --- | --- |
| Beranda | `/` | app/page.tsx |
| Papan Penjadwalan Kelas | `/master/classes/[classId]/scheduler` | app/components/SchedulerGrid.tsx, app/actions/schedulerActions.ts, app/lib/services/scheduleValidationService.ts, app/lib/services/timeBlockService.ts |
| Auto-Generator | `/master/auto-generate` | app/lib/services/autoGeneratorService.ts, app/components/GeneratorButton.tsx |
| Kertas Kerja | `/master/teaching-load` | app/master/teaching-load/page.tsx, app/actions/teachingLoadActions.ts |
| Guru & Izin | `/master/teachers` | app/master/teachers/page.tsx, app/components/ConstraintModal.tsx, app/actions/teacherConstraintActions.ts |
| Mata Pelajaran | `/master/subjects` | app/master/subjects/page.tsx, app/actions/masterDataActions.ts |
| Struktur Kelas & Ruangan | `/master/classes` | app/master/classes/page.tsx (Ruangan belum ada di skema) |
| Audit Log | `/master/audit` | app/master/audit/page.tsx, app/actions/handoverActions.ts |
| Laporan & Ekspor | belum ada | — (usulan baru) |
| Pusat Bentrok | belum ada | app/actions/schedulerActions.ts (validasi bentrok guru) |
