import * as XLSX from 'xlsx';
import { BSTBDocument } from '../types/bstb';

export const exportBSTBToExcel = (input: BSTBDocument | BSTBDocument[]) => {
  if (Array.isArray(input)) {
    if (input.length === 0) return;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Teknik
    const teknikList = input.filter((d) => d.departemen === 'teknik');
    const rowsTeknik: (string | number)[][] = [
      [
        'No',
        'Tanggal Dokumen',
        'Nomor BSTB',
        'Bagian',
        'Kode Barang',
        'Nama Barang',
        'Jumlah',
        'Satuan',
        'Berat (Kg)',
        'No. FPB',
        'Keterangan'
      ]
    ];
    let tekNo = 1;
    teknikList.forEach((d) => {
      d.itemsTeknik.forEach((it, idx) => {
        rowsTeknik.push([
          idx === 0 ? tekNo : '',
          idx === 0 ? d.tanggal : '',
          idx === 0 ? d.noBstb : '',
          idx === 0 ? d.bagian : '',
          it.kodeBarang,
          it.namaBarang,
          it.jumlah,
          it.satuan,
          it.beratKg,
          it.noFpb || '',
          it.keterangan
        ]);
      });
      tekNo++;
    });
    const wsTek = XLSX.utils.aoa_to_sheet(rowsTeknik);
    XLSX.utils.book_append_sheet(wb, wsTek, 'Teknik');

    // Sheet 2: Produksi
    const prodList = input.filter((d) => d.departemen === 'produksi');
    const rowsProd: (string | number)[][] = [
      [
        'No',
        'Tanggal Dokumen',
        'Nomor BSTB',
        'Bagian',
        'Kode Item',
        'Nama Item',
        'QTY',
        'Tgl Masuk',
        'Batch #',
        'Satuan',
        'SPK',
        'Keterangan'
      ]
    ];
    let prodNo = 1;
    prodList.forEach((d) => {
      d.itemsProduksi.forEach((it, idx) => {
        rowsProd.push([
          idx === 0 ? prodNo : '',
          idx === 0 ? d.tanggal : '',
          idx === 0 ? d.noBstb : '',
          idx === 0 ? d.bagian : '',
          it.kodeItem,
          it.namaItem,
          it.qty,
          it.tglMasuk,
          it.batchNo,
          it.satuan,
          it.spk,
          it.keterangan
        ]);
      });
      prodNo++;
    });
    // Sheet 3: SCM / Gudang (Persis Format Produksi)
    const scmList = input.filter((d) => d.departemen === 'scm');
    const rowsScm: (string | number)[][] = [
      [
        'No',
        'Tanggal Dokumen',
        'Nomor BSTB',
        'Bagian',
        'Kode Item',
        'Nama Item',
        'QTY',
        'Tgl Masuk',
        'Batch #',
        'Satuan',
        'SPK',
        'Keterangan'
      ]
    ];
    let scmNo = 1;
    scmList.forEach((d) => {
      const items = (d.itemsProduksi && d.itemsProduksi.length > 0)
        ? d.itemsProduksi
        : (d.itemsScm || []).map((s) => ({
            id: s.id,
            kodeItem: s.kodeBarang || s.jenis || '',
            namaItem: s.namaBarang,
            qty: s.jumlah,
            tglMasuk: '',
            batchNo: '',
            satuan: s.satuan,
            spk: '',
            keterangan: s.keterangan
          }));

      items.forEach((it, idx) => {
        rowsScm.push([
          idx === 0 ? scmNo : '',
          idx === 0 ? d.tanggal : '',
          idx === 0 ? d.noBstb : '',
          idx === 0 ? d.bagian : '',
          it.kodeItem,
          it.namaItem,
          it.qty,
          it.tglMasuk,
          it.batchNo,
          it.satuan,
          it.spk,
          it.keterangan
        ]);
      });
      scmNo++;
    });
    const wsScm = XLSX.utils.aoa_to_sheet(rowsScm);
    XLSX.utils.book_append_sheet(wb, wsScm, 'SCM_Gudang');

    XLSX.writeFile(wb, `Rekap_BSTB_MMP_${new Date().toISOString().split('T')[0]}.xlsx`);
    return;
  }

  // Single document export
  const doc = input;
  const isTeknik = doc.departemen === 'teknik';
  const wb = XLSX.utils.book_new();

  const rows: (string | number)[][] = [];

  rows.push(['mitra multi packaging', '', '', '', 'No Dokumen:', doc.noDokumen || '']);
  rows.push(['Flexible Packaging Manufacturer', '', '', '', 'Revisi', doc.revisi || '']);
  rows.push(['FORM', '', '', '', 'Tanggal Terbit', doc.tanggalTerbit || '']);
  rows.push(['BUKTI SERAH TERIMA BARANG', '', '', '', '', '']);
  rows.push([doc.noBstb || '-', '', '', '', '', '']);
  rows.push(['', '', '', '', '', '']);

  rows.push(['Tanggal :', doc.tanggal || '-', '', '', '', '']);
  rows.push(['Bagian  :', doc.bagian || '-', '', '', '', '']);

  if (isTeknik) {
    rows.push(['Berikut telah kami serahkan barang-barang dengan perincian :', '', '', '', '', '', '']);
    rows.push(['', '', '', '', '', '', '']);

    rows.push([
      'No',
      'Kode Barang',
      'Nama Barang',
      'Jumlah',
      'Satuan',
      'Berat (Kg)',
      'Keterangan'
    ]);

    doc.itemsTeknik.forEach((item, index) => {
      rows.push([
        index + 1,
        item.kodeBarang || '',
        item.namaBarang || '',
        item.jumlah !== '' ? item.jumlah : '',
        item.satuan || '',
        item.beratKg !== '' ? item.beratKg : '',
        item.keterangan || ''
      ]);
    });
  } else if (doc.departemen === 'scm') {
    rows.push(['Berikut telah kami serahkan barang-barang dengan perincian :', '', '', '', '', '', '', '', '']);
    rows.push(['', '', '', '', '', '', '', '', '']);

    rows.push([
      'No',
      'KODE ITEM',
      'NAMA ITEM',
      'QTY',
      'TGL MASUK',
      'BATCH #',
      'SATUAN',
      'SPK',
      'Keterangan'
    ]);

    const scmItems = (doc.itemsProduksi && doc.itemsProduksi.length > 0)
      ? doc.itemsProduksi
      : (doc.itemsScm || []).map((s) => ({
          id: s.id,
          kodeItem: s.kodeBarang || s.jenis || '',
          namaItem: s.namaBarang,
          qty: s.jumlah,
          tglMasuk: '',
          batchNo: '',
          satuan: s.satuan,
          spk: '',
          keterangan: s.keterangan
        }));

    scmItems.forEach((item, index) => {
      rows.push([
        index + 1,
        item.kodeItem || '',
        item.namaItem || '',
        item.qty !== '' ? item.qty : '',
        item.tglMasuk || '',
        item.batchNo || '',
        item.satuan || '',
        item.spk || '',
        item.keterangan || ''
      ]);
    });
  } else {
    rows.push(['Dengan rincian sebagai berikut :', '', '', '', '', '', '', '', '']);
    rows.push(['', '', '', '', '', '', '', '', '']);

    rows.push([
      'No',
      'KODE ITEM',
      'NAMA ITEM',
      'QTY',
      'TGL MASUK',
      'BATCH #',
      'SATUAN',
      'SPK',
      'Keterangan'
    ]);

    doc.itemsProduksi.forEach((item, index) => {
      rows.push([
        index + 1,
        item.kodeItem || '',
        item.namaItem || '',
        item.qty !== '' ? item.qty : '',
        item.tglMasuk || '',
        item.batchNo || '',
        item.satuan || '',
        item.spk || '',
        item.keterangan || ''
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const safeDept = doc.departemen === 'scm' ? 'SCM_Gudang' : isTeknik ? 'Teknik' : 'Produksi';
  const safeNo = (doc.noBstb || 'BSTB').replace(/[^a-zA-Z0-9-_]/g, '_');
  XLSX.utils.book_append_sheet(wb, ws, `BSTB_${safeDept}`);
  XLSX.writeFile(wb, `BSTB_${safeDept}_${safeNo}.xlsx`);
};
