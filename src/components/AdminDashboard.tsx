import React, { useState } from 'react';
import { BSTBDocument } from '../types/bstb';
import {
  LayoutDashboard,
  FileText,
  Star,
  FileSpreadsheet,
  Printer,
  LogOut,
  ExternalLink,
  Search,
  Calendar,
  Layers,
  Copy,
  Check,
  Share2,
  Eye,
  Trash2,
  Menu,
  X,
  Users,
  CheckCircle2,
  Send,
  Building2,
  ShieldCheck,
  Code
} from 'lucide-react';
import { exportBSTBToExcel } from '../utils/excelExport';
import { printDocument } from '../utils/printHelper';
import { LogoMMP } from './CompanyLogo';
import { DocumentPreview } from './DocumentPreview';

interface AdminDashboardProps {
  onLogout: () => void;
  onOpenUserForm: () => void;
  historyList: BSTBDocument[];
  onDeleteHistory: (id: string) => void;
  onPreviewDoc: (doc: BSTBDocument) => void;
}

const RATING_LINK = 'https://s.id/HCGA_Service_Rate';
const SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1LrkFlhSFE5dkYzWYb4jqtnXkt5uaojXobRlaE9godQEnCK4OS8Efn22Y/edit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onOpenUserForm,
  historyList,
  onDeleteHistory,
  onPreviewDoc
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rating' | 'spreadsheet'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<'all' | 'teknik' | 'produksi'>('all');
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);
  const [copyRatingSuccess, setCopyRatingSuccess] = useState(false);
  const [targetPhone, setTargetPhone] = useState('');
  const [selectedDocForRating, setSelectedDocForRating] = useState<BSTBDocument | null>(
    historyList.length > 0 ? historyList[0] : null
  );
  const [previewModalDoc, setPreviewModalDoc] = useState<BSTBDocument | null>(null);

  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [copyAdminLinkSuccess, setCopyAdminLinkSuccess] = useState(false);

  // Perhitungan statistik kartu (mengikuti pola hijau #28a745 & ungu #6610f2 di recruitment portal)
  const todayStr = new Date().toISOString().split('T')[0];
  const totalCount = historyList.length;
  const todayCount = historyList.filter((d) => d.tanggal === todayStr).length;
  const teknikCount = historyList.filter((d) => d.departemen === 'teknik').length;
  const produksiCount = historyList.filter((d) => d.departemen === 'produksi').length;

  // Filter tabel BSTB
  const filteredList = historyList.filter((doc) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (doc.noBstb || '').toLowerCase().includes(q) ||
      (doc.bagian || '').toLowerCase().includes(q) ||
      (doc.tanggal || '').includes(q) ||
      (doc.itemsTeknik || []).some(
        (it) => it.namaBarang.toLowerCase().includes(q) || it.kodeBarang.toLowerCase().includes(q)
      ) ||
      (doc.itemsProduksi || []).some(
        (it) => it.namaItem.toLowerCase().includes(q) || it.kodeItem.toLowerCase().includes(q)
      );

    const matchDept =
      deptFilter === 'all' ? true : doc.departemen === deptFilter;

    return matchSearch && matchDept;
  });

  // Teks sapaan rating WhatsApp yang ramah, sopan & hangat antar rekan kerja
  const getRatingMessage = (doc?: BSTBDocument | null) => {
    const target = doc || selectedDocForRating;
    const docNo = target?.noBstb || 'BSTB';
    const deptName = target?.bagian;
    const deptPhrase = deptName ? ` untuk bagian *${deptName}*` : '';

    return `Halo rekan-rekan! 👋\n\nTerima kasih banyak ya, proses serah terima barang tadi${deptPhrase} sudah selesai dan formulir BSTB (*${docNo}*) sudah tercatat rapi di arsip kami.\n\nAgar pelayanan HCGA dapat terus kami tingkatkan, kami mohon kesediaannya meluangkan waktu sekitar 1 menit untuk memberikan penilaian & ulasan singkat pelayanan kami di tautan berikut:\n👉 ${RATING_LINK}\n\nMasukan dan evaluasi dari rekan-rekan sangat berharga untuk perbaikan layanan kami ke depan. Semoga lancar dan sukses selalu aktivitasnya hari ini. Terima kasih banyak ya! 🙏✨`;
  };

  const handleCopyFormLink = () => {
    // Pastikan link bersih tanpa hash atau admin param untuk dibagikan ke user
    const cleanUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(cleanUrl);
    setCopyLinkSuccess(true);
    setTimeout(() => setCopyLinkSuccess(false), 2500);
  };

  const handleCopyAdminLink = () => {
    const adminUrl = window.location.origin + window.location.pathname + '#admin';
    navigator.clipboard.writeText(adminUrl);
    setCopyAdminLinkSuccess(true);
    setTimeout(() => setCopyAdminLinkSuccess(false), 2500);
  };

  const handleCopyRatingMessage = (doc?: BSTBDocument | null) => {
    navigator.clipboard.writeText(getRatingMessage(doc));
    setCopyRatingSuccess(true);
    setTimeout(() => setCopyRatingSuccess(false), 2500);
  };

  const handleDirectSendWA = (doc: BSTBDocument, phoneInput = '') => {
    let cleanPhone = phoneInput.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const message = getRatingMessage(doc);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePrintDocDirect = (doc: BSTBDocument) => {
    setPreviewModalDoc(doc);
    setTimeout(() => {
      printDocument();
    }, 150);
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-sans">
      {/* ======================================================== */}
      {/* SIDEBAR PERSIS MODEL RECRUITMENT PORTAL (#2b333e)         */}
      {/* ======================================================== */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-[#2b333e] text-white flex flex-col transition-all duration-300 z-30 shrink-0 select-none shadow-xl`}
      >
        {/* Brand & Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-slate-700/60 bg-[#242b35]">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shrink-0 shadow-sm">
            <LogoMMP variant="dots" className="w-full h-full" />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden leading-tight">
              <span className="font-extrabold text-sm block tracking-wide text-white">
                MMP BSTB
              </span>
              <span className="text-[10px] text-slate-300 block truncate">
                PT Mitra Multi Packaging
              </span>
            </div>
          )}
        </div>

        {/* User Card (Admin HCGA) */}
        <div className="p-3 border-b border-slate-700/60 bg-[#262e38] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-900 font-black flex items-center justify-center text-xs shrink-0 shadow-sm">
            HC
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">HCGA Admin</div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Administrator (Pemilik)</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3 font-semibold">Dashboard & Rekap</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rating')}
            className={`w-full flex items-center rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
              activeTab === 'rating'
                ? 'bg-amber-600 text-white font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Star className={`w-5 h-5 shrink-0 ${activeTab === 'rating' ? 'fill-white' : ''}`} />
            {isSidebarOpen && <span className="ml-3 font-semibold">Kirim Rating HCGA</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spreadsheet')}
            className={`w-full flex items-center rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
              activeTab === 'spreadsheet'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3 font-semibold">Database Google Sheet</span>}
          </button>
        </nav>

        {/* Bottom Sidebar Action Buttons (Persis Sesuai Recruitment ZIP) */}
        <div className="p-3 border-t border-slate-700/60 bg-[#242b35] space-y-2">
          {/* View Form BSTB */}
          <button
            type="button"
            onClick={onOpenUserForm}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 px-3 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-500/30"
            title="Buka form input yang dilihat oleh pengguna/karyawan"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span>View Form BSTB</span>}
          </button>

          {/* Copy Link Form Pengguna */}
          <button
            type="button"
            onClick={handleCopyFormLink}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 px-3 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer border border-emerald-500/30"
            title="Salin tautan formulir bersih untuk dibagikan ke departemen/karyawan"
          >
            {copyLinkSuccess ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 shrink-0" />
            )}
            {isSidebarOpen && (
              <span>{copyLinkSuccess ? 'Link User Disalin!' : 'Salin Link Form User'}</span>
            )}
          </button>

          {/* Copy Link Admin */}
          <button
            type="button"
            onClick={handleCopyAdminLink}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg bg-amber-600/20 text-amber-300 hover:bg-amber-600 hover:text-white transition-all cursor-pointer border border-amber-500/30"
            title="Salin tautan login portal admin ini"
          >
            {copyAdminLinkSuccess ? (
              <Check className="w-4 h-4 text-amber-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 shrink-0" />
            )}
            {isSidebarOpen && (
              <span>{copyAdminLinkSuccess ? 'Link Admin Disalin!' : 'Salin Link Admin'}</span>
            )}
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA                                        */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white px-5 py-3.5 flex items-center justify-between shadow-xs border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-600 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-800">
                {activeTab === 'dashboard' && 'Welcome To Dashboard Panel'}
                {activeTab === 'rating' && 'Kirim Ajakan Rating Layanan HCGA'}
                {activeTab === 'spreadsheet' && 'Integrasi Google Spreadsheet & Apps Script'}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Sistem Bukti Serah Terima Barang &bull; PT Mitra Multi Packaging
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Login sebagai Admin HCGA</span>
            </div>

            {/* Logout button merah persis #dc3545 di recruitment app */}
            <button
              type="button"
              onClick={onLogout}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white px-3.5 py-1.5 rounded font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>logout</span>
            </button>
          </div>
        </header>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ==================================================== */}
          {/* TAB 1: DASHBOARD & REKAP TABEL                       */}
          {/* ==================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* STATS CARDS (PERSIS GAYA KARTU HIJAU #28a745 & UNGU #6610f2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Dokumen (Hijau #28a745) */}
                <div
                  onClick={() => setDeptFilter('all')}
                  className={`bg-[#28a745] text-white rounded-lg p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-28 cursor-pointer hover:brightness-105 transition-all ${
                    deptFilter === 'all' ? 'ring-2 ring-offset-2 ring-emerald-500' : ''
                  }`}
                >
                  <div className="z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-extrabold">{totalCount}</span>
                      <FileText className="w-7 h-7 text-white/30" />
                    </div>
                    <p className="text-xs font-semibold text-emerald-100 mt-1">
                      Total Dokumen BSTB
                    </p>
                  </div>
                  <div className="text-[10px] text-emerald-100 font-medium z-10 flex items-center justify-between border-t border-white/20 pt-1.5">
                    <span>Semua departemen</span>
                    <span>{deptFilter === 'all' ? '● Aktif' : 'Pilih →'}</span>
                  </div>
                </div>

                {/* 2. Hari Ini (Ungu #6610f2) */}
                <div className="bg-[#6610f2] text-white rounded-lg p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-28 hover:brightness-105 transition-all">
                  <div className="z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-extrabold">{todayCount}</span>
                      <Calendar className="w-7 h-7 text-white/30" />
                    </div>
                    <p className="text-xs font-semibold text-purple-100 mt-1">
                      BSTB Masuk Hari Ini
                    </p>
                  </div>
                  <div className="text-[10px] text-purple-100 font-medium z-10 flex items-center justify-between border-t border-white/20 pt-1.5">
                    <span>Tanggal: {todayStr}</span>
                    <span>Tercatat otomatis</span>
                  </div>
                </div>

                {/* 3. Departemen Teknik (Biru) */}
                <div
                  onClick={() => setDeptFilter('teknik')}
                  className={`bg-blue-600 text-white rounded-lg p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-28 cursor-pointer hover:brightness-105 transition-all ${
                    deptFilter === 'teknik' ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-extrabold">{teknikCount}</span>
                      <Building2 className="w-7 h-7 text-white/30" />
                    </div>
                    <p className="text-xs font-semibold text-blue-100 mt-1">
                      Departemen Teknik
                    </p>
                  </div>
                  <div className="text-[10px] text-blue-100 font-medium z-10 flex items-center justify-between border-t border-white/20 pt-1.5">
                    <span>{totalCount > 0 ? `${Math.round((teknikCount / totalCount) * 100)}% total` : '0%'}</span>
                    <span>{deptFilter === 'teknik' ? '● Aktif' : 'Filter Teknik →'}</span>
                  </div>
                </div>

                {/* 4. Departemen Produksi (Teal) */}
                <div
                  onClick={() => setDeptFilter('produksi')}
                  className={`bg-teal-700 text-white rounded-lg p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-28 cursor-pointer hover:brightness-105 transition-all ${
                    deptFilter === 'produksi' ? 'ring-2 ring-offset-2 ring-teal-500' : ''
                  }`}
                >
                  <div className="z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-extrabold">{produksiCount}</span>
                      <Layers className="w-7 h-7 text-white/30" />
                    </div>
                    <p className="text-xs font-semibold text-teal-100 mt-1">
                      Departemen Produksi
                    </p>
                  </div>
                  <div className="text-[10px] text-teal-100 font-medium z-10 flex items-center justify-between border-t border-white/20 pt-1.5">
                    <span>{totalCount > 0 ? `${Math.round((produksiCount / totalCount) * 100)}% total` : '0%'}</span>
                    <span>{deptFilter === 'produksi' ? '● Aktif' : 'Filter Produksi →'}</span>
                  </div>
                </div>
              </div>

              {/* REKAP TABEL DOKUMEN BSTB */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Header Tabel & Filter */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-sm text-slate-800">
                      Daftar Dokumen Serah Terima Barang ({filteredList.length})
                    </span>
                    {deptFilter !== 'all' && (
                      <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        Filter: {deptFilter.toUpperCase()}
                        <button
                          type="button"
                          onClick={() => setDeptFilter('all')}
                          className="hover:text-blue-950 font-bold ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari nomor, barang, bagian..."
                        className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>

                    {/* Department Dropdown */}
                    <select
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value as any)}
                      className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none"
                    >
                      <option value="all">Semua Departemen</option>
                      <option value="teknik">Teknik</option>
                      <option value="produksi">Produksi</option>
                    </select>
                  </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                      <tr>
                        <th className="px-3 py-3 w-10 text-center">No</th>
                        <th className="px-3 py-3 w-24">Tanggal</th>
                        <th className="px-3 py-3 w-40">Nomor BSTB</th>
                        <th className="px-3 py-3 w-28">Departemen</th>
                        <th className="px-3 py-3">Rincian Barang</th>
                        <th className="px-3 py-3 w-64 text-center">Aksi Cepat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-400">
                            Belum ada dokumen BSTB dalam daftar. Silakan input dari menu formulir.
                          </td>
                        </tr>
                      ) : (
                        filteredList.map((doc, idx) => {
                          const isTek = doc.departemen === 'teknik';
                          const itemCount = isTek
                            ? doc.itemsTeknik.length
                            : doc.itemsProduksi.length;
                          const firstItem = isTek
                            ? doc.itemsTeknik[0]?.namaBarang || doc.itemsTeknik[0]?.kodeBarang
                            : doc.itemsProduksi[0]?.namaItem || doc.itemsProduksi[0]?.kodeItem;

                          return (
                            <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-3 py-3 text-center font-bold text-slate-400">
                                {idx + 1}
                              </td>
                              <td className="px-3 py-3 font-mono text-slate-600 whitespace-nowrap">
                                {doc.tanggal}
                              </td>
                              <td className="px-3 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                                {doc.noBstb}
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    isTek
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-teal-100 text-teal-800'
                                  }`}
                                >
                                  {doc.bagian}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-slate-700">
                                <div className="font-medium truncate max-w-xs">
                                  {firstItem || 'Barang Serah Terima'}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Total {itemCount} baris barang &bull; Diserahkan:{' '}
                                  {doc.signatures.diserahkanOleh.name || 'Admin'}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* 1. Cetak Dokumen Langsung */}
                                  <button
                                    type="button"
                                    onClick={() => handlePrintDocDirect(doc)}
                                    className="px-2.5 py-1 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded shadow-2xs flex items-center gap-1 cursor-pointer"
                                    title="Cetak langsung ke printer"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-slate-700" />
                                    <span>Print</span>
                                  </button>

                                  {/* 2. Kirim Rating WA */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedDocForRating(doc);
                                      handleDirectSendWA(doc);
                                    }}
                                    className="px-2 py-1 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded flex items-center gap-1 cursor-pointer"
                                    title="Kirim link rating WhatsApp ke departemen terkait"
                                  >
                                    <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
                                    <span>Kirim Rating</span>
                                  </button>

                                  {/* 3. Export XLSX */}
                                  <button
                                    type="button"
                                    onClick={() => exportBSTBToExcel(doc)}
                                    className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 border border-slate-200 rounded"
                                    title="Download Excel XLSX"
                                  >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                  </button>

                                  {/* 4. Detail / Preview Form */}
                                  <button
                                    type="button"
                                    onClick={() => setPreviewModalDoc(doc)}
                                    className="p-1 text-slate-600 hover:text-blue-700 hover:bg-slate-100 border border-slate-200 rounded"
                                    title="Lihat Pratinjau Dokumen"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  </button>

                                  {/* 5. Hapus */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Hapus formulir ${doc.noBstb} dari riwayat?`)) {
                                        onDeleteHistory(doc.id);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded"
                                    title="Hapus Dokumen"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: MENU KIRIM RATING HCGA (WhatsApp Sapaan Sopan) */}
          {/* ==================================================== */}
          {activeTab === 'rating' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Kirim Rating Pelayanan HCGA via WhatsApp</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kirim pesan evaluasi pelayanan ke nomor PIC atau WhatsApp Group departemen setelah serah terima barang selesai.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Pilih Dokumen BSTB yang Baru Selesai:
                    </label>
                    <select
                      value={selectedDocForRating?.id || ''}
                      onChange={(e) => {
                        const found = historyList.find((d) => d.id === e.target.value);
                        setSelectedDocForRating(found || null);
                      }}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-mono"
                    >
                      {historyList.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.noBstb} - {doc.bagian} ({doc.tanggal})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Nomor WhatsApp Tujuan (PIC / Rekan Departemen):
                    </label>
                    <input
                      type="text"
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value)}
                      placeholder="Contoh: 08123456789 atau kosongkan untuk pilih kontak langsung di WhatsApp"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      *Bila dikosongkan, Anda dapat memilih kontak atau grup secara langsung saat aplikasi WhatsApp terbuka.
                    </p>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDirectSendWA(selectedDocForRating!, targetPhone)}
                      className="px-4 py-2.5 bg-[#28a745] hover:bg-[#218838] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Kirim ke WhatsApp Sekarang</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyRatingMessage(selectedDocForRating)}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copyRatingSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copyRatingSuccess ? 'Teks Disalin!' : 'Salin Pesan'}</span>
                    </button>

                    <a
                      href={RATING_LINK}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-lg border border-amber-300 flex items-center gap-1.5 ml-auto"
                    >
                      <span>Buka Form Rating</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Pratinjau Teks Pesan */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-amber-200">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Pratinjau Teks WhatsApp:</span>
                    </span>
                    <span className="text-[10px] text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded font-medium">
                      Santai, Hangat & Sopan
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-lg border border-amber-200 text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed shadow-2xs">
                    {getRatingMessage(selectedDocForRating)}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs space-y-2 text-slate-600">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Catatan Khusus Admin:</span>
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Halaman dan pengiriman rating ini bersifat internal (khusus admin). Pengguna departemen biasa tidak memiliki akses ke fitur ini dan hanya mengisi formulir BSTB serta mengirimkan notifikasi serah terima kepada Anda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: PANDUAN GOOGLE APPS SCRIPT LENGKAP           */}
          {/* ==================================================== */}
          {activeTab === 'spreadsheet' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-600" />
                    <span>Kode Google Apps Script untuk Spreadsheet Anda</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Salin kode di bawah ini ke editor Apps Script spreadsheet Anda agar data Teknik (10 kolom) dan Produksi (12 kolom) tersimpan rapi.
                  </p>
                </div>

                <a
                  href={SPREADSHEET_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs self-start"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Google Spreadsheet</span>
                </a>
              </div>

              {/* Box Petunjuk Singkat */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-1">
                <div className="font-bold">Langkah Pemasangan di Spreadsheet:</div>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-blue-800">
                  <li>Buka Spreadsheet &rarr; Klik menu <strong>Ekstensi (Extensions)</strong> &rarr; <strong>Apps Script</strong>.</li>
                  <li>Hapus kode lama di <code className="bg-blue-100 px-1 rounded font-mono">Kode.gs</code>, lalu salin dan tempel kode di bawah ini.</li>
                  <li>Klik tombol <strong>Simpan (Save)</strong>.</li>
                  <li>Jalankan fungsi <code className="bg-blue-100 px-1 rounded font-mono">setupSheet</code> sekali untuk membuat header Teknik dan Produksi secara otomatis.</li>
                  <li>Klik <strong>Deploy &rarr; New Deployment &rarr; Web app</strong> (Access: Anyone / Siapa saja).</li>
                </ol>
              </div>

              {/* Code Snippet Box */}
              <div className="relative">
                <div className="flex justify-between items-center bg-slate-900 text-slate-300 px-4 py-2 rounded-t-lg text-xs font-mono">
                  <span>google-apps-script / kode.gs</span>
                  <button
                    type="button"
                    onClick={() => {
                      const codeElem = document.getElementById('apps-script-code-block');
                      if (codeElem) {
                        navigator.clipboard.writeText(codeElem.innerText);
                        setCopyCodeSuccess(true);
                        setTimeout(() => setCopyCodeSuccess(false), 2500);
                      }
                    }}
                    className="text-xs text-emerald-400 hover:text-white flex items-center gap-1 cursor-pointer font-sans"
                  >
                    {copyCodeSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Kode Berhasil Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>
                <pre
                  id="apps-script-code-block"
                  className="p-4 bg-slate-950 text-slate-100 rounded-b-lg font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed"
                >{`/**
 * GOOGLE APPS SCRIPT - SISTEM BSTB MULTI DEPARTEMEN
 * PT MITRA MULTI PACKAGING
 * Spreadsheet ID: 1LrkFlhSFE5dkYzWYb4jqtnXkt5uaojXobRlaE9godQEnCK4OS8Efn22Y
 */

var SPREADSHEET_ID = "1LrkFlhSFE5dkYzWYb4jqtnXkt5uaojXobRlaE9godQEnCK4OS8Efn22Y";

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * Setup kedua Sheet sesuai format header yang diminta:
 * 1. TEKNIK (10 Kolom):
 *    No, Timestamp, Nomor BSTB, Tanggal BSTB, Kode Barang, Nama Barang, Jumlah, Satuan, Berat (Kg), Keterangan
 * 2. PRODUKSI (12 Kolom):
 *    No, Timestamp, Nomor BSTB, Tanggal BSTB, Kode Item, Nama Item, QTY, Tgl Masuk, Batch #, Satuan, SPK, Keterangan
 */
function setupSheet() {
  var ss = getSpreadsheet();

  // 1. SETUP SHEET TEKNIK
  var sheetTek = ss.getSheetByName("Teknik");
  if (!sheetTek) {
    sheetTek = ss.insertSheet("Teknik");
  }
  var headersTek = [
    "No", "Timestamp", "Nomor BSTB", "Tanggal BSTB", "Kode Barang",
    "Nama Barang", "Jumlah", "Satuan", "Berat (Kg)", "Keterangan"
  ];
  sheetTek.getRange(1, 1, 1, headersTek.length).setValues([headersTek]);
  var headerRangeTek = sheetTek.getRange(1, 1, 1, headersTek.length);
  headerRangeTek.setBackground("#1d4ed8");
  headerRangeTek.setFontColor("#ffffff");
  headerRangeTek.setFontWeight("bold");
  sheetTek.setFrozenRows(1);

  // 2. SETUP SHEET PRODUKSI
  var sheetProd = ss.getSheetByName("Produksi");
  if (!sheetProd) {
    sheetProd = ss.insertSheet("Produksi");
  }
  var headersProd = [
    "No", "Timestamp", "Nomor BSTB", "Tanggal BSTB", "Kode Item",
    "Nama Item", "QTY", "Tgl Masuk", "Batch #", "Satuan", "SPK", "Keterangan"
  ];
  sheetProd.getRange(1, 1, 1, headersProd.length).setValues([headersProd]);
  var headerRangeProd = sheetProd.getRange(1, 1, 1, headersProd.length);
  headerRangeProd.setBackground("#0f766e");
  headerRangeProd.setFontColor("#ffffff");
  headerRangeProd.setFontWeight("bold");
  sheetProd.setFrozenRows(1);

  Logger.log("Setup Berhasil! Sheet Teknik dan Produksi telah disiapkan.");
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = getSpreadsheet();
    var timestampStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

    var dept = (data.departemen || "").toLowerCase();
    var isTeknik = dept.indexOf("teknik") !== -1 || (data.noDokumen && data.noDokumen.indexOf("TNK") !== -1);

    if (isTeknik) {
      var sheet = ss.getSheetByName("Teknik");
      if (!sheet) {
        setupSheet();
        sheet = ss.getSheetByName("Teknik");
      }

      var items = data.items || data.itemsTeknik || [];
      var rowsToAppend = [];
      var currentLastRow = sheet.getLastRow();
      var startingNo = Math.max(1, currentLastRow);

      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it.namaBarang && !it.kodeBarang && !it.jumlah) continue;

        rowsToAppend.push([
          startingNo + i,
          timestampStr,
          data.noBstb || "",
          data.tanggal || "",
          it.kodeBarang || it.kode || "",
          it.namaBarang || it.nama || "",
          it.jumlah !== undefined && it.jumlah !== "" ? it.jumlah : "",
          it.satuan || "",
          it.beratKg !== undefined && it.beratKg !== "" ? it.beratKg : "",
          it.keterangan || ""
        ]);
      }

      if (rowsToAppend.length > 0) {
        sheet.getRange(currentLastRow + 1, 1, rowsToAppend.length, rowsToAppend[0].length).setValues(rowsToAppend);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        targetSheet: "Teknik",
        rowsInserted: rowsToAppend.length
      })).setMimeType(ContentService.MimeType.JSON);

    } else {
      var sheet = ss.getSheetByName("Produksi");
      if (!sheet) {
        setupSheet();
        sheet = ss.getSheetByName("Produksi");
      }

      var items = data.items || data.itemsProduksi || [];
      var rowsToAppend = [];
      var currentLastRow = sheet.getLastRow();
      var startingNo = Math.max(1, currentLastRow);

      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it.namaItem && !it.kodeItem && !it.qty) continue;

        rowsToAppend.push([
          startingNo + i,
          timestampStr,
          data.noBstb || "",
          data.tanggal || "",
          it.kodeItem || it.kode || "",
          it.namaItem || it.nama || "",
          it.qty !== undefined && it.qty !== "" ? it.qty : "",
          it.tglMasuk || "",
          it.batchNo || "",
          it.satuan || "",
          it.spk || "",
          it.keterangan || ""
        ]);
      }

      if (rowsToAppend.length > 0) {
        sheet.getRange(currentLastRow + 1, 1, rowsToAppend.length, rowsToAppend[0].length).setValues(rowsToAppend);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        targetSheet: "Produksi",
        rowsInserted: rowsToAppend.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`}</pre>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ======================================================== */}
      {/* MODAL PRATINJAU / CETAK DOKUMEN DARI DASHBOARD ADMIN     */}
      {/* ======================================================== */}
      {previewModalDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header Modal */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-800">
                  Pratinjau Dokumen BSTB - {previewModalDoc.noBstb}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printDocument()}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-white" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Preview */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
              <DocumentPreview document={previewModalDoc} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
