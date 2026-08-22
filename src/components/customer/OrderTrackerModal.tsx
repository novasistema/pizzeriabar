import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Flame, 
  Bike, 
  CheckCircle2, 
  ShoppingBag, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Printer, 
  AlertCircle,
  Sparkles,
  Store,
  CreditCard,
  Copy,
  Check,
  Upload,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { Order, PizzeriaSettings } from '../../types';
import { 
  formatCurrency, 
  formatDateTime, 
  STATUS_CONFIG, 
  PAYMENT_METHOD_CONFIG, 
  PAYMENT_STATUS_CONFIG,
  buildWhatsAppOrderMessage 
} from '../../utils/formatters';
import { StorageService } from '../../services/storageService';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  settings: PizzeriaSettings;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  order,
  settings,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(order);

  React.useEffect(() => {
    if (order) {
      setCurrentOrder(order);
    }
  }, [order]);

  const activeOrder = currentOrder || order;

  if (!isOpen || !activeOrder) return null;

  const currentStatusConfig = STATUS_CONFIG[activeOrder.status] || STATUS_CONFIG['pendiente'];
  const paymentMethodInfo = PAYMENT_METHOD_CONFIG[activeOrder.paymentMethod] || { label: activeOrder.paymentMethod, icon: CreditCard };
  const paymentStatusInfo = PAYMENT_STATUS_CONFIG[activeOrder.paymentStatus] || { label: activeOrder.paymentStatus, bg: 'bg-slate-100', color: 'text-slate-700' };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleUploadProofInTracker = () => {
    const mockProof = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';
    StorageService.updateOrderPaymentStatus(activeOrder.id, 'comprobante_subido', mockProof);
    setCurrentOrder(prev => prev ? ({
      ...prev,
      paymentStatus: 'comprobante_subido',
      transferProofUrl: mockProof
    }) : null);
  };

  // Steps definition for the tracking pipeline
  const steps = [
    { key: 'pendiente', label: 'Recibido', desc: 'Comanda ingresada al sistema', icon: Clock },
    { key: 'confirmado', label: 'Confirmado', desc: 'Aceptado por la pizzería', icon: CheckCircle2 },
    { key: 'en_horno', label: 'En Horno', desc: 'Masa y cocción a 450°C', icon: Flame },
    { 
      key: activeOrder.deliveryType === 'delivery' ? 'en_camino' : 'listo_retiro', 
      label: activeOrder.deliveryType === 'delivery' ? 'En Camino' : 'Listo para Retiro', 
      desc: activeOrder.deliveryType === 'delivery' ? 'Cadete en viaje' : 'Listo en mostrador', 
      icon: activeOrder.deliveryType === 'delivery' ? Bike : Store 
    },
    { key: 'entregado', label: 'Entregado', desc: '¡A disfrutar tu pizza!', icon: Sparkles },
  ];

  const getStepStatus = (_stepKey: string, index: number) => {
    if (activeOrder.status === 'cancelado') return 'cancelled';
    const activeIndex = currentStatusConfig.stepIndex ?? 0;
    if (index < activeIndex) return 'completed';
    if (index === activeIndex) return 'current';
    return 'upcoming';
  };

  const whatsappUrl = `https://wa.me/${(settings?.whatsapp || '').replace(/\D/g, '')}?text=${buildWhatsAppOrderMessage(activeOrder, settings)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] sm:max-h-[92vh]">
        {/* Mobile Swipe / Drag indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-slate-900 flex justify-center">
          <div className="w-12 h-1.5 bg-white/30 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                Pedido #{activeOrder.orderNumber}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400">
                {formatDateTime(activeOrder.createdAt)}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black font-serif">
              Seguimiento en Vivo
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout Banner */}
        <div className={`p-4 border-b ${currentStatusConfig.bg} ${currentStatusConfig.border} flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 shadow-xs flex items-center justify-center">
              {activeOrder.status === 'en_horno' && <Flame className="w-6 h-6 text-orange-500 animate-bounce" />}
              {activeOrder.status === 'en_camino' && <Bike className="w-6 h-6 text-purple-600 animate-pulse" />}
              {activeOrder.status === 'listo_retiro' && <Store className="w-6 h-6 text-emerald-600 animate-pulse" />}
              {activeOrder.status === 'pendiente' && <Clock className="w-6 h-6 text-amber-500" />}
              {activeOrder.status === 'confirmado' && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
              {activeOrder.status === 'entregado' && <Sparkles className="w-6 h-6 text-emerald-500" />}
              {activeOrder.status === 'cancelado' && <AlertCircle className="w-6 h-6 text-rose-500" />}
            </div>
            <div>
              <p className={`font-black text-sm sm:text-base ${currentStatusConfig.color}`}>
                {currentStatusConfig.label}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {activeOrder.status === 'en_camino' && activeOrder.driverName
                  ? `Cadete: ${activeOrder.driverName} • Tiempo estimado: ${activeOrder.estimatedDeliveryTime || '15 min'}`
                  : `Tiempo estimado: ${activeOrder.estimatedDeliveryTime || '30-40 min'}`}
              </p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Avisar por WhatsApp</span>
          </a>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-sm">
          {/* Visual Tracking Stepper */}
          {activeOrder.status !== 'cancelado' && (
            <div className="py-2">
              <div className="relative flex items-center justify-between">
                {/* Horizontal track line */}
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 z-0"></div>

                {steps.map((step, idx) => {
                  const state = getStepStatus(step.key, idx);
                  const Icon = step.icon;

                  let circleClasses = 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-slate-800 dark:border-slate-700';
                  if (state === 'completed') {
                    circleClasses = 'bg-emerald-500 text-white border-emerald-500 shadow-sm';
                  } else if (state === 'current') {
                    circleClasses = 'bg-amber-500 text-white border-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/60 shadow-md';
                  }

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center group">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 font-bold transition-all ${circleClasses}`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className={`text-[10px] sm:text-xs font-bold mt-2 text-center whitespace-nowrap ${
                        state === 'current' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Virtual Wallet / ALIAS payment banner for Transfer orders */}
          {(activeOrder.paymentMethod === 'transferencia' || activeOrder.paymentMethod === 'mercadopago') && (
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              activeOrder.paymentStatus === 'verificado'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                : 'bg-linear-to-r from-blue-50 to-amber-50 dark:from-slate-850 dark:to-slate-900 border-blue-200 dark:border-slate-700'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeOrder.paymentStatus === 'verificado'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {activeOrder.paymentStatus === 'verificado' ? <Check className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      {activeOrder.paymentStatus === 'verificado'
                        ? '¡Pago Acreditado & Verificado!'
                        : 'Pago por Billetera Virtual / Transferencia'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {activeOrder.paymentStatus === 'verificado'
                        ? 'Tu pago ya fue registrado y verificado por la administración.'
                        : 'Transfiere el total exacto usando el ALIAS a continuación:'}
                    </p>
                  </div>
                </div>

                <span className={`text-xs font-black px-2.5 py-1 rounded-full self-start sm:self-auto ${
                  activeOrder.paymentStatus === 'verificado'
                    ? 'bg-emerald-500 text-white'
                    : activeOrder.paymentStatus === 'comprobante_subido'
                    ? 'bg-blue-500 text-white'
                    : 'bg-amber-500 text-white animate-pulse'
                }`}>
                  {activeOrder.paymentStatus === 'verificado'
                    ? '✓ Pago Confirmado'
                    : activeOrder.paymentStatus === 'comprobante_subido'
                    ? '📸 Comprobante en Revisión'
                    : '⏳ Pago Pendiente'}
                </span>
              </div>

              {activeOrder.paymentStatus !== 'verificado' && (
                <div className="pt-3 space-y-2.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* ALIAS Box */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-500/70 shadow-xs flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">ALIAS OFICIAL</span>
                        <span className="font-mono font-black text-sm text-slate-950 dark:text-white truncate block">
                          {settings.bankDetails.alias}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(settings.bankDetails.alias, 'tracker_alias')}
                        className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition shadow-xs shrink-0 ${
                          copiedField === 'tracker_alias'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                      >
                        {copiedField === 'tracker_alias' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'tracker_alias' ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>

                    {/* CBU / CVU Box */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">CBU / CVU</span>
                        <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 truncate block">
                          {settings.bankDetails.cbu}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(settings.bankDetails.cbu, 'tracker_cbu')}
                        className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-bold px-2 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 transition shrink-0"
                      >
                        {copiedField === 'tracker_cbu' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'tracker_cbu' ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                    <p>
                      <strong>Titular:</strong> {settings.bankDetails.accountHolder} ({settings.bankDetails.walletProvider || settings.bankDetails.bankName})
                    </p>
                    <p className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                      Total a transferir: {formatCurrency(activeOrder.total)}
                    </p>
                  </div>

                  {/* Upload receipt button if not uploaded */}
                  {!activeOrder.transferProofUrl && (
                    <div className="pt-2 flex items-center justify-between gap-2 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        ¿Ya transferiste? Adjunta el comprobante para que cocina lo prepare más rápido:
                      </span>
                      <button
                        type="button"
                        onClick={handleUploadProofInTracker}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Comprobante</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Delivery or Pickup Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Delivery address info */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>{activeOrder.deliveryType === 'delivery' ? 'Dirección de Entrega' : 'Retiro en Sucursal'}</span>
              </div>
              {activeOrder.deliveryType === 'delivery' && activeOrder.deliveryAddress ? (
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {activeOrder.deliveryAddress.street} {activeOrder.deliveryAddress.number} {activeOrder.deliveryAddress.apartment && `(${activeOrder.deliveryAddress.apartment})`}
                  </p>
                  {activeOrder.deliveryAddress.cornerOrNotes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {activeOrder.deliveryAddress.cornerOrNotes}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Cliente: {activeOrder.customerName} • {activeOrder.customerPhone}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {settings.address}, {settings.city}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Horario: {settings.openingHours}
                  </p>
                </div>
              )}
            </div>

            {/* Payment status info */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Forma & Estado de Pago
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${paymentStatusInfo.bg} ${paymentStatusInfo.color}`}>
                  {paymentStatusInfo.label}
                </span>
              </div>
              <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>{paymentMethodInfo.label}</span>
              </p>
              <p className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                Total: {formatCurrency(activeOrder.total)}
              </p>
            </div>
          </div>

          {/* Assigned Driver details (if in delivery) */}
          {activeOrder.driverName && (
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300">
                    Repartidor Asignado
                  </span>
                  <p className="font-bold text-sm text-purple-950 dark:text-purple-100">
                    {activeOrder.driverName}
                  </p>
                </div>
              </div>

              {activeOrder.driverPhone && (
                <a
                  href={`tel:${activeOrder.driverPhone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-purple-900 border border-purple-200 text-purple-700 dark:text-purple-200 text-xs font-bold shadow-xs hover:bg-purple-100"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Llamar al Cadete</span>
                </a>
              )}
            </div>
          )}

          {/* Itemized Order Breakdown */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>Detalle de Artículos</span>
            </h4>

            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {activeOrder.items.map((item) => (
                <div key={item.cartItemId} className="p-3 sm:p-4 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.quantity}x {item.productName}
                    </p>
                    {item.selectedSize && (
                      <p className="text-slate-500 dark:text-slate-400">
                        {item.selectedSize.name} {item.selectedCrust?.extraPrice ? `• ${item.selectedCrust.name}` : ''}
                      </p>
                    )}
                    {item.selectedToppings.length > 0 && (
                      <p className="text-slate-400">
                        Extras: {item.selectedToppings.map(t => t.name).join(', ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-slate-400 italic">"{item.notes}"</p>
                    )}
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {formatCurrency(item.itemTotal)}
                  </span>
                </div>
              ))}

              {/* Price summary row */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(activeOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className="font-mono">{activeOrder.deliveryFee > 0 ? formatCurrency(activeOrder.deliveryFee) : 'Gratis'}</span>
                </div>
                {activeOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Descuento ({activeOrder.discountCode || 'Promo'})</span>
                    <span className="font-mono">-{formatCurrency(activeOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Pagado / A Pagar</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono text-base">{formatCurrency(activeOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir Comprobante</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
