import React, { useRef } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, parseISO, subDays, startOfMonth, startOfYear } from 'date-fns';
import { cn } from '../lib/utils';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}) => {
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const formatDateLabel = (dateStr: string) => {
    try {
      if (!dateStr) return '--/--/--';
      return format(parseISO(dateStr), 'dd/MM/yy');
    } catch (e) {
      return dateStr;
    }
  };

  const handleOpenStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // @ts-ignore
    startRef.current?.showPicker();
  };

  const handleOpenEnd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // @ts-ignore
    endRef.current?.showPicker();
  };

  const setShortcut = (type: 'today' | '7days' | 'month' | 'year' | 'all') => {
    const today = new Date();
    let start = today;
    const end = today;

    switch (type) {
      case 'today':
        start = today;
        break;
      case '7days':
        start = subDays(today, 7);
        break;
      case 'month':
        start = startOfMonth(today);
        break;
      case 'year':
        start = startOfYear(today);
        break;
      case 'all':
        start = new Date('2024-01-01'); // Data base do sistema
        break;
    }

    onStartChange(format(start, 'yyyy-MM-dd'));
    onEndChange(format(end, 'yyyy-MM-dd'));
  };

  const isSelected = (type: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const startMStr = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const start7Str = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    if (type === 'today') return startDate === todayStr && endDate === todayStr;
    if (type === '7days') return startDate === start7Str && endDate === todayStr;
    if (type === 'month') return startDate === startMStr && endDate === todayStr;
    return false;
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      {/* Atalhos Rápidos */}
      <div className="flex bg-slate-900/50 p-1 rounded-xl border border-glassBorder-dark gap-1 overflow-x-auto no-scrollbar shadow-inner">
        {[
          { id: 'today', label: 'Hoje', action: () => setShortcut('today') },
          { id: '7days', label: '7D', action: () => setShortcut('7days') },
          { id: 'month', label: 'Mês', action: () => setShortcut('month') },
          { id: 'all', label: 'Tudo', action: () => setShortcut('all') },
        ].map((s) => (
          <button
            key={s.id}
            onClick={s.action}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              isSelected(s.id) 
                ? "bg-profit text-slate-900 shadow-lg shadow-profit/20" 
                : "text-slate-500 hover:text-white hover:bg-white/5"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Seletor Customizado */}
      <div className="glass-panel p-1 rounded-xl border border-glassBorder-dark w-full sm:w-auto shadow-xl">
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg h-10 px-3 gap-3 hover:border-profit/40 transition-all cursor-pointer shadow-inner group relative">
          
          <div className="relative flex items-center gap-2 flex-1 sm:flex-none" onClick={handleOpenStart}>
            <span className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-profit transition-colors">{formatDateLabel(startDate)}</span>
            <input
              ref={startRef}
              type="date"
              value={startDate}
              onChange={(e) => onStartChange(e.target.value)}
              className="absolute inset-0 opacity-0 pointer-events-none w-full"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div className="w-2 h-[1px] bg-slate-800 shrink-0"></div>

          <div className="relative flex items-center gap-2 flex-1 sm:flex-none" onClick={handleOpenEnd}>
            <span className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-profit transition-colors">{formatDateLabel(endDate)}</span>
            <input
              ref={endRef}
              type="date"
              value={endDate}
              onChange={(e) => onEndChange(e.target.value)}
              className="absolute inset-0 opacity-0 pointer-events-none w-full"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div className="pl-2 border-l border-white/5 flex items-center text-profit">
            <Calendar size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};