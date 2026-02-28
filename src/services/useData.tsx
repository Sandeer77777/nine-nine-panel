import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// --- MAPPERS ---
const mapOperacao = (op: any) => ({
  ...op,
  id: op.id, 
  data: op.data || op.data_criacao, 
  dataCriacao: op.data_criacao,
  lucro: Number(op.lucro_prejuizo ?? op.lucro ?? 0),
  investido: Number(op.investido || 0), 
  retorno: Number(op.retorno || 0),
  oddMedia: Number(op.odd_media || 0),
  unidade: Number(op.unidade || 1),
  parceiro_ids: op.parceiro_ids || [], 
  fases: op.fases || [],
  isDG: op.is_dg || false,
  lucroDG: Number(op.lucro_dg || 0),
  repassarComissaoDG: op.repassar_comissao_dg ?? true,
  comissaoOperacao: Number(op.comissao_operacao || 0)
});

const toDbOperacao = (op: any) => {
    // Sanitização rigorosa para evitar dados mortos ou corrompidos no Supabase
    const safeValue = (val: any) => {
        if (typeof val === 'number') return isNaN(val) ? 0 : val;
        if (!val) return 0;
        const parsed = parseFloat(String(val).replace(',', '.'));
        return isNaN(parsed) ? 0 : parsed;
    };

    const payload: any = {
        nome: op.nome || 'Operação sem nome',
        data: op.data || new Date().toISOString(),
        status: op.status || 'em_andamento',
        estrategia: op.estrategia || 'Outros',
        stake: safeValue(op.stake),
        investido: safeValue(op.investido),
        retorno: safeValue(op.retorno),
        lucro_prejuizo: safeValue(op.lucro || op.lucroPrejuizo),
        odd_media: safeValue(op.oddMedia || op.odd_media),
        unidade: safeValue(op.unidade || 1),
        parceiro_ids: op.parceiro_ids || [],
        comissao_operacao: safeValue(op.comissaoOperacao || op.comissao_operacao),
        fases: Array.isArray(op.fases) ? op.fases : [],
        is_dg: !!(op.isDG ?? op.is_dg),
        lucro_dg: safeValue(op.lucroDG ?? op.lucro_dg),
        repassar_comissao_dg: op.repassarComissaoDG === undefined ? (op.repassar_comissao_dg ?? true) : op.repassarComissaoDG
    };
    if (op.dataCriacao) payload.data_criacao = op.dataCriacao;
    if (op.dataFinalizacao) payload.data_finalizacao = op.dataFinalizacao;
    return payload;
};

const mapParceria = (p: any) => ({
  ...p, id: p.id, nome: p.nome, dataCadastro: p.created_at
});

const mapCasa = (c: any) => ({ 
  id: c.id, nome: c.nome, status: c.status,
  saldo: Number(c.saldo || 0), saldoBonus: Number(c.saldoBonus || 0)
});

