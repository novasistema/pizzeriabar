import React from 'react';
import {
  TrendingUp,
  Receipt,
  Hourglass,
  DollarSign,
  Trophy,
  History,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Bike,
  Flame,
  LayoutDashboard,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { TimeFilter, Order } from '../types';
import { TopHeaderWidget } from './TopHeaderWidget';

export const DashboardView: React.FC = () => {
  const {
    timeFilter,
    setTimeFilter,
    orders,
    setActiveTab,
    setIsChatbotModalOpen,
    setSelectedOrderForReceipt,
    loadSampleOrders,
    updateOrderStatus,
  } = useApp();

  const timeFilters: TimeFilter[] = ['Día', 'Semana', 'Mes', 'Año'];

  const now = new Date();
  const filteredOrders = orders.filter((o) => {
    if (o.status === 'cancelado') return false;
    const orderDate = new Date(o.createdAt);
    if (timeFilter === 'Día') {
      return (
        orderDate.getDate() === now.getDate() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    } else if (timeFilter === 'Semana') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= oneWeekAgo;
    } else if (timeFilter === 'Mes') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    } else {
      return orderDate.getFullYear() === now.getFullYear();
    }
  });

  const totalSales = filteredOrders.reduce((acc, curr) => acc + curr.total, 0);
  const totalOrdersCount = filteredOrders.length;
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'pendiente' || o.status === 'en_cocina'
  ).length;
  const averageTicket = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;

  const formatCurrency = (val: number) => {
    return `ARS ${val.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const hoursList = [
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
  ];

  const hourlyData = hoursList.map((h) => {
    const hourNum = parseInt(h.split(':')[0], 10);
    const salesInHour = filteredOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d.getHours() === hourNum;
      })
      .reduce((sum, o) => sum + o.total, 0);

    return {
      hour: h,
      ventas: salesInHour,
      pedidos: filteredOrders.filter((o) => new Date(o.createdAt).getHours() === hourNum).length,
    };
  });

  const productCountMap: { [name: string]: { count: number; revenue: number } } = {};
  filteredOrders.forEach((ord) => {
    ord.items.forEach((item) => {
      if (!productCountMap[item.productName]) {
        productCountMap[item.productName] = { count: 0, revenue: 0 };
      }
      productCountMap[item.productName].count += item.quantity;
      productCountMap[item.productName].revenue += item.totalPrice;
    });
  });

  const topProductsList = Object.entries(productCountMap)
    .map(([name, stat]) => ({ name, ...stat }))
    .sort((a, b) => b.count - a.count);

  const DONUT_COLORS = ['#ea580c', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#eab308'];

  const donutData =
    topProductsList.length > 0
      ? topProductsList.slice(0, 5).map((item, idx) => ({
          name: item.name,
          value: item.count,
          color: DONUT_COLORS[idx % DONUT_COLORS.length],
        }))
      : [{ name: 'Sin datos', value: 1, color: '#e2e8f0' }];

  const recentOrders = orders.slice(0, 6);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pendiente
          </span>
        );
      case 'en_cocina':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <Flame className="w-3 h-3 text-orange-600 animate-pulse" /> En Cocina
          </span>
        );
      case 'en_camino':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Bike className="w-3 h-3 text-sky-600" /> En Camino
          </span>
        );
      case 'entregado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Entregado
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelado
          </span>
        );
    }
  };

  return (
    <div id="dashboard-view" className="space-y-5 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Resumen de operaciones y métricas clave en tiempo real</p>
        </div>

        <TopHeaderWidget
          extraAction={
            <div className="flex items-center bg-white border border-slate-200 p-1 rounded-2xl shadow-xs">
              {timeFilters.map((tf) => {
                const isSelected = timeFilter === tf;
                return (
                  <button
                    key={tf}
                    id={`filter-btn-${tf.toLowerCase()}`}
                    onClick={() => setTimeFilter(tf)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tf}
                  </button>
                );
              })}
            </div>
          }
        />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ventas */}
        <div
          id="metric-card-ventas"
          className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 flex items-center justify-between"
        >
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
              Ventas ({timeFilter.toLowerCase()})
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-mono text-slate-900 truncate mt-1">
              {formatCurrency(totalSales)}
            </h3>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> En tiempo real
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Pedidos */}
        <div
          id="metric-card-pedidos"
          className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 flex items-center justify-between"
        >
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
              Pedidos ({timeFilter.toLowerCase()})
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1">
              {totalOrdersCount}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Comandas procesadas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Pendientes */}
        <div
          id="metric-card-pendientes"
          className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 flex items-center justify-between"
        >
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
              Pendientes
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1">
              {pendingOrdersCount}
            </h3>
            <span className="text-[11px] text-amber-600 font-bold mt-1 block">
              En cocina / espera
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Hourglass className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Ticket promedio */}
        <div
          id="metric-card-ticket"
          className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 flex items-center justify-between"
        >
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
              Ticket Promedio
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-mono text-slate-900 truncate mt-1">
              {formatCurrency(averageTicket)}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Por pedido
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Ventas por hora */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-800 uppercase font-mono tracking-wider">
              Ventas por hora
            </span>
            <span className="text-xs text-slate-400 font-mono">11:00 - 23:00 hs</span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            {totalSales === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl text-center p-6 bg-slate-50/50">
                <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">Sin movimientos registrados hoy</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Genera una venta en el Punto de Venta o simula un pedido desde el Chatbot para ver la curva de demanda.
                </p>
                <button
                  onClick={loadSampleOrders}
                  className="mt-3 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Cargar datos demo
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSalesLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString('es-AR')}`, 'Ventas']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '16px',
                      color: '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ventas"
                    stroke="#ea580c"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSalesLight)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Más vendidos de hoy */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-800 uppercase font-mono tracking-wider">
              Más vendidos de hoy
            </span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center min-h-[220px]">
            <div className="w-44 h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {topProductsList.length > 0 && (
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} unidades`, name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        color: '#0f172a',
                        fontSize: '11px',
                        boxShadow: '0 2px 4px rgb(0 0 0 / 0.05)',
                      }}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>

              {/* Center donut text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black font-mono text-slate-900">
                  {topProductsList.reduce((acc, curr) => acc + curr.count, 0)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Unidades</span>
              </div>
            </div>

            {/* List */}
            {topProductsList.length > 0 ? (
              <div className="w-full mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {topProductsList.slice(0, 4).map((p, idx) => (
                  <div key={p.name} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                      />
                      <span className="text-slate-700 font-medium truncate">{p.name}</span>
                    </div>
                    <span className="font-mono font-black text-slate-900 shrink-0 ml-2">{p.count} un.</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center mt-2 font-mono">Sin ventas registradas hoy</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Pedidos Recientes */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-bold text-slate-800 uppercase font-mono tracking-wider">
              Pedidos Recientes
            </span>
          </div>

          <button
            id="btn-ver-todos-pedidos"
            onClick={() => setActiveTab('pedidos')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition cursor-pointer"
          >
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl py-12 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Aún no hay pedidos</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Comparte tu liga del chatbot para empezar a vender o genera un pedido desde el POS.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
              <button
                id="btn-empty-open-chatbot"
                onClick={() => setIsChatbotModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition cursor-pointer"
              >
                Abrir Chatbot de Pedidos
              </button>
              <button
                id="btn-empty-pos"
                onClick={() => setActiveTab('pos')}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Ir al Punto de Venta (POS)
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-mono font-bold text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4"># Pedido</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Tipo & Canal</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4 font-mono font-black text-orange-600">#{ord.orderNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{ord.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="capitalize font-bold text-slate-700">{ord.type}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] text-slate-600 font-mono uppercase font-bold border border-slate-200">
                          {ord.source}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="truncate max-w-[200px] text-slate-600 font-medium">
                        {ord.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(ord.status)}</td>
                    <td className="py-3 px-4 font-mono font-black text-slate-900">
                      ${ord.total.toLocaleString('es-AR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrderForReceipt(ord)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition cursor-pointer"
                          title="Ver Ticket / Comanda"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        {ord.status === 'pendiente' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'en_cocina')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs cursor-pointer"
                          >
                            Horno
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
