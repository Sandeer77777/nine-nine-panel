# 🚀 GUIA DE DEPLOY - NINE NINE 99 (VERSÃO ELITE)
### Orientação para IA de Gerenciamento de VPS / DevOps

Este projeto é uma **Single Page Application (SPA)** construída com **React + Vite**. Ele utiliza **Supabase** como infraestrutura de Backend (Auth/DB) e requer configurações específicas para rodar corretamente em uma VPS Linux (Nginx/Docker/PM2).

---

## 1. 🔑 VARIÁVEIS DE AMBIENTE (CRÍTICO)
As variáveis abaixo **PRECISAM** estar presentes no momento do comando `npm run build`. O Vite injeta essas chaves no código estático durante a compilação.

**Chaves necessárias:**
- `VITE_SUPABASE_URL=https://iximrpkwvmoedtyhrapc.supabase.co`
- `VITE_SUPABASE_ANON_KEY=sb_publishable_A4uP-5fZK5SnOJHdn7YqJA_18AVclOH`

**Instrução para VPS:** 
Se estiver usando terminal puro, exporte as chaves antes de buildar:
```bash
export VITE_SUPABASE_URL=...
export VITE_SUPABASE_ANON_KEY=...
npm run build
```

---

## 2. 🌐 CONFIGURAÇÃO DO SERVIDOR WEB (NGINX)
Como o sistema utiliza o **React Router**, o servidor web precisa redirecionar todas as requisições para o `index.html`, caso contrário, ao dar F5 em páginas como `/operacoes`, o usuário receberá erro 404.

**Configuração recomendada para o bloco `server` do Nginx:**
```nginx
location / {
    root /caminho/da/sua/pasta/dist;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

---

## 3. 🛡️ CONFIGURAÇÃO DO SUPABASE AUTH
Para que o Login e Recuperação de Senha funcionem na VPS, é obrigatório autorizar o novo domínio/IP no painel do Supabase:

1. Acesse: **Authentication -> URL Configuration**.
2. **Site URL:** Altere para o domínio final ou IP da VPS (ex: `http://123.456.78.90`).
3. **Redirect URLs:** Adicione o mesmo endereço.

---

## 4. 🗄️ BANCO DE DADOS (RLS)
O banco de dados já está configurado com **Row Level Security (RLS)**.
- **Dono do Dado:** Cada registro na tabela `operacoes`, `transacoes`, etc., possui uma coluna `user_id`.
- **Privacidade:** O usuário logado só consegue visualizar/deletar o que pertence ao seu ID. 
- **Manutenção:** Caso precise rodar novos comandos SQL, utilize os arquivos na pasta `supabase/migrations`.

---

## 5. 🛠️ COMANDOS DE MANUTENÇÃO RÁPIDA
- **Instalar Dependências:** `npm install`
- **Gerar Build de Produção:** `npm run build`
- **Testar Build Localmente:** `npm run preview`

---

**Nota para a IA da VPS:** O código foi auditado e está limpo de arquivos residuais de desenvolvimento. Priorize performance e segurança nas configurações do Nginx.
