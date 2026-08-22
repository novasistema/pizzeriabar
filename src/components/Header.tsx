import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Globe,
  Settings,
  MessageCircle,
  Menu,
  Sparkles,
  PlusCircle,
  RotateCcw,
  CheckCircle,
  Store,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC<{ onToggleMobileSidebar: () => void }> = ({
  onToggleMobileSidebar,
}) => {
  const {
    businessConfig,
    setActiveTab,
    setIsChatbotModalOpen,
    setIsTimeConfigModalOpen,
    simulateChatbotOrder,
    orders,
    loadSampleOrders,
    clearAllOrders,
    isFirebaseConnected,
    isSyncing,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // Live ticking clock in Argentine format
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const handleSimulateIncomingOrder = () => {
    const newOrd = simulateChatbotOrder();
    setNotificationBanner(`¡Nuevo pedido #${newOrd.orderNumber} recibido desde el Chatbot! 🍕`);
    setTimeout(() => {
      setNotificationBanner(null);
    }, 4500);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-slate-200">
      {/* Left: Mobile hamburger & Business Identity & Store Status */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="btn-mobile-menu"
          onClick={onToggleMobileSidebar}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg lg:hidden focus:outline-none shrink-0"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Business Identity Name & Logo Badge */}
        <button
          id="btn-header-business-identity"
          onClick={() => setActiveTab('mi-negocio')}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/90 hover:border-orange-500/50 transition text-left group cursor-pointer shrink-0"
          title="Identidad del negocio - Clic para cambiar nombre o logo"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 shadow-xs flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-md bg-slate-950 flex items-center justify-center text-orange-400 font-bold text-xs overflow-hidden">
              {businessConfig.logoUrl ? (
                <img src={businessConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                '🍕'
              )}
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-white group-hover:text-orange-400 transition tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
                {businessConfig.name || 'Bruzzone128'}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-mono font-semibold hidden sm:inline">
                PANEL
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-300 transition truncate hidden xs:block">
              Identidad del negocio
            </span>
          </div>
        </button>

        {/* Store Open Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-200">
            Local Abierto
          </span>
          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
            ({businessConfig.openTime || '12:00'} - {businessConfig.closeTime || '22:00'} hs)
          </span>
          <span className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 ml-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-spin' : 'bg-emerald-400'}`}></span>
            {isSyncing ? 'GUARDANDO...' : 'FIRESTORE SYNC'}
          </span>
        </div>

        {/* Quick Demo Controls */}
        <div className="hidden 2xl:flex items-center gap-1.5 pl-3 border-l border-slate-800 text-xs">
          {orders.length === 0 ? (
            <button
              id="btn-load-sample"
              onClick={loadSampleOrders}
              className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg font-medium transition cursor-pointer"
              title="Cargar pedidos de muestra para ver métricas y gráficos"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Cargar datos demo
            </button>
          ) : (
            <button
              id="btn-clear-sample"
              onClick={clearAllOrders}
              className="flex items-center gap-1.5 px-2.5 py-1 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg font-medium transition cursor-pointer"
              title="Volver a vista vacía"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resetear a 0
            </button>
          )}

          <button
            id="btn-simulate-order"
            onClick={handleSimulateIncomingOrder}
            className="flex items-center gap-1.5 px-2.5 py-1 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 rounded-lg font-medium transition cursor-pointer"
            title="Simula un nuevo cliente comprando por WhatsApp/Chatbot"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            + Simular Pedido
          </button>
        </div>
      </div>

      {/* Right: Date/Time Widget & Orange "Ver mi chatbot" Button */}
      <div className="flex items-center gap-2.5 sm:gap-3 ml-auto shrink-0">
        {/* Date Time Box */}
        <div className="bg-slate-800/60 border border-slate-800 rounded-xl px-3 py-1 text-right flex flex-col justify-center hidden sm:flex">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3 text-orange-400" />
              {formatDate(currentTime)}
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 text-orange-400 font-bold font-mono tracking-tight">
              <Clock className="w-3 h-3" />
              {formatTime(currentTime)}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
            <span className="flex items-center gap-1 truncate max-w-[150px]">
              <Globe className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              Argentina · {businessConfig.timezone?.split('/')[1]?.replace('_', ' ') || 'BsAs'}
            </span>
            <button
              id="btn-config-horario"
              onClick={() => setIsTimeConfigModalOpen(true)}
              className="text-orange-400/90 hover:text-orange-300 flex items-center gap-0.5 hover:underline cursor-pointer"
            >
              <Settings className="w-2.5 h-2.5" />
              Configurar
            </button>
          </div>
        </div>

        {/* Orange CTA Button "Ver mi chatbot" */}
        <button
          id="btn-ver-chatbot-header"
          onClick={() => setIsChatbotModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition active:scale-95 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-white/20" />
          <span>Ver mi chatbot</span>
        </button>
      </div>

      {/* Floating notification toast when order simulated */}
      {notificationBanner && (
        <div className="fixed top-14 right-6 z-50 bg-slate-900 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium">{notificationBanner}</span>
        </div>
      )}
    </header>
  );
};
