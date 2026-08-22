import React, { useState } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  Printer, 
  Copy, 
  Check, 
  Calendar, 
  FileText,
  Clock,
  Store,
  Bike
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Order, PizzeriaSettings, DailySalesReport } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { StorageService } from '../../services/storageService';

interface ReportsAnalyticsProps {
  orders: Order[];
  settings: PizzeriaSettings;
}

const COLORS = ['#f59e0b', '#3b82f6', '#0284c7', '#8b5cf6', '#10b981'];

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  orders,
  settings,
}) => {
  const [copiedClosure, setCopiedClosure] = useState(false);
  const report: DailySalesReport = StorageService.generateDailySalesReport();

  const paymentData = [
    { name: 'Efectivo', value: report.revenueByPaymentMethod.efectivo },
    { name: 'Transferencias', value: report.revenueByPaymentMethod.transferencia },
    { name: 'Mercado Pago', value: report.revenueByPaymentMethod.mercadopago },
    { name: 'Tarjeta al Delivery', value: report.revenueByPaymentMethod.tarjeta_delivery },
  ].filter(d => d.value > 0);

  const handleCopyCashClosure = () => {
    const text = `📊 *CIERRE DE CAJA DIARIO - ${settings.name}*
📅 *Fecha:* ${new Date().toLocaleDateString('es-AR')}
━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL FACTURADO:* ${formatCurrency(report.totalRevenue)}
📋 *Comandas Totales:* ${report.ordersCount} (${report.completedOrders} completados, ${report.cancelledOrders} cancelados)
🏷️ *Ticket Promedio:* ${formatCurrency(report.averageTicket)}

💵 *DESGLOSE POR FORMA DE PAGO:*
• 💵 Efectivo en Caja: ${formatCurrency(report.revenueByPaymentMethod.efectivo)}
• 🏛️ Transferencias / CVU: ${formatCurrency(report.revenueByPaymentMethod.transferencia)}
• 📱 Mercado Pago / QR: ${formatCurrency(report.revenueByPaymentMethod.mercadopago)}
• 💳 Posnet / Tarjetas: ${formatCurrency(report.revenueByPaymentMethod.tarjeta_delivery)}

🛵 *MODALIDADES:*
• Delivery a Domicilio: ${report.ordersByDeliveryType.delivery} pedidos
• Retiro en Mostrador: ${report.ordersByDeliveryType.retiro} pedidos

🍕 *TOP 3 PIZZAS MÁS VENDIDAS:*
${report.topSellingProducts.slice(0, 3).map((p, i) => `${i + 1}. ${p.productName} (${p.quantity} unid. - ${formatCurrency(p.revenue)})`).join('\n')}
━━━━━━━━━━━━━━━━━━━━
Generado automáticamente por el Sistema Bella Napoli.`;

    navigator.clipboard.writeText(text);
    setCopiedClosure(true);
    setTimeout(() => setCopiedClosure(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-serif flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <span>Reportes de Ventas & Cierre de Caja</span>
          </h3>
          <p className="text-xs text-slate-500">
            Métricas de rendimiento, recaudación y arqueo de dinero en tiempo real.
          </p>
        </div>

        <button
          onClick={handleCopyCashClosure}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition"
        >
          {copiedClosure ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copiedClosure ? '¡Resumen Copiado!' : 'Copiar Cierre de Caja del Día'}</span>
        </button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recaudación Total</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(report.totalRevenue)}</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Turno activo
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Comandas Totales</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{report.ordersCount}</p>
          <span className="text-[11px] text-slate-500">
            {report.completedOrders} completados • {report.cancelledOrders} cancelados
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(report.averageTicket)}</p>
          <span className="text-[11px] text-slate-500">Por comanda entregada</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modalidad Delivery</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {Math.round((report.ordersByDeliveryType.delivery / (report.ordersCount || 1)) * 100)}%
          </p>
          <span className="text-[11px] text-slate-500">
            {report.ordersByDeliveryType.delivery} envíos vs {report.ordersByDeliveryType.retiro} retiros
          </span>
        </div>
      </div>

      {/* Cierre de Caja Diario Balance Sheet */}
      <div className="p-6 rounded-3xl bg-linear-to-br from-amber-500/10 via-slate-50 to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white font-serif flex items-center gap-2">
            <Banknote className="w-5 h-5 text-amber-600" />
            <span>Arqueo y Desglose de Caja del Día</span>
          </h4>
          <span className="text-xs font-mono font-bold text-slate-500">
            {new Date().toLocaleDateString('es-AR')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Efectivo */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Efectivo en Mano</span>
            <p className="text-xl font-black text-emerald-600 font-mono">
              {formatCurrency(report.revenueByPaymentMethod.efectivo)}
            </p>
            <p className="text-[10px] text-slate-400">Total billetes físicos a rendir</p>
          </div>

          {/* Transferencias */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Banco / Transferencias</span>
            <p className="text-xl font-black text-blue-600 font-mono">
              {formatCurrency(report.revenueByPaymentMethod.transferencia)}
            </p>
            <p className="text-[10px] text-slate-400">Acreditado en cuenta {settings.bankDetails.alias}</p>
          </div>

          {/* Mercado Pago */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Mercado Pago / QR</span>
            <p className="text-xl font-black text-sky-600 font-mono">
              {formatCurrency(report.revenueByPaymentMethod.mercadopago)}
            </p>
            <p className="text-[10px] text-slate-400">Saldo digital app</p>
          </div>

          {/* Tarjetas */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Tarjetas (Posnet)</span>
            <p className="text-xl font-black text-purple-600 font-mono">
              {formatCurrency(report.revenueByPaymentMethod.tarjeta_delivery)}
            </p>
            <p className="text-[10px] text-slate-400">Cobrado al cadete</p>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Best Selling Products Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Top Pizzas & Productos Más Vendidos
          </h4>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.topSellingProducts} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="productName" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: any) => [`${value} unidades`, 'Cantidad']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="quantity" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Payment Method Pie Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Distribución por Forma de Pago
          </h4>

          <div className="h-64 flex items-center justify-center">
            {paymentData.length === 0 ? (
              <p className="text-xs text-slate-400">Sin datos de pago suficientes</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Ingresos']}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
