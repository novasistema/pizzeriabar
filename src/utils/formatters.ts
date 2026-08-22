import { OrderStatus, PaymentMethod, PaymentStatus, ProductCategory, Order, PizzeriaSettings } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount).replace('ARS', '$');
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export const CATEGORY_LABELS: Record<ProductCategory, { label: string; iconName: string; description: string }> = {
  pizzas_clasicas: {
    label: 'Rock Clásico • Lado A',
    iconName: 'Disc',
    description: 'Los grandes himnos de la masa madre: Led Zeppelin, Queen, The Beatles y clásicos eternos',
  },
  pizzas_especiales: {
    label: 'Hard Rock & Heavy • Lado B',
    iconName: 'Flame',
    description: 'Riffs intensos: Pepperoni picante AC/DC, Fugazzetas Deep Purple y sabores explosivos',
  },
  pizzas_gourmet: {
    label: 'Rock Psicodélico & Gourmet',
    iconName: 'Sparkles',
    description: 'Composiciones de autor: Jamón Serrano Pink Floyd, toques trufados y quesos de selección',
  },
  empanadas: {
    label: 'Empanadas Singles 7"',
    iconName: 'Utensils',
    description: 'Masa casera crocante cortada a cuchillo estilo Rolling Stones y Black Sabbath',
  },
  promociones: {
    label: 'Combos "Greatest Hits"',
    iconName: 'Radio',
    description: 'Boxsets para compartir entre amigos con pizzas grandes, empanadas y bebidas frías',
  },
  bebidas: {
    label: 'Backstage & Cervezas',
    iconName: 'GlassWater',
    description: 'Cervezas artesanales IPA Woodstock, Fernet con Coca y gaseosas heladas',
  },
  postres: {
    label: 'Encores & Solo Final',
    iconName: 'Cake',
    description: 'El cierre dulce legendario con Tiramisú Bohemian y Calzones rellenos de Nutella',
  },
};

export const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; stepIndex: number; icon: string }> = {
  pendiente: {
    label: 'Pendiente de Confirmación',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    stepIndex: 0,
    icon: 'Clock',
  },
  confirmado: {
    label: 'Pedido Confirmado',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    stepIndex: 1,
    icon: 'CheckCircle2',
  },
  en_horno: {
    label: 'En Cocina / Al Horno 🔥',
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-200 dark:border-orange-800',
    stepIndex: 2,
    icon: 'Flame',
  },
  en_camino: {
    label: 'En Camino / Delivery 🛵',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
    stepIndex: 3,
    icon: 'Bike',
  },
  listo_retiro: {
    label: 'Listo para Retirar 🍕',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    stepIndex: 3,
    icon: 'ShoppingBag',
  },
  entregado: {
    label: 'Entregado con Éxito 🎉',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    stepIndex: 4,
    icon: 'CheckCheck',
  },
  cancelado: {
    label: 'Cancelado',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
    stepIndex: -1,
    icon: 'XCircle',
  },
};

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: string; helper: string }> = {
  efectivo: {
    label: 'Efectivo',
    icon: 'Banknote',
    helper: 'Pagas al recibir o retirar (10% de descuento automático)',
  },
  transferencia: {
    label: 'Transferencia Bancaria / CVU',
    icon: 'Building2',
    helper: 'Transfiere por Alias o CBU y adjunta tu comprobante al instante',
  },
  mercadopago: {
    label: 'Mercado Pago / Dinero en cuenta o QR',
    icon: 'Smartphone',
    helper: 'Paga con dinero en cuenta, débito o crédito mediante QR / Link',
  },
  tarjeta_delivery: {
    label: 'Tarjeta con Posnet al Cadete',
    icon: 'CreditCard',
    helper: 'El repartidor lleva el posnet para cobrarte con débito o crédito',
  },
};

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  pendiente: {
    label: 'Pago Pendiente',
    color: 'text-amber-800',
    bg: 'bg-amber-100',
  },
  comprobante_subido: {
    label: 'Comprobante Adjunto (Verificar)',
    color: 'text-blue-800',
    bg: 'bg-blue-100',
  },
  verificado: {
    label: 'Pago Acreditado / Verificado ✓',
    color: 'text-emerald-800',
    bg: 'bg-emerald-100',
  },
  pagado_en_entrega: {
    label: 'Paga contra entrega',
    color: 'text-slate-800',
    bg: 'bg-slate-100',
  },
};

export function buildWhatsAppOrderMessage(order: Order, settings: PizzeriaSettings): string {
  const itemsText = order.items.map(item => {
    const sizeStr = item.selectedSize ? ` (${item.selectedSize.name})` : '';
    const crustStr = item.selectedCrust && item.selectedCrust.extraPrice > 0 ? ` + ${item.selectedCrust.name}` : '';
    const toppingsStr = item.selectedToppings.length > 0 ? ` + Extras: ${item.selectedToppings.map(t => t.name).join(', ')}` : '';
    const notesStr = item.notes ? ` [Nota: ${item.notes}]` : '';
    return `• ${item.quantity}x *${item.productName}*${sizeStr}${crustStr}${toppingsStr}${notesStr} - ${formatCurrency(item.itemTotal)}`;
  }).join('\n');

  let addressInfo = '';
  if (order.deliveryType === 'delivery') {
    const addr = order.deliveryAddress;
    addressInfo = `🛵 *DATOS DE ENVÍO:*\n📍 *Dirección:* ${addr?.street} ${addr?.number || ''} ${addr?.apartment ? `(Depto: ${addr.apartment})` : ''}\n🗺️ *Zona/Indicaciones:* ${addr?.cornerOrNotes || 'S/D'}\n`;
  } else {
    addressInfo = `🍕 *MODALIDAD:* Retiro por el local (${settings.address})\n`;
  }

  const paymentStr = PAYMENT_METHOD_CONFIG[order.paymentMethod]?.label || order.paymentMethod;
  const cashPayInfo = order.paymentMethod === 'efectivo' && order.cashAmountPaidWith
    ? ` (Abona con: ${formatCurrency(order.cashAmountPaidWith)} | Cambio: ${formatCurrency(Math.max(0, order.cashAmountPaidWith - order.total))})`
    : '';

  const message = `🍕 *NUEVO PEDIDO #${order.orderNumber} - ${settings.name}*
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${order.customerName}
📞 *Teléfono:* ${order.customerPhone}
${addressInfo}
📋 *DETALLE DEL PEDIDO:*
${itemsText}

💰 *Subtotal:* ${formatCurrency(order.subtotal)}
🛵 *Costo de Envío:* ${order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : '¡GRATIS!'}
${order.discount > 0 ? `🏷️ *Descuento (${order.discountCode || 'Promo'}):* -${formatCurrency(order.discount)}\n` : ''}💵 *TOTAL A PAGAR: ${formatCurrency(order.total)}*
💳 *Forma de Pago:* ${paymentStr}${cashPayInfo}
${order.orderNotes ? `📝 *Observaciones:* ${order.orderNotes}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
⏰ *Tiempo estimado:* ${order.estimatedDeliveryTime || '35-45 minutos'}
¡Muchas gracias por elegirnos! 🍕✨`;

  return encodeURIComponent(message);
}
