import React, { useState } from 'react';
import { Settings, Clock, Globe, Printer, DollarSign, Store, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TimeConfigModal: React.FC = () => {
  const { isTimeConfigModalOpen, setIsTimeConfigModalOpen, businessConfig, updateBusinessConfig } =
    useApp();

  const [openTime, setOpenTime] = useState(businessConfig.openTime);
  const [closeTime, setCloseTime] = useState(businessConfig.closeTime);
  const [timezone, setTimezone] = useState(businessConfig.timezone);
  const [deliveryFee, setDeliveryFee] = useState(businessConfig.deliveryFeeDefault.toString());
  const [printerPaperSize, setPrinterPaperSize] = useState(businessConfig.printerPaperSize);
  const [isStoreOpen, setIsStoreOpen] = useState(businessConfig.isStoreOpen);

  if (!isTimeConfigModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessConfig({
      openTime,
      closeTime,
      timezone,
      deliveryFeeDefault: parseFloat(deliveryFee) || 1200,
      printerPaperSize,
      isStoreOpen,
    });
    setIsTimeConfigModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSave}
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-4 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-slate-200"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Configuración de Horario & Local</h2>
              <p className="text-[11px] text-slate-400">Ajusta tu zona horaria y parámetros del negocio</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsTimeConfigModalOpen(false)}
            className="text-slate-400 hover:text-slate-200 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Store state toggle */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-xs font-bold text-slate-200">Estado de Recepción de Pedidos</p>
              <p className="text-[10px] text-slate-400">Permitir pedidos desde el Chatbot y Web</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isStoreOpen}
              onChange={(e) => setIsStoreOpen(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Operating Hours */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Hora de Apertura</label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 font-mono font-bold text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Hora de Cierre</label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 font-mono font-bold text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-500" /> Zona Horaria
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono"
          >
            <option value="America/Argentina/Buenos_Aires">
              Argentina · America/Argentina/Buenos_Aires (GMT-3)
            </option>
            <option value="America/Argentina/Cordoba">Argentina · Cordoba</option>
            <option value="America/Montevideo">Uruguay · America/Montevideo</option>
            <option value="America/Santiago">Chile · America/Santiago</option>
            <option value="America/Sao_Paulo">Brasil · America/Sao_Paulo</option>
            <option value="America/Mexico_City">México · America/Mexico_City</option>
            <option value="America/Bogota">Colombia · America/Bogota</option>
          </select>
        </div>

        {/* Default Delivery Fee & Printer Size */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Costo de Envío Estándar ($)</label>
            <input
              type="number"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              placeholder="1200"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono font-bold text-slate-100"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
              <Printer className="w-3 h-3 text-slate-500" /> Formato Impresora
            </label>
            <select
              value={printerPaperSize}
              onChange={(e) => setPrinterPaperSize(e.target.value as any)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono font-bold"
            >
              <option value="80mm">Papel Térmico 80mm (Estándar)</option>
              <option value="58mm">Papel Térmico 58mm (Portátil)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setIsTimeConfigModalOpen(false)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
};
