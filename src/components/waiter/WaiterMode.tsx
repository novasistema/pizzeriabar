import React, { useState, useMemo } from 'react';
import { 
  RestaurantTable, 
  TableStatus, 
  Product, 
  CartItem, 
  Order, 
  PizzeriaSettings,
  ExtraTopping,
  PizzaSizeOption,
  CrustOption,
  PaymentMethod
} from '../../types';
import { StorageService } from '../../services/storageService';
import { soundManager } from '../../utils/audio';
import { formatCurrency, formatTimeOnly } from '../../utils/formatters';
import { 
  Users, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  Receipt, 
  Clock, 
  Search, 
  UtensilsCrossed, 
  ArrowLeft, 
  DollarSign, 
  QrCode, 
  CreditCard, 
  Banknote, 
  UserCheck, 
  Sparkles, 
  Check, 
  ChevronRight,
  Flame,
  AlertCircle
} from 'lucide-react';

interface WaiterModeProps {
  products: Product[];
  orders: Order[];
  tables: RestaurantTable[];
  settings: PizzeriaSettings;
  onExit: () => void;
}

export const WaiterMode: React.FC<WaiterModeProps> = ({
  products,
  orders,
  tables,
  settings,
  onExit
}) => {
  const [waiterName, setWaiterName] = useState<string>(StorageService.getWaiterName());
  const [isEditingWaiter, setIsEditingWaiter] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  
  // Active comanda in progress for selected table
  const [comandaItems, setComandaItems] = useState<CartItem[]>([]);
  const [dinersCount, setDinersCount] = useState<number>(2);
  const [notes, setNotes] = useState<string>('');
  
  // Product picker in table comanda
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  // Customization state for chosen product
  const [selectedSize, setSelectedSize] = useState<PizzaSizeOption | undefined>(undefined);
  const [selectedCrust, setSelectedCrust] = useState<CrustOption | undefined>(undefined);
  const [selectedToppings, setSelectedToppings] = useState<ExtraTopping[]>([]);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemNotes, setItemNotes] = useState<string>('');

  // Checkout / Billing modal for table
  const [isBillingModalOpen, setIsBillingModalOpen] = useState<boolean>(false);
  const [billingPaymentMethod, setBillingPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [billingDiscountPercent, setBillingDiscountPercent] = useState<number>(0);
  const [amountPaidWith, setAmountPaidWith] = useState<string>('');
  const [isOrderSentSuccess, setIsOrderSentSuccess] = useState<boolean>(false);

  // Active table's existing active order (if already occupied)
  const activeOrderForTable = useMemo(() => {
    if (!selectedTable || !selectedTable.activeOrderId) return null;
    return orders.find(o => o.id === selectedTable.activeOrderId) || null;
  }, [selectedTable, orders]);

  // Open table details / create comanda
  const handleSelectTable = (table: RestaurantTable) => {
    setSelectedTable(table);
    setDinersCount(table.dinersCount || table.capacity || 2);
    setComandaItems([]);
    setNotes('');
    setIsOrderSentSuccess(false);
  };

  const handleSaveWaiterName = () => {
    if (waiterName.trim()) {
      StorageService.saveWaiterName(waiterName.trim());
      setIsEditingWaiter(false);
    }
  };

  // Open product customization modal
  const handleOpenProductCustomizer = (product: Product) => {
    setCustomizingProduct(product);
    setSelectedSize(product.sizes?.find(s => s.isDefault) || product.sizes?.[0]);
    setSelectedCrust(product.crusts?.[0]);
    setSelectedToppings([]);
    setItemQuantity(1);
    setItemNotes('');
  };

  // Calculate customized item price
  const calculateCustomizedPrice = () => {
    if (!customizingProduct) return 0;
    let base = customizingProduct.price;
    if (selectedSize) {
      base = Math.round(base * selectedSize.priceMultiplier);
    }
    if (selectedCrust) {
      base += selectedCrust.extraPrice;
    }
    const toppingsTotal = selectedToppings.reduce((acc, t) => acc + t.price, 0);
    return (base + toppingsTotal) * itemQuantity;
  };

  // Add customized item to table comanda
  const handleAddCustomizedToComanda = () => {
    if (!customizingProduct) return;
    const baseUnit = calculateCustomizedPrice() / itemQuantity;
    const newItem: CartItem = {
      cartItemId: `waiter-${customizingProduct.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: customizingProduct.id,
      productName: customizingProduct.name,
      category: customizingProduct.category,
      basePrice: baseUnit,
      quantity: itemQuantity,
      selectedSize,
      selectedCrust,
      selectedToppings,
      notes: itemNotes.trim() || undefined,
      itemTotal: calculateCustomizedPrice(),
      imageUrl: customizingProduct.imageUrl,
    };

    setComandaItems(prev => [...prev, newItem]);
    soundManager.playAddToCart();
    setCustomizingProduct(null);
  };

  // Quick add standard product without modal (for drinks, desserts, standard items)
  const handleQuickAdd = (product: Product) => {
    if (product.sizes && product.sizes.length > 0) {
      handleOpenProductCustomizer(product);
      return;
    }

    const newItem: CartItem = {
      cartItemId: `waiter-${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: product.id,
      productName: product.name,
      category: product.category,
      basePrice: product.price,
      quantity: 1,
      selectedToppings: [],
      itemTotal: product.price,
      imageUrl: product.imageUrl,
    };

    setComandaItems(prev => {
      // Check if existing
      const existingIdx = prev.findIndex(i => i.productId === product.id && (!i.selectedToppings || i.selectedToppings.length === 0) && !i.notes);
      if (existingIdx !== -1) {
        const copy = [...prev];
        const newQty = copy[existingIdx].quantity + 1;
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: newQty,
          itemTotal: copy[existingIdx].basePrice * newQty,
        };
        return copy;
      }
      return [...prev, newItem];
    });

    soundManager.playAddToCart();
  };

  const handleUpdateItemQuantity = (index: number, delta: number) => {
    setComandaItems(prev => {
      const copy = [...prev];
      const newQty = copy[index].quantity + delta;
      if (newQty <= 0) {
        copy.splice(index, 1);
        return copy;
      }
      copy[index] = {
        ...copy[index],
        quantity: newQty,
        itemTotal: (copy[index].itemTotal / copy[index].quantity) * newQty,
      };
      return copy;
    });
  };

  const handleRemoveComandaItem = (index: number) => {
    setComandaItems(prev => prev.filter((_, i) => i !== index));
  };

  // Send comanda to kitchen (Create or Append to table Order)
  const handleSendComandaToKitchen = () => {
    if (!selectedTable || comandaItems.length === 0) return;

    if (activeOrderForTable) {
      // Append items to existing order
      const combinedItems = [...activeOrderForTable.items, ...comandaItems];
      const newSubtotal = combinedItems.reduce((acc, i) => acc + i.itemTotal, 0);
      const newTotal = newSubtotal;

      const updatedOrder: Order = {
        ...activeOrderForTable,
        items: combinedItems,
        subtotal: newSubtotal,
        total: newTotal,
        updatedAt: new Date().toISOString(),
        orderNotes: notes.trim() 
          ? (activeOrderForTable.orderNotes ? `${activeOrderForTable.orderNotes} | ${notes.trim()}` : notes.trim()) 
          : activeOrderForTable.orderNotes,
      };

      StorageService.updateOrder(updatedOrder);
      StorageService.updateTableStatus(selectedTable.id, 'ocupada', waiterName, updatedOrder.id, dinersCount);
    } else {
      // Create brand new salon order
      const subtotal = comandaItems.reduce((acc, i) => acc + i.itemTotal, 0);
      const newOrder = StorageService.createOrder({
        customerName: `${selectedTable.name} (Salón)`,
        customerPhone: 'Salón',
        deliveryType: 'salon',
        tableNumber: selectedTable.number,
        tableName: selectedTable.name,
        waiterName: waiterName,
        dinersCount: dinersCount,
        items: comandaItems,
        subtotal: subtotal,
        deliveryFee: 0,
        discount: 0,
        total: subtotal,
        paymentMethod: 'efectivo',
        paymentStatus: 'pendiente',
        status: 'en_horno', // Directly in kitchen!
        orderNotes: notes.trim() || undefined,
      });

      StorageService.updateTableStatus(selectedTable.id, 'ocupada', waiterName, newOrder.id, dinersCount);
    }

    soundManager.playOrderReceived();
    setIsOrderSentSuccess(true);
    setComandaItems([]);
    setTimeout(() => {
      setIsOrderSentSuccess(false);
    }, 3000);
  };

  // Request bill for table
  const handleRequestBill = () => {
    if (!selectedTable) return;
    StorageService.updateTableStatus(selectedTable.id, 'cuenta_pedida');
    soundManager.playNotificationTone();
  };

  // Close and pay table
  const handleFinalizeAndCloseTable = () => {
    if (!selectedTable || !activeOrderForTable) return;

    const discountAmount = billingDiscountPercent > 0 
      ? Math.round(activeOrderForTable.subtotal * (billingDiscountPercent / 100)) 
      : 0;
    const finalTotal = activeOrderForTable.subtotal - discountAmount;

    const updatedOrder: Order = {
      ...activeOrderForTable,
      discount: discountAmount,
      total: finalTotal,
      paymentMethod: billingPaymentMethod,
      paymentStatus: 'verificado',
      status: 'entregado',
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...activeOrderForTable.statusHistory,
        {
          status: 'entregado',
          timestamp: new Date().toISOString(),
          note: `Mesa cerrada por ${waiterName}. Cobrado con ${billingPaymentMethod}.`,
        }
      ]
    };

    StorageService.updateOrder(updatedOrder);
    StorageService.updateTableStatus(selectedTable.id, 'libre');
    soundManager.playCashSound();
    setIsBillingModalOpen(false);
    setSelectedTable(null);
  };

  // Filter products for comanda picker
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.isAvailable) return false;
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch = !searchQuery.trim() || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const comandaSubtotal = comandaItems.reduce((acc, item) => acc + item.itemTotal, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Waiter Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Comandero de Salón & Mozos
              </h2>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                En Vivo
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Toma pedidos para salón, envía a cocina y cobra mesas
            </p>
          </div>
        </div>

        {/* Waiter Identifier & Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <UserCheck className="w-4 h-4 text-amber-600" />
            {isEditingWaiter ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={waiterName}
                  onChange={(e) => setWaiterName(e.target.value)}
                  className="bg-white dark:bg-slate-900 text-xs px-2 py-1 rounded border border-amber-500 font-bold focus:outline-none w-24"
                  placeholder="Tu nombre"
                  autoFocus
                />
                <button
                  onClick={handleSaveWaiterName}
                  className="bg-amber-500 text-white p-1 rounded hover:bg-amber-600 text-xs font-bold"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span 
                onClick={() => setIsEditingWaiter(true)}
                className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:underline"
                title="Clic para cambiar nombre del mozo"
              >
                {waiterName} (Editar)
              </span>
            )}
          </div>

          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
        </div>
      </div>

      {/* Main Waiter Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Salon Tables Grid (5 Cols on large screens) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                Mesas del Salón ({tables.length})
              </h3>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  {tables.filter(t => t.status === 'libre').length} Libres
                </span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  {tables.filter(t => t.status === 'ocupada').length} Ocupadas
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  {tables.filter(t => t.status === 'cuenta_pedida').length} Cuenta
                </span>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tables.map((table) => {
                const isSelected = selectedTable?.id === table.id;
                const activeOrder = orders.find(o => o.id === table.activeOrderId);

                return (
                  <button
                    key={table.id}
                    onClick={() => handleSelectTable(table)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-150 relative overflow-hidden flex flex-col justify-between min-h-[105px] ${
                      isSelected 
                        ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-900 border-amber-500 bg-amber-50/50 dark:bg-amber-950/30' 
                        : table.status === 'ocupada'
                        ? 'border-rose-300 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/20 hover:border-rose-400'
                        : table.status === 'cuenta_pedida'
                        ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:border-amber-400 animate-pulse'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-emerald-400 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {table.name}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        table.status === 'ocupada'
                          ? 'bg-rose-500 text-white'
                          : table.status === 'cuenta_pedida'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        {table.status === 'cuenta_pedida' ? 'Pedir Cuenta' : table.status}
                      </span>
                    </div>

                    <div className="mt-2 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                        <span>Cap: {table.capacity} pers.</span>
                        {table.dinersCount && (
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {table.dinersCount} comensales
                          </span>
                        )}
                      </div>

                      {activeOrder && (
                        <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                          <span>{activeOrder.items.reduce((a, b) => a + b.quantity, 0)} items</span>
                          <span className="font-black">{formatCurrency(activeOrder.total)}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Table Command Workspace (7 Cols on large screens) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedTable ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Selected Table Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedTable.name}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      selectedTable.status === 'ocupada'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : selectedTable.status === 'cuenta_pedida'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {selectedTable.status === 'cuenta_pedida' ? 'PIDIÓ LA CUENTA' : selectedTable.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Atendido por: <strong className="text-slate-800 dark:text-slate-200">{selectedTable.currentWaiterName || waiterName}</strong>
                    {selectedTable.openedAt && ` • Abierta a las ${formatTimeOnly(selectedTable.openedAt)}`}
                  </p>
                </div>

                {/* Diners Count Selector */}
                <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-bold ml-1">Comensales:</span>
                  <button
                    onClick={() => setDinersCount(Math.max(1, dinersCount - 1))}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center font-bold shadow-xs hover:bg-slate-200"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-sm w-5 text-center">{dinersCount}</span>
                  <button
                    onClick={() => setDinersCount(dinersCount + 1)}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center font-bold shadow-xs hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Table Alert Notification */}
              {isOrderSentSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>¡Comanda enviada directo a la cocina! La pantalla de cocina ya fue notificada.</span>
                </div>
              )}

              {/* 1. Existing Active Order Items (If Table is already Occupied) */}
              {activeOrderForTable && (
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      Consumo en Mesa (Orden #{activeOrderForTable.orderNumber})
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                      Subtotal: {formatCurrency(activeOrderForTable.subtotal)}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-200/80 dark:divide-slate-700/80 max-h-48 overflow-y-auto pr-1">
                    {activeOrderForTable.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {item.quantity}x {item.productName}
                            {item.selectedSize && ` (${item.selectedSize.name})`}
                          </p>
                          {item.selectedToppings?.length > 0 && (
                            <p className="text-[11px] text-slate-500">
                              + {item.selectedToppings.map(t => t.name).join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-[11px] text-amber-600 italic">Nota: {item.notes}</p>
                          )}
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(item.itemTotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions for Existing Table (Request Bill or Pay) */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={handleRequestBill}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Marcar "Pide Cuenta"</span>
                    </button>
                    <button
                      onClick={() => setIsBillingModalOpen(true)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Cobrar & Cerrar Mesa</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. New Comanda Items to Send to Kitchen */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    Nueva Marcha / Comanda para Cocina
                  </h4>
                  {comandaItems.length > 0 && (
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                      Total a marchar: {formatCurrency(comandaSubtotal)}
                    </span>
                  )}
                </div>

                {comandaItems.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center text-xs text-slate-400">
                    Selecciona productos del menú abajo para agregar a esta mesa
                  </div>
                ) : (
                  <div className="space-y-2 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60">
                    {comandaItems.map((item, idx) => (
                      <div key={item.cartItemId} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <div className="flex-1">
                          <p className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {item.productName}
                            {item.selectedSize && ` (${item.selectedSize.name})`}
                          </p>
                          {item.selectedToppings?.length > 0 && (
                            <p className="text-[10px] text-slate-500">
                              + {item.selectedToppings.map(t => t.name).join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-[10px] text-amber-600 font-medium">Nota: {item.notes}</p>
                          )}
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            {formatCurrency(item.itemTotal)}
                          </span>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button
                              onClick={() => handleUpdateItemQuantity(idx, -1)}
                              className="w-6 h-6 rounded flex items-center justify-center font-bold hover:bg-slate-200 dark:hover:bg-slate-600 text-xs"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateItemQuantity(idx, 1)}
                              className="w-6 h-6 rounded flex items-center justify-center font-bold hover:bg-slate-200 dark:hover:bg-slate-600 text-xs"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveComandaItem(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Comanda Notes */}
                    <div className="pt-2">
                      <input
                        type="text"
                        placeholder="Nota especial para cocina (ej: pizza bien crocante, sacar bebidas primero)..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Send to Kitchen Button */}
                    <button
                      onClick={handleSendComandaToKitchen}
                      className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition active:scale-98"
                    >
                      <Send className="w-4 h-4" />
                      <span>Marchar a Cocina ({formatCurrency(comandaSubtotal)})</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Fast Menu Item Picker */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Agregar Productos a la Mesa
                  </h4>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'pizzas_clasicas', label: 'Clásicas' },
                    { id: 'pizzas_especiales', label: 'Especiales' },
                    { id: 'pizzas_gourmet', label: 'Gourmet' },
                    { id: 'empanadas', label: 'Empanadas' },
                    { id: 'bebidas', label: 'Bebidas' },
                    { id: 'postres', label: 'Postres' },
                    { id: 'promociones', label: 'Promos' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition ${
                        activeCategory === cat.id
                          ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {filteredProducts.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => handleQuickAdd(prod)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition flex flex-col justify-between group"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600">
                          {prod.name}
                        </p>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {prod.category.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="font-black text-xs text-slate-900 dark:text-white">
                          {formatCurrency(prod.price)}
                        </span>
                        <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-xs font-black shadow-xs">
                          +
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <UtensilsCrossed className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Ninguna mesa seleccionada
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Haz clic en una mesa del panel izquierdo para abrir su comanda, cargar productos o cerrar la cuenta.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Customizer Modal for Mozo */}
      {customizingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">
                  {customizingProduct.name}
                </h4>
                <p className="text-xs text-slate-500">Personalizar tamaño y adicionales</p>
              </div>
              <button
                onClick={() => setCustomizingProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Sizes Selection */}
            {customizingProduct.sizes && customizingProduct.sizes.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tamaño:</label>
                <div className="grid grid-cols-2 gap-2">
                  {customizingProduct.sizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSize(s)}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition ${
                        selectedSize?.id === s.id
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div>{s.name}</div>
                      <div className="text-[11px] font-black text-slate-500">
                        {formatCurrency(Math.round(customizingProduct.price * s.priceMultiplier))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Crusts Selection */}
            {customizingProduct.crusts && customizingProduct.crusts.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Masa / Borde:</label>
                <div className="space-y-1.5">
                  {customizingProduct.crusts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCrust(c)}
                      className={`w-full p-2 rounded-xl text-left border text-xs font-bold flex items-center justify-between transition ${
                        selectedCrust?.id === c.id
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span>{c.extraPrice > 0 ? `+${formatCurrency(c.extraPrice)}` : 'Incluido'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toppings Selection */}
            {customizingProduct.availableToppings && customizingProduct.availableToppings.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Toppings / Extras:</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                  {customizingProduct.availableToppings.map((top) => {
                    const isSelected = selectedToppings.some(t => t.id === top.id);
                    return (
                      <button
                        key={top.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedToppings(prev => prev.filter(t => t.id !== top.id));
                          } else {
                            setSelectedToppings(prev => [...prev, top]);
                          }
                        }}
                        className={`p-2 rounded-xl text-left border text-[11px] font-bold transition flex items-center justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className="truncate">{top.name}</span>
                        <span className="shrink-0 font-black">+{formatCurrency(top.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Item Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Aclaración / Punto de Cocción:</label>
              <input
                type="text"
                placeholder="Ej: sin cebolla, bien dorada, etc."
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                className="w-full mt-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5"
              />
            </div>

            {/* Quantity and Confirm */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center font-black text-sm">{itemQuantity}</span>
                <button
                  onClick={() => setItemQuantity(itemQuantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddCustomizedToComanda}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-md"
              >
                Agregar ({formatCurrency(calculateCustomizedPrice())})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing & Table Closure Modal */}
      {isBillingModalOpen && selectedTable && activeOrderForTable && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Cerrar Cuenta: {selectedTable.name}
                  </h3>
                  <p className="text-xs text-slate-500">Orden #{activeOrderForTable.orderNumber} • Atendió {waiterName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsBillingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Account Summary Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                <span>Subtotal Consumos:</span>
                <span className="font-bold">{formatCurrency(activeOrderForTable.subtotal)}</span>
              </div>

              {/* Discount Selector */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold">Descuento de la Casa:</span>
                <div className="flex items-center gap-1">
                  {[0, 10, 15, 20].map((d) => (
                    <button
                      key={d}
                      onClick={() => setBillingDiscountPercent(d)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                        billingDiscountPercent === d
                          ? 'bg-amber-500 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {d === 0 ? '0%' : `${d}%`}
                    </button>
                  ))}
                </div>
              </div>

              {billingDiscountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Ahorro ({billingDiscountPercent}%):</span>
                  <span>-{formatCurrency(Math.round(activeOrderForTable.subtotal * (billingDiscountPercent / 100)))}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total a Cobrar:</span>
                <span className="text-amber-600 dark:text-amber-400">
                  {formatCurrency(activeOrderForTable.subtotal - Math.round(activeOrderForTable.subtotal * (billingDiscountPercent / 100)))}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Medio de Pago:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
                  { id: 'transferencia', label: 'Transferencia', icon: Sparkles },
                  { id: 'mercadopago', label: 'QR / MP', icon: QrCode },
                  { id: 'tarjeta_delivery', label: 'Tarjeta / POS', icon: CreditCard },
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setBillingPaymentMethod(pm.id as PaymentMethod)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition ${
                        billingPaymentMethod === pm.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash change calculator */}
            {billingPaymentMethod === 'efectivo' && (
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1.5">
                <label className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
                  ¿Con cuánto abona el cliente en efectivo?
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Monto pagado..."
                    value={amountPaidWith}
                    onChange={(e) => setAmountPaidWith(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-800 border border-amber-300 rounded-lg p-2 font-bold"
                  />
                  {parseFloat(amountPaidWith) > (activeOrderForTable.subtotal - Math.round(activeOrderForTable.subtotal * (billingDiscountPercent / 100))) && (
                    <span className="text-xs font-black text-emerald-600 whitespace-nowrap bg-emerald-100 px-2 py-1.5 rounded-lg">
                      Vuelto: {formatCurrency(parseFloat(amountPaidWith) - (activeOrderForTable.subtotal - Math.round(activeOrderForTable.subtotal * (billingDiscountPercent / 100))))}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Confirm Payment and Liberate Table */}
            <button
              onClick={handleFinalizeAndCloseTable}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-98"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirmar Cobro y Liberar {selectedTable.name}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
