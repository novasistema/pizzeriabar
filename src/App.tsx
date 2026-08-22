import React, { useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  CartItem, 
  Order, 
  CustomerUser, 
  PizzeriaSettings,
  RestaurantTable
} from './types';
import { StorageService } from './services/storageService';
import { soundManager } from './utils/audio';
import { formatCurrency } from './utils/formatters';

// Components
import { Navbar, ViewMode } from './components/Navbar';
import { MenuCatalog } from './components/customer/MenuCatalog';
import { ProductModal } from './components/customer/ProductModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderTrackerModal } from './components/customer/OrderTrackerModal';
import { CustomerProfileModal } from './components/customer/CustomerProfileModal';

// Admin Components
import { AdminHeader, AdminTab } from './components/admin/AdminHeader';
import { OrdersManager } from './components/admin/OrdersManager';
import { MenuManager } from './components/admin/MenuManager';
import { ReportsAnalytics } from './components/admin/ReportsAnalytics';
import { StoreSettings } from './components/admin/StoreSettings';
import { CustomersDirectory } from './components/admin/CustomersDirectory';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { StaffPortalModal } from './components/admin/StaffPortalModal';
import { WaiterMode } from './components/waiter/WaiterMode';
import { Lock, Store, Pizza } from 'lucide-react';

