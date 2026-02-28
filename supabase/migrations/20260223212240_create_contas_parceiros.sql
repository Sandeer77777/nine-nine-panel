-- Criar a tabela para a sua Super Planilha de Rollover
CREATE TABLE IF NOT EXISTS public.contas_parceiros (
    id bigint primary key generated always as identity,
    parceiro_id bigint references public.parcerias(id) on delete cascade,
    casa_id bigint references public.casas_apostas(id) on delete cascade,
    valor_inicial numeric default 0,
    saldo_real numeric default 0,
    rollover_alvo numeric default 0,
    jogo_atual text default '',
    historico_apostas jsonb default '[]'::jsonb,
    status text default 'ativar',
    created_at timestamp with time zone default now()
);

-- Habilitar o tempo real (Realtime)
-- Nota: A publicação 'supabase_realtime' deve existir. Se não existir, ignore o erro ou crie-a.
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contas_parceiros;
  END IF;
END $$;

-- Garantir que as tabelas tenham Realtime habilitado individualmente
ALTER TABLE public.parcerias REPLICA IDENTITY FULL;
ALTER TABLE public.operacoes REPLICA IDENTITY FULL;
ALTER TABLE public.transacoes REPLICA IDENTITY FULL;
ALTER TABLE public.casas_apostas REPLICA IDENTITY FULL;
ALTER TABLE public.contas_parceiros REPLICA IDENTITY FULL;
