import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Bike, 
  Store, 
  Tag, 
  ShoppingBag, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  Check
} from 'lucide-react';
import { CartItem, DeliveryType, PizzeriaSettings } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems?: CartItem[];
  items?: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  deliveryType?: DeliveryType;
  setDeliveryType?: (type: DeliveryType) => void;
  settings: PizzeriaSettings;
  discountCode?: string;
  setDiscountCode?: (code: string) => void;
  discountAmount?: number;
  onApplyCoupon?: (code: string) => { success: boolean; message: string };
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  deliveryType: externalDeliveryType,
  setDeliveryType: externalSetDeliveryType,
  settings,
  discountCode = '',
  setDiscountCode,
  discountAmount = 0,
  onApplyCoupon,
  onProceedToCheckout,
}) => {
  const currentCartItems = cartItems || items || [];
  const [internalDeliveryType, setInternalDeliveryType] = useState<DeliveryType>('delivery');
  const deliveryType = externalDeliveryType || internalDeliveryType;
  const setDeliveryType = externalSetDeliveryType || setInternalDeliveryType;

  const [couponInput, setCouponInput] = useState<string>(discountCode);
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const subtotal = currentCartItems.reduce((acc, item) => acc + item.itemTotal, 0);
  const isFreeDelivery = deliveryType === 'retiro' || subtotal >= (settings?.freeDeliveryOver || 999999);
  const deliveryFee = deliveryType === 'delivery' ? (isFreeDelivery ? 0 : (settings?.deliveryFeeBase || 0)) : 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount);
  const isBelowMinimum = subtotal > 0 && subtotal < (settings?.minimumOrderAmount || 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (onApplyCoupon) {
      const result = onApplyCoupon(couponInput.trim().toUpperCase());
      setCouponFeedback(result);
    } else {
      if (setDiscountCode) setDiscountCode(couponInput.trim().toUpperCase());
      setCouponFeedback({ success: true, message: 'Código aplicado' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white font-serif">
                Tu Pedido
              </h2>
              <p className="text-xs text-slate-500">
                {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} seleccionados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Vaciar carrito"
              >
                Vaciar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modalidad de entrega Switcher */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <button
              onClick={() => setDeliveryType('delivery')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition ${
                deliveryType === 'delivery'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Envío a Domicilio</span>
            </button>
            <button
              onClick={() => setDeliveryType('retiro')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition ${
                deliveryType === 'retiro'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Retiro en Local</span>
            </button>
          </div>

          {deliveryType === 'delivery' && (
            <div className="mt-2.5 text-center">
              {subtotal < settings.freeDeliveryOver ? (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  ¡Agrega <strong>{formatCurrency(settings.freeDeliveryOver - subtotal)}</strong> más para tener <strong>Envío Gratis</strong>!
                </p>
              ) : (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> ¡Calificas para Envío Gratis!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">Tu carrito está vacío</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explora nuestra carta y elige tus pizzas o empanadas favoritas para comenzar.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
              >
                Ver carta
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.cartItemId} className="pt-3 first:pt-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="space-y-0.5 flex-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {item.productName}
                      </h4>
                      {item.selectedSize && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Tamaño: {item.selectedSize.name}
                        </p>
                      )}
                      {item.selectedCrust && item.selectedCrust.extraPrice > 0 && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400">
                          + {item.selectedCrust.name}
                        </p>
                      )}
                      {item.selectedToppings.length > 0 && (
                        <p className="text-[11px] text-slate-500">
                          Extras: {item.selectedToppings.map(t => t.name).join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[11px] text-slate-400 italic">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.cartItemId)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Eliminar ítem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantity and Price */}
                <div className="flex items-center justify-between pl-17">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                      className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center font-black text-xs text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                      className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                    {formatCurrency(item.itemTotal)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Discounts, Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 space-y-3">
            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Cupón de descuento (ej: BIENVENIDO)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs uppercase font-bold tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
              >
                Aplicar
              </button>
            </form>

            {couponFeedback && (
              <p className={`text-[11px] font-semibold flex items-center gap-1 ${
                couponFeedback.success ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {couponFeedback.success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {couponFeedback.message}
              </p>
            )}

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
              <div className="flex justify-between">
                <span>Subtotal productos</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de envío ({deliveryType === 'delivery' ? 'Delivery express' : 'Retiro en local'})</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {deliveryFee > 0 ? formatCurrency(deliveryFee) : <span className="text-emerald-600 font-bold">¡GRATIS!</span>}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Descuento ({discountCode})</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total a pagar</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono text-lg">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Minimum order notice */}
            {isBelowMinimum && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>El pedido mínimo es de {formatCurrency(settings.minimumOrderAmount)}. Te faltan {formatCurrency(settings.minimumOrderAmount - subtotal)}.</span>
              </div>
            )}

            {/* Checkout CTA */}
            <button
              id="btn-proceed-checkout"
              onClick={onProceedToCheckout}
              disabled={isBelowMinimum || !settings.isOpen}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/25 transition active:scale-98 text-sm"
            >
              <span>{settings.isOpen ? 'Continuar al Pago y Envío' : 'Pizzería Cerrada Actualmente'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
