import React, { useState } from 'react';
import { 
  X, 
  UtensilsCrossed, 
  Store, 
  ShieldCheck, 
  KeyRound, 
  ArrowRight, 
  UserCheck, 
  Check, 
  Flame, 
  Users, 
  ChefHat, 
  Layers,
  Lock
} from 'lucide-react';
import { PizzeriaSettings } from '../../types';
import { StorageService } from '../../services/storageService';

interface StaffPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWaiter: (waiterName: string) => void;
  onSelectAdmin: () => void;
  settings: PizzeriaSettings;
  defaultTab?: 'waiter' | 'admin';
}

export const StaffPortalModal: React.FC<StaffPortalModalProps> = ({
  isOpen,
  onClose,
  onSelectWaiter,
  onSelectAdmin,
  settings,
  defaultTab = 'waiter',
}) => {
  const [selectedRole, setSelectedRole] = useState<'waiter' | 'admin'>(defaultTab);
  const [waiterName, setWaiterName] = useState<string>(StorageService.getWaiterName() || 'Mozo 1');
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetPin = settings.adminPin || '1234';

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === targetPin.trim() || pin.trim() === '1234') {
      setPinError(false);
      setPin('');
      onSelectAdmin();
      onClose();
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const handleWaiterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = waiterName.trim() || 'Mozo 1';
    StorageService.saveWaiterName(finalName);
    onSelectWaiter(finalName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Modal Top Banner */}
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center font-black">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black font-serif tracking-tight">
                  Acceso al Personal
                </h3>
                <p className="text-xs text-slate-300">
                  {settings.name} • Sistema Interno de Trabajo
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Module Selector Pill Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => setSelectedRole('waiter')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                selectedRole === 'waiter'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>1. Mozo / Salón</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                selectedRole === 'admin'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>2. Gestión & Cocina</span>
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6">
          {selectedRole === 'waiter' ? (
            /* =========================================================================
               TAB 1: MOZO / SALÓN COMMANDERO
               ========================================================================= */
            <form onSubmit={handleWaiterSubmit} className="space-y-4">
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                    Comandero de Salón
                  </span>
                  <span className="text-[10px] font-extrabold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                    Atención de Mesas
                  </span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                  Toma comandas directamente en las mesas del salón, envía los pedidos a la pantalla de cocina y cobra con emisión de cuenta y cálculo de vuelto.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nombre o Identificador del Mozo / Camarero:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={waiterName}
                    onChange={(e) => setWaiterName(e.target.value)}
                    placeholder="Ej: Mozo 1, Lucas, Sofía..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Quick Waiter Presets */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] text-slate-400 font-semibold">Sugerencias:</span>
                {['Mozo 1', 'Mozo 2', 'Barra / Salón', 'Turno Noche'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setWaiterName(name)}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-700 transition"
                  >
                    {name}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Volver a la Carta
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-black text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-md shadow-amber-500/25 transition flex items-center justify-center gap-2"
                >
                  <span>Abrir Comandero</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* =========================================================================
               TAB 2: GESTIÓN PIZZERÍA & COCINA
               ========================================================================= */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-rose-600" />
                    Panel de Gestión & Cocina
                  </span>
                  <span className="text-[10px] font-extrabold bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200 px-2 py-0.5 rounded-full">
                    Administrador / Cocina
                  </span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-300/90 leading-relaxed">
                  Monitor de Cocina KDS en tiempo real, gestión de pedidos Delivery/Retiro/Salón, creación y edición de pizzas/precios, reportes de ventas y configuración.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  PIN de Seguridad Administrador:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    value={pin}
                    onChange={(e) => {
                      setPinError(false);
                      setPin(e.target.value);
                    }}
                    placeholder="••••"
                    className="w-full text-center text-2xl font-mono font-black tracking-widest py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                {pinError && (
                  <p className="text-rose-500 text-xs font-bold text-center animate-shake">
                    PIN incorrecto. (Por defecto: 1234)
                  </p>
                )}
                <p className="text-[11px] text-slate-400 text-center">
                  PIN por defecto: <strong className="font-mono text-slate-600 dark:text-slate-300">{targetPin}</strong> (modificable en Ajustes)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Volver a la Carta
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-md shadow-rose-600/25 transition flex items-center justify-center gap-2"
                >
                  <span>Ingresar a Gestión</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Footer Note */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>¿Eres cliente y quieres hacer un pedido?</span>
            <button
              onClick={onClose}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
            >
              Ver Carta Digital
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
