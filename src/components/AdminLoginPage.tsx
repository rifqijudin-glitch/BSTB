import React, { useState } from 'react';
import { LogoMMP } from './CompanyLogo';
import { Lock, KeyRound, Shield, AlertCircle, CheckCircle2, User, FileText, ArrowRight } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onOpenUserForm: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onOpenUserForm
}) => {
  const [username, setUsername] = useState('admin');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin === 'admin' || pin === '8888' || pin === 'hcga2026' || pin === 'admin123') {
      setErrorMsg('');
      onLoginSuccess();
    } else {
      setErrorMsg('PIN atau kata sandi tidak valid. Gunakan PIN: 1234');
    }
  };

  const handleQuickLogin = () => {
    setPin('1234');
    setErrorMsg('');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6">
      
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-semibold text-slate-400">Portal PT Mitra Multi Packaging</span>
        </div>

        <button
          type="button"
          onClick={onOpenUserForm}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
        >
          <span>Form BSTB User</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Single Login Card */}
      <div className="max-w-md w-full mx-auto my-6">
        <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-block p-2 bg-slate-50 rounded-xl mb-3 border border-slate-100">
              <LogoMMP variant="full" className="h-10 w-auto mx-auto" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Login Admin BSTB
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Human Capital & General Affairs (HCGA)
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-rose-50 text-rose-800 p-3 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Login Admin */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ID Pengguna
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  PIN / Kata Sandi
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Default: 1234</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setErrorMsg('');
                  }}
                  className="pl-9 w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-xs font-mono tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Masukkan PIN"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk ke Dashboard Admin</span>
            </button>
          </form>

          {/* Quick Login Button */}
          <div className="mt-3">
            <button
              type="button"
              onClick={handleQuickLogin}
              className="w-full py-2 px-3 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Login Cepat Otomatis (PIN 1234)</span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Khusus Karyawan / User
            </span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Tombol Karyawan / User (Direct to Form) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={onOpenUserForm}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>BUKA FORMULIR BSTB (USER)</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
            <p className="text-[11px] text-center text-slate-500">
              Karyawan dapat langsung mengisi formulir BSTB tanpa perlu login.
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} PT Mitra Multi Packaging &bull; Human Capital & General Affairs
      </div>

    </div>
  );
};
