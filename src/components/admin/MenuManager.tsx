import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Flame, 
  Leaf, 
  Image as ImageIcon, 
  DollarSign, 
  Clock, 
  Layers,
  Pizza
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { CATEGORY_LABELS, formatCurrency } from '../../utils/formatters';
import { StorageService, DEFAULT_PIZZA_SIZES, DEFAULT_CRUSTS, DEFAULT_TOPPINGS } from '../../services/storageService';

interface MenuManagerProps {
  products: Product[];
  onRefreshProducts: () => void;
}

export const MenuManager: React.FC<MenuManagerProps> = ({
  products,
  onRefreshProducts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState<string>('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('pizzas_clasicas');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formIsVegetarian, setFormIsVegetarian] = useState(false);
  const [formIsSpicy, setFormIsSpicy] = useState(false);
  const [formIsNew, setFormIsNew] = useState(false);
  const [formPrepMinutes, setFormPrepMinutes] = useState<number>(20);

  const filtered = products.filter((p) => {
    if (selectedCategory !== 'todas' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsCreatingNew(false);
    setFormName(product.name);
    setFormDesc(product.description);
    setFormPrice(product.price.toString());
    setFormCategory(product.category);
    setFormImageUrl(product.imageUrl);
    setFormIsAvailable(product.isAvailable);
    setFormIsPopular(!!product.isPopular);
    setFormIsVegetarian(!!product.isVegetarian);
    setFormIsSpicy(!!product.isSpicy);
    setFormIsNew(!!product.isNew);
    setFormPrepMinutes(product.prepTimeMinutes || 20);
  };

  const handleOpenNew = () => {
    setIsCreatingNew(true);
    setEditingProduct(null);
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormCategory('pizzas_clasicas');
    setFormImageUrl('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80');
    setFormIsAvailable(true);
    setFormIsPopular(false);
    setFormIsVegetarian(false);
    setFormIsSpicy(false);
    setFormIsNew(true);
    setFormPrepMinutes(20);
  };

  const handleToggleAvailability = (product: Product) => {
    const updated = { ...product, isAvailable: !product.isAvailable };
    StorageService.updateProduct(updated);
    onRefreshProducts();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto del menú?')) {
      StorageService.deleteProduct(id);
      onRefreshProducts();
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    const isPizza = formCategory.startsWith('pizzas_');

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formName.trim(),
      description: formDesc.trim(),
      price: parseFloat(formPrice) || 0,
      category: formCategory,
      imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      isAvailable: formIsAvailable,
      isPopular: formIsPopular,
      isVegetarian: formIsVegetarian,
      isSpicy: formIsSpicy,
      isNew: formIsNew,
      sizes: isPizza ? DEFAULT_PIZZA_SIZES : undefined,
      crusts: isPizza ? DEFAULT_CRUSTS : undefined,
      availableToppings: isPizza ? DEFAULT_TOPPINGS : undefined,
      prepTimeMinutes: formPrepMinutes,
    };

    if (editingProduct) {
      StorageService.updateProduct(productPayload);
    } else {
      StorageService.addProduct(productPayload);
    }

    setEditingProduct(null);
    setIsCreatingNew(false);
    onRefreshProducts();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-serif">
            Gestión de la Carta y Precios
          </h3>
          <p className="text-xs text-slate-500">
            {products.length} productos dados de alta en el sistema
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-amber-500/25 transition active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nuevo Producto</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o ingrediente..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'todas'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Todas ({products.length})
          </button>
          {Object.keys(CATEGORY_LABELS).map((catKey) => {
            const count = products.filter(p => p.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey as ProductCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === catKey
                    ? 'bg-amber-500 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {CATEGORY_LABELS[catKey as ProductCategory]?.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-850 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4">Producto</th>
                <th className="px-4 py-4">Categoría</th>
                <th className="px-4 py-4">Precio Base</th>
                <th className="px-4 py-4">Cocción</th>
                <th className="px-4 py-4">Disponibilidad</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  {/* Photo & Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            {product.name}
                          </p>
                          {product.isPopular && (
                            <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-md">
                              TOP
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[11px] line-clamp-1 max-w-xs">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                      {CATEGORY_LABELS[product.category]?.label || product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3.5 font-bold font-mono text-slate-900 dark:text-white text-sm">
                    {formatCurrency(product.price)}
                  </td>

                  {/* Prep time */}
                  <td className="px-4 py-3.5 text-slate-500">
                    ~{product.prepTimeMinutes || 20} min
                  </td>

                  {/* Availability toggle */}
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => handleToggleAvailability(product)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                        product.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                      }`}
                    >
                      {product.isAvailable ? '✓ Disponible' : '✕ Pausado'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Editar producto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {(isCreatingNew || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-lg text-slate-900 dark:text-white font-serif">
                {isCreatingNew ? 'Agregar Nuevo Producto' : 'Editar Producto'}
              </h3>
              <button
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Pizza Cuatro Quesos Rústica"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción e Ingredientes
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Detalla los ingredientes y toques especiales..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Precio Base ($ ARS) *
                  </label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="12500"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, val]) => (
                      <option key={k} value={k}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL de la Imagen (Foto apetecible)
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              {/* Tags and Attributes checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                  Atributos & Etiquetas
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsAvailable}
                      onChange={(e) => setFormIsAvailable(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>Disponible para pedir</span>
                  </label>
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPopular}
                      onChange={(e) => setFormIsPopular(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>Destacado / Más Pedido</span>
                  </label>
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsVegetarian}
                      onChange={(e) => setFormIsVegetarian(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Vegetariano</span>
                  </label>
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsSpicy}
                      onChange={(e) => setFormIsSpicy(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span>Picante</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold shadow-sm"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
