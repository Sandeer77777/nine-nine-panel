-- MIGRATION: SEGURANÇA E RECUPERAÇÃO DE DADOS
-- DATA: 2026-02-24

-- 1. CRIAR COLUNA user_id (SE NÃO EXISTIR)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'operacoes' AND COLUMN_NAME = 'user_id') THEN
        ALTER TABLE public.operacoes ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'parcerias' AND COLUMN_NAME = 'user_id') THEN
        ALTER TABLE public.parcerias ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'casas_apostas' AND COLUMN_NAME = 'user_id') THEN
        ALTER TABLE public.casas_apostas ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transacoes' AND COLUMN_NAME = 'user_id') THEN
        ALTER TABLE public.transacoes ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'configuracoes' AND COLUMN_NAME = 'user_id') THEN
        ALTER TABLE public.configuracoes ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'contas_parceiros' AND COLUMN_NAME = 'user_id') THEN
        ALTER TABLE public.contas_parceiros ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
END $$;

-- 2. ATIVAR SEGURANÇA (RLS)
ALTER TABLE public.operacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcerias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casas_apostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_parceiros ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLÍTICAS (PRIVACIDADE TOTAL)
DROP POLICY IF EXISTS "privacidade_operacoes" ON public.operacoes;
CREATE POLICY "privacidade_operacoes" ON public.operacoes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "privacidade_parcerias" ON public.parcerias;
CREATE POLICY "privacidade_parcerias" ON public.parcerias FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "privacidade_casas" ON public.casas_apostas;
CREATE POLICY "privacidade_casas" ON public.casas_apostas FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "privacidade_transacoes" ON public.transacoes;
CREATE POLICY "privacidade_transacoes" ON public.transacoes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "privacidade_config" ON public.configuracoes;
CREATE POLICY "privacidade_config" ON public.configuracoes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "privacidade_contas_parceiros" ON public.contas_parceiros;
CREATE POLICY "privacidade_contas_parceiros" ON public.contas_parceiros FOR ALL USING (auth.uid() = user_id);

-- 4. VINCULAR SEUS DADOS AO SEU NOVO ID
-- O ID usado abaixo é o seu ID do Gmail: f7151827-a41b-41c0-831a-4e23626bf22d
UPDATE public.operacoes SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;
UPDATE public.parcerias SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;
UPDATE public.casas_apostas SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;
UPDATE public.transacoes SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;
UPDATE public.configuracoes SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;
UPDATE public.contas_parceiros SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;
