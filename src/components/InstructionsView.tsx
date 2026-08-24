import React, { useState } from 'react';
import {
  BookOpen,
  Briefcase,
  Bot,
  Pizza,
  MessageCircle,
  Store,
  MonitorPlay,
  LayoutGrid,
  Check,
  ChevronRight,
  Play,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Boxes,
  Users,
  Users2,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TopHeaderWidget } from './TopHeaderWidget';

export const InstructionsView: React.FC = () => {
  const { setActiveTab, setIsChatbotModalOpen, businessConfig, products, orders } = useApp();
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

  const toggleStepCompleted = (stepNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum]
    );
  };

  const steps = [
    {
      number: 1,
      tag: 'PASO 1',
      tagColor: 'text-orange-600',
      bgColor: 'bg-orange-500',
      borderColor: 'border-orange-200',
      activeBorder: 'hover:border-orange-400',
      icon: <Briefcase className="w-5 h-5 text-white" />,
      title: 'Configura la identidad de tu negocio',
      description: 'Entra a Mi negocio y completa la información con la que operará tu sistema.',
      checklist: [
        'Nombre, logo, color y dirección',
        'Horarios, moneda y cuentas para transferencias',
        'Sucursales, cajeros y accesos de caja',
      ],
      btnText: 'Ir a Mi negocio →',
      btnClass: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20',
      action: () => setActiveTab('mi-negocio'),
      isCompleted: Boolean(businessConfig.name && businessConfig.phone),
    },
    {
      number: 2,
      tag: 'PASO 2',
      tagColor: 'text-teal-600',
      bgColor: 'bg-teal-600',
      borderColor: 'border-teal-200',
      activeBorder: 'hover:border-teal-400',
      icon: <Bot className="w-5 h-5 text-white" />,
      title: 'Prepara tu chatbot',
      description: 'En Mi chatbot configura cómo atenderás a tus clientes y cómo recibirás sus pedidos.',
      checklist: [
        'Número de WhatsApp que recibirá los pedidos',
        'Servicio a domicilio, recolección y formas de pago',
        'Mesas y opciones especiales si aplican a tu negocio',
      ],
      btnText: 'Configurar chatbot →',
      btnClass: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20',
      action: () => setIsChatbotModalOpen(true),
      isCompleted: Boolean(businessConfig.paymentAlias || businessConfig.phone),
    },
    {
      number: 3,
      tag: 'PASO 3',
      tagColor: 'text-pink-600',
      bgColor: 'bg-pink-600',
      borderColor: 'border-pink-200',
      activeBorder: 'hover:border-pink-400',
      icon: <Pizza className="w-5 h-5 text-white" />,
      title: 'Da de alta categorías y productos',
      description: 'Construye el catálogo que tus clientes verán al abrir el chatbot.',
      checklist: [
        'Crea primero las categorías del menú',
        'Agrega nombre, descripción, precio e imagen',
        'Configura variantes e ingredientes cuando los necesites',
      ],
      btnText: 'Agregar productos →',
      btnClass: 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/20',
      action: () => setActiveTab('productos'),
      isCompleted: products.length > 0,
    },
    {
      number: 4,
      tag: 'PASO 4',
      tagColor: 'text-purple-600',
      bgColor: 'bg-purple-600',
      borderColor: 'border-purple-200',
      activeBorder: 'hover:border-purple-400',
      icon: <MessageCircle className="w-5 h-5 text-white" />,
      title: 'Haz un pedido real en tu chatbot',
      description: 'Pulsa Ver mi chatbot y realiza un pedido completo como lo haría uno de tus clientes.',
      checklist: [
        'Comprueba el menú y el proceso de compra',
        'Finaliza el pedido con datos reales de prueba',
        'Confirma que llegue al WhatsApp configurado',
      ],
      btnText: 'Ver mi chatbot →',
      btnClass: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20',
      action: () => setIsChatbotModalOpen(true),
      isCompleted: orders.some((o) => o.source === 'chatbot'),
    },
    {
      number: 5,
      tag: 'PASO 5',
      tagColor: 'text-emerald-600',
      bgColor: 'bg-emerald-600',
      borderColor: 'border-emerald-200',
      activeBorder: 'hover:border-emerald-400',
      icon: <Store className="w-5 h-5 text-white" />,
      title: 'Prueba el Punto de venta',
      description: 'Crea pedidos manuales desde el POS para conocer el flujo de caja y comprobar qué sencillo es operar.',
      checklist: [
        'Abre la caja o selecciona una sucursal',
        'Agrega productos y cobra un pedido de prueba',
        'Revisa el ticket y el movimiento en tus reportes',
      ],
      btnText: 'Abrir Punto de venta →',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
      action: () => setActiveTab('pos'),
      isCompleted: orders.some((o) => o.source === 'pos' || o.source === 'local'),
    },
    {
      number: 6,
      tag: 'PASO 6',
      tagColor: 'text-blue-600',
      bgColor: 'bg-blue-600',
      borderColor: 'border-blue-200',
      activeBorder: 'hover:border-blue-400',
      icon: <MonitorPlay className="w-5 h-5 text-white" />,
      title: 'Habilita y abre una pantalla KDS',
      description: 'Configura un área de preparación y mira en tiempo real lo que vería tu cocinero, la barra o el encargado de pedidos.',
      checklist: [
        'Crea o habilita un área de preparación',
        'Asigna categorías y productos al área',
        'Abre su pantalla KDS y envía un pedido de prueba',
      ],
      btnText: 'Configurar KDS →',
      btnClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
      action: () => setActiveTab('kds'),
      isCompleted: orders.length > 0,
    },
  ];

  return (
    <div id="instructions-module" className="max-w-7xl mx-auto space-y-5 pb-12 animate-in fade-in">
      {/* 1. Header Bar matching original design */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="p-1.5 rounded-lg bg-orange-100/80 text-orange-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Instrucciones
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Guía rápida para configurar y probar tu sistema
          </p>
        </div>

        {/* Top Right Widget (Date/Time + Chatbot CTA) */}
        <TopHeaderWidget />
      </div>

      {/* 2. Hero Section: "Capacitación Rápida" */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-slate-50 border border-indigo-100/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs relative overflow-hidden">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase text-purple-700 bg-purple-100/80 border border-purple-200/60 font-mono">
            <Sparkles className="w-3 h-3 text-purple-600" />
            CAPACITACIÓN RÁPIDA
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Configura y prueba ChatBotPro en 6 pasos
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Completa este recorrido para conocer el flujo esencial del sistema y dejar tu negocio listo para recibir pedidos.
          </p>
        </div>

        {/* Action Button: Ver Introducción */}
        <div className="shrink-0">
          <button
            onClick={() => setShowIntroModal(true)}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 shadow-xs font-bold text-xs sm:text-sm flex items-center gap-2 transition hover:shadow-md cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 text-purple-600 fill-purple-600/20" />
            <span>Ver Introducción</span>
          </button>
        </div>
      </div>

      {/* 3. The 6-Step Grid (2 Columns x 3 Rows) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {steps.map((step) => {
          const isDone = completedSteps.includes(step.number) || step.isCompleted;

          return (
            <div
              key={step.number}
              className={`bg-white rounded-3xl p-6 border ${step.borderColor} ${step.activeBorder} shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group`}
            >
              {/* Top Row: Step Tag + Number Indicator */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl ${step.bgColor} flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider font-mono ${step.tagColor}`}>
                      {step.tag}
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight mt-0.5">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => toggleStepCompleted(step.number, e)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition cursor-pointer ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                    }`}
                    title={isDone ? 'Paso completado' : 'Marcar como completado'}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                  </button>
                </div>
              </div>

              {/* Middle Section: Description & Checklist */}
              <div className="my-4 space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.description}
                </p>

                <div className="space-y-1.5 pt-1">
                  {step.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="text-slate-400 font-bold text-[11px]">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={step.action}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm flex items-center gap-2 transition cursor-pointer active:scale-95 ${step.btnClass}`}
                >
                  <span>{step.btnText}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Footer: "Después explora los demás módulos" */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <LayoutGrid className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">
            Después explora los demás módulos
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Revisa reportes, ventas, costos de ventas, inventarios, stock por sucursal, compras, clientes y productividad. Todos siguen la misma lógica sencilla para darte control completo de tu negocio.
          </p>
        </div>
      </div>

      {/* Interactive Modal: Ver Introducción */}
      {showIntroModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-slate-800 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Introducción a ChatBotPro
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recorrido guiado para poner en marcha tu negocio en minutos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIntroModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Visual Preview */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Bot className="w-4 h-4" /> FLUJO AUTOMATIZADO 24/7
                </span>
                <span>Bruzzone 128 Pro</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center py-2">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <div className="text-xl">💬</div>
                  <div className="text-[11px] font-bold text-slate-200">1. Cliente pide</div>
                  <div className="text-[10px] text-slate-400">Por WhatsApp Bot</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <div className="text-xl">👨‍🍳</div>
                  <div className="text-[11px] font-bold text-slate-200">2. Cocina prepara</div>
                  <div className="text-[10px] text-slate-400">Pantalla KDS</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <div className="text-xl">🛵</div>
                  <div className="text-[11px] font-bold text-slate-200">3. Reparto & Cobro</div>
                  <div className="text-[10px] text-slate-400">Caja & POS</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                Cada pedido recibido por el chatbot genera automáticamente el ticket en el sistema POS, se envía a la pantalla de cocina (KDS) y actualiza tus reportes y balance de caja en tiempo real.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">¿Listo para comenzar?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIntroModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowIntroModal(false);
                    setActiveTab('mi-negocio');
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Iniciar con Paso 1</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
