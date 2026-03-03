-- MIGRATION: ULTIMATE SECURITY CHAIN (BLOQUEIO TOTAL)
-- DATA: 2026-02-24

-- 1. RESET TOTAL DE POLÍTICAS
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 2. ATIVAR RLS EM TODAS AS TABELAS (GARANTIA)
ALTER TABLE public.operacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcerias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casas_apostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_parceiros ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICA DE ISOLAMENTO ABSOLUTO (OWNER ONLY)
-- Esta política garante que o usuário só pode realizar QUALQUER operação se o user_id for o dele.

CREATE POLICY "strict_isolation_operacoes" ON public.operacoes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "strict_isolation_parcerias" ON public.parcerias FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "strict_isolation_casas" ON public.casas_apostas FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "strict_isolation_transacoes" ON public.transacoes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "strict_isolation_configs" ON public.configuracoes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "strict_isolation_contas" ON public.contas_parceiros FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. BLOQUEIO DE ACESSO ANÔNIMO (PARA SEGURANÇA EXTRA)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. VALIDAÇÃO DE SEGURANÇA: NINGUÉM PODE CRIAR REGISTROS SEM USER_ID
ALTER TABLE public.operacoes ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.parcerias ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.casas_apostas ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.transacoes ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.configuracoes ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.contas_parceiros ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.operacoes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.parcerias ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.casas_apostas ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.transacoes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.configuracoes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.contas_parceiros ALTER COLUMN user_id SET NOT NULL;
