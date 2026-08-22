import React, { useRef } from 'react';
import { Printer, X, Check, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReceiptModal: React.FC = () => {
  const { selectedOrderForReceipt, setSelectedOrderForReceipt, businessConfig } = useApp();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!selectedOrderForReceipt) return null;

  const order = selectedOrderForReceipt;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            Comanda Térmica ({businessConfig.printerPaperSize})
          </span>
          <button
            onClick={() => setSelectedOrderForReceipt(null)}
            className="text-slate-400 hover:text-slate-200 font-bold p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Ticket Receipt Paper */}
        <div
          ref={receiptRef}
          className="bg-amber-50/90 p-4 rounded-xl border border-amber-200 font-mono text-xs text-slate-800 space-y-2.5 shadow-inner"
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-400/80 pb-2.5 space-y-0.5">
            <h2 className="text-sm font-black tracking-wider text-slate-900 uppercase">
              🍕 {businessConfig.name}
            </h2>
            <p className="text-[10px] text-slate-600">{businessConfig.address}</p>
            <p className="text-[10px] text-slate-600">Tel: {businessConfig.phone}</p>
          </div>

          {/* Order Info */}
          <div className="border-b border-dashed border-slate-400/80 pb-2 space-y-0.5 text-[11px]">
            <div className="flex justify-between font-bold">
              <span>COMANDA: #{order.orderNumber}</span>
              <span className="uppercase">{order.type}</span>
            </div>
            <div className="text-[10px] text-slate-600">
              Fecha: {new Date(order.createdAt).toLocaleDateString('es-AR')}{' '}
              {new Date(order.createdAt).toLocaleTimeString('es-AR')}
            </div>
            <div className="text-[10px] text-slate-600">
              Cliente: <strong>{order.customerName}</strong>
            </div>
            {order.customerPhone && (
              <div className="text-[10px] text-slate-600">Tel: {order.customerPhone}</div>
            )}
            {order.customerAddress && (
              <div className="text-[10px] font-bold text-slate-800">
                Dirección: {order.customerAddress}
              </div>
            )}
            {order.tableNumber && (
              <div className="text-[10px] font-bold text-slate-800">Ubicación: {order.tableNumber}</div>
            )}
          </div>

          {/* Items */}
          <div className="border-b border-dashed border-slate-400/80 pb-2 space-y-1">
            {order.items.map((it, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>
                    {it.quantity}x {it.productName}
                  </span>
                  <span>${it.totalPrice.toLocaleString('es-AR')}</span>
                </div>
                {it.customization && (
                  <div className="text-[10px] text-slate-600 pl-2">
                    - Tamaño: {it.customization.size}
                    {it.customization.extras?.length
                      ? ` (+ ${it.customization.extras.join(', ')})`
                      : ''}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-amber-200/60 p-1.5 rounded text-[10px] text-amber-950 font-sans font-medium">
              <strong>Obs:</strong> {order.notes}
            </div>
          )}

          {/* Totals */}
          <div className="space-y-0.5 pt-0.5 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${order.subtotal.toLocaleString('es-AR')}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Envío:</span>
                <span>+${order.deliveryFee.toLocaleString('es-AR')}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-rose-700">
                <span>Descuento:</span>
                <span>-${order.discount.toLocaleString('es-AR')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-950 pt-1 border-t border-slate-400/80">
              <span>TOTAL:</span>
              <span>${order.total.toLocaleString('es-AR')}</span>
            </div>
            <div className="text-[10px] text-right text-slate-600 capitalize">
              Pago: {order.paymentMethod} {order.isPaid ? '(PAGADO)' : '(PENDIENTE)'}
            </div>
          </div>

          {/* Footer Barcode simulator */}
          <div className="text-center pt-2 border-t border-dashed border-slate-400/80 text-[10px] text-slate-500 space-y-1">
            <p>¡Gracias por su compra!</p>
            <div className="h-5 bg-slate-900 text-white flex items-center justify-center font-mono tracking-widest text-[8px]">
              ||| | |||| || | ||| |||| |
            </div>
          </div>
        </div>

        {/* Print / Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
          <button
            onClick={() => setSelectedOrderForReceipt(null)}
            className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir Comanda
          </button>
        </div>
      </div>
    </div>
  );
};
