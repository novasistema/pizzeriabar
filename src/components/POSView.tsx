import React, { useState } from 'react';
import {
  Store,
  Wallet,
  TrendingUp,
  Banknote,
  CreditCard,
  QrCode,
  ArrowLeftRight,
  Ban,
  Calculator,
  Utensils,
  ClipboardList,
  Lock,
  Unlock,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Search,
  Pizza,
  ShoppingBag,
  Bike,
  Receipt,
  User,
  Phone,
  MapPin,
  Sparkles,
  Info,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, OrderItem, OrderType, PaymentMethod, PizzaCustomization } from '../types';
import { TopHeaderWidget } from './TopHeaderWidget';

export const POSView: React.FC = () => {
  const {
    products,
    orders,
    addOrder,
    businessConfig,
    setSelectedOrderForReceipt,
  } = useApp();

  // Shift & Cash Register State
  const [isCashRegisterOpen, setIsCashRegisterOpen] = useState<boolean>(true);
  const [initialCash, setInitialCash] = useState<number>(15000);
  const [initialNote, setInitialNote] = useState<string>('Caja turno mañana');
  const [activeSubTab, setActiveSubTab] = useState<'pos' | 'mesas' | 'historial' | 'operaciones' | 'cierre'>('pos');
  const [catalogSort, setCatalogSort] = useState<'vendidos' | 'alfabetico' | 'precio'>('vendidos');

  // POS catalog & filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Cart & Checkout
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [tableNumber, setTableNumber] = useState<string>('Mesa 1');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Pizza Customization Modal
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [customSize, setCustomSize] = useState<'chica' | 'grande' | 'gigante'>('grande');
  const [isHalfAndHalf, setIsHalfAndHalf] = useState(false);
  const [secondFlavor, setSecondFlavor] = useState<string>('');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState<string>('');

  // Cash Operations (Ingreso / Retiro)
  const [cashMovements, setCashMovements] = useState<Array<{ id: string; type: 'ingreso' | 'retiro'; amount: number; reason: string; time: string }>>([]);
  const [movType, setMovType] = useState<'ingreso' | 'retiro'>('ingreso');
  const [movAmount, setMovAmount] = useState<string>('');
  const [movReason, setMovReason] = useState<string>('');

  // Calculate Metrics
  const shiftOrders = orders.filter((o) => o.status !== 'cancelado');
  const totalShiftSales = shiftOrders.reduce((sum, o) => sum + o.total, 0);
  const cashSales = shiftOrders.filter((o) => o.paymentMethod === 'efectivo').reduce((sum, o) => sum + o.total, 0);
  const cardSales = shiftOrders.filter((o) => o.paymentMethod === 'tarjeta').reduce((sum, o) => sum + o.total, 0);
  const transferSales = shiftOrders.filter((o) => o.paymentMethod === 'mercadopago').reduce((sum, o) => sum + o.total, 0);
  const cancelledSales = orders.filter((o) => o.status === 'cancelado').reduce((sum, o) => sum + o.total, 0);
  const netMovements = cashMovements.reduce((sum, m) => sum + (m.type === 'ingreso' ? m.amount : -m.amount), 0);
  const expectedCash = isCashRegisterOpen ? initialCash + cashSales + netMovements : 0;

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'pizzas', label: '🍕 Pizzas' },
    { id: 'empanadas', label: '🥟 Empanadas' },
    { id: 'agregados', label: '🧀 Fainá y Extras' },
    { id: 'bebidas', label: '🥤 Bebidas' },
    { id: 'postres', label: '🍨 Postres' },
  ];

  const filteredProducts = products
    .filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch && p.isAvailable;
    })
    .sort((a, b) => {
      if (catalogSort === 'vendidos') return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      if (catalogSort === 'alfabetico') return a.name.localeCompare(b.name);
      if (catalogSort === 'precio') return a.price - b.price;
      return 0;
    });

  const availablePizzas = products.filter((p) => p.category === 'pizzas');

  const handleProductClick = (product: Product) => {
    if (product.category === 'pizzas') {
      setCustomizingProduct(product);
      setCustomSize('grande');
      setIsHalfAndHalf(false);
      setSecondFlavor('');
      setSelectedExtras([]);
      setCustomNotes('');
    } else {
      addItemToCart(product);
    }
  };

  const addItemToCart = (product: Product, customization?: PizzaCustomization) => {
    let finalUnitPrice = product.price;

    if (customization) {
      if (customization.size === 'chica') finalUnitPrice *= 0.75;
      if (customization.size === 'gigante') finalUnitPrice *= 1.35;
      if (customization.extras?.includes('Doble Queso')) finalUnitPrice += 2200;
      if (customization.extras?.includes('Fainá')) finalUnitPrice += 1900;
      if (customization.extras?.includes('Aceitunas Rellenas')) finalUnitPrice += 1200;
    }

    const newItem: OrderItem = {
      id: `pos-${Date.now()}-${Math.random()}`,
      productId: product.id,
      productName: customization?.isHalfAndHalf && customization.secondFlavorName
        ? `${product.name} ½ + ${customization.secondFlavorName} ½`
        : product.name,
      quantity: 1,
      unitPrice: finalUnitPrice,
      totalPrice: finalUnitPrice,
      customization,
    };

    setCart((prev) => [...prev, newItem]);
    setCustomizingProduct(null);
  };

  const updateCartItemQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice }
              : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const removeCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Subtotals
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = orderType === 'delivery' ? businessConfig.deliveryFeeDefault : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);
  const cashNum = parseFloat(cashGiven) || 0;
  const changeDue = cashNum > grandTotal ? cashNum - grandTotal : 0;

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Agrega al menos un producto al ticket');
      return;
    }
    if (orderType === 'delivery' && !customerAddress.trim()) {
      alert('Ingresa la dirección para el envío');
      return;
    }

    const newOrder = addOrder({
      customerName: customerName.trim() || (orderType === 'salon' ? tableNumber : 'Cliente Mostrador'),
      customerPhone: customerPhone.trim() || (orderType === 'salon' ? 'Salón' : '11-0000-0000'),
      customerAddress: orderType === 'delivery' ? customerAddress.trim() : undefined,
      type: orderType,
      tableNumber: orderType === 'salon' ? tableNumber : undefined,
      status: 'pendiente',
      source: 'pos',
      items: cart,
      subtotal,
      deliveryFee,
      discount: discountAmount,
      total: grandTotal,
      paymentMethod,
      isPaid: paymentMethod !== 'efectivo' || cashNum >= grandTotal,
      notes: orderNotes,
    });

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCashGiven('');
    setOrderNotes('');
    setDiscountAmount(0);

    setSelectedOrderForReceipt(newOrder);
  };

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(movAmount);
    if (!amount || amount <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    if (!movReason.trim()) {
      alert('Ingresa el motivo del movimiento');
      return;
    }

    setCashMovements((prev) => [
      {
        id: `mov-${Date.now()}`,
        type: movType,
        amount,
        reason: movReason.trim(),
        time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);

    setMovAmount('');
    setMovReason('');
    alert('Movimiento de caja registrado correctamente');
  };

  return (
    <div id="pos-view" className="max-w-7xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Punto de venta</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Caja, cobro y cierre del día</p>
        </div>

        <TopHeaderWidget
          extraAction={
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs">
              <span className="text-slate-400 mr-2">Orden catálogo:</span>
              <select
                value={catalogSort}
                onChange={(e) => setCatalogSort(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="vendidos">Más vendidos</option>
                <option value="alfabetico">Alfabético</option>
                <option value="precio">Menor precio</option>
              </select>
            </div>
          }
        />
      </div>

      {/* 8 Metric Cards Grid (Exact screenshot design with gradient icons) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* 1. FONDO INICIAL */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Fondo inicial
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-slate-800 mt-0.5 block">
              ARS {isCashRegisterOpen ? initialCash.toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium truncate">
              {isCashRegisterOpen ? 'Turno abierto' : 'Caja cerrada'}
            </span>
            <div className="w-5 h-5 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Wallet className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* 2. VENTAS DEL TURNO */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Ventas del turno
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-slate-800 mt-0.5 block">
              ARS {totalShiftSales.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium truncate">
              {shiftOrders.length} tickets
            </span>
            <div className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* 3. EFECTIVO EN VENTAS */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Efectivo en ventas
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-emerald-600 mt-0.5 block">
              ARS {cashSales.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium truncate">
              {isCashRegisterOpen ? 'Cobros billetes' : 'Caja cerrada'}
            </span>
            <div className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Banknote className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* 4. TARJETA */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Tarjeta
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-purple-600 mt-0.5 block">
              ARS {cardSales.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium truncate">POS / Débito</span>
            <div className="w-5 h-5 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <CreditCard className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* 5. TRANSFERENCIA */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Transferencia
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-sky-600 mt-0.5 block">
              ARS {transferSales.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium truncate">MP / Alias</span>
            <div className="w-5 h-5 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <QrCode className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* 6. MOVIMIENTOS NETOS */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Movimientos netos
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-amber-600 mt-0.5 block">
              ARS {netMovements.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium truncate">
              {cashMovements.length} movs
            </span>
            <div className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ArrowLeftRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* 7. CANCELACIONES */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Cancelaciones
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-rose-600 mt-0.5 block">
              ARS {cancelledSales.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium truncate">
              {orders.filter((o) => o.status === 'cancelado').length} anulados
            </span>
            <div className="w-5 h-5 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Ban className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* 8. EFECTIVO ESPERADO */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Efectivo esperado
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-slate-900 mt-0.5 block">
              ARS {expectedCash.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium truncate">En cajón</span>
            <div className="w-5 h-5 rounded-lg bg-slate-800/10 text-slate-800 flex items-center justify-center">
              <Calculator className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* POS Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200/70 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveSubTab('pos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'pos'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          Punto de Venta / Catálogo
        </button>

        <button
          onClick={() => setActiveSubTab('mesas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'mesas'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          Mesas y Salón
        </button>

        <button
          onClick={() => setActiveSubTab('historial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'historial'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Historial de ventas
        </button>

        <button
          onClick={() => setActiveSubTab('operaciones')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'operaciones'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Operaciones de caja
        </button>

        <button
          onClick={() => {
            if (isCashRegisterOpen) {
              if (confirm(`¿Deseas cerrar la caja del turno?\nEfectivo esperado: $${expectedCash.toLocaleString('es-AR')}`)) {
                setIsCashRegisterOpen(false);
                alert('Caja cerrada con éxito. Balance guardado.');
              }
            } else {
              setActiveSubTab('cierre');
            }
          }}
          className={`ml-auto px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            isCashRegisterOpen
              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          {isCashRegisterOpen ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          {isCashRegisterOpen ? 'Cerrar caja de turno' : 'Abrir caja de turno'}
        </button>
      </div>

      {/* Main Content Grid: Left (Catalog/Operations) + Right (Current Cart Ticket) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols or full if closed) */}
        <div className="lg:col-span-7 space-y-4">
          {!isCashRegisterOpen ? (
            /* Closed Cash Register State (Exact from screenshot) */
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-500" />
                  Apertura de caja
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Abre una caja para empezar a registrar ventas, ingresos, retiros y gastos del turno.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-2.5 text-xs text-sky-800">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p>No hay sucursales activas configuradas. La caja operará como general.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fondo inicial</label>
                  <input
                    type="number"
                    value={initialCash}
                    onChange={(e) => setInitialCash(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-800"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nota</label>
                  <input
                    type="text"
                    value={initialNote}
                    onChange={(e) => setInitialNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                    placeholder="Caja turno mañana"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCashRegisterOpen(true);
                  setActiveSubTab('pos');
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
              >
                <Unlock className="w-4 h-4" />
                Abrir caja
              </button>
            </div>
          ) : activeSubTab === 'mesas' ? (
            /* Tables / Salón view */
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  Mapa de Mesas & Salón
                </h2>
                <span className="text-xs text-slate-500 font-medium">8 Mesas disponibles</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'Mesa 5', 'Mesa 6', 'Terraza 1', 'Terraza 2'].map(
                  (m) => {
                    const isSelected = orderType === 'salon' && tableNumber === m;
                    return (
                      <button
                        key={m}
                        onClick={() => {
                          setOrderType('salon');
                          setTableNumber(m);
                          setActiveSubTab('pos');
                        }}
                        className={`p-4 rounded-2xl border text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-8 h-8 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-2 font-bold text-xs">
                          🪑
                        </div>
                        <div className="font-bold text-xs">{m}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-1">Libre</div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          ) : activeSubTab === 'operaciones' ? (
            /* Cash Movements Form & History */
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 space-y-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-amber-500" />
                Registrar Movimiento de Efectivo (Ingreso / Retiro)
              </h2>

              <form onSubmit={handleAddMovement} className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovType('ingreso')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      movType === 'ingreso'
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    + Ingreso de Caja
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovType('retiro')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      movType === 'retiro'
                        ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    - Retiro / Gasto de Caja
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Monto ($)</label>
                    <input
                      type="number"
                      value={movAmount}
                      onChange={(e) => setMovAmount(e.target.value)}
                      placeholder="Ej: 5000"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Motivo / Concepto</label>
                    <input
                      type="text"
                      value={movReason}
                      onChange={(e) => setMovReason(e.target.value)}
                      placeholder="Ej: Pago de hielo, cambio, etc."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition"
                >
                  Registrar Movimiento en Caja
                </button>
              </form>

              {/* Movement history */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Historial del Turno</h3>
                {cashMovements.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay movimientos manuales registrados hoy.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {cashMovements.map((m) => (
                      <div key={m.id} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <span
                            className={`font-bold mr-2 ${
                              m.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {m.type === 'ingreso' ? '+ INGRESO' : '- RETIRO'}
                          </span>
                          <span className="text-slate-700">{m.reason}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-800">
                            ${m.amount.toLocaleString('es-AR')}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-2 font-mono">{m.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeSubTab === 'historial' ? (
            /* Shift Sales History */
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 space-y-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-500" />
                Historial de Ventas del Turno
              </h2>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {shiftOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Aún no hay tickets cerrados en este turno.
                  </div>
                ) : (
                  shiftOrders.map((ord) => (
                    <div key={ord.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-mono font-bold text-orange-600 mr-2">#{ord.orderNumber}</span>
                        <span className="font-bold text-slate-800 mr-2">{ord.customerName}</span>
                        <span className="text-slate-400 capitalize">({ord.type})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">
                          ${ord.total.toLocaleString('es-AR')}
                        </span>
                        <button
                          onClick={() => setSelectedOrderForReceipt(ord)}
                          className="p-1 rounded text-slate-400 hover:text-orange-600"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Active POS Catalog & Products */
            <div className="space-y-3">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar pizza, empanada o bebida..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleProductClick(prod)}
                    className="bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-orange-400 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                  >
                    {prod.popular && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white shadow-xs font-mono z-10">
                        TOP
                      </span>
                    )}

                    <div>
                      <div className="flex items-start gap-2.5">
                        {prod.image ? (
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                            {prod.category === 'pizzas' ? <Pizza className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
                          </div>
                        )}
                        <div className="min-w-0 flex-1 pr-6">
                          <h3 className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition truncate">
                            {prod.name}
                          </h3>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{prod.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-black font-mono text-slate-900">
                        ${prod.price.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[11px] font-bold text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white border border-orange-200 px-2.5 py-1 rounded-xl flex items-center gap-1 transition">
                        <Plus className="w-3 h-3" />
                        {prod.category === 'pizzas' ? 'Personalizar' : 'Agregar'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ticket Actual (5 cols) (Matches Screenshot exact empty / populated state) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/70 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                Ticket actual
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* Empty Ticket State (Exact from screenshot) */}
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-1.5">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-2">
                  <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Sin productos en el ticket</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Toca productos del catálogo para agregar la primera ronda.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {/* Order Type switcher */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition ${
                      orderType === 'delivery' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <Bike className="w-3 h-3" /> Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('retiro')}
                    className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition ${
                      orderType === 'retiro' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <ShoppingBag className="w-3 h-3" /> Retiro
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('salon')}
                    className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition ${
                      orderType === 'salon' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <Utensils className="w-3 h-3" /> Salón
                  </button>
                </div>

                {/* Customer fields */}
                {orderType === 'salon' ? (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Mesa</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ej: Marcelo"
                        className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Teléfono</label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="11-2233-4455"
                        className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {orderType === 'delivery' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Dirección de Entrega</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Calle, Número, Piso/Depto"
                      className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                    />
                  </div>
                )}

                {/* Items in Cart */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                  {cart.map((item) => (
                    <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="font-bold text-slate-800 truncate">{item.productName}</p>
                        {item.customization && (
                          <p className="text-[10px] text-amber-700 font-mono">
                            {item.customization.size.toUpperCase()}
                            {item.customization.extras?.length ? ` + ${item.customization.extras.join(', ')}` : ''}
                          </p>
                        )}
                        <p className="text-[10px] font-mono text-slate-400">
                          ${item.unitPrice.toLocaleString('es-AR')} c/u
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200">
                          <button
                            onClick={() => updateCartItemQty(item.id, -1)}
                            className="p-1 text-slate-500 hover:text-orange-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1.5 font-bold font-mono text-slate-800 text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQty(item.id, 1)}
                            className="p-1 text-slate-500 hover:text-orange-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-mono font-bold text-slate-900 min-w-[55px] text-right">
                          ${item.totalPrice.toLocaleString('es-AR')}
                        </span>
                        <button
                          onClick={() => removeCartItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkout Controls */}
          {cart.length > 0 && (
            <div className="border-t border-slate-100 pt-3 space-y-3">
              {/* Payment Method */}
              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-slate-400 mb-1 block">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition ${
                      paymentMethod === 'efectivo'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mercadopago')}
                    className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition ${
                      paymentMethod === 'mercadopago'
                        ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-sky-600" /> MP QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tarjeta')}
                    className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition ${
                      paymentMethod === 'tarjeta'
                        ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-purple-600" /> Tarjeta
                  </button>
                </div>
              </div>

              {/* Fast Cash Calculator */}
              {paymentMethod === 'efectivo' && (
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Paga con ($)</span>
                    <input
                      type="number"
                      value={cashGiven}
                      onChange={(e) => setCashGiven(e.target.value)}
                      placeholder="Monto"
                      className="w-full bg-white text-slate-800 px-2.5 py-1 rounded-lg text-xs border border-slate-200 font-mono font-bold mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Vuelto a entregar</span>
                    <p className="text-sm font-mono font-black text-emerald-600 mt-0.5">
                      ${changeDue.toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-0.5 text-xs text-slate-500 font-mono pt-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800">${subtotal.toLocaleString('es-AR')}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between text-slate-500">
                    <span>Envío:</span>
                    <span>+${deliveryFee.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 pt-1.5 border-t border-slate-100">
                  <span>TOTAL:</span>
                  <span className="text-orange-600">${grandTotal.toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                id="btn-pos-checkout"
                onClick={handleCheckout}
                className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
              >
                <CheckCircle className="w-4 h-4" />
                Cobrar e Imprimir Comanda (${grandTotal.toLocaleString('es-AR')})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pizza Customization Modal */}
      {customizingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-800">Personalizar {customizingProduct.name}</h2>
                <p className="text-xs text-slate-400">Selecciona tamaño, mitad y agregados</p>
              </div>
              <button
                onClick={() => setCustomizingProduct(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Size */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Tamaño de la Pizza</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomSize('chica')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                    customSize === 'chica'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div>Chica (4 porc.)</div>
                  <div className="text-[10px] text-slate-400 font-normal">75% del valor</div>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomSize('grande')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                    customSize === 'grande'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div>Grande (8 porc.)</div>
                  <div className="text-[10px] text-slate-400 font-normal">Estándar</div>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomSize('gigante')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                    customSize === 'gigante'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div>Gigante (12 porc.)</div>
                  <div className="text-[10px] text-slate-400 font-normal">+35% del valor</div>
                </button>
              </div>
            </div>

            {/* Half and half */}
            <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/60">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHalfAndHalf}
                  onChange={(e) => setIsHalfAndHalf(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="text-xs font-bold text-slate-800">Pizza Mitad y Mitad (2 Sabores)</span>
              </label>

              {isHalfAndHalf && (
                <div className="mt-2.5">
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Segundo Sabor (½)</label>
                  <select
                    value={secondFlavor}
                    onChange={(e) => setSecondFlavor(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800"
                  >
                    <option value="">Selecciona la otra mitad...</option>
                    {availablePizzas
                      .filter((p) => p.id !== customizingProduct.id)
                      .map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} (${p.price})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Extras */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Agregados y Extras</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['Doble Queso (+$2.200)', 'Fainá (+$1.900)', 'Aceitunas Rellenas (+$1.200)'].map((extra) => {
                  const cleanName = extra.split(' ')[0] + ' ' + (extra.split(' ')[1] || '').replace(/\(.*/, '').trim();
                  const isChecked = selectedExtras.includes(cleanName);
                  return (
                    <label
                      key={extra}
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition ${
                        isChecked
                          ? 'bg-orange-50 border-orange-400 text-orange-800 font-bold'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedExtras((prev) =>
                            isChecked ? prev.filter((e) => e !== cleanName) : [...prev, cleanName]
                          );
                        }}
                        className="rounded text-orange-600"
                      />
                      <span>{extra}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Observaciones</label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Ej: Masa bien tostada, sin orégano"
                className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCustomizingProduct(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() =>
                  addItemToCart(customizingProduct, {
                    size: customSize,
                    isHalfAndHalf,
                    secondFlavorName: secondFlavor || undefined,
                    extras: selectedExtras,
                    notes: customNotes,
                  })
                }
                className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-md"
              >
                Agregar a la Comanda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
