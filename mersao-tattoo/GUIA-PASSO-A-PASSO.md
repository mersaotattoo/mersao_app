# Mersão Tattoo — Guia passo a passo (do zero ao site no ar)

Tempo estimado: 40 a 60 minutos. Você não precisa saber programar, só seguir na ordem.

---

## PARTE 1 — Preparar o computador

1. Instale o **Node.js versão 20 ou 22** (baixe a versão "LTS" em https://nodejs.org).
2. Instale o **Visual Studio Code** (https://code.visualstudio.com), para abrir e editar os arquivos.
3. Descompacte a pasta `mersao-tattoo` onde quiser (ex.: Documentos).
4. Abra a pasta no VS Code (Arquivo → Abrir Pasta) e abra o terminal (menu Terminal → Novo Terminal).
5. No terminal, digite e aperte Enter:
   ```
   npm install
   ```
   Espere terminar (uns 2 minutos).

> Neste ponto o site já funciona com conteúdo de exemplo: `npm run dev` e abra http://localhost:3000.
> Falta ligar o banco de dados para você editar tudo pelo painel.

---

## PARTE 2 — Criar o banco de dados (Supabase)

1. Entre em https://supabase.com, crie uma conta (pode ser com o Google) e clique em **New project**.
2. Dê o nome `mersao-tattoo`, crie uma **senha do banco** (guarde) e escolha a região **South America (São Paulo)**. Clique em Create e aguarde 1–2 minutos.
3. No menu da esquerda, abra **SQL Editor** → **New query**.
4. Abra o arquivo `supabase/schema.sql`, copie **tudo**, cole no editor e clique em **RUN**.
   Deve aparecer "Success". Isso cria as tabelas, as regras de segurança e o armazenamento de fotos/vídeos.

## PARTE 3 — Criar o seu usuário administrador

1. No Supabase: **Authentication → Users → Add user → Create new user**.
2. Preencha:
   - **E-mail:** `admin@mersaotattoo.com` (não precisa existir de verdade; é só um identificador. Se quiser, use outro e ajuste nos passos abaixo).
   - **Senha:** digite aqui a sua senha. **Use uma senha NOVA e forte**: a que foi escrita no chat deve ser considerada exposta.
   - Marque **Auto Confirm User**.
3. Volte ao **SQL Editor**, abra uma nova query e rode só isto (troque o e-mail se usou outro):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'admin@mersaotattoo.com'
   on conflict do nothing;
   ```
4. Para conferir, rode:
   ```sql
   select a.user_id, u.email from public.admins a join auth.users u on u.id = a.user_id;
   ```
   Deve aparecer 1 linha com o seu e-mail.

---

## PARTE 4 — Ligar o site ao Supabase

1. No Supabase: **Project Settings (engrenagem) → API**. Copie:
   - **Project URL**
   - **anon public key** (a chave `anon`, nunca a `service_role`)
2. Na pasta do projeto, copie o arquivo `.env.example` e renomeie a cópia para **`.env.local`**.
3. Edite o `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...sua-chave...
   ADMIN_EMAIL=admin@mersaotattoo.com
   ```
   (`ADMIN_EMAIL` é o mesmo e-mail do passo 3.)
4. No terminal: `npm run dev` e abra http://localhost:3000.

## PARTE 5 — Usar o painel

1. Acesse http://localhost:3000/login
2. **Usuário:** `admin` — **Senha:** a que você criou no Supabase.
3. No painel:
   - **Perfil:** troque a foto, o vídeo criativo (retrato 9:16), nome, WhatsApp, endereço do mapa, Instagram e apresentação.
   - **Fotos:** adicione várias de uma vez (toque no celular ou arraste no PC), edite título/estilo, reordene com as setas e exclua.
   - **Vídeos:** envie os vídeos "mão na massa". A capa é criada automaticamente.
   - **Promoções:** crie flashes com preço "De/Por" e imagem.
   - **Pedidos:** veja os orçamentos que chegaram pelo formulário e responda direto no WhatsApp.
   - **Seções:** liga/desliga cada aba do site.
4. Para ver a abertura 3D de novo: abra `http://localhost:3000/?splash`.

---

## PARTE 6 — Colocar no ar (Vercel, grátis)

1. Crie uma conta em https://github.com e um repositório **privado** chamado `mersao-tattoo`.
2. Suba o projeto (no terminal, dentro da pasta):
   ```
   git init
   git add .
   git commit -m "site mersao"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/mersao-tattoo.git
   git push -u origin main
   ```
   (o arquivo `.env.local` NÃO sobe, de propósito.)
3. Crie conta em https://vercel.com (entre com o GitHub) → **Add New → Project** → escolha o repositório.
4. Em **Environment Variables**, adicione as 3 variáveis do `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_EMAIL`) e clique em **Deploy**.
5. Em 1–2 minutos o site está no ar num endereço `.vercel.app`.
6. **Domínio próprio:** na Vercel → Settings → Domains, adicione o seu domínio (ex.: `mersaotattoo.com.br`) e siga as instruções de DNS no site onde você comprou o domínio.

---

## Dicas importantes

**Vídeos**
- Limite de **50 MB** por vídeo (plano gratuito do Supabase). Para reduzir: app **HandBrake** (PC) ou **VidCompact / Video Compress** (celular). Vídeo de 15–30 s em 1080p costuma ficar entre 8 e 25 MB.
- **iPhone:** em Ajustes → Câmera → Formatos, escolha **"Mais compatível"**. Assim o vídeo (H.264) toca em qualquer aparelho. Vídeos HEVC podem não abrir no Chrome do computador/Android.
- Prefira vídeos em **retrato (9:16)**.

**Vibração**
- Funciona em **Android (Chrome)**. O **iPhone/Safari não permite** vibração por site: lá a "batida" fica só visual.
- Os navegadores só liberam a vibração depois do primeiro toque do usuário; por isso a abertura vibra se a pessoa já tiver tocado na tela, e os botões vibram sempre.

**Segurança**
- Nunca compartilhe a chave `service_role` do Supabase. O site só usa a `anon`, protegida pelas regras (RLS) do `schema.sql`.
- Troque a senha do admin periodicamente (Supabase → Authentication → Users).

**Problemas comuns**
- *"Usuário ou senha incorretos"*: confira se marcou Auto Confirm, se `ADMIN_EMAIL` é igual ao e-mail do usuário e se rodou o `insert into public.admins`.
- *Upload falha*: confira se o `schema.sql` rodou inteiro (cria o bucket `midia`) e se o arquivo tem menos de 50 MB.
- *Mudei algo no painel e o site não mudou*: aguarde alguns segundos e recarregue; o painel atualiza o site automaticamente.
- *Erro ao rodar `npm run build`*: copie a mensagem e me envie que eu corrijo.
