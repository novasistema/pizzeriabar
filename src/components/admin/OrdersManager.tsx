import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  Flame, 
  Bike, 
  Store, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  MessageSquare, 
  Check, 
  Eye, 
  FileText,
  User,
  Phone,
  MapPin,
  Sparkles,
  AlertCircle,
  Building2
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, PizzeriaSettings } from '../../types';
import { 
  formatCurrency, 
  formatDateTime, 
  STATUS_CONFIG, 
  PAYMENT_METHOD_CONFIG, 
  PAYMENT_STATUS_CONFIG,
  buildWhatsAppOrderMessage 
} from '../../utils/formatters';
import { StorageService } from '../../services/storageService';
import { soundManager } from '../../utils/audio';

interface OrdersManagerProps {
  orders: Order[];
  settings: PizzeriaSettings;
  onRefreshOrders: () => void;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({
  orders,
  settings,
  onRefreshOrders,
}) => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'todos'>('todos');
  const [filterPayment, setFilterPayment] = useState<'todos' | 'verificado' | 'pendiente' | 'comprobante_subido'>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);
  const [driverAssignOrderId, setDriverAssignOrderId] = useState<string | null>(null);
  const [driverNameInput, setDriverNameInput] = useState<string>('Marcos Benítez (Moto Roja)');
  const [driverPhoneInput, setDriverPhoneInput] = useState<string>('+54 9 11 4455-8899');
  const [ticketModalOrder, setTicketModalOrder] = useState<Order | null>(null);

  // Financial Stats
  const totalPaidRevenue = orders
    .filter(o => o.paymentStatus === 'verificado')
    .reduce((sum, o) => sum + o.total, 0);

  const totalPendingRevenue = orders
    .filter(o => o.paymentStatus === 'pendiente' || o.paymentStatus === 'comprobante_subido')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingProofsCount = orders.filter(o => o.paymentStatus === 'comprobante_subido').length;

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'todos' && o.status !== filterStatus) return false;
    if (filterPayment !== 'todos' && o.paymentStatus !== filterPayment) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toString().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus, note?: string) => {
    StorageService.updateOrderStatus(orderId, nextStatus, note);
    soundManager.playStatusPing();
    onRefreshOrders();
  };

  const handleConfirmPayment = (orderId: string) => {
    StorageService.updateOrderPaymentStatus(orderId, 'verificado');
    soundManager.playSuccessTone();
    if (selectedProofOrder?.id === orderId) {
      setSelectedProofOrder(null);
    }
    onRefreshOrders();
  };

  const handleTogglePaymentStatus = (orderId: string, currentStatus: PaymentStatus) => {
    const nextStatus = currentStatus === 'verificado' ? 'pendiente' : 'verificado';
    StorageService.updateOrderPaymentStatus(orderId, nextStatus);
    soundManager.playSuccessTone();
    onRefreshOrders();
  };

  const handleDispatchDriver = (orderId: string) => {
    StorageService.updateOrderStatus(
      orderId, 
      'en_camino', 
      `Despachado con cadete: ${driverNameInput}`,
      driverNameInput,
      driverPhoneInput
    );
    setDriverAssignOrderId(null);
    soundManager.playStatusPing();
    onRefreshOrders();
  };

  const handleSendCustomWhatsApp = (order: Order, type: 'horno' | 'camino' | 'listo') => {
    let msg = '';
    if (type === 'horno') {
      msg = `¡Hola ${order.customerName}! 🍕 Tu pedido #${order.orderNumber} de *${settings.name}* ya ingresó a nuestro horno de barro. Te avisamos en cuanto salga en camino! 🔥`;
    } else if (type === 'camino') {
      msg = `¡Hola ${order.customerName}! 🛵 Tu pedido #${order.orderNumber} ya va en camino a tu domicilio con nuestro cadete ${order.driverName || 'en moto'}. ¡Prepárate para recibirlo! 🍕✨`;
    } else if (type === 'listo') {
      msg = `¡Hola ${order.customerName}! 🍕 Tu pedido #${order.orderNumber} ya está listo y calentito en el mostrador para que pases a retirarlo por ${settings.address}. ¡Te esperamos!`;
    }
    window.open(`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Financial & Operational Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase tracking-wider">
            Total Verificado / Cobrado
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {formatCurrency(totalPaidRevenue)}
          </p>
          <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
            {orders.filter(o => o.paymentStatus === 'verificado').length} pedidos pagados
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block uppercase tracking-wider">
            Pendiente de Acreditar
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
            {formatCurrency(totalPendingRevenue)}
          </p>
          <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
            Transferencias o efectivo a verificar
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 shadow-xs">
          <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block uppercase tracking-wider">
            Comprobantes a Revisar
          </span>
          <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
            {pendingProofsCount}
          </p>
          <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80 mt-0.5">
            Fotos de transferencias enviadas
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 shadow-xs">
          <span className="text-[11px] font-bold text-orange-800 dark:text-orange-300 block uppercase tracking-wider">
            En Cocina / Horno
          </span>
          <p className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 font-mono mt-1">
            {orders.filter(o => o.status === 'en_horno' || o.status === 'pendiente').length}
          </p>
          <p className="text-[10px] text-orange-700/80 dark:text-orange-400/80 mt-0.5">
            Comandas activas
          </p>
        </div>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por # de pedido, cliente o teléfono..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Payment Filter Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs text-slate-400 font-bold uppercase hidden lg:inline mr-1">Pago:</span>
            <button
              onClick={() => setFilterPayment('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterPayment === 'todos'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Todos los Pagos
            </button>
            <button
              onClick={() => setFilterPayment('verificado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                filterPayment === 'verificado'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Pagados ({orders.filter(o => o.paymentStatus === 'verificado').length})</span>
            </button>
            <button
              onClick={() => setFilterPayment('comprobante_subido')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                filterPayment === 'comprobante_subido'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Con Comprobante ({pendingProofsCount})</span>
            </button>
            <button
              onClick={() => setFilterPayment('pendiente')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                filterPayment === 'pendiente'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendientes ({orders.filter(o => o.paymentStatus === 'pendiente').length})</span>
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterStatus === 'todos'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus('pendiente')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterStatus === 'pendiente'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Pendientes ({orders.filter(o => o.status === 'pendiente').length})
          </button>
          <button
            onClick={() => setFilterStatus('en_horno')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterStatus === 'en_horno'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            En Horno ({orders.filter(o => o.status === 'en_horno').length})
          </button>
          <button
            onClick={() => setFilterStatus('en_camino')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterStatus === 'en_camino'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            En Envío ({orders.filter(o => o.status === 'en_camino').length})
          </button>
          <button
            onClick={() => setFilterStatus('entregado')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterStatus === 'entregado'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Entregados ({orders.filter(o => o.status === 'entregado').length})
          </button>
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Clock className="w-7 h-7 opacity-50" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white">No se encontraron pedidos con este filtro</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Selecciona otra pestaña de estado o limpia la búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status];
            const paymentMethodInfo = PAYMENT_METHOD_CONFIG[order.paymentMethod];
            const paymentStatusInfo = PAYMENT_STATUS_CONFIG[order.paymentStatus];

            return (
              <div
                key={order.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all p-5 sm:p-6 space-y-4 shadow-sm hover:shadow-md ${
                  order.status === 'pendiente' 
                    ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header: Order #, Status, Time, Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-black text-lg text-slate-900 dark:text-white font-mono">
                      #{order.orderNumber}
                    </span>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                      {statusConfig.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDateTime(order.createdAt)}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {order.deliveryType === 'delivery' 
                        ? '🛵 Delivery' 
                        : order.deliveryType === 'salon' 
                        ? `🍽️ Salón (${order.tableName || `Mesa ${order.tableNumber}`})` 
                        : '🍕 Retiro Local'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">Total:</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                {/* Grid: Customer Info & Items List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Column 1: Customer & Address */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                        Cliente
                      </span>
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${buildWhatsAppOrderMessage(order, settings)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      <span>{order.customerName}</span>
                    </p>
                    <p className="text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customerPhone}</span>
                    </p>

                    {order.deliveryType === 'delivery' && order.deliveryAddress && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-0.5">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{order.deliveryAddress.street} {order.deliveryAddress.number} {order.deliveryAddress.apartment && `(${order.deliveryAddress.apartment})`}</span>
                        </p>
                        {order.deliveryAddress.cornerOrNotes && (
                          <p className="text-slate-500 pl-5 text-[11px]">
                            {order.deliveryAddress.cornerOrNotes}
                          </p>
                        )}
                      </div>
                    )}

                    {order.orderNotes && (
                      <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-[11px]">
                        <strong>Nota:</strong> {order.orderNotes}
                      </div>
                    )}
                  </div>

                  {/* Column 2: Items in Order */}
                  <div className="md:col-span-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                        Comanda de Cocina ({order.items.length} ítems)
                      </span>
                      <button
                        onClick={() => setTicketModalOrder(order)}
                        className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" /> Imprimir Comanda
                      </button>
                    </div>

                    <div className="divide-y divide-slate-200/60 dark:divide-slate-700/60 max-h-32 overflow-y-auto pr-1 space-y-1">
                      {order.items.map((item) => (
                        <div key={item.cartItemId} className="pt-1 first:pt-0 flex items-start justify-between">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {item.quantity}x {item.productName}
                              {item.selectedSize && <span className="font-normal text-slate-500"> ({item.selectedSize.name.split(' ')[0]})</span>}
                            </p>
                            {item.selectedCrust && item.selectedCrust.extraPrice > 0 && (
                              <p className="text-[11px] text-amber-600 dark:text-amber-400">+ {item.selectedCrust.name}</p>
                            )}
                            {item.selectedToppings.length > 0 && (
                              <p className="text-[11px] text-slate-500">Extras: {item.selectedToppings.map(t => t.name).join(', ')}</p>
                            )}
                            {item.notes && (
                              <p className="text-[11px] text-rose-500 font-medium">⚠️ "{item.notes}"</p>
                            )}
                          </div>
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {formatCurrency(item.itemTotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Payment Verification & Status Transitions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Payment Verification Status & Quick Controls */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Pago:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {paymentMethodInfo.label}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${paymentStatusInfo.bg} ${paymentStatusInfo.color} border border-current/20 shadow-xs flex items-center gap-1`}>
                      {order.paymentStatus === 'verificado' && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                      {order.paymentStatus === 'comprobante_subido' && <Eye className="w-3 h-3 text-blue-600" />}
                      {order.paymentStatus === 'pendiente' && <Clock className="w-3 h-3 text-amber-600" />}
                      <span>{paymentStatusInfo.label}</span>
                    </span>

                    {/* Proof Viewer Button if proof exists */}
                    {order.transferProofUrl && (
                      <button
                        onClick={() => setSelectedProofOrder(order)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl font-bold hover:bg-blue-200 transition shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Comprobante</span>
                      </button>
                    )}

                    {/* Fast Payment Approval / Toggle */}
                    {order.paymentStatus !== 'verificado' ? (
                      <button
                        onClick={() => handleConfirmPayment(order.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition active:scale-95"
                        title="Marcar como pagado y verificado"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprobar Pago</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleTogglePaymentStatus(order.id, 'verificado')}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline px-1"
                        title="Cambiar a pendiente"
                      >
                        Desmarcar
                      </button>
                    )}
                  </div>

                  {/* Pipeline Action Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {order.status === 'pendiente' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'en_horno', 'Comanda aceptada y enviada a horno')}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-xs transition"
                        >
                          <Flame className="w-4 h-4" />
                          <span>Aceptar & Mandar a Horno 🔥</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'cancelado', 'Cancelado por el administrador')}
                          className="px-2.5 py-2 rounded-xl text-rose-500 hover:bg-rose-50 text-xs font-bold transition"
                        >
                          Rechazar
                        </button>
                      </>
                    )}

                    {order.status === 'en_horno' && (
                      <>
                        <button
                          onClick={() => handleSendCustomWhatsApp(order, 'horno')}
                          className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition"
                          title="Avisar que está en el horno por WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Aviso Horno</span>
                        </button>

                        {order.deliveryType === 'delivery' ? (
                          <button
                            onClick={() => setDriverAssignOrderId(order.id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition"
                          >
                            <Bike className="w-4 h-4" />
                            <span>Despachar Delivery 🛵</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'listo_retiro', 'Listo en mostrador')}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition"
                          >
                            <Store className="w-4 h-4" />
                            <span>Listo para Retirar 🍕</span>
                          </button>
                        )}
                      </>
                    )}

                    {(order.status === 'en_camino' || order.status === 'listo_retiro') && (
                      <>
                        <button
                          onClick={() => handleSendCustomWhatsApp(order, order.status === 'en_camino' ? 'camino' : 'listo')}
                          className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Aviso al Cliente</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'entregado', 'Entregado al cliente con éxito')}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Marcar como Entregado ✅</span>
                        </button>
                      </>
                    )}

                    {order.status === 'entregado' && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Completado con éxito
                      </span>
                    )}

                    {order.status === 'cancelado' && (
                      <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Pedido Cancelado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Driver Assignment Modal */}
      {driverAssignOrderId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white font-serif flex items-center gap-2">
              <Bike className="w-5 h-5 text-purple-600" />
              <span>Despachar Pedido con Cadete</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ingresa los datos del repartidor para que el cliente pueda verlos en su pantalla de seguimiento en vivo.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Nombre del Repartidor & Vehículo
                </label>
                <input
                  type="text"
                  value={driverNameInput}
                  onChange={(e) => setDriverNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Teléfono del Cadete (opcional)
                </label>
                <input
                  type="text"
                  value={driverPhoneInput}
                  onChange={(e) => setDriverPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDriverAssignOrderId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDispatchDriver(driverAssignOrderId)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
              >
                Confirmar Despacho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprobante de Transferencia Viewer Modal */}
      {selectedProofOrder && selectedProofOrder.transferProofUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Comprobante de Pago • Pedido #{selectedProofOrder.orderNumber}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cliente: {selectedProofOrder.customerName} ({selectedProofOrder.customerPhone})
                </p>
              </div>
              <button
                onClick={() => setSelectedProofOrder(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Monto Total del Pedido</span>
                <span className="text-base font-black text-blue-900 dark:text-blue-200 font-mono">
                  {formatCurrency(selectedProofOrder.total)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Estado Actual</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedProofOrder.paymentStatus === 'verificado' ? '🟢 Pagado' : '⏳ Pendiente de Aprobación'}
                </span>
              </div>
            </div>

            <div className="max-h-96 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              <img
                src={selectedProofOrder.transferProofUrl}
                alt="Comprobante de transferencia"
                className="w-full h-full max-h-96 object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedProofOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition"
              >
                Cerrar
              </button>

              {selectedProofOrder.paymentStatus !== 'verificado' && (
                <button
                  onClick={() => handleConfirmPayment(selectedProofOrder.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprobar Pago Ahora</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Printable Kitchen Ticket Modal */}
      {ticketModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border font-mono text-xs">
            <div className="text-center border-b pb-3 space-y-1">
              <h3 className="text-lg font-black">{settings.name}</h3>
              <p className="text-[10px] text-slate-500">COMANDA DE COCINA</p>
              <p className="text-base font-black">PEDIDO #{ticketModalOrder.orderNumber}</p>
              <p className="text-[11px]">{formatDateTime(ticketModalOrder.createdAt)}</p>
            </div>

            <div>
              <p><strong>MODALIDAD:</strong> {ticketModalOrder.deliveryType === 'delivery' ? 'DELIVERY A DOMICILIO' : 'RETIRO EN LOCAL'}</p>
              <p><strong>CLIENTE:</strong> {ticketModalOrder.customerName}</p>
              <p><strong>TEL:</strong> {ticketModalOrder.customerPhone}</p>
              {ticketModalOrder.deliveryAddress && (
                <p><strong>DIRECCIÓN:</strong> {ticketModalOrder.deliveryAddress.street} {ticketModalOrder.deliveryAddress.number} {ticketModalOrder.deliveryAddress.apartment}</p>
              )}
            </div>

            <div className="border-t border-b py-2 space-y-1.5">
              {ticketModalOrder.items.map((it, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>{it.quantity}x {it.productName}</span>
                    <span>{formatCurrency(it.itemTotal)}</span>
                  </div>
                  {it.selectedSize && <p className="text-[10px] text-slate-600">• {it.selectedSize.name}</p>}
                  {it.selectedCrust?.extraPrice ? <p className="text-[10px] text-slate-600">• {it.selectedCrust.name}</p> : null}
                  {it.selectedToppings.length > 0 && (
                    <p className="text-[10px] text-slate-600">• Extras: {it.selectedToppings.map(t => t.name).join(', ')}</p>
                  )}
                  {it.notes && <p className="text-[10px] font-bold text-red-600">• NOTA: {it.notes}</p>}
                </div>
              ))}
            </div>

            <div className="space-y-1 text-right font-bold">
              <p>TOTAL: {formatCurrency(ticketModalOrder.total)}</p>
              <p className="text-[10px] text-slate-500 uppercase">PAGO: {ticketModalOrder.paymentMethod}</p>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setTicketModalOrder(null)}
                className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800"
              >
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
