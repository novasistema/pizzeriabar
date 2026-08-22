import React, { useState, useRef } from 'react';
import {
  Pizza,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Camera,
  X,
  RefreshCw,
  Eye,
  Check,
  Flame,
  CloudCheck,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { TopHeaderWidget } from './TopHeaderWidget';

// Preset HD curated images for quick pick
const PRESET_IMAGES: { label: string; category: string; url: string }[] = [
  {
    label: 'Muzzarella Dorada',
    category: 'pizzas',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Fugazzeta Rellena',
    category: 'pizzas',
    url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Napolitana Tomate y Albahaca',
    category: 'pizzas',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Calabresa y Longaniza',
    category: 'pizzas',
    url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Jamón y Morrones',
    category: 'pizzas',
    url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Cuatro Quesos',
    category: 'pizzas',
    url: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Provolone al Horno',
    category: 'pizzas',
    url: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Empanada Carne a Cuchillo',
    category: 'empanadas',
    url: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Empanada Jamón y Queso',
    category: 'empanadas',
    url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Fainá Dorada',
    category: 'agregados',
    url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Gaseosa Coca-Cola',
    category: 'bebidas',
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Cerveza Fría',
    category: 'bebidas',
    url: 'https://images.unsplash.com/photo-1608270199042-f8c5b057796d?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Flan con Dulce de Leche',
    category: 'postres',
    url: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Tiramisú Artesanal',
    category: 'postres',
    url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
  },
];

export const ProductsView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetCatalogToDefaults,
    isFirebaseConnected,
    isSyncing,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('pizzas');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [popular, setPopular] = useState(false);

  // Image upload / link state
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'link' | 'presets'>('upload');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openNewProductModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('pizzas');
    setDescription('');
    setPrice('');
    setCost('');
    setIsAvailable(true);
    setPopular(false);
    setImageUrl('');
    setImagePreview(PRESET_IMAGES[0].url);
    setImageSourceMode('upload');
    setIsModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setDescription(product.description);
    setPrice(product.price.toString());
    setCost(product.cost.toString());
    setIsAvailable(product.isAvailable);
    setPopular(product.popular || false);
    setImageUrl(product.image || '');
    setImagePreview(product.image || '');
    setImageSourceMode(product.image?.startsWith('data:') ? 'upload' : 'link');
    setIsModalOpen(true);
  };

  // Optimize & compress uploaded images from Mobile Camera / PC file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to scale down if large
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setImagePreview(compressedDataUrl);
          setImageUrl(compressedDataUrl);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price) || 0;
    const costNum = parseFloat(cost) || 0;

    if (!name.trim() || priceNum <= 0) {
      alert('Ingresa un nombre y precio válido mayor a 0');
      return;
    }

    const finalImage = imageUrl.trim() || imagePreview || '';

    if (editingProduct) {
      await updateProduct({
        ...editingProduct,
        name: name.trim(),
        category,
        description: description.trim(),
        price: priceNum,
        cost: costNum,
        image: finalImage,
        isAvailable,
        popular,
      });
      showToast('Producto actualizado en tiempo real');
    } else {
      await addProduct({
        name: name.trim(),
        category,
        description: description.trim(),
        price: priceNum,
        cost: costNum,
        image: finalImage,
        isAvailable,
        popular,
      });
      showToast('Nuevo producto agregado a la base de datos');
    }

    setIsModalOpen(false);
  };

  return (
    <div id="products-view" className="max-w-7xl mx-auto space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs font-bold animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Main Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Catálogo & Menú en Tiempo Real
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              FIRESTORE CLOUD
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión completa de pizzas, empanadas, bebidas, fotos y sincronización con el Chatbot y POS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openNewProductModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Agregar Producto con Foto
          </button>
          <TopHeaderWidget />
        </div>
      </div>

      {/* Filters Bar & Stats */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o ingredientes..."
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'pizzas', label: '🍕 Pizzas' },
              { id: 'empanadas', label: '🥟 Empanadas' },
              { id: 'agregados', label: '🧀 Fainá & Extras' },
              { id: 'bebidas', label: '🥤 Bebidas' },
              { id: 'postres', label: '🍨 Postres' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('¿Restablecer fotos y catálogo predeterminado de alta calidad en Firestore?')) {
                resetCatalogToDefaults();
                showToast('Catálogo restablecido con imágenes HD');
              }
            }}
            title="Recargar fotos y datos predeterminados en la base de datos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Fotos HD Predeterminadas
          </button>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {filteredProducts.length} productos
          </span>
        </div>
      </div>

      {/* Products Grid with Food Photography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((p) => {
          const margin = p.price - p.cost;
          const marginPercent = p.price > 0 ? ((margin / p.price) * 100).toFixed(0) : '0';

          return (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Product Image Cover */}
                <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback on broken image link
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-orange-50/30">
                      <ImageIcon className="w-10 h-10 mb-1 text-orange-200" />
                      <span className="text-[11px] font-bold text-orange-300">Sin foto</span>
                    </div>
                  )}

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-900/80 backdrop-blur-xs text-white shadow-xs">
                      {p.category}
                    </span>
                    {p.popular && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-current" /> TOP
                      </span>
                    )}
                  </div>

                  {/* Status Toggle on Image */}
                  <button
                    onClick={() => updateProduct({ ...p, isAvailable: !p.isAvailable })}
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-xs shadow-xs transition cursor-pointer flex items-center gap-1 ${
                      p.isAvailable
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-rose-500/90 text-white'
                    }`}
                  >
                    {p.isAvailable ? 'ACTIVO' : 'PAUSADO'}
                  </button>

                  {/* Quick Change Photo Button */}
                  <button
                    onClick={() => openEditProductModal(p)}
                    className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-white/90 backdrop-blur-xs text-slate-700 hover:text-orange-600 shadow-sm transition opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" /> Cambiar foto
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-black text-slate-800 line-clamp-1">{p.name}</h3>
                    <span className="text-sm font-black text-orange-600 font-mono shrink-0">
                      ${p.price.toLocaleString('es-AR')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
                    {p.description || 'Sin descripción detallada.'}
                  </p>
                </div>
              </div>

              {/* Card Footer: Margins and Actions */}
              <div className="p-4 pt-0 space-y-3">
                <div className="grid grid-cols-3 gap-1 text-center bg-slate-50 p-2 rounded-2xl border border-slate-100 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">Venta</span>
                    <span className="font-bold text-slate-800">${p.price.toLocaleString('es-AR')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">Costo</span>
                    <span className="font-bold text-slate-500">${p.cost.toLocaleString('es-AR')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">Margen</span>
                    <span className="font-bold text-emerald-600">{marginPercent}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {p.id.slice(-6)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditProductModal(p)}
                      className="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition cursor-pointer"
                      title="Editar datos y foto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar permanentemente "${p.name}" de la base de datos?`)) {
                          deleteProduct(p.id);
                          showToast('Producto eliminado');
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Product with Image Uploader */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Pizza className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingProduct ? 'Editar Producto & Fotografía' : 'Nuevo Producto en la Carta'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Sincronización directa en Firestore en tiempo real
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* SECTION 1: Product Photo Uploader (Mobile / PC / Link / Presets) */}
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-orange-500" />
                  Foto del Producto (Celular, PC o Link)
                </label>
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setImageSourceMode('upload')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      imageSourceMode === 'upload'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Upload className="w-3 h-3" /> Subir Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSourceMode('link')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      imageSourceMode === 'link'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" /> Link / URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSourceMode('presets')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      imageSourceMode === 'presets'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" /> Galería HD
                  </button>
                </div>
              </div>

              {/* Active Image Preview & Selector Area */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                {/* Thumbnail Preview */}
                <div className="relative w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-orange-300 shrink-0 overflow-hidden shadow-xs flex items-center justify-center">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageUrl('');
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition text-[9px]"
                        title="Quitar imagen"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <Camera className="w-8 h-8 text-orange-200" />
                      <span className="text-[9px] font-bold text-orange-300 mt-1">Sin foto</span>
                    </div>
                  )}
                  {isCompressing && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-[10px] font-bold">
                      Optimizando...
                    </div>
                  )}
                </div>

                {/* Mode Specific Controller */}
                <div className="flex-1 w-full space-y-2">
                  {imageSourceMode === 'upload' && (
                    <div className="space-y-1.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-4 rounded-xl border border-dashed border-orange-400 bg-white hover:bg-orange-50 text-orange-600 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                      >
                        <Camera className="w-4 h-4" /> Tomar foto o elegir desde galería del celular/PC
                      </button>
                      <p className="text-[10px] text-slate-400">
                        Compatible con JPG, PNG, WEBP o cámara en vivo. Se optimiza y comprime automáticamente.
                      </p>
                    </div>
                  )}

                  {imageSourceMode === 'link' && (
                    <div className="space-y-1.5">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setImagePreview(e.target.value);
                        }}
                        placeholder="https://ejemplo.com/foto-pizza-muzzarella.jpg"
                        className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                      />
                      <p className="text-[10px] text-slate-400">
                        Pega el enlace de cualquier foto pública de internet.
                      </p>
                    </div>
                  )}

                  {imageSourceMode === 'presets' && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 block">
                        Toca una foto para seleccionarla:
                      </span>
                      <div className="grid grid-cols-5 gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                        {PRESET_IMAGES.map((pImg, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setImageUrl(pImg.url);
                              setImagePreview(pImg.url);
                            }}
                            className={`relative h-11 rounded-lg overflow-hidden border cursor-pointer transition ${
                              imagePreview === pImg.url
                                ? 'border-orange-500 ring-2 ring-orange-200'
                                : 'border-slate-200 hover:opacity-80'
                            }`}
                            title={pImg.label}
                          >
                            <img
                              src={pImg.url}
                              alt={pImg.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: General Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Fugazzeta Rellena con Jamón"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:bg-white"
                >
                  <option value="pizzas">🍕 Pizzas</option>
                  <option value="empanadas">🥟 Empanadas</option>
                  <option value="agregados">🧀 Fainá y Agregados</option>
                  <option value="bebidas">🥤 Bebidas</option>
                  <option value="postres">🍨 Postres</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Precio de Venta ($)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="12500"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-orange-50/40 border border-orange-200 font-mono font-bold text-orange-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Costo de Producción ($)</label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="4200"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Margen Calculado</label>
                <div className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 font-mono font-bold text-emerald-700">
                  {price && cost
                    ? `$${(parseFloat(price) - parseFloat(cost)).toLocaleString('es-AR')} (${(
                        ((parseFloat(price) - parseFloat(cost)) / parseFloat(price)) *
                        100
                      ).toFixed(0)}%)`
                    : '—'}
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Descripción / Ingredientes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Salsa de tomate casera, abundante muzzarella, orégano y aceitunas..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white"
                />
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span>Habilitado para la Venta</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span>⭐ Destacar como Popular</span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl shadow-md shadow-orange-500/20 transition cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Guardar en Base de Datos
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
