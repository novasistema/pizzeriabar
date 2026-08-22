import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Order,
  Product,
  Customer,
  Ingredient,
  Employee,
  EmployeeMetric,
  CashCut,
  BusinessConfig,
  TimeFilter,
  OrderStatus,
} from '../types';
import {
  initialBusinessConfig,
  initialProducts,
  initialCustomers,
  initialIngredients,
  initialEmployees,
  initialCashCuts,
  sampleOrders,
} from '../data/mockData';
import {
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from '../lib/firebase';

interface AppContextType {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Time filter
  timeFilter: TimeFilter;
  setTimeFilter: (tf: TimeFilter) => void;

  // Real-time Database state
  isFirebaseConnected: boolean;
  isSyncing: boolean;

  // Data
  orders: Order[];
  products: Product[];
  customers: Customer[];
  ingredients: Ingredient[];
  employees: Employee[];
  cashCuts: CashCut[];
  businessConfig: BusinessConfig;

  // Actions
  addOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  updateStock: (ingredientId: string, delta: number) => Promise<void>;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<void>;
  updateIngredient: (ingredient: Ingredient) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<Employee>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  logEmployeeMetric: (employeeId: string, metric: Omit<EmployeeMetric, 'id'>) => Promise<void>;
  updateBusinessConfig: (config: Partial<BusinessConfig>) => Promise<void>;
  addCashExpense: (amount: number, description: string) => Promise<void>;
  closeCurrentCashCut: (realCashAmount: number, notes?: string) => Promise<void>;

  // Helpers
  loadSampleOrders: () => Promise<void>;
  clearAllOrders: () => Promise<void>;
  simulateChatbotOrder: (customerName?: string, pizzaName?: string) => Promise<Order>;
  resetCatalogToDefaults: () => Promise<void>;

  // Modals
  isChatbotModalOpen: boolean;
  setIsChatbotModalOpen: (open: boolean) => void;
  isTimeConfigModalOpen: boolean;
  setIsTimeConfigModalOpen: (open: boolean) => void;
  selectedOrderForReceipt: Order | null;
  setSelectedOrderForReceipt: (order: Order | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'bruzzone_pos_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Día');

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Local state initialized with LocalStorage or fallbacks
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'products');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'customers');
      return saved ? JSON.parse(saved) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'ingredients');
      return saved ? JSON.parse(saved) : initialIngredients;
    } catch {
      return initialIngredients;
    }
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'employees');
      return saved ? JSON.parse(saved) : initialEmployees;
    } catch {
      return initialEmployees;
    }
  });

  const [cashCuts, setCashCuts] = useState<CashCut[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'cashCuts');
      return saved ? JSON.parse(saved) : initialCashCuts;
    } catch {
      return initialCashCuts;
    }
  });

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'businessConfig');
      return saved ? JSON.parse(saved) : initialBusinessConfig;
    } catch {
      return initialBusinessConfig;
    }
  });

  // Modal UI States
  const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);
  const [isTimeConfigModalOpen, setIsTimeConfigModalOpen] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  // Sync to local storage for instant offline / cache access
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'cashCuts', JSON.stringify(cashCuts));
  }, [cashCuts]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'businessConfig', JSON.stringify(businessConfig));
  }, [businessConfig]);

  // Real-time Firestore Listeners Setup
  useEffect(() => {
    let unsubProducts = () => {};
    let unsubOrders = () => {};
    let unsubCustomers = () => {};
    let unsubIngredients = () => {};
    let unsubConfig = () => {};

    try {
      // 1. Listen to Products
      const productsCol = collection(db, 'products');
      unsubProducts = onSnapshot(
        productsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Product[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...(docSnap.data() as Product), id: docSnap.id });
            });
            setProducts(list);
            setIsFirebaseConnected(true);
          } else {
            // Auto seed initial products into Firestore if empty
            initialProducts.forEach((p) => {
              setDoc(doc(db, 'products', p.id), p).catch(() => {});
            });
          }
        },
        (err) => {
          console.warn('Firestore Products listener notice:', err);
          setIsFirebaseConnected(false);
        }
      );

      // 2. Listen to Orders (Real-time updates for POS, KDS & Dashboard)
      const ordersCol = collection(db, 'orders');
      unsubOrders = onSnapshot(
        ordersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Order[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...(docSnap.data() as Order), id: docSnap.id });
            });
            // Sort by createdAt descending
            list.sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            setOrders(list);
            setIsFirebaseConnected(true);
          }
        },
        (err) => {
          console.warn('Firestore Orders listener notice:', err);
        }
      );

      // 3. Listen to Customers
      const customersCol = collection(db, 'customers');
      unsubCustomers = onSnapshot(
        customersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Customer[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...(docSnap.data() as Customer), id: docSnap.id });
            });
            setCustomers(list);
          } else {
            initialCustomers.forEach((c) => {
              setDoc(doc(db, 'customers', c.id), c).catch(() => {});
            });
          }
        },
        (err) => console.warn('Firestore Customers notice:', err)
      );

      // 4. Listen to Ingredients
      const ingredientsCol = collection(db, 'ingredients');
      unsubIngredients = onSnapshot(
        ingredientsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Ingredient[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...(docSnap.data() as Ingredient), id: docSnap.id });
            });
            setIngredients(list);
          } else {
            initialIngredients.forEach((ing) => {
              setDoc(doc(db, 'ingredients', ing.id), ing).catch(() => {});
            });
          }
        },
        (err) => console.warn('Firestore Ingredients notice:', err)
      );

      // 5. Listen to Employees
      let unsubEmployees = () => {};
      const employeesCol = collection(db, 'employees');
      unsubEmployees = onSnapshot(
        employeesCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Employee[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...(docSnap.data() as Employee), id: docSnap.id });
            });
            setEmployees(list);
          } else {
            initialEmployees.forEach((emp) => {
              setDoc(doc(db, 'employees', emp.id), emp).catch(() => {});
            });
          }
        },
        (err) => console.warn('Firestore Employees notice:', err)
      );

      // 6. Listen to Business Config
      const configDocRef = doc(db, 'business_config', 'main');
      unsubConfig = onSnapshot(
        configDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setBusinessConfig(docSnap.data() as BusinessConfig);
          } else {
            setDoc(configDocRef, initialBusinessConfig).catch(() => {});
          }
        },
        (err) => console.warn('Firestore Config notice:', err)
      );
    } catch (e) {
      console.warn('Firebase connection initial error:', e);
      setIsFirebaseConnected(false);
    }

    return () => {
      unsubProducts();
      unsubOrders();
      unsubCustomers();
      unsubIngredients();
      unsubConfig();
    };
  }, []);

  // Actions with Instant Local Update + Firestore Async Sync
  const addOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> => {
    setIsSyncing(true);
    const nextOrderNumber =
      orders.length > 0 ? Math.max(...orders.map((o) => o.orderNumber || 100)) + 1 : 101;
    const newId = `ord-${Date.now()}`;
    const newOrder: Order = {
      ...orderData,
      id: newId,
      orderNumber: nextOrderNumber,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setOrders((prev) => [newOrder, ...prev]);

    // Update customer stats
    if (orderData.customerPhone && orderData.customerPhone !== 'Salón') {
      const phone = orderData.customerPhone;
      setCustomers((prevCustomers) => {
        const existingIdx = prevCustomers.findIndex((c) => c.phone === phone);
        if (existingIdx >= 0) {
          const updated = [...prevCustomers];
          const updatedCust = {
            ...updated[existingIdx],
            totalOrders: updated[existingIdx].totalOrders + 1,
            totalSpent: updated[existingIdx].totalSpent + newOrder.total,
            lastOrderDate: newOrder.createdAt,
            address: orderData.customerAddress || updated[existingIdx].address,
          };
          updated[existingIdx] = updatedCust;
          setDoc(doc(db, 'customers', updatedCust.id), updatedCust).catch(() => {});
          return updated;
        } else {
          const newCust: Customer = {
            id: `c-${Date.now()}`,
            name: orderData.customerName,
            phone: orderData.customerPhone,
            address: orderData.customerAddress || 'Retiro en local',
            notes: orderData.notes || '',
            totalOrders: 1,
            totalSpent: newOrder.total,
            lastOrderDate: newOrder.createdAt,
          };
          setDoc(doc(db, 'customers', newCust.id), newCust).catch(() => {});
          return [newCust, ...prevCustomers];
        }
      });
    }

    try {
      await setDoc(doc(db, 'orders', newId), newOrder);
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Error syncing order to Firestore:', err);
    } finally {
      setIsSyncing(false);
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsSyncing(true);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Error updating order status in Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const cancelOrder = async (orderId: string, reason: string) => {
    setIsSyncing(true);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'cancelado', cancellationReason: reason }
          : o
      )
    );

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelado',
        cancellationReason: reason,
      });
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Error cancelling order in Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    setIsSyncing(true);
    const newId = `piz-${Date.now()}`;
    const newP: Product = {
      ...product,
      id: newId,
    };
    setProducts((prev) => [...prev, newP]);

    try {
      await setDoc(doc(db, 'products', newId), newP);
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Error saving product to Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
    return newP;
  };

  const updateProduct = async (product: Product) => {
    setIsSyncing(true);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));

    try {
      await setDoc(doc(db, 'products', product.id), product);
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Error updating product in Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setIsSyncing(true);
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await deleteDoc(doc(db, 'products', id));
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Error deleting product from Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent'>) => {
    const newId = `c-${Date.now()}`;
    const newC: Customer = {
      ...customer,
      id: newId,
      totalOrders: 0,
      totalSpent: 0,
    };
    setCustomers((prev) => [newC, ...prev]);

    try {
      await setDoc(doc(db, 'customers', newId), newC);
    } catch (err) {
      console.warn('Error adding customer to Firestore:', err);
    }
  };

  const updateCustomer = async (customer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? customer : c)));
    try {
      await setDoc(doc(db, 'customers', customer.id), customer);
    } catch (err) {
      console.warn('Error updating customer in Firestore:', err);
    }
  };

  const updateStock = async (ingredientId: string, delta: number) => {
    let updatedIng: Ingredient | undefined;
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id === ingredientId) {
          updatedIng = {
            ...ing,
            currentStock: Math.max(0, Number((ing.currentStock + delta).toFixed(2))),
          };
          return updatedIng;
        }
        return ing;
      })
    );

    if (updatedIng) {
      try {
        await setDoc(doc(db, 'ingredients', ingredientId), updatedIng);
      } catch (err) {
        console.warn('Error updating ingredient stock in Firestore:', err);
      }
    }
  };

  const addIngredient = async (ingredient: Omit<Ingredient, 'id'>) => {
    const newId = `ing-${Date.now()}`;
    const newI: Ingredient = { ...ingredient, id: newId };
    setIngredients((prev) => [...prev, newI]);

    try {
      await setDoc(doc(db, 'ingredients', newId), newI);
    } catch (err) {
      console.warn('Error adding ingredient to Firestore:', err);
    }
  };

  const updateIngredient = async (ingredient: Ingredient) => {
    setIngredients((prev) => prev.map((i) => (i.id === ingredient.id ? ingredient : i)));
    try {
      await setDoc(doc(db, 'ingredients', ingredient.id), ingredient);
    } catch (err) {
      console.warn('Error updating ingredient in Firestore:', err);
    }
  };

  const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    const newId = `emp-${Date.now()}`;
    const newEmp: Employee = {
      ...employeeData,
      id: newId,
      ordersProcessed: employeeData.ordersProcessed || 0,
      shiftHours: employeeData.shiftHours || 8,
      rating: employeeData.rating || 5.0,
      productivityPercent: employeeData.productivityPercent || 95,
      totalCommissions: employeeData.totalCommissions || 0,
      commissionPerOrder: employeeData.commissionPerOrder || 300,
      active: true,
      metricsHistory: employeeData.metricsHistory || [],
    };
    setEmployees((prev) => [...prev, newEmp]);
    try {
      await setDoc(doc(db, 'employees', newId), newEmp);
    } catch (err) {
      console.warn('Error adding employee to Firestore:', err);
    }
    return newEmp;
  };

  const updateEmployee = async (employee: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === employee.id ? employee : e)));
    try {
      await setDoc(doc(db, 'employees', employee.id), employee);
    } catch (err) {
      console.warn('Error updating employee in Firestore:', err);
    }
  };

  const deleteEmployee = async (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteDoc(doc(db, 'employees', id));
    } catch (err) {
      console.warn('Error deleting employee from Firestore:', err);
    }
  };

  const logEmployeeMetric = async (employeeId: string, metric: Omit<EmployeeMetric, 'id'>) => {
    const newMetric: EmployeeMetric = {
      ...metric,
      id: `m-${Date.now()}`,
    };

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          const currentHistory = emp.metricsHistory || [];
          const updatedHistory = [newMetric, ...currentHistory];
          const newOrdersCount = (emp.ordersProcessed || 0) + metric.ordersCount;
          const newCommissions = (emp.totalCommissions || 0) + metric.commission;
          const updatedEmp: Employee = {
            ...emp,
            ordersProcessed: newOrdersCount,
            totalCommissions: newCommissions,
            productivityPercent: metric.productivityScore,
            metricsHistory: updatedHistory,
          };

          setDoc(doc(db, 'employees', emp.id), updatedEmp).catch(() => {});
          return updatedEmp;
        }
        return emp;
      })
    );
  };

  const updateBusinessConfig = async (config: Partial<BusinessConfig>) => {
    setIsSyncing(true);
    const updated = { ...businessConfig, ...config };
    setBusinessConfig(updated);

    try {
      await setDoc(doc(db, 'business_config', 'main'), updated);
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Error saving business config to Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const addCashExpense = async (amount: number, description: string) => {
    if (cashCuts.length === 0) return;
    const activeCut = { ...cashCuts[0] };
    if (activeCut.status === 'abierta') {
      activeCut.expenses += amount;
      activeCut.notes = activeCut.notes
        ? `${activeCut.notes} | Egreso: $${amount} (${description})`
        : `Egreso: $${amount} (${description})`;
      const updated = [activeCut, ...cashCuts.slice(1)];
      setCashCuts(updated);

      try {
        await setDoc(doc(db, 'cash_cuts', activeCut.id), activeCut);
      } catch (err) {
        console.warn('Error saving cash cut to Firestore:', err);
      }
    }
  };

  const closeCurrentCashCut = async (realCashAmount: number, notes?: string) => {
    if (cashCuts.length === 0) return;
    const current = { ...cashCuts[0] };
    const expected = current.initialCash + current.cashSales - current.expenses;
    current.closedAt = new Date().toISOString();
    current.status = 'cerrada';
    current.totalReal = realCashAmount;
    current.totalExpected = expected;
    current.difference = realCashAmount - expected;
    current.notes = notes || current.notes;
    const updated = [current, ...cashCuts.slice(1)];
    setCashCuts(updated);

    try {
      await setDoc(doc(db, 'cash_cuts', current.id), current);
    } catch (err) {
      console.warn('Error closing cash cut in Firestore:', err);
    }
  };

  const loadSampleOrders = async () => {
    setIsSyncing(true);
    setOrders(sampleOrders);

    try {
      for (const ord of sampleOrders) {
        await setDoc(doc(db, 'orders', ord.id), ord);
      }
    } catch (err) {
      console.warn('Error loading sample orders to Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearAllOrders = async () => {
    setIsSyncing(true);
    setOrders([]);

    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (err) {
      console.warn('Error clearing orders in Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const resetCatalogToDefaults = async () => {
    setIsSyncing(true);
    setProducts(initialProducts);

    try {
      for (const p of initialProducts) {
        await setDoc(doc(db, 'products', p.id), p);
      }
    } catch (err) {
      console.warn('Error resetting catalog in Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const simulateChatbotOrder = async (
    customerName = 'Santiago Moreno',
    pizzaName = 'Fugazzeta Rellena Especial'
  ): Promise<Order> => {
    const targetProduct = products.find((p) => p.name.includes(pizzaName)) || products[0];
    const drinkProduct = products.find((p) => p.category === 'bebidas') || products[products.length - 1];

    const newOrd = await addOrder({
      customerName: customerName,
      customerPhone: `11-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      customerAddress: 'Av. Cabildo 2240 6° A, Belgrano',
      type: 'delivery',
      status: 'pendiente',
      source: 'chatbot',
      paymentMethod: 'mercadopago',
      isPaid: true,
      deliveryFee: businessConfig.deliveryFeeDefault,
      discount: 0,
      subtotal: targetProduct.price + (drinkProduct ? drinkProduct.price : 0),
      total:
        targetProduct.price +
        (drinkProduct ? drinkProduct.price : 0) +
        businessConfig.deliveryFeeDefault,
      notes: 'Pedido generado automáticamente desde WhatsApp Chatbot 🍕',
      items: [
        {
          id: `it-${Date.now()}-1`,
          productId: targetProduct.id,
          productName: targetProduct.name,
          quantity: 1,
          unitPrice: targetProduct.price,
          totalPrice: targetProduct.price,
          customization: { size: 'grande', notes: 'Bien cocida' },
        },
        ...(drinkProduct
          ? [
              {
                id: `it-${Date.now()}-2`,
                productId: drinkProduct.id,
                productName: drinkProduct.name,
                quantity: 1,
                unitPrice: drinkProduct.price,
                totalPrice: drinkProduct.price,
              },
            ]
          : []),
      ],
    });

    return newOrd;
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        timeFilter,
        setTimeFilter,
        isFirebaseConnected,
        isSyncing,
        orders,
        products,
        customers,
        ingredients,
        employees,
        cashCuts,
        businessConfig,
        addOrder,
        updateOrderStatus,
        cancelOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        updateStock,
        addIngredient,
        updateIngredient,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        logEmployeeMetric,
        updateBusinessConfig,
        addCashExpense,
        closeCurrentCashCut,
        loadSampleOrders,
        clearAllOrders,
        simulateChatbotOrder,
        resetCatalogToDefaults,
        isChatbotModalOpen,
        setIsChatbotModalOpen,
        isTimeConfigModalOpen,
        setIsTimeConfigModalOpen,
        selectedOrderForReceipt,
        setSelectedOrderForReceipt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