export default function App() {
  // Global View State
  const [viewMode, setViewMode] = useState<ViewMode>('customer');
  const [adminTab, setAdminTab] = useState<AdminTab>('orders');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [isStaffPortalOpen, setIsStaffPortalOpen] = useState<boolean>(false);
  const [staffPortalTab, setStaffPortalTab] = useState<'waiter' | 'admin'>('waiter');

  // App Data State (synced with StorageService)
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [customer, setCustomer] = useState<CustomerUser>(StorageService.getCustomer());
  const [settings, setSettings] = useState<PizzeriaSettings>(StorageService.getSettings());
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals & Drawers State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Initialize and load data
  const loadFreshData = useCallback(() => {
    setProducts(StorageService.getProducts());
    setOrders(StorageService.getOrders());
    setTables(StorageService.getTables());
    setCustomer(StorageService.getCustomer());
    setSettings(StorageService.getSettings());
    setCart(StorageService.getCart());
  }, []);

  useEffect(() => {
    // Initialize real-time Firebase sync
    StorageService.initFirebaseSync();

    // Initial load
    loadFreshData();

    // Check URL parameters for view
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlView = urlParams.get('view');
      if (urlView === 'customer' || urlView === 'menu') {
        setViewMode('customer');
      } else if (urlView === 'waiter' || urlView === 'mozo' || urlView === 'salon') {
        setViewMode('waiter');
      } else if (urlView === 'admin') {
        if (!isAdminAuthenticated) {
          setIsAdminAuthModalOpen(true);
        } else {
          setViewMode('admin');
        }
      }
    } catch (e) {
      // Ignore URL parsing errors in iframe/sandboxed environments
    }

    // Listen for storage events dispatched when data changes
    const handleStorageUpdate = (e: CustomEvent) => {
      loadFreshData();
    };

    window.addEventListener('pizza_storage_updated' as any, handleStorageUpdate);
    return () => {
      window.removeEventListener('pizza_storage_updated' as any, handleStorageUpdate);
    };
  }, [loadFreshData, isAdminAuthenticated]);

  // Cart Actions
  const handleAddToCart = (item: CartItem) => {
    StorageService.addToCart(item);
    soundManager.playAddToCart();
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    StorageService.updateCartQuantity(cartItemId, delta);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    StorageService.removeFromCart(cartItemId);
  };

  const handleClearCart = () => {
    StorageService.clearCart();
  };

  const handleRepeatOrder = (items: CartItem[]) => {
    items.forEach((item) => {
      StorageService.addToCart({
        ...item,
        cartItemId: `${item.productId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      });
    });
    setIsCartOpen(true);
  };

  // Order Placement Success Handler
  const handleOrderPlaced = (newOrder: Order) => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setActiveTrackingOrder(newOrder);
    loadFreshData();
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + item.itemTotal, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-amber-500 selection:text-white pb-20 md:pb-0">
      {/* Top Main Navigation & Mobile Bottom Bar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={(mode) => {
          if (mode === 'admin' && !isAdminAuthenticated) {
            setStaffPortalTab('admin');
            setIsStaffPortalOpen(true);
          } else {
            setViewMode(mode);
          }
        }}
        onOpenStaffPortal={() => {
          setStaffPortalTab('waiter');
          setIsStaffPortalOpen(true);
        }}
        isAdminAuthenticated={isAdminAuthenticated}
        settings={settings}
        cartItems={cart}
        setIsCartOpen={setIsCartOpen}
        activeOrder={activeTrackingOrder || orders[0] || null}
        setIsTrackerOpen={(open) => {
          if (open) {
            setActiveTrackingOrder(activeTrackingOrder || orders[0] || null);
          } else {
            setActiveTrackingOrder(null);
          }
        }}
        setIsProfileOpen={setIsProfileOpen}
        customer={customer}
        pendingOrdersCount={orders.filter(o => o.status === 'pendiente').length}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {viewMode === 'customer' ? (
          /* =========================================================================
             1. CUSTOMER VIEW: Visual Menu Catalog & Ordering Experience
             ========================================================================= */
          <div className="animate-in fade-in duration-300">
            <MenuCatalog
              products={products}
              settings={settings}
              onSelectProduct={setSelectedProductForModal}
              onQuickAddToCart={(prod) => {
                handleAddToCart({
                  cartItemId: `${prod.id}-${Date.now()}`,
                  productId: prod.id,
                  productName: prod.name,
                  category: prod.category,
                  basePrice: prod.price,
                  quantity: 1,
                  itemTotal: prod.price,
                  imageUrl: prod.imageUrl,
                  selectedToppings: [],
                });
              }}
            />
          </div>
        ) : viewMode === 'waiter' ? (
          /* =========================================================================
             2. WAITER / MOZO SALON COMMAND VIEW
             ========================================================================= */
          <WaiterMode
            products={products}
            orders={orders}
            tables={tables}
            settings={settings}
            onExit={() => setViewMode('customer')}
          />
        ) : (
          /* =========================================================================
             3. PIZZERIA ADMIN VIEW: Real-time Kitchen, Orders, Menu & Reports
             ========================================================================= */
          <div className="space-y-6 animate-in fade-in duration-300">
            <AdminHeader
              activeTab={adminTab}
              setActiveTab={setAdminTab}
              orders={orders}
              settings={settings}
              onUpdateSettings={(newSet) => setSettings(newSet)}
              onOpenCustomerView={() => setViewMode('customer')}
              onOpenWaiterView={() => setViewMode('waiter')}
            />

            {/* Admin Tabs */}
            {adminTab === 'orders' && (
              <OrdersManager
                orders={orders}
                settings={settings}
                onRefreshOrders={loadFreshData}
              />
            )}

            {adminTab === 'menu' && (
              <MenuManager
                products={products}
                onRefreshProducts={loadFreshData}
              />
            )}

            {adminTab === 'reports' && (
              <ReportsAnalytics
                orders={orders}
                settings={settings}
              />
            )}

            {adminTab === 'customers' && (
              <CustomersDirectory
                customer={customer}
                orders={orders}
                settings={settings}
              />
            )}

            {adminTab === 'settings' && (
              <StoreSettings
                settings={settings}
                onUpdateSettings={(newSet) => setSettings(newSet)}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Quick Cart Bar on Mobile when Cart has items */}
      {viewMode === 'customer' && totalCartCount > 0 && !isCartOpen && !isCheckoutOpen && !selectedProductForModal && (
        <div className="md:hidden fixed bottom-16 left-3 right-3 z-35 animate-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-linear-to-r from-amber-500 via-rose-600 to-amber-600 text-white px-4 py-3 rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-between font-bold border border-white/20 active:scale-98 transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="bg-white text-slate-950 text-xs font-black px-2 py-0.5 rounded-full shadow-xs">
                {totalCartCount} {totalCartCount === 1 ? 'ítem' : 'ítems'}
              </span>
              <span className="text-xs font-black uppercase tracking-wider">Ver Mi Pedido</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-sm font-black">
              <span>{formatCurrency(totalCartPrice)}</span>
              <span className="text-amber-200">➔</span>
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt={settings.name} className="w-6 h-6 object-contain rounded-md" />
            )}
            <p className="font-serif font-bold text-slate-700 dark:text-slate-300">
              {settings.name} — {settings.slogan}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span>{settings.address}</span>
            {settings.phone && <span>• Tel: {settings.phone}</span>}
            {settings.whatsapp && <span>• WhatsApp: {settings.whatsapp}</span>}
            <button
              onClick={() => {
                setStaffPortalTab('waiter');
                setIsStaffPortalOpen(true);
              }}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline ml-2 flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Acceso Personal (Mozos & Cocina)</span>
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================================
         CUSTOMER MODALS & DRAWERS
         ========================================================================= */}

      {/* 1. Product Customization & Detail Modal */}
      <ProductModal
        product={selectedProductForModal}
        isOpen={!!selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={handleAddToCart}
      />

      {/* 2. Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        settings={settings}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 3. Step-by-Step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        settings={settings}
        customer={customer}
        onOrderSuccess={handleOrderPlaced}
      />

      {/* 4. Live Order Tracker Modal */}
      <OrderTrackerModal
        order={activeTrackingOrder}
        isOpen={!!activeTrackingOrder}
        onClose={() => setActiveTrackingOrder(null)}
        settings={settings}
      />

      {/* 5. Customer Profile & Order History Modal */}
      <CustomerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        customer={customer}
        orders={orders}
        onRepeatOrder={handleRepeatOrder}
        onOpenTracker={(order) => setActiveTrackingOrder(order)}
      />

      {/* 6. Staff Portal Modal (Mozo / Salón & Gestión / Cocina) */}
      <StaffPortalModal
        isOpen={isStaffPortalOpen}
        onClose={() => setIsStaffPortalOpen(false)}
        defaultTab={staffPortalTab}
        settings={settings}
        onSelectWaiter={(name) => {
          StorageService.saveWaiterName(name);
          setViewMode('waiter');
        }}
        onSelectAdmin={() => {
          setIsAdminAuthenticated(true);
          setViewMode('admin');
        }}
      />

      {/* 7. Admin Authentication PIN Modal (Fallback) */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setIsAdminAuthModalOpen(false);
          setViewMode('admin');
        }}
        settings={settings}
      />
    </div>
  );
}
