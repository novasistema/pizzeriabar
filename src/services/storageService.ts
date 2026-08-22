import {
  Product,
  Order,
  PizzeriaSettings,
  CustomerUser,
  PizzaSizeOption,
  CrustOption,
  ExtraTopping,
  DailySalesReport,
  OrderStatus,
  CartItem,
  RestaurantTable,
  TableStatus
} from '../types';
import { db } from './firebase';
import { soundManager } from '../utils/audio';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';

function cleanForFirestore<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

export const DEFAULT_PIZZA_SIZES: PizzaSizeOption[] = [
  { id: 'ind', name: 'Single 7" (4 porciones • Individual)', slices: 4, priceMultiplier: 0.75 },
  { id: 'med', name: 'EP 10" (6 porciones • Mediana)', slices: 6, priceMultiplier: 1.0, isDefault: true },
  { id: 'gde', name: 'LP Álbum 12" (8 porciones • Vinilo Clásico)', slices: 8, priceMultiplier: 1.4 },
  { id: 'fam', name: 'Doble LP Boxset 14" (10 porciones • Familiar XL)', slices: 10, priceMultiplier: 1.75 },
];

export const DEFAULT_CRUSTS: CrustOption[] = [
  { id: 'tradicional', name: 'Masa a la Piedra de Leña (Crocante Clásica)', extraPrice: 0 },
  { id: 'masamadre', name: 'Masa Madre Fermentada 48hs (Edición Vinilo 180g)', extraPrice: 600 },
  { id: 'rellena_queso', name: 'Borde Relleno de Muzzarella (Heavy Riff de Queso)', extraPrice: 1400 },
  { id: 'rellena_cheddar', name: 'Borde Relleno de Cheddar & Bacon (Deluxe Edition)', extraPrice: 1600 },
];

