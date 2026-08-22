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
  const { isChatbotModalOpen, setIsChatbotModalOpen, products, addOrder, businessConfig } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [botStep, setBotStep] = useState<
    'menu' | 'pizza_select' | 'drinks_select' | 'address' | 'payment' | 'confirmed'
  >('menu');

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
          text: `¡Hola! 🍕 Bienvenido al WhatsApp Oficial de *${businessConfig.name}*.\n\n¿En qué te podemos ayudar hoy?`,
          timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          options: [
            { label: '🍕 Pedir una Pizza', action: 'START_PIZZA_ORDER' },
            { label: '🥟 Pedir Empanadas', action: 'START_EMPANADAS' },
            { label: '📍 Horarios y Dirección', action: 'SHOW_INFO' },
          ],
        },
      ]);
    }
  }, [isChatbotModalOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        label: '❌ Sin bebida, solo la pizza',
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
    } else if (action === 'CHOOSE_PAYMENT') {
      const paymentType = value;
      const targetPizza = selectedPizza || products[0];
      const targetDrink = selectedDrink;
      const deliveryFee = businessConfig.deliveryFeeDefault;
      const subtotal = targetPizza.price + (targetDrink ? targetDrink.price : 0);
      const total = subtotal + deliveryFee;

      // Create Order in system
      const createdOrder = addOrder({
        customerName: customerName,
        customerPhone: '11-6543-2109',
        customerAddress: customerAddress || 'Av. Corrientes 1450 3° A',
        type: 'delivery',
        status: 'pendiente',
        source: 'chatbot',
        paymentMethod: paymentType,
        isPaid: paymentType === 'mercadopago',
        deliveryFee: deliveryFee,
        discount: 0,
        subtotal: subtotal,
        total: total,
        notes: 'Pedido realizado por WhatsApp Bot 🤖',
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
          text: `Pago con ${paymentType === 'mercadopago' ? 'Mercado Pago QR' : 'Efectivo al repartidor'}`,
          timestamp: time,
        },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: `🎉 *¡PEDIDO CONFIRMADO #${createdOrder.orderNumber}!* 🎉\n\n🍕 *Detalle:* ${targetPizza.name} ${targetDrink ? `+ ${targetDrink.name}` : ''}\n📍 *Entrega:* ${customerAddress || 'Av. Corrientes 1450 3° A'}\n💵 *Total a pagar:* $${total.toLocaleString('es-AR')}\n\n⏱️ *Tiempo estimado:* 30 a 45 minutos.\nEl pedido ya ingresó a la pantalla de cocina (KDS). ¡Gracias por elegir Bruzzone 128! 🍕`,
          timestamp: time,
          isReceipt: true,
          options: [
            { label: '🍕 Hacer otro pedido', action: 'RESET_BOT' },
          ],
        },
      ]);
      setBotStep('confirmed');
    } else if (action === 'SHOW_INFO') {
      setMessages((prev) => [
        ...prev,
        { id: `m-${Date.now()}-u`, sender: 'user', text: '📍 Info y Horarios', timestamp: time },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: `🍕 *Pizzería Bruzzone 128*\n📍 *Dirección:* ${businessConfig.address}\n📞 *Teléfono:* ${businessConfig.phone}\n⏰ *Horario:* ${businessConfig.openTime} a ${businessConfig.closeTime} hs.\n\n🛵 Entregas rápidas con repartidores propios.`,
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
      setMessages((prev) => [
        ...prev,
        { id: `m-${Date.now()}-u`, sender: 'user', text: userText, timestamp: time },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: `Dirección anotada: *${userText}* 🛵.\n¿Cómo prefieres abonar tu pedido?`,
          timestamp: time,
          options: [
            { label: '💳 Mercado Pago QR / Transferencia', action: 'CHOOSE_PAYMENT', value: 'mercadopago' },
            { label: '💵 Efectivo contra entrega', action: 'CHOOSE_PAYMENT', value: 'efectivo' },
          ],
        },
      ]);
      setBotStep('payment');
    } else {
      setMessages((prev) => [
        ...prev,
        { id: `m-${Date.now()}-u`, sender: 'user', text: userText, timestamp: time },
        {
          id: `m-${Date.now()}-b`,
          sender: 'bot',
          text: `Recibido: "${userText}". Puedes usar los botones rápidos para elegir tu pizza favorita:`,
          timestamp: time,
          options: [{ label: '🍕 Pedir Pizza Ahora', action: 'START_PIZZA_ORDER' }],
        },
      ]);
    }
  };

  const copyBotLink = () => {
    navigator.clipboard.writeText(`https://wa.me/5491148901280?text=Hola%20quiero%20hacer%20un%20pedido`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  if (!isChatbotModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 text-white rounded-3xl max-w-4xl w-full h-[90vh] max-h-[720px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95">
        {/* Left Side: Bot Configuration & Link */}
        <div className="md:w-5/12 bg-[#111b21] p-5 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Mi Chatbot WhatsApp</h3>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Activo & Respondiendo
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Tus clientes pueden escanear este QR o hacer clic en el enlace para ordenar pizzas directamente por WhatsApp. Los pedidos ingresan automáticamente a tu Panel de Control, POS y Pantalla de Cocina (KDS).
            </p>

            {/* QR box */}
            <div className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-inner">
              <div className="w-32 h-32 bg-slate-100 rounded-xl flex items-center justify-center p-2 border border-slate-200">
                <QrCode className="w-28 h-28 text-slate-900" />
              </div>
              <span className="text-[10px] text-slate-600 font-bold uppercase mt-2 tracking-wider">
                Escanear para pedir
              </span>
            </div>

            {/* Link Copy */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Enlace directo a WhatsApp:</span>
              <div className="flex items-center gap-1.5 bg-[#202c33] p-2 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-300 truncate flex-1">
                  wa.me/5491148901280?text=Pedido...
                </span>
                <button
                  onClick={copyBotLink}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition"
                >
                  <Copy className="w-3 h-3" />
                  {copiedLink ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
            Powered by Bruzzone 128 AI Engine · Sincronización en tiempo real
          </div>
        </div>

        {/* Right Side: Interactive WhatsApp Web Simulation */}
        <div className="flex-1 flex flex-col bg-[#0b141a] h-full">
          {/* Top WhatsApp Header */}
          <div className="bg-[#202c33] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                  🍕
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#202c33]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Bruzzone 128 - Bot Oficial</h4>
                <p className="text-[11px] text-emerald-400">en línea (simulador interactivo)</p>
              </div>
            </div>

            <button
              onClick={() => setIsChatbotModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition font-bold"
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
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm relative ${
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
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                      {m.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionClick(opt.action, opt.value)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#2a3942] hover:bg-[#374955] text-emerald-300 border border-emerald-500/30 shadow-xs transition transform active:scale-95 text-left"
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
                  : 'Escribe un mensaje o haz clic en los botones...'
              }
              className="flex-1 bg-[#2a3942] text-white text-xs px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
