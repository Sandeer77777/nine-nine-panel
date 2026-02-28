import React, { useState, useEffect, useRef } from 'react';
import { useData, supabase } from '../services/useData';
import { toast } from 'react-hot-toast';
import { Database, Download, ShieldAlert, Upload, RefreshCw, Sun, Moon, Target, Wallet, Settings2 } from 'lucide-react';
import { cn } from '../lib/utils';

const Configuracoes: React.FC = () => {
  const { bancaInicial, configuracoes, updateBanca, fullReload } = useData();
  const [restoring, setRestoring] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [metaInput, setMetaInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    const metaAtual = configuracoes?.find(c => c.chave === 'meta_lucro')?.valor || '0';
    setMetaInput(metaAtual);
  }, [configuracoes]);

  const handleSaveMeta = async () => {
    try {
      await supabase.from('configuracoes').upsert({ chave: 'meta_lucro', valor: metaInput, user_id: (await supabase.auth.getUser()).data.user?.id });
      toast.success('Meta atualizada!');
      fullReload();
    } catch (error) { toast.error('Erro ao salvar meta'); }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleExportData = async () => {
    const { data: operacoes } = await supabase.from('operacoes').select('*');
    const { data: parcerias } = await supabase.from('parcerias').select('*');
    const { data: transacoes } = await supabase.from('transacoes').select('*');
    const { data: procedimentos } = await supabase.from('procedimentos').select('*');
    const { data: casas } = await supabase.from('casas_apostas').select('*');
    const backup = { version: '5.0-cloud', timestamp: new Date().toISOString(), operacoes, parcerias, transacoes, procedimentos, casasApostas: casas };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !confirm('Deseja restaurar este backup?')) return;
    setRestoring(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        if (backup.operacoes) await supabase.from('operacoes').upsert(backup.operacoes);
        if (backup.parcerias) await supabase.from('parcerias').upsert(backup.parcerias);
        if (backup.casasApostas) await supabase.from('casas_apostas').upsert(backup.casasApostas);
        if (backup.transacoes) await supabase.from('transacoes').upsert(backup.transacoes);
        alert('Backup restaurado!'); fullReload();
      } catch (err) { alert('Erro ao restaurar backup.'); }
      finally { setRestoring(false); }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = async () => {
    if (!confirm('🚨 PERIGO: Apagar TODOS os dados?')) return;
    await supabase.from('transacoes').delete().neq('id', 0);
    await supabase.from('operacoes').delete().neq('id', 0);
    await supabase.from('parcerias').delete().neq('id', 0);
    await supabase.from('casas_apostas').delete().neq('id', 0);
    fullReload(); alert('Sistema resetado.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER COMPACTO */}
      <div className="text-center lg:text-left mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Ajustes do <span className="text-profit">Sistema</span></h1>
          <p className="text-slate-500 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] mt-0.5">Gestão de Dados e Ambiente Operacional</p>
      </div>

      {/* SEÇÃO FINANCEIRA SLIM */}
      <section className="glass-panel p-4 rounded-xl border border-white/5 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="p-2 bg-profit/10 rounded-lg text-profit"><Settings2 size={16} /></div>
          <div>
            <h2 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Parâmetros Financeiros</h2>
            <p className="text-[7px] text-zinc-600 font-black uppercase mt-1">Configuração de Alvos e Liquidez</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Meta de Lucro Mensal</label>
            <div className="flex gap-2 h-10">
              <div className="relative flex-1">
                <input type="number" value={metaInput} onChange={e => setMetaInput(e.target.value)} className="w-full h-full bg-black border border-white/5 rounded-lg px-4 text-sm text-white outline-none focus:border-profit/50 font-black font-mono" placeholder="0.00" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-zinc-700 uppercase">BRL</span>
              </div>
              <button onClick={handleSaveMeta} className="h-full px-6 btn-insane-green rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">Definir</button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Banca Operacional (Inicial)</label>
            <div className="flex gap-2 h-10">
              <div className="relative flex-1">
                <input type="number" defaultValue={bancaInicial} onBlur={e => updateBanca(Number(e.target.value))} className="w-full h-full bg-black border border-white/5 rounded-lg px-4 text-sm text-white outline-none focus:border-profit/50 font-black font-mono" placeholder="0.00" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-zinc-700 uppercase">BRL</span>
              </div>
              <div className="h-full flex items-center justify-center px-4 bg-white/5 text-zinc-600 rounded-lg text-[8px] font-black uppercase border border-white/5">Auto-Sync</div>
            </div>
          </div>
        </div>
      </section>

      {/* APARÊNCIA SLIM */}
      <section className="glass-panel p-4 rounded-xl border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">{theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}</div>
                <div>
                    <h2 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Engine Visual</h2>
                    <p className="text-[7px] text-zinc-600 font-black uppercase mt-1">Ambiente: {theme === 'dark' ? 'Stealth Black' : 'Pure Light'}</p>
                </div>
            </div>
            <button onClick={toggleTheme} className="h-9 px-6 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all text-[9px] font-black uppercase tracking-widest">Trocar Tema</button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
           {/* BACKUP SLIM */}
           <section className="glass-panel p-4 rounded-xl border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Database size={16}/></div>
                 <h2 className="text-[10px] font-black text-white uppercase tracking-widest">Backup & Segurança</h2>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button onClick={handleExportData} className="flex items-center justify-between w-full px-4 h-10 bg-black/40 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all group">
                    <span>Exportar Dados</span> <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
                <button onClick={() => fileInputRef.current?.click()} disabled={restoring} className="flex items-center justify-between w-full px-4 h-10 bg-black/40 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all group disabled:opacity-50">
                    <span>{restoring ? 'Encriptando...' : 'Restaurar Backup'}</span> 
                    {restoring ? <RefreshCw className="animate-spin" size={14}/> : <Upload size={14} className="group-hover:-translate-y-0.5 transition-transform" />}
                </button>
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleRestoreBackup} className="hidden" />
              </div>
           </section>

           {/* RESET SLIM */}
           <section className="glass-panel p-4 rounded-xl border border-red-500/10 space-y-4 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20"><ShieldAlert size={16}/></div>
                 <h2 className="text-[10px] font-black text-white uppercase tracking-widest">Terminal Mestre</h2>
              </div>
              <p className="text-[7px] text-zinc-600 font-black uppercase tracking-[0.15em] leading-relaxed">Ações irreversíveis de nível administrativo.</p>
              <button onClick={handleFactoryReset} className="w-full h-10 text-[8px] font-black uppercase tracking-widest text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/10 hover:border-red-500/50 transition-all active:scale-95">Reset Total do Sistema</button>
           </section>
      </div>
    </div>
  );
};

export default Configuracoes;
