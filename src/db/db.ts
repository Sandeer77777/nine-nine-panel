// Tipos do Supabase - Mantendo a consistência com o novo schema.sql fornecido pelo usuário

export interface Operacao {
  id?: number;
  nome: string | null;
  data: string;
  dataCriacao: string;
  dataFinalizacao?: string | null;
  status: 'em_andamento' | 'concluido' | 'pendente' | 'aguardando_freebet' | 'finalizada';
  estrategia: string;
  stake: number;
  investido: number;
  retorno: number;
  lucro: number;
  lucroPrejuizo?: number;
  oddMedia?: number;
  unidade?: number;
  parceiro_ids?: number[];
  comissaoOperacao?: number;
  isDG?: boolean;
  lucroDG?: number;
  repassarComissaoDG?: boolean;
  fases?: any[];
  created_at?: string;
}

export interface Procedimento {
  id?: number;
  operacaoId: number;
  nome: string;
  data: string;
  tipo: 'Qualificação' | 'Extração' | 'Aposta Normal';
  casa: string;
  stake: number;
  odd: number;
  retorno: number;
  lucro: number;
  status: 'Ganhou' | 'Perdeu' | 'Reembolso' | 'Pendente';
  comprovante?: string;
  detalhes?: any; 
  created_at?: string;
}

export interface Transacao {
  id?: number;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'deposito' | 'saque' | 'ajuste' | 'receita' | 'despesa' | 'pagamento';
  categoria?: string;
  origem_operacao_id?: number;
  status: 'pendente' | 'consolidado';
  responsavel?: string;
  metodo?: string; 
  created_at?: string;
}

export interface Parceiro {
  id?: number;
  nome: string;
  porcentagem: number;
  ativo: boolean;
  pix?: string;
  contato?: string;
  telefone?: string;
  cpf?: string;
  chavePix?: string;
  dataCadastro: string;
  created_at?: string;
}

export interface Configuracao {
  chave: string;
  valor: any;
  created_at?: string;
}

export interface CasaAposta {
  id?: number;
  nome: string;
  site?: string;
  status?: string;
  saldo?: number;
}
