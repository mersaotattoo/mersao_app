# Atualização v2 — ordem certa para publicar

Faça **nesta ordem** (o banco primeiro, depois o código). Assim o site nunca fica fora do ar.

## 1) Supabase (uma vez só)
1. Abra o Supabase → **SQL Editor** → **New query**.
2. Cole todo o conteúdo de `supabase/migracao-v2.sql` e clique em **Run**.
3. No final deve aparecer uma tabela com 3 linhas preenchidas (categorias, referencias, referencia_urls).
   Se aparecer qualquer mensagem de erro, **pare** e não publique o código ainda.

Ela não apaga nada. Converte o campo antigo "estilo" das suas fotos em categorias, cria o
armazenamento das fotos de referência do orçamento e deixa o Instagram `@mersao.tattoo` e o
WhatsApp `5531991850139` no perfil.

## 2) GitHub
1. Extraia o zip e **substitua** os arquivos do seu repositório pelos novos (mantenha a pasta `.git`).
2. **Apague** do repositório o arquivo `src/lib/supabaseClient.ts` (não é mais usado).
   Se esquecer, nada quebra: ele só fica sem uso.
3. Não há dependência nova: `package.json` e `package-lock.json` não mudaram.
4. Faça commit e push.

## 3) Netlify
Nada novo para configurar. Só confira em **Site configuration → Environment variables**:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `ADMIN_EMAIL`.
O deploy roda sozinho após o push.

## 4) Testes depois de publicar
- Painel → **Categorias**: crie, renomeie, mude a ordem. Em **Fotos**, escolha a categoria de cada foto.
- Painel → **Perfil**: troque foto/vídeo e salve; recarregue o site: deve aparecer na hora.
- Site → **Orçamento**: preencha, marque "Sim" em referência, escolha uma foto e envie.
  O WhatsApp abre com tudo pronto e o link da imagem. O pedido também aparece em **Pedidos** no painel.
- Site → botão **Seguir @mersao.tattoo** no portfólio, no topo e na tela final do orçamento.

## Observações
- O site agora é sempre montado a cada visita (sem cache), então o que você salva no painel aparece direto.
- Fotos de exemplo só aparecem se o Supabase não estiver configurado. Com o banco ligado, o site mostra só o que é seu.
- O WhatsApp não aceita anexar arquivo por link: a foto de referência vai como **link** dentro da mensagem.
- Se o Instagram ficar vazio no painel, o site usa `@mersao.tattoo`.
- `index.html` (na raiz) é o protótipo antigo; não é usado pelo site e pode ficar ou ser apagado.
