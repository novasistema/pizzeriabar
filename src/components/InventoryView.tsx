import React, { useState } from 'react';
import {
  Boxes,
  Building2,
  ShoppingBag,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  DollarSign,
  PackageCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Ingredient } from '../types';

export const InventoryView: React.FC<{ subView?: 'inventarios' | 'stock-sucursal' | 'costo-ventas' | 'compras' }> = ({
  subView = 'inventarios',
}) => {
  const { ingredients, updateStock, addIngredient } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New ingredient form
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<Ingredient['unit']>('kg');
  const [currentStock, setCurrentStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [supplier, setSupplier] = useState('');

  const filteredIngredients = ingredients.filter(
    (ing) =>
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ing.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = ingredients.filter((ing) => ing.currentStock <= ing.minStock);
  const totalValuation = ingredients.reduce((sum, ing) => sum + ing.currentStock * ing.costPerUnit, 0);

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addIngredient({
      name: name.trim(),
      unit,
      currentStock: parseFloat(currentStock) || 0,
      minStock: parseFloat(minStock) || 0,
      costPerUnit: parseFloat(costPerUnit) || 0,
      supplier: supplier.trim() || 'Proveedor Local',
    });

    setName('');
    setCurrentStock('');
    setMinStock('');
    setCostPerUnit('');
    setSupplier('');
    setIsAddModalOpen(false);
  };

  return (
    <div id="inventory-view" className="max-w-7xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            {subView === 'stock-sucursal' ? (
              <Building2 className="w-4 h-4" />
            ) : subView === 'compras' ? (
              <ShoppingBag className="w-4 h-4" />
            ) : (
              <Boxes className="w-4 h-4" />
            )}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100">
              {subView === 'stock-sucursal'
                ? 'Stock por Sucursal (Bruzzone 128)'
                : subView === 'costo-ventas'
                ? 'Costo de Ventas e Insumos'
                : subView === 'compras'
                ? 'Órdenes de Compra y Proveedores'
                : 'Control de Inventarios & Materias Primas'}
            </h1>
            <p className="text-xs text-slate-400">
              Materia prima: muzzarella, harinas, salsas, fiambres, packaging y bebidas
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-sm transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Ingresar Insumo
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold font-mono text-slate-100">{ingredients.length}</div>
            <div className="text-[11px] text-slate-400">Insumos Registrados</div>
          </div>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold font-mono text-amber-400">{lowStockItems.length}</div>
            <div className="text-[11px] text-slate-400">Stock Crítico / Reponer</div>
          </div>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold font-mono text-slate-100">
              ${totalValuation.toLocaleString('es-AR')}
            </div>
            <div className="text-[11px] text-slate-400">Valoración del Inventario</div>
          </div>
        </div>
      </div>

      {/* Low stock alert banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-300">Atención: Insumos con stock crítico</h4>
            <p className="text-xs text-amber-400/90 mt-0.5">
              Los siguientes ingredientes están por debajo del stock mínimo:{' '}
              {lowStockItems.map((i) => `${i.name} (${i.currentStock} ${i.unit})`).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar insumo o proveedor..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <span className="text-xs font-mono text-slate-400">{filteredIngredients.length} insumos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Insumo</th>
                <th className="py-2.5 px-3">Stock Actual</th>
                <th className="py-2.5 px-3">Stock Mínimo</th>
                <th className="py-2.5 px-3">Costo x Unidad</th>
                <th className="py-2.5 px-3">Valor Total</th>
                <th className="py-2.5 px-3">Proveedor</th>
                <th className="py-2.5 px-3 text-right">Ajuste Rápido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredIngredients.map((ing) => {
                const isLow = ing.currentStock <= ing.minStock;
                const valueTotal = ing.currentStock * ing.costPerUnit;

                return (
                  <tr key={ing.id} className="hover:bg-slate-850/60 transition">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-200 flex items-center gap-2">
                      {isLow && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                      {ing.name}
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      <span className={isLow ? 'text-rose-400 font-bold' : 'text-slate-100'}>
                        {ing.currentStock} {ing.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {ing.minStock} {ing.unit}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      ${ing.costPerUnit.toLocaleString('es-AR')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-100">
                      ${valueTotal.toLocaleString('es-AR')}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400">{ing.supplier}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => updateStock(ing.id, -1)}
                          className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded text-[11px]"
                          title="Restar 1 unidad/kg"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => updateStock(ing.id, 5)}
                          className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded text-[11px]"
                          title="Sumar 5 unidades/kg"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => updateStock(ing.id, 20)}
                          className="px-2 py-0.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold rounded text-[11px]"
                          title="Sumar 20 unidades/kg"
                        >
                          +20
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Ingredient */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddIngredient}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-4 shadow-2xl space-y-3 text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-slate-100">Ingresar Insumo o Materia Prima</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nombre del Insumo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Muzzarella Barra 5kg"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Unidad de Medida</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="gr">Gramos (gr)</option>
                  <option value="lt">Litros (lt)</option>
                  <option value="unidad">Unidades (cajas, etc.)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Stock Inicial</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                  placeholder="50"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono font-bold text-orange-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Stock Mínimo (Alerta)</label>
                <input
                  type="number"
                  step="0.1"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  placeholder="15"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Costo Unitario ($)</label>
                <input
                  type="number"
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(e.target.value)}
                  placeholder="7200"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Proveedor Habitual</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Ej: Lácteos La Paulina / Distribuidora Norte"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-lg shadow-sm"
              >
                Guardar Insumo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
