import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Globe, Settings, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TopHeaderWidget: React.FC<{
  extraAction?: React.ReactNode;
}> = ({ extraAction }) => {
  const { businessConfig, setIsChatbotModalOpen, setIsTimeConfigModalOpen } = useApp();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 shrink-0">
      {extraAction && <div>{extraAction}</div>}

      {/* Date & Time Orange Card */}
      <div className="bg-white border border-amber-200/80 rounded-2xl px-4 py-2 shadow-xs flex flex-col justify-center text-xs">
        <div className="flex items-center gap-3 font-semibold text-slate-800">
          <span className="flex items-center gap-1.5 text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-orange-500" />
            {formatDate(currentTime)}
          </span>
          <span className="flex items-center gap-1 text-orange-600 font-bold font-mono">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            {formatTime(currentTime)}
          </span>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between gap-3 mt-1 pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1 text-[10px]">
            <Globe className="w-3 h-3 text-orange-400" />
            Argentina · {businessConfig.timezone}
          </span>
          <button
            onClick={() => setIsTimeConfigModalOpen(true)}
            className="text-orange-500 hover:text-orange-600 font-medium text-[11px] flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Settings className="w-3 h-3" />
            Configura tu horario local
          </button>
        </div>
      </div>

      {/* Orange Chatbot Button */}
      <button
        onClick={() => setIsChatbotModalOpen(true)}
        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/25 flex items-center gap-2 transition active:scale-95 cursor-pointer"
      >
        <MessageCircle className="w-4 h-4 fill-white/20" />
        <span>Ver mi chatbot</span>
      </button>
    </div>
  );
};
