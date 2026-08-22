import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Flame, 
  Leaf, 
  Sparkles, 
  Clock, 
  Check,
  ShoppingBag,
  Info,
  Disc,
  Music,
  Zap
} from 'lucide-react';
import { Product, PizzaSizeOption, CrustOption, ExtraTopping, CartItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { soundManager } from '../../utils/audio';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  // Selected state
  const [selectedSize, setSelectedSize] = useState<PizzaSizeOption | undefined>(
    product.sizes ? product.sizes.find(s => s.isDefault) || product.sizes[0] : undefined
  );
  const [selectedCrust, setSelectedCrust] = useState<CrustOption | undefined>(
    product.crusts ? product.crusts[0] : undefined
  );
  const [selectedToppings, setSelectedToppings] = useState<ExtraTopping[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  // Reset when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes ? product.sizes.find(s => s.isDefault) || product.sizes[0] : undefined);
      setSelectedCrust(product.crusts ? product.crusts[0] : undefined);
      setSelectedToppings([]);
      setQuantity(1);
      setNotes('');
    }
  }, [product]);

  // Compute calculated unit price
  const calculateUnitPrice = (): number => {
    let price = product.price;
    if (selectedSize) {
      price = Math.round(product.price * selectedSize.priceMultiplier);
    }
    if (selectedCrust) {
      price += selectedCrust.extraPrice;
    }
    const toppingsCost = selectedToppings.reduce((sum, top) => sum + top.price, 0);
    price += toppingsCost;
    return price;
  };

  const unitPrice = calculateUnitPrice();
  const totalPrice = unitPrice * quantity;

  const handleToggleTopping = (topping: ExtraTopping) => {
    if (selectedToppings.some(t => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleAdd = () => {
    const item: CartItem = {
      cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      productName: product.name,
      category: product.category,
      basePrice: product.price,
      quantity,
      selectedSize,
      selectedCrust,
      selectedToppings,
      notes: notes.trim() ? notes.trim() : undefined,
      itemTotal: totalPrice,
      imageUrl: product.imageUrl,
    };

    onAddToCart(item);
    soundManager.playAddToCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[90vh] text-white">
        {/* Mobile Swipe / Drag indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-slate-950 flex justify-center">
          <div className="w-12 h-1.5 bg-white/30 rounded-full"></div>
        </div>

        {/* Header with image */}
        <div className="relative h-48 sm:h-64 shrink-0 overflow-hidden bg-slate-950">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-6">
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              {product.isPopular && (
                <span className="bg-amber-500 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> TOP HIT
                </span>
              )}
              {product.isVegetarian && (
                <span className="bg-emerald-600 text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Leaf className="w-3 h-3" /> VEGGIE
                </span>
              )}
              {product.isSpicy && (
                <span className="bg-rose-600 text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3" /> HEAVY RIFF
                </span>
              )}
              {product.prepTimeMinutes && (
                <span className="bg-slate-900/90 text-slate-200 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs font-mono border border-slate-700">
                  <Clock className="w-3 h-3 text-amber-400" /> ~{product.prepTimeMinutes}m
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white font-serif drop-shadow-sm flex items-center gap-2">
              <span>{product.name}</span>
            </h2>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-slate-950/80 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md transition shadow-md border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-slate-200 text-sm">
          {/* Description */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {product.description}
          </p>

          {/* 1. Size Selection (Vinyl Formats) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <Disc className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>1. Formato de Disco / Tamaño</span>
                  <span className="text-[10px] sm:text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">Requerido</span>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.sizes.map((size) => {
                  const sizePrice = Math.round(product.price * size.priceMultiplier);
                  const isSelected = selectedSize?.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        soundManager.playVinylNeedleDrop();
                      }}
                      className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border text-left transition ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-white shadow-md shadow-amber-500/10'
                          : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          isSelected ? 'border-amber-500 bg-amber-500 text-slate-950 font-bold' : 'border-slate-700'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-3" />}
                        </div>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-white">{size.name}</p>
                          <p className="text-[11px] sm:text-xs text-slate-400">{size.slices} porciones</p>
                        </div>
                      </div>
                      <span className="font-black text-xs sm:text-sm text-amber-400 font-mono">
                        {formatCurrency(sizePrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Crust / Dough Selection */}
          {product.crusts && product.crusts.length > 0 && (
            <div className="space-y-3">
              <label className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>2. Edición de Masa & Borde</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {product.crusts.map((crust) => {
                  const isSelected = selectedCrust?.id === crust.id;
                  return (
                    <button
                      key={crust.id}
                      type="button"
                      onClick={() => setSelectedCrust(crust)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border text-left transition ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-white'
                          : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          isSelected ? 'border-amber-500 bg-amber-500 text-slate-950 font-bold' : 'border-slate-700'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-3" />}
                        </div>
                        <span className="font-semibold text-xs sm:text-sm text-white">{crust.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-300 font-mono">
                        {crust.extraPrice > 0 ? `+ ${formatCurrency(crust.extraPrice)}` : 'Incluido'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Extra Toppings */}
          {product.availableToppings && product.availableToppings.length > 0 && (
            <div className="space-y-3">
              <label className="font-bold text-white text-sm sm:text-base flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>3. Solos & Toppings Extras</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Opcional</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.availableToppings.map((topping) => {
                  const isChecked = selectedToppings.some(t => t.id === topping.id);
                  return (
                    <button
                      key={topping.id}
                      type="button"
                      onClick={() => handleToggleTopping(topping)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border text-left transition ${
                        isChecked
                          ? 'border-amber-500 bg-amber-500/20 text-white'
                          : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                          isChecked ? 'border-amber-500 bg-amber-500 text-slate-950 font-bold' : 'border-slate-700'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                        <span className="text-xs font-semibold text-slate-200">{topping.name}</span>
                      </div>
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        +{formatCurrency(topping.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Special Kitchen Notes */}
          <div className="space-y-1.5">
            <label className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Aclaraciones para el cocinero / pizzero</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Borde bien tostado, sin orégano, orillas crocantes..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-800 bg-slate-950 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Footer with Quantity & Add Button */}
        <div 
          className="p-3 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          {/* Quantity selector */}
          <div className="flex items-center bg-slate-900 rounded-2xl border border-slate-800 p-1 shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 disabled:opacity-30"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-extrabold text-sm sm:text-base text-white font-mono">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add CTA */}
          <button
            onClick={handleAdd}
            className="flex-1 flex items-center justify-center gap-2 sm:gap-3 bg-linear-to-r from-amber-500 via-rose-600 to-amber-500 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black py-3 sm:py-3.5 px-4 sm:px-6 rounded-2xl shadow-lg shadow-amber-500/25 transition active:scale-98 text-xs sm:text-sm truncate"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="truncate">Sumar al Setlist • {formatCurrency(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