export const DEFAULT_TOPPINGS: ExtraTopping[] = [
  { id: 'extra_muzza', name: 'Extra Muzzarella Fundida', price: 900, category: 'quesos' },
  { id: 'bacon_crocante', name: 'Bacon Ahumado Crocante', price: 1100, category: 'carnes' },
  { id: 'jamon_cocido', name: 'Jamón Cocido Natural', price: 850, category: 'carnes' },
  { id: 'champignones', name: 'Champiñones Salteados al Ajillo', price: 950, category: 'vegetales' },
  { id: 'aceitunas_negras', name: 'Aceitunas Negras Descarozadas', price: 600, category: 'vegetales' },
  { id: 'huevo_duro', name: 'Huevo Picado & Orégano Serrano', price: 500, category: 'vegetales' },
  { id: 'albahaca_fresca', name: 'Hojas de Albahaca Fresca & Oliva', price: 400, category: 'vegetales' },
  { id: 'salsa_picante', name: 'Salsa Hot Chili & Merkén Picante', price: 500, category: 'salsas' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'piz-1',
    name: 'Led Zeppelin • Margarita di Napoli',
    description: 'El himno clásico del rock: Salsa de tomates San Marzano, doble muzzarella fior di latte fundida a la leña, hojas de albahaca fresca macerada y aceite de oliva virgen extra.',
    price: 9800,
    category: 'pizzas_clasicas',
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isPopular: true,
    isVegetarian: true,
    sizes: DEFAULT_PIZZA_SIZES,
    crusts: DEFAULT_CRUSTS,
    availableToppings: DEFAULT_TOPPINGS,
    prepTimeMinutes: 20,
  },
  {
    id: 'piz-2',
    name: 'AC/DC • Highway to Pepperoni & Hot Honey',
    description: 'Riff explosivo: Generosa capa de pepperoni crujiente horneado a 450°C, muzzarella fundida, salsa de tomates asados y drizzle de miel con ajíes macerados.',
    price: 12500,
    category: 'pizzas_especiales',
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isPopular: true,
    isSpicy: true,
    sizes: DEFAULT_PIZZA_SIZES,
    crusts: DEFAULT_CRUSTS,
    availableToppings: DEFAULT_TOPPINGS,
    prepTimeMinutes: 22,
  },
  {
    id: 'piz-3',
    name: 'Deep Purple • Smoke on the Water (Fugazzeta Rellena)',
    description: 'Puro poder: Masa rellena con 400g de muzzarella y provolone ahumado, cubierta con abundante cebolla caramelizada, orégano serrano y parmesano gratinado.',
    price: 13200,
    category: 'pizzas_especiales',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isPopular: true,
    isVegetarian: true,
    sizes: DEFAULT_PIZZA_SIZES,
    crusts: DEFAULT_CRUSTS,
    availableToppings: DEFAULT_TOPPINGS,
    prepTimeMinutes: 25,
  },
  {
    id: 'piz-4',
    name: 'Queen • Bohemian Rhapsody (4 Quesos Sinfónicos)',
    description: 'Armonía magistral: Muzzarella hilada, queso gorgonzola azul intenso, provolone ahumado y suave fontina, coronada con nueces tostadas.',
    price: 12900,
    category: 'pizzas_especiales',
    imageUrl: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isVegetarian: true,
    sizes: DEFAULT_PIZZA_SIZES,
    crusts: DEFAULT_CRUSTS,
    availableToppings: DEFAULT_TOPPINGS,
    prepTimeMinutes: 20,
  },
  {
    id: 'piz-5',
    name: 'Pink Floyd • Dark Side of the Moon (Jamón Serrano & Rúcula)',
    description: 'Obra maestra de autor: Base de muzzarella y tomates confitados, láminas de jamón serrano curado 12 meses, rúcula salvaje fresca, escamas de parmesano y aceto balsámico.',
    price: 13900,
    category: 'pizzas_gourmet',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isNew: true,
    isPopular: true,
    sizes: DEFAULT_PIZZA_SIZES,
    crusts: DEFAULT_CRUSTS,
    availableToppings: DEFAULT_TOPPINGS,
    prepTimeMinutes: 22,
  },
  {
    id: 'piz-6',
    name: 'The Beatles • Abbey Road Napolitana',
    description: 'El clásico de Liverpool: Salsa casera, doble muzzarella, rodajas finas de tomate perita maduro, abundante ajo confitado en oliva, orégano de montaña y aceitunas negras.',
    price: 10800,
    category: 'pizzas_clasicas',
    imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isVegetarian: true,
    sizes: DEFAULT_PIZZA_SIZES,
    crusts: DEFAULT_CRUSTS,
    availableToppings: DEFAULT_TOPPINGS,
    prepTimeMinutes: 20,
  },
  {
    id: 'piz-7',
    name: 'Guns N\' Roses • Paradise City BBQ, Panceta & Pollo',
    description: 'Explosión rockera: Pollo desmenuzado glaseado en salsa BBQ ahumada artesanal, panceta crocante, cebolla morada asada y lluvia de cebollino fresco.',
    price: 13400,
    category: 'pizzas_gourmet',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    sizes: DEFAULT_PIZZA_SIZES,
    crusts: DEFAULT_CRUSTS,
    availableToppings: DEFAULT_TOPPINGS,
    prepTimeMinutes: 25,
  },
  {
    id: 'piz-8',
    name: 'The Doors • Light My Fire (Calabresa & Nduja)',
    description: 'Fuego puro: Salame tipo cantimpalo tostado a la leña, nduja artesanal picante, queso provolone fundido, pimientos morrones asados y toque de orégano.',
    price: 13600,
    category: 'pizzas_especiales',
    imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isSpicy: true,
    sizes: DEFAULT_PIZZA_SIZES,
    crusts: DEFAULT_CRUSTS,
    availableToppings: DEFAULT_TOPPINGS,
    prepTimeMinutes: 22,
  },
  // Empanadas Singles 7"
  {
    id: 'emp-1',
    name: 'Docena Boxset Rolling Stones (12 Empanadas)',
    description: 'Selección de 12 empanadas a elección: Lomo cortado a cuchillo suave/picante, Jamón y 3 Quesos, Pollo al verdeo ahumado, o 4 Quesos.',
    price: 14400,
    category: 'empanadas',
    imageUrl: 'https://images.unsplash.com/photo-1628106235463-c7936a282f17?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 18,
  },
  {
    id: 'emp-2',
    name: 'Empanada Lomo Rolling Stones (Carne a Cuchillo)',
    description: 'Relleno jugoso de lomo de ternera macerado con cebolla de verdeo, pimentón dulce, comino suave y huevo duro (unidad).',
    price: 1300,
    category: 'empanadas',
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    prepTimeMinutes: 15,
  },
  {
    id: 'emp-3',
    name: 'Empanada Black Sabbath (Jamón & 3 Quesos)',
    description: 'Jamón cocido de primera línea, muzzarella derretida, provolone y fontina con masa hojaldrada crujiente (unidad).',
    price: 1300,
    category: 'empanadas',
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    prepTimeMinutes: 15,
  },
  // Promociones Greatest Hits
  {
    id: 'prm-1',
    name: 'Boxset Woodstock: 2 LPs Grandes + 6 Empanadas + Gaseosa 1.5L',
    description: '1 LP Grande Led Zeppelin Margarita + 1 LP Grande AC/DC Pepperoni + 6 empanadas a elección + 1 Coca-Cola 1.5L bien fría.',
    price: 28500,
    category: 'promociones',
    imageUrl: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isPopular: true,
    prepTimeMinutes: 30,
  },
  {
    id: 'prm-2',
    name: 'Dúo Rock & Beer: 1 LP Grande + 2 Cervezas Artesanales IPA',
    description: 'Cualquier pizza LP grande a elección + 2 latas de Cerveza Artesanal IPA Woodstock bien heladas.',
    price: 16900,
    category: 'promociones',
    imageUrl: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    prepTimeMinutes: 22,
  },
  // Bebidas & Backstage
  {
    id: 'beb-1',
    name: 'Cerveza Artesanal IPA Woodstock (Lata 473ml)',
    description: 'Cerveza lupulada de sesión con aroma cítrico a maracuyá y amargor refrescante.',
    price: 2600,
    category: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1608270191850-8b1e17d6928e?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'beb-2',
    name: 'Cerveza Dark Side Stout (Lata 473ml)',
    description: 'Cerveza negra cremosa con notas a café espresso tostado y chocolate amargo.',
    price: 2700,
    category: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1518057111178-44a106bad636?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  {
    id: 'beb-3',
    name: 'Coca-Cola Sabor Original (1.5 Litros)',
    description: 'Gaseosa refrescante ideal para acompañar tus pizzas de vinilo.',
    price: 2400,
    category: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  {
    id: 'beb-4',
    name: 'Agua Mineral de Manantial (500ml)',
    description: 'Agua purificada natural en botella (con o sin gas).',
    price: 1200,
    category: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  // Postres & Encores
  {
    id: 'pos-1',
    name: 'Tiramisú Bohemian Delight con Mascarpone',
    description: 'Receta artesanal con vainillas embebidas en café espresso fuerte y licor amaretto, crema suave de mascarpone y cacao amargo.',
    price: 4500,
    category: 'postres',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'pos-2',
    name: 'Calzone Sweet Child O\' Nutella & Dulce de Leche',
    description: 'Masa de pizza horneada a la leña rellena de dulce de leche repostero y crema de avellanas con lluvia de azúcar impalpable.',
    price: 4900,
    category: 'postres',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isNew: true,
  }
];

export const INITIAL_SETTINGS: PizzeriaSettings = {
  name: 'Rock \'N\' Crust • Vinyl Pizza Bar',
  slogan: 'Pizzas a la leña, vinilos de 33 RPM & clásicos del rock',
  logoUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=300&q=80',
  phone: '+54 11 4890-ROCK',
  whatsapp: '+54 9 11 2345-6789',
  email: 'contacto@rockncrust.com',
  cuit: '30-71829341-8',
  instagram: '@rockncrust.pizza',
  website: 'https://rockncrust.com',
  address: 'Av. Corrientes 4500, Palermo Hollywood',
  city: 'Buenos Aires, Argentina',
  googleMapsUrl: 'https://maps.google.com/?q=Av.+Corrientes+4500+Buenos+Aires',
  isOpen: true,
  bannerMessage: '🎸 Sonando en Vinilo: Led Zeppelin, Queen, Pink Floyd & AC/DC • Hornos a 450°C & Envíos en Vivo',
  footerText: '¡Keep on Rocking! Elaborado con masa madre fermentada 48hs y los mejores discos de la historia.',
  adminPin: '1234',
  estimatedPrepTimeMinutes: 20,
  estimatedDeliveryTimeMinutes: 35,
  deliveryFeeBase: 1200,
  freeDeliveryOver: 25000,
  minimumOrderAmount: 4000,
  bankDetails: {
    walletProvider: 'Mercado Pago / Transferencia Directa',
    alias: 'ROCKNCRUST.PIZZA',
    cbu: '0000003100049281729014',
    bankName: 'Mercado Pago / Banco Santander',
    accountHolder: 'Rock N Crust Gastronomía SRL',
    cuit: '30-71829341-8',
    accountType: 'Cuenta Corriente en Pesos',
    paymentInstructions: 'Transfiere el monto exacto con el ALIAS y adjunta tu comprobante o envíalo por WhatsApp con tu número de pedido.',
    requireProof: true,
  },
  mercadoPagoQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021243650016com.mercadolibre0129https://mpago.la/pos/rockncrust',
  acceptCash: true,
  acceptTransfer: true,
  acceptMercadoPago: true,
  acceptCardOnDelivery: true,
  cashDiscountPercent: 0,
  openingHours: 'Mar a Dom: 19:00 a 01:30 hs (Viernes & Sábados hasta las 02:30)',
};

export const INITIAL_CUSTOMER: CustomerUser = {
  id: 'cust-demo-1',
  name: 'Gonzalo Rodríguez',
  phone: '+54 9 11 5544-3322',
  email: 'gonzalo.rodriguez@email.com',
  createdAt: '2026-01-15T18:00:00.000Z',
  savedAddresses: [
    {
      id: 'addr-1',
      tag: 'Casa',
      street: 'Av. Santa Fe',
      number: '2840',
      apartment: '4to B (Timbre: Rodríguez)',
      cornerOrNotes: 'Entre Austria y Sánchez de Bustamante. Portón negro.',
      city: 'Palermo, CABA',
      isDefault: true,
    },
    {
      id: 'addr-2',
      tag: 'Oficina / Trabajo',
      street: 'Thames',
      number: '1450',
      apartment: 'Piso 2, Coworking Tech',
      cornerOrNotes: 'Frente a la plaza. Anunciarse en recepción.',
      city: 'Palermo Soho, CABA',
      isDefault: false,
    }
  ],
  notes: 'Cliente frecuente, prefiere masa bien cocida/crocante.'
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1048',
    orderNumber: 1048,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    customerId: 'cust-demo-1',
    customerName: 'Gonzalo Rodríguez',
    customerPhone: '+54 9 11 5544-3322',
    customerEmail: 'gonzalo.rodriguez@email.com',
    deliveryType: 'delivery',
    deliveryAddress: INITIAL_CUSTOMER.savedAddresses[0],
    items: [
      {
        cartItemId: 'item-1',
        productId: 'piz-2',
        productName: 'Pepperoni Supreme & Miel Picante',
        category: 'pizzas_especiales',
        basePrice: 12500,
        quantity: 1,
        selectedSize: DEFAULT_PIZZA_SIZES[2], // Grande
        selectedCrust: DEFAULT_CRUSTS[2], // Borde relleno
        selectedToppings: [DEFAULT_TOPPINGS[0]], // Extra muzza
        notes: 'Bien dorada la masa por favor!',
        itemTotal: 12500 * 1.4 + 1400 + 900,
        imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
      },
      {
        cartItemId: 'item-2',
        productId: 'beb-1',
        productName: 'Cerveza Artesanal IPA Napoli (Lata 473ml)',
        category: 'bebidas',
        basePrice: 2600,
        quantity: 2,
        selectedToppings: [],
        itemTotal: 5200,
        imageUrl: 'https://images.unsplash.com/photo-1608270191850-8b1e17d6928e?auto=format&fit=crop&w=800&q=80',
      }
    ],
    subtotal: 25000,
    deliveryFee: 1200,
    discount: 0,
    total: 26200,
    paymentMethod: 'transferencia',
    paymentStatus: 'verificado',
    transferProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    status: 'en_horno',
    statusHistory: [
      { status: 'pendiente', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), note: 'Pedido recibido por la web' },
      { status: 'confirmado', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), note: 'Pago verificado por el cajero' },
      { status: 'en_horno', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), note: 'Pizzas ingresadas al horno de barro' },
    ],
    estimatedDeliveryTime: '30-40 min',
    driverName: 'Marcos Benítez (Moto Honda Roja)',
    driverPhone: '+54 9 11 4455-8899',
    orderNotes: 'Dejar en portería si no atiendo el timbre.'
  },
  {
    id: 'ord-1047',
    orderNumber: 1047,
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    customerName: 'Luciana Mendieta',
    customerPhone: '+54 9 11 6789-1122',
    deliveryType: 'delivery',
    deliveryAddress: {
      id: 'addr-luc',
      tag: 'Depto',
      street: 'Honduras',
      number: '4820',
      apartment: '8vo C',
      cornerOrNotes: 'Timbre Mendieta',
      city: 'Palermo',
    },
    items: [
      {
        cartItemId: 'item-3',
        productId: 'piz-1',
        productName: 'Margarita Di Napoli',
        category: 'pizzas_clasicas',
        basePrice: 9800,
        quantity: 1,
        selectedSize: DEFAULT_PIZZA_SIZES[1], // Mediana
        selectedCrust: DEFAULT_CRUSTS[1], // Masa Madre
        selectedToppings: [],
        itemTotal: 10400,
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
      },
      {
        cartItemId: 'item-4',
        productId: 'pos-1',
        productName: 'Tiramisú Tradicional con Mascarpone',
        category: 'postres',
        basePrice: 4500,
        quantity: 1,
        selectedToppings: [],
        itemTotal: 4500,
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
      }
    ],
    subtotal: 14900,
    deliveryFee: 1200,
    discount: 1490,
    discountCode: 'BIENVENIDO',
    total: 14610,
    paymentMethod: 'efectivo',
    paymentStatus: 'pagado_en_entrega',
    cashAmountPaidWith: 20000,
    status: 'en_camino',
    statusHistory: [
      { status: 'pendiente', timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString() },
      { status: 'confirmado', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
      { status: 'en_horno', timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
      { status: 'en_camino', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), note: 'Cadete Marcos en camino' },
    ],
    driverName: 'Marcos Benítez',
    driverPhone: '+54 9 11 4455-8899',
    estimatedDeliveryTime: '10-15 min',
  },
  {
    id: 'ord-1046',
    orderNumber: 1046,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    customerName: 'Santiago Romero',
    customerPhone: '+54 9 11 8899-7766',
    deliveryType: 'retiro',
    items: [
      {
        cartItemId: 'item-5',
        productId: 'piz-3',
        productName: 'Fugazzeta Rellena Porteña',
        category: 'pizzas_especiales',
        basePrice: 13200,
        quantity: 1,
        selectedSize: DEFAULT_PIZZA_SIZES[2],
        selectedCrust: DEFAULT_CRUSTS[0],
        selectedToppings: [],
        itemTotal: 18480,
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      }
    ],
    subtotal: 18480,
    deliveryFee: 0,
    discount: 0,
    total: 18480,
    paymentMethod: 'mercadopago',
    paymentStatus: 'verificado',
    status: 'listo_retiro',
    statusHistory: [
      { status: 'pendiente', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { status: 'en_horno', timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
      { status: 'listo_retiro', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), note: 'Listo en mostrador' },
    ],
    estimatedDeliveryTime: 'Listo para retirar en local',
  },
  {
    id: 'ord-1045',
    orderNumber: 1045,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    customerName: 'Valeria Cassini',
    customerPhone: '+54 9 11 3344-9988',
    deliveryType: 'delivery',
    deliveryAddress: {
      id: 'addr-val',
      tag: 'Casa',
      street: 'Gorriti',
      number: '5510',
      apartment: 'P.B. 2',
      city: 'Palermo',
    },
    items: [
      {
        cartItemId: 'item-6',
        productId: 'prm-1',
        productName: 'Combo Amigos: 2 Grandes + 6 Empanadas + Gaseosa 1.5L',
        category: 'promociones',
        basePrice: 28500,
        quantity: 1,
        selectedToppings: [],
        itemTotal: 28500,
        imageUrl: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=800&q=80',
      }
    ],
    subtotal: 28500,
    deliveryFee: 0, // Free delivery
    discount: 0,
    total: 28500,
    paymentMethod: 'transferencia',
    paymentStatus: 'verificado',
    status: 'entregado',
    statusHistory: [
      { status: 'pendiente', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
      { status: 'confirmado', timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString() },
      { status: 'en_horno', timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString() },
      { status: 'en_camino', timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString() },
      { status: 'entregado', timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(), note: 'Entregado al cliente con éxito' },
    ],
    driverName: 'Ezequiel Duarte',
  }
];

const INITIAL_TABLES: RestaurantTable[] = [
  { id: 'tbl-1', number: 1, name: 'Mesa 1 • Jimi Hendrix', capacity: 2, status: 'libre' },
  { id: 'tbl-2', number: 2, name: 'Mesa 2 • Led Zeppelin', capacity: 4, status: 'libre' },
  { id: 'tbl-3', number: 3, name: 'Mesa 3 • Pink Floyd (Ventana)', capacity: 4, status: 'libre' },
  { id: 'tbl-4', number: 4, name: 'Mesa 4 • Queen (Familiar)', capacity: 6, status: 'libre' },
  { id: 'tbl-5', number: 5, name: 'Mesa 5 • The Beatles', capacity: 2, status: 'libre' },
  { id: 'tbl-6', number: 6, name: 'Mesa 6 • Rolling Stones (Patio)', capacity: 4, status: 'libre' },
  { id: 'tbl-7', number: 7, name: 'Mesa 7 • AC/DC (Patio)', capacity: 4, status: 'libre' },
  { id: 'tbl-8', number: 8, name: 'Barra 1 • Guns N\' Roses', capacity: 1, status: 'libre' },
  { id: 'tbl-9', number: 9, name: 'Barra 2 • Nirvana Unplugged', capacity: 1, status: 'libre' },
  { id: 'tbl-10', number: 10, name: 'Salón VIP • Abbey Road Studio', capacity: 8, status: 'libre' },
];

const STORAGE_KEYS = {
  PRODUCTS: 'pizzeria_products_rock_v2',
  SETTINGS: 'pizzeria_settings_rock_v2',
  ORDERS: 'pizzeria_orders_rock_v2',
  CUSTOMER: 'pizzeria_customer_rock_v2',
  ACTIVE_ORDER_ID: 'pizzeria_active_order_id_rock_v2',
  CART: 'pizzeria_cart_rock_v2',
  TABLES: 'pizzeria_tables_rock_v2',
  WAITER_NAME: 'pizzeria_waiter_name_rock_v2',
};

export class StorageService {
  private static isFirebaseInitialized = false;

  private static dispatchUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pizza_storage_updated'));
    }
  }

  // Real-time Firestore synchronization
  public static initFirebaseSync(): void {
    if (this.isFirebaseInitialized) return;
    this.isFirebaseInitialized = true;

    try {
      // 1. Sync Products
      const productsCol = collection(db, 'products');
      onSnapshot(productsCol, (snapshot) => {
        if (snapshot.empty) {
          // Seed initial products to Firestore
          INITIAL_PRODUCTS.forEach((prod) => {
            setDoc(doc(db, 'products', prod.id), cleanForFirestore(prod)).catch(console.error);
          });
        } else {
          const firestoreProducts: Product[] = [];
          snapshot.forEach((docSnap) => {
            firestoreProducts.push(docSnap.data() as Product);
          });
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(firestoreProducts));
          this.dispatchUpdate();
        }
      }, (err) => console.warn('Firestore products sync notice:', err));

      // 2. Sync Orders
      const ordersCol = collection(db, 'orders');
      let isInitialOrdersLoad = true;

      onSnapshot(ordersCol, (snapshot) => {
        if (snapshot.empty) {
          INITIAL_ORDERS.forEach((ord) => {
            setDoc(doc(db, 'orders', ord.id), cleanForFirestore(ord)).catch(console.error);
          });
        } else {
          const firestoreOrders: Order[] = [];
          snapshot.forEach((docSnap) => {
            firestoreOrders.push(docSnap.data() as Order);
          });
          // Sort newest first
          firestoreOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          // If a new order is added after initial load from a remote phone/device, play notification chime
          if (!isInitialOrdersLoad) {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                try {
                  soundManager.playNewOrderBell();
                } catch {
                  // Ignore audio context errors
                }
              }
            });
          }
          isInitialOrdersLoad = false;

          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(firestoreOrders));
          this.dispatchUpdate();
        }
      }, (err) => console.warn('Firestore orders sync notice:', err));

      // 3. Sync Settings
      const settingsDoc = doc(db, 'settings', 'pizzeria');
      onSnapshot(settingsDoc, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PizzeriaSettings;
          const merged: PizzeriaSettings = {
            ...INITIAL_SETTINGS,
            ...data,
            bankDetails: {
              ...INITIAL_SETTINGS.bankDetails,
              ...(data.bankDetails || {})
            }
          };
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
          this.dispatchUpdate();
        } else {
          setDoc(settingsDoc, cleanForFirestore(INITIAL_SETTINGS)).catch(console.error);
        }
      }, (err) => console.warn('Firestore settings sync notice:', err));

      // 4. Sync Customer
      const currentCustomer = this.getCustomer();
      if (currentCustomer?.id) {
        const customerDoc = doc(db, 'customers', currentCustomer.id);
        onSnapshot(customerDoc, (docSnap) => {
          if (docSnap.exists()) {
            const custData = docSnap.data() as CustomerUser;
            localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(custData));
            this.dispatchUpdate();
          } else {
            setDoc(customerDoc, cleanForFirestore(currentCustomer)).catch(console.error);
          }
        }, (err) => console.warn('Firestore customer sync notice:', err));
      }

      // 5. Sync Salon Tables
      const tablesCol = collection(db, 'tables');
      onSnapshot(tablesCol, (snapshot) => {
        if (snapshot.empty) {
          INITIAL_TABLES.forEach((table) => {
            setDoc(doc(db, 'tables', table.id), cleanForFirestore(table)).catch(console.error);
          });
        } else {
          const firestoreTables: RestaurantTable[] = [];
          snapshot.forEach((docSnap) => {
            firestoreTables.push(docSnap.data() as RestaurantTable);
          });
          firestoreTables.sort((a, b) => a.number - b.number);
          localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(firestoreTables));
          this.dispatchUpdate();
        }
      }, (err) => console.warn('Firestore tables sync notice:', err));
    } catch (err) {
      console.warn('Firebase initialization notice:', err);
    }
  }

  // Cart Management
  public static getCart(): CartItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return [];
  }

  public static saveCart(cart: CartItem[]): void {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    this.dispatchUpdate();
  }

  public static addToCart(item: CartItem): void {
    const cart = this.getCart();
    // Check if identical item already exists
    const existingIndex = cart.findIndex(
      (c) =>
        c.productId === item.productId &&
        c.selectedSize?.id === item.selectedSize?.id &&
        c.selectedCrust?.id === item.selectedCrust?.id &&
        JSON.stringify(c.selectedToppings.map(t => t.id).sort()) ===
          JSON.stringify(item.selectedToppings.map(t => t.id).sort()) &&
        (c.notes || '') === (item.notes || '')
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += item.quantity;
      cart[existingIndex].itemTotal = (cart[existingIndex].itemTotal / (cart[existingIndex].quantity - item.quantity)) * cart[existingIndex].quantity;
    } else {
      cart.push(item);
    }
    this.saveCart(cart);
  }

  public static updateCartQuantity(cartItemId: string, delta: number): void {
    let cart = this.getCart();
    const idx = cart.findIndex((i) => i.cartItemId === cartItemId);
    if (idx === -1) return;

    const singleItemPrice = cart[idx].itemTotal / cart[idx].quantity;
    const newQty = cart[idx].quantity + delta;

    if (newQty <= 0) {
      cart = cart.filter((i) => i.cartItemId !== cartItemId);
    } else {
      cart[idx].quantity = newQty;
      cart[idx].itemTotal = singleItemPrice * newQty;
    }
    this.saveCart(cart);
  }

  public static removeFromCart(cartItemId: string): void {
    const cart = this.getCart().filter((i) => i.cartItemId !== cartItemId);
    this.saveCart(cart);
  }

  public static clearCart(): void {
    this.saveCart([]);
  }

  // Products
  public static getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    this.saveProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }

  public static saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.dispatchUpdate();
  }

  public static addProduct(product: Product): void {
    const products = this.getProducts();
    products.unshift(product);
    this.saveProducts(products);
    setDoc(doc(db, 'products', product.id), cleanForFirestore(product)).catch(console.error);
  }

  public static updateProduct(updated: Product): void {
    const products = this.getProducts().map(p => p.id === updated.id ? updated : p);
    this.saveProducts(products);
    setDoc(doc(db, 'products', updated.id), cleanForFirestore(updated)).catch(console.error);
  }

  public static deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
    deleteDoc(doc(db, 'products', id)).catch(console.error);
  }

  // Settings
  public static getSettings(): PizzeriaSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        const merged: PizzeriaSettings = {
          ...INITIAL_SETTINGS,
          ...parsed,
          bankDetails: {
            ...INITIAL_SETTINGS.bankDetails,
            ...(parsed.bankDetails || {})
          }
        };

        // Clean default old promo discount text if present
        if (merged.bannerMessage && (merged.bannerMessage.includes('20% OFF') || merged.bannerMessage.includes('10% OFF'))) {
          merged.bannerMessage = INITIAL_SETTINGS.bannerMessage;
        }

        return merged;
      }
    } catch {
      // Fallback
    }
    this.saveSettings(INITIAL_SETTINGS);
    return INITIAL_SETTINGS;
  }

  public static saveSettings(settings: PizzeriaSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.dispatchUpdate();
    setDoc(doc(db, 'settings', 'pizzeria'), cleanForFirestore(settings)).catch(console.error);
  }

  // Customer User
  public static getCustomer(): CustomerUser {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    this.saveCustomer(INITIAL_CUSTOMER);
    return INITIAL_CUSTOMER;
  }

  public static saveCustomer(customer: CustomerUser): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(customer));
    this.dispatchUpdate();
    if (customer.id) {
      setDoc(doc(db, 'customers', customer.id), cleanForFirestore(customer)).catch(console.error);
    }
  }

  // Orders
  public static getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    this.saveOrders(INITIAL_ORDERS);
    return INITIAL_ORDERS;
  }

  public static saveOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.dispatchUpdate();
  }

  public static getActiveTrackingOrderId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDER_ID) || null;
  }

  public static setActiveTrackingOrderId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDER_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ORDER_ID);
    }
    this.dispatchUpdate();
  }

  public static createOrder(newOrder: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Order {
    const orders = this.getOrders();
    const highestNumber = orders.reduce((max, ord) => Math.max(max, ord.orderNumber || 1000), 1048);
    const orderNumber = highestNumber + 1;
    const now = new Date().toISOString();

    const order: Order = {
      ...newOrder,
      id: `ord-${orderNumber}`,
      orderNumber,
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: newOrder.status || 'pendiente',
          timestamp: now,
          note: newOrder.paymentMethod === 'transferencia' 
            ? 'Pedido recibido con comprobante de transferencia adjunto' 
            : 'Pedido online recibido',
        }
      ]
    };

    orders.unshift(order);
    this.saveOrders(orders);
    this.setActiveTrackingOrderId(order.id);
    setDoc(doc(db, 'orders', order.id), cleanForFirestore(order)).catch(console.error);
    return order;
  }

  public static updateOrder(updatedOrder: Order): void {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === updatedOrder.id);
    if (idx !== -1) {
      orders[idx] = updatedOrder;
    } else {
      orders.unshift(updatedOrder);
    }
    this.saveOrders(orders);
    setDoc(doc(db, 'orders', updatedOrder.id), cleanForFirestore(updatedOrder)).catch(console.error);
  }

  public static updateOrderStatus(
    orderId: string, 
    newStatus: OrderStatus, 
    note?: string, 
    driverName?: string, 
    driverPhone?: string
  ): Order | null {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    const currentOrder = orders[idx];

    const updatedOrder: Order = {
      ...currentOrder,
      status: newStatus,
      updatedAt: now,
      driverName: driverName !== undefined ? driverName : currentOrder.driverName,
      driverPhone: driverPhone !== undefined ? driverPhone : currentOrder.driverPhone,
      statusHistory: [
        ...currentOrder.statusHistory,
        {
          status: newStatus,
          timestamp: now,
          note: note || `Estado actualizado a ${newStatus}`
        }
      ]
    };

    orders[idx] = updatedOrder;
    this.saveOrders(orders);
    setDoc(doc(db, 'orders', updatedOrder.id), cleanForFirestore(updatedOrder)).catch(console.error);
    return updatedOrder;
  }

  public static updateOrderPaymentStatus(
    orderId: string, 
    paymentStatus: Order['paymentStatus'],
    transferProofUrl?: string
  ): Order | null {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;

    orders[idx] = {
      ...orders[idx],
      paymentStatus,
      transferProofUrl: transferProofUrl !== undefined ? transferProofUrl : orders[idx].transferProofUrl,
      updatedAt: new Date().toISOString(),
    };

    this.saveOrders(orders);
    setDoc(doc(db, 'orders', orders[idx].id), cleanForFirestore(orders[idx])).catch(console.error);
    return orders[idx];
  }

  // Reports Generator for Daily Sales
  public static generateDailySalesReport(targetDateStr?: string): DailySalesReport {
    const orders = this.getOrders();
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const targetDateKey = targetDate.toISOString().split('T')[0];

    // Filter orders of today
    const dayOrders = orders.filter(o => o.createdAt.startsWith(targetDateKey));
    
    // Fallback if day is empty for demo, take all orders
    const sourceOrders = dayOrders.length > 0 ? dayOrders : orders;

    const completed = sourceOrders.filter(o => o.status === 'entregado');
    const cancelled = sourceOrders.filter(o => o.status === 'cancelado');
    const totalRev = sourceOrders
      .filter(o => o.status !== 'cancelado')
      .reduce((sum, o) => sum + o.total, 0);

    const revenueByPayment: Record<Order['paymentMethod'], number> = {
      efectivo: 0,
      transferencia: 0,
      mercadopago: 0,
      tarjeta_delivery: 0,
    };

    const deliveryCount = { delivery: 0, retiro: 0 };
    const productStats: Record<string, { quantity: number; revenue: number }> = {};
    const hourlyStats: Record<string, { orders: number; revenue: number }> = {};

    sourceOrders.forEach(ord => {
      if (ord.status !== 'cancelado') {
        revenueByPayment[ord.paymentMethod] = (revenueByPayment[ord.paymentMethod] || 0) + ord.total;
        
        if (ord.deliveryType === 'delivery') deliveryCount.delivery++;
        else deliveryCount.retiro++;

        const hour = new Date(ord.createdAt).getHours();
        const hourKey = `${hour}:00`;
        if (!hourlyStats[hourKey]) hourlyStats[hourKey] = { orders: 0, revenue: 0 };
        hourlyStats[hourKey].orders += 1;
        hourlyStats[hourKey].revenue += ord.total;

        ord.items.forEach(item => {
          if (!productStats[item.productName]) {
            productStats[item.productName] = { quantity: 0, revenue: 0 };
          }
          productStats[item.productName].quantity += item.quantity;
          productStats[item.productName].revenue += item.itemTotal;
        });
      }
    });

    const topSellingProducts = Object.entries(productStats)
      .map(([name, data]) => ({
        productName: name,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);

    const hourlyDistribution = Object.entries(hourlyStats)
      .map(([hour, data]) => ({
        hour,
        orders: data.orders,
        revenue: data.revenue,
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    return {
      date: targetDateKey,
      totalRevenue: totalRev,
      ordersCount: sourceOrders.length,
      completedOrders: completed.length,
      cancelledOrders: cancelled.length,
      averageTicket: sourceOrders.length > 0 ? Math.round(totalRev / (sourceOrders.length - cancelled.length || 1)) : 0,
      revenueByPaymentMethod: revenueByPayment,
      ordersByDeliveryType: deliveryCount,
      topSellingProducts,
      hourlyDistribution: hourlyDistribution.length > 0 ? hourlyDistribution : [
        { hour: '20:00', orders: 2, revenue: 38700 },
        { hour: '21:00', orders: 5, revenue: 84200 },
        { hour: '22:00', orders: 4, revenue: 62100 },
        { hour: '23:00', orders: 2, revenue: 26400 }
      ],
    };
  }

  // Tables Management for Mozo / Salón
  public static getTables(): RestaurantTable[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TABLES);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(INITIAL_TABLES));
      return INITIAL_TABLES;
    } catch {
      return INITIAL_TABLES;
    }
  }

  public static saveTables(tables: RestaurantTable[]): void {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    this.dispatchUpdate();
  }

  public static updateTable(updatedTable: RestaurantTable): void {
    const tables = this.getTables();
    const idx = tables.findIndex(t => t.id === updatedTable.id);
    if (idx !== -1) {
      tables[idx] = updatedTable;
    } else {
      tables.push(updatedTable);
    }
    this.saveTables(tables);
    setDoc(doc(db, 'tables', updatedTable.id), cleanForFirestore(updatedTable)).catch(console.error);
  }

  public static updateTableStatus(tableId: string, status: TableStatus, waiterName?: string, activeOrderId?: string, dinersCount?: number): RestaurantTable | null {
    const tables = this.getTables();
    const idx = tables.findIndex(t => t.id === tableId);
    if (idx === -1) return null;

    tables[idx] = {
      ...tables[idx],
      status,
      currentWaiterName: waiterName !== undefined ? waiterName : tables[idx].currentWaiterName,
      activeOrderId: activeOrderId !== undefined ? activeOrderId : tables[idx].activeOrderId,
      dinersCount: dinersCount !== undefined ? dinersCount : tables[idx].dinersCount,
      openedAt: status === 'ocupada' && tables[idx].status === 'libre' ? new Date().toISOString() : (status === 'libre' ? undefined : tables[idx].openedAt),
    };

    if (status === 'libre') {
      tables[idx].activeOrderId = undefined;
      tables[idx].dinersCount = undefined;
      tables[idx].currentWaiterName = undefined;
      tables[idx].openedAt = undefined;
    }

    this.saveTables(tables);
    setDoc(doc(db, 'tables', tables[idx].id), cleanForFirestore(tables[idx])).catch(console.error);
    return tables[idx];
  }

  public static getWaiterName(): string {
    return localStorage.getItem(STORAGE_KEYS.WAITER_NAME) || 'Mozo 1';
  }

  public static saveWaiterName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.WAITER_NAME, name);
    this.dispatchUpdate();
  }

  public static resetToFactoryDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ORDER_ID);
    localStorage.removeItem(STORAGE_KEYS.TABLES);
    localStorage.removeItem(STORAGE_KEYS.WAITER_NAME);
    this.getProducts();
    this.getSettings();
    this.getOrders();
    this.getCustomer();
    this.getTables();
    this.dispatchUpdate();
  }
}
