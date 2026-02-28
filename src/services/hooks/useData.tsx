import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- VERSÃO 4.0 - SEM CACHE ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper de mapeamento
const mapOperacao = (op: any) => ({
  ...op,
  id: op.id,
  data: op.data || op.data_criacao, 
  dataCriacao: op.data_criacao, // O segredo está aqui
  dataFinalizacao: op.data_finalizacao,
  lucroPrejuizo: Number(op.lucro_prejuizo || 0),
  comissaoOperacao: Number(op.comissao_operacao || 0),
  comissaoOperadorPercentual: Number(op.comissao_operador_percentual || 0),
  splitFactor: Number(op.split_factor || 0),
  parceiroIds: op.parceiro_ids || [],
  responsaveis: op.parceiro_ids || [] 
});

const mapParceria = (p: any) => ({ ...p, dataCadastro: p.created_at || p.data_cadastro });
const mapTransacao = (t: any) => ({ ...t, origem_operacao_id: t.origem_operacao_id });
const mapProcedimento = (p: any) => ({ ...p, operacaoId: p.operacao_id });

interface DataContextType {
  operacoes: any[];
  parcerias: any[];
  transacoes: any[];
  procedimentos: any[];
  bancaInicial: number;
  loading: boolean;
  addOperacao: (op: any) => Promise<void>;
  updateOperacao: (id: number, data: any) => Promise<void>;
  deleteOperacao: (id: number) => Promise<void>;
  addTransacao: (t: any) => Promise<void>;
  deleteTransacao: (id: number) => Promise<void>;
  addParceiro: (p: any) => Promise<void>;
  deleteParceiro: (id: number) => Promise<void>;
  updateBanca: (val: number) => Promise<void>;
  fullReload: () => void;
}

const DataContext = createContext<DataContextType>({} as any);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [operacoes, setOperacoes] = useState<any[]>([]);
  const [parcerias, setParcerias] = useState<any[]>([]);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [procedimentos, setProcedimentos] = useState<any[]>([]);
  const [bancaInicial, setBancaInicial] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    console.log("🔥 VERSÃO 4.0 - Carregando dados CORRETOS...");

    try {
      // 1. Operações (Ordenação CORRETA: data_criacao)
      const { data: opsRaw, error: opsError } = await supabase
        .from('operacoes')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (opsError) {
        console.error("❌ Erro Supabase:", opsError);
      } else {
        console.log(`✅ ${opsRaw?.length} Operações carregadas.`);
        setOperacoes((opsRaw || []).map(mapOperacao));
      }

      // 2. Outros (Sem casas_apostas)
      const { data: pars } = await supabase.from('parcerias').select('*').order('nome');
      if (pars) setParcerias(pars.map(mapParceria));

      const { data: trans } = await supabase.from('transacoes').select('*').order('data', { ascending: false });
      if (trans) setTransacoes(trans.map(mapTransacao));

      const { data: procs } = await supabase.from('procedimentos').select('*');
      if (procs) setProcedimentos(procs.map(mapProcedimento));

      const { data: conf } = await supabase.from('configuracoes').select('*').eq('chave', 'banca_inicial').single();
      if (conf) setBancaInicial(Number(conf.valor));

    } catch (error) {
      console.error("Erro Fatal:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('realtime-v4').on('postgres_changes', { event: '*', schema: 'public' }, fetchData).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // CRUD (Conversão Snake Case)
  const toSnake = (d: any) => {
    const n: any = { ...d };
    if(d.dataCriacao) { n.data_criacao = d.dataCriacao; delete n.dataCriacao; }
    if(d.dataFinalizacao) { n.data_finalizacao = d.dataFinalizacao; delete n.dataFinalizacao; }
    if(d.lucroPrejuizo) { n.lucro_prejuizo = d.lucroPrejuizo; delete n.lucroPrejuizo; }
    if(d.comissaoOperacao) { n.comissao_operacao = d.comissaoOperacao; delete n.comissaoOperacao; }
    if(d.comissaoOperadorPercentual) { n.comissao_operador_percentual = d.comissaoOperadorPercentual; delete n.comissaoOperadorPercentual; }
    if(d.splitFactor) { n.split_factor = d.splitFactor; delete n.splitFactor; }
    if(d.parceiroIds) { n.parceiro_ids = d.parceiroIds; delete n.parceiroIds; }
    return n;
  };

  return (
    <DataContext.Provider value={{
      operacoes, parcerias, transacoes, procedimentos, bancaInicial, loading,
      addOperacao: async (op) => { await supabase.from('operacoes').insert(toSnake(op)); },
      updateOperacao: async (id, op) => { await supabase.from('operacoes').update(toSnake(op)).eq('id', id); },
      deleteOperacao: async (id) => { await supabase.from('operacoes').delete().eq('id', id); },
      addTransacao: async (t) => { await supabase.from('transacoes').insert(t); },
      deleteTransacao: async (id) => { await supabase.from('transacoes').delete().eq('id', id); },
      addParceiro: async (p) => { await supabase.from('parcerias').insert(p); },
      deleteParceiro: async (id) => { await supabase.from('parcerias').delete().eq('id', id); },
      updateBanca: async (v) => { await supabase.from('configuracoes').upsert({ chave: 'banca_inicial', valor: v }); setBancaInicial(v); },
      fullReload: fetchData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
