# Atualização v3 — ordem certa para publicar

Faça **nesta ordem** (o banco primeiro, depois o código). Assim o site nunca fica fora do ar.

## 1) Supabase (uma vez só, ANTES de publicar)
1. Abra o Supabase → **SQL Editor** → **New query**.
2. Cole todo o conteúdo de `supabase/migracao-v3.sql` e clique em **Run**.
3. No final deve aparecer uma tabela com 3 linhas preenchidas (studio_midia, capa_id, colunas de pixel).
   Se aparecer qualquer mensagem de erro, **pare** e não publique o código ainda.

Ela só **acrescenta** (uma coluna nas categorias, uma tabela do Studio e três colunas de pixel).
Não apaga nem altera nenhum dado existente. A migração v2 já precisa ter sido rodada antes.

## 2) GitHub / Netlify
1. Apague tudo da pasta do projeto, exceto `node_modules`, `.env.local` e a pasta oculta `.git`.
2. Copie para ela o **conteúdo** da pasta `mersao_app-main` deste zip (não a pasta em si).
3. Faça commit e push. O Netlify faz o deploy sozinho.
4. `package.json`, `package-lock.json` e `netlify.toml` não mudaram: **nenhuma dependência nova**.

## 3) O que foi feito
| Pedido | Onde |
|---|---|
| Capa por categoria | Painel > Fotos: botão **Definir como capa da categoria**. Painel > Categorias: miniatura e aviso de capa escolhida/automática. Site > Portfólio: "Todos" mostra só as capas; tocar numa capa abre a galeria da categoria (botão "Todas as categorias" volta). |
| Categoria nova | Aparece sozinha nos seletores. Sem capa escolhida, o site usa a 1ª foto dela. Fotos sem categoria viram o cartão "Outros". |
| Studio | Painel > **Studio**: envio de fotos e vídeos, legenda, ordem e exclusão. Site > aba Studio: galeria automática (vídeos tocam ao passar o mouse; tudo abre ampliado). |
| Pixels | Painel > **Marketing**: IDs da Meta, Google e TikTok. O site carrega os scripts oficiais sozinho. Só IDs com formato válido são aceitos (nunca código colado). Ao enviar um orçamento, o site avisa os pixels (Lead / Contact / generate_lead). O /admin nunca é rastreado. |
| Rodapé | A barra de navegação inferior agora ocupa 100% da largura, fundo bronze escuro, fio dourado no topo, responsiva e com área segura do iPhone. |
| Loading | Abertura com máquina de tatuagem (SVG + CSS, sem biblioteca): agulha vibrando e traço de tinta dourada que serve de barra de progresso. Mantém "Pular" e o respeito a "reduzir movimento". |

## 4) Testes depois de publicar
- Painel > Fotos: escolha a categoria de uma foto e toque em **Definir como capa**. No site, "Todos" deve mostrar a capa e, ao tocar, a galeria.
- Painel > Studio: envie uma foto e um vídeo; confira na aba Studio do site.
- Painel > Marketing: salve um ID. Use a extensão **Meta Pixel Helper** (ou Tag Assistant / TikTok Pixel Helper) no site para ver o pixel disparando.
- Abra o site com `?splash` no final do endereço para rever a nova abertura.

## 5) Selo "Powered by Netlify"
Esse selo **não existe no código do projeto**; ele vem de uma configuração do painel da Netlify,
então nenhuma alteração de código o remove. Procure em **Site configuration > Build & deploy > Post processing**
(Snippet injection) e confira se há algum trecho de código inserido. Se o selo aparecer só quando você está
logado na Netlify, é a barra de visualização de deploy e os visitantes não a veem.
Para eu apontar o lugar exato, envie um print da tela onde ele aparece, com o endereço da página.

## 6) Observações
- Se você publicar o código antes de rodar o SQL, o site continua no ar (as áreas novas ficam vazias) e o painel
  mostra um aviso pedindo para rodar `supabase/migracao-v3.sql`.
- Vídeos do Studio seguem o limite de 50 MB por arquivo, o mesmo dos outros vídeos.
- Como pixels usam cookies, vale avisar os visitantes (LGPD).
