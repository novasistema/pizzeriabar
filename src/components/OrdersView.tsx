import React, { useState } from 'react';
import {
  ClipboardList,
  Calendar,
  FileSpreadsheet,
  FileText,
  RotateCw,
  Volume2,
  VolumeX,
  Bell,
  Search,
  Filter,
  Receipt,
  CheckCircle,
  Ban,
  Clock,
  Bike,
  Flame,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { TopHeaderWidget } from './TopHeaderWidget';

export const OrdersView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    cancelOrder,
    setSelectedOrderForReceipt,
    simulateChatbotOrder,
  } = useApp();

  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('todos');
  const [onlyTodayOrders, setOnlyTodayOrders] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [appliedDateFilter, setAppliedDateFilter] = useState<boolean>(false);
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Cliente canceló por demora');

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    // Status tab filter
    if (selectedStatusTab !== 'todos') {
      if (selectedStatusTab === 'pendientes' && ord.status !== 'pendiente') return false;
      if (selectedStatusTab === 'confirmados' && ord.status !== 'en_cocina' && ord.status !== 'pendiente') return false;
      if (selectedStatusTab === 'preparando' && ord.status !== 'en_cocina') return false;
      if (selectedStatusTab === 'enviados' && ord.status !== 'en_camino') return false;
      if (selectedStatusTab === 'entregados' && ord.status !== 'entregado') return false;
      if (selectedStatusTab === 'cancelados' && ord.status !== 'cancelado') return false;
    }

    // Only today filter
    if (onlyTodayOrders && !appliedDateFilter) {
      const ordDate = new Date(ord.createdAt).toDateString();
      const today = new Date().toDateString();
      if (ordDate !== today) return false;
    }

    // Custom date filter
    if (appliedDateFilter) {
      const ordTime = new Date(ord.createdAt).getTime();
      if (fromDate) {
        const fromTime = new Date(fromDate).setHours(0, 0, 0, 0);
        if (ordTime < fromTime) return false;
      }
      if (toDate) {
        const toTime = new Date(toDate).setHours(23, 59, 59, 999);
        if (ordTime > toTime) return false;
      }
    }

    return true;
  });

  const pendingTodayCount = orders.filter(
    (o) => o.status === 'pendiente' && new Date(o.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
      case 'en_cocina':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200 inline-flex items-center gap-1">
            <Flame className="w-3 h-3 animate-pulse" /> Preparando
          </span>
        );
      case 'en_camino':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-600 border border-sky-200 inline-flex items-center gap-1">
            <Bike className="w-3 h-3" /> Enviado
          </span>
        );
      case 'entregado':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Entregado
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 inline-flex items-center gap-1">
            <Ban className="w-3 h-3" /> Cancelado
          </span>
        );
    }
  };

  const handleApplyDates = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedDateFilter(true);
  };

  const handleClearDates = () => {
    setFromDate('');
    setToDate('');
    setAppliedDateFilter(false);
  };

  const handleExportExcel = () => {
    alert(`Exportando ${filteredOrders.length} pedidos a formato Excel (.xlsx)`);
  };

  const handleExportPDF = () => {
    alert(`Generando reporte PDF con ${filteredOrders.length} pedidos`);
  };

  const handleConfirmCancel = () => {
    if (cancelModalOrderId) {
      cancelOrder(cancelModalOrderId, cancelReason);
      setCancelModalOrderId(null);
      setCancelReason('Cliente canceló por demora');
    }
  };

  return (
    <div id="orders-view" className="max-w-7xl mx-auto space-y-5">
      {/* Top Header Bar with Title on left and Widget on right */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pedidos</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Administra y actualiza tus pedidos</p>
        </div>

        <TopHeaderWidget />
      </div>

      {/* Main White Card Container */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/70 space-y-4">
        {/* Row 1: Status Pills & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'pendientes', label: 'Pendientes' },
              { id: 'confirmados', label: 'Confirmados' },
              { id: 'preparando', label: 'Preparando' },
              { id: 'enviados', label: 'Enviados' },
              { id: 'entregados', label: 'Entregados' },
              { id: 'cancelados', label: 'Cancelados' },
            ].map((tab) => {
              const isActive = selectedStatusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatusTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Excel, PDF, Actualizar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-rose-500" />
              PDF
            </button>
            <button
              onClick={() => setSelectedStatusTab(selectedStatusTab)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-600" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Row 2: Day Filter Button & Sound Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setOnlyTodayOrders(!onlyTodayOrders)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer ${
              onlyTodayOrders
                ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Solo pedidos del día: {onlyTodayOrders ? 'Activado' : 'Desactivado'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            {/* New Pending Pill */}
            <div className="bg-sky-50 text-sky-600 border border-sky-100 font-bold px-4 py-2 rounded-full text-xs flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-sky-500" />
              <span>Nuevos pendientes hoy: {pendingTodayCount}</span>
            </div>

            {/* Sound Button */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer ${
                soundEnabled
                  ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>Sonido pedidos: {soundEnabled ? 'Activado' : 'Silenciado'}</span>
            </button>
          </div>
        </div>

        {/* Row 3: Date Filters Box */}
        <form
          onSubmit={handleApplyDates}
          className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-150 flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Desde</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hasta</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            Aplicar fechas
          </button>

          <button
            type="button"
            onClick={handleClearDates}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            ✕ Limpiar
          </button>
        </form>

        {/* Row 4: Results Area */}
        <div className="border border-slate-150 rounded-2xl min-h-[260px] flex flex-col justify-center overflow-hidden">
          {filteredOrders.length === 0 ? (
            /* Exact Empty State from Screenshot */
            <div className="py-14 text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-2">
                <Filter className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Sin resultados</h3>
              <p className="text-xs text-slate-400">No hay pedidos con este filtro.</p>
            </div>
          ) : (
            /* Populated Orders Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4"># Pedido</th>
                    <th className="py-3 px-4">Hora</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Canal / Tipo</th>
                    <th className="py-3 px-4">Detalle Items</th>
                    <th className="py-3 px-4">Total ($)</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3 px-4 font-mono font-black text-orange-600">#{ord.orderNumber}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {new Date(ord.createdAt).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        hs
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{ord.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{ord.customerPhone}</div>
                        {ord.customerAddress && (
                          <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                            📍 {ord.customerAddress}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize font-bold text-slate-700 mr-1.5">{ord.type}</span>
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {ord.source}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-[200px] truncate font-medium text-slate-700">
                          {ord.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                        </div>
                        {ord.notes && (
                          <div className="text-[10px] text-amber-700 italic truncate max-w-[180px]">
                            Nota: {ord.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        ${ord.total.toLocaleString('es-AR')}
                        <div className="text-[10px] font-normal text-slate-400 capitalize font-sans">
                          {ord.paymentMethod}
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(ord.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrderForReceipt(ord)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition cursor-pointer"
                            title="Ver Comanda"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>

                          {ord.status === 'pendiente' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'en_cocina')}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs cursor-pointer"
                            >
                              Cocinar
                            </button>
                          )}
                          {ord.status === 'en_cocina' && (
                            <button
                              onClick={() =>
                                updateOrderStatus(
                                  ord.id,
                                  ord.type === 'delivery' ? 'en_camino' : 'entregado'
                                )
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                            >
                              Listo
                            </button>
                          )}
                          {ord.status === 'en_camino' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'entregado')}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs cursor-pointer"
                            >
                              Entregado
                            </button>
                          )}

                          {ord.status !== 'cancelado' && ord.status !== 'entregado' && (
                            <button
                              onClick={() => setCancelModalOrderId(ord.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Cancelar pedido"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Row 5: Pagination Bottom */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 font-medium">
          <span>Página 1 de 1 · {filteredOrders.length} pedidos</span>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Anterior
            </button>
            <button
              disabled
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50 flex items-center gap-1"
            >
              Siguiente <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
              <Ban className="w-5 h-5" /> Cancelar Pedido
            </h3>
            <p className="text-xs text-slate-600">
              Indica el motivo de cancelación para registrarlo en las auditorías de caja.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Motivo:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800"
              >
                <option value="Demora en la entrega / cocina">Demora en la entrega / cocina</option>
                <option value="Cliente se arrepintió">Cliente se arrepintió</option>
                <option value="Dirección fuera de radio de entrega">Dirección fuera de radio de entrega</option>
                <option value="Sin stock de ingredientes">Sin stock de ingredientes</option>
                <option value="Error de tipeo del operador">Error de tipeo del operador</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCancelModalOrderId(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
