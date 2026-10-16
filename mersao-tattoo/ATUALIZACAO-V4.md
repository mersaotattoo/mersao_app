# Atualização v4 — contador de visitas, promoções ampliáveis e site mais rápido

Faça **nesta ordem** (o banco primeiro, depois o código). Assim o site nunca fica fora do ar.

## 1) Supabase (uma vez só, ANTES de publicar)
1. Abra o Supabase → **SQL Editor** → **New query**.
2. Cole todo o conteúdo de `supabase/migracao-v4.sql` e clique em **Run**.
3. No final deve aparecer uma tabela com 4 linhas preenchidas (tabela visitas, função registrar_visita, função metricas_visitas, trigger anti-spam).
   Se aparecer qualquer mensagem de erro, **pare** e não publique o código ainda.

Ela só **acrescenta** (uma tabela, duas funções e uma regra anti-spam). Não apaga nem altera nenhum dado existente.
As migrações v2 e v3 já precisam ter sido rodadas.

## 2) VS Code → GitHub → Netlify
1. Copie para a pasta do projeto o **conteúdo** da pasta `mersao_app-main` deste zip (não a pasta em si), substituindo os arquivos.
   Não mexa em `node_modules`, `.env.local` nem na pasta oculta `.git`.
2. No terminal do VS Code: `npm install` e depois `npm run build` (deve terminar sem erro).
3. `git add .` → `git commit -m "v4: metricas de visitas"` → `git push`. A Netlify publica sozinha.
4. `package.json`, `package-lock.json` e `netlify.toml` não mudaram: **nenhuma dependência nova**.

## 3) O que foi feito
| Pedido | Onde |
|---|---|
| Contador de visitas | `src/components/VisitTracker.tsx` (site) + tabela `visitas` e funções no `migracao-v4.sql`. Conta pessoas diferentes por dia (código aleatório no navegador, sem dados pessoais). O administrador logado não é contado. |
| Filtro de métricas | Painel > **Métricas** (primeira aba): Hoje, Ontem, Últimos 3, 7, 15, 30, 60 e 90 dias. Mostra pessoas, aberturas do site, média por dia, gráfico por dia, origem (Instagram, WhatsApp, Google…) e aparelho, com comparação ao período anterior. |
| Promoções cortadas | Site > Promoções: a arte aparece inteira no cartão e, ao tocar, abre ampliada (setas e deslizar para ver as outras). |
| Velocidade | A página `/` agora fica em cache e se refaz quando você salva algo no painel (e sozinha a cada 60 s). Antes consultava o banco 6 vezes a cada visita. |
| Anti-spam | Orçamento: máximo de 3 pedidos por hora com o mesmo telefone e 30 a cada 10 minutos no site todo (o cliente continua indo ao WhatsApp normalmente). |

## 4) Testes depois de publicar
- Abra o site numa **janela anônima** (ou no celular, sem estar logado no painel), espere 3 segundos.
- Painel > Métricas > **Hoje** > **Atualizar**: deve aparecer 1 pessoa.
- Feche e abra de novo na mesma janela: continua 1 pessoa (cada pessoa conta uma vez por dia).
- Site > aba Promoções: toque numa arte e confira que ela abre inteira.
- Painel > Promoções: troque o nome de uma promoção, salve e recarregue o site: a mudança deve aparecer.

## 5) Observações
- A contagem começa quando a v4 é publicada; visitas anteriores não existem para recuperar.
- Se publicar o código antes do SQL, o site continua normal; a aba Métricas mostra um aviso pedindo para rodar `supabase/migracao-v4.sql`.
- "Hoje" e "Ontem" usam o dia de Brasília. "Últimos N dias" inclui hoje.
- Quem acessa por celular e por computador conta como duas pessoas (não há login do visitante para saber que é a mesma).
- Não foi adicionado CSP (cabeçalho de segurança de conteúdo): ele pode bloquear os pixels e deixar o site quebrado se não for testado no ar.
