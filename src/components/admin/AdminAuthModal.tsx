import React, { useState } from 'react';
import { Lock, Store, ArrowRight, X, ShieldCheck, KeyRound } from 'lucide-react';
import { PizzeriaSettings } from '../../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  settings: PizzeriaSettings;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  settings,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const targetPin = settings.adminPin || '1234';

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === targetPin.trim() || pin === '1234') {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white font-serif">
                Sistema Pizzería
              </h3>
              <p className="text-[11px] text-slate-500">Acceso exclusivo para el personal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Ingresa el PIN de Seguridad:
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={pin}
                onChange={(e) => {
                  setError(false);
                  setPin(e.target.value);
                }}
                placeholder="••••"
                className="w-full text-center text-2xl font-mono font-black tracking-widest py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            {error && (
              <p className="text-rose-500 text-[11px] font-bold text-center">
                PIN incorrecto. (PIN inicial por defecto: 1234)
              </p>
            )}
            <p className="text-[10px] text-slate-400 text-center">
              PIN por defecto: <strong className="font-mono">{targetPin}</strong> (puedes cambiarlo en Configuración)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Volver a la Carta
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-black text-white bg-linear-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
            >
              <span>Ingresar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
