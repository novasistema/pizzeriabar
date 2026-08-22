import React, { useState } from 'react';
import {
  Users,
  RotateCw,
  Filter,
  Phone,
  ShoppingBag,
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { TopHeaderWidget } from './TopHeaderWidget';

export const CustomersView: React.FC = () => {
  const { customers, orders, simulateChatbotOrder } = useApp();

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'orders' | 'spend' | 'recent'>('orders');
  const [appliedFilter, setAppliedFilter] = useState(false);

  // Compute customers dynamically from orders if orders exist
  const dynamicCustomers: Customer[] = React.useMemo(() => {
    if (orders.length === 0) return [];

    const map = new Map<string, Customer>();

    orders.forEach((ord) => {
      const key = ord.customerPhone || ord.customerName;
      if (!map.has(key)) {
        map.set(key, {
          id: `cust-${key}`,
          name: ord.customerName,
          phone: ord.customerPhone,
          address: ord.customerAddress,
          totalOrders: 0,
          totalSpent: 0,
          averageTicket: 0,
          lastOrderDate: ord.createdAt,
          favoriteCategory: 'Pizzas',
        });
      }

      const existing = map.get(key)!;
      existing.totalOrders += 1;
      existing.totalSpent += ord.total;
      existing.averageTicket = Math.round(existing.totalSpent / existing.totalOrders);
      if (new Date(ord.createdAt) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = ord.createdAt;
      }
    });

    return Array.from(map.values());
  }, [orders]);

  // Combine static and dynamic
  const customerList = dynamicCustomers.length > 0 ? dynamicCustomers : customers;

  // Sorting
  const sortedCustomers = [...customerList].sort((a, b) => {
    if (sortBy === 'orders') return b.totalOrders - a.totalOrders;
    if (sortBy === 'spend') return b.totalSpent - a.totalSpent;
    if (sortBy === 'recent')
      return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
    return 0;
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilter(true);
  };

  const handleClear = () => {
    setFromDate('');
    setToDate('');
    setSortBy('orders');
    setAppliedFilter(false);
  };

  return (
    <div id="customers-view" className="max-w-7xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Clientes</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Fidelidad y valor de clientes del chatbot</p>
        </div>

        <TopHeaderWidget />
      </div>

      {/* Main White Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/70 space-y-4">
        {/* Row 1: Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Clientes de chatbot con mayor fidelidad
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranking por número de pedidos y monto acumulado en compras por chatbot.
            </p>
          </div>

          <button
            onClick={() => setSortBy(sortBy)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-600" />
            Actualizar
          </button>
        </div>

        {/* Row 2: Filter Controls */}
        <form
          onSubmit={handleApply}
          className="bg-slate-50/70 p-4 rounded-2xl border border-slate-150 flex flex-wrap items-end gap-3"
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

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-orange-500"
            >
              <option value="orders">Mayor pedidos -&gt; menor</option>
              <option value="spend">Mayor monto total -&gt; menor</option>
              <option value="recent">Más recientes</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            Aplicar
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            ✕ Limpiar
          </button>
        </form>

        {/* Row 3: Results Area */}
        <div className="border border-slate-150 rounded-2xl min-h-[260px] flex flex-col justify-center overflow-hidden">
          {sortedCustomers.length === 0 ? (
            /* Exact Empty State from Screenshot */
            <div className="py-14 text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-2">
                <Users className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Sin clientes aún</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Cuando lleguen pedidos por chatbot aquí verás los clientes con mayor fidelidad.
              </p>
            </div>
          ) : (
            /* Ranking Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Teléfono WhatsApp</th>
                    <th className="py-3 px-4 text-center">Total Pedidos</th>
                    <th className="py-3 px-4">Gasto Total</th>
                    <th className="py-3 px-4">Ticket Promedio</th>
                    <th className="py-3 px-4">Última Compra</th>
                    <th className="py-3 px-4 text-right">Contacto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sortedCustomers.map((cust, idx) => (
                    <tr key={cust.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3 px-4 text-center">
                        {idx === 0 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-bold inline-flex items-center justify-center text-xs shadow-xs">
                            1
                          </span>
                        ) : idx === 1 ? (
                          <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-bold inline-flex items-center justify-center text-xs shadow-xs">
                            2
                          </span>
                        ) : idx === 2 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-700/30 text-amber-900 font-bold inline-flex items-center justify-center text-xs shadow-xs">
                            3
                          </span>
                        ) : (
                          <span className="font-mono text-slate-400 font-bold">#{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{cust.name}</div>
                        {cust.address && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {cust.address}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {cust.phone}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full font-mono font-black text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {cust.totalOrders} {cust.totalOrders === 1 ? 'pedido' : 'pedidos'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-emerald-600">
                        ${cust.totalSpent.toLocaleString('es-AR')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        ${cust.averageTicket.toLocaleString('es-AR')}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 font-mono">
                        {new Date(cust.lastOrderDate).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`https://wa.me/${cust.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs shadow-xs transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Chat
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Row 4: Pagination */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 font-medium">
          <span>Página 1 de 1 · {sortedCustomers.length} clientes</span>
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
    </div>
  );
};
