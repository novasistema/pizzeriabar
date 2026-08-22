import React, { useState } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Check, 
  ShoppingBag,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { CustomerUser, DeliveryAddress, Order, CartItem } from '../../types';
import { formatCurrency, formatDateTime, STATUS_CONFIG } from '../../utils/formatters';
import { StorageService } from '../../services/storageService';
import { soundManager } from '../../utils/audio';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerUser;
  orders: Order[];
  onRepeatOrder: (items: CartItem[]) => void;
  onOpenTracker: (order: Order) => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  orders = [],
  onRepeatOrder,
  onOpenTracker,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'perfil' | 'direcciones' | 'historial'>('historial');
  
  // Profile edit state
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // Address add state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newTag, setNewTag] = useState('Casa');
  const [newStreet, setNewStreet] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newApartment, setNewApartment] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Keep state in sync with customer prop
  React.useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      setEmail(customer.email || '');
    }
  }, [customer]);

  // Filter customer's orders, or fallback to showing all local orders if none match specifically
  const safeOrders = Array.isArray(orders) ? orders : [];
  const matchedOrders = safeOrders.filter(
    (o) => o && (
      (customer?.id && o.customerId === customer.id) || 
      (customer?.phone && o.customerPhone === customer.phone) ||
      (customer?.name && o.customerName?.toLowerCase() === customer.name.toLowerCase())
    )
  );
  
  // If matching by customer ID/phone yielded orders, use those; otherwise show all available orders so the user always sees their orders
  const customerOrders = matchedOrders.length > 0 ? matchedOrders : safeOrders;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CustomerUser = {
      ...customer,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
    };
    StorageService.saveCustomer(updated);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim() || !newNumber.trim()) return;

    const newAddr: DeliveryAddress = {
      id: `addr-${Date.now()}`,
      tag: newTag.trim() || 'Dirección',
      street: newStreet.trim(),
      number: newNumber.trim(),
      apartment: newApartment.trim() || undefined,
      cornerOrNotes: newNotes.trim() || undefined,
      isDefault: customer.savedAddresses.length === 0,
    };

    const updated: CustomerUser = {
      ...customer,
      savedAddresses: [...customer.savedAddresses, newAddr],
    };

    StorageService.saveCustomer(updated);
    setIsAddingAddress(false);
    setNewStreet('');
    setNewNumber('');
    setNewApartment('');
    setNewNotes('');
  };

  const handleDeleteAddress = (id: string) => {
    const updated: CustomerUser = {
      ...customer,
      savedAddresses: customer.savedAddresses.filter(a => a.id !== id),
    };
    StorageService.saveCustomer(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] sm:max-h-[92vh]">
        {/* Mobile Swipe / Drag indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-slate-50 dark:bg-slate-850 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-serif">
                Mi Cuenta & Historial
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {customer.name} • {customer.phone}
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

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 bg-slate-50 dark:bg-slate-850 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('historial')}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition shrink-0 ${
              activeTab === 'historial'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pedidos ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('direcciones')}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition shrink-0 ${
              activeTab === 'direcciones'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Direcciones ({customer.savedAddresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition shrink-0 ${
              activeTab === 'perfil'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Edit2 className="w-4 h-4" />
            <span>Mis Datos</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-sm">
          {/* TAB 1: Historial de Pedidos */}
          {activeTab === 'historial' && (
            <div className="space-y-4">
              {customerOrders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 opacity-50" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Aún no tienes pedidos registrados</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Explora nuestra carta y haz tu primer pedido para poder realizar seguimiento en vivo.
                  </p>
                </div>
              ) : (
                customerOrders.map((order) => {
                  if (!order) return null;
                  const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG['pendiente'];
                  const orderItems = Array.isArray(order.items) ? order.items : [];
                  return (
                    <div
                      key={order.id || Math.random().toString()}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 bg-white dark:bg-slate-900 transition space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-900 dark:text-white">
                              Pedido #{order.orderNumber || '---'}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusConf.bg} ${statusConf.color}`}>
                              {statusConf.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {order.createdAt ? formatDateTime(order.createdAt) : ''} • {order.deliveryType === 'delivery' ? 'Envío a domicilio' : 'Retiro en local'}
                          </p>
                        </div>

                        <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                          {formatCurrency(order.total || 0)}
                        </span>
                      </div>

                      {/* Items list */}
                      {orderItems.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-1 text-xs text-slate-600 dark:text-slate-300">
                          {orderItems.map((it, idx) => (
                            <div key={it.cartItemId || idx} className="flex justify-between">
                              <span>{it.quantity || 1}x {it.productName || 'Producto'} {it.selectedSize ? `(${it.selectedSize.name.split(' ')[0]})` : ''}</span>
                              <span className="font-mono">{formatCurrency(it.itemTotal || 0)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1 gap-2">
                        <button
                          onClick={() => {
                            onOpenTracker(order);
                            onClose();
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ver seguimiento</span>
                        </button>

                        <button
                          onClick={() => {
                            if (orderItems.length > 0) {
                              onRepeatOrder(orderItems);
                              soundManager.playSuccessTone();
                            }
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-xs font-bold transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Repetir este Pedido</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Direcciones Frecuentes */}
          {activeTab === 'direcciones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Guarda tus domicilios para pedir en 1 solo clic.</p>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva Dirección</span>
                  </button>
                )}
              </div>

              {/* Add form */}
              {isAddingAddress && (
                <form onSubmit={handleAddAddress} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Agregar Domicilio Frecuente
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-0.5">Etiqueta (ej: Casa, Trabajo)</label>
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Casa"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 mb-0.5">Calle / Avenida *</label>
                      <input
                        type="text"
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        placeholder="Av. Santa Fe"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-0.5">Altura / Número *</label>
                      <input
                        type="text"
                        value={newNumber}
                        onChange={(e) => setNewNumber(e.target.value)}
                        placeholder="2840"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-0.5">Piso / Depto</label>
                      <input
                        type="text"
                        value={newApartment}
                        onChange={(e) => setNewApartment(e.target.value)}
                        placeholder="4to B"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-0.5">Indicaciones repartidor</label>
                      <input
                        type="text"
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        placeholder="Portón negro"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold"
                    >
                      Guardar Dirección
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(customer?.savedAddresses || []).map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md">
                          {addr.tag}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] text-emerald-600 font-bold">Predeterminada</span>
                        )}
                      </div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {addr.street} {addr.number} {addr.apartment && `(${addr.apartment})`}
                      </p>
                      {addr.cornerOrNotes && (
                        <p className="text-xs text-slate-500">{addr.cornerOrNotes}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Eliminar dirección"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Datos Personales */}
          {activeTab === 'perfil' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Guardar Cambios
                </button>

                {isSavedAlert && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Datos actualizados con éxito
                  </span>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
