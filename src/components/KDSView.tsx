import React, { useState, useEffect } from 'react';
import {
  MonitorPlay,
  Flame,
  Clock,
  CheckCircle2,
  Bike,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  Receipt,
  Plus,
  Tv,
  Layers,
  ArrowRight,
  RotateCw,
  Utensils,
  Wine,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { TopHeaderWidget } from './TopHeaderWidget';

export const KDSView: React.FC = () => {
  const { orders, updateOrderStatus, setSelectedOrderForReceipt, simulateChatbotOrder } = useApp();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [now, setNow] = useState<number>(Date.now());
  const [selectedStation, setSelectedStation] = useState<'todas' | 'cocina' | 'barra'>('todas');
  const [areas, setAreas] = useState<Array<{ id: string; name: string; categories: string[]; color: string }>>([
    { id: 'cocina', name: 'Cocina & Hornos', categories: ['pizzas', 'empanadas', 'agregados'], color: 'orange' },
    { id: 'barra', name: 'Barra & Bebidas', categories: ['bebidas', 'postres'], color: 'sky' },
  ]);
  const [showNewAreaModal, setShowNewAreaModal] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const activeOrders = orders.filter(
    (o) => o.status === 'pendiente' || o.status === 'en_cocina' || o.status === 'en_camino'
  );

  const pendingOrders = activeOrders.filter((o) => o.status === 'pendiente');
  const bakingOrders = activeOrders.filter((o) => o.status === 'en_cocina');
  const readyOrders = activeOrders.filter((o) => o.status === 'en_camino');

  const getMinutesElapsed = (createdAt: string) => {
    const elapsedMs = now - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(elapsedMs / (1000 * 60)));
  };

  const getTimerBadge = (minutes: number) => {
    if (minutes < 15) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {minutes}m
        </span>
      );
    } else if (minutes < 30) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {minutes}m
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white flex items-center gap-1 animate-pulse">
          <AlertTriangle className="w-3 h-3" /> {minutes}m Demorado
        </span>
      );
    }
  };

  const renderOrderCard = (order: Order, stage: 'pendiente' | 'en_cocina' | 'en_camino') => {
    const mins = getMinutesElapsed(order.createdAt);

    return (
      <div
        key={order.id}
        className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
          mins >= 30
            ? 'border-rose-300 ring-2 ring-rose-200 bg-rose-50/20'
            : stage === 'en_cocina'
            ? 'border-orange-300 ring-2 ring-orange-100'
            : 'border-slate-200/80 hover:border-slate-300'
        }`}
      >
        <div>
          {/* Ticket Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-2.5 mb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black font-mono text-orange-600">#{order.orderNumber}</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {order.type === 'salon' ? order.tableNumber || 'Salón' : order.type}
                </span>
                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {order.source}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1">{order.customerName}</p>
            </div>
            <div>{getTimerBadge(mins)}</div>
          </div>

          {/* Items */}
          <div className="space-y-2 my-2.5">
            {order.items.map((item, idx) => (
              <div key={idx} className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    <span className="text-orange-600 font-mono font-black mr-2">{item.quantity}x</span>
                    {item.productName}
                  </span>
                </div>

                {item.customization && (
                  <div className="text-[11px] text-amber-800 font-mono mt-1 pl-2.5 border-l-2 border-amber-400">
                    <div>Tamaño: {item.customization.size.toUpperCase()}</div>
                    {item.customization.extras && item.customization.extras.length > 0 && (
                      <div>Extras: {item.customization.extras.join(', ')}</div>
                    )}
                    {item.customization.notes && (
                      <div className="text-slate-600 italic">"{item.customization.notes}"</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs mt-2">
              <span className="font-bold">Nota:</span> {order.notes}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
          <button
            onClick={() => setSelectedOrderForReceipt(order)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition cursor-pointer"
            title="Ver comanda"
          >
            <Receipt className="w-4 h-4" />
          </button>

          {stage === 'pendiente' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'en_cocina')}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" />
              Mandar al Horno
            </button>
          )}

          {stage === 'en_cocina' && (
            <button
              onClick={() =>
                updateOrderStatus(order.id, order.type === 'delivery' ? 'en_camino' : 'entregado')
              }
              className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {order.type === 'delivery' ? 'Listo p/ Despacho' : 'Listo para Servir'}
            </button>
          )}

          {stage === 'en_camino' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'entregado')}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Bike className="w-3.5 h-3.5" />
              Marcar Entregado
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="kds-view" className="max-w-7xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📺</span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pantallas KDS</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Comandas automáticas por área de preparación</p>
        </div>

        <TopHeaderWidget />
      </div>

      {/* Dark Hero Banner (Exact matching Screenshot 4) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#141b2d] text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Pulsing connected pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/30 text-sky-400 font-mono text-[11px] font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              PREPARACIÓN CONECTADA AL POS
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cada producto llega al área correcta
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Configura Cocina, Barra, Postres u otras estaciones. Los pedidos mixtos se dividen
              automáticamente y cada pantalla controla su propio avance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setShowNewAreaModal(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Nueva área
              </button>

              <button
                onClick={() => {
                  setAreas([
                    { id: 'cocina', name: 'Cocina & Hornos', categories: ['pizzas', 'empanadas', 'agregados'], color: 'orange' },
                    { id: 'barra', name: 'Barra & Bebidas', categories: ['bebidas', 'postres'], color: 'sky' },
                  ]);
                  alert('Áreas estándar Cocina y Barra configuradas.');
                }}
                className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
              >
                <Layers className="w-4 h-4 text-slate-400" />
                Crear Cocina y Barra
              </button>
            </div>
          </div>

          {/* Right Diagram Illustration */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-xs">
            <div className="p-3 bg-slate-800 rounded-xl text-center border border-slate-700">
              <Tv className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <span className="text-[10px] font-mono font-bold text-slate-300">POS Central</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <div className="space-y-2">
              <div className="px-3 py-1.5 bg-orange-500/20 border border-orange-500/40 rounded-lg text-[10px] font-bold text-orange-300 flex items-center gap-1.5">
                <Utensils className="w-3 h-3 text-orange-400" /> Cocina (Pizzas)
              </div>
              <div className="px-3 py-1.5 bg-sky-500/20 border border-sky-500/40 rounded-lg text-[10px] font-bold text-sky-300 flex items-center gap-1.5">
                <Wine className="w-3 h-3 text-sky-400" /> Barra (Bebidas)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Steps Guide Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 font-black flex items-center justify-center text-sm shrink-0">
            1
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Crea un área</h4>
            <p className="text-[11px] text-slate-400">Cocina, Barra, Postres...</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 font-black flex items-center justify-center text-sm shrink-0">
            2
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Asigna categorías</h4>
            <p className="text-[11px] text-slate-400">Bebidas a Barra, comidas a Cocina</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 font-black flex items-center justify-center text-sm shrink-0">
            3
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Abre su enlace</h4>
            <p className="text-[11px] text-slate-400">En TV, tableta o celular</p>
          </div>
        </div>
      </div>

      {/* Section Header: Areas de preparación + Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/70 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Tv className="w-5 h-5 text-orange-500" />
              Áreas de preparación ({areas.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitoreo y despacho en tiempo real según la estación
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              Alarma {soundEnabled ? 'Activa' : 'Muda'}
            </button>

            <button
              onClick={() => simulateChatbotOrder('Cliente KDS Test')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              + Simular Comanda
            </button>
          </div>
        </div>

        {/* 3 Real-time Columns: Pendientes / En Horno / Listos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Column 1: Pendientes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-bold text-amber-900 uppercase font-mono tracking-wide">
                  Pendientes por Hornear
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-black bg-amber-200/80 text-amber-900">
                {pendingOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {pendingOrders.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
                  No hay pedidos pendientes en cola
                </div>
              ) : (
                pendingOrders.map((ord) => renderOrderCard(ord, 'pendiente'))
              )}
            </div>
          </div>

          {/* Column 2: En Horno / Cocina */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-orange-50/70 p-3 rounded-2xl border border-orange-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                <h3 className="text-xs font-bold text-orange-900 uppercase font-mono tracking-wide">
                  En Horno / Cocina
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-black bg-orange-200/80 text-orange-900">
                {bakingOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {bakingOrders.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
                  Los hornos están disponibles
                </div>
              ) : (
                bakingOrders.map((ord) => renderOrderCard(ord, 'en_cocina'))
              )}
            </div>
          </div>

          {/* Column 3: Listos / Reparto */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-sky-50/70 p-3 rounded-2xl border border-sky-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <h3 className="text-xs font-bold text-sky-900 uppercase font-mono tracking-wide">
                  Listos / Despacho
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-black bg-sky-200/80 text-sky-900">
                {readyOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {readyOrders.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
                  No hay pedidos listos para despacho
                </div>
              ) : (
                readyOrders.map((ord) => renderOrderCard(ord, 'en_camino'))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Area Modal */}
      {showNewAreaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Tv className="w-5 h-5 text-orange-500" /> Crear Nueva Estación KDS
            </h3>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de la estación:</label>
              <input
                type="text"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                placeholder="Ej: Estación Postres & Cafetería"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowNewAreaModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (newAreaName.trim()) {
                    setAreas((prev) => [
                      ...prev,
                      { id: `area-${Date.now()}`, name: newAreaName.trim(), categories: ['postres'], color: 'purple' },
                    ]);
                    setNewAreaName('');
                    setShowNewAreaModal(false);
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white shadow-md"
              >
                Guardar Área
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
