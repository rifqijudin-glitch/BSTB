import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoMMP } from '../components/CompanyLogo';
import {
  Lock,
  Eye,
  EyeOff,
  User,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  KeyRound,
  ArrowLeft,
  Mail,
  Send
} from 'lucide-react';
import { getAppScriptUrl } from '../utils/config';

export function LoginPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Auto redirect jika URL mengandung parameter form (?view=form / ?page=form / ?form)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'form' || params.get('page') === 'form' || params.has('form')) {
      navigate('/form', { replace: true });
    }
  }, [navigate]);

  // State Login
  const [loginUserId, setLoginUserId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // State Register
  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUserId, setRegUserId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // State Lupa Password & Email OTP
  const [forgotEmailOrUser, setForgotEmailOrUser] = useState('');
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [serverGeneratedOtp, setServerGeneratedOtp] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentNotice, setOtpSentNotice] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. PROSES LOGIN ADMIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const inputUser = loginUserId.trim().toLowerCase();
    const inputPass = loginPassword.trim();

    try {
      let verifiedFromSheet = false;
      let sheetUserName = '';

      try {
        const res = await fetch(`${getAppScriptUrl()}?action=getUsers`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && Array.isArray(data.users)) {
            const matchedUser = data.users.find(
              (u: any) =>
                (u.userId.toLowerCase() === inputUser || (u.email && u.email.toLowerCase() === inputUser)) &&
                String(u.token || '').trim() === inputPass
            );
            if (matchedUser) {
              verifiedFromSheet = true;
              sheetUserName = matchedUser.nama || 'Admin HCGA';
            }
          }
        }
      } catch {
        // Fallback jika Google Sheet sedang offline
      }

      const customAdminPass = localStorage.getItem('mmp_admin_password');
      const isDefaultAdmin =
        (inputUser === 'admin' || inputUser === 'rifqi' || inputUser === 'hcga' || inputUser === 'rifqi.judin@gmail.com') &&
        (customAdminPass ? inputPass === customAdminPass : (inputPass === '1234' || inputPass === 'admin' || inputPass === 'admin123'));

      const registeredUsers = JSON.parse(localStorage.getItem('mmp_registered_users') || '[]');
      const matchedRegistered = registeredUsers.find(
        (u: any) => (u.userId.toLowerCase() === inputUser || (u.email && u.email.toLowerCase() === inputUser)) && u.password === inputPass
      );

      if (verifiedFromSheet || isDefaultAdmin || matchedRegistered) {
        localStorage.setItem('mmp_bstb_auth', 'true');
        localStorage.setItem(
          'mmp_current_user',
          JSON.stringify({
            userId: inputUser,
            nama: sheetUserName || (matchedRegistered ? matchedRegistered.nama : 'Admin HCGA')
          })
        );
        navigate('/dashboard');
      } else {
        setErrorMsg('User ID atau Password tidak cocok. Silakan periksa kembali.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. PROSES DAFTAR AKUN MANUAL (DISIMPAN KE GOOGLE SHEET)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMsg('Password minimal 4 karakter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        action: 'register',
        userId: regUserId.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        nama: regNama.trim(),
        role: 'Admin HCGA'
      };

      await fetch(getAppScriptUrl(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const registeredUsers = JSON.parse(localStorage.getItem('mmp_registered_users') || '[]');
      registeredUsers.push({
        userId: regUserId.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        nama: regNama.trim()
      });
      localStorage.setItem('mmp_registered_users', JSON.stringify(registeredUsers));

      setSuccessMsg('Akun berhasil didaftarkan ke Google Sheet! Silakan login.');
      setViewMode('login');
      setLoginUserId(regUserId.trim());
      setLoginPassword('');
      setRegNama('');
      setRegEmail('');
      setRegUserId('');
      setRegPassword('');
      setRegConfirmPassword('');
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal menghubungkan ke server pendaftaran. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. KIRIM KODE OTP RESET PASSWORD KE EMAIL PENGGUNA (VIA APPS SCRIPT)
  const handleSendOtpEmail = async () => {
    const target = forgotEmailOrUser.trim().toLowerCase();
    if (!target) {
      setErrorMsg('Masukkan Email atau User ID terlebih dahulu.');
      return;
    }

    const emailToSend = target.includes('@') ? target : `${target}@gmail.com`;
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setServerGeneratedOtp(randomOtp);
    setIsSendingOtp(true);
    setErrorMsg('');
    setOtpSentNotice('');

    try {
      await fetch(getAppScriptUrl(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'sendResetEmail',
          email: emailToSend,
          otpCode: randomOtp
        })
      });

      setOtpSentNotice(`Kode OTP 6-digit telah dikirim ke: ${emailToSend}. Periksa Inbox/Spam email Anda.`);
    } catch (err) {
      console.warn('Gagal kirim email OTP via webhook:', err);
      setOtpSentNotice(`Kode verifikasi demo: ${randomOtp} (Gunakan kode ini jika email belum masuk).`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 5. PROSES RESET PASSWORD DENGAN VERIFIKASI OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const target = forgotEmailOrUser.trim().toLowerCase();
    const enteredOtp = forgotOtpCode.trim();

    if (forgotNewPassword.length < 4) {
      setErrorMsg('Password baru minimal 4 karakter.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMsg('Konfirmasi password baru tidak cocok.');
      return;
    }

    // Validasi kode OTP (Server OTP atau Master PIN 1234)
    const isOtpValid =
      (serverGeneratedOtp && enteredOtp === serverGeneratedOtp) ||
      enteredOtp === '1234' ||
      enteredOtp === 'admin';

    if (!isOtpValid) {
      setErrorMsg('Kode OTP / PIN Verifikasi tidak cocok. Silakan minta kode baru atau gunakan PIN Master (1234).');
      return;
    }

    setIsSubmitting(true);

    try {
      const isMasterAdmin =
        target === 'admin' ||
        target === 'rifqi' ||
        target === 'hcga' ||
        target === 'rifqi.judin@gmail.com';

      if (isMasterAdmin) {
        localStorage.setItem('mmp_admin_password', forgotNewPassword.trim());
      } else {
        const registeredUsers = JSON.parse(localStorage.getItem('mmp_registered_users') || '[]');
        const idx = registeredUsers.findIndex(
          (u: any) =>
            u.userId.toLowerCase() === target ||
            (u.email && u.email.toLowerCase() === target)
        );
        if (idx !== -1) {
          registeredUsers[idx].password = forgotNewPassword.trim();
          localStorage.setItem('mmp_registered_users', JSON.stringify(registeredUsers));
        }
      }

      // Update password di tab Login Google Sheet
      await fetch(getAppScriptUrl(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'resetPassword',
          userId: target,
          email: target.includes('@') ? target : '',
          password: forgotNewPassword.trim()
        })
      });

      setSuccessMsg('Password berhasil direset dan disinkronkan ke Google Sheet! Silakan login dengan password baru.');
      setViewMode('login');
      setLoginUserId(target);
      setLoginPassword('');
      setForgotEmailOrUser('');
      setForgotOtpCode('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setServerGeneratedOtp(null);
      setOtpSentNotice('');
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memperbarui ke Google Sheet. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center font-sans p-4 relative">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 relative z-10 border border-slate-200">
        
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-2 bg-slate-50 rounded-xl mb-3 border border-slate-100">
            <LogoMMP variant="full" className="h-10 w-auto mx-auto" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {viewMode === 'register' && 'Daftar Akun Baru'}
            {viewMode === 'login' && 'Login Admin'}
            {viewMode === 'forgot' && 'Reset Password Akun'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            PT Mitra Multi Packaging &bull; HCGA Panel
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-rose-50 text-rose-700 p-3 rounded-xl text-xs leading-relaxed border border-rose-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs leading-relaxed border border-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. FORM LOGIN STANDAR */}
        {viewMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  User ID / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginUserId}
                    onChange={(e) => setLoginUserId(e.target.value)}
                    className="pl-9 w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Masukkan User ID (contoh: admin)"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setOtpSentNotice('');
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    className="pl-9 pr-10 w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-sm font-mono tracking-wider text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Masukkan Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memeriksa...</span>
                  </>
                ) : (
                  <span>Login Admin</span>
                )}
              </button>

              {/* Link Daftar */}
              <div className="text-center pt-3 border-t border-slate-100 mt-4">
                <span className="text-xs text-slate-500">Belum punya akun? </span>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Daftar akun di sini
                </button>
              </div>
            </form>
        )}

        {/* 2. FORM DAFTAR AKUN (REGISTER) */}
        {viewMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={regNama}
                onChange={(e) => setRegNama(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Contoh: Budi Santoso"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Email (Gmail / Workspace)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="pl-9 w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="nama@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                User ID (Username)
              </label>
              <input
                type="text"
                required
                value={regUserId}
                onChange={(e) => setRegUserId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Contoh: budi / hrd_staff"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Minimal 4 karakter"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Konfirmasi Password
              </label>
              <input
                type="password"
                required
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Ulangi password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Spreadsheet...</span>
                </>
              ) : (
                <span>Daftarkan Akun</span>
              )}
            </button>

            <div className="text-center pt-3 border-t border-slate-100 mt-4">
              <span className="text-xs text-slate-500">Sudah punya akun? </span>
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Login sekarang
              </button>
            </div>
          </form>
        )}

        {/* 3. FORM LUPA PASSWORD DENGAN EMAIL OTP */}
        {viewMode === 'forgot' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 leading-relaxed">
              <strong>Reset Password via Email:</strong> Masukkan Email / User ID Anda, klik <em>Kirim OTP ke Email</em>, lalu masukkan kode 6-digit yang diterima.
            </div>

            {otpSentNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs leading-relaxed flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{otpSentNotice}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email atau User ID
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={forgotEmailOrUser}
                    onChange={(e) => setForgotEmailOrUser(e.target.value)}
                    className="pl-9 w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="nama@gmail.com / admin"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtpEmail}
                  disabled={isSendingOtp}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSendingOtp ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSendingOtp ? 'Mengirim...' : 'Kirim OTP'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kode Verifikasi OTP (6 Digit)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={forgotOtpCode}
                  onChange={(e) => setForgotOtpCode(e.target.value)}
                  className="pl-9 w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-widest text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Contoh: 748291 (atau PIN 1234)"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Kode dikirim ke email, atau gunakan PIN Master darurat: <strong>1234</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password Baru
              </label>
              <input
                type="password"
                required
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Minimal 4 karakter"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                required
                value={forgotConfirmPassword}
                onChange={(e) => setForgotConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Ulangi password baru"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memperbarui ke Google Sheet...</span>
                </>
              ) : (
                <span>Simpan Password Baru</span>
              )}
            </button>

            <div className="text-center pt-3 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                  setOtpSentNotice('');
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Login</span>
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Footer */}
      <div className="mt-8 text-slate-500 text-xs text-center">
        &copy; 2026 PT Mitra Multi Packaging &bull; Human Capital & General Affairs
      </div>
    </div>
  );
}
