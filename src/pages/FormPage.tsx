import React, { useState } from 'react';
import {
  BSTBDocument,
  DepartmentType,
  DEPT_DEFAULTS
} from '../types/bstb';
import { MASTER_ITEMS_B3, SATUAN_OPTIONS, CatalogItem } from '../utils/itemCatalog';
import { printDocument } from '../utils/printHelper';
import { DocumentPreview } from '../components/DocumentPreview';
import { LogoMMP } from '../components/CompanyLogo';
import { SearchableItemCombobox } from '../components/SearchableItemCombobox';
import {
  Printer,
  Plus,
  Trash2,
  MessageCircle,
  CheckCircle2,
  Send,
  Loader2,
  AlertCircle,
  RotateCcw,
  Lock,
  ArrowRight,
  Clock
} from 'lucide-react';
import { getAppScriptUrl } from '../utils/config';

const ADMIN_WA_NUMBER = '6285772557055';

export function FormPage() {
  const [deptType, setDeptType] = useState<DepartmentType>('produksi');
  const [viewMode, setViewMode] = useState<'input' | 'output'>('input');
  const [isWaSent, setIsWaSent] = useState(false);

  const createInitialDoc = (type: DepartmentType): BSTBDocument => {
    const defaults = DEPT_DEFAULTS[type];

    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMin = String(now.getMinutes()).padStart(2, '0');
    const currentSec = String(now.getSeconds()).padStart(2, '0');
    const currentTime = `${currentHour}:${currentMin}:${currentSec}`;

    return {
      id: `bstb-${Date.now()}`,
      departemen: type,
      noBstb: '',
      tanggal: '',
      bagian: defaults.defaultBagian || (type === 'scm' ? 'SCM' : type === 'teknik' ? 'Maintenance & Utility' : 'Printing & Slitting'),
      noDokumen: type === 'scm' ? '' : defaults.noDokumen,
      revisi: type === 'scm' ? '' : defaults.revisi,
      tanggalTerbit: type === 'scm' ? '' : defaults.tanggalTerbit,
      itemsTeknik:
        type === 'teknik'
          ? [
              {
                id: 't-1',
                kodeBarang: '',
                namaBarang: '',
                jumlah: '',
                satuan: 'Kg',
                beratKg: '',
                noFpb: '',
                keterangan: ''
              }
            ]
          : [],
      itemsProduksi:
        type === 'produksi' || type === 'scm'
          ? [
              {
                id: 'p-1',
                kodeItem: '',
                namaItem: '',
                qty: '',
                tglMasuk: '',
                batchNo: '',
                satuan: 'Kg',
                spk: '',
                keterangan: ''
              }
            ]
          : [],
      itemsScm: [],
      signatures: {
        diserahkanOleh: { role: 'Admin / Petugas', name: '' },
        diketahuiOleh1: { role: 'SPV', name: '' },
        diketahuiOleh2: { role: 'Manager', name: '' },
        diterimaOleh: { role: 'Penerima', name: '' },
        diperiksaOleh: { role: 'QC', name: '' }
      },
      timesTime: {
        startTime: currentTime,
        finishTime: currentTime
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const [doc, setDoc] = useState<BSTBDocument>(() => createInitialDoc('produksi'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorMsg, setSubmitErrorMsg] = useState('');

  const handleSwitchDept = (newType: DepartmentType) => {
    setDeptType(newType);
    setDoc(createInitialDoc(newType));
    setSubmitErrorMsg('');
  };

  const handleAddItem = () => {
    if (deptType === 'teknik') {
      setDoc({
        ...doc,
        itemsTeknik: [
          ...doc.itemsTeknik,
          {
            id: `t-${Date.now()}`,
            kodeBarang: '',
            namaBarang: '',
            jumlah: '',
            satuan: 'Kg',
            beratKg: '',
            noFpb: '',
            keterangan: ''
          }
        ]
      });
    } else {
      // Produksi dan SCM persis sama (9 kolom Produksi)
      setDoc({
        ...doc,
        itemsProduksi: [
          ...doc.itemsProduksi,
          {
            id: `p-${Date.now()}`,
            kodeItem: '',
            namaItem: '',
            qty: '',
            tglMasuk: '',
            batchNo: '',
            satuan: 'Kg',
            spk: '',
            keterangan: ''
          }
        ]
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    if (deptType === 'teknik') {
      if (doc.itemsTeknik.length <= 1) return;
      setDoc({
        ...doc,
        itemsTeknik: doc.itemsTeknik.filter((_, i) => i !== index)
      });
    } else {
      if (doc.itemsProduksi.length <= 1) return;
      setDoc({
        ...doc,
        itemsProduksi: doc.itemsProduksi.filter((_, i) => i !== index)
      });
    }
  };

  // SAAT USER MEMILIH KODE DI DROPDOWN, NAMA BARANG & SATUAN LANGSUNG TERISI OTOMATIS
  const handleKodeChange = (index: number, selectedCode: string) => {
    const matched = MASTER_ITEMS_B3.find(
      (m) => m.code.toLowerCase() === selectedCode.trim().toLowerCase()
    );

    const autoName = matched ? matched.name : '';
    const autoSatuan = matched?.defaultSatuan;

    if (deptType === 'teknik') {
      const arr = [...doc.itemsTeknik];
      arr[index].kodeBarang = selectedCode;
      if (autoName) arr[index].namaBarang = autoName;
      if (autoSatuan) arr[index].satuan = autoSatuan;
      setDoc({ ...doc, itemsTeknik: arr });
    } else {
      const arr = [...doc.itemsProduksi];
      arr[index].kodeItem = selectedCode;
      if (autoName) arr[index].namaItem = autoName;
      if (autoSatuan) arr[index].satuan = autoSatuan;
      setDoc({ ...doc, itemsProduksi: arr });
    }
  };

  // SAAT USER MEMILIH / CARI DARI COMBOBOX NAMA BARANG (FULL LIST + FILTER)
  const handleSelectMasterItem = (index: number, item: CatalogItem) => {
    if (deptType === 'teknik') {
      const arr = [...doc.itemsTeknik];
      arr[index].kodeBarang = item.code;
      arr[index].namaBarang = item.name;
      if (item.defaultSatuan) arr[index].satuan = item.defaultSatuan;
      setDoc({ ...doc, itemsTeknik: arr });
    } else {
      const arr = [...doc.itemsProduksi];
      arr[index].kodeItem = item.code;
      arr[index].namaItem = item.name;
      if (item.defaultSatuan) arr[index].satuan = item.defaultSatuan;
      setDoc({ ...doc, itemsProduksi: arr });
    }
  };

  // SUBMIT FORM BSTB (SATU-SATUNYA TOMBOL DI FORM)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const focusEl = (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // ============================================================
    // VALIDASI WAJIB DIISI SESUAI INSTRUKSI:
    // 1. Nomor BSTB, 2. Tanggal BSTB, 3. Bagian/departemen
    // 4. Kode barang/item, 5. QTY/Jumlah, 6. Berat
    // 7. Diserahkan oleh, 8. Diketahui oleh, 9. Diterima oleh, 10. Diperiksa oleh
    // ============================================================

    // 1. Nomor BSTB
    if (!doc.noBstb || !doc.noBstb.trim()) {
      setSubmitErrorMsg('1. Nomor BSTB wajib diisi.');
      setIsSubmitting(false);
      focusEl('input-nomor-bstb');
      return;
    }
    // 2. Tanggal BSTB
    if (!doc.tanggal || !doc.tanggal.trim()) {
      setSubmitErrorMsg('2. Tanggal BSTB wajib diisi.');
      setIsSubmitting(false);
      focusEl('input-tanggal-bstb');
      return;
    }
    // 3. Bagian / Departemen
    if (!doc.bagian || !doc.bagian.trim()) {
      setSubmitErrorMsg('3. Bagian / Departemen wajib diisi.');
      setIsSubmitting(false);
      focusEl('input-bagian-bstb');
      return;
    }

    // 4, 5, 6. Validasi Item: Kode barang/item, QTY/Jumlah, Berat
    if (deptType === 'teknik') {
      if (!doc.itemsTeknik || doc.itemsTeknik.length === 0) {
        setSubmitErrorMsg('Minimal harus ada 1 baris barang pada tabel Teknik.');
        setIsSubmitting(false);
        return;
      }
      for (let i = 0; i < doc.itemsTeknik.length; i++) {
        const item = doc.itemsTeknik[i];
        if (!item.kodeBarang || !item.kodeBarang.trim()) {
          setSubmitErrorMsg(`4. Kode Barang pada baris ${i + 1} wajib dipilih.`);
          setIsSubmitting(false);
          focusEl(`input-teknik-kode-${i}`);
          return;
        }
        if (!item.namaBarang || !item.namaBarang.trim()) {
          setSubmitErrorMsg(`4. Nama Barang pada baris ${i + 1} wajib dipilih.`);
          setIsSubmitting(false);
          return;
        }
        if (item.jumlah === '' || item.jumlah === undefined || item.jumlah === null || !String(item.jumlah).trim()) {
          setSubmitErrorMsg(`5. Jumlah pada baris ${i + 1} wajib diisi.`);
          setIsSubmitting(false);
          focusEl(`input-teknik-jumlah-${i}`);
          return;
        }
        if (item.beratKg === '' || item.beratKg === undefined || item.beratKg === null || !String(item.beratKg).trim()) {
          setSubmitErrorMsg(`6. Berat (Kg) pada baris ${i + 1} wajib diisi.`);
          setIsSubmitting(false);
          focusEl(`input-teknik-berat-${i}`);
          return;
        }
      }
    } else {
      // Produksi dan SCM persis sama (9 Kolom Produksi)
      if (!doc.itemsProduksi || doc.itemsProduksi.length === 0) {
        setSubmitErrorMsg(`Minimal harus ada 1 baris item pada tabel ${deptType === 'scm' ? 'SCM' : 'Produksi'}.`);
        setIsSubmitting(false);
        return;
      }
      for (let i = 0; i < doc.itemsProduksi.length; i++) {
        const item = doc.itemsProduksi[i];
        if (!item.kodeItem || !item.kodeItem.trim()) {
          setSubmitErrorMsg(`4. Kode Item pada baris ${i + 1} wajib dipilih.`);
          setIsSubmitting(false);
          focusEl(`input-prod-kode-${i}`);
          return;
        }
        if (!item.namaItem || !item.namaItem.trim()) {
          setSubmitErrorMsg(`4. Nama Item pada baris ${i + 1} wajib dipilih.`);
          setIsSubmitting(false);
          return;
        }
        if (item.qty === '' || item.qty === undefined || item.qty === null || !String(item.qty).trim()) {
          setSubmitErrorMsg(`5. QTY pada baris ${i + 1} wajib diisi.`);
          setIsSubmitting(false);
          focusEl(`input-prod-qty-${i}`);
          return;
        }
      }
    }

    // 7. Diserahkan oleh
    if (!doc.signatures.diserahkanOleh || !doc.signatures.diserahkanOleh.name.trim()) {
      setSubmitErrorMsg('7. Kolom "Diserahkan Oleh" wajib diisi.');
      setIsSubmitting(false);
      focusEl(deptType === 'teknik' ? 'input-ttd-teknik-diserahkan' : 'input-ttd-prod-diserahkan');
      return;
    }

    // 8. Diketahui oleh
    if (!doc.signatures.diketahuiOleh1 || !doc.signatures.diketahuiOleh1.name.trim()) {
      setSubmitErrorMsg('8. Kolom "Diketahui Oleh" wajib diisi.');
      setIsSubmitting(false);
      focusEl(deptType === 'teknik' ? 'input-ttd-teknik-diketahui1' : 'input-ttd-prod-diketahui1');
      return;
    }

    // 9. Diterima oleh
    if (!doc.signatures.diterimaOleh || !doc.signatures.diterimaOleh.name.trim()) {
      setSubmitErrorMsg('9. Kolom "Diterima Oleh" wajib diisi.');
      setIsSubmitting(false);
      focusEl(deptType === 'teknik' ? 'input-ttd-teknik-diterima' : 'input-ttd-prod-diterima');
      return;
    }

    // 10. Diperiksa / Diketahui lagi
    if (deptType === 'teknik') {
      if (!doc.signatures.diketahuiOleh2 || !doc.signatures.diketahuiOleh2.name.trim()) {
        setSubmitErrorMsg('10. Kolom "Diketahui Oleh (Manager)" wajib diisi.');
        setIsSubmitting(false);
        focusEl('input-ttd-teknik-diketahui2');
        return;
      }
    } else {
      if (!doc.signatures.diperiksaOleh || !doc.signatures.diperiksaOleh.name.trim()) {
        setSubmitErrorMsg('10. Kolom "Diperiksa Oleh" wajib diisi.');
        setIsSubmitting(false);
        focusEl('input-ttd-prod-diperiksa');
        return;
      }
    }

    try {
      const itemsClean =
        deptType === 'teknik'
          ? doc.itemsTeknik.map((t) => ({
              kodeBarang: t.kodeBarang,
              namaBarang: t.namaBarang,
              jumlah: t.jumlah,
              satuan: t.satuan,
              beratKg: t.beratKg,
              noFpb: t.noFpb || '',
              keterangan: t.keterangan
            }))
          : doc.itemsProduksi.map((p) => ({
              kodeItem: p.kodeItem,
              namaItem: p.namaItem,
              qty: p.qty,
              tglMasuk: p.tglMasuk,
              batchNo: p.batchNo,
              satuan: p.satuan,
              spk: p.spk,
              keterangan: p.keterangan
            }));

      const payload = {
        action: 'create',
        departemen: doc.departemen,
        bagian: doc.bagian,
        noBstb: doc.noBstb,
        tanggal: doc.tanggal,
        items: itemsClean
      };

      // Simpan data ke Google Sheet via webhook
      const webhookUrl = getAppScriptUrl();
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      } catch (postErr) {
        console.warn('Background sync warning:', postErr);
      }

      // Simpan riwayat lokal
      try {
        const saved = localStorage.getItem('mmp_bstb_history');
        const list: BSTBDocument[] = saved ? JSON.parse(saved) : [];
        const updated = [doc, ...list.filter((h) => h.id !== doc.id && h.noBstb !== doc.noBstb)];
        localStorage.setItem('mmp_bstb_history', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }

      // Alihkan ke tampilan output berurutan (WA dulu, lalu Print)
      setIsWaSent(false);
      setViewMode('output');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setSubmitErrorMsg('Gagal memproses formulir. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // LANGKAH 1: KIRIM NOTIFIKASI WA KE NOMOR ADMIN (085772557055)
  const handleSendWA = () => {
    let itemsSummary = '';
    if (deptType === 'teknik') {
      itemsSummary = doc.itemsTeknik
        .filter((t) => t.namaBarang)
        .map((t, idx) => `${idx + 1}. ${t.namaBarang} (${t.jumlah || 0} ${t.satuan})`)
        .join('\n');
    } else {
      itemsSummary = doc.itemsProduksi
        .filter((p) => p.namaItem)
        .map((p, idx) => `${idx + 1}. ${p.namaItem} (${p.qty || 0} ${p.satuan})`)
        .join('\n');
    }

    const pesan = `Pemberitahuan BSTB Baru:\n\n*Nomor BSTB:* ${doc.noBstb}\n*Departemen:* ${deptType === 'scm' ? 'SCM' : deptType.toUpperCase()}\n*Bagian:* ${doc.bagian}\n*Tanggal:* ${doc.tanggal}\n\n*Rincian Barang:*\n${itemsSummary || '- Tidak ada rincian item -'}\n\nMohon dapat dicek dan ditindaklanjuti. Terima kasih.`;

    const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(pesan)}`;
    window.open(waUrl, '_blank');

    // Tandai notifikasi WA telah selesai sehingga langkah Cetak/Print terbuka
    setIsWaSent(true);
  };

  // LANGKAH 2: CETAK DOKUMEN BSTB (PRINT)
  const handlePrint = () => {
    printDocument();
  };

  const handleResetForm = () => {
    setDoc(createInitialDoc(deptType));
    setIsWaSent(false);
    setViewMode('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isTeknik = deptType === 'teknik';
  const isScm = deptType === 'scm';

  // ==========================================================
  // TAMPILAN OUTPUT DOKUMEN (SETELAH SUBMIT)
  // TIDAK BOLEH BERBARENGAN: WA DULU, SETELAH SELESAI BARU MENUJU PRINT
  // ==========================================================
  if (viewMode === 'output') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between font-sans">
        {/* Top Header */}
        <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 shrink-0 flex items-center justify-center p-0.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 leading-tight">
                  Dokumen BSTB Selesai Disubmit
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  {doc.noBstb} &bull; Bagian {doc.bagian}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Input BSTB Baru</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Output */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-4">
          {/* BAR TOMBOL AKSI KOMPAK (TANPA KARTU BESAR & TANPA KETERANGAN PANJANG) */}
          <div className="no-print bg-white rounded-xl shadow-xs border border-slate-200 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">

                {/* 2. Tombol Kirim Notifikasi WhatsApp */}
                <button
                  type="button"
                  onClick={handleSendWA}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer ${
                    isWaSent
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isWaSent ? 'Notifikasi WA Terkirim (Kirim Ulang)' : 'Kirim Notifikasi ke WhatsApp'}
                  </span>
                  {isWaSent && <CheckCircle2 className="w-4 h-4 text-emerald-200 ml-1" />}
                </button>

                {/* 3. Tombol Cetak BSTB */}
                <button
                  type="button"
                  disabled={!isWaSent}
                  onClick={handlePrint}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                    isWaSent
                      ? 'bg-slate-900 hover:bg-black active:bg-slate-800 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  }`}
                  title={!isWaSent ? 'Kirim notifikasi WhatsApp terlebih dahulu' : 'Cetak Dokumen BSTB'}
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Cetak Dokumen BSTB</span>
                </button>
              </div>

              {/* 4. Tombol Input BSTB Baru */}
              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input BSTB Baru</span>
              </button>
            </div>
          </div>

          {/* Pratinjau Dokumen BSTB A4 untuk diperiksa user */}
          <div className="bg-slate-200/80 p-3 sm:p-6 rounded-2xl shadow-inner overflow-x-auto">
            <DocumentPreview doc={doc} />
          </div>
        </main>

        {/* Footer */}
        <footer className="no-print bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
          <span>&copy; 2026 PT Mitra Multi Packaging &bull; Human Capital & General Affairs</span>
        </footer>
      </div>
    );
  }

  // ==========================================================
  // TAMPILAN FORMULIR INPUT BSTB (MURNI 1 TOMBOL: SUBMIT)
  // ==========================================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between font-sans">
      {/* Top Header - Bersih & Proporsional */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 flex items-center justify-center p-0.5 rounded-lg bg-slate-50 border border-slate-100">
              <LogoMMP variant="dots" size={34} className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 leading-tight">
                PT Mitra Multi Packaging
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Formulir Bukti Serah Terima Barang (BSTB)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              Departemen {deptType === 'teknik' ? 'Teknik' : deptType === 'scm' ? 'SCM' : 'Produksi'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <form
          onSubmit={handleSubmitForm}
          noValidate
          className="no-print bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-6"
        >
          {/* Header Identitas & Switch Format */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Input Bukti Serah Terima Barang
              </h2>
              <p className="text-xs text-slate-500">
                Silakan lengkapi data barang dan nomor BSTB di bawah ini.
              </p>
            </div>

            {/* Pilihan Format: BSTB Produksi, BSTB Teknik, atau BSTB SCM */}
            <div className="inline-flex flex-wrap p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
              <button
                type="button"
                onClick={() => handleSwitchDept('produksi')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  deptType === 'produksi'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BSTB Produksi
              </button>
              <button
                type="button"
                onClick={() => handleSwitchDept('teknik')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  deptType === 'teknik'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BSTB Teknik
              </button>
              <button
                type="button"
                onClick={() => handleSwitchDept('scm')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  deptType === 'scm'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BSTB SCM
              </button>
            </div>
          </div>

          {submitErrorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{submitErrorMsg}</span>
            </div>
          )}

          {/* Form Header Info (Nomor BSTB, Tanggal, Bagian) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="input-nomor-bstb" className="block text-xs font-bold text-slate-700 mb-1">
                Nomor BSTB <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="input-nomor-bstb"
                type="text"
                required
                value={doc.noBstb}
                onChange={(e) => setDoc({ ...doc, noBstb: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder={deptType === 'teknik' ? 'Contoh: 011/BSTB-TNK-/K/2026' : deptType === 'scm' ? 'Contoh: 004/RM-WH/VII/2026' : 'Contoh: 029/PRODB3/K/2026'}
              />
            </div>

            <div>
              <label htmlFor="input-tanggal-bstb" className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal BSTB <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="input-tanggal-bstb"
                type="date"
                required
                value={doc.tanggal}
                onChange={(e) => setDoc({ ...doc, tanggal: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="input-bagian-bstb" className="block text-xs font-bold text-slate-700 mb-1">
                Bagian / Departemen <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="input-bagian-bstb"
                type="text"
                required
                value={doc.bagian}
                onChange={(e) => setDoc({ ...doc, bagian: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder={deptType === 'teknik' ? 'Contoh: Maintenance & Utility' : deptType === 'scm' ? 'Contoh: SCM' : 'Contoh: Printing & Slitting'}
              />
            </div>
          </div>

          {/* TABEL BARANG / ITEM */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Daftar Barang / Item:
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl min-h-[480px] pb-56 bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  {isTeknik ? (
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3 min-w-[130px]">
                        Kode Barang <span className="text-rose-500 font-bold">*</span>
                      </th>
                      <th className="py-2.5 px-3 min-w-[180px]">Nama Barang</th>
                      <th className="py-2.5 px-3 min-w-[85px]">
                        Jumlah <span className="text-rose-500 font-bold">*</span>
                      </th>
                      <th className="py-2.5 px-3 min-w-[85px]">Satuan</th>
                      <th className="py-2.5 px-3 min-w-[85px]">
                        Berat (Kg) <span className="text-rose-500 font-bold">*</span>
                      </th>
                      <th className="py-2.5 px-3 min-w-[110px]">No. FPB</th>
                      <th className="py-2.5 px-3 min-w-[140px]">Keterangan</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3 min-w-[130px]">
                        Kode Item <span className="text-rose-500 font-bold">*</span>
                      </th>
                      <th className="py-2.5 px-3 min-w-[180px]">Nama Item</th>
                      <th className="py-2.5 px-3 min-w-[80px]">
                        QTY <span className="text-rose-500 font-bold">*</span>
                      </th>
                      <th className="py-2.5 px-3 min-w-[110px]">Tgl Masuk</th>
                      <th className="py-2.5 px-3 min-w-[90px]">Batch #</th>
                      <th className="py-2.5 px-3 min-w-[85px]">Satuan</th>
                      <th className="py-2.5 px-3 min-w-[90px]">SPK</th>
                      <th className="py-2.5 px-3 min-w-[120px]">Keterangan</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {isTeknik
                    ? doc.itemsTeknik.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-center text-slate-500 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2">
                            <select
                              id={`input-teknik-kode-${idx}`}
                              required
                              value={item.kodeBarang}
                              onChange={(e) => handleKodeChange(idx, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 font-mono outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer font-bold"
                            >
                              <option value="">-- Pilih Kode --</option>
                              {MASTER_ITEMS_B3.map((m) => (
                                <option key={m.code} value={m.code}>
                                  {m.code}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-2 relative min-w-[220px]">
                            <SearchableItemCombobox
                              value={item.namaBarang}
                              selectedCode={item.kodeBarang}
                              onSelect={(m) => handleSelectMasterItem(idx, m)}
                              placeholder="-- Ketik / Pilih Nama Barang --"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              id={`input-teknik-jumlah-${idx}`}
                              type="text"
                              required
                              value={item.jumlah}
                              onChange={(e) => {
                                const arr = [...doc.itemsTeknik];
                                arr[idx].jumlah = e.target.value;
                                setDoc({ ...doc, itemsTeknik: arr });
                              }}
                              placeholder="Wajib diisi"
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs outline-none focus:bg-white text-center font-bold"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={item.satuan}
                              onChange={(e) => {
                                const arr = [...doc.itemsTeknik];
                                arr[idx].satuan = e.target.value;
                                setDoc({ ...doc, itemsTeknik: arr });
                              }}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-xs cursor-pointer font-medium"
                            >
                              {SATUAN_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              id={`input-teknik-berat-${idx}`}
                              type="text"
                              required
                              value={item.beratKg}
                              onChange={(e) => {
                                const arr = [...doc.itemsTeknik];
                                arr[idx].beratKg = e.target.value;
                                setDoc({ ...doc, itemsTeknik: arr });
                              }}
                              placeholder="Wajib diisi"
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs outline-none focus:bg-white text-center font-bold"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={item.noFpb || ''}
                              onChange={(e) => {
                                const arr = [...doc.itemsTeknik];
                                arr[idx].noFpb = e.target.value;
                                setDoc({ ...doc, itemsTeknik: arr });
                              }}
                              placeholder="No. FPB (opsional)"
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs outline-none focus:bg-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={item.keterangan}
                              onChange={(e) => {
                                const arr = [...doc.itemsTeknik];
                                arr[idx].keterangan = e.target.value;
                                setDoc({ ...doc, itemsTeknik: arr });
                              }}
                              placeholder=""
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs outline-none focus:bg-white"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <button
                              type="button"
                              disabled={doc.itemsTeknik.length <= 1}
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    : doc.itemsProduksi.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-center text-slate-500 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2">
                            <select
                              id={`input-prod-kode-${idx}`}
                              required
                              value={item.kodeItem}
                              onChange={(e) => handleKodeChange(idx, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 font-mono outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer font-bold"
                            >
                              <option value="">-- Pilih Kode --</option>
                              {MASTER_ITEMS_B3.map((m) => (
                                <option key={m.code} value={m.code}>
                                  {m.code}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-2 relative min-w-[220px]">
                            <SearchableItemCombobox
                              value={item.namaItem}
                              selectedCode={item.kodeItem}
                              onSelect={(m) => handleSelectMasterItem(idx, m)}
                              placeholder="-- Ketik / Pilih Nama Item --"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              id={`input-prod-qty-${idx}`}
                              type="text"
                              required
                              value={item.qty}
                              onChange={(e) => {
                                const arr = [...doc.itemsProduksi];
                                arr[idx].qty = e.target.value;
                                setDoc({ ...doc, itemsProduksi: arr });
                              }}
                              placeholder="Wajib diisi"
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs outline-none focus:bg-white text-center font-bold"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="date"
                              value={item.tglMasuk}
                              onChange={(e) => {
                                const arr = [...doc.itemsProduksi];
                                arr[idx].tglMasuk = e.target.value;
                                setDoc({ ...doc, itemsProduksi: arr });
                              }}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-xs"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={item.batchNo}
                              onChange={(e) => {
                                const arr = [...doc.itemsProduksi];
                                arr[idx].batchNo = e.target.value;
                                setDoc({ ...doc, itemsProduksi: arr });
                              }}
                              placeholder=""
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs outline-none focus:bg-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={item.satuan}
                              onChange={(e) => {
                                const arr = [...doc.itemsProduksi];
                                arr[idx].satuan = e.target.value;
                                setDoc({ ...doc, itemsProduksi: arr });
                              }}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-xs cursor-pointer font-medium"
                            >
                              {SATUAN_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={item.spk}
                              onChange={(e) => {
                                const arr = [...doc.itemsProduksi];
                                arr[idx].spk = e.target.value;
                                setDoc({ ...doc, itemsProduksi: arr });
                              }}
                              placeholder=""
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs outline-none focus:bg-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={item.keterangan}
                              onChange={(e) => {
                                const arr = [...doc.itemsProduksi];
                                arr[idx].keterangan = e.target.value;
                                setDoc({ ...doc, itemsProduksi: arr });
                              }}
                              placeholder=""
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs outline-none focus:bg-white"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <button
                              type="button"
                              disabled={doc.itemsProduksi.length <= 1}
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Penandatangan Fisik Dokumen (Untuk Cetak) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-700">
              Petugas Penandatangan (Dicantumkan pada Lembar Cetak):
            </h4>

            {isTeknik ? (
              /* SIGNATURES TEKNIK: Diserahkan, SPV, Manager, Diterima */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label htmlFor="input-ttd-teknik-diserahkan" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Diserahkan Oleh <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="input-ttd-teknik-diserahkan"
                    type="text"
                    required
                    value={doc.signatures.diserahkanOleh.name}
                    onChange={(e) =>
                      setDoc({
                        ...doc,
                        signatures: {
                          ...doc.signatures,
                          diserahkanOleh: { ...doc.signatures.diserahkanOleh, name: e.target.value }
                        }
                      })
                    }
                    placeholder="Nama Penyerah (Wajib)"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="input-ttd-teknik-diketahui1" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Diketahui Oleh (SPV) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="input-ttd-teknik-diketahui1"
                    type="text"
                    required
                    value={doc.signatures.diketahuiOleh1.name}
                    onChange={(e) =>
                      setDoc({
                        ...doc,
                        signatures: {
                          ...doc.signatures,
                          diketahuiOleh1: { ...doc.signatures.diketahuiOleh1, name: e.target.value }
                        }
                      })
                    }
                    placeholder="Nama SPV (Wajib)"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="input-ttd-teknik-diketahui2" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Diketahui Oleh (Manager) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="input-ttd-teknik-diketahui2"
                    type="text"
                    required
                    value={doc.signatures.diketahuiOleh2?.name || ''}
                    onChange={(e) =>
                      setDoc({
                        ...doc,
                        signatures: {
                          ...doc.signatures,
                          diketahuiOleh2: { ...doc.signatures.diketahuiOleh2, name: e.target.value }
                        }
                      })
                    }
                    placeholder="Nama Manager (Wajib)"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="input-ttd-teknik-diterima" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Diterima Oleh (Penerima) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="input-ttd-teknik-diterima"
                    type="text"
                    required
                    value={doc.signatures.diterimaOleh.name}
                    onChange={(e) =>
                      setDoc({
                        ...doc,
                        signatures: {
                          ...doc.signatures,
                          diterimaOleh: { ...doc.signatures.diterimaOleh, name: e.target.value }
                        }
                      })
                    }
                    placeholder="Nama Penerima (Wajib)"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              /* SIGNATURES PRODUKSI: Diserahkan, SPV, Diterima, Diperiksa Oleh (QC) */
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label htmlFor="input-ttd-prod-diserahkan" className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Diserahkan Oleh <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      id="input-ttd-prod-diserahkan"
                      type="text"
                      required
                      value={doc.signatures.diserahkanOleh.name}
                      onChange={(e) =>
                        setDoc({
                          ...doc,
                          signatures: {
                            ...doc.signatures,
                            diserahkanOleh: { ...doc.signatures.diserahkanOleh, name: e.target.value }
                          }
                        })
                      }
                      placeholder="Nama Penyerah (Wajib)"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="input-ttd-prod-diketahui1" className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Diketahui Oleh (SPV) <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      id="input-ttd-prod-diketahui1"
                      type="text"
                      required
                      value={doc.signatures.diketahuiOleh1.name}
                      onChange={(e) =>
                        setDoc({
                          ...doc,
                          signatures: {
                            ...doc.signatures,
                            diketahuiOleh1: { ...doc.signatures.diketahuiOleh1, name: e.target.value }
                          }
                        })
                      }
                      placeholder="Nama SPV (Wajib)"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="input-ttd-prod-diterima" className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Diterima Oleh (Penerima) <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      id="input-ttd-prod-diterima"
                      type="text"
                      required
                      value={doc.signatures.diterimaOleh.name}
                      onChange={(e) =>
                        setDoc({
                          ...doc,
                          signatures: {
                            ...doc.signatures,
                            diterimaOleh: { ...doc.signatures.diterimaOleh, name: e.target.value }
                          }
                        })
                      }
                      placeholder="Nama Penerima (Wajib)"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="input-ttd-prod-diperiksa" className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Diperiksa Oleh (QC) <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      id="input-ttd-prod-diperiksa"
                      type="text"
                      required
                      value={doc.signatures.diperiksaOleh?.name || ''}
                      onChange={(e) =>
                        setDoc({
                          ...doc,
                          signatures: {
                            ...doc.signatures,
                            diperiksaOleh: { ...doc.signatures.diperiksaOleh, name: e.target.value }
                          }
                        })
                      }
                      placeholder="Nama Pemeriksa QC (Wajib)"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* WAKTU START & FINISH (TERISI OTOMATIS) */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Waktu Pengerjaan (Start & Finish):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const h = String(now.getHours()).padStart(2, '0');
                        const m = String(now.getMinutes()).padStart(2, '0');
                        const s = String(now.getSeconds()).padStart(2, '0');
                        const time = `${h}:${m}:${s}`;
                        setDoc({
                          ...doc,
                          timesTime: { startTime: time, finishTime: time }
                        });
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline"
                    >
                      Perbarui ke Waktu Sekarang (HH:MM:SS)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Start Time (HH:MM:SS):
                      </label>
                      <input
                        type="time"
                        step="1"
                        value={doc.timesTime.startTime}
                        onChange={(e) =>
                          setDoc({
                            ...doc,
                            timesTime: { ...doc.timesTime, startTime: e.target.value }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Finish Time (HH:MM:SS):
                      </label>
                      <input
                        type="time"
                        step="1"
                        value={doc.timesTime.finishTime}
                        onChange={(e) =>
                          setDoc({
                            ...doc,
                            timesTime: { ...doc.timesTime, finishTime: e.target.value }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HANYA ADA SATU TOMBOL DI FORM INPUT: SUBMIT */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-600/30 text-white text-sm sm:text-base font-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 tracking-wide"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses Dokumen...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>SUBMIT</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
        <span>&copy; 2026 PT Mitra Multi Packaging &bull; Human Capital & General Affairs</span>
      </footer>
    </div>
  );
}
