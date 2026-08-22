import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  MessageSquare, 
  ShoppingBag, 
  DollarSign, 
  Calendar,
  UserCheck
} from 'lucide-react';
import { CustomerUser, Order, PizzeriaSettings } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface CustomersDirectoryProps {
  customer: CustomerUser;
  orders: Order[];
  settings: PizzeriaSettings;
}

export const CustomersDirectory: React.FC<CustomersDirectoryProps> = ({
  customer,
  orders,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique customer records from registered user + all orders
  const customerMap = new Map<string, {
    id: string;
    name: string;
    phone: string;
    email?: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
    addresses: string[];
  }>();

  // Add registered customer
  customerMap.set(customer.phone, {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    totalOrders: 0,
    totalSpent: 0,
    lastOrderDate: customer.createdAt,
    addresses: customer.savedAddresses.map(a => `${a.tag}: ${a.street} ${a.number}`),
  });

  // Aggregate from orders
  orders.forEach((ord) => {
    const key = ord.customerPhone;
    const existing = customerMap.get(key) || {
      id: `cust-${ord.id}`,
      name: ord.customerName,
      phone: ord.customerPhone,
      email: ord.customerEmail,
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: ord.createdAt,
      addresses: [],
    };

    existing.totalOrders += 1;
    if (ord.status !== 'cancelado') {
      existing.totalSpent += ord.total;
    }
    if (new Date(ord.createdAt) > new Date(existing.lastOrderDate)) {
      existing.lastOrderDate = ord.createdAt;
    }
    if (ord.deliveryAddress && !existing.addresses.some(a => a.includes(ord.deliveryAddress!.street))) {
      existing.addresses.push(`${ord.deliveryAddress.street} ${ord.deliveryAddress.number}`);
    }

    customerMap.set(key, existing);
  });

  const customerList = Array.from(customerMap.values()).filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-serif flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <span>Directorio de Clientes & CRM</span>
          </h3>
          <p className="text-xs text-slate-500">
            Historial de compras acumulado, contactos y domicilios frecuentes de tus clientes.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente o teléfono..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customerList.map((client) => {
          const cleanPhone = client.phone.replace(/\D/g, '');
          const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${client.name}! Te escribimos desde ${settings.name} 🍕✨`)}`;

          return (
            <div
              key={client.phone}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {client.name}
                    </h4>
                    <p className="text-xs text-slate-400">{client.phone}</p>
                  </div>
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                  title="Escribir por WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Pedidos</span>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">{client.totalOrders}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Gasto Acumulado</span>
                  <p className="font-extrabold text-sm text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(client.totalSpent)}</p>
                </div>
              </div>

              {/* Addresses */}
              {client.addresses.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" /> Domicilios Registrados:
                  </span>
                  {client.addresses.slice(0, 2).map((addr, idx) => (
                    <p key={idx} className="text-slate-600 dark:text-slate-300 truncate text-[11px]">
                      • {addr}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
