-- FIX: PERMITIR EXCLUSÃO DE REGISTROS ANTIGOS (SEM DONO)
-- Além de permitir ver/editar os seus, agora você pode apagar o que estiver 'órfão'.

DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias transações" ON public.transacoes;
CREATE POLICY "transacoes_policy_v2" ON public.transacoes
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "privacidade_transacoes" ON public.transacoes;
CREATE POLICY "privacidade_transacoes_v2" ON public.transacoes
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Aplicar o mesmo para as outras tabelas para garantir que você tenha controle total agora
ALTER TABLE public.operacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "privacidade_operacoes" ON public.operacoes;
CREATE POLICY "privacidade_operacoes_v2" ON public.operacoes FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "privacidade_parcerias" ON public.parcerias;
CREATE POLICY "privacidade_parcerias_v2" ON public.parcerias FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
