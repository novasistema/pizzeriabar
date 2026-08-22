import React, { useState } from 'react';
import {
  TrendingUp,
  Ban,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  Download,
  CreditCard,
  Banknote,
  QrCode,
  AlertCircle,
  Plus,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SalesAndReportsView: React.FC<{ type: 'ventas' | 'cancelaciones' | 'cortes' }> = ({
  type,
}) => {
  const { orders, cashCuts, addCashExpense, closeCurrentCashCut } = useApp();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [countedCash, setCountedCash] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');

  // Calculations for Ventas
  const completedOrders = orders.filter((o) => o.status !== 'cancelado');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelado');

  const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const cashTotal = completedOrders
    .filter((o) => o.paymentMethod === 'efectivo')
    .reduce((sum, o) => sum + o.total, 0);
  const digitalTotal = completedOrders
    .filter((o) => o.paymentMethod === 'mercadopago' || o.paymentMethod === 'tarjeta' || o.paymentMethod === 'transferencia')
    .reduce((sum, o) => sum + o.total, 0);

  const totalCancelledAmount = cancelledOrders.reduce((sum, o) => sum + o.total, 0);

  const activeCut = cashCuts[0];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount) || 0;
    if (amount <= 0 || !expenseDescription.trim()) return;

    addCashExpense(amount, expenseDescription.trim());
    setExpenseAmount('');
    setExpenseDescription('');
    setIsExpenseModalOpen(false);
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    const realCash = parseFloat(countedCash) || 0;
    closeCurrentCashCut(realCash, shiftNotes.trim());
    setCountedCash('');
    setShiftNotes('');
    setIsCloseShiftModalOpen(false);
  };

  return (
    <div id="sales-reports-view" className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            {type === 'ventas' ? (
              <TrendingUp className="w-4 h-4" />
            ) : type === 'cancelaciones' ? (
              <Ban className="w-4 h-4 text-rose-400" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-teal-400" />
            )}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100">
              {type === 'ventas'
                ? 'Reporte Detallado de Ventas'
                : type === 'cancelaciones'
                ? 'Registro de Cancelaciones & Pérdidas'
                : 'Cortes de Caja y Arqueo (Corte X / Z)'}
            </h1>
            <p className="text-xs text-slate-400">
              {type === 'ventas'
                ? 'Resumen por métodos de pago, canales y productos'
                : type === 'cancelaciones'
                ? 'Auditoría de pedidos anulados y motivos'
                : 'Control de caja inicial, cobros en efectivo, egresos y cierre de turno'}
            </p>
          </div>
        </div>

        {type === 'cortes' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
            >
              - Registrar Gasto/Retiro
            </button>
            <button
              onClick={() => setIsCloseShiftModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" /> Cerrar Caja (Corte Z)
            </button>
          </div>
        )}
      </div>

      {/* View: VENTAS */}
      {type === 'ventas' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Total Facturado</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xl font-bold font-mono text-slate-100 mt-1">${totalSales.toLocaleString('es-AR')}</p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{completedOrders.length} pedidos concretados</p>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Cobrado en Efectivo</span>
                <Banknote className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">${cashTotal.toLocaleString('es-AR')}</p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                {totalSales > 0 ? ((cashTotal / totalSales) * 100).toFixed(0) : 0}% del total
              </p>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Digital / MP / Tarjeta</span>
                <QrCode className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <p className="text-xl font-bold font-mono text-sky-400 mt-1">${digitalTotal.toLocaleString('es-AR')}</p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                {totalSales > 0 ? ((digitalTotal / totalSales) * 100).toFixed(0) : 0}% del total
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Historial de Ventas Concretadas
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3"># Pedido</th>
                    <th className="py-2.5 px-3">Hora</th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">Método de Pago</th>
                    <th className="py-2.5 px-3">Canal</th>
                    <th className="py-2.5 px-3 text-right">Monto Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {completedOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-850/60">
                      <td className="py-2.5 px-3 font-bold text-slate-100">#{ord.orderNumber}</td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {new Date(ord.createdAt).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{ord.customerName}</td>
                      <td className="py-2.5 px-3 font-sans capitalize text-slate-300">{ord.paymentMethod}</td>
                      <td className="py-2.5 px-3 uppercase font-bold text-[10px] text-slate-400">{ord.source}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-100">
                        ${ord.total.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View: CANCELACIONES */}
      {type === 'cancelaciones' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400">Total Pedidos Anulados</span>
              <p className="text-xl font-bold font-mono text-rose-400 mt-1">{cancelledOrders.length}</p>
            </div>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400">Monto Perdido en Cancelaciones</span>
              <p className="text-xl font-bold font-mono text-slate-100 mt-1">
                ${totalCancelledAmount.toLocaleString('es-AR')}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Auditoría de Cancelaciones
              </h3>
            </div>
            {cancelledOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No hay pedidos cancelados registrados. ¡Excelente rendimiento!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3"># Pedido</th>
                      <th className="py-2.5 px-3">Cliente</th>
                      <th className="py-2.5 px-3">Motivo de Cancelación</th>
                      <th className="py-2.5 px-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {cancelledOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-850/60">
                        <td className="py-2.5 px-3 font-bold text-slate-100">#{ord.orderNumber}</td>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{ord.customerName}</td>
                        <td className="py-2.5 px-3 font-sans text-rose-400 font-medium">
                          {ord.cancellationReason || 'Sin motivo especificado'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-100">
                          ${ord.total.toLocaleString('es-AR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View: CORTES DE CAJA */}
      {type === 'cortes' && (
        <div className="space-y-3">
          {activeCut && (
            <div className="bg-slate-900 p-4 rounded-xl border border-teal-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/10 border border-teal-500/20 text-teal-400 uppercase">
                    Caja Actual: {activeCut.status}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Cajera / Operador: <strong className="text-slate-200">{activeCut.cashierName}</strong>
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400 font-mono">
                  Apertura: {new Date(activeCut.openedAt).toLocaleTimeString('es-AR')} hs
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 block uppercase">Fondo Inicial</span>
                  <span className="text-xs font-bold text-slate-100">
                    ${activeCut.initialCash.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-emerald-400 block uppercase">Ventas Efectivo</span>
                  <span className="text-xs font-bold text-emerald-400">
                    +${activeCut.cashSales.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-rose-400 block uppercase">Gastos / Retiros</span>
                  <span className="text-xs font-bold text-rose-400">
                    -${activeCut.expenses.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-teal-900/40">
                  <span className="text-[9px] text-teal-400 block uppercase">Efectivo Esperado</span>
                  <span className="text-xs font-bold text-teal-300">
                    ${(activeCut.initialCash + activeCut.cashSales - activeCut.expenses).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {activeCut.notes && (
                <div className="text-xs text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <strong>Notas de Turno:</strong> {activeCut.notes}
                </div>
              )}
            </div>
          )}

          {/* Historical Cash Cuts */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Historial de Cortes y Cierres
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Fecha/Apertura</th>
                    <th className="py-2.5 px-3">Cajero</th>
                    <th className="py-2.5 px-3">Fondo Inicial</th>
                    <th className="py-2.5 px-3">Ventas Efectivo</th>
                    <th className="py-2.5 px-3">Gastos</th>
                    <th className="py-2.5 px-3">Total Real</th>
                    <th className="py-2.5 px-3">Diferencia</th>
                    <th className="py-2.5 px-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {cashCuts.map((cut) => (
                    <tr key={cut.id} className="hover:bg-slate-850/60">
                      <td className="py-2.5 px-3 text-slate-300">
                        {new Date(cut.openedAt).toLocaleDateString('es-AR')}{' '}
                        {new Date(cut.openedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{cut.cashierName}</td>
                      <td className="py-2.5 px-3">${cut.initialCash.toLocaleString('es-AR')}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">
                        ${cut.cashSales.toLocaleString('es-AR')}
                      </td>
                      <td className="py-2.5 px-3 text-rose-400">${cut.expenses.toLocaleString('es-AR')}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-100">
                        ${cut.totalReal.toLocaleString('es-AR')}
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        {cut.difference === 0 ? (
                          <span className="text-emerald-400">Exacto ($0)</span>
                        ) : cut.difference > 0 ? (
                          <span className="text-sky-400">+${cut.difference} (Sob.)</span>
                        ) : (
                          <span className="text-rose-400">-${Math.abs(cut.difference)} (Falt.)</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 uppercase font-bold text-[10px]">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] ${
                            cut.status === 'abierta'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-950 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {cut.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddExpense}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-4 shadow-2xl space-y-3 text-slate-200"
          >
            <h3 className="text-sm font-bold text-rose-400">Registrar Retiro / Gasto de Caja</h3>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Monto ($)</label>
              <input
                type="number"
                required
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="5000"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono font-bold text-rose-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Motivo del Egreso</label>
              <input
                type="text"
                required
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="Ej: Pago de hielo, gaseosas de emergencia..."
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm"
              >
                Guardar Gasto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Close Shift Modal */}
      {isCloseShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCloseShift}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-4 shadow-2xl space-y-3 text-slate-200"
          >
            <h3 className="text-sm font-bold text-teal-400">Arqueo y Cierre de Turno (Corte Z)</h3>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Efectivo Contado Real en el Cajón ($)
              </label>
              <input
                type="number"
                required
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value)}
                placeholder="Ingresa el monto total contado"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono font-bold text-teal-300"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Observaciones de Cierre</label>
              <textarea
                rows={2}
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                placeholder="Turno sin novedades, se dejaron $25.000 para el turno mañana."
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCloseShiftModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-sm"
              >
                Confirmar Cierre Z
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
