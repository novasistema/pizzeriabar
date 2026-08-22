import React, { useState } from 'react';
import { 
  ClipboardList, 
  UtensilsCrossed, 
  Settings as SettingsIcon, 
  BarChart3, 
  Users, 
  Flame, 
  Clock, 
  DollarSign, 
  Store,
  Power,
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { Order, PizzeriaSettings } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { StorageService } from '../../services/storageService';
import { ShareMenuModal } from './ShareMenuModal';

export type AdminTab = 'orders' | 'menu' | 'settings' | 'reports' | 'customers';

interface AdminHeaderProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  orders: Order[];
  settings: PizzeriaSettings;
  onUpdateSettings: (settings: PizzeriaSettings) => void;
  onOpenCustomerView?: () => void;
  onOpenWaiterView?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  setActiveTab,
  orders,
  settings,
  onUpdateSettings,
  onOpenCustomerView,
  onOpenWaiterView,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Compute public menu URL
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}`
    : '';
  const customerMenuUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}view=customer`;

  // Compute quick counters
  const pendingOrders = orders.filter(o => o.status === 'pendiente');
  const inOvenOrders = orders.filter(o => o.status === 'en_horno');
  const inDeliveryOrders = orders.filter(o => o.status === 'en_camino');
  
  // Total today
  const todayRevenue = orders
    .filter(o => o.status !== 'cancelado')
    .reduce((sum, o) => sum + o.total, 0);

  const toggleStoreOpen = () => {
    const updated = { ...settings, isOpen: !settings.isOpen };
    onUpdateSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleCopyMenuLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(customerMenuUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = `🍕 ¡Hola! Te compartimos la Carta Digital de *${settings.name}* para que hagas tu pedido online:\n\n👉 ${customerMenuUrl}\n\n🛵 ¡Hacemos delivery o podés retirar por el local!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner with Store status toggle and quick metrics */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
              Panel de Control Pizzería
            </span>
            <span className="text-xs text-slate-400">
              {settings.name}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-serif">
            Gestión de Pedidos & Cocina
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Supervisa pedidos en vivo, actualiza estados en tiempo real, administra la carta y reportes diarios.
          </p>
        </div>

        {/* Quick Actions & Store Status */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Store Open/Closed Toggle */}
          <button
            onClick={toggleStoreOpen}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition shadow-sm ${
              settings.isOpen
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/30'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{settings.isOpen ? 'Local Abierto (Recibiendo pedidos)' : 'Local Cerrado (Pausado)'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          LINK DE LA CARTA DIGITAL PARA CLIENTES (PROMINENT SHARE BAR)
         ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 dark:from-amber-950/40 dark:via-slate-900 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700/60 shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/30 shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md">
                Enlace para tus Clientes
              </span>
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                • Carta Online lista para recibir pedidos
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white font-serif mt-0.5">
              Link de la Carta Digital para Enviar y Pedir
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Mandale este link a tus clientes por WhatsApp o redes sociales para que elijan y pidan al instante.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Link Display & Copy */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-1 shadow-xs max-w-full overflow-hidden">
            <span className="px-3 text-xs font-mono text-slate-600 dark:text-slate-300 truncate max-w-[200px] sm:max-w-[280px]">
              {customerMenuUrl}
            </span>
            <button
              onClick={handleCopyMenuLink}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition shadow-xs shrink-0 ${
                copiedLink
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
              }`}
              title="Copiar enlace de la carta al portapapeles"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? '¡Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-xs active:scale-95"
            title="Compartir por WhatsApp con mensaje automático"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Open QR Code Modal */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-black transition shadow-xs active:scale-95"
            title="Ver código QR para imprimir carteles de mesa o mostrador"
          >
            <QrCode className="w-4 h-4 text-amber-400 dark:text-amber-600" />
            <span>Código QR</span>
          </button>

          {/* Open Mozo / Salón View */}
          {onOpenWaiterView && (
            <button
              onClick={onOpenWaiterView}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-black transition"
              title="Abrir Comandero de Salón / Modo Mozo"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Modo Mozo</span>
            </button>
          )}

          {/* Preview Customer View */}
          {onOpenCustomerView && (
            <button
              onClick={onOpenCustomerView}
              className="flex items-center gap-1 px-3 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
              title="Probar o ver la carta como cliente"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ver Carta</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Kpi Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Pendientes */}
        <div 
          onClick={() => setActiveTab('orders')} 
          className="p-4 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20 cursor-pointer hover:bg-amber-600 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">Por Confirmar</span>
            <Clock className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-3xl font-black mt-2 font-mono">{pendingOrders.length}</p>
          <p className="text-[11px] opacity-80 mt-0.5">Requieren atención</p>
        </div>

        {/* 2. En Horno */}
        <div 
          onClick={() => setActiveTab('orders')} 
          className="p-4 rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-600/20 cursor-pointer hover:bg-orange-700 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">En Horno 🔥</span>
            <Flame className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-3xl font-black mt-2 font-mono">{inOvenOrders.length}</p>
          <p className="text-[11px] opacity-80 mt-0.5">En cocción activa</p>
        </div>

        {/* 3. En Delivery */}
        <div 
          onClick={() => setActiveTab('orders')} 
          className="p-4 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/20 cursor-pointer hover:bg-purple-700 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">En Reparto</span>
            <Store className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-3xl font-black mt-2 font-mono">{inDeliveryOrders.length}</p>
          <p className="text-[11px] opacity-80 mt-0.5">Cadetes en camino</p>
        </div>

        {/* 4. Total Facturado */}
        <div 
          onClick={() => setActiveTab('reports')} 
          className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md cursor-pointer hover:bg-slate-800 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Total Hoy</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black mt-2 text-white font-mono">{formatCurrency(todayRevenue)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{orders.length} comandas hoy</p>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Gestor de Pedidos</span>
          {pendingOrders.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'menu'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Carta & Productos</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'reports'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Reportes & Cierre de Caja</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'customers'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Directorio de Clientes</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Configuración & Pagos</span>
        </button>
      </div>

      {/* Share Modal with QR and WhatsApp Sharing */}
      <ShareMenuModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        settings={settings}
        onOpenCustomerView={onOpenCustomerView}
      />
    </div>
  );
};
