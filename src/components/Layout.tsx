import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X, Zap, TrendingUp, BarChart3, Wallet2, Sun, Moon, ChevronLeft, ChevronRight} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

interface LayoutProps {
  children: React.ReactNode
}

export const APP_SLOGANS = [
  "SÓ ENTRA QUEM TEM EDGE 🎯",
  "GESTÃO AFIADA. GREEN INEVITÁVEL ⚡",
  "DISCIPLINA HOJE = BANCA AMANHÃ 📈",
  "AQUI NÃO TEM EMOÇÃO, SÓ EXECUÇÃO 🔥",
  "BANCA PROTEGIDA, FOCO MANTIDO 💰",
  "RESPEITA A GESTÃO. O RESTO É CONSEQUÊNCIA 🚀",
  "ROI DE ELITE ATINGIDO 🤑"
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sloganIndex, setSloganIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % APP_SLOGANS.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Operações', href: '/operacoes', icon: Zap },
    { name: 'Relatórios', href: '/relatorios', icon: FileText },
    { name: 'Financeiro', href: '/financeiro', icon: BarChart3 },
    { name: 'Sócios', href: '/parcerias', icon: Users },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <div className="min-h-screen flex bg-black text-text-dark overflow-hidden font-sans">
      
      {/* SIDEBAR REESTRUTURADA - FLUIDEZ TOTAL */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-[100] bg-[#050505] border-r border-white/[0.03] transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:static lg:inset-0",
          sidebarOpen ? 'w-64' : 'w-20',
          !mobileMenuOpen && 'max-lg:-translate-x-full',
          mobileMenuOpen && 'max-lg:translate-x-0 max-lg:w-64'
        )}
      >
        <div className="flex flex-col h-full relative">
          
          {/* BOTÃO DE CONTROLE (MAGNÉTICO INTEGRADO) */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-black border border-white/10 rounded-full items-center justify-center text-zinc-500 hover:text-profit hover:border-profit/50 transition-all duration-300 z-[110] shadow-2xl group/toggle overflow-hidden"
          >
            <div className="absolute inset-0 bg-profit/5 opacity-0 group-hover/toggle:opacity-100 transition-opacity" />
            {sidebarOpen ? <ChevronLeft size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
          </button>

          {/* LOGO AREA - FIXO PARA EVITAR BUG DE TEXTO LONGO */}
          <div className={cn("flex flex-col justify-center border-b border-white/[0.03] transition-all duration-500 overflow-hidden", sidebarOpen ? "h-28 px-6" : "h-20 px-0 items-center")}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl shrink-0 overflow-hidden border border-profit/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <img src="/logo-99.png" alt="99 Logo" className="w-full h-full object-cover" />
                </div>
                {sidebarOpen && (
                    <div className="min-w-0">
                        <h1 className="text-lg font-black tracking-tighter text-white uppercase italic leading-none">NINE NINE <span className="text-profit">99</span></h1>
                    </div>
                )}
            </div>
            
            {/* SISTEMA DE SLOGAN COM FADE SEGURO */}
            {sidebarOpen && (
                <div className="mt-3 h-8 flex items-center">
                    <AnimatePresence mode="wait">
                        <motion.p 
                            key={sloganIndex}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.5 }}
                            className="text-[7px] text-zinc-500 uppercase font-black tracking-[0.15em] leading-relaxed"
                        >
                            {APP_SLOGANS[sloganIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>
            )}
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 p-3 overflow-y-auto no-scrollbar">
            <ul className="space-y-1.5">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                        active
                          ? "bg-profit text-black shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                          : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200",
                        !sidebarOpen && "px-0 justify-center h-12"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon size={20} strokeWidth={active ? 3 : 2} className="shrink-0" />
                      {sidebarOpen && <span className="text-[10px] font-black uppercase tracking-[0.15em]">{item.name}</span>}
                      {!sidebarOpen && (
                          <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-white text-[9px] font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50 shadow-2xl">
                              {item.name}
                          </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* PERFIL & LOGOUT UNIFICADO */}
          <div className="p-3 border-t border-white/[0.03] bg-black/20">
            <div className={cn(
                "bg-zinc-900/30 border border-white/5 rounded-2xl p-2.5 flex items-center gap-3 transition-all relative group/profile",
                !sidebarOpen && "p-1.5 justify-center"
            )}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center text-xs font-black text-white shrink-0 uppercase shadow-inner relative z-10">
                {user?.email?.charAt(0) || 'U'}
              </div>
              {(sidebarOpen || mobileMenuOpen) && (
                <div className="flex-1 min-w-0 relative z-10">
                    <p className="text-[10px] font-bold text-zinc-300 truncate leading-none mb-1">{user?.email}</p>
                    <p className="text-[8px] text-profit uppercase font-black tracking-widest">MESTRE DO GREEN</p>
                </div>
              )}
              {(sidebarOpen || mobileMenuOpen) && (
                <button onClick={logout} className="p-2 text-zinc-600 hover:text-red-500 transition-all rounded-xl hover:bg-red-500/10 active:scale-90 relative z-10" title="Sair">
                    <LogOut size={16} strokeWidth={3}/>
                </button>
              )}
            </div>
            {!sidebarOpen && (
                <button onClick={logout} className="w-full mt-2 p-3 flex justify-center text-zinc-600 hover:text-red-500 transition-all rounded-xl hover:bg-red-500/5 active:scale-90" title="Sair">
                    <LogOut size={18} strokeWidth={3}/>
                </button>
            )}
          </div>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-black relative">
        <header className="lg:hidden h-14 bg-[#050505] border-b border-white/[0.03] flex items-center justify-between px-4 sticky top-0 z-50">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-zinc-500 active:scale-90 transition-all"><Menu size={22} /></button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-profit/30 shadow-lg"><img src="/logo-99.png" alt="99 Logo" className="w-full h-full object-cover" /></div>
            <h1 className="text-base font-black tracking-tighter text-white uppercase italic leading-none">NINE NINE <span className="text-profit">99</span></h1>
          </div>
          <div className="w-10"></div>
        </header>

        <main className="flex-1 overflow-auto no-scrollbar p-4 lg:p-10 pb-24 lg:pb-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#050505]/98 backdrop-blur-2xl border-t border-white/[0.03] px-2 z-50 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {navigation.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.name} to={item.href} className={cn("flex flex-col items-center justify-center gap-1 transition-all duration-300", active ? "text-profit scale-110" : "text-zinc-600")}>
                <div className={cn("p-2 rounded-2xl transition-all", active ? "bg-profit/10" : "")}><item.icon size={18} strokeWidth={active ? 3 : 2} /></div>
                <span className="text-[7px] font-black uppercase tracking-tighter">{item.name.substring(0, 4)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {mobileMenuOpen && ( <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300" onClick={() => setMobileMenuOpen(false)} /> )}
    </div>
  )
}
