/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { POSView } from './components/POSView';
import { KDSView } from './components/KDSView';
import { OrdersView } from './components/OrdersView';
import { ProductsView } from './components/ProductsView';
import { InventoryView } from './components/InventoryView';
import { CustomersView } from './components/CustomersView';
import { SalesAndReportsView } from './components/SalesAndReportsView';
import { EmployeesView } from './components/EmployeesView';
import { LiveOrdersPWAView } from './components/LiveOrdersPWAView';
import { BusinessSettingsView } from './components/BusinessSettingsView';
import { Header } from './components/Header';
import { ChatbotSimulatorModal } from './components/ChatbotSimulatorModal';
import { TimeConfigModal } from './components/TimeConfigModal';
import { ReceiptModal } from './components/ReceiptModal';
import { Menu, Sparkles, RotateCcw, PlusCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, orders, loadSampleOrders, clearAllOrders, simulateChatbotOrder } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Render current view
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'pedidos':
        return <OrdersView />;
      case 'clientes':
        return <CustomersView />;
      case 'pos':
        return <POSView />;
      case 'kds':
        return <KDSView />;
      case 'ventas':
        return <SalesAndReportsView type="ventas" />;
      case 'cancelaciones':
        return <SalesAndReportsView type="cancelaciones" />;
      case 'cortes':
        return <SalesAndReportsView type="cortes" />;
      case 'productos':
        return <ProductsView />;
      case 'costo-ventas':
        return <InventoryView subView="costo-ventas" />;
      case 'inventarios':
        return <InventoryView subView="inventarios" />;
      case 'stock-sucursal':
        return <InventoryView subView="stock-sucursal" />;
      case 'compras':
        return <InventoryView subView="compras" />;
      case 'productividad':
        return <EmployeesView />;
      case 'mi-chatbot':
        return (
          <div className="space-y-4">
            <DashboardView />
          </div>
        );
      case 'mi-negocio':
        return <BusinessSettingsView type="mi-negocio" />;
      case 'suscripciones':
        return <BusinessSettingsView type="suscripciones" />;
      case 'pedidos-vivo':
        return <LiveOrdersPWAView />;
      case 'instrucciones':
        return <BusinessSettingsView type="instrucciones" />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex text-slate-800 font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Left Sidebar */}
      <Sidebar
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        {/* Top Header Navigation Bar with Business Identity, Store Status & Clock */}
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* Main Body Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Global Modals */}
      <ChatbotSimulatorModal />
      <TimeConfigModal />
      <ReceiptModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