interface DataContextType {
  operacoes: any[]; parcerias: any[]; casasApostas: any[]; transacoes: any[]; bancaInicial: number; loading: boolean;
  contasParceiros: any[]; configuracoes: any[];
  addOperacao: (op: any) => Promise<void>; updateOperacao: (id: number, data: any) => Promise<void>; deleteOperacao: (id: number) => Promise<void>;
  duplicateOperation: (op: any) => Promise<void>;
  addTransacao: (t: any) => Promise<void>; deleteTransacao: (id: number) => Promise<void>;
  addParceiro: (p: any) => Promise<void>; deleteParceiro: (id: number) => Promise<void>;
  addCasaAposta: (c: any) => Promise<void>; deleteCasaAposta: (id: number) => Promise<void>;
  updateCasaAposta: (id: number, data: any) => Promise<void>;
  addContaParceiro: (conta: any) => Promise<void>; updateContaParceiro: (id: number, data: any) => Promise<void>; deleteContaParceiro: (id: number) => Promise<void>;
  updateBanca: (val: number) => Promise<void>; fullReload: () => void;
}
const DataContext = createContext<DataContextType>({} as any);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [operacoes, setOperacoes] = useState<any[]>([]);
  const [parcerias, setParcerias] = useState<any[]>([]);
  const [casasApostas, setCasasApostas] = useState<any[]>([]);
  const [contasParceiros, setContasParceiros] = useState<any[]>([]);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [configuracoes, setConfiguracoes] = useState<any[]>([]);
  const [bancaInicial, setBancaInicial] = useState(0);
  const [loading, setLoading] = useState(true);
  const isFetching = React.useRef(false);
  const hasLoadedOnce = React.useRef(false);

  const fetchData = useCallback(async (isSilent = false) => {
    if (isFetching.current) return;
    
    try {
      isFetching.current = true;
      // Só mostra loading se não for uma atualização silenciosa e for a primeira vez
      if (!isSilent && !hasLoadedOnce.current) setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const [ops, pars, casas, contas, trans, configs] = await Promise.all([
        supabase.from('operacoes').select('*').order('data_criacao', { ascending: false }),
        supabase.from('parcerias').select('*').order('nome'),
        supabase.from('casas_apostas').select('*').order('nome'),
        supabase.from('contas_parceiros').select('*').order('created_at', { ascending: false }),
        supabase.from('transacoes').select('*').order('data', { ascending: false }),
        supabase.from('configuracoes').select('*')
      ]);

      if (ops.data) setOperacoes(ops.data.map(mapOperacao));
      if (pars.data) setParcerias(pars.data.map(mapParceria));
      if (casas.data) setCasasApostas(casas.data.map(mapCasa));
      if (contas.data) setContasParceiros(contas.data);
      if (trans.data) setTransacoes(trans.data);
      if (configs.data) {
        setConfiguracoes(configs.data);
        const banca = configs.data.find(c => c.chave === 'banca_inicial');
        if (banca) setBancaInicial(Number(banca.valor));
      }
      hasLoadedOnce.current = true;
    } catch (error) { 
      console.error("[Data] Sync Error:", error); 
    }
    finally { 
      setLoading(false);
      setTimeout(() => { isFetching.current = false; }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') fetchData();
      if (event === 'SIGNED_OUT') {
        setOperacoes([]); setParcerias([]); setCasasApostas([]); setContasParceiros([]); setTransacoes([]); setConfiguracoes([]);
        hasLoadedOnce.current = false;
      }
    });

    let channel: any = null;
    try {
      // O sync agora é SILENCIOSO - Não ativa o loading global que reseta o app
      channel = supabase.channel('realtime-obediente').on('postgres_changes', { event: '*', schema: 'public' }, () => {
          fetchData(true); 
      }).subscribe();
    } catch (e) {
      console.error("[Data] Realtime Subscription failed:", e);
    }

    return () => { 
      if (channel) supabase.removeChannel(channel);
      authSub.unsubscribe();
    };
  }, [fetchData]);

  const updateOperacao = useCallback(async (id: number, newData: any) => {
    try {
      const payload = toDbOperacao(newData);
      const { error } = await supabase.from('operacoes').update(payload).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  }, [fetchData]);

  const addOperacao = useCallback(async (op: any) => {
    try {
      const payload = toDbOperacao(op);
      const { error } = await supabase.from('operacoes').insert(payload);
      if (error) throw error;
      toast.success("Criado!");
      fetchData();
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  }, [fetchData]);

  const deleteOperacao = useCallback(async (id: number) => { 
    try {
      const { error } = await supabase.from('operacoes').delete().eq('id', id);
      if (error) throw error;
      toast.success("Excluído!");
      fetchData();
    } catch (err: any) { toast.error("Erro ao excluir"); }
  }, [fetchData]);

  const duplicateOperation = useCallback(async (op: any) => {
    try {
        const { id, created_at, ...payload } = op;
        const dbPayload = toDbOperacao(payload);
        dbPayload.nome = `${op.nome} (Cópia)`;
        const { error } = await supabase.from('operacoes').insert(dbPayload);
        if (error) throw error;
        toast.success("Duplicada!");
        fetchData();
    } catch (error: any) { toast.error("Erro ao duplicar"); }
  }, [fetchData]);

  const addCasaAposta = useCallback(async (c: any) => { 
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('casas_apostas').insert({ ...c, user_id: user?.id }); 
    await fetchData(); 
  }, [fetchData]);
  const deleteCasaAposta = useCallback(async (id: number) => { await supabase.from('casas_apostas').delete().eq('id', id); await fetchData(); }, [fetchData]);
  const updateCasaAposta = useCallback(async (id: number, data: any) => { await supabase.from('casas_apostas').update(data).eq('id', id); await fetchData(); }, [fetchData]);
  const addTransacao = useCallback(async (t: any) => { 
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { ...t, user_id: user?.id };
      const { error } = await supabase.from('transacoes').insert(payload);
      if (error) throw error;
      await fetchData(); 
    } catch (err: any) {
      toast.error("Erro ao registrar transação");
    }
  }, [fetchData]);

  const deleteTransacao = useCallback(async (id: number) => { 
    try {
      // 1. Remover localmente primeiro (UI rápida)
      setTransacoes(prev => prev.filter(t => t.id !== id));
      
      // 2. Tentar remover no banco
      const { error } = await supabase.from('transacoes').delete().match({ id });
      
      if (error) {
        // Se der erro no banco, recarrega para voltar o item
        fetchData();
        toast.error(`Erro: ${error.message}`);
        return;
      }

      toast.success("Removido com sucesso!");
    } catch (err: any) {
      fetchData();
      toast.error("Falha na conexão.");
    }
  }, [fetchData]);
  const addParceiro = useCallback(async (p: any) => { 
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('parcerias').insert({ ...p, user_id: user?.id }); 
    await fetchData(); 
  }, [fetchData]);
  const deleteParceiro = useCallback(async (id: number) => { await supabase.from('parcerias').delete().eq('id', id); await fetchData(); }, [fetchData]);
  const addContaParceiro = useCallback(async (conta: any) => { 
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('contas_parceiros').insert({ ...conta, user_id: user?.id }); 
    await fetchData(); 
  }, [fetchData]);
  const updateContaParceiro = useCallback(async (id: number, data: any) => { await supabase.from('contas_parceiros').update(data).eq('id', id); await fetchData(); }, [fetchData]);
  const deleteContaParceiro = useCallback(async (id: number) => { await supabase.from('contas_parceiros').delete().eq('id', id); await fetchData(); }, [fetchData]);
  const updateBanca = useCallback(async (v: number) => { 
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('configuracoes').upsert({ chave: 'banca_inicial', valor: v, user_id: user?.id }); 
    fetchData(); 
  }, [fetchData]);

  const value = useMemo(() => ({
    operacoes, parcerias, casasApostas, contasParceiros, transacoes, bancaInicial, loading, configuracoes,
    addOperacao, updateOperacao, deleteOperacao, duplicateOperation,
    addTransacao, deleteTransacao,
    addParceiro, deleteParceiro,
    addCasaAposta, deleteCasaAposta, updateCasaAposta,
    addContaParceiro, updateContaParceiro, deleteContaParceiro,
    updateBanca, fullReload: fetchData
  }), [operacoes, parcerias, casasApostas, contasParceiros, transacoes, bancaInicial, loading, configuracoes, fetchData]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
