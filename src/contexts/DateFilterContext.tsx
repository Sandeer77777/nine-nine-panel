import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { startOfMonth, format } from 'date-fns';

interface DateFilterContextType {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export const DateFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicializa lendo do LocalStorage ou usa padrão (Inicio do Mês -> Hoje)
  const [startDate, setStartDate] = useState(() => {
    return localStorage.getItem('globalStartDate') || format(startOfMonth(new Date()), 'yyyy-MM-dd');
  });
  const [endDate, setEndDate] = useState(() => {
    return localStorage.getItem('globalEndDate') || format(new Date(), 'yyyy-MM-dd');
  });

  // Salva no LocalStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('globalStartDate', startDate);
  }, [startDate]);

  useEffect(() => {
    localStorage.setItem('globalEndDate', endDate);
  }, [endDate]);

  return (
    <DateFilterContext.Provider value={{ startDate, endDate, setStartDate, setEndDate }}>
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter deve ser usado dentro de um DateFilterProvider');
  }
  return context;
};