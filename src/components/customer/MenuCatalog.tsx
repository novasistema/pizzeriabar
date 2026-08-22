import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Flame, 
  Leaf, 
  Pizza, 
  ChefHat, 
  Utensils, 
  GlassWater, 
  Cake, 
  Plus, 
  Clock, 
  Check, 
  Tag, 
  ArrowRight,
  SlidersHorizontal,
  Disc,
  Radio,
  Music,
  Zap
} from 'lucide-react';
import { Product, ProductCategory, PizzeriaSettings } from '../../types';
import { CATEGORY_LABELS, formatCurrency } from '../../utils/formatters';
import { soundManager } from '../../utils/audio';

interface MenuCatalogProps {
  products: Product[];
  settings: PizzeriaSettings;
  onSelectProduct: (product: Product) => void;
  onOpenCart: () => void;
}

export const MenuCatalog: React.FC<MenuCatalogProps> = ({
  products,
  settings,
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTag, setFilterTag] = useState<'all' | 'popular' | 'vegetarian' | 'spicy' | 'new'>('all');

  const categories: (ProductCategory | 'todas')[] = [
    'todas',
    'pizzas_clasicas',
    'pizzas_especiales',
    'pizzas_gourmet',
    'empanadas',
    'promociones',
    'bebidas',
    'postres',
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'todas' && p.category !== selectedCategory) {
        return false;
      }
      // Tag filter
      if (filterTag === 'popular' && !p.isPopular) return false;
      if (filterTag === 'vegetarian' && !p.isVegetarian) return false;
      if (filterTag === 'spicy' && !p.isSpicy) return false;
      if (filterTag === 'new' && !p.isNew) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [products, selectedCategory, filterTag, searchQuery]);

  const getCategoryIcon = (cat: ProductCategory | 'todas') => {
    switch (cat) {
      case 'todas': return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'pizzas_clasicas': return <Disc className="w-4 h-4 text-rose-500 animate-spin" style={{ animationDuration: '4s' }} />;
      case 'pizzas_especiales': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'pizzas_gourmet': return <Zap className="w-4 h-4 text-amber-300" />;
      case 'empanadas': return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'promociones': return <Radio className="w-4 h-4 text-rose-400" />;
      case 'bebidas': return <GlassWater className="w-4 h-4 text-sky-400" />;
      case 'postres': return <Cake className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Rock & Roll Hero Visual Lounge Section */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl bg-black text-white min-h-[320px] flex items-center border border-amber-500/30">
        {/* Background Image with Vinyl & Stage Lighting Overlay */}
        <img
          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80"
          alt="Rock & Roll Vinyl Pizza Bar"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 transform hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/85 to-slate-950/60" />

        {/* Ambient Neon Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tracking-widest uppercase font-mono">
            <Disc className="w-3.5 h-3.5 text-amber-400 animate-spin" /> VINILOS DE 33 RPM & HORNO DE LEÑA
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-serif leading-tight text-white drop-shadow-md">
            Pizzas de autor con alma de <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-rose-500">Rock 'N' Roll</span>.
          </h2>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Masa madre fermentada 48 hs, cocción a la leña a 450°C y los grandes himnos de la historia sonando en vinilo. Pide tu pizza en formato Single 7", EP 10" o LP 12".
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-amber-200 bg-slate-900/90 border border-amber-500/30 px-3.5 py-2 rounded-xl backdrop-blur-md font-mono">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Tiempo de cocción & entrega: <strong>{settings.estimatedDeliveryTimeMinutes} min</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-300 bg-slate-900/90 border border-emerald-500/30 px-3.5 py-2 rounded-xl backdrop-blur-md font-mono">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Envío Gratis desde <strong>{formatCurrency(settings.freeDeliveryOver)}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Filter & Search Toolbar */}
      <div className="space-y-4">
        {/* Search and Quick Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-menu"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por banda, pizza de vinilo, ingredientes o cervezas..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder:text-slate-400 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 pl-1 pr-2 hidden sm:flex">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filtros:
            </span>
            <button
              onClick={() => setFilterTag('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterTag === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              Todo el Setlist
            </button>
            <button
              onClick={() => setFilterTag('popular')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterTag === 'popular'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Greatest Hits
            </button>
            <button
              onClick={() => setFilterTag('vegetarian')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterTag === 'vegetarian'
                  ? 'bg-emerald-600 text-white font-black shadow-xs'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-300" /> Veggie Rock
            </button>
            <button
              onClick={() => setFilterTag('spicy')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterTag === 'spicy'
                  ? 'bg-rose-600 text-white font-black shadow-xs'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-300" /> Riffs Picantes
            </button>
          </div>
        </div>

        {/* Category Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const label = cat === 'todas' ? 'Setlist Completo' : CATEGORY_LABELS[cat]?.label;
            const count = cat === 'todas' 
              ? products.length 
              : products.filter(p => p.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition shrink-0 ${
                  isSelected
                    ? 'bg-linear-to-r from-amber-500 via-rose-600 to-amber-500 text-white shadow-lg shadow-amber-500/25 border border-amber-400/50'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-500/50'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{label}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-amber-400 mx-auto flex items-center justify-center">
            <Disc className="w-8 h-8 opacity-60 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-white">No encontramos vinilos ni pizzas con esos filtros</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Prueba buscando otra banda clásica, ingrediente o selecciona otra categoría del setlist.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('todas');
              setSearchQuery('');
              setFilterTag('all');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
          >
            Ver todo el setlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, pIndex) => (
            <div
              key={product.id}
              className={`group bg-slate-900/90 rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 ${
                product.isAvailable
                  ? 'border-slate-800 hover:border-amber-500/50'
                  : 'border-slate-800 opacity-60'
              }`}
            >
              {/* Top Image, Track Number & Badges */}
              <div>
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-950">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Vinyl Track Number Indicator */}
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-amber-400 font-mono text-[11px] font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
                    <Disc className="w-3 h-3 group-hover:animate-spin" /> TRACK #{String(pIndex + 1).padStart(2, '0')}
                  </div>

                  {/* Feature Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {product.isPopular && (
                      <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> TOP HIT
                      </span>
                    )}
                    {product.isNew && (
                      <span className="bg-purple-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                        NUEVO SINGLE
                      </span>
                    )}
                    {product.isVegetarian && (
                      <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Leaf className="w-3 h-3" /> VEGGIE
                      </span>
                    )}
                    {product.isSpicy && (
                      <span className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Flame className="w-3 h-3" /> HEAVY RIFF
                      </span>
                    )}
                  </div>

                  {!product.isAvailable && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-rose-600 text-white text-xs font-black uppercase px-3 py-1.5 rounded-xl tracking-wider">
                        Agotado por hoy
                      </span>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-lg text-white font-serif group-hover:text-amber-400 transition">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: Formats & CTA */}
              <div className="p-5 pt-0 flex items-center justify-between gap-3 border-t border-slate-800/80 mt-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block font-semibold">
                    {product.sizes && product.sizes.length > 0 ? 'Desde (Single 7")' : 'Precio'}
                  </span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                {product.isAvailable ? (
                  <button
                    id={`btn-order-${product.id}`}
                    onClick={() => {
                      soundManager.playAddToCart();
                      onSelectProduct(product);
                    }}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm py-2.5 px-4 rounded-2xl shadow-sm hover:shadow-md transition transform active:scale-95"
                  >
                    <span>{product.sizes ? 'Elegir Formato' : 'Sumar al Setlist'}</span>
                    {product.sizes ? <ArrowRight className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 italic">No disponible</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

