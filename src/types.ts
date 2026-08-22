export type ProductCategory = 
  | 'pizzas_clasicas' 
  | 'pizzas_especiales' 
  | 'pizzas_gourmet' 
  | 'empanadas' 
  | 'bebidas' 
  | 'postres' 
  | 'promociones';

export interface PizzaSizeOption {
  id: string;
  name: string; // e.g. "Individual (4 porc.)", "Mediana (6 porc.)", "Grande (8 porc.)", "Familiar (10 porc.)"
  slices: number;
  priceMultiplier: number; // e.g. 1.0, 1.35, 1.65, 2.0
  isDefault?: boolean;
}

export interface CrustOption {
  id: string;
  name: string; // e.g. "A la piedra tradicional", "Masa madre crocante", "Borde relleno de muzzarella (+$$)"
  extraPrice: number;
}

export interface ExtraTopping {
  id: string;
  name: string;
  price: number;
  category?: 'quesos' | 'carnes' | 'vegetales' | 'salsas';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Base price for standard/medium size
  category: ProductCategory;
  imageUrl: string;
  isAvailable: boolean;
  isPopular?: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  isNew?: boolean;
  sizes?: PizzaSizeOption[];
  crusts?: CrustOption[];
  availableToppings?: ExtraTopping[];
  prepTimeMinutes?: number;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  basePrice: number;
  quantity: number;
  selectedSize?: PizzaSizeOption;
  selectedCrust?: CrustOption;
  selectedToppings: ExtraTopping[];
  notes?: string;
  itemTotal: number;
  imageUrl: string;
}

export type OrderStatus = 
  | 'pendiente'        // Nuevo pedido recibido
  | 'confirmado'       // Confirmado por la pizzería
  | 'en_horno'         // En preparación / cocción
  | 'en_camino'        // Salió en delivery
  | 'listo_retiro'     // Listo para retirar en local
  | 'entregado'        // Entregado con éxito
  | 'cancelado';       // Cancelado

export type PaymentMethod = 
  | 'efectivo' 
  | 'transferencia' 
  | 'mercadopago' 
  | 'tarjeta_delivery';

export type PaymentStatus = 
  | 'pendiente' 
  | 'comprobante_subido' 
  | 'verificado' 
  | 'pagado_en_entrega';

export type DeliveryType = 'delivery' | 'retiro' | 'salon';

export type TableStatus = 'libre' | 'ocupada' | 'cuenta_pedida' | 'reservada';

export interface RestaurantTable {
  id: string;
  number: number; // e.g. 1, 2, 3, 4, 10
  name: string; // e.g. "Mesa 1", "Mesa 2 - Ventana", "Barra 1", "Patio 3"
  capacity: number; // e.g. 2, 4, 6, 8 personas
  status: TableStatus;
  currentWaiterName?: string;
  activeOrderId?: string;
  dinersCount?: number;
  openedAt?: string;
}

export interface DeliveryAddress {
  id: string;
  tag: string; // e.g. "Casa", "Trabajo", "Depto Novia"
  street: string;
  number: string;
  apartment?: string;
  cornerOrNotes?: string;
  city?: string;
  isDefault?: boolean;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  savedAddresses: DeliveryAddress[];
  createdAt: string;
  notes?: string;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: number; // e.g. 1042
  createdAt: string;
  updatedAt: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  tableNumber?: number;
  tableName?: string;
  waiterName?: string;
  dinersCount?: number;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  discountCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cashAmountPaidWith?: number; // Con cuánto abona si es efectivo para calcular cambio
  transferProofUrl?: string; // Comprobante de transferencia
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  estimatedDeliveryTime?: string; // ISO or human string e.g. "35-45 min"
  driverName?: string;
  driverPhone?: string;
  orderNotes?: string;
}

export interface PizzeriaSettings {
  name: string;
  slogan: string;
  logoUrl?: string; // URL or Base64 uploaded logo
  phone: string;
  whatsapp: string;
  email?: string;
  cuit?: string; // Tax ID / RUT / CUIT
  instagram?: string;
  website?: string;
  address: string;
  city: string;
  googleMapsUrl?: string;
  isOpen: boolean;
  bannerMessage: string;
  footerText?: string;
  adminPin?: string; // Security PIN for Pizzeria Management System
  estimatedPrepTimeMinutes: number;
  estimatedDeliveryTimeMinutes: number;
  deliveryFeeBase: number;
  freeDeliveryOver: number;
  minimumOrderAmount: number;
  bankDetails: {
    walletProvider?: string; // e.g. "Mercado Pago", "Ualá", "Modo", "Banco Santander"
    alias: string;
    cbu: string;
    bankName: string;
    accountHolder: string;
    cuit: string;
    accountType?: string;
    paymentInstructions?: string;
    requireProof?: boolean;
  };
  mercadoPagoQrUrl?: string;
  acceptCash: boolean;
  acceptTransfer: boolean;
  acceptMercadoPago: boolean;
  acceptCardOnDelivery: boolean;
  cashDiscountPercent: number;
  openingHours: string;
}

export interface DailySalesReport {
  date: string;
  totalRevenue: number;
  ordersCount: number;
  completedOrders: number;
  cancelledOrders: number;
  averageTicket: number;
  revenueByPaymentMethod: Record<PaymentMethod, number>;
  ordersByDeliveryType: {
    delivery: number;
    retiro: number;
  };
  topSellingProducts: {
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  hourlyDistribution: {
    hour: string;
    orders: number;
    revenue: number;
  }[];
}
