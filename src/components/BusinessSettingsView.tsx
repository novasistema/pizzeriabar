import React, { useState, useEffect } from 'react';
import {
  Store,
  CreditCard,
  Image as ImageIcon,
  Building2,
  Users,
  Plus,
  Clock,
  MapPin,
  Coins,
  Globe,
  Bike,
  Printer,
  ShieldCheck,
  Check,
  Save,
  CheckCircle2,
  Utensils,
  Sofa,
  Plane,
  Briefcase,
  Shirt,
  Hammer,
  HeartPulse,
  Smile,
  Copy,
  Trash2,
  Edit2,
  X,
  Lock,
  ExternalLink,
  Sparkles,
  Receipt,
  BadgeCheck,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Branch, CashierBox } from '../types';
import { TopHeaderWidget } from './TopHeaderWidget';

export const BusinessSettingsView: React.FC<{ type?: 'mi-negocio' | 'suscripciones' | 'instrucciones' }> = ({
  type = 'mi-negocio',
}) => {
  const { businessConfig, updateBusinessConfig, setIsChatbotModalOpen } = useApp();

  // Local state initialized with context
  const [businessName, setBusinessName] = useState(businessConfig.name || 'Bruzzone128');
  const [logoFile, setLogoFile] = useState<string | null>(businessConfig.logoUrl || null);
  const [brandColor, setBrandColor] = useState(businessConfig.brandColor || '#ea580c');
  const [customColor, setCustomColor] = useState('#f97316');

  // Keep local states synced with businessConfig updates from Firestore
  useEffect(() => {
    if (businessConfig.name) setBusinessName(businessConfig.name);
    if (businessConfig.logoUrl !== undefined) setLogoFile(businessConfig.logoUrl);
    if (businessConfig.brandColor) setBrandColor(businessConfig.brandColor);
    if (businessConfig.address) setAddress(businessConfig.address);
    if (businessConfig.scheduleText) setScheduleText(businessConfig.scheduleText);
    if (businessConfig.currency) setCurrency(businessConfig.currency);
    if (businessConfig.timezone) setTimezone(businessConfig.timezone);
  }, [businessConfig]);

  // Address & Hours
  const [address, setAddress] = useState(businessConfig.address || 'Av. Principal 123, Col. Centro');
  const [scheduleText, setScheduleText] = useState(businessConfig.scheduleText || 'Lun-Dom · 12:00 — 22:00');
  const [currency, setCurrency] = useState(businessConfig.currency || 'ARS');
  const [timezone, setTimezone] = useState(businessConfig.timezone || 'America/Argentina/Buenos_Aires');

  // Chatbot Payment Methods
  const [deliveryPayments, setDeliveryPayments] = useState(
    businessConfig.deliveryPayments || { efectivo: true, transferencia: false, tarjeta: false }
  );
  const [pickupPayments, setPickupPayments] = useState(
    businessConfig.pickupPayments || { efectivo: true, transferencia: false, tarjeta: false }
  );

  // POS Integration
  const [integrateChatbotToPos, setIntegrateChatbotToPos] = useState(
    businessConfig.integrateChatbotToPos ?? false
  );

  // Ticket Printing
  const [printType, setPrintType] = useState(businessConfig.printerConfig?.printType || 'termico');
  const [zoom, setZoom] = useState(businessConfig.printerConfig?.zoom?.toString() || '100');
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>(
    businessConfig.printerConfig?.paperWidth || '80mm'
  );
  const [fontSize, setFontSize] = useState(businessConfig.printerConfig?.fontSize?.toString() || '14');
  const [lineHeight, setLineHeight] = useState(businessConfig.printerConfig?.lineHeight?.toString() || '1,45');
  const [showLogo, setShowLogo] = useState<boolean>(businessConfig.printerConfig?.showLogo ?? true);

  // Sensitive Ops & NIP
  const [editSentRounds, setEditSentRounds] = useState(
    businessConfig.sensitiveOps?.editSentRounds ?? false
  );
  const [cancelSameDaySales, setCancelSameDaySales] = useState(
    businessConfig.sensitiveOps?.cancelSameDaySales ?? true
  );
  const [requirePinForEditRounds, setRequirePinForEditRounds] = useState(
    businessConfig.sensitiveOps?.requirePinForEditRounds ?? false
  );
  const [requirePinForCancelSales, setRequirePinForCancelSales] = useState(
    businessConfig.sensitiveOps?.requirePinForCancelSales ?? false
  );
  const [authPin, setAuthPin] = useState(businessConfig.sensitiveOps?.authPin || '');
  const [newAuthPin, setNewAuthPin] = useState('');

  // Business Model
  const [selectedModel, setSelectedModel] = useState<string>(
    businessConfig.businessModel || 'restaurante'
  );

  // Branches & Cashiers
  const [branches, setBranches] = useState<Branch[]>(businessConfig.branches || []);
  const [cashierBoxes, setCashierBoxes] = useState<CashierBox[]>(businessConfig.cashierBoxes || []);

  // Modals
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');

  const [showCashierModal, setShowCashierModal] = useState(false);
  const [newCashierName, setNewCashierName] = useState('');
  const [newCashierBranch, setNewCashierBranch] = useState('');
  const [newCashierPin, setNewCashierPin] = useState('');

  // Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Clock for timezone text
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setCurrentTimeStr(d.toLocaleDateString('es-AR', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const colorPresets = [
    '#ea580c', // Orange
    '#dc2626', // Red
    '#d97706', // Amber/Gold
    '#16a34a', // Green
    '#0891b2', // Cyan
    '#2563eb', // Blue
    '#7c3aed', // Purple
    '#db2777', // Pink
    '#1e293b', // Dark Navy
  ];

  const businessModels = [
    {
      id: 'restaurante',
      name: 'Restaurante / cafetería',
      icon: Utensils,
      isDefault: true,
      desc: 'Toma pedidos desde el menú, entrega a domicilio o recolección en sucursal (flujo original).',
    },
    {
      id: 'muebleria',
      name: 'Mueblería',
      icon: Sofa,
      desc: 'Asesora sobre catálogo, medidas, materiales, tiempos y opciones de envío o recolección.',
    },
    {
      id: 'viajes',
      name: 'Agencia de viajes',
      icon: Plane,
      desc: 'Presenta paquetes, destinos y tours; recopila datos del viajero para cotizar y reservar.',
    },
    {
      id: 'oficina',
      name: 'Oficina / servicios profesionales',
      icon: Briefcase,
      desc: 'Consultoría, contable, legal, arquitectura. Explica servicios, honorarios y agenda citas.',
    },
    {
      id: 'serigrafia',
      name: 'Serigrafía / estampado',
      icon: Shirt,
      desc: 'Cotiza playeras, técnicas (serigrafía, DTF, vinil, sublimación), tirajes y tiempos.',
    },
    {
      id: 'carpinteria',
      name: 'Carpintería',
      icon: Hammer,
      desc: 'Muebles de línea y a la medida: maderas, acabados, tiempos y anticipos.',
    },
    {
      id: 'salud',
      name: 'Salud / clínica',
      icon: HeartPulse,
      desc: 'Explica servicios y especialidades, requisitos previos y agenda citas (sin diagnóstico).',
    },
    {
      id: 'dental',
      name: 'Consultorio dental',
      icon: Smile,
      desc: 'Tratamientos (limpieza, resinas, endodoncia, ortodoncia, implantes) y agenda de citas.',
    },
  ];

  // Save Handlers
  const handleSaveIdentity = () => {
    updateBusinessConfig({
      name: businessName,
      logoUrl: logoFile || '',
      brandColor,
    });
    showToast('Identidad del negocio guardada exitosamente');
  };

  const handleSaveHoursAndPayments = () => {
    updateBusinessConfig({
      address,
      scheduleText,
      currency,
      timezone,
      deliveryPayments,
      pickupPayments,
      integrateChatbotToPos,
    });
    showToast('Horarios, cuentas y medios de pago guardados');
  };

  const handleSaveBusinessModel = () => {
    updateBusinessConfig({
      businessModel: selectedModel,
    });
    showToast('Modelo de negocio actualizado');
  };

  const handleSaveTicketConfig = () => {
    updateBusinessConfig({
      printerConfig: {
        printType,
        zoom: parseInt(zoom, 10) || 100,
        paperWidth,
        fontSize: parseInt(fontSize, 10) || 14,
        lineHeight: parseFloat(lineHeight.replace(',', '.')) || 1.45,
        showLogo,
      },
      printerPaperSize: paperWidth,
    });
    showToast('Configuración de tickets guardada');
  };

  const handleSaveSensitiveOps = () => {
    const finalPin = newAuthPin.trim() ? newAuthPin.trim() : authPin;
    setAuthPin(finalPin);
    setNewAuthPin('');
    updateBusinessConfig({
      sensitiveOps: {
        editSentRounds,
        cancelSameDaySales,
        requirePinForEditRounds,
        requirePinForCancelSales,
        authPin: finalPin,
      },
    });
    showToast('Controles de operaciones sensibles guardados');
  };

  const handleAddBranch = () => {
    if (!newBranchName.trim()) return;
    const newB: Branch = {
      id: `br-${Date.now()}`,
      name: newBranchName.trim(),
      address: newBranchAddress.trim() || address,
      phone: newBranchPhone.trim(),
      isMain: branches.length === 0,
    };
    const updated = [...branches, newB];
    setBranches(updated);
    updateBusinessConfig({ branches: updated });
    setNewBranchName('');
    setNewBranchAddress('');
    setNewBranchPhone('');
    setShowBranchModal(false);
    showToast('Sucursal agregada');
  };

  const handleAddCashier = () => {
    if (!newCashierName.trim()) return;
    const newC: CashierBox = {
      id: `caj-${Date.now()}`,
      name: newCashierName.trim(),
      branchName: newCashierBranch || 'Sucursal Principal',
      pin: newCashierPin || '1234',
      link: `https://bruzzone128.pos/caja/${Date.now().toString().slice(-4)}`,
      active: true,
    };
    const updated = [...cashierBoxes, newC];
    setCashierBoxes(updated);
    updateBusinessConfig({ cashierBoxes: updated });
    setNewCashierName('');
    setNewCashierBranch('');
    setNewCashierPin('');
    setShowCashierModal(false);
    showToast('Cajero creado exitosamente');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setLogoFile(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // View switch for Subscriptions and Instructions
  if (type === 'suscripciones') {
    return (
      <div id="subscriptions-view" className="max-w-5xl mx-auto space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Suscripción & Plan</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Estado de la suscripción y módulos de Bruzzone Cloud</p>
          </div>
          <TopHeaderWidget />
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 space-y-5">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                ⭐
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Plan Bruzzone Pro Integral</h3>
                <p className="text-xs text-slate-500">Módulos ilimitados de POS, KDS de Cocina, WhatsApp Bot y Cortes de Caja</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ACTIVO
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-400 font-mono text-[10px] uppercase font-bold block">Sucursales</span>
              <span className="text-sm font-bold text-slate-800 font-mono">Ilimitadas</span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-400 font-mono text-[10px] uppercase font-bold block">Pantallas KDS</span>
              <span className="text-sm font-bold text-slate-800 font-mono">Hasta 8 Hornos</span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-400 font-mono text-[10px] uppercase font-bold block">Canal Chatbot</span>
              <span className="text-sm font-bold text-emerald-600 font-mono">Conectado 24/7</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'instrucciones') {
    return (
      <div id="instructions-view" className="max-w-5xl mx-auto space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manual de Uso</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Guía paso a paso para operar comandas, pedidos y caja</p>
          </div>
          <TopHeaderWidget />
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 space-y-4 text-xs text-slate-600">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Guía de Operación Rápida:</h2>
          <div className="space-y-3">
            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200/80 space-y-1">
              <h4 className="font-bold text-orange-700">1. Dashboard y Métricas en Tiempo Real</h4>
              <p className="text-slate-600">Visualiza ventas, pedidos del día, tickets promedio y los productos más vendidos con filtros por Día, Semana, Mes y Año.</p>
            </div>
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-1">
              <h4 className="font-bold text-emerald-700">2. Punto de Venta (POS) & Comandas</h4>
              <p className="text-slate-600">Permite armar pizzas mitad y mitad, seleccionar tamaño (chica, grande, gigante), agregar fainá/doble queso y calcular vueltos.</p>
            </div>
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-1">
              <h4 className="font-bold text-amber-700">3. Pantalla de Cocina (KDS)</h4>
              <p className="text-slate-600">Los maestros pizzeros reciben las comandas en tiempo real con temporizadores de urgencia para enviar al horno y despachar a tiempo.</p>
            </div>
            <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-200/80 space-y-1">
              <h4 className="font-bold text-sky-700">4. Mi Chatbot de WhatsApp</h4>
              <p className="text-slate-600">Haz clic en "Ver mi chatbot" para probar el simulador de pedidos automatizado donde los clientes ordenan pizzas y bebidas por chat.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: "Mi negocio" (Exact match for all 4 Screenshots)
  return (
    <div id="business-settings-view" className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Main Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mi negocio</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Identidad, branding y contacto</p>
        </div>

        <TopHeaderWidget />
      </div>

      {/* 2-Column Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Identidad, Sucursales, Cajeros, Modelo de negocio */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          {/* Card 1: Identidad del negocio */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 space-y-5">
            <div className="flex items-center gap-2 text-slate-800">
              <CreditCard className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold tracking-tight">Identidad del negocio</h2>
            </div>

            {/* Nombre del negocio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-slate-400" />
                Nombre del negocio
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Nombre de tu negocio (ej. Bruzzone128)"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
              <p className="text-[10px] text-slate-400">
                Este nombre aparece en la barra superior de la app, panel lateral, tickets y mensajes del chatbot.
              </p>
            </div>

            {/* Live Top Bar Preview */}
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                Vista previa en la barra superior:
              </span>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700/80">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xs overflow-hidden shrink-0">
                  {logoFile ? (
                    <img src={logoFile} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    '🍕'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-white truncate">{businessName || 'Bruzzone128'}</p>
                    <span className="text-[8px] px-1 py-0.2 rounded bg-orange-500/20 text-orange-400 font-mono font-semibold">
                      PANEL
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono">Identidad del negocio</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                  EN VIVO
                </span>
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                Logo
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/40 flex items-center justify-center text-orange-400 shrink-0 overflow-hidden">
                  {logoFile ? (
                    <img src={logoFile} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleLogoUpload}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-bold file:bg-white file:text-slate-700 hover:file:bg-slate-50 file:cursor-pointer cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    PNG, JPG o WebP. Máximo 8 MB. Se muestra en tu chatbot y panel.
                  </p>
                </div>
              </div>
            </div>

            {/* Color de tu marca */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <span>🎨</span> Color de tu marca
              </label>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {colorPresets.map((clr) => {
                  const isSelected = brandColor.toLowerCase() === clr.toLowerCase();
                  return (
                    <button
                      key={clr}
                      type="button"
                      onClick={() => setBrandColor(clr)}
                      style={{ backgroundColor: clr }}
                      className={`w-8 h-8 rounded-full transition-all cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-slate-900 ring-offset-2 scale-105 shadow-sm'
                          : 'hover:scale-105 opacity-90'
                      }`}
                    />
                  );
                })}

                {/* Custom Color Selector Box */}
                <div className="relative">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setBrandColor(e.target.value);
                    }}
                    className="opacity-0 absolute inset-0 w-8 h-8 cursor-pointer"
                  />
                  <div
                    style={{ backgroundColor: brandColor }}
                    className="w-8 h-8 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-xs font-bold text-white shadow-xs cursor-pointer"
                  >
                    +
                  </div>
                </div>
              </div>
            </div>

            {/* Save Identity Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveIdentity}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                Guardar Identidad
              </button>
            </div>
          </div>

          {/* Card 2: Sucursales */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Store className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold tracking-tight">Sucursales</h2>
              </div>

              <button
                type="button"
                onClick={() => setShowBranchModal(true)}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white shadow-sm flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Nueva sucursal
              </button>
            </div>

            {branches.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/40">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-700">Aún no hay sucursales</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Agrega la primera para pedidos de recogida.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{b.name}</span>
                        {b.isMain && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-700">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{b.address}</p>
                    </div>
                    <button
                      onClick={() => {
                        const updated = branches.filter((item) => item.id !== b.id);
                        setBranches(updated);
                        updateBusinessConfig({ branches: updated });
                        showToast('Sucursal eliminada');
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Cajeros y cajas */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Users className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold tracking-tight">Cajeros y cajas</h2>
              </div>

              <button
                type="button"
                onClick={() => setShowCashierModal(true)}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white shadow-sm flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Nuevo cajero
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Crea un cajero por sucursal y comparte su liga directa de caja para abrir el POS en esa sucursal.
            </p>

            {cashierBoxes.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/40">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-700">Aún no hay cajeros</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Crea un cajero por sucursal para abrir una caja dedicada con su propia liga.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {cashierBoxes.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{c.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700">
                          {c.branchName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">PIN: {c.pin}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(c.link || 'https://bruzzone128.pos/caja');
                          showToast('Liga directa de caja copiada');
                        }}
                        className="p-1.5 text-slate-500 hover:text-orange-600 bg-white border border-slate-200 rounded-lg text-xs flex items-center gap-1 transition"
                        title="Copiar liga"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const updated = cashierBoxes.filter((item) => item.id !== c.id);
                          setCashierBoxes(updated);
                          updateBusinessConfig({ cashierBoxes: updated });
                          showToast('Cajero eliminado');
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4: Modelo de negocio (Screenshot 3) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Store className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold tracking-tight">Modelo de negocio</h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Actual:{' '}
                <strong className="text-slate-700">
                  {businessModels.find((m) => m.id === selectedModel)?.name || 'Restaurante / cafetería'}
                </strong>
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Elige el giro que mejor describe tu negocio. Tu chatbot usará este contexto para atender a tus
              clientes de forma coherente (respuestas, sugerencias y guía de compra/cotización). El resto del panel
              — productos, punto de venta, clientes y pagos — funciona igual.
            </p>

            {/* 8 Business Model Cards in 2-col Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {businessModels.map((bm) => {
                const isSelected = selectedModel === bm.id;
                const IconComponent = bm.icon;
                return (
                  <div
                    key={bm.id}
                    onClick={() => setSelectedModel(bm.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-orange-500 ring-2 ring-orange-100 bg-orange-50/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              isSelected ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-800">{bm.name}</span>
                        </div>

                        {bm.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 shrink-0">
                            Por defecto <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-500 leading-relaxed">{bm.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Business Model Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveBusinessModel}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                Guardar modelo de negocio
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Horarios y Medios de pagos, Impresión de tickets */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          {/* Card 1: Horarios y Medios de pagos */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 space-y-5">
            <div className="flex items-center gap-2 text-slate-800">
              <MapPin className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold tracking-tight">Horarios y Medios de pagos</h2>
            </div>

            {/* Dirección */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Dirección
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dirección del local"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>

            {/* Horario */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Horario
              </label>
              <input
                type="text"
                value={scheduleText}
                onChange={(e) => setScheduleText(e.target.value)}
                placeholder="Lun-Dom · 12:00 — 22:00"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-mono"
              />
            </div>

            {/* Moneda */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-slate-400" />
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              >
                <option value="ARS">AR ARS — Peso argentino</option>
                <option value="USD">US USD — Dólar estadounidense</option>
                <option value="MXN">MX MXN — Peso mexicano</option>
                <option value="EUR">EU EUR — Euro</option>
                <option value="CLP">CL CLP — Peso chileno</option>
                <option value="COP">CO COP — Peso colombiano</option>
                <option value="PEN">PE PEN — Sol peruano</option>
                <option value="UYU">UY UYU — Peso uruguayo</option>
              </select>
            </div>

            {/* Zona horaria local */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Zona horaria local
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-orange-300 bg-orange-50/20 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-mono text-[11px]"
              >
                <option value="America/Argentina/Buenos_Aires">
                  Argentina · America/Argentina/Buenos_Aires
                </option>
                <option value="America/Mexico_City">México · America/Mexico_City</option>
                <option value="America/Bogota">Colombia · America/Bogota</option>
                <option value="America/Santiago">Chile · America/Santiago</option>
                <option value="Europe/Madrid">España · Europe/Madrid</option>
                <option value="America/New_York">EE.UU. · America/New_York</option>
              </select>
              <p className="text-[10px] text-slate-400">Hora local del negocio: {currentTimeStr}</p>
            </div>

            {/* Medios de pago en chatbot */}
            <div className="space-y-4 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                Medios de pago en chatbot
              </div>

              {/* Sub-block: Servicio a domicilio */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Bike className="w-3 h-3 text-orange-500" />
                  Servicio a domicilio
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      deliveryPayments.efectivo
                        ? 'border-orange-500 bg-orange-50/40 text-slate-800'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={deliveryPayments.efectivo}
                      onChange={(e) =>
                        setDeliveryPayments({ ...deliveryPayments, efectivo: e.target.checked })
                      }
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>💵 Efectivo</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      deliveryPayments.transferencia
                        ? 'border-orange-500 bg-orange-50/40 text-slate-800'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={deliveryPayments.transferencia}
                      onChange={(e) =>
                        setDeliveryPayments({ ...deliveryPayments, transferencia: e.target.checked })
                      }
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>🏛️ Transferencia</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      deliveryPayments.tarjeta
                        ? 'border-orange-500 bg-orange-50/40 text-slate-800'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={deliveryPayments.tarjeta}
                      onChange={(e) =>
                        setDeliveryPayments({ ...deliveryPayments, tarjeta: e.target.checked })
                      }
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>💳 Tarjeta</span>
                  </label>
                </div>
              </div>

              {/* Sub-block: Sucursal y modalidades personalizadas */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Store className="w-3 h-3 text-orange-500" />
                  Sucursal y modalidades personalizadas
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      pickupPayments.efectivo
                        ? 'border-orange-500 bg-orange-50/40 text-slate-800'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={pickupPayments.efectivo}
                      onChange={(e) =>
                        setPickupPayments({ ...pickupPayments, efectivo: e.target.checked })
                      }
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>💵 Efectivo</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      pickupPayments.transferencia
                        ? 'border-orange-500 bg-orange-50/40 text-slate-800'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={pickupPayments.transferencia}
                      onChange={(e) =>
                        setPickupPayments({ ...pickupPayments, transferencia: e.target.checked })
                      }
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>🏛️ Transferencia</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      pickupPayments.tarjeta
                        ? 'border-orange-500 bg-orange-50/40 text-slate-800'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={pickupPayments.tarjeta}
                      onChange={(e) =>
                        setPickupPayments({ ...pickupPayments, tarjeta: e.target.checked })
                      }
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>💳 Tarjeta</span>
                  </label>
                </div>
              </div>

              {/* Save Payments Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveHoursAndPayments}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar cuentas y medios de pago
                </button>
              </div>

              <p className="text-[10px] text-slate-400">
                Guarda aquí los cambios realizados en tus cuentas bancarias y métodos de pago. El chatbot mostrará
                solo estas opciones al cliente según el tipo de entrega que elija.
              </p>
            </div>

            {/* Integrar pedidos de chatbot al POS toggle */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-600 shrink-0 mt-0.5">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Integrar pedidos de chatbot al punto de venta
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Permite al cajero importar pedidos chatbot al ticket para cobrarlos y sumarlos al corte de caja.
                  </p>
                </div>
              </div>

              {/* Switch Toggle */}
              <button
                type="button"
                onClick={() => setIntegrateChatbotToPos(!integrateChatbotToPos)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                  integrateChatbotToPos ? 'bg-orange-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    integrateChatbotToPos ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Card 2: Impresión de tickets (Screenshot 3) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <Printer className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold tracking-tight">Impresión de tickets</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tipo de impresión */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  Tipo de impresión
                </label>
                <select
                  value={printType}
                  onChange={(e) => setPrintType(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                >
                  <option value="termico">Ticket térmico</option>
                  <option value="a4">Hoja A4 / Comanda estándar</option>
                  <option value="pdf">PDF Digital</option>
                </select>
              </div>

              {/* Zoom Bluetooth / móvil */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <span>🔍</span> Zoom Bluetooth / móvil
                </label>
                <input
                  type="number"
                  value={zoom}
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono"
                />
                <p className="text-[10px] text-slate-400">80% a 120%. 100% es el tamaño natural.</p>
              </div>

              {/* Ancho del ticket */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <span>📏</span> Ancho del ticket
                </label>
                <select
                  value={paperWidth}
                  onChange={(e) => setPaperWidth(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                >
                  <option value="80mm">80 mm</option>
                  <option value="58mm">58 mm</option>
                </select>
              </div>

              {/* Tamaño de letra */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <span className="font-serif">Aa</span> Tamaño de letra
                </label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono"
                />
              </div>

              {/* Interlineado */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <span>📐</span> Interlineado
                </label>
                <input
                  type="text"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono"
                />
              </div>

              {/* Mostrar logo en ticket */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  Mostrar logo en ticket
                </label>
                <select
                  value={showLogo ? 'si' : 'no'}
                  onChange={(e) => setShowLogo(e.target.value === 'si')}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                >
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {/* Save Ticket Config Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveTicketConfig}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                Guardar ticket
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL WIDTH BOTTOM CARD: Control de operaciones sensibles (Screenshot 4)   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
            <h2 className="text-sm font-bold tracking-tight">Control de operaciones sensibles</h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {authPin ? 'NIP configurado' : 'NIP no configurado'}
          </span>
        </div>

        <p className="text-[11px] text-slate-400">
          Define qué correcciones permite el POS y si requieren autorización.
        </p>

        {/* 2x2 Grid of Sensitive Operations Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Toggle 1: Editar productos de rondas enviadas */}
          <div className="p-4 rounded-2xl border border-slate-200/70 bg-white flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600 shrink-0 mt-0.5">
                <Edit2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Editar productos de rondas enviadas</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Permite corregir cantidades o eliminar productos antes de cobrar la mesa.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEditSentRounds(!editSentRounds)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                editSentRounds ? 'bg-orange-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  editSentRounds ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Cancelar ventas del mismo día */}
          <div className="p-4 rounded-2xl border border-slate-200/70 bg-white flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600 shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Cancelar ventas del mismo día</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Las ventas de días anteriores siempre quedan protegidas.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCancelSameDaySales(!cancelSameDaySales)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                cancelSameDaySales ? 'bg-orange-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  cancelSameDaySales ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Solicitar NIP al editar rondas */}
          <div className="p-4 rounded-2xl border border-slate-200/70 bg-white flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600 font-mono font-bold text-xs shrink-0 mt-0.5">
                |**
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Solicitar NIP al editar rondas</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Exige autorización para cada corrección.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRequirePinForEditRounds(!requirePinForEditRounds)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                requirePinForEditRounds ? 'bg-orange-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  requirePinForEditRounds ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 4: Solicitar NIP al cancelar ventas */}
          <div className="p-4 rounded-2xl border border-slate-200/70 bg-white flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600 font-mono font-bold text-xs shrink-0 mt-0.5">
                |**
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Solicitar NIP al cancelar ventas</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Exige autorización antes de devolver inventario y cancelar.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRequirePinForCancelSales(!requirePinForCancelSales)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                requirePinForCancelSales ? 'bg-orange-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  requirePinForCancelSales ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom PIN Input + Save Button Row */}
        <div className="pt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-md w-full space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Nuevo NIP de autorización
            </label>
            <input
              type="password"
              value={newAuthPin}
              onChange={(e) => setNewAuthPin(e.target.value)}
              placeholder="Dejar vacío para conservar el actual"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono"
            />
            <p className="text-[10px] text-slate-400">De 4 a 8 dígitos. Se almacena cifrado como hash.</p>
          </div>

          <button
            type="button"
            onClick={handleSaveSensitiveOps}
            className="px-6 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar controles
          </button>
        </div>
      </div>

      {/* Modal: Nueva Sucursal */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Store className="w-5 h-5 text-orange-500" /> Crear Nueva Sucursal
              </h3>
              <button
                onClick={() => setShowBranchModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de la Sucursal:</label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Ej: Sucursal Palermo"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dirección:</label>
                <input
                  type="text"
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  placeholder="Ej: Av. Santa Fe 3420"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono:</label>
                <input
                  type="text"
                  value={newBranchPhone}
                  onChange={(e) => setNewBranchPhone(e.target.value)}
                  placeholder="+54 9 11 ..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowBranchModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddBranch}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white shadow-md"
              >
                Guardar Sucursal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Cajero */}
      {showCashierModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" /> Crear Nuevo Cajero / Caja
              </h3>
              <button
                onClick={() => setShowCashierModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre del Cajero:</label>
                <input
                  type="text"
                  value={newCashierName}
                  onChange={(e) => setNewCashierName(e.target.value)}
                  placeholder="Ej: Caja 1 - Turno Noche"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Sucursal:</label>
                <input
                  type="text"
                  value={newCashierBranch}
                  onChange={(e) => setNewCashierBranch(e.target.value)}
                  placeholder="Ej: Sucursal Central"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">PIN de Acceso:</label>
                <input
                  type="password"
                  value={newCashierPin}
                  onChange={(e) => setNewCashierPin(e.target.value)}
                  placeholder="4 dígitos (ej: 1234)"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCashierModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCashier}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white shadow-md"
              >
                Crear Cajero
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
