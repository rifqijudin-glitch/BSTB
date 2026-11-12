import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BSTBDocument } from '../types/bstb';
import {
  LayoutDashboard,
  Star,
  FileSpreadsheet,
  Printer,
  LogOut,
  ExternalLink,
  Search,
  Check,
  Eye,
  Trash2,
  Menu,
  X,
  FileText,
  Send,
  Building2,
  Code,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Lock,
  EyeOff,
  User
} from 'lucide-react';
import { exportBSTBToExcel } from '../utils/excelExport';
import { printDocument } from '../utils/printHelper';
import { LogoMMP } from '../components/CompanyLogo';
import { DocumentPreview } from '../components/DocumentPreview';
import { getAppScriptUrl } from '../utils/config';

const RATING_LINK = 'https://s.id/HCGA_Service_Rate';

export function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rating' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<'all' | 'teknik' | 'produksi' | 'scm'>('all');
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);
  const [copyRatingSuccess, setCopyRatingSuccess] = useState(false);
  const [targetPhone, setTargetPhone] = useState('');
  const [selectedDocForRating, setSelectedDocForRating] = useState<BSTBDocument | null>(null);
  const [previewModalDoc, setPreviewModalDoc] = useState<BSTBDocument | null>(null);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // State Ganti Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassSettings, setShowPassSettings] = useState(false);
  const [passChangeError, setPassChangeError] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // State Modal Konfirmasi Hapus
  const [docToDelete, setDocToDelete] = useState<BSTBDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const [historyList, setHistoryList] = useState<BSTBDocument[]>(() => {
    try {
      const saved = localStorage.getItem('mmp_bstb_history');
      if (!saved) return [];
      const parsed: BSTBDocument[] = JSON.parse(saved);
      return parsed.sort(
        (a, b) =>
          (b.tanggal || '').localeCompare(a.tanggal || '') ||
          (b.createdAt || '').localeCompare(a.createdAt || '')
      );
    } catch {
      return [];
    }
  });

  // FUNGSI SINKRONISASI DUA ARAH: TARIK DATA TERBARU DARI GOOGLE SPREADSHEET
  const fetchGoogleSheetData = async (showNotice = true) => {
    setIsSyncingSheet(true);
    try {
      const activeUrl = getAppScriptUrl();
      const res = await fetch(`${activeUrl}?action=getData`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      if (data.status === 'success') {
        const reconstructed: BSTBDocument[] = [];

        // 1. Rekonstruksi data sheet Teknik
        if (Array.isArray(data.teknik) && data.teknik.length > 0) {
          const groupsTek: { [key: string]: any[] } = {};
          data.teknik.forEach((row: any) => {
            const key = (row.noBstb || '').trim();
            if (!key) return;
            if (!groupsTek[key]) groupsTek[key] = [];
            groupsTek[key].push(row);
          });

          Object.keys(groupsTek).forEach((noBstb) => {
            const rows = groupsTek[noBstb];
            const first = rows[0];
            reconstructed.push({
              id: `sheet-tek-${noBstb}`,
              departemen: 'teknik',
              noBstb: noBstb,
              tanggal: first.tanggal || new Date().toISOString().split('T')[0],
              bagian: 'Maintenance',
              noDokumen: 'FRM-HCGA-BSTB-01',
              revisi: '01',
              tanggalTerbit: '01/01/2024',
              itemsTeknik: rows.map((it, idx) => ({
                id: `t-${idx + 1}`,
                kodeBarang: it.kodeBarang || '',
                namaBarang: it.namaBarang || '',
                jumlah: it.jumlah || '',
                satuan: it.satuan || 'Kg',
                beratKg: it.beratKg || '',
                noFpb: it.noFpb || '',
                keterangan: it.keterangan || ''
              })),
              itemsProduksi: [],
              signatures: {
                diserahkanOleh: { role: 'Admin / Petugas', name: '' },
                diketahuiOleh1: { role: 'SPV', name: '' },
                diketahuiOleh2: { role: 'Manager', name: '' },
                diterimaOleh: { role: 'Penerima', name: '' },
                diperiksaOleh: { role: 'QC', name: '' }
              },
              timesTime: { startTime: '', finishTime: '' },
              createdAt: first.timestamp || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          });
        }

        // 2. Rekonstruksi data sheet Produksi
        if (Array.isArray(data.produksi) && data.produksi.length > 0) {
          const groupsProd: { [key: string]: any[] } = {};
          data.produksi.forEach((row: any) => {
            const key = (row.noBstb || '').trim();
            if (!key) return;
            if (!groupsProd[key]) groupsProd[key] = [];
            groupsProd[key].push(row);
          });

          Object.keys(groupsProd).forEach((noBstb) => {
            const rows = groupsProd[noBstb];
            const first = rows[0];
            reconstructed.push({
              id: `sheet-prod-${noBstb}`,
              departemen: 'produksi',
              noBstb: noBstb,
              tanggal: first.tanggal || new Date().toISOString().split('T')[0],
              bagian: 'Printing & Slitting',
              noDokumen: 'FRM-PRD-BSTB-02',
              revisi: '01',
              tanggalTerbit: '01/01/2024',
              itemsTeknik: [],
              itemsProduksi: rows.map((it, idx) => ({
                id: `p-${idx + 1}`,
                kodeItem: it.kodeItem || '',
                namaItem: it.namaItem || '',
                qty: it.qty || '',
                tglMasuk: it.tglMasuk || '',
                batchNo: it.batchNo || '',
                satuan: it.satuan || 'Kg',
                spk: it.spk || '',
                keterangan: it.keterangan || ''
              })),
              signatures: {
                diserahkanOleh: { role: 'Admin / Petugas', name: '' },
                diketahuiOleh1: { role: 'SPV', name: '' },
                diketahuiOleh2: { role: 'Manager', name: '' },
                diterimaOleh: { role: 'Penerima', name: '' },
                diperiksaOleh: { role: 'QC', name: '' }
              },
              timesTime: { startTime: '', finishTime: '' },
              createdAt: first.timestamp || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          });
        }

        // 3. Rekonstruksi data sheet SCM / Gudang
        if (Array.isArray(data.scm) && data.scm.length > 0) {
          const groupsScm: { [key: string]: any[] } = {};
          data.scm.forEach((row: any) => {
            const key = (row.noBstb || '').trim();
            if (!key) return;
            if (!groupsScm[key]) groupsScm[key] = [];
            groupsScm[key].push(row);
          });

          Object.keys(groupsScm).forEach((noBstb) => {
            const rows = groupsScm[noBstb];
            const first = rows[0];
            reconstructed.push({
              id: `sheet-scm-${noBstb}`,
              departemen: 'scm',
              noBstb: noBstb,
              tanggal: first.tanggal || new Date().toISOString().split('T')[0],
              bagian: first.bagian || 'GUDANG',
              noDokumen: '',
              revisi: '',
              tanggalTerbit: '',
              itemsTeknik: [],
              itemsProduksi: rows.map((it, idx) => ({
                id: `p-${idx + 1}`,
                kodeItem: it.kodeItem || it.jenis || it.kodeBarang || '',
                namaItem: it.namaItem || it.namaBarang || '',
                qty: it.qty || it.jumlah || '',
                tglMasuk: it.tglMasuk || '',
                batchNo: it.batchNo || '',
                satuan: it.satuan || 'Kg',
                spk: it.spk || '',
                keterangan: it.keterangan || ''
              })),
              itemsScm: [],
              signatures: {
                diserahkanOleh: { role: 'Admin / Petugas', name: '' },
                diketahuiOleh1: { role: 'SPV', name: '' },
                diketahuiOleh2: { role: 'Manager', name: '' },
                diterimaOleh: { role: 'Penerima', name: '' },
                diperiksaOleh: { role: 'QC', name: '' }
              },
              timesTime: { startTime: '', finishTime: '' },
              createdAt: first.timestamp || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          });
        }

        // Simpan hasil sinkronisasi - Pertahankan seluruh riwayat hari-hari sebelumnya
        setHistoryList((prev) => {
          const map = new Map<string, BSTBDocument>();
          // Muat dokumen lama lokal
          prev.forEach((p) => {
            const key = p.noBstb ? p.noBstb.trim() : p.id;
            map.set(key, p);
          });
          // Gabungkan data dari Google Sheet (reconstructed)
          reconstructed.forEach((r) => {
            const key = r.noBstb ? r.noBstb.trim() : r.id;
            map.set(key, r);
          });
          const merged = Array.from(map.values());
          // Urutkan selalu dari tanggal & waktu terbaru ke paling lama
          merged.sort(
            (a, b) =>
              (b.tanggal || '').localeCompare(a.tanggal || '') ||
              (b.createdAt || '').localeCompare(a.createdAt || '')
          );
          localStorage.setItem('mmp_bstb_history', JSON.stringify(merged));
          return merged;
        });

        if (showNotice) {
          setSyncFeedback(`Sinkronisasi Google Sheet sukses: ${reconstructed.length} dokumen termuat.`);
        }
      }
    } catch (err) {
      console.warn('Sync live data notice:', err);
      if (showNotice) {
        setSyncFeedback('Data lokal aktif. Menunggu deployment versi terbaru Apps Script.');
      }
    } finally {
      setIsSyncingSheet(false);
      setTimeout(() => setSyncFeedback(null), 3500);
    }
  };

  useEffect(() => {
    fetchGoogleSheetData(false);
  }, []);

  useEffect(() => {
    if (historyList.length > 0 && !selectedDocForRating) {
      setSelectedDocForRating(historyList[0]);
    }
  }, [historyList, selectedDocForRating]);

  // MEMBUKA MODAL KONFIRMASI HAPUS (MENGHINDARI BLOKIR WINDOW.CONFIRM BROWSER)
  const handleDeleteHistory = (item: BSTBDocument) => {
    setDocToDelete(item);
  };

  // EKSEKUSI HAPUS DARI STATE LOKAL & GOOGLE SPREADSHEET
  const confirmExecuteDelete = async () => {
    if (!docToDelete) return;
    const target = docToDelete;
    setIsDeleting(true);

    try {
      // 1. Hapus dari state lokal & localStorage (berdasarkan ID dan noBstb)
      const updated = historyList.filter(
        (h) => h.id !== target.id && (!target.noBstb || h.noBstb !== target.noBstb)
      );
      setHistoryList(updated);
      localStorage.setItem('mmp_bstb_history', JSON.stringify(updated));

      // 2. Kirim sinyal hapus ke Google Spreadsheet via Webhook
      if (target.noBstb) {
        fetch(getAppScriptUrl(), {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'delete',
            noBstb: target.noBstb,
            departemen: target.departemen || 'produksi'
          })
        }).catch((err) => console.warn('Gagal menghapus baris di Google Sheet:', err));
      }

      setSyncFeedback(`Dokumen ${target.noBstb || target.id} berhasil dihapus.`);
      setTimeout(() => setSyncFeedback(null), 3000);
    } finally {
      setIsDeleting(false);
      setDocToDelete(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const totalCount = historyList.length;
  const todayCount = historyList.filter((d) => d.tanggal === todayStr).length;
  const teknikCount = historyList.filter((d) => d.departemen === 'teknik').length;
  const produksiCount = historyList.filter((d) => d.departemen === 'produksi').length;
  const scmCount = historyList.filter((d) => d.departemen === 'scm').length;

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
      ) ||
      (doc.itemsScm || []).some(
        (it) => it.namaBarang.toLowerCase().includes(q) || (it.jenis || '').toLowerCase().includes(q)
      );

    let matchDate = true;
    if (dateFilter === 'today') {
      matchDate = doc.tanggal === todayStr;
    } else if (dateFilter === 'week') {
      const docTime = new Date(doc.tanggal).getTime();
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      matchDate = docTime >= weekAgo;
    } else if (dateFilter === 'month') {
      matchDate = (doc.tanggal || '').startsWith(todayStr.slice(0, 7));
    }

    const matchDept = deptFilter === 'all' ? true : doc.departemen === deptFilter;
    return matchSearch && matchDept && matchDate;
  });

  const getRatingMessage = (doc?: BSTBDocument | null) => {
    const target = doc || selectedDocForRating;
    const docNo = target?.noBstb || 'BSTB';
    const deptName = target?.bagian;
    const deptPhrase = deptName ? ` Bagian ${deptName}` : '';

    return `Yth. Bapak/Ibu${deptPhrase},\n\nTerima kasih, proses serah terima barang (*${docNo}*) telah selesai dicatat dalam sistem BSTB.\n\nUntuk meningkatkan kualitas pelayanan HCGA, mohon kesediaannya meluangkan waktu sejenak untuk mengisi penilaian pelayanan melalui tautan berikut:\n👉 ${RATING_LINK}\n\nTerima kasih atas kerja sama dan perhatiannya.`;
  };

  const handleCopyFormLink = () => {
    let origin = window.location.origin;
    if (origin.includes('ais-dev-')) {
      origin = origin.replace('ais-dev-', 'ais-pre-');
    }
    const cleanUrl = `${origin}/#/form`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cleanUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = cleanUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch {
      // fallback
    }

    setCopyLinkSuccess(true);
    setTimeout(() => setCopyLinkSuccess(false), 3000);
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
    }, 200);
  };

  const currentUser = (() => {
    try {
      const u = localStorage.getItem('mmp_current_user');
      return u ? JSON.parse(u) : { userId: 'admin', nama: 'Admin HCGA' };
    } catch {
      return { userId: 'admin', nama: 'Admin HCGA' };
    }
  })();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeError('');
    setPassChangeSuccess('');

    const uid = currentUser.userId.toLowerCase();
    const isMasterAdmin = (uid === 'admin' || uid === 'rifqi' || uid === 'hcga');
    const customAdminPass = localStorage.getItem('mmp_admin_password');

    let isOldPassCorrect = false;
    if (isMasterAdmin) {
      const activeAdminPass = customAdminPass || '1234';
      isOldPassCorrect = (oldPassword.trim() === activeAdminPass || oldPassword.trim() === 'admin');
    } else {
      const registeredUsers = JSON.parse(localStorage.getItem('mmp_registered_users') || '[]');
      const userObj = registeredUsers.find((u: any) => u.userId.toLowerCase() === uid);
      isOldPassCorrect = (userObj && userObj.password === oldPassword.trim());
    }

    if (!isOldPassCorrect) {
      setPassChangeError('Password saat ini (lama) yang Anda masukkan tidak sesuai.');
      return;
    }

    if (newPassword.trim().length < 4) {
      setPassChangeError('Password baru minimal 4 karakter demi keamanan.');
      return;
    }

    if (newPassword.trim() !== confirmNewPassword.trim()) {
      setPassChangeError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setIsChangingPass(true);

    try {
      // 1. Simpan password baru di local storage aplikasi
      if (isMasterAdmin) {
        localStorage.setItem('mmp_admin_password', newPassword.trim());
      } else {
        const registeredUsers = JSON.parse(localStorage.getItem('mmp_registered_users') || '[]');
        const updated = registeredUsers.map((u: any) => {
          if (u.userId.toLowerCase() === uid) {
            return { ...u, password: newPassword.trim() };
          }
          return u;
        });
        localStorage.setItem('mmp_registered_users', JSON.stringify(updated));
      }

      // 2. Sinkronkan langsung ke Google Sheet tab Login
      await fetch(getAppScriptUrl(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'changePassword',
          userId: currentUser.userId,
          password: newPassword.trim()
        })
      });

      setPassChangeSuccess('Password berhasil diperbarui dan tersimpan di Google Sheet!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error(err);
      setPassChangeError('Gagal memperbarui ke database server. Silakan coba kembali.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mmp_bstb_auth');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-sans">
      {/* SIDEBAR PERSIS MODEL RECRUITMENT PORTAL (#2b333e) */}
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

        {/* User Card */}
        <div className="p-3 border-b border-slate-700/60 bg-[#262e38] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-900 font-black flex items-center justify-center text-xs shrink-0 shadow-sm uppercase">
            {currentUser.userId.slice(0, 2)}
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{currentUser.nama}</div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>@{currentUser.userId} &bull; Admin</span>
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
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <KeyRound className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3 font-semibold">Ganti Password</span>}
          </button>

        </nav>

        {/* Bottom Sidebar Action Buttons */}
        <div className="p-3 border-t border-slate-700/60 bg-[#242b35] space-y-2">
          {/* Buka Formulir BSTB (Pindah ke Sidebar Diatas Copy Link Form) */}
          <button
            type="button"
            onClick={() => window.open('/#/form', '_blank', 'noopener,noreferrer')}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm cursor-pointer border border-blue-500/40"
            title="Buka Formulir BSTB di Tab Baru"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span>Buka Formulir BSTB</span>}
          </button>

          {/* Copy Link Form */}
          <button
            type="button"
            onClick={handleCopyFormLink}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 px-3 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer border border-emerald-500/30"
          >
            {copyLinkSuccess ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <FileText className="w-4 h-4 shrink-0" />
            )}
            {isSidebarOpen && (
              <span>{copyLinkSuccess ? 'Tersalin!' : 'Copy Link Form'}</span>
            )}
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">
                {activeTab === 'dashboard' && 'Dashboard Monitoring & Rekap BSTB'}
                {activeTab === 'rating' && 'Pusat Pengiriman Rating Pelayanan HCGA'}
                {activeTab === 'settings' && 'Pengaturan Akun & Ganti Password'}
              </h1>
              <p className="text-xs text-slate-500">
                PT Mitra Multi Packaging &bull; Human Capital & General Affairs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
          </div>
        </header>

        {/* Tab 1: Dashboard Monitoring */}
        {activeTab === 'dashboard' && (
          <main className="p-6 space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total BSTB</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{totalCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">Total tersimpan di sistem</div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Hari Ini</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    {todayCount}
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{todayCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">Dibuat tanggal {todayStr}</div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">BSTB Teknik</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    TNK
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{teknikCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">BSTB Departemen Teknik</div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">BSTB Produksi</span>
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    PRD
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{produksiCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">BSTB Bagian Produksi</div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">BSTB SCM</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    SCM
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{scmCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">BSTB Bagian SCM</div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari no BSTB, bagian, atau nama barang..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-64 sm:w-80 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={dateFilter}
                    onChange={(e: any) => setDateFilter(e.target.value)}
                    className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none font-semibold text-slate-700 cursor-pointer"
                  >
                    <option value="all">Semua Tanggal ({totalCount})</option>
                    <option value="today">Hari Ini Saja ({todayCount})</option>
                    <option value="week">7 Hari Terakhir</option>
                    <option value="month">Bulan Ini</option>
                  </select>

                  <select
                    value={deptFilter}
                    onChange={(e: any) => setDeptFilter(e.target.value)}
                    className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none cursor-pointer"
                  >
                    <option value="all">Semua Departemen</option>
                    <option value="teknik">BSTB Teknik</option>
                    <option value="produksi">BSTB Produksi</option>
                    <option value="scm">BSTB SCM</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchGoogleSheetData(true)}
                    disabled={isSyncingSheet}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
                    title="Ambil data terbaru dari Google Spreadsheet"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                    <span>{isSyncingSheet ? 'Menyinkronkan...' : 'Sinkronkan Sheet'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportBSTBToExcel(historyList)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download Excel</span>
                  </button>
                </div>
              </div>

              {syncFeedback && (
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 text-blue-800 text-xs font-medium flex items-center justify-between">
                  <span>{syncFeedback}</span>
                  <button
                    type="button"
                    onClick={() => setSyncFeedback(null)}
                    className="text-blue-500 hover:text-blue-800 font-bold ml-2 cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Nomor BSTB</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4">Bagian</th>
                      <th className="py-3 px-4">Jumlah Item</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Belum ada data BSTB tersimpan. Silakan isi formulir BSTB terlebih dahulu.
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((item, idx) => {
                        const itemsCount =
                          item.departemen === 'teknik'
                            ? (item.itemsTeknik || []).length
                            : item.departemen === 'scm'
                            ? (item.itemsScm || []).length
                            : (item.itemsProduksi || []).length;

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 text-center text-slate-500 font-mono">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">
                              {item.noBstb}
                            </td>
                            <td className="py-3 px-4 text-slate-600">{item.tanggal}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  item.departemen === 'teknik'
                                    ? 'bg-blue-100 text-blue-800'
                                    : item.departemen === 'scm'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-teal-100 text-teal-800'
                                }`}
                              >
                                {item.departemen === 'scm' ? 'SCM' : item.departemen}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-700">{item.bagian}</td>
                            <td className="py-3 px-4 font-semibold text-slate-700">
                              {itemsCount} item
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handlePrintDocDirect(item)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                                  title="Cetak BSTB"
                                >
                                  <Printer className="w-4 h-4 text-blue-600" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDocForRating(item);
                                    setActiveTab('rating');
                                  }}
                                  className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 cursor-pointer"
                                  title="Kirim Rating WhatsApp"
                                >
                                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteHistory(item)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                                  title="Hapus Dokumen"
                                >
                                  <Trash2 className="w-4 h-4" />
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
          </main>
        )}

        {/* Tab 2: Kirim Rating HCGA */}
        {activeTab === 'rating' && (
          <main className="p-6 max-w-4xl space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Kirim Permintaan Rating Pelayanan HCGA
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kirim pesan ramah ke nomor departemen / pemohon untuk mengisi rating pelayanan:
                    <a
                      href={RATING_LINK}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-1 text-blue-600 hover:underline font-mono font-bold"
                    >
                      {RATING_LINK}
                    </a>
                  </p>
                </div>
              </div>

              {/* Pilih Dokumen BSTB */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Dokumen BSTB:
                </label>
                <select
                  value={selectedDocForRating?.id || ''}
                  onChange={(e) => {
                    const matched = historyList.find((h) => h.id === e.target.value);
                    if (matched) setSelectedDocForRating(matched);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {historyList.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.noBstb} - Bagian: {h.bagian} ({h.tanggal})
                    </option>
                  ))}
                </select>
              </div>

              {/* Input Nomor WA Tujuan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp Pemohon (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789 atau kosongkan untuk memilih kontak di WhatsApp"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              {/* Teks Pesan Ramah */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pratinjau Pesan Penilaian Pelayanan HCGA:
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-sans whitespace-pre-wrap leading-relaxed text-slate-800">
                  {getRatingMessage(selectedDocForRating)}
                </div>
              </div>

              {/* Tombol Aksi Kirim */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    selectedDocForRating && handleDirectSendWA(selectedDocForRating, targetPhone)
                  }
                  disabled={!selectedDocForRating}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan ke WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyRatingMessage(selectedDocForRating)}
                  disabled={!selectedDocForRating}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {copyRatingSuccess ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>{copyRatingSuccess ? 'Teks Tersalin!' : 'Salin Teks'}</span>
                </button>
              </div>
            </div>
          </main>
        )}

        {/* Tab 3: Pengaturan Akun & Ganti Password */}
        {activeTab === 'settings' && (
          <main className="p-6 max-w-3xl space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Pengaturan Akun & Keamanan Password
                    </h2>
                    <p className="text-xs text-slate-500">
                      Ubah kata sandi login Admin dan pastikan keamanan akun tetap terjaga.
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Enkripsi Database: Aktif</span>
                </div>
              </div>

              {/* Status Proteksi Data di Google Sheet */}
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Jaminan Keamanan Database Google Sheet (Output: ********)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Setiap kali password didaftarkan atau diubah, sistem secara otomatis menyamarkan nilai password di Google Spreadsheet (tab <strong>Login</strong>) menjadi tanda bintang <strong>********</strong>. Password teks asli Anda tidak akan pernah terbaca oleh pihak luar atau siapapun yang membuka dokumen Google Sheet.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div>
                    <span className="font-semibold text-slate-700">Akun Login Saat Ini:</span>{' '}
                    <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">
                      {currentUser.userId}
                    </code>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Nama Pengguna:</span>{' '}
                    <span className="text-slate-800 font-semibold">{currentUser.nama}</span>
                  </div>
                </div>
              </div>

              {/* Form Ganti Password */}
              <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Form Ganti Password
                </h3>

                {passChangeError && (
                  <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs border border-rose-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{passChangeError}</span>
                  </div>
                )}

                {passChangeSuccess && (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs border border-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{passChangeSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password Saat Ini (Lama)
                  </label>
                  <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassSettings ? 'text' : 'password'}
                      required
                      value={oldPassword}
                      onChange={(e) => {
                        setOldPassword(e.target.value);
                        setPassChangeError('');
                      }}
                      className="pl-9 pr-10 w-full bg-white border border-slate-300 rounded-xl py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Masukkan password saat ini (default: 1234)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password Baru
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassSettings ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPassChangeError('');
                        }}
                        className="pl-9 w-full bg-white border border-slate-300 rounded-xl py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Minimal 4 karakter"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassSettings ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          setPassChangeError('');
                        }}
                        className="pl-9 w-full bg-white border border-slate-300 rounded-xl py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Ulangi password baru"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPassSettings(!showPassSettings)}
                    className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                  >
                    {showPassSettings ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showPassSettings ? 'Sembunyikan Karakter' : 'Tampilkan Karakter'}</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isChangingPass ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menyimpan ke Database...</span>
                      </>
                    ) : (
                      <span>Simpan Perubahan Password</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </main>
        )}
      </div>

      {/* MODAL PREVIEW PRINT */}
      {previewModalDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="font-bold text-sm text-slate-800">
                Pratinjau Lembar BSTB: {previewModalDoc.noBstb}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printDocument()}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalDoc(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <DocumentPreview doc={previewModalDoc} />
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS DOKUMEN */}
      {docToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-slate-800">Hapus Dokumen BSTB?</h3>
              <div className="mt-1.5 font-mono font-bold text-xs text-rose-700 bg-rose-50 py-1 px-2.5 rounded-lg inline-block border border-rose-200/50">
                {docToDelete.noBstb}
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Dokumen ini akan dihapus dari riwayat Dashboard dan Google Spreadsheet.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmExecuteDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <span>Menghapus...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
