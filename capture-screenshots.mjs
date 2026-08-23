import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve('screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function capture() {
  console.log('🚀 Menjalankan Puppeteer untuk mengambil screenshot...');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: { width: 1280, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Eksekusi Auto-Generator terlebih dahulu agar data jadwal terisi di papan
  console.log('⚡ Menjalankan Auto-Generator...');
  await page.goto('http://localhost:3000/master/auto-generate', { waitUntil: 'networkidle0' });
  const genBtn = await page.$('button');
  if (genBtn) {
    await genBtn.click();
    await new Promise(r => setTimeout(r, 2500));
  }
  await page.screenshot({ path: path.join(outputDir, '08_auto_generator.png') });
  console.log('📸 08_auto_generator.png captured');

  // 2. Landing Page (Home)
  console.log('📸 Mengambil Landing Page...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outputDir, '01_landing_page.png') });
  console.log('📸 01_landing_page.png captured');

  // 3. Manajemen Guru
  console.log('📸 Mengambil Manajemen Guru...');
  await page.goto('http://localhost:3000/master/teachers', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outputDir, '02_data_guru.png') });
  console.log('📸 02_data_guru.png captured');

  // 4. Modal Izin Guru
  const izinButtons = await page.$$('button');
  for (const b of izinButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Atur Libur')) {
      await b.click();
      await new Promise(r => setTimeout(r, 500));
      break;
    }
  }
  await page.screenshot({ path: path.join(outputDir, '03_modal_izin_guru.png') });
  console.log('📸 03_modal_izin_guru.png captured');

  // 5. Modal Serah Terima Guru
  await page.goto('http://localhost:3000/master/teachers', { waitUntil: 'networkidle0' });
  const handoverBtn = await page.$('button');
  if (handoverBtn) {
    await handoverBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }
  await page.screenshot({ path: path.join(outputDir, '04_modal_serah_terima.png') });
  console.log('📸 04_modal_serah_terima.png captured');

  // 6. Mata Pelajaran
  console.log('📸 Mengambil Data Mapel...');
  await page.goto('http://localhost:3000/master/subjects', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outputDir, '05_data_mapel.png') });
  console.log('📸 05_data_mapel.png captured');

  // 7. Data Kelas
  console.log('📸 Mengambil Data Kelas...');
  await page.goto('http://localhost:3000/master/classes', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outputDir, '06_data_kelas.png') });
  console.log('📸 06_data_kelas.png captured');

  // 8. Kertas Kerja
  console.log('📸 Mengambil Kertas Kerja...');
  await page.goto('http://localhost:3000/master/teaching-load', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outputDir, '07_kertas_kerja.png') });
  console.log('📸 07_kertas_kerja.png captured');

  // 9. Papan Penjadwalan (Scheduler Board)
  console.log('📸 Mengambil Papan Penjadwalan...');
  await page.goto('http://localhost:3000/master/classes', { waitUntil: 'networkidle0' });
  const aturJadwalLink = await page.$('a[href*="/scheduler"]');
  if (aturJadwalLink) {
    const href = await page.evaluate(el => el.getAttribute('href'), aturJadwalLink);
    await page.goto('http://localhost:3000' + href, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(outputDir, '09_papan_penjadwalan_grid.png') });
    console.log('📸 09_papan_penjadwalan_grid.png captured');
  }

  // 10. Audit Log
  console.log('📸 Mengambil Audit Log...');
  await page.goto('http://localhost:3000/master/audit', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outputDir, '10_audit_log.png') });
  console.log('📸 10_audit_log.png captured');

  await browser.close();
  console.log('🎉 Semua 10 screenshot berhasil disimpan di folder screenshots/!');
}

capture().catch(err => {
  console.error('❌ Error capture:', err);
  process.exit(1);
});
