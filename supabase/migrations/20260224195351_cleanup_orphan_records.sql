-- CLEANUP: VINCULAR REGISTROS ÓRFÃOS AO USUÁRIO PRINCIPAL
-- Isso resolve o problema de não conseguir deletar registros que foram criados sem user_id.

UPDATE public.operacoes SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;
UPDATE public.parcerias SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;
UPDATE public.casas_apostas SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;
UPDATE public.transacoes SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;
UPDATE public.configuracoes SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;
UPDATE public.contas_parceiros SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;
