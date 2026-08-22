import React, { useState, useEffect, useMemo } from 'react';
import {
  Users2,
  TrendingUp,
  Coins,
  Trophy,
  Plus,
  RefreshCw,
  Printer,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Clock,
  Globe,
  Settings,
  Star,
  Flame,
  Bike,
  Award,
  CheckCircle,
  Calendar,
  DollarSign,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  FileSpreadsheet,
  AlertCircle,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Employee, EmployeeMetric } from '../types';

export const EmployeesView: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    logEmployeeMetric,
    setIsChatbotModalOpen,
    setIsTimeConfigModalOpen,
    businessConfig,
  } = useApp();

  // Navigation sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'equipo' | 'metricas' | 'comisiones' | 'configurar'>('equipo');

  // Month & Year Filter
  const [selectedMonth, setSelectedMonth] = useState<string>('Agosto');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState<boolean>(false);

  // Chart toggle
  const [isChartVisible, setIsChartVisible] = useState<boolean>(true);

  // Search & Role Filter in Equipo Tab
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');

  // Real-time Clock in Argentina Timezone
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  // Modals state
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isQuickMetricModalOpen, setIsQuickMetricModalOpen] = useState<boolean>(false);
  const [selectedEmpForMetric, setSelectedEmpForMetric] = useState<Employee | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Employee Form State
  const [formData, setFormData] = useState({
    name: '',
    role: 'pizzero' as 'pizzero' | 'repartidor' | 'cajero' | 'mozo' | 'encargado',
    phone: '',
    email: '',
    avatar: '👨‍🍳',
    baseSalary: 400000,
    commissionPerOrder: 300,
    shiftHours: 8,
    rating: 5.0,
  });

  // Quick Metric Form State
  const [metricForm, setMetricForm] = useState({
    date: new Date().toISOString().split('T')[0],
    ordersCount: 20,
    shiftHours: 8,
    productivityScore: 95,
    commission: 6000,
    notes: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Clock updater
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateFormatter = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      setCurrentTimeStr(timeFormatter.format(now));
      setCurrentDateStr(dateFormatter.format(now));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Aggregated Stats
  const activeEmployeesCount = employees.filter((e) => e.active).length;
  const avgProductivity =
    employees.length > 0
      ? Math.round(
          employees.reduce((sum, e) => sum + (e.productivityPercent || 90), 0) / employees.length
        )
      : 0;

  const totalCommissionsMonth = employees.reduce(
    (sum, e) => sum + (e.totalCommissions || 0),
    0
  );

  const topPerformer = useMemo(() => {
    if (employees.length === 0) return null;
    return [...employees].sort((a, b) => (b.productivityPercent || 0) - (a.productivityPercent || 0))[0];
  }, [employees]);

  // Chart Data Generation (dates 18 Ago - 22 Ago)
  const chartData = useMemo(() => {
    const days = [
      { date: '18 Ago', Diego: 94, Franco: 97, Sofia: 90, Gonzalo: 86 },
      { date: '19 Ago', Diego: 98, Franco: 99, Sofia: 94, Gonzalo: 89 },
      { date: '20 Ago', Diego: 93, Franco: 96, Sofia: 91, Gonzalo: 87 },
      { date: '21 Ago', Diego: 97, Franco: 100, Sofia: 93, Gonzalo: 90 },
      { date: '22 Ago', Diego: 96, Franco: 98, Sofia: 92, Gonzalo: 88 },
    ];
    return days;
  }, []);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone.includes(searchQuery);
      const matchesRole = roleFilter === 'todos' || emp.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [employees, searchQuery, roleFilter]);

  // Handle save new/edited employee
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Por favor ingresa el nombre del empleado');
      return;
    }

    if (editingEmployee) {
      await updateEmployee({
        ...editingEmployee,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        avatar: formData.avatar,
        baseSalary: formData.baseSalary,
        commissionPerOrder: formData.commissionPerOrder,
        shiftHours: formData.shiftHours,
        rating: formData.rating,
      });
      showToast(`Empleado ${formData.name} actualizado correctamente`);
    } else {
      await addEmployee({
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        avatar: formData.avatar,
        active: true,
        ordersProcessed: 0,
        shiftHours: formData.shiftHours,
        rating: formData.rating,
        productivityPercent: 95,
        totalCommissions: 0,
        commissionPerOrder: formData.commissionPerOrder,
        baseSalary: formData.baseSalary,
        metricsHistory: [],
      });
      showToast(`Nuevo empleado ${formData.name} registrado`);
    }

    setIsNewEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  // Open edit modal
  const handleEditClick = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      role: emp.role,
      phone: emp.phone,
      email: emp.email || '',
      avatar: emp.avatar || '👨‍🍳',
      baseSalary: emp.baseSalary || 400000,
      commissionPerOrder: emp.commissionPerOrder || 300,
      shiftHours: emp.shiftHours || 8,
      rating: emp.rating || 5.0,
    });
    setIsNewEmployeeModalOpen(true);
  };

  // Open quick metric log
  const handleOpenQuickMetric = (emp: Employee) => {
    setSelectedEmpForMetric(emp);
    const calculatedCommission = 20 * (emp.commissionPerOrder || 300);
    setMetricForm({
      date: new Date().toISOString().split('T')[0],
      ordersCount: 20,
      shiftHours: emp.shiftHours || 8,
      productivityScore: emp.productivityPercent || 95,
      commission: calculatedCommission,
      notes: 'Turno estándar registrado',
    });
    setIsQuickMetricModalOpen(true);
  };

  // Submit Quick Metric
  const handleSubmitMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpForMetric) return;

    await logEmployeeMetric(selectedEmpForMetric.id, {
      date: metricForm.date,
      ordersCount: Number(metricForm.ordersCount),
      shiftHours: Number(metricForm.shiftHours),
      productivityScore: Number(metricForm.productivityScore),
      commission: Number(metricForm.commission),
      notes: metricForm.notes,
    });

    showToast(`Métricas registradas para ${selectedEmpForMetric.name}`);
    setIsQuickMetricModalOpen(false);
    setSelectedEmpForMetric(null);
  };

  const monthsList = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div id="employees-productivity-view" className="space-y-6 max-w-7xl mx-auto pb-12 font-sans select-none">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-orange-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-orange-400 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* TOP HEADER (Exact design from screenshot) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-2">
        {/* Left: Title & Subtitle */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 shrink-0 shadow-xs">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Productividad Empleados
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Métricas, comisiones y desempeño del equipo
            </p>
          </div>
        </div>

        {/* Right: Date/Time Badge & Chatbot Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time & Timezone Widget */}
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-orange-200/80 shadow-xs flex flex-col items-end text-right">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 font-mono">
              <span className="text-orange-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {currentDateStr || 'sáb, 22 de ago de 2026'}
              </span>
              <span className="text-orange-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {currentTimeStr || '12:40:44 p.m.'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Globe className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-medium">
                Argentina · America/Argentina/Buenos_Aires
              </span>
            </div>
            <button
              onClick={() => setIsTimeConfigModalOpen(true)}
              className="text-[10px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
            >
              <Settings className="w-2.5 h-2.5" />
              Configura tu horario local
            </button>
          </div>

          {/* Orange Chatbot Button */}
          <button
            onClick={() => setIsChatbotModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/20 flex items-center gap-2 transition cursor-pointer active:scale-98"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Ver mi chatbot</span>
          </button>
        </div>
      </div>

      {/* 4 TOP METRIC CARDS (Clean White Rounded with Colored Circle Icons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Empleados Activos (Purple) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition">
          <div className="w-13 h-13 rounded-2xl bg-[#6366f1] text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 leading-none">
              {activeEmployeesCount}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1">
              Empleados activos
            </div>
          </div>
        </div>

        {/* Card 2: Productividad promedio (Teal / Emerald) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition">
          <div className="w-13 h-13 rounded-2xl bg-[#10b981] text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 leading-none">
              {avgProductivity > 0 ? `${avgProductivity}%` : '—'}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1">
              Productividad promedio
            </div>
          </div>
        </div>

        {/* Card 3: Comisiones del mes (Amber / Orange) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition">
          <div className="w-13 h-13 rounded-2xl bg-[#f59e0b] text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 leading-none">
              ${totalCommissionsMonth.toLocaleString('es-AR')}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1">
              Comisiones del mes
            </div>
          </div>
        </div>

        {/* Card 4: Mejor desempeño (Pink / Rose) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition">
          <div className="w-13 h-13 rounded-2xl bg-[#ec4899] text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-black text-slate-900 truncate leading-tight">
              {topPerformer ? topPerformer.name.split(' ')[0] : '—'}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              Mejor desempeño
            </div>
          </div>
        </div>
      </div>

      {/* SUB-HEADER TABS & MONTH/YEAR SELECTORS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        {/* Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab 1: Equipo */}
          <button
            onClick={() => setActiveSubTab('equipo')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'equipo'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Equipo</span>
          </button>

          {/* Tab 2: Registrar Métricas */}
          <button
            onClick={() => setActiveSubTab('metricas')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'metricas'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Registrar Métricas</span>
          </button>

          {/* Tab 3: Comisiones */}
          <button
            onClick={() => setActiveSubTab('comisiones')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'comisiones'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Comisiones</span>
          </button>

          {/* Tab 4: Configurar */}
          <button
            onClick={() => setActiveSubTab('configurar')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'configurar'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configurar</span>
          </button>
        </div>

        {/* Right: Month & Year Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto relative">
          <div className="relative">
            <button
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className="bg-white px-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
            >
              <span>{selectedMonth}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isMonthDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 grid grid-cols-3 gap-1 w-64 animate-in fade-in">
                {monthsList.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m);
                      setIsMonthDropdownOpen(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium text-left transition ${
                      selectedMonth === m
                        ? 'bg-orange-500 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold font-mono text-slate-700 shadow-xs">
            {selectedYear}
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS ROW */}
      <div className="flex flex-wrap items-center gap-3">
        {/* + Nuevo empleado */}
        <button
          onClick={() => {
            setEditingEmployee(null);
            setFormData({
              name: '',
              role: 'pizzero',
              phone: '',
              email: '',
              avatar: '👨‍🍳',
              baseSalary: 400000,
              commissionPerOrder: 300,
              shiftHours: 8,
              rating: 5.0,
            });
            setIsNewEmployeeModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow-md shadow-orange-500/20 flex items-center gap-2 transition cursor-pointer active:scale-98"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo empleado</span>
        </button>

        {/* Actualizar */}
        <button
          onClick={() => showToast('Métricas y desempeño actualizados')}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Actualizar</span>
        </button>

        {/* Imprimir reporte equipo */}
        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Imprimir reporte equipo</span>
        </button>
      </div>

      {/* CHART SECTION: PRODUCTIVIDAD DEL EQUIPO — AGOSTO 2026 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span>Productividad del equipo — {selectedMonth} {selectedYear}</span>
          </h2>

          <button
            onClick={() => setIsChartVisible(!isChartVisible)}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            {isChartVisible ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Ocultar</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Mostrar</span>
              </>
            )}
          </button>
        </div>

        {isChartVisible && (
          <div className="pt-2">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradDiego" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradFranco" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradSofia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[70, 100]}
                    ticks={[70, 80, 90, 100]}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '16px',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Productividad']}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingBottom: '10px' }}
                  />
                  <ReferenceLine y={85} stroke="#cbd5e1" strokeDasharray="4 4" label={{ value: 'Meta 85%', fill: '#94a3b8', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="Diego"
                    name="Diego (Pizzero)"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradDiego)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Franco"
                    name="Franco (Delivery)"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradFranco)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Sofia"
                    name="Sofía (Cajera)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradSofia)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: EQUIPO */}
      {activeSubTab === 'equipo' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'pizzero', label: 'Pizzeros 🍕' },
                { id: 'repartidor', label: 'Repartidores 🛵' },
                { id: 'cajero', label: 'Cajeros 💼' },
              ].map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setRoleFilter(rf.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    roleFilter === rf.id
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Employees List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-orange-400 shadow-xs hover:shadow-md transition flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-orange-50 text-orange-700 border border-orange-200">
                      {emp.role}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-black font-mono text-slate-800">
                        {emp.rating}
                      </span>
                    </div>
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-xs shrink-0 group-hover:scale-105 transition">
                      {emp.avatar || (emp.role === 'pizzero' ? '👨‍🍳' : emp.role === 'repartidor' ? '🛵' : '👩‍💼')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {emp.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {emp.phone}
                      </p>
                    </div>
                  </div>

                  {/* Productivity bar */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 mb-3">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Productividad:</span>
                      <span className="font-mono text-emerald-600">
                        {emp.productivityPercent || 90}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full"
                        style={{ width: `${emp.productivityPercent || 90}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">
                        Comandas
                      </span>
                      <span className="font-black text-slate-800 text-sm">
                        {emp.ordersProcessed}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">
                        Comisiones
                      </span>
                      <span className="font-black text-emerald-600 text-sm">
                        ${(emp.totalCommissions || 0).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenQuickMetric(emp)}
                    className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 border border-orange-200 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    <span>+ Métrica</span>
                  </button>

                  <button
                    onClick={() => handleEditClick(emp)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    title="Editar empleado"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar al empleado ${emp.name}?`)) {
                        deleteEmployee(emp.id);
                        showToast(`Empleado ${emp.name} eliminado`);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 transition cursor-pointer"
                    title="Eliminar empleado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: REGISTRAR MÉTRICAS */}
      {activeSubTab === 'metricas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Registrar Nueva Métrica */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span>Registrar Rendimiento Diario</span>
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedEmpForMetric) {
                  showToast('Selecciona un empleado de la lista');
                  return;
                }
                handleSubmitMetric(e);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-bold mb-1">Empleado</label>
                <select
                  value={selectedEmpForMetric?.id || ''}
                  onChange={(e) => {
                    const emp = employees.find((x) => x.id === e.target.value);
                    if (emp) {
                      setSelectedEmpForMetric(emp);
                      setMetricForm((prev) => ({
                        ...prev,
                        commission: prev.ordersCount * (emp.commissionPerOrder || 300),
                      }));
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800"
                >
                  <option value="">-- Seleccionar empleado --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha</label>
                  <input
                    type="date"
                    value={metricForm.date}
                    onChange={(e) => setMetricForm({ ...metricForm, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Horas Turno</label>
                  <input
                    type="number"
                    value={metricForm.shiftHours}
                    onChange={(e) => setMetricForm({ ...metricForm, shiftHours: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Comandas / Pedidos</label>
                  <input
                    type="number"
                    value={metricForm.ordersCount}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      const rate = selectedEmpForMetric?.commissionPerOrder || 300;
                      setMetricForm({
                        ...metricForm,
                        ordersCount: count,
                        commission: count * rate,
                      });
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Score Productividad (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={metricForm.productivityScore}
                    onChange={(e) => setMetricForm({ ...metricForm, productivityScore: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Comisión Calculada ($)</label>
                <input
                  type="number"
                  value={metricForm.commission}
                  onChange={(e) => setMetricForm({ ...metricForm, commission: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Observaciones / Notas</label>
                <textarea
                  rows={2}
                  placeholder="Ej: Excelente velocidad en horneado durante hora pico..."
                  value={metricForm.notes}
                  onChange={(e) => setMetricForm({ ...metricForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 cursor-pointer"
              >
                Guardar Métrica Diaria
              </button>
            </form>
          </div>

          {/* Right Table: Historial de Métricas Recientes */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-orange-500" />
                Historial de Métricas y Turnos Registrados
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">
                {selectedMonth} {selectedYear}
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">Empleado</th>
                    <th className="pb-3">Fecha</th>
                    <th className="pb-3">Comandas</th>
                    <th className="pb-3">Horas</th>
                    <th className="pb-3">Productividad</th>
                    <th className="pb-3 text-right">Comisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.flatMap((emp) =>
                    (emp.metricsHistory || []).map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-800 flex items-center gap-2">
                          <span>{emp.avatar || '👨‍🍳'}</span>
                          <span>{emp.name}</span>
                        </td>
                        <td className="py-3 text-slate-500 font-mono">{m.date}</td>
                        <td className="py-3 font-bold font-mono text-slate-800">{m.ordersCount}</td>
                        <td className="py-3 text-slate-600 font-mono">{m.shiftHours} hs</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800">
                            {m.productivityScore}%
                          </span>
                        </td>
                        <td className="py-3 text-right font-black font-mono text-emerald-600">
                          ${m.commission.toLocaleString('es-AR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: COMISIONES */}
      {activeSubTab === 'comisiones' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span>Liquidación y Resumen de Comisiones</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cálculo de incentivos por volumen de pizzas horneadas, entregas en tiempo y arqueos de caja
              </p>
            </div>

            <button
              onClick={() => {
                showToast('¡Comisiones del período liquidadas y exportadas!');
                setIsPrintModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Check className="w-4 h-4" />
              <span>Liquidar & Imprimir Recibos</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Empleado</th>
                  <th className="pb-3">Rol</th>
                  <th className="pb-3">Sueldo Base</th>
                  <th className="pb-3">Comisión / Unidad</th>
                  <th className="pb-3">Comandas Mes</th>
                  <th className="pb-3">Total Comisiones</th>
                  <th className="pb-3 text-right">Total a Cobrar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const base = emp.baseSalary || 400000;
                  const com = emp.totalCommissions || 0;
                  const total = base + com;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="py-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                          {emp.avatar || '👨‍🍳'}
                        </div>
                        <div>
                          <p>{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{emp.phone}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-slate-100 text-slate-700">
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-4 font-mono font-bold text-slate-700">
                        ${base.toLocaleString('es-AR')}
                      </td>
                      <td className="py-4 font-mono font-semibold text-slate-600">
                        ${(emp.commissionPerOrder || 300).toLocaleString('es-AR')}
                      </td>
                      <td className="py-4 font-mono font-bold text-slate-800">
                        {emp.ordersProcessed}
                      </td>
                      <td className="py-4 font-mono font-black text-amber-600">
                        +${com.toLocaleString('es-AR')}
                      </td>
                      <td className="py-4 text-right font-mono font-black text-sm text-emerald-600">
                        ${total.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: CONFIGURAR */}
      {activeSubTab === 'configurar' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs max-w-2xl space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-500" />
              <span>Reglas de Productividad e Incentivos</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configura los valores de incentivos para maestros pizzeros, repartidores y cajeros
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800">Valores de Comisión por defecto:</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Pizzero ($ por pizza)</label>
                  <input
                    type="number"
                    defaultValue={350}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Repartidor ($ por envío)</label>
                  <input
                    type="number"
                    defaultValue={450}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Cajero ($ por comanda)</label>
                  <input
                    type="number"
                    defaultValue={150}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800">Metas de Rendimiento:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Meta Mínima Productividad (%)</label>
                  <input
                    type="number"
                    defaultValue={85}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Bono por excelencia &gt;95% ($)</label>
                  <input
                    type="number"
                    defaultValue={15000}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => showToast('Configuración de incentivos guardada')}
              className="px-6 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO / EDITAR EMPLEADO */}
      {isNewEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {editingEmployee ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewEmployeeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Martín Palermo (Hornero)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rol / Puesto *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                  >
                    <option value="pizzero">🍕 Maestro Pizzero / Cocina</option>
                    <option value="repartidor">🛵 Repartidor / Delivery</option>
                    <option value="cajero">💼 Cajero / Mostrador</option>
                    <option value="mozo">🍽️ Mozo / Salón</option>
                    <option value="encargado">👑 Encargado General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ícono / Avatar</label>
                  <select
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-base"
                  >
                    <option value="👨‍🍳">👨‍🍳 Maestro Cocinero</option>
                    <option value="🛵">🛵 Repartidor Express</option>
                    <option value="👩‍💼">👩‍💼 Encargada / Caja</option>
                    <option value="🍕">🍕 Pizzeros</option>
                    <option value="🧑‍🍳">🧑‍🍳 Ayudante</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="11-4455-6677"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="empleado@bruzzone.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sueldo Base ($)</label>
                  <input
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Comisión / Pedido ($)</label>
                  <input
                    type="number"
                    value={formData.commissionPerOrder}
                    onChange={(e) => setFormData({ ...formData, commissionPerOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold text-amber-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewEmployeeModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  {editingEmployee ? 'Guardar Cambios' : 'Registrar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR MÉTRICA RÁPIDA */}
      {isQuickMetricModalOpen && selectedEmpForMetric && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">
                  {selectedEmpForMetric.avatar || '👨‍🍳'}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Cargar Turno / Métrica
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedEmpForMetric.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickMetricModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMetric} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha</label>
                  <input
                    type="date"
                    value={metricForm.date}
                    onChange={(e) => setMetricForm({ ...metricForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Horas Turno</label>
                  <input
                    type="number"
                    value={metricForm.shiftHours}
                    onChange={(e) => setMetricForm({ ...metricForm, shiftHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Comandas / Pedidos</label>
                  <input
                    type="number"
                    value={metricForm.ordersCount}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      const rate = selectedEmpForMetric.commissionPerOrder || 300;
                      setMetricForm({
                        ...metricForm,
                        ordersCount: count,
                        commission: count * rate,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Score Productividad (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={metricForm.productivityScore}
                    onChange={(e) => setMetricForm({ ...metricForm, productivityScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Comisión Total a Sumar ($)</label>
                <input
                  type="number"
                  value={metricForm.commission}
                  onChange={(e) => setMetricForm({ ...metricForm, commission: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-amber-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nota</label>
                <input
                  type="text"
                  placeholder="Detalle del desempeño..."
                  value={metricForm.notes}
                  onChange={(e) => setMetricForm({ ...metricForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickMetricModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-md cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPRIMIR REPORTE DE EQUIPO */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-300 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-black text-slate-900">
                  Reporte de Desempeño y Productividad del Equipo
                </h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Printable ticket style layout */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs font-mono">
              <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                <h2 className="text-base font-black uppercase text-slate-900 tracking-wider">
                  {businessConfig.name || 'Pizzería Bruzzone 128'}
                </h2>
                <p className="text-slate-600 font-sans text-xs">
                  INFORME DE PRODUCTIVIDAD Y COMISIONES
                </p>
                <p className="text-slate-500 text-[10px]">
                  Período: {selectedMonth} {selectedYear} | Emitido: {new Date().toLocaleDateString('es-AR')}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Personal Activo</span>
                  <strong className="text-sm font-black">{activeEmployeesCount}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Prod. Promedio</span>
                  <strong className="text-sm font-black">{avgProductivity}%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Total Comisiones</span>
                  <strong className="text-sm font-black text-emerald-600">
                    ${totalCommissionsMonth.toLocaleString('es-AR')}
                  </strong>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold uppercase text-[10px] text-slate-500">
                  Detalle por Empleado:
                </div>
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex justify-between items-center py-1.5 border-b border-slate-200/60"
                  >
                    <div>
                      <strong className="text-slate-800">{emp.name}</strong> ({emp.role})
                      <div className="text-[10px] text-slate-500">
                        {emp.ordersProcessed} comandas · {emp.shiftHours}hs turno · Score: {emp.productivityPercent}%
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900">
                        ${(emp.totalCommissions || 0).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  window.print();
                  setIsPrintModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
