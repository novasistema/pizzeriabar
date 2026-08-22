import React, { useState, useRef } from 'react';
import { 
  X, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Bike, 
  Store, 
  CreditCard, 
  Banknote, 
  Building2, 
  Smartphone, 
  Upload, 
  Check, 
  Copy, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  FileCheck,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  CartItem, 
  DeliveryType, 
  PizzeriaSettings, 
  CustomerUser, 
  DeliveryAddress, 
  PaymentMethod, 
  Order 
} from '../../types';
import { formatCurrency, buildWhatsAppOrderMessage } from '../../utils/formatters';
import { StorageService } from '../../services/storageService';
import { soundManager } from '../../utils/audio';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems?: CartItem[];
  items?: CartItem[];
  deliveryType?: DeliveryType;
  discountCode?: string;
  discountAmount?: number;
  settings: PizzeriaSettings;
  customer: CustomerUser;
  onOrderCreated?: (order: Order) => void;
  onOrderSuccess?: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  items,
  deliveryType: initialDeliveryType = 'delivery',
  discountCode = '',
  discountAmount = 0,
  settings,
  customer,
  onOrderCreated,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const currentCartItems = cartItems || items || [];
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(initialDeliveryType);

  // Form State
  const [customerName, setCustomerName] = useState<string>(customer.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(customer.phone || '');
  const [customerEmail, setCustomerEmail] = useState<string>(customer.email || '');
  
  // Address State
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    customer.savedAddresses && customer.savedAddresses.length > 0 ? customer.savedAddresses[0].id : 'custom'
  );
  const [street, setStreet] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [apartment, setApartment] = useState<string>('');
  const [cornerOrNotes, setCornerOrNotes] = useState<string>('');
  const [saveThisAddress, setSaveThisAddress] = useState<boolean>(true);
  const [newAddressTag, setNewAddressTag] = useState<string>('Casa');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [cashAmountPaidWith, setCashAmountPaidWith] = useState<string>('');
  const [transferProofUrl, setTransferProofUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const proofFileInputRef = useRef<HTMLInputElement>(null);

  // Order notes
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculations
  const subtotal = currentCartItems.reduce((acc, item) => acc + item.itemTotal, 0);
  const isFreeDelivery = deliveryType === 'retiro' || subtotal >= (settings.freeDeliveryOver || 999999);
  const deliveryFee = deliveryType === 'delivery' ? (isFreeDelivery ? 0 : (settings.deliveryFeeBase || 0)) : 0;
  
  // Extra cash discount if enabled
  const cashDiscount = paymentMethod === 'efectivo' && settings.cashDiscountPercent > 0
    ? Math.round(subtotal * (settings.cashDiscountPercent / 100))
    : 0;

  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount - cashDiscount);

  // Load address if user picked a saved address
  const activeSelectedAddress = customer.savedAddresses?.find(a => a.id === selectedAddressId);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Real or Mock Upload Proof
  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('El comprobante no debe superar los 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setTransferProofUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSimulateProofUpload = () => {
    const mockProofs = [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?auto=format&fit=crop&w=600&q=80',
    ];
    const picked = mockProofs[Math.floor(Math.random() * mockProofs.length)];
    setTransferProofUrl(picked);
  };

  const handleCreateOrder = () => {
    setIsSubmitting(true);

    let addressObj: DeliveryAddress | undefined = undefined;
    if (deliveryType === 'delivery') {
      if (selectedAddressId !== 'custom' && activeSelectedAddress) {
        addressObj = activeSelectedAddress;
      } else {
        addressObj = {
          id: `addr-${Date.now()}`,
          tag: newAddressTag,
          street: street.trim(),
          number: number.trim(),
          apartment: apartment.trim() || undefined,
          cornerOrNotes: cornerOrNotes.trim() || undefined,
          city: settings.city,
        };

        // If user wants to save this address to profile
        if (saveThisAddress && street.trim()) {
          const updatedCustomer: CustomerUser = {
            ...customer,
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            savedAddresses: [...customer.savedAddresses, addressObj],
          };
          StorageService.saveCustomer(updatedCustomer);
        }
      }
    }

    try {
      const created = StorageService.createOrder({
        customerId: customer.id,
        customerName: customerName.trim() || 'Cliente Web',
        customerPhone: customerPhone.trim() || settings.phone,
        customerEmail: customerEmail.trim() || undefined,
        deliveryType,
        deliveryAddress: addressObj,
        items: currentCartItems,
        subtotal,
        deliveryFee,
        discount: discountAmount + cashDiscount,
        discountCode: discountCode || (cashDiscount > 0 ? `EFECTIVO ${settings.cashDiscountPercent}%` : undefined),
        total: finalTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'transferencia' 
          ? (transferProofUrl ? 'comprobante_subido' : 'pendiente')
          : (paymentMethod === 'efectivo' || paymentMethod === 'tarjeta_delivery' ? 'pagado_en_entrega' : 'verificado'),
        cashAmountPaidWith: paymentMethod === 'efectivo' && cashAmountPaidWith ? parseFloat(cashAmountPaidWith) : undefined,
        transferProofUrl: transferProofUrl || undefined,
        status: 'pendiente',
        estimatedDeliveryTime: deliveryType === 'delivery' 
          ? `${settings.estimatedDeliveryTimeMinutes}-${settings.estimatedDeliveryTimeMinutes + 15} min` 
          : `${settings.estimatedPrepTimeMinutes} min`,
        orderNotes: orderNotes.trim() || undefined,
      });

      // Clear Cart from storage
      StorageService.clearCart();

      // Sound & Confetti
      soundManager.playNewOrderBell();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignore
      }

      setIsSubmitting(false);
      
      const callback = onOrderSuccess || onOrderCreated;
      if (typeof callback === 'function') {
        callback(created);
      }
      onClose();
    } catch (err: any) {
      console.error('Error creating order:', err);
      setIsSubmitting(false);
      setValidationError('Hubo un error al procesar el pedido. Por favor intente nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] sm:max-h-[92vh]">
        {/* Mobile Swipe / Drag indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-slate-50 dark:bg-slate-850 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-sm sm:text-base shrink-0">
              {currentStep}
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white font-serif">
                {currentStep === 1 && 'Datos de Contacto & Dirección'}
                {currentStep === 2 && 'Forma de Pago'}
                {currentStep === 3 && 'Confirmación del Pedido'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Paso {currentStep} de 3 • {deliveryType === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Local'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="grid grid-cols-3 gap-2 px-4 sm:px-6 pt-3 sm:pt-4 bg-slate-50 dark:bg-slate-850">
          <div className={`h-1.5 rounded-full ${currentStep >= 1 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
          <div className={`h-1.5 rounded-full ${currentStep >= 2 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
          <div className={`h-1.5 rounded-full ${currentStep === 3 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>{validationError}</span>
            <button onClick={() => setValidationError(null)} className="text-rose-500 hover:text-rose-800 p-1">
              ✕
            </button>
          </div>
        )}

        {/* Step Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-sm">
          {/* STEP 1: Datos Personales & Dirección */}
          {currentStep === 1 && (
            <div className="space-y-5">
              {/* Contact Inputs */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-500" />
                  <span>Tus Datos de Contacto</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej: Gonzalo Rodríguez"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Teléfono / WhatsApp * (para avisos)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej: +54 9 11 5544-3322"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Email (opcional para recibo)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Ej: gonzalo@email.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address if delivery type is delivery */}
              {deliveryType === 'delivery' ? (
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>Dirección de Entrega</span>
                  </h3>

                  {/* Saved Frequent Addresses picker */}
                  {customer.savedAddresses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 font-medium">Seleccionar dirección guardada:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {customer.savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-3 rounded-2xl border text-left transition flex items-start justify-between ${
                              selectedAddressId === addr.id
                                ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="space-y-1">
                              <span className="text-xs font-black uppercase tracking-wider bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 inline-block">
                                {addr.tag}
                              </span>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {addr.street} {addr.number} {addr.apartment && `(${addr.apartment})`}
                              </p>
                              {addr.cornerOrNotes && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {addr.cornerOrNotes}
                                </p>
                              )}
                            </div>
                            {selectedAddressId === addr.id && (
                              <Check className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
                            )}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAddressId('custom');
                            setStreet('');
                            setNumber('');
                            setApartment('');
                            setCornerOrNotes('');
                          }}
                          className={`p-3 rounded-2xl border border-dashed text-left transition flex items-center gap-2 ${
                            selectedAddressId === 'custom'
                              ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-600'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-xs font-bold">Ingresar otra dirección</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manual address inputs (if custom or no saved addresses) */}
                  {(selectedAddressId === 'custom' || customer.savedAddresses.length === 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Calle / Avenida *
                        </label>
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="Ej: Av. Santa Fe"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Altura / Número *
                        </label>
                        <input
                          type="text"
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          placeholder="Ej: 2840"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Piso / Depto / Timbre
                        </label>
                        <input
                          type="text"
                          value={apartment}
                          onChange={(e) => setApartment(e.target.value)}
                          placeholder="Ej: 4to B (Timbre: Rodríguez)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Entre calles / Referencias para el repartidor
                        </label>
                        <input
                          type="text"
                          value={cornerOrNotes}
                          onChange={(e) => setCornerOrNotes(e.target.value)}
                          placeholder="Ej: Entre Austria y Bustamante. Portón negro."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="sm:col-span-3 flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveThisAddress}
                            onChange={(e) => setSaveThisAddress(e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                          />
                          <span>Guardar en mis direcciones frecuentes como:</span>
                        </label>
                        <input
                          type="text"
                          value={newAddressTag}
                          onChange={(e) => setNewAddressTag(e.target.value)}
                          placeholder="Ej: Casa, Trabajo..."
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 w-28"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                  <Store className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-amber-950 dark:text-amber-200">
                      Retiro en Mostrador / Sucursal
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                      Podrás pasar a retirar tu pedido caliente y listo por nuestro local en <strong>{settings.address}, {settings.city}</strong> en ~{settings.estimatedPrepTimeMinutes} minutos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Método de Pago */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <span>Selecciona tu Forma de Pago</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Efectivo */}
                {settings.acceptCash && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`p-4 rounded-2xl border text-left transition ${
                      paymentMethod === 'efectivo'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                        <Banknote className="w-5 h-5" />
                      </div>
                      {settings.cashDiscountPercent > 0 && (
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          {settings.cashDiscountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Efectivo</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Pagas al recibir o retirar en el local.
                    </p>
                  </button>
                )}

                {/* 2. Transferencia Bancaria */}
                {settings.acceptTransfer && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transferencia')}
                    className={`p-4 rounded-2xl border text-left transition ${
                      paymentMethod === 'transferencia'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        AL INSTANTE
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Transferencia / CVU</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Por Alias o CBU con comprobante.
                    </p>
                  </button>
                )}

                {/* 3. Mercado Pago / QR */}
                {settings.acceptMercadoPago && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mercadopago')}
                    className={`p-4 rounded-2xl border text-left transition ${
                      paymentMethod === 'mercadopago'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Mercado Pago</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Dinero en cuenta, QR o tarjetas.
                    </p>
                  </button>
                )}

                {/* 4. Tarjeta al Delivery */}
                {settings.acceptCardOnDelivery && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tarjeta_delivery')}
                    className={`p-4 rounded-2xl border text-left transition ${
                      paymentMethod === 'tarjeta_delivery'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Posnet al Cadete</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Débito / Crédito en tu puerta.
                    </p>
                  </button>
                )}
              </div>

              {/* Dynamic details for chosen payment method */}
              {paymentMethod === 'efectivo' && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Total a abonar en efectivo:
                    </span>
                    <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ¿Con cuánto vas a pagar? (para llevarte el vuelto exacto)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        value={cashAmountPaidWith}
                        onChange={(e) => setCashAmountPaidWith(e.target.value)}
                        placeholder={`Ej: ${Math.ceil(finalTotal / 5000) * 5000}`}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                    {cashAmountPaidWith && parseFloat(cashAmountPaidWith) > finalTotal && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                        Tu cambio será de: <strong>{formatCurrency(parseFloat(cashAmountPaidWith) - finalTotal)}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'transferencia' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200 dark:border-blue-800/80 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-blue-900/60 pb-2.5">
                    <div>
                      <h4 className="font-extrabold text-xs text-blue-950 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Billetera Virtual & ALIAS de Pago</span>
                      </h4>
                      <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                        {settings.bankDetails.walletProvider || settings.bankDetails.bankName || 'Billetera Virtual'}
                      </p>
                    </div>
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-mono shadow-xs">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* ALIAS Card */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-500/70 shadow-xs flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                          ALIAS para Transferir
                        </span>
                        <span className="font-mono font-black text-sm sm:text-base text-slate-950 dark:text-white truncate block">
                          {settings.bankDetails.alias || 'SIN ALIAS'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(settings.bankDetails.alias, 'alias')}
                        className={`flex items-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl transition shadow-xs shrink-0 ${
                          copiedField === 'alias'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                        }`}
                      >
                        {copiedField === 'alias' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'alias' ? '¡Copiado!' : 'Copiar Alias'}</span>
                      </button>
                    </div>

                    {/* CBU / CVU Card */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">CBU / CVU</span>
                        <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 truncate block">
                          {settings.bankDetails.cbu}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(settings.bankDetails.cbu, 'cbu')}
                        className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-bold px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 transition shrink-0"
                      >
                        {copiedField === 'cbu' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'cbu' ? '¡Copiado!' : 'Copiar CBU'}</span>
                      </button>
                    </div>

                    {/* Account Details */}
                    <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                      <p><strong>Titular:</strong> {settings.bankDetails.accountHolder}</p>
                      <p><strong>Billetera / Banco:</strong> {settings.bankDetails.bankName || settings.bankDetails.walletProvider || 'Cuenta Virtual'} {settings.bankDetails.cuit ? `• CUIT: ${settings.bankDetails.cuit}` : ''}</p>
                    </div>

                    {/* Custom instructions from settings */}
                    {settings.bankDetails.paymentInstructions && (
                      <p className="text-[11px] text-blue-800 dark:text-blue-300 bg-white/70 dark:bg-slate-900/70 p-2 rounded-lg border border-blue-100 dark:border-blue-900/40">
                        💡 {settings.bankDetails.paymentInstructions}
                      </p>
                    )}
                  </div>

                  {/* Proof upload section */}
                  <div className="pt-2 border-t border-blue-200/70 dark:border-blue-900/70">
                    <label className="block text-xs font-bold text-blue-950 dark:text-blue-200 mb-1.5 flex items-center justify-between">
                      <span>Comprobante de Transferencia:</span>
                      <span className="text-[10px] text-blue-600 font-normal">Recomendado para agilizar</span>
                    </label>

                    <input
                      type="file"
                      ref={proofFileInputRef}
                      onChange={handleProofFileChange}
                      accept="image/*, application/pdf"
                      className="hidden"
                    />

                    {transferProofUrl ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold truncate">
                          <FileCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span className="truncate">¡Comprobante adjuntado con éxito!</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTransferProofUrl('')}
                          className="text-xs text-rose-500 hover:text-rose-700 font-bold ml-2 shrink-0"
                        >
                          Quitar / Cambiar
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => proofFileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-blue-400 dark:border-blue-700 bg-white dark:bg-slate-900 hover:bg-blue-50 text-blue-700 dark:text-blue-300 text-xs font-bold transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Adjuntar Comprobante (Foto/PDF)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSimulateProofUpload}
                          className="px-3 py-2 rounded-xl bg-blue-100 dark:bg-blue-950 hover:bg-blue-200 text-blue-800 dark:text-blue-300 text-[11px] font-bold transition"
                          title="Adjuntar comprobante de prueba rápido"
                        >
                          Simular Comprobante
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'mercadopago' && (
                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-center space-y-3">
                  <h4 className="font-bold text-xs text-sky-950 dark:text-sky-200">
                    Escanea el código QR de Mercado Pago con tu app:
                  </h4>
                  {settings.mercadoPagoQrUrl && (
                    <div className="inline-block p-2 bg-white rounded-2xl shadow-xs">
                      <img
                        src={settings.mercadoPagoQrUrl}
                        alt="QR Mercado Pago"
                        className="w-36 h-36 mx-auto rounded-lg"
                      />
                    </div>
                  )}
                  <p className="text-xs text-slate-500">
                    Monto a pagar: <strong className="text-slate-900 dark:text-white font-mono text-sm">{formatCurrency(finalTotal)}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Resumen Final & Confirmación */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Order Items Review */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Resumen de tu pedido ({cartItems.length} ítems)
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-44 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.cartItemId} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.quantity}x {item.productName}
                        </span>
                        {item.selectedSize && (
                          <span className="text-slate-500 block text-[11px]">
                            {item.selectedSize.name} {item.selectedCrust?.extraPrice ? `• ${item.selectedCrust.name}` : ''}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(item.itemTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Payment details summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Destino:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {deliveryType === 'delivery' 
                      ? `${activeSelectedAddress?.street || street} ${activeSelectedAddress?.number || number}`
                      : 'Retiro en Local'}
                  </p>
                  <p className="text-slate-500 text-[11px]">{customerName} ({customerPhone})</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pago:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 uppercase">
                    {paymentMethod}
                  </p>
                  <p className="text-emerald-600 font-bold text-sm font-mono mt-0.5">
                    Total: {formatCurrency(finalTotal)}
                  </p>
                </div>
              </div>

              {/* Special notes for the order */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  ¿Alguna aclaración extra para la entrega?
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ej: Tocar bocina, dejar con el portero, no llamar al timbre si duerme bebé..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Al confirmar, la pizzería recibirá tu comanda al instante y podrás seguir el estado en tiempo real.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div 
          className="p-3 sm:p-5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          {currentStep > 1 ? (
            <button
              onClick={() => {
                setValidationError(null);
                setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-3.5 py-2.5 text-xs text-slate-500 font-bold hover:text-slate-800"
            >
              Cancelar
            </button>
          )}

          {currentStep < 3 ? (
            <button
              onClick={() => {
                setValidationError(null);
                if (currentStep === 1) {
                  if (!customerName.trim() || !customerPhone.trim()) {
                    setValidationError('Por favor ingresa tu nombre y teléfono para avisos de entrega.');
                    return;
                  }
                  if (deliveryType === 'delivery' && selectedAddressId === 'custom' && (!street.trim() || !number.trim())) {
                    setValidationError('Por favor ingresa la calle y altura de tu dirección de entrega.');
                    return;
                  }
                }
                setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
              }}
              className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-amber-500/25 transition active:scale-98"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-confirm-final-order"
              onClick={handleCreateOrder}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-linear-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-amber-500/25 transition active:scale-98 truncate"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="truncate">{isSubmitting ? 'Enviando comanda...' : `Confirmar • ${formatCurrency(finalTotal)}`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
