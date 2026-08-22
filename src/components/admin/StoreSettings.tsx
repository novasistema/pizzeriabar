import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Store, 
  Building2, 
  CreditCard, 
  Bike, 
  Check, 
  RotateCcw, 
  Clock,
  Image as ImageIcon,
  Upload,
  Link,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Instagram,
  Globe,
  Lock,
  QrCode,
  FileText,
  AlertTriangle,
  Trash2,
  Share2,
  Copy,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { PizzeriaSettings } from '../../types';
import { StorageService } from '../../services/storageService';
import { ShareMenuModal } from './ShareMenuModal';

interface StoreSettingsProps {
  settings: PizzeriaSettings;
  onUpdateSettings: (newSettings: PizzeriaSettings) => void;
}

export const StoreSettings: React.FC<StoreSettingsProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [form, setForm] = useState<PizzeriaSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [logoInputType, setLogoInputType] = useState<'upload' | 'url'>('upload');
  const [qrInputType, setQrInputType] = useState<'upload' | 'url'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  // Compute public menu URL
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}`
    : '';
  const customerMenuUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}view=customer`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customerMenuUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const msg = `🍕 ¡Hola! Te compartimos la Carta Digital de *${form.name}* para que hagas tu pedido online:\n\n👉 ${customerMenuUrl}\n\n🛵 ¡Hacemos delivery o podés retirar por el local!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'qr') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (target === 'logo') {
        setForm(prev => ({ ...prev, logoUrl: base64 }));
      } else {
        setForm(prev => ({ ...prev, mercadoPagoQrUrl: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(form);
    onUpdateSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetFactory = () => {
    if (confirm('¿Restaurar todos los datos a la configuración inicial por defecto? Se reiniciarán también los pedidos de prueba.')) {
      StorageService.resetToFactoryDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-serif flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-amber-500" />
            <span>Configuración de la Empresa & Datos del Local</span>
          </h3>
          <p className="text-xs text-slate-500">
            Administra la identidad corporativa, logotipo, canales de contacto, horarios, delivery y cuentas bancarias.
          </p>
        </div>

        <button
          onClick={handleResetFactory}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition self-start sm:self-auto"
          title="Restablecer datos de prueba"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Datos</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* =========================================================================
            0. LINK DE LA CARTA DIGITAL PARA CLIENTES (ENLACE OFICIAL)
           ========================================================================= */}
        <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 dark:from-amber-950/40 dark:via-slate-900 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700/60 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Enlace de la Carta Online para tus Clientes</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Copiá y compartí este enlace en tus redes, estados de WhatsApp, flyers o mensajes directos.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full self-start sm:self-auto border border-emerald-300 dark:border-emerald-800">
              🟢 URL Pública Activa
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-mono text-slate-800 dark:text-slate-200 truncate select-all shadow-inner">
              {customerMenuUrl}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-black transition shadow-sm shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? '¡Link Copiado!' : 'Copiar Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-sm shrink-0 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-black transition shadow-sm shrink-0 active:scale-95"
              >
                <QrCode className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                <span>Ver / Imprimir QR</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            1. LOGOTIPO & IDENTIDAD VISUAL DE LA EMPRESA
           ========================================================================= */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-500" />
              <span>1. Logotipo & Marca de la Pizzería</span>
            </h4>
            <span className="text-[11px] text-slate-400">Se mostrará en la carta, tickets y cabecera</span>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6 pt-2">
            {/* Logo Preview Card */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden p-2 relative shadow-inner">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt={form.name}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <Store className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px] font-semibold">Sin logo</span>
                  </div>
                )}
              </div>
              {form.logoUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logoUrl: '' })}
                  className="text-rose-500 hover:text-rose-700 text-[11px] font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Quitar logo
                </button>
              )}
            </div>

            {/* Logo Upload / URL Controls */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLogoInputType('upload')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    logoInputType === 'upload'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Subir Imagen desde el dispositivo
                </button>
                <button
                  type="button"
                  onClick={() => setLogoInputType('url')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    logoInputType === 'url'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Link className="w-3.5 h-3.5" /> Pegar enlace / URL
                </button>
              </div>

              {logoInputType === 'upload' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 dark:border-amber-900/60 hover:border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl p-4 text-center cursor-pointer transition"
                  >
                    <Upload className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Haz clic para seleccionar el logo de tu empresa
                    </p>
                    <p className="text-[11px] text-slate-500">
                      PNG, JPG, WEBP o SVG (Recomendado: fondo transparente o blanco, máx 2MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    URL de la Imagen del Logo
                  </label>
                  <input
                    type="url"
                    value={form.logoUrl || ''}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    placeholder="https://ejemplo.com/logo-pizzeria.png"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nombre del Negocio / Razón Comercial *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Eslogan / Especialidad Gastronómica
              </label>
              <input
                type="text"
                value={form.slogan}
                onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                placeholder="Ej: Pizzas al horno de barro con masa madre"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                CUIT / RUT / Identificación Fiscal
              </label>
              <input
                type="text"
                value={form.cuit || ''}
                onChange={(e) => setForm({ ...form, cuit: e.target.value })}
                placeholder="Ej: 30-71829341-8"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                PIN de Acceso al Sistema Pizzería (Personal)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.adminPin || '1234'}
                  onChange={(e) => setForm({ ...form, adminPin: e.target.value })}
                  placeholder="1234"
                  maxLength={6}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold tracking-widest text-amber-600"
                />
                <Lock className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Clave de 4 a 6 dígitos para ingresar al panel de cocina/administración</p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. MENSAJES DE CABECERA Y PIE
           ========================================================================= */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>2. Mensajes Informativos de la Tienda</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Texto del Anuncio Superior (Barra de Cabecera)
              </label>
              <input
                type="text"
                value={form.bannerMessage}
                onChange={(e) => setForm({ ...form, bannerMessage: e.target.value })}
                placeholder="Ej: 🍕 Pizzas artesanales al horno de barro con masa madre • Envíos a domicilio"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mensaje al Pie de Comanda / Tickets
              </label>
              <input
                type="text"
                value={form.footerText || ''}
                onChange={(e) => setForm({ ...form, footerText: e.target.value })}
                placeholder="Ej: ¡Gracias por elegirnos! Elaborado con ingredientes frescos y masa madre de 48hs."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. CONTACTO, UBICACIÓN & REDES SOCIALES
           ========================================================================= */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>3. Contacto, Ubicación & Canales Oficiales</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>WhatsApp Oficial para Pedidos *</span>
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+54 9 11 2345-6789"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span>Teléfono de Línea Fija</span>
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+54 11 4890-1234"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>Correo Electrónico Oficial</span>
              </label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contacto@pizzeria.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
                <span>Instagram Oficial</span>
              </label>
              <input
                type="text"
                value={form.instagram || ''}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="@bellanapolipizza"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dirección Física del Local (Calle y Altura) *
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Av. Corrientes 3421, Palermo"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ciudad / Localidad / Provincia
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Buenos Aires, Argentina"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>Enlace a Google Maps (para retiros)</span>
              </label>
              <input
                type="url"
                value={form.googleMapsUrl || ''}
                onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. HORARIOS & ESTADO DE APERTURA
           ========================================================================= */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span>4. Horarios & Estado del Local</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Estado de la Pizzería</p>
                <p className="text-[11px] text-slate-500">
                  {form.isOpen ? 'Aceptando pedidos online en vivo' : 'Local cerrado temporalmente'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, isOpen: !form.isOpen })}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition ${
                  form.isOpen
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                }`}
              >
                {form.isOpen ? 'ABIERTO' : 'CERRADO'}
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Horarios de Atención Detallados
              </label>
              <input
                type="text"
                value={form.openingHours}
                onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                placeholder="Mar a Dom: 19:30 a 00:30 hs (Lunes cerrado)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. DELIVERY, TIEMPOS & TARIFAS
           ========================================================================= */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Bike className="w-4 h-4 text-orange-500" />
            <span>5. Delivery, Pedido Mínimo & Tiempos</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Costo Base de Envío ($)
              </label>
              <input
                type="number"
                value={form.deliveryFeeBase}
                onChange={(e) => setForm({ ...form, deliveryFeeBase: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Envío Gratis desde ($)
              </label>
              <input
                type="number"
                value={form.freeDeliveryOver}
                onChange={(e) => setForm({ ...form, freeDeliveryOver: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pedido Mínimo Delivery ($)
              </label>
              <input
                type="number"
                value={form.minimumOrderAmount}
                onChange={(e) => setForm({ ...form, minimumOrderAmount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tiempo Estimado Delivery (min)
              </label>
              <input
                type="number"
                value={form.estimatedDeliveryTimeMinutes}
                onChange={(e) => setForm({ ...form, estimatedDeliveryTimeMinutes: parseInt(e.target.value) || 35 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            6. VINCULACIÓN DE BILLETERA VIRTUAL, ALIAS & MEDIOS DE COBRO
           ========================================================================= */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span>6. Vinculación de Billetera Virtual & ALIAS de Cobro</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Estos datos son los que verán los clientes en pantalla cuando elijan pagar por transferencia o billetera virtual.
              </p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
              Cobro Inmediato
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Billetera Virtual / Proveedor */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Billetera Virtual / Banco de Destino *
              </label>
              <input
                type="text"
                list="wallet-providers"
                value={form.bankDetails.walletProvider || form.bankDetails.bankName || ''}
                onChange={(e) => setForm({
                  ...form,
                  bankDetails: { 
                    ...form.bankDetails, 
                    walletProvider: e.target.value,
                    bankName: e.target.value
                  }
                })}
                placeholder="Ej: Mercado Pago / Cuenta DNI / Ualá / Santander"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                required
              />
              <datalist id="wallet-providers">
                <option value="Mercado Pago" />
                <option value="Cuenta DNI" />
                <option value="Modo" />
                <option value="Ualá" />
                <option value="Personal Pay" />
                <option value="Lemon Cash" />
                <option value="Brubank" />
                <option value="Banco Santander" />
                <option value="Banco Galicia" />
                <option value="Banco BBVA" />
                <option value="Banco Nación" />
                <option value="Banco Macro" />
                <option value="Banco Provincia" />
              </datalist>
            </div>

            {/* ALIAS */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>ALIAS de la Billetera / CVU *</span>
                <span className="text-[10px] text-amber-600 font-semibold">Se muestra al cliente</span>
              </label>
              <input
                type="text"
                value={form.bankDetails.alias}
                onChange={(e) => setForm({
                  ...form,
                  bankDetails: { ...form.bankDetails, alias: e.target.value.toUpperCase().replace(/\s+/g, '') }
                })}
                placeholder="Ej: PIZZERIA.NAPOLI.MP"
                className="w-full px-3.5 py-2 rounded-xl border-2 border-amber-400 dark:border-amber-500/60 bg-amber-50/30 dark:bg-amber-950/20 font-mono font-black text-slate-900 dark:text-white uppercase tracking-wider"
                required
              />
            </div>

            {/* CBU / CVU */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                CBU o CVU (22 dígitos) *
              </label>
              <input
                type="text"
                value={form.bankDetails.cbu}
                maxLength={22}
                onChange={(e) => setForm({
                  ...form,
                  bankDetails: { ...form.bankDetails, cbu: e.target.value.replace(/\D/g, '') }
                })}
                placeholder="0000003100049281729014"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono tracking-wider"
                required
              />
            </div>

            {/* Titular de la Cuenta */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Titular / Nombre del Beneficiario *
              </label>
              <input
                type="text"
                value={form.bankDetails.accountHolder}
                onChange={(e) => setForm({
                  ...form,
                  bankDetails: { ...form.bankDetails, accountHolder: e.target.value }
                })}
                placeholder="Ej: Bella Napoli Gastronomía SRL"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                required
              />
            </div>

            {/* CUIT / CUIL */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                CUIT / CUIL del Titular
              </label>
              <input
                type="text"
                value={form.bankDetails.cuit}
                onChange={(e) => setForm({
                  ...form,
                  bankDetails: { ...form.bankDetails, cuit: e.target.value }
                })}
                placeholder="Ej: 30-71829341-8"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>

            {/* Tipo de Cuenta */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Cuenta / Formato
              </label>
              <input
                type="text"
                value={form.bankDetails.accountType || ''}
                onChange={(e) => setForm({
                  ...form,
                  bankDetails: { ...form.bankDetails, accountType: e.target.value }
                })}
                placeholder="Ej: Billetera Virtual (CVU) / Cuenta Corriente"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {/* Instrucciones de Pago */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Instrucciones o Aclaraciones para el Cliente al Pagar:</span>
                <span className="text-[11px] text-slate-400 font-normal">Aparecerá en el checkout</span>
              </label>
              <input
                type="text"
                value={form.bankDetails.paymentInstructions || ''}
                onChange={(e) => setForm({
                  ...form,
                  bankDetails: { ...form.bankDetails, paymentInstructions: e.target.value }
                })}
                placeholder="Ej: Transfiere el monto exacto con el ALIAS y adjunta tu comprobante o envíalo por WhatsApp con tu número de pedido."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            {/* Requerir comprobante de pago */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Solicitar Comprobante de Transferencia en el Pedido</p>
                <p className="text-[11px] text-slate-500">
                  Permite al cliente adjuntar captura de pantalla o PDF directamente al finalizar el pedido para que puedas verificarlo en administración.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.bankDetails.requireProof !== false}
                  onChange={(e) => setForm({
                    ...form,
                    bankDetails: { ...form.bankDetails, requireProof: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* QR Mercado Pago */}
            <div className="sm:col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-sky-500" />
                <span>Código QR de Mercado Pago / Enlace de Cobro (Opcional)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={form.mercadoPagoQrUrl || ''}
                  onChange={(e) => setForm({ ...form, mercadoPagoQrUrl: e.target.value })}
                  placeholder="https://api.qrserver.com/... o enlace de cobro"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                />
                <input
                  type="file"
                  ref={qrFileInputRef}
                  onChange={(e) => handleFileUpload(e, 'qr')}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => qrFileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" /> Subir QR
                </button>
              </div>
            </div>

            {/* Interactive Live Customer Preview Card */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-linear-to-br from-amber-50 to-blue-50 dark:from-slate-850 dark:to-slate-900 border border-amber-200/70 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Vista Previa: Así verá el cliente el ALIAS al hacer su pedido</span>
                </span>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
                  En Vivo
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">ALIAS PARA TRANSFERIR</span>
                    <span className="font-mono font-black text-base text-blue-600 dark:text-blue-400">
                      {form.bankDetails.alias || 'SIN ALIAS'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                    Copiar Alias
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-1.5 space-y-0.5">
                  <p><strong>Billetera:</strong> {form.bankDetails.walletProvider || form.bankDetails.bankName || 'Billetera Virtual'} • <strong>Titular:</strong> {form.bankDetails.accountHolder}</p>
                  <p><strong>CBU/CVU:</strong> {form.bankDetails.cbu || '0000000000000000000000'}</p>
                </div>
              </div>
            </div>

            {/* Formas de Pago Aceptadas Checkboxes */}
            <div className="sm:col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-white mb-2">Métodos de Pago Habilitados para Clientes:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={form.acceptCash}
                    onChange={(e) => setForm({ ...form, acceptCash: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Efectivo</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={form.acceptTransfer}
                    onChange={(e) => setForm({ ...form, acceptTransfer: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Transferencia / ALIAS</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={form.acceptMercadoPago}
                    onChange={(e) => setForm({ ...form, acceptMercadoPago: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Mercado Pago (QR)</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={form.acceptCardOnDelivery}
                    onChange={(e) => setForm({ ...form, acceptCardOnDelivery: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Tarjeta al recibir</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-6 py-3 bg-linear-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white rounded-2xl font-black text-sm shadow-md shadow-amber-500/25 transition active:scale-98 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Todos los Cambios</span>
            </button>

            {isSaved && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" /> ¡Configuración guardada con éxito!
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Los datos se sincronizan en tiempo real
          </span>
        </div>
      </form>

      {/* Share Menu & QR Modal */}
      <ShareMenuModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        settings={form}
      />
    </div>
  );
};
