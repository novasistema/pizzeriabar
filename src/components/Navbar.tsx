import React, { useState } from 'react';
import { 
  Pizza, 
  ShoppingBag, 
  User, 
  Store, 
  Clock, 
  MapPin, 
  Bike, 
  Volume2, 
  VolumeX,
  Sparkles,
  PhoneCall,
  Flame,
  ShieldCheck,
  LogOut,
  UtensilsCrossed,
  Lock,
  ArrowLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { PizzeriaSettings, CartItem, Order, CustomerUser } from '../types';
import { formatCurrency } from '../utils/formatters';
import { soundManager } from '../utils/audio';

export type ViewMode = 'customer' | 'admin' | 'waiter';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  settings: PizzeriaSettings;
  cartItems: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  activeOrder: Order | null;
  setIsTrackerOpen: (open: boolean) => void;
  setIsProfileOpen: (open: boolean) => void;
  customer: CustomerUser;
  pendingOrdersCount: number;
  onOpenStaffPortal?: () => void;
  isAdminAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  settings,
  cartItems,
  setIsCartOpen,
  activeOrder,
  setIsTrackerOpen,
  setIsProfileOpen,
  customer,
  pendingOrdersCount,
  onOpenStaffPortal,
  isAdminAuthenticated = false,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const toggleSound = () => {
    const nextState = !isMuted;
    soundManager.setMuted(nextState);
    setIsMuted(nextState);
    if (!nextState) {
      soundManager.playSuccessTone();
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);
  const hasActiveOrder = activeOrder && activeOrder.status !== 'entregado' && activeOrder.status !== 'cancelado';

  return (
    <>
      {/* =========================================================================
         1. CUSTOMER PUBLIC HEADER (Clean, appetizing, no internal staff tabs)
         ========================================================================= */}
      {viewMode === 'customer' && (
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          {/* Announcement banner */}
          {settings.bannerMessage && (
            <div className="bg-amber-600 dark:bg-amber-700 text-white text-[11px] sm:text-xs py-1 sm:py-1.5 px-3 sm:px-4 font-medium">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="inline-flex items-center justify-center p-0.5 rounded-full bg-white/20 shrink-0">
                    <Sparkles className="w-3 h-3" />
                  </span>
                  <span className="truncate">{settings.bannerMessage}</span>
                </div>
                <div className="flex items-center gap-3 text-amber-100 text-xs shrink-0">
                  {settings.address && (
                    <span className="items-center gap-1 hidden md:flex">
                      <MapPin className="w-3 h-3" /> {settings.address}
                    </span>
                  )}
                  <span className="items-center gap-1 hidden sm:flex">
                    <Clock className="w-3 h-3" /> {settings.estimatedDeliveryTimeMinutes}m delivery
                  </span>
                  {settings.whatsapp && (
                    <a 
                      href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 hover:underline text-white font-bold bg-white/15 px-2 py-0.5 rounded-full"
                    >
                      <PhoneCall className="w-3 h-3" /> <span className="hidden xs:inline">WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Customer Navbar Bar */}
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-18 gap-2 sm:gap-4">
              {/* Brand Logo & Name */}
              <div 
                className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none" 
                onClick={() => setViewMode('customer')}
              >
                {settings.logoUrl ? (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black border border-amber-500/40 shadow-md p-1 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={settings.logoUrl}
                      alt={settings.name}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/20 shrink-0 relative group">
                    {/* Vinyl grooves */}
                    <div className="absolute inset-1 rounded-full border border-white/10" />
                    <div className="w-4 h-4 rounded-full bg-rose-600 border border-amber-400 flex items-center justify-center text-white">
                      <Pizza className="w-2.5 h-2.5 transform -rotate-12" />
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h1 className="text-base sm:text-xl font-black tracking-tight text-white font-serif leading-none truncate max-w-[130px] xs:max-w-[170px] sm:max-w-none">
                      {settings.name}
                    </h1>
                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                      33 RPM
                    </span>
                    <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 ${
                      settings.isOpen 
                        ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-rose-950/70 text-rose-400 border border-rose-500/40'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1 ${settings.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
                      {settings.isOpen ? 'ABIERTO' : 'CERRADO'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-xs font-medium">
                    {settings.slogan}
                  </p>
                </div>
              </div>

              {/* Right Action Icons & Buttons (Customer-Focused) */}
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                {/* Audio Toggle Button */}
                <button
                  id="btn-sound-toggle"
                  onClick={toggleSound}
                  title={isMuted ? 'Activar avisos sonoros' : 'Silenciar avisos'}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                </button>

                {/* Active Order Tracker Pill (Desktop) */}
                {hasActiveOrder && (
                  <button
                    id="btn-active-order-tracker"
                    onClick={() => setIsTrackerOpen(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300 text-xs font-bold hover:bg-orange-200 dark:hover:bg-orange-900/60 transition animate-pulse"
                  >
                    <Bike className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                    <span className="truncate">Seguir #{activeOrder.orderNumber}</span>
                  </button>
                )}

                {/* Customer Profile / Frequent Addresses (Desktop) */}
                <button
                  id="btn-customer-profile"
                  onClick={() => setIsProfileOpen(true)}
                  className="hidden sm:flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition"
                >
                  <User className="w-4 h-4 text-amber-600" />
                  <span className="truncate max-w-[100px]">{customer.name.split(' ')[0] || 'Mi Cuenta'}</span>
                </button>

                {/* Cart Button with Total and Quantity Badge */}
                <button
                  id="btn-open-cart"
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 rounded-xl bg-linear-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 transition transform active:scale-95 shrink-0"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Tu Pedido</span>
                  <span className="font-extrabold text-xs sm:text-sm">{formatCurrency(totalCartPrice)}</span>
                  {totalCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-slate-900 text-white text-[10px] sm:text-[11px] font-black w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                      {totalCartCount}
                    </span>
                  )}
                </button>

                {/* Discrete Staff Access Button (Desktop & Tablet) */}
                {onOpenStaffPortal && (
                  <button
                    id="btn-staff-portal"
                    onClick={onOpenStaffPortal}
                    className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition ml-1"
                    title="Acceso para Mozos y Gestión del Local"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span className="hidden lg:inline">Acceso Personal</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* =========================================================================
         2. WAITER / SALÓN HEADER (Dedicated for waitstaff)
         ========================================================================= */}
      {viewMode === 'waiter' && (
        <header className="sticky top-0 z-40 bg-amber-950 text-white border-b border-amber-900 shadow-md">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight font-serif">
                      Comandero de Salón
                    </span>
                    <span className="bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                      Modo Mozo
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 truncate hidden sm:block">
                    {settings.name} • Salón & Comandas
                  </p>
                </div>
              </div>

              {/* Navigation Actions for Waiter */}
              <div className="flex items-center gap-2">
                {/* Switch to Admin (if authorized or opens auth) */}
                <button
                  onClick={() => {
                    if (isAdminAuthenticated) {
                      setViewMode('admin');
                    } else if (onOpenStaffPortal) {
                      onOpenStaffPortal();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-900 border border-amber-800 text-amber-200 text-xs font-bold transition"
                  title="Abrir Panel de Cocina y Gestión"
                >
                  <Store className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden xs:inline">Gestión / Cocina</span>
                </button>

                {/* Back to Client Menu */}
                <button
                  onClick={() => setViewMode('customer')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-sm"
                >
                  <Pizza className="w-3.5 h-3.5" />
                  <span>Salir a Carta</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* =========================================================================
         3. ADMIN / GESTIÓN HEADER BANNER (Dedicated for owners & kitchen)
         ========================================================================= */}
      {viewMode === 'admin' && (
        <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-rose-900/50 shadow-md">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shadow-sm">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight font-serif">
                      Panel de Gestión & Cocina
                    </span>
                    <span className="bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-rose-400" />
                      Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                    {settings.name} • Control Total del Local
                  </p>
                </div>
              </div>

              {/* Navigation Actions for Admin */}
              <div className="flex items-center gap-2">
                {/* Switch to Waiter Salon View */}
                <button
                  onClick={() => setViewMode('waiter')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold transition"
                  title="Abrir Comandero de Salón"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xs:inline">Modo Mozo</span>
                </button>

                {/* Back to Client Menu */}
                <button
                  onClick={() => setViewMode('customer')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm"
                >
                  <Pizza className="w-3.5 h-3.5" />
                  <span>Ver Carta Clientes</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* =========================================================================
         MOBILE BOTTOM NAVIGATION BAR (Customer view only)
         ========================================================================= */}
      {viewMode === 'customer' && (
        <nav 
          id="mobile-bottom-nav"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-2xl transition-all"
          style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center justify-around max-w-lg mx-auto">
            {/* 1. Menu / Carta */}
            <button
              onClick={() => setViewMode('customer')}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition text-amber-600 dark:text-amber-400 font-extrabold"
            >
              <Pizza className="w-5 h-5 scale-110" />
              <span className="text-[10px] mt-0.5">Carta</span>
            </button>

            {/* 2. Cart / Tu Pedido */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-600 dark:text-slate-300 relative"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-bold">Carrito</span>
            </button>

            {/* 3. Live Tracker / Mis Pedidos */}
            <button
              onClick={() => {
                if (hasActiveOrder) {
                  setIsTrackerOpen(true);
                } else {
                  setIsProfileOpen(true);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition relative ${
                hasActiveOrder
                  ? 'text-orange-600 dark:text-orange-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="relative">
                <Bike className={`w-5 h-5 ${hasActiveOrder ? 'animate-pulse' : ''}`} />
                {hasActiveOrder && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-bold">
                {hasActiveOrder ? 'Seguir' : 'Mis Pedidos'}
              </span>
            </button>

            {/* 4. Customer Profile */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800"
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Perfil</span>
            </button>

            {/* 5. Discrete Staff / Personal Portal Access */}
            <button
              onClick={() => {
                if (onOpenStaffPortal) {
                  onOpenStaffPortal();
                }
              }}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              title="Acceso Personal: Mozos & Administración"
            >
              <Lock className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] mt-0.5">Personal</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
};

