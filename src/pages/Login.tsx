import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { TrendingUp, Lock, Mail, ArrowLeft, UserPlus, LogIn, KeyRound } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'

type AuthMode = 'login' | 'register' | 'forgot-password'

interface AuthForm {
  email: string
  password?: string
  confirmPassword?: string
}

export default function Login() {
  const { login, registerUser, resetPassword } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<AuthForm>()

  const onSubmit = async (data: AuthForm) => {
    setIsLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await login(data.email, data.password!);
        if (error) throw error;
        toast.success('Bem-vindo de volta!');
      } else if (mode === 'register') {
        const { error } = await registerUser(data.email, data.password!);
        if (error) throw error;
        toast.success('Conta criada! Verifique seu e-mail.');
        setMode('login');
      } else if (mode === 'forgot-password') {
        const { error } = await resetPassword(data.email);
        if (error) throw error;
        toast.success('Link de recuperação enviado!');
        setMode('login');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    reset();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black overflow-hidden relative">
      {/* HUD Grid Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Decorative Elite Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-profit/5 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-profit/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md z-10 animate-slideUpFade">
        <div className="tactical-card !p-10 !rounded-[2.5rem] border-white/5 relative overflow-hidden group bg-[#0A0A0C]/80 backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
          
          {/* Back Button for non-login modes */}
          {mode !== 'login' && (
            <button 
              onClick={() => toggleMode('login')}
              className="absolute top-8 left-8 p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-500 hover:text-white transition-all active:scale-90"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {/* Logo e título */}
          <div className="text-center mb-12">
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-profit/20 rounded-[2rem] blur-2xl group-hover:blur-3xl transition-all duration-700 animate-pulse"></div>
              <div className="w-24 h-24 bg-black border-2 border-white/10 rounded-[2.5rem] flex items-center justify-center relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3 shadow-2xl">
                {mode === 'forgot-password' ? <KeyRound className="h-12 w-12 text-profit" /> : <TrendingUp className="h-12 w-12 text-profit" />}
              </div>
            </div>
            
            <div className="mt-8 space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                {mode === 'login' && <>NINE NINE <span className="text-profit">99</span></>}
                {mode === 'register' && <>NOVA <span className="text-profit">CONTA</span></>}
                {mode === 'forgot-password' && <>RESETAR <span className="text-profit">ACESSO</span></>}
              </h1>
              <p className="label-system !text-[9px] !tracking-[0.3em] text-zinc-500">
                {mode === 'login' && "Autenticação Requerida"}
                {mode === 'register' && "Junte-se ao Time Tático"}
                {mode === 'forgot-password' && "Protocolo de Link Seguro"}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="label-system ml-1">ID de Credencial (Email)</label>
              <div className="relative group">
                <input
                  {...register('email', {
                    required: 'E-mail é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "E-mail inválido"
                    }
                  })}
                  type="email"
                  className="w-full h-14 bg-black border border-white/10 rounded-2xl pl-12 pr-4 text-sm text-white outline-none focus:border-profit/50 transition-all placeholder:text-zinc-800 font-bold tracking-tight"
                  placeholder="nome@nine-nine.pro"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-700 group-focus-within:text-profit transition-colors" />
              </div>
              {errors.email && (
                <p className="mt-2 text-[9px] font-black text-red-500 uppercase italic ml-1 tracking-widest">{errors.email.message}</p>
              )}
            </div>

            {mode !== 'forgot-password' && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="label-system">Código de Segurança (Senha)</label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => toggleMode('forgot-password')}
                        className="text-[9px] font-black text-profit uppercase tracking-widest hover:text-white transition-colors"
                      >
                        Recuperar?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <input
                      {...register('password', {
                        required: 'A senha é obrigatória',
                        minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                      })}
                      type="password"
                      className="w-full h-14 bg-black border border-white/10 rounded-2xl pl-12 pr-4 text-sm text-white outline-none focus:border-profit/50 transition-all placeholder:text-zinc-800 font-bold"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-700 group-focus-within:text-profit transition-colors" />
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-[9px] font-black text-red-500 uppercase italic ml-1 tracking-widest">{errors.password.message}</p>
                  )}
                </div>

                {mode === 'register' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="label-system ml-1">Confirmar Código</label>
                    <div className="relative group">
                      <input
                        {...register('confirmPassword', {
                          required: 'Confirmação obrigatória',
                          validate: (val: string | undefined) => {
                            if (watch('password') !== val) {
                              return "Senhas não conferem";
                            }
                          }
                        })}
                        type="password"
                        className="w-full h-14 bg-black border border-white/10 rounded-2xl pl-12 pr-4 text-sm text-white outline-none focus:border-profit/50 transition-all placeholder:text-zinc-800 font-bold"
                        placeholder="••••••••"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-700 group-focus-within:text-profit transition-colors" />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-[9px] font-black text-red-500 uppercase italic ml-1 tracking-widest">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-16 rounded-2xl shadow-2xl active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-4 border-2",
                mode === 'register' ? "bg-sky-500 border-sky-400 text-black" : "btn-insane-green border-profit/30"
              )}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-xs font-black uppercase tracking-[0.3em] ml-2">
                    {mode === 'login' ? 'Executar Sistema' : mode === 'register' ? 'Inicializar Conta' : 'Solicitar Acesso'}
                  </span>
                  {mode === 'login' && <LogIn size={20} strokeWidth={3} />}
                  {mode === 'register' && <UserPlus size={20} strokeWidth={3} />}
                  {mode === 'forgot-password' && <KeyRound size={20} strokeWidth={3} />}
                </>
              )}
            </button>
          </form>

          {/* Social / Switch Mode */}
          <div className="mt-12 text-center space-y-6">
            {mode === 'login' ? (
              <p className="label-system !text-[9px] text-zinc-600 !tracking-widest">
                Acesso Negado?{' '}
                <button 
                  onClick={() => toggleMode('register')}
                  className="text-profit hover:text-white transition-colors"
                >
                  Criar Identidade
                </button>
              </p>
            ) : (
              <button 
                onClick={() => toggleMode('login')}
                className="label-system !text-[9px] text-zinc-600 hover:text-white transition-colors"
              >
                Voltar ao Centro de Comando
              </button>
            )}
            
            <div className="pt-8 border-t border-white/5">
              <p className="label-system !text-[8px] !leading-loose !tracking-[0.4em] text-zinc-700">
                Protocolo Tático Nine Nine 99 <br/> 
                <span className="text-zinc-800 italic">Vincere Scire - Vitória através do Conhecimento</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}