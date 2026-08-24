import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  Phone,
  CheckCheck,
  QrCode,
  Copy,
  ExternalLink,
  ShoppingBag,
  Pizza,
  Edit2,
  Check,
  X,
  Smartphone,
  CreditCard,
  Building2,
  CheckCircle2,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  options?: { label: string; action: string; value?: any }[];
  isReceipt?: boolean;
}

export const ChatbotSimulatorModal: React.FC = () => {
  const {
    isChatbotModalOpen,
    setIsChatbotModalOpen,
    products,
    addOrder,
    businessConfig,
    updateBusinessConfig,
  } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [botStep, setBotStep] = useState<
    'menu' | 'pizza_select' | 'drinks_select' | 'address' | 'payment' | 'transfer_pending' | 'confirmed'
  >('menu');

  // Phone editing state
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(businessConfig.phone || '+54 9 11 4890-1280');
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  // Payment Alias editing state
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [aliasInput, setAliasInput] = useState(businessConfig.paymentAlias || 'bruzzone128.mp');
  const [isSavingAlias, setIsSavingAlias] = useState(false);
  const [copiedAliasToast, setCopiedAliasToast] = useState(false);

  useEffect(() => {
    if (businessConfig.phone) {
      setPhoneInput(businessConfig.phone);
    }
  }, [businessConfig.phone]);

  useEffect(() => {
    if (businessConfig.paymentAlias) {
      setAliasInput(businessConfig.paymentAlias);
    }
  }, [businessConfig.paymentAlias]);

  // Clean phone number for wa.me URL
  const cleanPhone = (businessConfig.phone || '+54 9 11 4890-1280').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone || '5491148901280'}?text=${encodeURIComponent(
    `¡Hola! Quiero hacer un pedido en ${businessConfig.name || 'el local'}`
  )}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    whatsappUrl
  )}&color=0f172a&bgcolor=ffffff&margin=1`;

  // Temporary order state in bot
  const [selectedPizza, setSelectedPizza] = useState<any>(null);
  const [selectedDrink, setSelectedDrink] = useState<any>(null);
  const [customerName, setCustomerName] = useState('Mariano');
  const [customerAddress, setCustomerAddress] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize bot greeting
  useEffect(() => {
    if (isChatbotModalOpen && messages.length === 0) {
      setMessages([
        {
          id: 'm1',
          sender: 'bot',
          text: `¡Hola! 🍕 Bienvenido al WhatsApp Oficial de *${businessConfig.name || 'Bruzzone128'}*.\n\n¿En qué te podemos ayudar hoy?`,
          timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          options: [
            { label: '🍕 Pedir una Pizza', action: 'START_PIZZA_ORDER' },
            { label: '🥟 Pedir Empanadas', action: 'START_EMPANADAS' },
            { label: '📍 Horarios y Dirección', action: 'SHOW_INFO' },
          ],
        },
      ]);
    }
  }, [isChatbotModalOpen, businessConfig.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getPaymentOptions = () => {
    const opts: { label: string; action: string; value?: any }[] = [];
    const aliasDisplay = businessConfig.paymentAlias || 'bruzzone128.mp';

    // Transferencia con Alias
    if (businessConfig.deliveryPayments?.transferencia !== false) {
      opts.push({
        label: `🏛️ Transferencia / Alias (${aliasDisplay})`,
        action: 'CHOOSE_PAYMENT_TRANSFER',
        value: 'transferencia',
      });
    }

    // Efectivo
    if (businessConfig.deliveryPayments?.efectivo !== false) {
      opts.push({
        label: '💵 Efectivo al repartidor',
        action: 'CHOOSE_PAYMENT_CASH',
        value: 'efectivo',
      });
    }

    // Tarjeta
    if (businessConfig.deliveryPayments?.tarjeta) {
      opts.push({
        label: '💳 Tarjeta Débito / Crédito',
        action: 'CHOOSE_PAYMENT_CARD',
        value: 'tarjeta',
      });
    }

    // Fallback if none enabled
    if (opts.length === 0) {
      opts.push(
        {
          label: `🏛️ Transferencia / Alias (${aliasDisplay})`,
          action: 'CHOOSE_PAYMENT_TRANSFER',
          value: 'transferencia',
        },
        {
          label: '💵 Efectivo al repartidor',
          action: 'CHOOSE_PAYMENT_CASH',
          value: 'efectivo',
        }
      );
    }

    return opts;
  };

  const handleOptionClick = (action: string, value?: any) => {
    const time = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    if (action === 'START_PIZZA_ORDER') {
      const pizzaOptions = products
        .filter((p) => p.category === 'pizzas')
        .slice(0, 4)
        .map((p) => ({
          label: `${p.name} ($${p.price.toLocaleString('es-AR')})`,
          action: 'CHOOSE_PIZZA',
          value: p,
        }));

      setMessages((prev) => [
        ...prev,
        { id: `m-${Date.now()}-u`, sender: 'user', text: '🍕 Quiero pedir una pizza', timestamp: time },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: '¡Excelente elección! ¿Qué sabor te gustaría marchar al horno? 🔥',
          timestamp: time,
          options: pizzaOptions,
        },
      ]);
      setBotStep('pizza_select');
    } else if (action === 'START_EMPANADAS') {
      const empanadas = products.filter((p) => p.category === 'empanadas');
      const targetEmpanada = empanadas[0] || { name: 'Empanadas de Carne Cortada a Cuchillo', price: 1800 };
      setSelectedPizza(targetEmpanada);

      setMessages((prev) => [
        ...prev,
        { id: `m-${Date.now()}-u`, sender: 'user', text: '🥟 Quiero pedir empanadas', timestamp: time },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: `¡Las mejores empanadas al horno! 🔥\nSeleccionaste *Docena de Empanadas* ($${(targetEmpanada.price * 12 || 21600).toLocaleString('es-AR')}).\n\nPor favor escribe tu *dirección de entrega* (Calle, Número, Piso/Depto):`,
          timestamp: time,
        },
      ]);
      setBotStep('address');
    } else if (action === 'CHOOSE_PIZZA') {
      setSelectedPizza(value);
      const drinkOptions = products
        .filter((p) => p.category === 'bebidas')
        .slice(0, 3)
        .map((d) => ({
          label: `${d.name} (+$${d.price.toLocaleString('es-AR')})`,
          action: 'CHOOSE_DRINK',
          value: d,
        }));

      drinkOptions.push({
        label: '❌ Sin bebida, solo la comida',
        action: 'CHOOSE_DRINK',
        value: null,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}-u`,
          sender: 'user',
          text: `Elegí: ${value.name}`,
          timestamp: time,
        },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: `¡Buenísimo! ${value.name} anotada 🍕. ¿Deseas agregar alguna bebida bien fría?`,
          timestamp: time,
          options: drinkOptions,
        },
      ]);
      setBotStep('drinks_select');
    } else if (action === 'CHOOSE_DRINK') {
      setSelectedDrink(value);
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}-u`,
          sender: 'user',
          text: value ? `Bebida: ${value.name}` : 'Sin bebida',
          timestamp: time,
        },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: '¡Perfecto! Por favor escribe tu *dirección de entrega* (Calle, Número, Piso/Depto):',
          timestamp: time,
        },
      ]);
      setBotStep('address');
    } else if (action === 'CHOOSE_PAYMENT_TRANSFER') {
      const targetPizza = selectedPizza || products[0];
      const targetDrink = selectedDrink;
      const deliveryFee = businessConfig.deliveryFeeDefault || 1500;
      const subtotal = targetPizza.price + (targetDrink ? targetDrink.price : 0);
      const total = subtotal + deliveryFee;

      const alias = businessConfig.paymentAlias || 'bruzzone128.mp';
      const bank = businessConfig.bankName || 'Mercado Pago / Banco Galicia';
      const holder = businessConfig.accountHolder || businessConfig.name || 'Pizzería Bruzzone 128';
      const cbu = businessConfig.cbuCvu || '0000003100012345678901';
      const cuit = businessConfig.cuitCuil || '30-71234567-8';
      const instructions =
        businessConfig.transferInstructions ||
        'Envía el comprobante por este chat para confirmar y enviar tu pedido a cocina 🍕.';

      const transferMessage =
        `🏛️ *DATOS PARA TRANSFERENCIA BANCARIA / ALIAS* 🏛️\n\n` +
        `• *Alias de Pago:* *${alias}*\n` +
        `• *Banco / Billetera:* ${bank}\n` +
        `• *Titular:* ${holder}\n` +
        `• *CBU / CVU:* ${cbu}\n` +
        `• *CUIT / CUIL:* ${cuit}\n` +
        `• *Total exacto a transferir:* *$${total.toLocaleString('es-AR')}*\n\n` +
        `📸 *${instructions}*`;

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}-u`,
          sender: 'user',
          text: `🏛️ Elijo pagar por Transferencia (Alias: ${alias})`,
          timestamp: time,
        },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: transferMessage,
          timestamp: time,
          options: [
            { label: `📋 Copiar Alias (${alias})`, action: 'COPY_ALIAS', value: alias },
            { label: '✅ Ya transferí / Enviar comprobante', action: 'CONFIRM_TRANSFER_ORDER' },
            { label: '🔄 Cambiar medio de pago', action: 'BACK_TO_PAYMENT' },
          ],
        },
      ]);
      setBotStep('transfer_pending');
    } else if (action === 'COPY_ALIAS') {
      const aliasToCopy = value || businessConfig.paymentAlias || 'bruzzone128.mp';
      navigator.clipboard.writeText(aliasToCopy);
      setCopiedAliasToast(true);
      setTimeout(() => setCopiedAliasToast(false), 3000);

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}-u`,
          sender: 'user',
          text: `📋 Copié el alias: ${aliasToCopy}`,
          timestamp: time,
        },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: `¡Excelente! Abre tu app de *Mercado Pago, Cuenta DNI, Banco o Billetera Virtual*, pega el alias *${aliasToCopy}* y realiza la transferencia por el monto exacto.\n\nCuando finalices, presiona el botón *✅ Ya transferí* para que ingrese a cocina.`,
          timestamp: time,
          options: [
            { label: '✅ Ya transferí / Confirmar Pedido', action: 'CONFIRM_TRANSFER_ORDER' },
            { label: '🔄 Cambiar medio de pago', action: 'BACK_TO_PAYMENT' },
          ],
        },
      ]);
    } else if (action === 'CONFIRM_TRANSFER_ORDER') {
      const targetPizza = selectedPizza || products[0];
      const targetDrink = selectedDrink;
      const deliveryFee = businessConfig.deliveryFeeDefault || 1500;
      const subtotal = targetPizza.price + (targetDrink ? targetDrink.price : 0);
      const total = subtotal + deliveryFee;
      const alias = businessConfig.paymentAlias || 'bruzzone128.mp';

      const createdOrder = addOrder({
        customerName: customerName,
        customerPhone: '11-6543-2109',
        customerAddress: customerAddress || 'Av. Corrientes 1450 3° A',
        type: 'delivery',
        status: 'pendiente',
        source: 'chatbot',
        paymentMethod: 'transferencia',
        isPaid: true,
        deliveryFee: deliveryFee,
        discount: 0,
        subtotal: subtotal,
        total: total,
        notes: `Pedido Chatbot WhatsApp - Pagado por Transferencia (Alias: ${alias}) 🤖`,
        items: [
          {
            id: `bot-it-${Date.now()}-1`,
            productId: targetPizza.id,
            productName: targetPizza.name,
            quantity: 1,
            unitPrice: targetPizza.price,
            totalPrice: targetPizza.price,
            customization: { size: 'grande' },
          },
          ...(targetDrink
            ? [
                {
                  id: `bot-it-${Date.now()}-2`,
                  productId: targetDrink.id,
                  productName: targetDrink.name,
                  quantity: 1,
                  unitPrice: targetDrink.price,
                  totalPrice: targetDrink.price,
                },
              ]
            : []),
        ],
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}-u`,
          sender: 'user',
          text: '✅ Comprobante de transferencia enviado / Confirmación',
          timestamp: time,
        },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: `🎉 *¡PAGO REGISTRADO Y PEDIDO CONFIRMADO #${createdOrder.orderNumber}!* 🎉\n\n🍕 *Detalle:* ${targetPizza.name} ${targetDrink ? `+ ${targetDrink.name}` : ''}\n📍 *Entrega:* ${customerAddress || 'Av. Corrientes 1450 3° A'}\n🏛️ *Medio de pago:* Transferencia / Alias (${alias})\n💵 *Total abonado:* $${total.toLocaleString('es-AR')}\n\n⏱️ *Tiempo estimado de entrega:* 30 a 45 minutos.\n✅ El pedido ya ingresó a la pantalla de cocina (KDS) y al sistema POS. ¡Muchas gracias por tu compra en ${businessConfig.name || 'Bruzzone 128'}! 🍕`,
          timestamp: time,
          isReceipt: true,
          options: [{ label: '🍕 Hacer otro pedido', action: 'RESET_BOT' }],
        },
      ]);
      setBotStep('confirmed');
    } else if (action === 'CHOOSE_PAYMENT_CASH' || action === 'CHOOSE_PAYMENT_CARD') {
      const paymentType = action === 'CHOOSE_PAYMENT_CASH' ? 'efectivo' : 'tarjeta';
      const targetPizza = selectedPizza || products[0];
      const targetDrink = selectedDrink;
      const deliveryFee = businessConfig.deliveryFeeDefault || 1500;
      const subtotal = targetPizza.price + (targetDrink ? targetDrink.price : 0);
      const total = subtotal + deliveryFee;

      const createdOrder = addOrder({
        customerName: customerName,
        customerPhone: '11-6543-2109',
        customerAddress: customerAddress || 'Av. Corrientes 1450 3° A',
        type: 'delivery',
        status: 'pendiente',
        source: 'chatbot',
        paymentMethod: paymentType,
        isPaid: false,
        deliveryFee: deliveryFee,
        discount: 0,
        subtotal: subtotal,
        total: total,
        notes: `Pedido realizado por WhatsApp Bot (${paymentType === 'efectivo' ? 'Efectivo contra entrega' : 'Tarjeta'}) 🤖`,
        items: [
          {
            id: `bot-it-${Date.now()}-1`,
            productId: targetPizza.id,
            productName: targetPizza.name,
            quantity: 1,
            unitPrice: targetPizza.price,
            totalPrice: targetPizza.price,
            customization: { size: 'grande' },
          },
          ...(targetDrink
            ? [
                {
                  id: `bot-it-${Date.now()}-2`,
                  productId: targetDrink.id,
                  productName: targetDrink.name,
                  quantity: 1,
                  unitPrice: targetDrink.price,
                  totalPrice: targetDrink.price,
                },
              ]
            : []),
        ],
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}-u`,
          sender: 'user',
          text: `Pago con ${paymentType === 'efectivo' ? '💵 Efectivo al repartidor' : '💳 Tarjeta contra entrega'}`,
          timestamp: time,
        },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: `🎉 *¡PEDIDO CONFIRMADO #${createdOrder.orderNumber}!* 🎉\n\n🍕 *Detalle:* ${targetPizza.name} ${targetDrink ? `+ ${targetDrink.name}` : ''}\n📍 *Entrega:* ${customerAddress || 'Av. Corrientes 1450 3° A'}\n💵 *Total a abonar:* $${total.toLocaleString('es-AR')}\n\n⏱️ *Tiempo estimado:* 30 a 45 minutos.\nEl pedido ya ingresó a la pantalla de cocina (KDS). ¡Gracias por elegir ${businessConfig.name || 'Bruzzone 128'}! 🍕`,
          timestamp: time,
          isReceipt: true,
          options: [{ label: '🍕 Hacer otro pedido', action: 'RESET_BOT' }],
        },
      ]);
      setBotStep('confirmed');
    } else if (action === 'BACK_TO_PAYMENT') {
      const opts = getPaymentOptions();
      setMessages((prev) => [
        ...prev,
        { id: `m-${Date.now()}-u`, sender: 'user', text: '🔄 Quiero elegir otro medio de pago', timestamp: time },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: '¿Cómo prefieres abonar tu pedido?',
          timestamp: time,
          options: opts,
        },
      ]);
      setBotStep('payment');
    } else if (action === 'SHOW_INFO') {
      setMessages((prev) => [
        ...prev,
        { id: `m-${Date.now()}-u`, sender: 'user', text: '📍 Info y Horarios', timestamp: time },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: `🍕 *${businessConfig.name || 'Pizzería Bruzzone 128'}*\n📍 *Dirección:* ${businessConfig.address || 'Av. Principal 123'}\n📞 *Teléfono:* ${businessConfig.phone || '+54 9 11 4890-1280'}\n🏛️ *Alias de Pago:* \`${businessConfig.paymentAlias || 'bruzzone128.mp'}\`\n⏰ *Horario:* ${businessConfig.scheduleText || 'Lun-Dom 12:00 a 23:00'}\n\n🛵 Entregas rápidas con repartidores propios.`,
          timestamp: time,
          options: [{ label: '🍕 Pedir una Pizza', action: 'START_PIZZA_ORDER' }],
        },
      ]);
    } else if (action === 'RESET_BOT') {
      setBotStep('menu');
      setSelectedPizza(null);
      setSelectedDrink(null);
      setCustomerAddress('');
      setMessages([
        {
          id: `m-${Date.now()}`,
          sender: 'bot',
          text: '¡Hola de nuevo! ¿Qué te gustaría ordenar en esta oportunidad?',
          timestamp: time,
          options: [
            { label: '🍕 Pedir una Pizza', action: 'START_PIZZA_ORDER' },
            { label: '🥟 Pedir Empanadas', action: 'START_EMPANADAS' },
            { label: '📍 Horarios y Dirección', action: 'SHOW_INFO' },
          ],
        },
      ]);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const time = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const userText = inputText.trim();
    setInputText('');

    if (botStep === 'address') {
      setCustomerAddress(userText);
      const opts = getPaymentOptions();

      setMessages((prev) => [
        ...prev,
        { id: `m-${Date.now()}-u`, sender: 'user', text: userText, timestamp: time },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: `Dirección anotada: *${userText}* 🛵.\n¿Cómo prefieres abonar tu pedido?`,
          timestamp: time,
          options: opts,
        },
      ]);
      setBotStep('payment');
    } else if (botStep === 'transfer_pending') {
      // User sent something during transfer step (e.g. sent receipt or message)
      handleOptionClick('CONFIRM_TRANSFER_ORDER');
    } else {
      setMessages((prev) => [
        ...prev,
        { id: `m-${Date.now()}-u`, sender: 'user', text: userText, timestamp: time },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: `Recibido: "${userText}". Puedes usar los botones interactivos para armar tu pedido o pedir por el menú:`,
          timestamp: time,
          options: [{ label: '🍕 Pedir Pizza Ahora', action: 'START_PIZZA_ORDER' }],
        },
      ]);
    }
  };

  const handleSavePhone = async () => {
    if (!phoneInput.trim()) return;
    setIsSavingPhone(true);
    try {
      await updateBusinessConfig({ phone: phoneInput.trim() });
      setIsEditingPhone(false);
    } catch (err) {
      console.error('Error saving phone:', err);
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleSaveAlias = async () => {
    if (!aliasInput.trim()) return;
    setIsSavingAlias(true);
    try {
      await updateBusinessConfig({ paymentAlias: aliasInput.trim() });
      setIsEditingAlias(false);
    } catch (err) {
      console.error('Error saving alias:', err);
    } finally {
      setIsSavingAlias(false);
    }
  };

  const copyBotLink = () => {
    navigator.clipboard.writeText(whatsappUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  if (!isChatbotModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 text-white rounded-3xl max-w-4xl w-full h-[92vh] max-h-[760px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95">
        {/* Left Side: Bot Configuration & Link */}
        <div className="md:w-5/12 bg-[#111b21] p-5 border-r border-slate-800 flex flex-col justify-between hidden md:flex overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-base truncate">Mi Chatbot WhatsApp</h3>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Activo & Respondiendo
                </span>
              </div>
            </div>

            {/* Phone Number Config Card */}
            <div className="bg-[#1f2c34] rounded-2xl p-3.5 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  Número de WhatsApp
                </span>
                {!isEditingPhone ? (
                  <button
                    onClick={() => setIsEditingPhone(true)}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    title="Cambiar el número de WhatsApp al que responden los pedidos"
                  >
                    <Edit2 className="w-3 h-3" />
                    Cambiar número
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setPhoneInput(businessConfig.phone || '');
                      setIsEditingPhone(false);
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Cancelar
                  </button>
                )}
              </div>

              {!isEditingPhone ? (
                <div className="flex items-center justify-between bg-[#111b21] px-3 py-2 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">
                      {businessConfig.phone || '+54 9 11 4890-1280'}
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                    VINCULADO
                  </span>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Ej: +54 9 11 1234-5678"
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-[#111b21] border border-emerald-500/60 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSavePhone}
                      disabled={isSavingPhone}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isSavingPhone ? 'Guardando...' : 'Guardar número'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Incluye código de país y área (ej. +54 9 11...).
                  </p>
                </div>
              )}
            </div>

            {/* NEW: Payment Alias Config Card in Chatbot Modal */}
            <div className="bg-[#1f2c34] rounded-2xl p-3.5 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Alias de Pago (Transferencias)
                </span>
                {!isEditingAlias ? (
                  <button
                    onClick={() => setIsEditingAlias(true)}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    title="Modificar el alias de cobro que envía el chatbot"
                  >
                    <Edit2 className="w-3 h-3" />
                    Cambiar alias
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAliasInput(businessConfig.paymentAlias || 'bruzzone128.mp');
                      setIsEditingAlias(false);
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Cancelar
                  </button>
                )}
              </div>

              {!isEditingAlias ? (
                <div className="flex items-center justify-between bg-[#111b21] px-3 py-2 rounded-xl border border-emerald-500/40">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-mono font-bold text-emerald-300 truncate">
                      {businessConfig.paymentAlias || 'bruzzone128.mp'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(businessConfig.paymentAlias || 'bruzzone128.mp');
                      setCopiedAliasToast(true);
                      setTimeout(() => setCopiedAliasToast(false), 2500);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-700 font-mono font-bold flex items-center gap-1 cursor-pointer transition shrink-0"
                    title="Copiar alias"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    {copiedAliasToast ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    placeholder="Ej: bruzzone128.mp o mi-negocio.uala"
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-[#111b21] border border-emerald-500/60 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveAlias}
                      disabled={isSavingAlias}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isSavingAlias ? 'Guardando...' : 'Guardar alias'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Se actualizará en tiempo real en las respuestas automáticas del bot.
                  </p>
                </div>
              )}
            </div>

            {/* QR box */}
            <div className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-inner">
              <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-1 border border-slate-200 overflow-hidden">
                <img
                  src={qrCodeUrl}
                  alt="QR Code WhatsApp"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[9px] text-slate-700 font-bold uppercase mt-1 tracking-wider">
                Escanear para pedir por WhatsApp
              </span>
            </div>

            {/* Link Copy & Open */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Enlace directo a WhatsApp:</span>
              <div className="flex items-center gap-1.5 bg-[#202c33] p-2 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-300 truncate flex-1 font-mono">
                  wa.me/{cleanPhone || '5491148901280'}
                </span>
                <button
                  onClick={copyBotLink}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition cursor-pointer shrink-0"
                >
                  <Copy className="w-3 h-3" />
                  {copiedLink ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
            Powered by {businessConfig.name || 'Bruzzone 128'} AI Engine · Sincronización en tiempo real
          </div>
        </div>

        {/* Right Side: Interactive WhatsApp Web Simulation */}
        <div className="flex-1 flex flex-col bg-[#0b141a] h-full">
          {/* Top WhatsApp Header */}
          <div className="bg-[#202c33] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold overflow-hidden">
                  {businessConfig.logoUrl ? (
                    <img src={businessConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    '🍕'
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#202c33]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {businessConfig.name || 'Bruzzone 128'} - Bot Oficial
                </h4>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span>en línea</span>
                  <span className="text-slate-400 font-mono">({businessConfig.phone || '+54 9 11 4890-1280'})</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsChatbotModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages area with WhatsApp wallpaper feel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div key={m.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm relative ${
                      isBot ? 'bg-[#202c33] text-slate-100 rounded-tl-xs' : 'bg-[#005c4b] text-white rounded-tr-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                    <span className="text-[9px] text-slate-400 float-right ml-3 mt-1 flex items-center gap-1">
                      {m.timestamp}
                      {!isBot && <CheckCheck className="w-3 h-3 text-sky-400 inline" />}
                    </span>
                  </div>

                  {/* Quick Action Options from bot */}
                  {isBot && m.options && m.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%]">
                      {m.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionClick(opt.action, opt.value)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#2a3942] hover:bg-[#374955] text-emerald-300 border border-emerald-500/30 shadow-xs transition transform active:scale-95 text-left cursor-pointer"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="bg-[#202c33] p-3 flex items-center gap-2 border-t border-slate-800">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                botStep === 'address'
                  ? 'Escribe tu dirección (ej: Santa Fe 1234)...'
                  : botStep === 'transfer_pending'
                  ? 'Escribe "Ya transferí" o envía tu comprobante...'
                  : 'Escribe un mensaje o haz clic en las opciones...'
              }
              className="flex-1 bg-[#2a3942] text-white text-xs px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
