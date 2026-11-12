import React, { useState } from 'react';
import {
  BSTBDocument,
  DepartmentType,
  DEPT_DEFAULTS,
  BSTBItemTeknik,
  BSTBItemProduksi
} from '../types/bstb';
import { CATALOG_TEKNIK, CATALOG_PRODUKSI } from '../utils/sampleData';
import {
  Plus,
  Trash2,
  Copy,
  Wrench,
  Factory,
  Sparkles,
  Calendar,
  Hash,
  Building2,
  Clock,
  UserCheck,
  ChevronDown,
  Layers
} from 'lucide-react';

interface BSTBEditorProps {
  document: BSTBDocument;
  onChange: (updatedDoc: BSTBDocument) => void;
  onDepartmentChange: (dept: DepartmentType) => void;
}

export const BSTBEditor: React.FC<BSTBEditorProps> = ({
  document: doc,
  onChange,
  onDepartmentChange
}) => {
  const isTeknik = doc.departemen === 'teknik';
  const deptConfig = DEPT_DEFAULTS[doc.departemen];
  const [showCatalogModal, setShowCatalogModal] = useState(false);

  // Update root fields
  const handleFieldChange = <K extends keyof BSTBDocument>(field: K, value: BSTBDocument[K]) => {
    onChange({
      ...doc,
      [field]: value,
      updatedAt: new Date().toISOString()
    });
  };

  // Generate automated Nomor BSTB
  const handleAutoGenerateNo = () => {
    const today = new Date();
    const year = today.getFullYear();
    const randomSeq = String(Math.floor(Math.random() * 900) + 100);
    const generatedNo = isTeknik
      ? `${randomSeq}/BSTB-TNK-/K/${year}`
      : `${randomSeq}/PRODB3/K/${year}`;
    handleFieldChange('noBstb', generatedNo);
  };

  // Add Item to Teknik
  const handleAddTeknikItem = () => {
    const newItem: BSTBItemTeknik = {
      id: `t-${Date.now()}`,
      kodeBarang: '',
      namaBarang: '',
      jumlah: 1,
      satuan: 'Pcs',
      beratKg: 0,
      keterangan: ''
    };
    handleFieldChange('itemsTeknik', [...doc.itemsTeknik, newItem]);
  };

  // Add Item to Produksi
  const handleAddProduksiItem = () => {
    const newItem: BSTBItemProduksi = {
      id: `p-${Date.now()}`,
      kodeItem: '',
      namaItem: '',
      qty: 1,
      tglMasuk: doc.tanggal || new Date().toISOString().split('T')[0],
      batchNo: `B${new Date().getFullYear().toString().slice(-2)}-${Math.floor(1000 + Math.random() * 9000)}`,
      satuan: 'Roll',
      spk: `SPK/${doc.bagian.includes('Print') ? 'PRN' : 'PRO'}/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      keterangan: ''
    };
    handleFieldChange('itemsProduksi', [...doc.itemsProduksi, newItem]);
  };

  // Update item in Teknik
  const handleUpdateTeknikItem = (index: number, key: keyof BSTBItemTeknik, value: any) => {
    const updated = [...doc.itemsTeknik];
    updated[index] = { ...updated[index], [key]: value };
    handleFieldChange('itemsTeknik', updated);
  };

  // Update item in Produksi
  const handleUpdateProduksiItem = (index: number, key: keyof BSTBItemProduksi, value: any) => {
    const updated = [...doc.itemsProduksi];
    updated[index] = { ...updated[index], [key]: value };
    handleFieldChange('itemsProduksi', updated);
  };

  // Remove item
  const handleRemoveTeknikItem = (index: number) => {
    const updated = doc.itemsTeknik.filter((_, i) => i !== index);
    handleFieldChange('itemsTeknik', updated);
  };

  const handleRemoveProduksiItem = (index: number) => {
    const updated = doc.itemsProduksi.filter((_, i) => i !== index);
    handleFieldChange('itemsProduksi', updated);
  };

  // Duplicate item
  const handleDuplicateTeknikItem = (index: number) => {
    const target = doc.itemsTeknik[index];
    const duplicated: BSTBItemTeknik = {
      ...target,
      id: `t-${Date.now()}`
    };
    const updated = [...doc.itemsTeknik];
    updated.splice(index + 1, 0, duplicated);
    handleFieldChange('itemsTeknik', updated);
  };

  const handleDuplicateProduksiItem = (index: number) => {
    const target = doc.itemsProduksi[index];
    const duplicated: BSTBItemProduksi = {
      ...target,
      id: `p-${Date.now()}`
    };
    const updated = [...doc.itemsProduksi];
    updated.splice(index + 1, 0, duplicated);
    handleFieldChange('itemsProduksi', updated);
  };

  // Add from catalog
  const handleSelectCatalogItem = (item: any) => {
    if (isTeknik) {
      const newItem: BSTBItemTeknik = {
        id: `t-${Date.now()}`,
        kodeBarang: item.kode,
        namaBarang: item.nama,
        jumlah: 1,
        satuan: item.satuan || 'Pcs',
        beratKg: item.berat || 0,
        keterangan: 'Stok Baru Gudang Teknik'
      };
      handleFieldChange('itemsTeknik', [...doc.itemsTeknik, newItem]);
    } else {
      const newItem: BSTBItemProduksi = {
        id: `p-${Date.now()}`,
        kodeItem: item.kode,
        namaItem: item.nama,
        qty: 1,
        tglMasuk: doc.tanggal || new Date().toISOString().split('T')[0],
        batchNo: `B26-${Math.floor(1000 + Math.random() * 9000)}`,
        satuan: item.satuan || 'Roll',
        spk: `SPK/PROD/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        keterangan: 'Material Siap Produksi'
      };
      handleFieldChange('itemsProduksi', [...doc.itemsProduksi, newItem]);
    }
    setShowCatalogModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. DEPARTMENT SELECTOR TAB */}
      <div className="bg-white rounded-xl shadow-xs border border-neutral-200/80 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Pilih Departemen Target
            </span>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Format Dokumen BSTB
            </h2>
          </div>

          <div className="inline-flex rounded-lg bg-neutral-100 p-1 border border-neutral-200">
            <button
              type="button"
              onClick={() => onDepartmentChange('teknik')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                isTeknik
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              <span>Dept. Teknik</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                F-TNK-027
              </span>
            </button>
            <button
              type="button"
              onClick={() => onDepartmentChange('produksi')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                !isTeknik
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Factory className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dept. Produksi</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                F-PRO-48
              </span>
            </button>
          </div>
        </div>

        {/* Current ISO standard banner */}
        <div className={`p-3 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-2 ${
          isTeknik 
            ? 'bg-blue-50/70 border-blue-200/80 text-blue-900' 
            : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-bold">
              {isTeknik ? '🔧 Standar ISO Dept. Teknik (Halaman 1)' : '🏭 Standar ISO Dept. Produksi (Halaman 2)'}
            </span>
            <span className="text-neutral-400">|</span>
            <span>No Dokumen: <strong>{doc.noDokumen}</strong></span>
            <span className="text-neutral-400">|</span>
            <span>Revisi: <strong>{doc.revisi}</strong></span>
            <span className="text-neutral-400">|</span>
            <span>Tgl Terbit: <strong>{doc.tanggalTerbit}</strong></span>
          </div>

          <span className="text-[11px] font-medium opacity-80">
            {isTeknik ? 'Kolom: Berat (Kg) & SPV/Manager' : 'Kolom: Batch #, SPK, Waktu Start/Finish'}
          </span>
        </div>
      </div>

      {/* 2. GENERAL BSTB INFORMATION */}
      <div className="bg-white rounded-xl shadow-xs border border-neutral-200/80 p-4 sm:p-5 space-y-4">
        <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
          <Hash className="w-4 h-4 text-neutral-500" />
          Informasi Utama BSTB
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nomor BSTB */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-700">
                Nomor BSTB <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateNo}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                title="Generate nomor otomatis"
              >
                <Sparkles className="w-3 h-3" /> Auto
              </button>
            </div>
            <input
              type="text"
              value={doc.noBstb}
              onChange={(e) => handleFieldChange('noBstb', e.target.value)}
              placeholder={deptConfig.sampleNo}
              className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Tanggal BSTB <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={doc.tanggal}
                onChange={(e) => handleFieldChange('tanggal', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Bagian / Sub-dept */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Bagian / Unit Kerja <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="bagian-list"
                value={doc.bagian}
                onChange={(e) => handleFieldChange('bagian', e.target.value)}
                placeholder="Pilih atau ketik bagian..."
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <datalist id="bagian-list">
                {deptConfig.bagianOptions.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* Produksi specific: Start and Finish time */}
        {!isTeknik && (
          <div className="pt-3 border-t border-neutral-200/80">
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5" />
              Pencatatan Waktu Pengerjaan / Operasional (Times time)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Start (Waktu Mulai Serah Terima)
                </label>
                <input
                  type="time"
                  value={doc.timesTime.startTime}
                  onChange={(e) =>
                    handleFieldChange('timesTime', {
                      ...doc.timesTime,
                      startTime: e.target.value
                    })
                  }
                  className="w-full text-xs px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Finish (Waktu Selesai Serah Terima)
                </label>
                <input
                  type="time"
                  value={doc.timesTime.finishTime}
                  onChange={(e) =>
                    handleFieldChange('timesTime', {
                      ...doc.timesTime,
                      finishTime: e.target.value
                    })
                  }
                  className="w-full text-xs px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. ITEMS TABLE INPUT */}
      <div className="bg-white rounded-xl shadow-xs border border-neutral-200/80 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <span>Daftar Barang Serah Terima</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                {isTeknik ? doc.itemsTeknik.length : doc.itemsProduksi.length} Baris
              </span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isTeknik
                ? 'Input Kode Barang, Nama Barang, Jumlah, Satuan, Berat (Kg), dan Keterangan'
                : 'Input Kode Item, Nama Item, QTY, Tgl Masuk, Batch #, Satuan, SPK, dan Keterangan'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCatalogModal(true)}
              className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pilih dari Master</span>
            </button>
            <button
              type="button"
              onClick={isTeknik ? handleAddTeknikItem : handleAddProduksiItem}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Baris</span>
            </button>
          </div>
        </div>

        {/* Dynamic Table Input based on Department */}
        <div className="overflow-x-auto border border-neutral-200 rounded-lg">
          {isTeknik ? (
            /* ================= TEKNIK INPUT TABLE ================= */
            <table className="w-full text-xs text-left min-w-[760px]">
              <thead className="bg-neutral-50 text-neutral-700 border-b border-neutral-200 uppercase font-semibold text-[10.5px]">
                <tr>
                  <th className="py-2.5 px-2 text-center w-10">No</th>
                  <th className="py-2.5 px-2 w-32">Kode Barang</th>
                  <th className="py-2.5 px-2">Nama Barang</th>
                  <th className="py-2.5 px-2 w-20 text-center">Jumlah</th>
                  <th className="py-2.5 px-2 w-24">Satuan</th>
                  <th className="py-2.5 px-2 w-24 text-center">Berat (Kg)</th>
                  <th className="py-2.5 px-2 w-36">Keterangan</th>
                  <th className="py-2.5 px-2 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {doc.itemsTeknik.map((item, index) => (
                  <tr key={item.id} className="hover:bg-neutral-50/70">
                    <td className="py-2 px-2 text-center font-medium text-neutral-500">
                      {index + 1}
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.kodeBarang}
                        onChange={(e) => handleUpdateTeknikItem(index, 'kodeBarang', e.target.value)}
                        placeholder="TNK-XXX"
                        className="w-full px-2 py-1 text-xs border border-neutral-300 rounded font-mono focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.namaBarang}
                        onChange={(e) => handleUpdateTeknikItem(index, 'namaBarang', e.target.value)}
                        placeholder="Nama spesifikasi barang..."
                        className="w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.jumlah}
                        onChange={(e) => handleUpdateTeknikItem(index, 'jumlah', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder="0"
                        className="w-full px-2 py-1 text-xs text-center border border-neutral-300 rounded font-semibold focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={item.satuan}
                        onChange={(e) => handleUpdateTeknikItem(index, 'satuan', e.target.value)}
                        className="w-full px-1.5 py-1 text-xs border border-neutral-300 rounded focus:border-indigo-500 focus:outline-none bg-white"
                      >
                        {deptConfig.satuanOptions.map((sat) => (
                          <option key={sat} value={sat}>{sat}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.beratKg}
                        onChange={(e) => handleUpdateTeknikItem(index, 'beratKg', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder="0.00"
                        className="w-full px-2 py-1 text-xs text-center border border-neutral-300 rounded focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.keterangan}
                        onChange={(e) => handleUpdateTeknikItem(index, 'keterangan', e.target.value)}
                        placeholder="Catatan..."
                        className="w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateTeknikItem(index)}
                          title="Duplikasi"
                          className="p-1 text-neutral-400 hover:text-indigo-600 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeknikItem(index)}
                          title="Hapus"
                          className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* ================= PRODUKSI INPUT TABLE ================= */
            <table className="w-full text-xs text-left min-w-[920px]">
              <thead className="bg-neutral-50 text-neutral-700 border-b border-neutral-200 uppercase font-semibold text-[10.5px]">
                <tr>
                  <th className="py-2.5 px-2 text-center w-10">No</th>
                  <th className="py-2.5 px-2 w-28">Kode Item</th>
                  <th className="py-2.5 px-2">Nama Item</th>
                  <th className="py-2.5 px-2 w-16 text-center">Qty</th>
                  <th className="py-2.5 px-2 w-28 text-center">Tgl Masuk</th>
                  <th className="py-2.5 px-2 w-28">Batch #</th>
                  <th className="py-2.5 px-2 w-20">Satuan</th>
                  <th className="py-2.5 px-2 w-28">SPK</th>
                  <th className="py-2.5 px-2 w-28">Keterangan</th>
                  <th className="py-2.5 px-2 text-center w-14">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {doc.itemsProduksi.map((item, index) => (
                  <tr key={item.id} className="hover:bg-neutral-50/70">
                    <td className="py-2 px-2 text-center font-medium text-neutral-500">
                      {index + 1}
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.kodeItem}
                        onChange={(e) => handleUpdateProduksiItem(index, 'kodeItem', e.target.value)}
                        placeholder="RM-XXX"
                        className="w-full px-2 py-1 text-xs border border-neutral-300 rounded font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.namaItem}
                        onChange={(e) => handleUpdateProduksiItem(index, 'namaItem', e.target.value)}
                        placeholder="Nama bahan / roll / tinta..."
                        className="w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.qty}
                        onChange={(e) => handleUpdateProduksiItem(index, 'qty', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder="0"
                        className="w-full px-1 py-1 text-xs text-center border border-neutral-300 rounded font-semibold focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="date"
                        value={item.tglMasuk}
                        onChange={(e) => handleUpdateProduksiItem(index, 'tglMasuk', e.target.value)}
                        className="w-full px-1.5 py-1 text-[11px] border border-neutral-300 rounded focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.batchNo}
                        onChange={(e) => handleUpdateProduksiItem(index, 'batchNo', e.target.value)}
                        placeholder="LOT/Batch"
                        className="w-full px-2 py-1 text-xs border border-neutral-300 rounded font-mono text-[11px] focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={item.satuan}
                        onChange={(e) => handleUpdateProduksiItem(index, 'satuan', e.target.value)}
                        className="w-full px-1 py-1 text-xs border border-neutral-300 rounded focus:border-emerald-500 focus:outline-none bg-white"
                      >
                        {deptConfig.satuanOptions.map((sat) => (
                          <option key={sat} value={sat}>{sat}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.spk}
                        onChange={(e) => handleUpdateProduksiItem(index, 'spk', e.target.value)}
                        placeholder="SPK No..."
                        className="w-full px-2 py-1 text-xs border border-neutral-300 rounded font-mono text-[11px] focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.keterangan}
                        onChange={(e) => handleUpdateProduksiItem(index, 'keterangan', e.target.value)}
                        placeholder="Catatan..."
                        className="w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateProduksiItem(index)}
                          title="Duplikasi"
                          className="p-1 text-neutral-400 hover:text-emerald-600 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduksiItem(index)}
                          title="Hapus"
                          className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Empty state hint */}
        {((isTeknik && doc.itemsTeknik.length === 0) || (!isTeknik && doc.itemsProduksi.length === 0)) && (
          <div className="p-8 text-center text-neutral-500 bg-neutral-50/50 rounded-lg border border-dashed border-neutral-300 mt-3">
            <p className="text-sm font-medium">Belum ada item barang yang diinput.</p>
            <p className="text-xs text-neutral-400 mt-1">
              Klik &quot;Tambah Baris&quot; atau &quot;Pilih dari Master&quot; untuk memasukkan barang serah terima.
            </p>
          </div>
        )}
      </div>

      {/* 4. SIGNATURES & ROLES CUSTOMIZATION */}
      <div className="bg-white rounded-xl shadow-xs border border-neutral-200/80 p-4 sm:p-5">
        <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2 mb-4">
          <UserCheck className="w-4 h-4 text-neutral-500" />
          Petugas Penandatangan Dokumen BSTB
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Diserahkan oleh */}
          <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50">
            <span className="text-[11px] font-semibold text-neutral-600 uppercase block mb-1">
              Diserahkan Oleh
            </span>
            <input
              type="text"
              value={doc.signatures.diserahkanOleh.name}
              onChange={(e) =>
                handleFieldChange('signatures', {
                  ...doc.signatures,
                  diserahkanOleh: { ...doc.signatures.diserahkanOleh, name: e.target.value }
                })
              }
              placeholder="Nama Admin / Petugas"
              className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded bg-white focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[10px] text-neutral-400 mt-1 block">Role: Admin</span>
          </div>

          {/* Diketahui oleh 1 (SPV) */}
          <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50">
            <span className="text-[11px] font-semibold text-neutral-600 uppercase block mb-1">
              Diketahui Oleh (SPV)
            </span>
            <input
              type="text"
              value={doc.signatures.diketahuiOleh1.name}
              onChange={(e) =>
                handleFieldChange('signatures', {
                  ...doc.signatures,
                  diketahuiOleh1: { ...doc.signatures.diketahuiOleh1, name: e.target.value }
                })
              }
              placeholder="Nama Supervisor (SPV)"
              className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded bg-white focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[10px] text-neutral-400 mt-1 block">Role: SPV</span>
          </div>

          {/* Diketahui oleh 2 (Manager for Teknik) or Diperiksa Oleh (Produksi) */}
          {isTeknik ? (
            <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50">
              <span className="text-[11px] font-semibold text-neutral-600 uppercase block mb-1">
                Diketahui Oleh (Manager)
              </span>
              <input
                type="text"
                value={doc.signatures.diketahuiOleh2?.name || ''}
                onChange={(e) =>
                  handleFieldChange('signatures', {
                    ...doc.signatures,
                    diketahuiOleh2: { role: 'Manager', name: e.target.value }
                  })
                }
                placeholder="Nama Manager Teknik"
                className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded bg-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Role: Manager Teknik</span>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50">
              <span className="text-[11px] font-semibold text-neutral-600 uppercase block mb-1">
                Diperiksa Oleh (QC / Checker)
              </span>
              <input
                type="text"
                value={doc.signatures.diperiksaOleh?.name || ''}
                onChange={(e) =>
                  handleFieldChange('signatures', {
                    ...doc.signatures,
                    diperiksaOleh: { role: 'QC / Checker', name: e.target.value }
                  })
                }
                placeholder="Nama Petugas Pemeriksa"
                className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded bg-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Role: Pemeriksa Produksi</span>
            </div>
          )}

          {/* Diterima oleh */}
          <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50">
            <span className="text-[11px] font-semibold text-neutral-600 uppercase block mb-1">
              Diterima Oleh
            </span>
            <input
              type="text"
              value={doc.signatures.diterimaOleh.name}
              onChange={(e) =>
                handleFieldChange('signatures', {
                  ...doc.signatures,
                  diterimaOleh: { ...doc.signatures.diterimaOleh, name: e.target.value }
                })
              }
              placeholder="Nama Penerima Barang"
              className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded bg-white focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[10px] text-neutral-400 mt-1 block">Role: Penerima</span>
          </div>
        </div>
      </div>

      {/* MODAL: Master Catalog Picker */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-xl w-full p-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Pilih Master Barang - {isTeknik ? 'Departemen Teknik' : 'Departemen Produksi'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-500 py-2">
              Klik item di bawah untuk menambahkan langsung ke tabel form BSTB Anda:
            </p>

            <div className="overflow-y-auto space-y-2 pr-1 my-2">
              {(isTeknik ? CATALOG_TEKNIK : CATALOG_PRODUKSI).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectCatalogItem(item)}
                  className="p-2.5 rounded-lg border border-neutral-200 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono text-xs font-semibold text-indigo-700">
                      {item.kode}
                    </div>
                    <div className="text-xs font-medium text-neutral-800 mt-0.5">
                      {item.nama}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                      {item.satuan}
                    </span>
                    {'berat' in item && (item as any).berat !== undefined && (
                      <span className="block text-[10px] text-neutral-500 mt-0.5">
                        ~{(item as any).berat} Kg
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-neutral-200 text-right">
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
