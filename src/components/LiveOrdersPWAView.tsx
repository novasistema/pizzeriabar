import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  ShoppingBag,
  Bell,
  BellOff,
  ExternalLink,
  Download,
  MoreVertical,
  Minus,
  Square,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Smartphone,
  Bike,
  Printer,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Laptop,
  Check,
  Flame,
  AlertCircle,
  Eye,
  Send,
  HelpCircle,
  FileText,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';

// Web Audio API custom pleasant POS order chime
const playPosChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic bell sequence
    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.35, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.55);
    });
  } catch (e) {
    console.warn('Audio chime notice:', e);
  }
};

export const LiveOrdersPWAView: React.FC = () => {
  const {
    orders,
    simulateChatbotOrder,
    updateOrderStatus,
    setSelectedOrderForReceipt,
    businessConfig,
  } = useApp();

  // Notifications & Sound
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationsGranted, setNotificationsGranted] = useState<boolean>(false);
  const [unreadOrderIds, setUnreadOrderIds] = useState<Set<string>>(new Set());
  const [lastOrderCount, setLastOrderCount] = useState<number>(orders.length);

  // Active simulated clients in chatbot
  const [activeClients, setActiveClients] = useState<
    { name: string; action: string; time: string; avatar: string }[]
  >([
    {
      name: 'Lucas Giannini',
      action: 'Escribiendo en WhatsApp... 💬',
      time: 'Hace 30 seg',
      avatar: '👨‍💼',
    },
    {
      name: 'Florencia Benítez',
      action: 'Viendo la carta de Pizzas 🍕',
      time: 'Hace 2 min',
      avatar: '👩',
    },
  ]);

  // Install PWA deferred prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // PWA beforeinstallprompt capture
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandaloneMode(true);
    }

    // Check notification permission
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsGranted(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Detect incoming new orders for audio alert
  useEffect(() => {
    if (orders.length > lastOrderCount) {
      const newOrders = orders.slice(0, orders.length - lastOrderCount);
      newOrders.forEach((o) => {
        setUnreadOrderIds((prev) => new Set([...prev, o.id]));
      });

      if (soundEnabled) {
        playPosChime();
      }

      if ('Notification' in window && Notification.permission === 'granted' && orders.length > 0) {
        const latest = orders[0];
        try {
          new Notification(`🍕 ¡Nuevo Pedido #${latest.orderNumber}!`, {
            body: `${latest.customerName} - Total: $${latest.total.toLocaleString('es-AR')}`,
            icon: '/manifest.json',
          });
        } catch {
          // ignore notification error in iframe
        }
      }
    }
    setLastOrderCount(orders.length);
  }, [orders, lastOrderCount, soundEnabled]);

  // Request browser desktop notifications
  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      showToast('Tu navegador no soporta notificaciones de escritorio');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsGranted(true);
        if (soundEnabled) playPosChime();
        showToast('¡Notificaciones en segundo plano y alertas sonoras activadas!');
        new Notification('🔔 ChatBotPro Bruzzone128', {
          body: 'Monitoreo de pedidos en vivo configurado y listo para recibir ventas.',
        });
      } else {
        showToast('Permiso de notificaciones rechazado por el navegador');
      }
    } catch {
      setNotificationsGranted(true);
      showToast('Alertas sonoras y visuales activadas');
    }
  };

  // Test Push trigger
  const handleTestPush = async () => {
    if (soundEnabled) playPosChime();

    // Create a new realistic WhatsApp chatbot order
    const fakeNames = [
      'Agustín Naveda',
      'Camila Rossi',
      'Gonzalo Montiel',
      'Carolina Fabbri',
      'Federico Romero',
    ];
    const fakePizzas = [
      'Fugazzeta Rellena Especial',
      'Muzzarella Clásica',
      'Napolitana con Ajo y Jamón',
      'Calabresa Porteña',
      'Especial Jamón y Morrones',
    ];
    const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
    const randomPizza = fakePizzas[Math.floor(Math.random() * fakePizzas.length)];

    const newOrder = await simulateChatbotOrder(randomName, randomPizza);
    setUnreadOrderIds((prev) => new Set([...prev, newOrder.id]));

    showToast(`🔔 Pedido de prueba #${newOrder.orderNumber} recibido desde WhatsApp`);

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`🍕 ¡Nuevo Pedido #${newOrder.orderNumber}!`, {
          body: `${newOrder.customerName}: ${randomPizza} ($${newOrder.total.toLocaleString('es-AR')})`,
        });
      } catch {
        // ignore
      }
    }
  };

  // Trigger PWA Installation
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('¡App instalada correctamente en tu PC!');
        setDeferredPrompt(null);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Toggle Fullscreen / Kiosk
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Open in dedicated popup window
  const openPopupWindow = () => {
    const width = 1200;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    window.open(
      window.location.href,
      'ChatBotProLiveOrders',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no`
    );
  };

  const markAsRead = (orderId: string) => {
    setUnreadOrderIds((prev) => {
      const next = new Set(prev);
      next.delete(orderId);
      return next;
    });
  };

  // Stats calculation
  const todayOrders = orders;
  const unreadCount = unreadOrderIds.size;
  const totalAccumulated = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div
      ref={containerRef}
      id="live-orders-pwa-view"
      className="flex flex-col min-h-[calc(100vh-6rem)] bg-[#0d121f] text-slate-100 rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl font-sans select-none"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-orange-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-orange-400 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          <Bell className="w-4 h-4 animate-bounce" />
          {toastMessage}
        </div>
      )}

      {/* TOP DESKTOP WINDOW TITLEBAR */}
      <div className="h-10 bg-[#161c2e] border-b border-slate-800/80 px-4 flex items-center justify-between text-xs text-slate-300">
        {/* Left: Window Title */}
        <div className="flex items-center gap-2 font-medium truncate">
          <span className="text-orange-400">🤖</span>
          <span className="font-semibold text-slate-200 truncate">
            ChatBotPro — Pedidos - {businessConfig.name || 'Bruzzone128'} - Pedidos en vivo
          </span>
        </div>

        {/* Right: Window Controls & Desktop Installer */}
        <div className="flex items-center gap-2">
          {/* Install on PC button */}
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 text-[11px] font-bold transition cursor-pointer"
            title="Instalar en la PC / Escritorio (PWA)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar en PC</span>
          </button>

          {/* More options */}
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition cursor-pointer"
            title="Guía de instalación y configuración"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700/60 mx-1" />

          {/* Window action icons */}
          <button
            onClick={() => showToast('Ventana de monitoreo activa')}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            title="Minimizar"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa / Kiosco'}
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (confirm('¿Cerrar el monitor de pedidos en vivo?')) {
                window.history.back();
              }
            }}
            className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SUB-HEADER BAR (Store Profile & Quick Tools) */}
      <div className="px-6 py-4 bg-[#0f1526] border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Magenta / Pink Store Icon */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 p-0.5 shadow-lg shadow-pink-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-[14px] bg-[#1a0f1d] flex items-center justify-center text-pink-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div>
            <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              {businessConfig.name || 'Bruzzone128'}
            </h1>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                En línea
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-[11px] font-mono">
                Sincronización en vivo activa
              </span>
            </div>
          </div>
        </div>

        {/* Sub-header actions on right */}
        <div className="flex items-center gap-3">
          {/* Sound alarm bell toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playPosChime();
              showToast(
                !soundEnabled
                  ? '🔔 Alarma sonora activada'
                  : '🔕 Alarma sonora silenciada'
              );
            }}
            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              soundEnabled
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Silenciar alarma' : 'Activar sonido de nuevos pedidos'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {soundEnabled ? 'Sonido ON' : 'Sonido OFF'}
            </span>
          </button>

          {/* Test order generator */}
          <button
            onClick={handleTestPush}
            className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Simular pedido entrante de WhatsApp"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">+ Simular Pedido</span>
          </button>

          {/* Popout window */}
          <button
            onClick={openPopupWindow}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Abrir en ventana independiente de escritorio"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STATS ROW (Navy with Purple Numbers) */}
      <div className="grid grid-cols-3 bg-[#11172a] border-b border-slate-800/80 divide-x divide-slate-800/80 text-center py-4 px-2">
        <div className="space-y-0.5">
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#c084fc] tracking-tight">
            {todayOrders.length}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            HOY
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#c084fc] tracking-tight flex items-center justify-center gap-1.5">
            {unreadCount}
            {unreadCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block"></span>
            )}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            SIN LEER
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#c084fc] tracking-tight">
            ${totalAccumulated.toLocaleString('es-AR')}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            ACUMULADO
          </div>
        </div>
      </div>

      {/* MAIN MONITORING BODY */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[#0d121f]">
        {/* SECTION 1: CLIENTES EN EL CHATBOT AHORA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase font-mono flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              CLIENTES EN EL CHATBOT AHORA
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              {activeClients.length > 0
                ? `${activeClients.length} interactuando`
                : '0 activos'}
            </span>
          </div>

          {activeClients.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#11172a]/60 border border-slate-800/60 text-slate-500 text-xs italic">
              Sin clientes activos en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeClients.map((c, idx) => (
                <div
                  key={idx}
                  className="bg-[#131b31] p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 animate-in fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-base">
                      {c.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{c.name}</p>
                      <p className="text-[11px] text-cyan-400 font-medium">{c.action}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                    {c.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: PEDIDOS RECIBIDOS HOY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase font-mono flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              PEDIDOS RECIBIDOS HOY
            </h2>
            {todayOrders.length > 0 && (
              <span className="text-[11px] font-mono text-slate-400">
                {todayOrders.length} pedidos registrados
              </span>
            )}
          </div>

          {todayOrders.length === 0 ? (
            /* Empty State matching screenshot */
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-center text-slate-600">
                <FileText className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">
                  Aquí aparecerán los pedidos al instante,
                </p>
                <p className="text-xs text-slate-500">como mensajes de texto.</p>
              </div>
              <button
                onClick={handleTestPush}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/40 transition cursor-pointer"
              >
                + Generar Pedido de Demostración
              </button>
            </div>
          ) : (
            /* Live Orders List (WhatsApp text message cards) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayOrders.map((ord) => {
                const isUnread = unreadOrderIds.has(ord.id);

                return (
                  <div
                    key={ord.id}
                    onClick={() => isUnread && markAsRead(ord.id)}
                    className={`rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 relative ${
                      isUnread
                        ? 'bg-[#151f38] border-orange-500/80 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/40'
                        : 'bg-[#12182b] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Unread badge */}
                    {isUnread && (
                      <span className="absolute -top-2.5 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-orange-500 text-white shadow-md animate-pulse">
                        NUEVO
                      </span>
                    )}

                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black font-mono text-white">
                            #{ord.orderNumber}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                              ord.source === 'chatbot'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-blue-950 text-blue-400 border border-blue-800'
                            }`}
                          >
                            {ord.source === 'chatbot' ? 'WHATSAPP' : 'POS'}
                          </span>
                        </div>

                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(ord.createdAt).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Customer info */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black text-white">{ord.customerName}</h3>
                          <a
                            href={`https://wa.me/${ord.customerPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                          >
                            <Phone className="w-3 h-3" />
                            {ord.customerPhone}
                          </a>
                        </div>
                        {ord.customerAddress && (
                          <p className="text-xs text-slate-400 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span>{ord.customerAddress}</span>
                          </p>
                        )}
                      </div>

                      {/* Items bubble */}
                      <div className="bg-[#0b0f19] p-3 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs">
                        <div className="text-[10px] uppercase font-mono font-bold text-slate-500">
                          Detalle del pedido:
                        </div>
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-slate-300">
                            <span>
                              <strong className="text-orange-400 font-mono font-bold">
                                {it.quantity}x
                              </strong>{' '}
                              {it.productName}
                              {it.customization?.size && (
                                <span className="text-[10px] text-slate-400 ml-1">
                                  ({it.customization.size})
                                </span>
                              )}
                            </span>
                            <span className="font-mono font-semibold text-slate-200">
                              ${it.totalPrice.toLocaleString('es-AR')}
                            </span>
                          </div>
                        ))}

                        {ord.notes && (
                          <div className="text-[11px] text-amber-300/90 pt-1.5 border-t border-slate-800 italic">
                            Nota: {ord.notes}
                          </div>
                        )}
                      </div>

                      {/* Total & Payment */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-400 font-mono">
                          Pago: <strong className="text-slate-200 uppercase">{ord.paymentMethod}</strong>
                        </span>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 mr-1.5">Total:</span>
                          <span className="text-base font-black font-mono text-emerald-400">
                            ${ord.total.toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrderForReceipt(ord)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Imprimir Comanda / Ticket"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {ord.status === 'pendiente' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'en_cocina')}
                          className="flex-1 py-2 rounded-xl font-bold text-xs bg-orange-600 hover:bg-orange-500 text-white transition shadow-sm cursor-pointer"
                        >
                          🍳 Aceptar a Cocina
                        </button>
                      )}

                      {ord.status === 'en_cocina' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'en_camino')}
                          className="flex-1 py-2 rounded-xl font-bold text-xs bg-violet-600 hover:bg-violet-500 text-white transition shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Bike className="w-3.5 h-3.5" /> Salir a Reparto
                        </button>
                      )}

                      {ord.status === 'en_camino' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'entregado')}
                          className="flex-1 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Entregado
                        </button>
                      )}

                      {ord.status === 'entregado' && (
                        <span className="flex-1 py-2 text-center text-xs font-bold font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-xl">
                          ✓ Finalizado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ORANGE BAR & PROBAR PUSH (Exact match to screenshot) */}
      <div className="bg-[#0f1424] p-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
        {/* Big Orange Center Action Button */}
        <button
          onClick={handleEnableNotifications}
          className="flex-1 w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
        >
          <Bell className="w-4 h-4 animate-bounce" />
          <span>
            {notificationsGranted
              ? '🔔 Notificaciones en segundo plano ACTIVADAS'
              : '🔔 Activar notificaciones en segundo plano'}
          </span>
        </button>

        {/* Probar push button (Black button on the right) */}
        <button
          onClick={handleTestPush}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#1e2538] hover:bg-[#28324a] text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition cursor-pointer active:scale-95 whitespace-nowrap shadow-md"
        >
          Probar push
        </button>
      </div>

      {/* MODAL: PWA DESKTOP INSTALLATION GUIDE */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111728] border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Instalar en la PC / Escritorio (PWA)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Aplicación nativa para Windows, macOS y Linux
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInstallModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Puedes instalar <strong>ChatBotPro & Bruzzone128</strong> directamente en tu
                computadora o celular para que funcione como un programa de escritorio
                independiente, con inicio rápido, pantalla completa y sonido en segundo plano.
              </p>

              {/* Steps for Chrome / Edge */}
              <div className="bg-[#0b0f19] p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="font-bold text-orange-400 flex items-center gap-1.5">
                  <Download className="w-4 h-4" /> Pasos para instalar en Google Chrome o Microsoft Edge:
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed font-medium">
                  <li>
                    Haz clic en el icono de <strong>Instalar (📥 o ➕)</strong> que aparece en la
                    barra de direcciones del navegador.
                  </li>
                  <li>
                    O abre el <strong>Menú (tres puntos ⋮)</strong> &gt;{' '}
                    <strong>Guardar y compartir / Instalar Bruzzone128</strong>.
                  </li>
                  <li>
                    Haz clic en <strong>&quot;Instalar&quot;</strong>. ¡Listo! Se creará un acceso directo en tu
                    escritorio y menú Inicio.
                  </li>
                </ol>
              </div>

              {/* Direct 1-click trigger if supported */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Instalar Ahora con 1 Clic
                </button>
              )}

              {/* Standalone window fallback */}
              <button
                onClick={() => {
                  setIsInstallModalOpen(false);
                  openPopupWindow();
                }}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir en Ventana Independiente de Escritorio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
