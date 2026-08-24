export type TimeFilter = 'Día' | 'Semana' | 'Mes' | 'Año';

export type OrderStatus = 'pendiente' | 'en_cocina' | 'en_camino' | 'entregado' | 'cancelado';
export type OrderType = 'delivery' | 'retiro' | 'salon';
export type PaymentMethod = 'efectivo' | 'mercadopago' | 'tarjeta' | 'transferencia';

export interface PizzaCustomization {
  size: 'chica' | 'grande' | 'gigante'; // 4, 8, 12 porciones
  isHalfAndHalf?: boolean;
  secondFlavorId?: string;
  secondFlavorName?: string;
  extras?: string[]; // e.g. ["Doble Queso", "Fainá", "Aceitunas Rellenas"]
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: PizzaCustomization;
}

export interface Order {
  id: string;
  orderNumber: number;
  createdAt: string; // ISO string
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  type: OrderType;
  tableNumber?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  notes?: string;
  source: 'pos' | 'chatbot' | 'web' | 'telefono';
  cancellationReason?: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'pizzas' | 'empanadas' | 'bebidas' | 'postres' | 'combos' | 'agregados';
  description: string;
  price: number;
  cost: number;
  image?: string;
  isAvailable: boolean;
  popular?: boolean;
  ingredients?: { ingredientId: string; amount: number }[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  averageTicket?: number;
  favoriteCategory?: string;
  lastOrderDate?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: 'kg' | 'gr' | 'lt' | 'unidad';
  currentStock: number;
  minStock: number;
  costPerUnit: number;
  supplier: string;
}

export interface CashCut {
  id: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  cashSales: number;
  digitalSales: number;
  expenses: number;
  totalReal: number;
  totalExpected: number;
  difference: number;
  status: 'abierta' | 'cerrada';
  cashierName: string;
  notes?: string;
}

export interface EmployeeMetric {
  id: string;
  date: string;
  ordersCount: number;
  shiftHours: number;
  productivityScore: number; // 0 - 100
  commission: number;
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'pizzero' | 'repartidor' | 'cajero' | 'mozo' | 'encargado';
  phone: string;
  email?: string;
  avatar?: string;
  active: boolean;
  ordersProcessed: number;
  shiftHours: number;
  rating: number;
  productivityPercent?: number; // e.g. 94%
  commissionPerOrder?: number; // e.g. $250
  totalCommissions?: number;
  baseSalary?: number;
  metricsHistory?: EmployeeMetric[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  isMain?: boolean;
}

export interface CashierBox {
  id: string;
  name: string;
  branchId?: string;
  branchName?: string;
  pin?: string;
  link?: string;
  active: boolean;
}

export interface BusinessConfig {
  name: string;
  slug: string;
  address: string;
  phone: string;
  currency: string;
  taxPercent: number;
  deliveryFeeDefault: number;
  timezone: string;
  openTime: string;
  closeTime: string;
  scheduleText?: string;
  isStoreOpen: boolean;
  brandColor?: string;
  logoUrl?: string;

  // Sucursales y Cajeros
  branches?: Branch[];
  cashierBoxes?: CashierBox[];

  // Medios de Pago
  deliveryPayments?: {
    efectivo: boolean;
    transferencia: boolean;
    tarjeta: boolean;
  };
  pickupPayments?: {
    efectivo: boolean;
    transferencia: boolean;
    tarjeta: boolean;
  };

  // Datos de Transferencia / Alias de Pago
  paymentAlias?: string;
  cbuCvu?: string;
  bankName?: string;
  accountHolder?: string;
  cuitCuil?: string;
  transferInstructions?: string;

  // Modelo de negocio
  businessModel?: string;

  // Integración POS
  integrateChatbotToPos?: boolean;

  // Impresión de tickets
  printerConfig?: {
    printType: 'termico' | 'a4' | 'pdf';
    zoom: number;
    paperWidth: '80mm' | '58mm';
    fontSize: number;
    lineHeight: number;
    showLogo: boolean;
  };

  // Control de operaciones sensibles
  sensitiveOps?: {
    editSentRounds: boolean;
    cancelSameDaySales: boolean;
    requirePinForEditRounds: boolean;
    requirePinForCancelSales: boolean;
    authPin?: string;
  };

  printerPaperSize: '80mm' | '58mm';
  chatbotWelcomeMsg: string;
  chatbotActive: boolean;
}
