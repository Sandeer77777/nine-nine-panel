-- NUCLEAR FIX: ACESSO TOTAL PARA O DONO
-- Limpar TUDO que existir de travas antes
DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias transações" ON public.transacoes;
DROP POLICY IF EXISTS "transacoes_policy_v2" ON public.transacoes;
DROP POLICY IF EXISTS "privacidade_transacoes" ON public.transacoes;
DROP POLICY IF EXISTS "privacidade_transacoes_v2" ON public.transacoes;

-- Criar UMA ÚNICA política mestre para transações
CREATE POLICY "transacoes_full_access" ON public.transacoes
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Garantir que TUDO pertence a você agora
UPDATE public.transacoes SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d';
UPDATE public.operacoes SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d';
