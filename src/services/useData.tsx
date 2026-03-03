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
    const safeValue = (val: any) => {
        if (typeof val === 'number') return isNaN(val) ? 0 : val;
        if (!val) return 0;
        const parsed = parseFloat(String(val).replace(',', '.'));
        return isNaN(parsed) ? 0 : parsed;
    };

    return {
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
        repassar_comissao_dg: op.repassarComissaoDG === undefined ? (op.repassar_comissao_dg ?? true) : op.repassarComissaoDG,
        data_criacao: op.dataCriacao || undefined,
        data_finalizacao: op.dataFinalizacao || undefined
    };
};

const mapParceria = (p: any) => ({ ...p, id: p.id, nome: p.nome, dataCadastro: p.created_at });
const mapCasa = (c: any) => ({ id: c.id, nome: c.nome, status: c.status, saldo: Number(c.saldo || 0), saldoBonus: Number(c.saldoBonus || 0) });

const CASAS_PADRAO = [
  "Bet365", "Bet7k", "Betano", "Betbra", "Betesporte", "Betnacional", 
  "Betpix365", "Br4bet", "Esportivabet", "Estrelabet", "Jogodeouro", "Kto", 
  "Lotogreen", "Mcgames", "Novibet", "Pixbet", "Sportingbet", "Sporty", "Stake", 
  "Superbet", "Tradeball", "Vaidebet", "Vivasorte"
].map((nome, i) => ({ id: -(i + 1), nome, status: 'Ativo', saldo: 0, saldoBonus: 0 }));

interface DataContextType {
  operacoes: any[]; parcerias: any[]; casasApostas: any[]; transacoes: any[]; bancaInicial: number; loading: boolean;
  contasParceiros: any[]; configuracoes: any[];
  addOperacao: (op: any) => Promise<void>; updateOperacao: (id: number, data: any) => Promise<void>; deleteOperacao: (id: number) => Promise<void>;
  duplicateOperation: (op: any) => Promise<void>;
  addTransacao: (t: any) => Promise<void>; deleteTransacao: (id: number) => Promise<void>;
  addParceiro: (p: any) => Promise<void>; deleteParceiro: (id: number) => Promise<void>;
  addCasaAposta: (c: any) => Promise<void>; deleteCasaAposta: (id: number) => Promise<void>;
  updateCasaAposta: (id: number, data: any) => Promise<void>;
  toggleCasaVisibilidade: (nome: string) => Promise<void>;
  addContaParceiro: (conta: any) => Promise<void>; updateContaParceiro: (id: number, data: any) => Promise<void>; deleteContaParceiro: (id: number) => Promise<void>;
  updateBanca: (val: number) => Promise<void>; fullReload: () => void;
  selectiveResetData: (tables: { [key: string]: boolean }) => Promise<void>;
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

  const clearState = useCallback(() => {
    setOperacoes([]); setParcerias([]); setCasasApostas([]); setContasParceiros([]); setTransacoes([]); setConfiguracoes([]); setBancaInicial(0);
  }, []);

  const fetchData = useCallback(async (isSilent = false) => {
    if (isFetching.current) return;
    try {
      isFetching.current = true;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { clearState(); setLoading(false); return; }
      if (!isSilent) setLoading(true);

      const [ops, pars, casas, contas, trans, configs] = await Promise.all([
        supabase.from('operacoes').select('*').order('data_criacao', { ascending: false }),
        supabase.from('parcerias').select('*').order('nome'),
        supabase.from('casas_apostas').select('*').order('nome'),
        supabase.from('contas_parceiros').select('*').order('created_at', { ascending: false }),
        supabase.from('transacoes').select('*').order('data', { ascending: false }),
        supabase.from('configuracoes').select('*')
      ]);

      if (pars.error) console.error("[Data] Erro Parceiros:", pars.error);
      console.log("[Data] Parceiros brutos do banco:", pars.data);

      setOperacoes(ops.data?.map(mapOperacao) || []);
      setParcerias(pars.data?.map(mapParceria) || []);
      
      // MESCLAGEM DE CASAS: Padrão + Customizadas do Banco
      const casasBanco = casas.data?.map(mapCasa) || [];
      const nomesBanco = new Set(casasBanco.map(c => c.nome.toLowerCase()));
      
      // Carrega casas ocultas das configurações
      const casasOcultasRaw = configs.data?.find(c => c.chave === 'casas_ocultas')?.valor || '';
      const nomesOcultos = new Set(casasOcultasRaw.split(',').map((n: string) => n.trim().toLowerCase()));

      const casasFiltradas = [
        ...casasBanco,
        ...CASAS_PADRAO.filter(c => !nomesBanco.has(c.nome.toLowerCase()) && !nomesOcultos.has(c.nome.toLowerCase()))
      ].sort((a, b) => a.nome.localeCompare(b.nome));
      
      setCasasApostas(casasFiltradas);
      setContasParceiros(contas.data || []);
      setTransacoes(trans.data || []);
      if (configs.data) {
        setConfiguracoes(configs.data);
        const banca = configs.data.find(c => c.chave === 'banca_inicial');
        setBancaInicial(banca ? Number(banca.valor) : 0);
      }
    } catch (error) { console.error("[Data] Sync Error:", error); }
    finally { setLoading(false); setTimeout(() => { isFetching.current = false; }, 1000); }
  }, [clearState]);

