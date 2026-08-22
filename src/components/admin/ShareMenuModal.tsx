import React, { useState, useRef } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  QrCode, 
  Printer, 
  Download, 
  MessageCircle, 
  Sparkles, 
  Store,
  Pizza,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { PizzeriaSettings } from '../../types';

interface ShareMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PizzeriaSettings;
  onOpenCustomerView?: () => void;
}

export const ShareMenuModal: React.FC<ShareMenuModalProps> = ({
  isOpen,
  onClose,
  settings,
  onOpenCustomerView,
}) => {
  const [copied, setCopied] = useState(false);
  const [customMsg, setCustomMsg] = useState(
    `🍕 ¡Hola! Te compartimos la Carta Digital de *${settings.name}* para que elijas tus pizzas y hagas tu pedido online en 1 minuto.\n\n🛵 Hacemos delivery o podés retirar por el local.\n\n👉 Entrá aquí para pedir:`
  );
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Compute public menu URL
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}`
    : '';
  const customerMenuUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}view=customer`;

  // QR Code URL generator
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(customerMenuUrl)}&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customerMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const fullMessage = `${customMsg}\n${customerMenuUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePrintQr = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Carta Digital - ${settings.name}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center;
              padding: 40px 20px;
              color: #0f172a;
              background-color: #ffffff;
            }
            .card {
              max-width: 420px;
              margin: 0 auto;
              border: 3px solid #f59e0b;
              border-radius: 28px;
              padding: 36px 24px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            }
            h1 {
              font-size: 26px;
              margin: 12px 0 4px;
              color: #b45309;
            }
            p.sub {
              font-size: 15px;
              color: #475569;
              margin-bottom: 24px;
            }
            .qr-wrapper {
              background: #f8fafc;
              padding: 16px;
              border-radius: 20px;
              display: inline-block;
              border: 1px solid #e2e8f0;
            }
            .qr-wrapper img {
              width: 260px;
              height: 260px;
              display: block;
            }
            .cta {
              margin-top: 24px;
              font-size: 18px;
              font-weight: 800;
              color: #0f172a;
            }
            .url {
              font-size: 12px;
              color: #64748b;
              word-break: break-all;
              margin-top: 8px;
              font-family: monospace;
            }
            .footer {
              margin-top: 20px;
              font-size: 13px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="card">
            ${settings.logoUrl ? `<img src="${settings.logoUrl}" style="height: 60px; max-width: 180px; object-fit: contain; margin-bottom: 8px;" />` : ''}
            <h1>${settings.name}</h1>
            <p class="sub">¡Pedí online desde tu celular!</p>
            <div class="qr-wrapper">
              <img src="${qrCodeUrl}" alt="QR Carta ${settings.name}" />
            </div>
            <div class="cta">📲 Escaneá el QR con tu cámara para ver la Carta Digital</div>
            <div class="url">${customerMenuUrl}</div>
            <div class="footer">${settings.address ? `📍 ${settings.address}` : ''} ${settings.phone ? `• 📞 ${settings.phone}` : ''}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR-Carta-${settings.name.replace(/\s+/g, '-')}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-serif">
                Link de la Carta Digital para Clientes
              </h3>
              <p className="text-xs text-slate-500">
                Compartí este enlace o código QR con tus clientes para que hagan pedidos online.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Main Copyable Link Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-500" />
              <span>Enlace Directo a la Carta Online</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Listo para enviar
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 truncate select-all">
              {customerMenuUrl}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition shadow-sm shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Link Copiado!' : 'Copiar Link'}</span>
              </button>

              {onOpenCustomerView && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCustomerView();
                  }}
                  className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition shrink-0"
                  title="Abrir vista de cliente"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ver Carta</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Direct WhatsApp Sharing Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-emerald-950 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Enviar por WhatsApp a Clientes o Grupos</span>
            </h4>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
              Mensaje automático
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
              Mensaje que se enviará:
            </label>
            <textarea
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-98"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Abrir WhatsApp y Compartir Carta</span>
          </button>
        </div>

        {/* 3. QR Code Presentation & Printing */}
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-amber-50/60 to-orange-50/60 dark:from-slate-800/40 dark:to-slate-850 border border-amber-200/70 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-5">
          {/* QR Image Box */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-white dark:bg-slate-900 p-2.5 border-2 border-amber-300 dark:border-slate-600 flex items-center justify-center shrink-0 shadow-sm">
            <img
              src={qrCodeUrl}
              alt="QR de la Carta"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>

          {/* QR Details and Action Buttons */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
              <QrCode className="w-4 h-4 text-amber-500" />
              <span>Código QR para Mesas, Mostrador o Folletos</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Imprimí este código para colocarlo en las mesas, en el mostrador del local o en tus folletos de reparto. Al escanearlo, los comensales entran directo a la carta digital.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrintQr}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-black transition shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Cartel QR</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQr}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Imagen QR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Los clientes no necesitan registrarse ni descargar ninguna aplicación.</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:underline"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
