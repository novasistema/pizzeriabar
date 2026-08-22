import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Store,
  MonitorPlay,
  TrendingUp,
  Ban,
  FileSpreadsheet,
  Pizza,
  Calculator,
  Boxes,
  Building2,
  ShoppingBag,
  Users2,
  Bot,
  Briefcase,
  BadgeCheck,
  Radio,
  BookOpen,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<{ isOpenMobile?: boolean; onCloseMobile?: () => void }> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const { activeTab, setActiveTab, businessConfig } = useApp();

  const sections: MenuSection[] = [
    {
      title: 'PRINCIPAL',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4 text-sky-400" />,
          iconBg: 'bg-gradient-to-b from-sky-500/20 to-sky-600/30 border-sky-400/40 shadow-sky-500/20',
        },
        {
          id: 'pedidos',
          label: 'Pedidos',
          icon: <ClipboardList className="w-4 h-4 text-amber-400" />,
          iconBg: 'bg-gradient-to-b from-amber-500/20 to-amber-600/30 border-amber-400/40 shadow-amber-500/20',
        },
        {
          id: 'clientes',
          label: 'Clientes',
          icon: <Users className="w-4 h-4 text-indigo-400" />,
          iconBg: 'bg-gradient-to-b from-indigo-500/20 to-indigo-600/30 border-indigo-400/40 shadow-indigo-500/20',
        },
        {
          id: 'pos',
          label: 'Punto de venta',
          icon: <Store className="w-4 h-4 text-emerald-400" />,
          iconBg: 'bg-gradient-to-b from-emerald-500/20 to-emerald-600/30 border-emerald-400/40 shadow-emerald-500/20',
        },
        {
          id: 'kds',
          label: 'Pantallas KDS',
          icon: <MonitorPlay className="w-4 h-4 text-yellow-400" />,
          iconBg: 'bg-gradient-to-b from-yellow-500/20 to-yellow-600/30 border-yellow-400/40 shadow-yellow-500/20',
        },
        {
          id: 'ventas',
          label: 'Ventas',
          icon: <TrendingUp className="w-4 h-4 text-blue-400" />,
          iconBg: 'bg-gradient-to-b from-blue-500/20 to-blue-600/30 border-blue-400/40 shadow-blue-500/20',
        },
        {
          id: 'cancelaciones',
          label: 'Cancelaciones',
          icon: <Ban className="w-4 h-4 text-rose-400" />,
          iconBg: 'bg-gradient-to-b from-rose-500/20 to-rose-600/30 border-rose-400/40 shadow-rose-500/20',
        },
        {
          id: 'cortes',
          label: 'Cortes',
          icon: <FileSpreadsheet className="w-4 h-4 text-teal-400" />,
          iconBg: 'bg-gradient-to-b from-teal-500/20 to-teal-600/30 border-teal-400/40 shadow-teal-500/20',
        },
        {
          id: 'productos',
          label: 'Productos',
          icon: <Pizza className="w-4 h-4 text-pink-400" />,
          iconBg: 'bg-gradient-to-b from-pink-500/20 to-pink-600/30 border-pink-400/40 shadow-pink-500/20',
        },
        {
          id: 'costo-ventas',
          label: 'Costo de ventas',
          icon: <Calculator className="w-4 h-4 text-amber-500" />,
          iconBg: 'bg-gradient-to-b from-amber-600/20 to-amber-700/30 border-amber-500/40 shadow-amber-600/20',
        },
        {
          id: 'inventarios',
          label: 'Inventarios',
          icon: <Boxes className="w-4 h-4 text-cyan-400" />,
          iconBg: 'bg-gradient-to-b from-cyan-500/20 to-cyan-600/30 border-cyan-400/40 shadow-cyan-500/20',
        },
        {
          id: 'stock-sucursal',
          label: 'Stock por sucursal',
          icon: <Building2 className="w-4 h-4 text-blue-300" />,
          iconBg: 'bg-gradient-to-b from-blue-600/20 to-blue-700/30 border-blue-500/40 shadow-blue-600/20',
        },
        {
          id: 'compras',
          label: 'Compras',
          icon: <ShoppingBag className="w-4 h-4 text-violet-400" />,
          iconBg: 'bg-gradient-to-b from-violet-500/20 to-violet-600/30 border-violet-400/40 shadow-violet-500/20',
        },
      ],
    },
    {
      title: 'EMPLEADOS',
      items: [
        {
          id: 'productividad',
          label: 'Productividad',
          icon: <Users2 className="w-4 h-4 text-pink-400" />,
          iconBg: 'bg-gradient-to-b from-fuchsia-500/20 to-fuchsia-600/30 border-fuchsia-400/40 shadow-fuchsia-500/20',
        },
      ],
    },
    {
      title: 'CHATBOT',
      items: [
        {
          id: 'mi-chatbot',
          label: 'Mi chatbot',
          icon: <Bot className="w-4 h-4 text-cyan-300" />,
          iconBg: 'bg-gradient-to-b from-cyan-500/20 to-cyan-600/30 border-cyan-400/40 shadow-cyan-500/20',
        },
      ],
    },
    {
      title: 'NEGOCIO',
      items: [
        {
          id: 'mi-negocio',
          label: 'Mi negocio',
          icon: <Briefcase className="w-4 h-4 text-yellow-500" />,
          iconBg: 'bg-gradient-to-b from-yellow-500/20 to-yellow-600/30 border-yellow-400/40 shadow-yellow-500/20',
        },
        {
          id: 'suscripciones',
          label: 'Suscripciones',
          icon: <BadgeCheck className="w-4 h-4 text-purple-400" />,
          iconBg: 'bg-gradient-to-b from-purple-500/20 to-purple-600/30 border-purple-400/40 shadow-purple-500/20',
        },
        {
          id: 'pedidos-vivo',
          label: 'Pedidos en vivo',
          icon: <Radio className="w-4 h-4 text-violet-400" />,
          badge: 'PWA',
          iconBg: 'bg-gradient-to-b from-violet-500/20 to-violet-600/30 border-violet-400/40 shadow-violet-500/20',
        },
        {
          id: 'instrucciones',
          label: 'Instrucciones',
          icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
          iconBg: 'bg-gradient-to-b from-emerald-500/20 to-emerald-600/30 border-emerald-400/40 shadow-emerald-500/20',
        },
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      id="main-sidebar"
      className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#121319] text-slate-300 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header with Avatar */}
      <button
        onClick={() => handleItemClick('mi-negocio')}
        className="h-16 px-4 flex items-center gap-3 border-b border-slate-800/60 bg-[#121319] text-left hover:bg-slate-900/60 transition cursor-pointer group w-full"
        title="Configurar identidad del negocio"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-orange-400 font-bold text-xs overflow-hidden">
            {businessConfig.logoUrl ? (
              <img src={businessConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              '🍕'
            )}
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-white tracking-tight truncate group-hover:text-orange-400 transition">
            {businessConfig.name || 'Bruzzone128'}
          </span>
          <span className="text-[9px] tracking-wider text-slate-400 uppercase font-mono font-bold truncate">
            PANEL DE CONTROL
          </span>
        </div>
      </button>

      {/* Nav List with custom scrollbar */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <div className="px-2 py-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">
                {sec.title}
              </span>
            </div>

            <div className="space-y-1">
              {sec.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-btn-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                      isActive
                        ? 'border border-amber-500/80 bg-gradient-to-r from-amber-500/15 to-transparent text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 truncate">
                      <div
                        className={`w-7 h-7 rounded-lg border shadow-xs flex items-center justify-center transition-transform shrink-0 group-hover:scale-105 ${item.iconBg}`}
                      >
                        {item.icon}
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-[#101117] flex items-center justify-between">
        <button
          onClick={() => handleItemClick('mi-negocio')}
          className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition cursor-pointer"
          title="Ver identidad del negocio"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 shadow-sm flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-orange-400 text-xs overflow-hidden">
              {businessConfig.logoUrl ? (
                <img src={businessConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                '🍕'
              )}
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{businessConfig.name || 'Bruzzone128'}</p>
            <p className="text-[10px] text-slate-500 font-mono truncate">
              @{businessConfig.name ? businessConfig.name.toLowerCase().replace(/\s+/g, '') : 'bruzzone'}
            </p>
          </div>
        </button>

        <button
          id="btn-sidebar-logout"
          title="Identidad del negocio"
          onClick={() => handleItemClick('mi-negocio')}
          className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Briefcase className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