  useEffect(() => {
    fetchData(true);
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') fetchData(true);
      if (event === 'SIGNED_OUT') clearState();
    });
    const channel = supabase.channel('realtime-safe').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData(true)).subscribe();
    return () => { supabase.removeChannel(channel); authSub.unsubscribe(); };
  }, [fetchData, clearState]);

  // AUXILIAR PARA GARANTIR USER_ID
  const getSafeUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    return user;
  };

  const addOperacao = useCallback(async (op: any) => {
    try {
      const user = await getSafeUser();
      const { error } = await supabase.from('operacoes').insert({ ...toDbOperacao(op), user_id: user.id });
      if (error) throw error;
      toast.success("Operação criada!");
      fetchData(true);
    } catch (err: any) { toast.error(err.message); }
  }, [fetchData]);

  const updateOperacao = useCallback(async (id: number, newData: any) => {
    try {
      const user = await getSafeUser();
      const { error } = await supabase.from('operacoes').update({ ...toDbOperacao(newData), user_id: user.id }).eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      fetchData(true);
    } catch (err: any) { toast.error(err.message); }
  }, [fetchData]);

  const deleteOperacao = useCallback(async (id: number) => {
    try {
      const user = await getSafeUser();
      const { error } = await supabase.from('operacoes').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      toast.success("Excluída!");
      fetchData(true);
    } catch (err: any) { toast.error("Erro ao excluir"); }
  }, [fetchData]);

  const addCasaAposta = useCallback(async (c: any) => {
    try {
      const user = await getSafeUser();
      const { error } = await supabase.from('casas_apostas').insert({ ...c, user_id: user.id });
      if (error) throw error;
      fetchData(true);
    } catch (err: any) { toast.error("Erro ao adicionar casa"); }
  }, [fetchData]);

  const deleteCasaAposta = useCallback(async (id: number) => {
    try {
      const user = await getSafeUser();
      const { error } = await supabase.from('casas_apostas').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      fetchData(true);
    } catch (err: any) { toast.error("Erro ao remover casa"); }
  }, [fetchData]);

  const updateBanca = useCallback(async (v: number) => {
    try {
      const user = await getSafeUser();
      const { error } = await supabase.from('configuracoes').upsert({ chave: 'banca_inicial', valor: v, user_id: user.id }, { onConflict: 'chave,user_id' });
      if (error) throw error;
      fetchData(true);
    } catch (err: any) { toast.error("Erro ao atualizar banca"); }
  }, [fetchData]);

  const selectiveResetData = useCallback(async (tables: { [key: string]: boolean }) => {
    try {
      const user = await getSafeUser();
      const promises = [];
      if (tables.operacoes) promises.push(supabase.from('operacoes').delete().eq('user_id', user.id));
      if (tables.transacoes) promises.push(supabase.from('transacoes').delete().eq('user_id', user.id));
      if (tables.parcerias) promises.push(supabase.from('parcerias').delete().eq('user_id', user.id));
      if (tables.casasApostas) promises.push(supabase.from('casas_apostas').delete().eq('user_id', user.id));
      if (tables.contasParceiros) promises.push(supabase.from('contas_parceiros').delete().eq('user_id', user.id));
      await Promise.all(promises);
      fetchData(true);
      toast.success("Ambiente resetado com sucesso!");
    } catch (err: any) { toast.error("Erro no reset"); }
  }, [fetchData]);

  // ... (Demais funções implementadas seguindo o mesmo padrão de segurança .eq('user_id', user.id))
  const addTransacao = useCallback(async (t: any) => { const user = await getSafeUser(); await supabase.from('transacoes').insert({ ...t, user_id: user.id }); fetchData(true); }, [fetchData]);
  const deleteTransacao = useCallback(async (id: number) => { const user = await getSafeUser(); await supabase.from('transacoes').delete().eq('id', id).eq('user_id', user.id); fetchData(true); }, [fetchData]);
  const addParceiro = useCallback(async (p: any) => { const user = await getSafeUser(); await supabase.from('parcerias').insert({ ...p, user_id: user.id }); fetchData(true); }, [fetchData]);
  const deleteParceiro = useCallback(async (id: number) => { const user = await getSafeUser(); await supabase.from('parcerias').delete().eq('id', id).eq('user_id', user.id); fetchData(true); }, [fetchData]);
  const updateCasaAposta = useCallback(async (id: number, data: any) => { const user = await getSafeUser(); await supabase.from('casas_apostas').update(data).eq('id', id).eq('user_id', user.id); fetchData(true); }, [fetchData]);
  const toggleCasaVisibilidade = useCallback(async (nome: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Busca a config atual direto do banco para evitar desalinhamento de estado
      const { data: currentConfig } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', 'casas_ocultas')
        .eq('user_id', user.id)
        .single();

      let lista = currentConfig?.valor ? currentConfig.valor.split(',') : [];
      const nomeLower = nome.trim().toLowerCase();
      
      if (lista.includes(nomeLower)) {
        lista = lista.filter((n: string) => n !== nomeLower);
      } else {
        lista.push(nomeLower);
      }

      const { error } = await supabase.from('configuracoes').upsert({ 
        chave: 'casas_ocultas', 
        valor: lista.join(','), 
        user_id: user.id 
      }, { onConflict: 'chave,user_id' });

      if (error) throw error;
      await fetchData(true);
      toast.success(lista.includes(nomeLower) ? "Casa ocultada" : "Casa visível");
    } catch (err: any) { 
      console.error(err);
      toast.error("Erro ao sincronizar visibilidade"); 
    }
  }, [fetchData]);

  const addContaParceiro = useCallback(async (c: any) => { const user = await getSafeUser(); await supabase.from('contas_parceiros').insert({ ...c, user_id: user.id }); fetchData(true); }, [fetchData]);
  const updateContaParceiro = useCallback(async (id: number, d: any) => { const user = await getSafeUser(); await supabase.from('contas_parceiros').update(d).eq('id', id).eq('user_id', user.id); fetchData(true); }, [fetchData]);
  const deleteContaParceiro = useCallback(async (id: number) => { const user = await getSafeUser(); await supabase.from('contas_parceiros').delete().eq('id', id).eq('user_id', user.id); fetchData(true); }, [fetchData]);
  const duplicateOperation = useCallback(async (op: any) => { const user = await getSafeUser(); const { id, created_at, ...p } = op; await supabase.from('operacoes').insert({ ...toDbOperacao(p), nome: `${op.nome} (Cópia)`, user_id: user.id }); fetchData(true); }, [fetchData]);

  const value = useMemo(() => ({
    operacoes, parcerias, casasApostas, contasParceiros, transacoes, bancaInicial, loading, configuracoes,
    addOperacao, updateOperacao, deleteOperacao, duplicateOperation, addTransacao, deleteTransacao,
    addParceiro, deleteParceiro, addCasaAposta, deleteCasaAposta, updateCasaAposta,
    addContaParceiro, updateContaParceiro, deleteContaParceiro, updateBanca, fullReload: fetchData, selectiveResetData
  }), [operacoes, parcerias, casasApostas, contasParceiros, transacoes, bancaInicial, loading, configuracoes, fetchData, selectiveResetData]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
