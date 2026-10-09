"use client";

import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    // Lógica JavaScript convertida para correr após a renderização do componente
    const $ = (s: string) => document.querySelector(s) as HTMLElement;     const $$ = (s: string) => [...document.querySelectorAll(s)] as HTMLElement[];
    const vib = (p: number | number[]) => { try { navigator.vibrate && navigator.vibrate(p) } catch (e) { } };
    const HB = [16, 70, 26];

    function gp(n: number, ro: number, rr: number) {
      const s = 2 * Math.PI / n;
      const p = [];
      const f = (r: number, a: number) => (r * Math.cos(a)).toFixed(1) + ',' + (r * Math.sin(a)).toFixed(1);
      for (let i = 0; i < n; i++) {
        const a = i * s;
        p.push(f(rr, a), f(ro, a + s * .14), f(ro, a + s * .38), f(rr, a + s * .52));
      }
      return 'M' + p.join('L') + 'Z';
    }

    function holes(n: number, r: number, h: number, u: string) {
      let o = '';
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 6.2832;
        o += `<circle cx="${(r * Math.cos(a)).toFixed(1)}" cy="${(r * Math.sin(a)).toFixed(1)}" r="${h}" fill="#0A0A0B" stroke="url(#g${u})" stroke-opacity=".55" stroke-width="1.4"/>`;
      }
      return o;
    }

    const O = gp(44, 492, 452), I = gp(26, 292, 262);
<<<<<<< HEAD
    function gear(u: string) {
      return `<svg viewBox="-500 -500 1000 1000"><defs><linearGradient id="g${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3E7C6"/><stop offset=".5" stop-color="#B8975A"/><stop offset="1" stop-color="#6B5530"/></linearGradient></defs><circle r="402" fill="none" stroke="#D6BC8A" stroke-opacity=".38" stroke-width="20" stroke-dasharray="1.6 11.3"/></svg>
<svg class="o" viewBox="-500 -500 1000 1000"><path d="${O}" fill="#111113" stroke="url(#g${u})" stroke-width="2.4"/><circle r="372" fill="none" stroke="url(#g${u})" stroke-opacity=".5"/>${holes(8, 316, 38, u)}</svg>
<svg class="i" viewBox="-500 -500 1000 1000"><path d="${I}" fill="#111113" stroke="url(#g${u})" stroke-width="2.2"/><circle r="212" fill="none" stroke="url(#g${u})" stroke-opacity=".5"/>${holes(6, 150, 24, u)}</svg>`;
    }

    const gl = $('#gl');
    const gr = $('#gr');
    if (gl) gl.innerHTML = gear('L');
    if (gr) gr.innerHTML = gear('R');

    /* abertura */
    let T: NodeJS.Timeout[] = [];
    const sp = $('#sp');
    const main = $('#main');

    function playSplash() {
      T.forEach(clearTimeout);
      T = [];
      sp?.remove();
      const n = sp?.cloneNode(true) as HTMLElement;
      if (n) {
        document.body.prepend(n);
        run(n);
      }
    }

    function run(el: HTMLElement) {
      if (!el) return;
      document.body.style.overflow = 'hidden';
      main?.classList.remove('on');
      [450, 1150, 1750, 2250, 2600].forEach(t => T.push(setTimeout(() => vib(HB), t)));
      const open = (done: number) => {
        if (el.classList.contains('open')) return;
        el.classList.add('open');
        main?.classList.add('on');
        vib([8, 24, 8, 24, 8, 24, 8]);
        T.push(setTimeout(() => { el.remove(); document.body.style.overflow = '' }, done));
      };
      T.push(setTimeout(() => open(1900), 3150));
      const skipBtn = el.querySelector('#skip') as HTMLElement;
      if (skipBtn) {
        skipBtn.onclick = () => { T.forEach(clearTimeout); open(1100) };
      }
    }

    if (sp) run(sp);

    const replayBtn = $('#replay');
    if (replayBtn) {
=======

    function gear(u: string) {
      return `<svg viewBox="-500 -500 1000 1000"><defs><linearGradient id="g${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3E7C6"/><stop offset=".5" stop-color="#B8975A"/><stop offset="1" stop-color="#6B5530"/></linearGradient></defs><circle r="402" fill="none" stroke="#D6BC8A" stroke-opacity=".38" stroke-width="20" stroke-dasharray="1.6 11.3"/></svg>
<svg class="o" viewBox="-500 -500 1000 1000"><path d="${O}" fill="#111113" stroke="url(#g${u})" stroke-width="2.4"/><circle r="372" fill="none" stroke="url(#g${u})" stroke-opacity=".5"/>${holes(8, 316, 38, u)}</svg>
<svg class="i" viewBox="-500 -500 1000 1000"><path d="${I}" fill="#111113" stroke="url(#g${u})" stroke-width="2.2"/><circle r="212" fill="none" stroke="url(#g${u})" stroke-opacity=".5"/>${holes(6, 150, 24, u)}</svg>`;
    }

    const gl = $('#gl');
    const gr = $('#gr');
    if (gl) gl.innerHTML = gear('L');
    if (gr) gr.innerHTML = gear('R');

    /* abertura */
    let T: NodeJS.Timeout[] = [];
    const sp = $('#sp');
    const main = $('#main');

    function playSplash() {
      T.forEach(clearTimeout);
      T = [];
      sp?.remove();
      const n = sp?.cloneNode(true) as HTMLElement;
      if(n) {
        document.body.prepend(n);
        run(n);
      }
    }

    function run(el: HTMLElement) {
      if(!el) return;
      document.body.style.overflow = 'hidden';
      main?.classList.remove('on');
      [450, 1150, 1750, 2250, 2600].forEach(t => T.push(setTimeout(() => vib(HB), t)));
      const open = (done: number) => {
        if (el.classList.contains('open')) return;
        el.classList.add('open');
        main?.classList.add('on');
        vib([8, 24, 8, 24, 8, 24, 8]);
        T.push(setTimeout(() => { el.remove(); document.body.style.overflow = '' }, done));
      };
      T.push(setTimeout(() => open(1900), 3150));
      const skipBtn = el.querySelector('#skip') as HTMLElement;
      if(skipBtn) {
        skipBtn.onclick = () => { T.forEach(clearTimeout); open(1100) };
      }
    }

    if(sp) run(sp);

    const replayBtn = $('#replay');
    if(replayBtn) {
>>>>>>> 56fb02fe9ad17bc3bb271767f2a201fda33f66a5
      replayBtn.onclick = () => {
        vib(HB);
        window.scrollTo(0, 0);
        playSplashFresh();
      };
    }

    function playSplashFresh() {
      const d = document.createElement('div');
      d.id = 'sp';
<<<<<<< HEAD
      const nomeAtual = $('#perfil-nome')?.textContent || 'MERSÃO TATTOO';
      d.innerHTML = `<div class="dr dl"><div class="gw">${gear('L')}</div></div><div class="dr dR"><div class="gw">${gear('R')}</div></div><div class="seam"></div><div class="em"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="none" stroke="#D6BC8A" stroke-width="1.2" stroke-linecap="round"/></svg><span class="gt">M</span></div><div class="sg2"><b>${nomeAtual.toUpperCase()}</b><p>Arte exclusiva na pele</p></div><button id="skip">PULAR</button>`;
=======
      d.innerHTML = `<div class="dr dl"><div class="gw">${gear('L')}</div></div><div class="dr dR"><div class="gw">${gear('R')}</div></div><div class="seam"></div><div class="em"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="none" stroke="#D6BC8A" stroke-width="1.2" stroke-linecap="round"/></svg><span class="gt">M</span></div><div class="sg2"><b>MERSÃO TATTOO</b><p>Arte exclusiva na pele</p></div><button id="skip">PULAR</button>`;
>>>>>>> 56fb02fe9ad17bc3bb271767f2a201fda33f66a5
      document.body.prepend(d);
      run(d);
    }

<<<<<<< HEAD
    /* perfil dinâmico via Supabase */
    async function carregarPerfil() {
      try {
        const { data, error } = await supabase
          .from('configuracoes_perfil')
          .select('*')
          .limit(1)
          .single();

        if (data && !error) {
          const nomeEl = $('#perfil-nome');
          const cidadeEl = $('#perfil-cidade');
          const splashNomeEl = document.querySelector('.sg2 b');
          const waBtn = $('#wa-btn');

          if (nomeEl && data.nome) nomeEl.textContent = data.nome;
          if (cidadeEl && data.cidade) cidadeEl.textContent = data.cidade;
          if (splashNomeEl && data.nome) splashNomeEl.textContent = data.nome.toUpperCase();

          if (waBtn && (data.whatsapp || data.telefone)) {
            const num = (data.whatsapp || data.telefone).replace(/\D/g, '');
            waBtn.onclick = () => window.open(`https://wa.me/${num}`, '_blank');
          }
        }
      } catch (err) {
        console.error('Erro ao carregar configurações do perfil:', err);
      }
    }

    carregarPerfil();

    /* galeria e vídeos */
    const G_PADRAO = [
      ['Realismo em preto e cinza', 'Realismo', 30],
      ['Fine line botânico', 'Fine line', 150],
      ['Blackwork geométrico', 'Blackwork', 260],
      ['Traço delicado', 'Fine line', 320],
      ['Fechamento de braço', 'Blackwork', 200],
      ['Retrato realista', 'Realismo', 20]
    ];

    async function carregarGaleria() {
      const gal = $('#gal');
      if (!gal) return;

      try {
        const { data, error } = await supabase
          .from('portfolio')
          .select('*');

        if (data && data.length > 0 && !error) {
          gal.innerHTML = data.map((item: any) => {
            const estilo = item.estilo || item.categoria || 'Geral';
            const titulo = item.titulo || item.nome || '';
            const foto = item.imagem_url || item.foto_url || item.url || '';
            const bg = foto ? `background: url('${foto}') center/cover no-repeat;` : '';
            return `<div class="tile" style="--h:${item.h || 30}; ${bg}" data-s="${estilo}"><span>${titulo}</span></div>`;
          }).join('');
        } else {
          gal.innerHTML = G_PADRAO.map(g => `<div class="tile" style="--h:${g[2]}" data-s="${g[1]}"><span>${g[0]}</span></div>`).join('');
        }
      } catch (err) {
        gal.innerHTML = G_PADRAO.map(g => `<div class="tile" style="--h:${g[2]}" data-s="${g[1]}"><span>${g[0]}</span></div>`).join('');
      }

      $$('#gal .tile').forEach(t => t.onclick = () => {
        vib(12);
        toast('No site real, a foto abre ampliada com swipe.');
      });
    }

    carregarGaleria();

    const vid = $('#vid');
    if (vid) {
      vid.innerHTML = ['Linha fina, passo a passo', 'Sombreamento em realismo', 'Lettering ao vivo', 'Fechamento de braço'].map((t, i) => `<div class="tile v" style="--h:${[30, 200, 320, 150][i]}"><i></i><span>${t}</span></div>`).join('');
      $$('#vid .tile').forEach(t => t.onclick = () => {         vib(12);         toast('No site real, o vídeo abre em tela cheia.');       });     }      $$
=======
    /* galeria + vídeos */
    const G = [['Realismo em preto e cinza', 'Realismo', 30], ['Fine line botânico', 'Fine line', 150], ['Blackwork geométrico', 'Blackwork', 260], ['Traço delicado', 'Fine line', 320], ['Fechamento de braço', 'Blackwork', 200], ['Retrato realista', 'Realismo', 20]];
    const gal = $('#gal');
    if(gal) {
        gal.innerHTML = G.map(g => `<div class="tile" style="--h:${g[2]}" data-s="${g[1]}"><span>${g[0]}</span></div>`).join('');
    }
    const vid = $('#vid');
    if(vid) {
        vid.innerHTML = ['Linha fina, passo a passo', 'Sombreamento em realismo', 'Lettering ao vivo', 'Fechamento de braço'].map((t, i) => `<div class="tile v" style="--h:${[30, 200, 320, 150][i]}"><i></i><span>${t}</span></div>`).join('');
    }

    $$('.tile').forEach(t => t.onclick = () => {       vib(12);       toast(t.classList.contains('v') ? 'No site real, o vídeo abre em tela cheia.' : 'No site real, a foto abre ampliada com swipe.');     });      $$
>>>>>>> 56fb02fe9ad17bc3bb271767f2a201fda33f66a5
('#chips .chip').forEach(c => c.onclick = () => {
      vib(12);
      $$('#chips .chip').forEach(x => x.classList.toggle('on', x === c));       $$
('#gal .tile').forEach(t => t.style.display = !c.dataset.s || t.dataset.s === c.dataset.s ? '' : 'none');
    });

    /* dock + abas */
<<<<<<< HEAD
    const IC: Record<string, string> = {
      portfolio: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
      videos: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
      studio: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/>',
      promos: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
      orcamento: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>'
    };
    const L: Record<string, string> = { portfolio: 'Portfólio', videos: 'Vídeos', studio: 'Studio', promos: 'Promos', orcamento: 'Orçamento' };
    const dock = $('#dock');
    if (dock) {
      dock.innerHTML = Object.keys(L).map(k => `<button data-k="${k}"><svg viewBox="0 0 24 24">${IC[k]}</svg><span>${L[k]}</span></button>`).join('');
    }

    function go(k: string | undefined) {
      if (!k) return;
=======
    const IC: Record<string, string> = { portfolio: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', videos: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>', studio: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/>', promos: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>', orcamento: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>' };
    const L: Record<string, string> = { portfolio: 'Portfólio', videos: 'Vídeos', studio: 'Studio', promos: 'Promos', orcamento: 'Orçamento' };
    const dock = $('#dock');
    if(dock) {
        dock.innerHTML = Object.keys(L).map(k => `<button data-k="${k}"><svg viewBox="0 0 24 24">${IC[k]}</svg><span>${L[k]}</span></button>`).join('');
    }

    function go(k: string | undefined) {
      if(!k) return;
>>>>>>> 56fb02fe9ad17bc3bb271767f2a201fda33f66a5
      vib(HB);
      $$('.tab').forEach(t => t.classList.toggle('on', t.id === k));$$
('#dock button').forEach(b => b.classList.toggle('on', b.dataset.k === k));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    $$('#dock button').forEach(b => b.onclick = () => go(b.dataset.k));     $$
('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
    go('portfolio');

    $$('.hb').forEach(b => b.addEventListener('click', () => {       vib(HB);       b.classList.add('beat');       setTimeout(() => b.classList.remove('beat'), 140);     }));      $$
('[data-flash]').forEach(b => b.addEventListener('click', () => {
      const ide = $('#ide') as HTMLInputElement;
<<<<<<< HEAD
      if (ide) ide.value = 'Quero reservar o flash: ' + b.dataset.flash + '.';
=======
      if(ide) ide.value = 'Quero reservar o flash: ' + b.dataset.flash + '.';
>>>>>>> 56fb02fe9ad17bc3bb271767f2a201fda33f66a5
      go('orcamento');
    }));

    const sndBtn = $('#snd');
<<<<<<< HEAD
    if (sndBtn) {
      sndBtn.onclick = e => {
        const target = e.currentTarget as HTMLElement;
        target.textContent = target.textContent === 'SOM' ? 'MUDO' : 'SOM';
      };
=======
    if(sndBtn) {
        sndBtn.onclick = e => {
          const target = e.currentTarget as HTMLElement;
          target.textContent = target.textContent === 'SOM' ? 'MUDO' : 'SOM';
        };
>>>>>>> 56fb02fe9ad17bc3bb271767f2a201fda33f66a5
    }

    /* formulário */
    $$('#sgm button').forEach(b => b.onclick = () => {       vib(12);       $$
('#sgm button').forEach(x => x.classList.toggle('on', x === b));
    });

    const sendBtn = $('#send');
<<<<<<< HEAD
    if (sendBtn) {
      sendBtn.onclick = async () => {
        const nm = $('#nm') as HTMLInputElement;
        const ide = $('#ide') as HTMLInputElement;
        const mj = $('#mj') as HTMLInputElement;
        if (!nm?.value.trim() || !ide?.value.trim()) {
          vib([8, 24, 8, 24, 8]);
          return toast('Preencha o nome e a ideia.');
        }
        if (!mj?.checked) {
          vib([8, 24, 8, 24, 8]);
          return toast('Confirme que tem 18 anos ou mais.');
        }

        try {
          await supabase.from('orcamentos').insert([{ nome: nm.value, ideia: ide.value }]);
        } catch (_) {}

        vib([20, 60, 20, 60, 44]);
        const ff = $('#ff');
        const okb = $('#okb');
        if (ff) ff.hidden = true;
        if (okb) okb.hidden = false;
      };
=======
    if(sendBtn) {
        sendBtn.onclick = () => {
          const nm = $('#nm') as HTMLInputElement;
          const ide = $('#ide') as HTMLInputElement;
          const mj = $('#mj') as HTMLInputElement;
          
          if (!nm?.value.trim() || !ide?.value.trim()) {
            vib([8, 24, 8, 24, 8]);
            return toast('Preencha o nome e a ideia.');
          }
          if (!mj?.checked) {
            vib([8, 24, 8, 24, 8]);
            return toast('Confirme que tem 18 anos ou mais.');
          }
          vib([20, 60, 20, 60, 44]);
          const ff = $('#ff');
          const okb = $('#okb');
          if(ff) ff.hidden = true;
          if(okb) okb.hidden = false;
        };
>>>>>>> 56fb02fe9ad17bc3bb271767f2a201fda33f66a5
    }

    let tt: NodeJS.Timeout;
    function toast(m: string) {
      const t = $('#toast');
<<<<<<< HEAD
      if (!t) return;
=======
      if(!t) return;
>>>>>>> 56fb02fe9ad17bc3bb271767f2a201fda33f66a5
      t.textContent = m;
      t.classList.add('on');
      clearTimeout(tt);
      tt = setTimeout(() => t.classList.remove('on'), 2800);
    }
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        :root{--ob:#0A0A0B;--co:#141416;--g:#D6BC8A;--gl:#EBDCB6;--gd:#A8884F;--b:#EDE7DA;--m:#8D8981;--ln:rgba(255,255,255,.08);box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
        html{scroll-padding-top:env(safe-area-inset-top,0px);height:100%}
        *{box-sizing:border-box;margin:0;-webkit-tap-highlight-color:transparent}
        body{background:#0A0A0B;color:var(--b);font:400 15px/1.6 Inter,system-ui,sans-serif;overflow-x:hidden;min-height:100%}
        h1,h2,h3,.pf{font-family:'Playfair Display',Georgia,serif;font-weight:400}
        button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
        .glass{background:rgba(255,255,255,.035);border:1px solid var(--ln);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 24px 60px -30px #000}
        .gt{background:linear-gradient(135deg,#F3E7C6,#D6BC8A 45%,#A8884F);-webkit-background-clip:text;background-clip:text;color:transparent}
        .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 28px;border-radius:99px;font-weight:500;letter-spacing:.02em;font-size:14px;transition:transform .15s cubic-bezier(.3,1.6,.5,1)}
        .btn:active,.beat{transform:scale(.94)}
        .gold{background:linear-gradient(#EBDCB6,#D6BC8A 55%,#A8884F);color:#0A0A0B;box-shadow:0 12px 36px -14px rgba(214,188,138,.5)}
        .ghost{border:1px solid rgba(214,188,138,.35);color:var(--gl)}
        .hd{position:fixed;top:0;left:0;right:0;z-index:40;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 12px) max(16px,env(safe-area-inset-right)) 0 max(16px,env(safe-area-inset-left));display:flex;justify-content:space-between;max-width:1200px;margin:auto}
        .who{min-width:0;display:flex;align-items:center;gap:12px;padding:6px 20px 6px 6px;border-radius:99px}
        .av{width:44px;height:44px;border-radius:50%;border:1px solid rgba(214,188,138,.4);background:var(--co);display:grid;place-items:center;font:22px 'Playfair Display'}
        .who b{display:block;font:400 17px 'Playfair Display';line-height:1.2}.who small{color:var(--m);font-size:11.5px}
        .wa{height:44px;padding:0 18px;border-radius:99px;font-size:13.5px;display:flex;align-items:center;gap:8px}
        main{max-width:1200px;margin:auto;padding:116px max(20px,env(safe-area-inset-right)) 150px max(20px,env(safe-area-inset-left));opacity:0;transform:scale(.95);transition:1.4s cubic-bezier(.22,1,.36,1)}
        main.on{opacity:1;transform:none}
        .tab{display:none}.tab.on{display:block;animation:in .45s cubic-bezier(.22,1,.36,1)}
        @keyframes in{from{opacity:0;transform:translateY(18px)}}
        .hero{display:grid;gap:40px;align-items:center}
        .hero h1{font-size:clamp(34px,10.5vw,68px);line-height:1.05}
        .hero em{display:block;margin-top:12px;font:italic 22px 'Playfair Display';color:var(--g)}
        .hero p{color:rgba(237,231,218,.7);max-width:430px;margin:22px 0 32px}
        .reel{margin:auto;width:min(74vw,330px);aspect-ratio:9/16;border-radius:32px;padding:1px;background:linear-gradient(#D6BC8A73,#ffffff1a,#D6BC8A33);box-shadow:0 30px 80px -30px #000}
        .rv{position:relative;height:100%;border-radius:31px;overflow:hidden;background:radial-gradient(90% 60% at 50% 30%,#2a2420,#0f0f11);display:grid;place-items:center;text-align:center}
        .rv::before{content:"";position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent,rgba(214,188,138,.16),transparent 30%);animation:rot 9s linear infinite}
        @keyframes rot{to{transform:rotate(360deg)}}
        .rv div{position:relative;padding:0 24px}.rv i{display:block;font:48px 'Playfair Display';font-style:normal}.rv small{display:block;margin-top:10px;color:var(--m);font-size:12px;line-height:1.5}
        .snd{position:absolute;right:12px;top:12px;width:40px;height:40px;border-radius:50%;font-size:11px;z-index:2}
        h2.t{font-size:clamp(30px,6vw,46px);line-height:1.1}.hl{height:1px;width:96px;margin:18px 0 18px;background:linear-gradient(90deg,rgba(214,188,138,.5),transparent)}
        .sub{color:var(--m);max-width:520px;margin-bottom:32px}
        .chips{display:flex;gap:8px;flex-wrap:wrap;margin:26px 0 20px}.chip{padding:6px 16px;border-radius:99px;border:1px solid var(--ln);color:var(--m);font-size:13px}.chip.on{border-color:rgba(214,188,138,.5);background:rgba(214,188,138,.1);color:var(--gl)}
        .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
        .tile{position:relative;aspect-ratio:3/4;border-radius:24px;overflow:hidden;border:1px solid var(--ln);background:radial-gradient(120% 80% at 30% 15%,hsl(var(--h) 22% 28%),#0f0f11 72%);transition:transform .15s}
        .tile:active{transform:scale(.97)}
        .tile::before{content:"";position:absolute;inset:18%;border-radius:50%;border:1px solid rgba(214,188,138,.22);box-shadow:0 0 0 14px rgba(214,188,138,.05)}
        .tile span{position:absolute;left:14px;right:14px;bottom:14px;font:italic 15px 'Playfair Display'}
<<<<<<< HEAD
        .tile.v{aspect-ratio:9/16}.tile.v::after{content:"";position:absolute;left:50%;top:50%;margin:-26px;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.08);backdrop-filter:blur(10px);clip-path:none}
=======
        .tile.v{aspect-ratio:9/16}.tile.v::after{content:"";position:absolute;left:50%;top:50%;margin:-26px;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.08) ;backdrop-filter:blur(10px);clip-path:none}
>>>>>>> 56fb02fe9ad17bc3bb271767f2a201fda33f66a5
        .tile.v i{position:absolute;left:50%;top:50%;margin:-8px -5px;border:8px solid transparent;border-left:13px solid var(--gl);border-right:0;z-index:2}
        .rev{display:grid;gap:16px;margin-top:20px}.rev figure{padding:26px;border-radius:24px}.rev q{font:italic 17px/1.6 'Playfair Display';color:rgba(237,231,218,.85)}.rev figcaption{margin-top:14px;color:var(--m);font-size:13px}.st{color:var(--g);letter-spacing:3px;font-size:12px;margin-bottom:12px}
        .cols{display:grid;gap:20px}.map{position:relative;min-height:300px;border-radius:24px;overflow:hidden;background:linear-gradient(#ffffff0a 1px,transparent 1px) 0 0/44px 44px,linear-gradient(90deg,#ffffff0a 1px,transparent 1px) 0 0/44px 44px,radial-gradient(70% 70% at 50% 50%,#1b1b1e,#0c0c0e)}
        .map::before{content:"";position:absolute;left:50%;top:48%;width:16px;height:16px;margin:-8px;border-radius:50%;background:var(--g);box-shadow:0 0 0 10px rgba(214,188,138,.18),0 0 0 28px rgba(214,188,138,.07)}
        .map .btn{position:absolute;left:16px;bottom:16px;padding:10px 20px}
        .dif{display:flex;gap:18px;padding:22px;border-radius:24px;margin-bottom:14px}.dif u{width:46px;height:46px;flex:none;border-radius:50%;border:1px solid rgba(214,188,138,.3);display:grid;place-items:center;color:var(--g);text-decoration:none;font-size:18px}
        .dif h3{font-size:20px}.dif p{color:var(--m);font-size:14px;margin-top:4px}
        details{border-bottom:1px solid var(--ln)}summary{list-style:none;cursor:pointer;padding:20px 0;font:400 18px 'Playfair Display';display:flex;justify-content:space-between;gap:16px}summary::after{content:"⌄";color:var(--g)}details[open] summary{color:var(--gl)}details p{color:var(--m);padding:0 30px 20px 0}
        .pr{border-radius:24px;overflow:hidden}.pr .im{aspect-ratio:4/3;background:radial-gradient(100% 90% at 30% 20%,hsl(var(--h) 22% 30%),#0f0f11);position:relative}
        .pr .im b{position:absolute;left:14px;top:14px;padding:3px 12px;border-radius:99px;background:#0a0a0bcc;color:var(--gl);font-size:12px;font-weight:400}
        .pr .bd{padding:22px}.pr h3{font-size:22px}.pr s{color:var(--m);margin-right:10px;font-size:14px}.pr .p{font:30px 'Playfair Display';margin:6px 0 20px}
        .f{padding:26px;border-radius:32px}.f label{display:block;margin:0 0 8px;font:600 11px Cinzel,serif;letter-spacing:.2em;color:var(--g)}
        .f input[type=text],.f textarea{width:100%;padding:14px 16px;border-radius:16px;border:1px solid var(--ln);background:rgba(255,255,255,.03);color:var(--b);font:inherit;outline:0;margin-bottom:20px;resize:none}
        .f input:focus,.f textarea:focus{border-color:rgba(214,188,138,.5)}
        .sg{display:grid;grid-template-columns:1fr 1fr;padding:4px;border:1px solid var(--ln);border-radius:99px;margin-bottom:20px}.sg button{padding:10px;border-radius:99px;color:var(--m);font-size:14px}.sg .on{background:rgba(214,188,138,.12);color:var(--gl);box-shadow:inset 0 0 0 1px rgba(214,188,138,.25)}
        .ck{display:flex;gap:12px;color:rgba(237,231,218,.7);font-size:13.5px;margin-bottom:22px}.ck input{accent-color:#D6BC8A;margin-top:4px}
        .ok{text-align:center;padding:40px 10px}.ok u{display:grid;place-items:center;width:64px;height:64px;margin:0 auto 20px;border-radius:50%;border:1px solid rgba(214,188,138,.5);color:var(--g);font-size:26px;text-decoration:none}
        .note{margin-top:60px;text-align:center;color:var(--m);font-size:12px}
        .dk{position:fixed;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);z-index:50;display:flex;justify-content:center;pointer-events:none}
        .dk nav{max-width:calc(100vw - 16px);pointer-events:auto;display:flex;gap:2px;padding:6px;border-radius:99px;animation:up 1s .2s cubic-bezier(.22,1,.36,1) both}
        @keyframes up{from{transform:translateY(90px);opacity:0}}
        .dk button{position:relative;display:flex;flex:1 1 auto;flex-direction:column;align-items:center;gap:4px;min-width:0;padding:9px 8px;white-space:nowrap;border-radius:99px;color:var(--m);font-size:10px;letter-spacing:.02em;transition:color .2s,transform .15s}
        .dk button svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
        .dk button.on{color:var(--gl);background:rgba(214,188,138,.11);box-shadow:inset 0 0 0 1px rgba(214,188,138,.25)}
        .dk button.on svg{animation:pu .5s}.dk button:active{transform:scale(.9)}
        @keyframes pu{40%{transform:scale(1.3)}65%{transform:scale(.92)}85%{transform:scale(1.1)}}
        .toast{position:fixed;left:16px;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 96px);max-width:380px;margin:auto;padding:14px 20px;border-radius:18px;text-align:center;font-size:13.5px;z-index:60;opacity:0;transform:translateY(14px);transition:.35s;pointer-events:none}.toast.on{opacity:1;transform:none}
        #sp{position:fixed;inset:0;z-index:99;perspective:1800px}
        .dr{position:absolute;top:0;bottom:0;width:50.3%;overflow:hidden;background:linear-gradient(#0c0c0e,#131316 50%,#0a0a0b);transition:transform 1.7s cubic-bezier(.77,0,.18,1),filter 1.7s}
        .dl{left:0;transform-origin:left center}.dR{right:0;transform-origin:right center}
        #sp.open .dl{transform:rotateY(100deg);filter:brightness(.3)}#sp.open .dR{transform:rotateY(-100deg);filter:brightness(.3)}
        .gw{position:absolute;top:50%;width:min(96vw,90vh,920px);width:min(96vw,90dvh,920px);aspect-ratio:1}.dl .gw{right:0;transform:translate(50%,-50%)}.dR .gw{left:0;transform:translate(-50%,-50%)}
        .gw svg{position:absolute;inset:0;width:100%;height:100%}
        .o{animation:so 3.3s cubic-bezier(.5,0,.2,1) forwards}.i{animation:si 3.3s cubic-bezier(.5,0,.2,1) forwards}
        @keyframes so{to{transform:rotate(150deg)}}@keyframes si{to{transform:rotate(-255deg)}}
        .dl::after,.dR::after{content:"";position:absolute;top:0;bottom:0;width:90px}.dl::after{right:0;background:linear-gradient(270deg,rgba(214,188,138,.08),transparent)}.dR::after{left:0;background:linear-gradient(90deg,rgba(214,188,138,.08),transparent)}
        .seam{position:absolute;top:0;bottom:0;left:50%;width:1px;background:linear-gradient(transparent,#D6BC8A,transparent);animation:sm 1.4s both;transition:opacity .5s}#sp.open .seam{opacity:0}
        @keyframes sm{from{transform:scaleY(0);opacity:0}}
        .em{position:absolute;left:50%;top:50%;width:clamp(96px,22vmin,168px);aspect-ratio:1;margin:calc(clamp(96px,22vmin,168px)/-2) 0 0 calc(clamp(96px,22vmin,168px)/-2);display:grid;place-items:center;border-radius:50%;background:#0a0a0bd9;box-shadow:0 0 60px #000;font:clamp(36px,8vmin,58px) 'Playfair Display';animation:in .9s both;transition:.6s}
        #sp.open .em{opacity:0;transform:scale(1.5)}.em svg{position:absolute;inset:0;transform:rotate(-90deg)}.em circle{stroke-dasharray:295;stroke-dashoffset:295;animation:dr 3s cubic-bezier(.5,0,.2,1) forwards}@keyframes dr{to{stroke-dashoffset:0}}
        .sg2{position:absolute;left:0;right:0;bottom:11%;text-align:center;transition:.4s}#sp.open .sg2{opacity:0}
        .sg2 b{font:400 13px Cinzel,serif;letter-spacing:.5em;color:var(--g)}.sg2 p{font:italic 14px 'Playfair Display';color:rgba(237,231,218,.6);margin-top:8px}
        #skip{position:absolute;right:20px;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);color:var(--m);font-size:12px;letter-spacing:.2em;padding:8px 14px}
        @media(max-width:479px){.lb{display:none}.wa{width:44px;padding:0;justify-content:center}.who{padding-right:16px}}
        @media(max-width:380px){.dk button{padding:9px 4px;font-size:9px}.dk nav{padding:5px;gap:0}.who b{font-size:15px}.f{padding:20px}.pr .bd{padding:18px}}
        .who b,.who small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        @media(min-width:760px){main{padding:140px 32px 150px}.hero{grid-template-columns:1fr auto;gap:64px}.reel{margin:0;width:auto;height:min(74vh,640px);height:min(74dvh,640px)}.grid{grid-template-columns:repeat(3,1fr);gap:20px}.rev{grid-template-columns:repeat(3,1fr)}.cols,.two{grid-template-columns:1fr 1fr;gap:32px}.cols{display:grid}.dk button{flex:none;flex-direction:row;gap:10px;padding:12px 20px;font-size:13px}.dk nav{padding:8px;gap:4px}.pg{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}.og{display:grid;grid-template-columns:.9fr 1.1fr;gap:64px}}
        @media(min-width:1100px){.grid.big{grid-template-columns:repeat(4,1fr)}}
        @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}} />
      
      <div id="sp">
        <div className="dr dl"><div className="gw" id="gl"></div></div>
        <div className="dr dR"><div className="gw" id="gr"></div></div>
        <div className="seam"></div>
        <div className="em">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="47" fill="none" stroke="#D6BC8A" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="gt">M</span>
        </div>
        <div className="sg2">
          <b>MERSÃO TATTOO</b>
          <p>Arte exclusiva na pele</p>
        </div>
        <button id="skip">PULAR</button>
      </div>

      <header className="hd">
        <button className="who glass" id="replay" aria-label="Rever abertura">
          <span className="av gt">M</span>
          <span style={{ textAlign: 'left', minWidth: 0 }}>
<<<<<<< HEAD
            <b id="perfil-nome">Mersão Tattoo</b>
            <small id="perfil-cidade">Ponte Nova, MG</small>
          </span>
        </button>
        <button className="wa glass hb" id="wa-btn">
=======
            <b>Mersão Tattoo</b>
            <small>Ponte Nova, MG</small>
          </span>
        </button>
        <button className="wa glass hb">
>>>>>>> 56fb02fe9ad17bc3bb271767f2a201fda33f66a5
          <span style={{ color: 'var(--g)' }}>●</span>
          <span className="lb">WhatsApp</span>
        </button>
      </header>

      <main id="main">
        <section className="tab on" id="portfolio">
          <div className="hero">
            <div>
              <h1>Arte exclusiva<br/>na sua pele.</h1>
              <em>Cuidado em cada traço.</em>
              <p>Tatuagem autoral, feita com calma, biossegurança rigorosa e materiais premium. Cada projeto nasce de uma conversa e termina como uma peça única na sua pele.</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn gold hb" data-go="orcamento">Solicitar orçamento</button>
                <button className="btn ghost hb" data-go="videos">Ver o processo</button>
              </div>
            </div>
            <div className="reel">
              <div className="rv">
                <button className="snd glass hb" id="snd">SOM</button>
                <div>
                  <i className="gt">M</i>
                  <small>Seu vídeo criativo 9:16<br/>aparece aqui, tocando em loop</small>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '80px' }}>
            <h2 className="t">Trabalhos selecionados</h2>
            <div className="chips" id="chips">
              <button className="chip on" data-s="">Todos</button>
              <button className="chip" data-s="Realismo">Realismo</button>
              <button className="chip" data-s="Fine line">Fine line</button>
              <button className="chip" data-s="Blackwork">Blackwork</button>
            </div>
            <div className="grid big" id="gal"></div>
          </div>
          <div style={{ marginTop: '80px' }}>
            <h2 className="t">Quem já viveu a experiência</h2>
            <div className="rev">
              <figure className="glass">
                <div className="st">★★★★★</div>
                <q>Atendimento impecável e um acabamento que superou o que eu imaginava.</q>
                <figcaption>Camila R.</figcaption>
              </figure>
              <figure className="glass">
                <div className="st">★★★★★</div>
                <q>Ambiente limpo, tranquilo e profissional. Cicatrizou perfeitamente.</q>
                <figcaption>Rafael M.</figcaption>
              </figure>
              <figure className="glass">
                <div className="st">★★★★★</div>
                <q>Ele entendeu a ideia antes de eu terminar de explicar.</q>
                <figcaption>Juliana S.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="tab" id="videos">
          <h2 className="t">O processo, de perto</h2>
          <div className="hl"></div>
          <p className="sub">Bastidores reais: o traço sendo construído, do primeiro risco ao acabamento.</p>
          <div className="grid big" id="vid"></div>
        </section>

        <section className="tab" id="studio">
          <h2 className="t">O estúdio</h2>
          <div className="hl"></div>
          <p className="sub">Tatuagem autoral, feita com calma, biossegurança rigorosa e materiais premium.</p>
          <div className="cols">
            <div className="map glass">
              <button className="btn glass hb">Abrir rota</button>
            </div>
            <div>
              <div className="dif glass">
                <u>✓</u>
                <div>
                  <h3>Biossegurança rigorosa</h3>
                  <p>Materiais descartáveis lacrados na sua frente e autoclave.</p>
                </div>
              </div>
              <div className="dif glass">
                <u>◆</u>
                <div>
                  <h3>Materiais premium</h3>
                  <p>Tintas e agulhas das melhores marcas, para cicatrização limpa.</p>
                </div>
              </div>
              <div className="dif glass">
                <u>❄</u>
                <div>
                  <h3>Ambiente climatizado</h3>
                  <p>Espaço reservado e confortável para sessões longas.</p>
                </div>
              </div>
            </div>
          </div>
          <div style={{ maxWidth: '720px', margin: '70px auto 0' }}>
            <h2 className="t" style={{ marginBottom: '24px' }}>Cuidados e dúvidas</h2>
            <details open>
              <summary>Como cuidar nas primeiras 48 horas?</summary>
              <p>Mantenha o curativo pelo tempo orientado, lave com sabão neutro e evite sol, piscina e mar.</p>
            </details>
            <details>
              <summary>Quanto tempo leva para cicatrizar?</summary>
              <p>A superfície cicatriza em 2 a 3 semanas; a pele leva cerca de 2 meses para se recuperar por completo.</p>
            </details>
            <details>
              <summary>Posso tatuar se for menor de 18 anos?</summary>
              <p>Somente com autorização por escrito e presença de um responsável legal.</p>
            </details>
          </div>
        </section>

        <section className="tab" id="promos">
          <h2 className="t">Flashes e promoções</h2>
          <div className="hl"></div>
          <p className="sub">Desenhos prontos, para tatuar no tamanho combinado. Vagas limitadas.</p>
          <div className="pg">
            <article className="pr glass" style={{ marginBottom: '20px' }}>
              <div className="im" style={{ '--h': 35 } as React.CSSProperties}><b>−29%</b></div>
              <div className="bd">
                <h3>Flash fine line</h3>
                <div className="p"><s>R$ 350</s><span className="gt">R$ 250</span></div>
                <button className="btn gold hb" style={{ width: '100%' }} data-flash="Flash fine line">Reservar esta arte</button>
              </div>
            </article>
            <article className="pr glass">
              <div className="im" style={{ '--h': 210 } as React.CSSProperties}><b>−33%</b></div>
              <div className="bd">
                <h3>Lettering minimalista</h3>
                <div className="p"><s>R$ 300</s><span className="gt">R$ 200</span></div>
                <button className="btn gold hb" style={{ width: '100%' }} data-flash="Lettering minimalista">Reservar esta arte</button>
              </div>
            </article>
          </div>
        </section>

        <section className="tab" id="orcamento">
          <div className="og">
            <div>
              <h2 className="t">Vamos desenhar a sua ideia</h2>
              <div className="hl"></div>
              <p className="sub">Conte o que você imagina. Respondemos pelo WhatsApp com valor e tempo estimado, sem compromisso.</p>
            </div>
            <div className="f glass" id="fm">
              <div id="ff">
                <label>SEU NOME</label>
                <input type="text" id="nm" />
                <label>LOCAL DO CORPO</label>
                <input type="text" placeholder="Ex.: antebraço, costela" />
                <label>SUA IDEIA</label>
                <textarea id="ide" rows={4} placeholder="Descreva o desenho, estilo, tamanho aproximado…"></textarea>
                <label>TEM REFERÊNCIA?</label>
                <div className="sg" id="sgm">
                  <button className="on" type="button">Ainda não</button>
                  <button type="button">Sim</button>
                </div>
                <label className="ck" style={{ font: '400 13.5px Inter', letterSpacing: 0, color: 'rgba(237,231,218,.7)' }}>
                  <input type="checkbox" id="mj" />
                  <span>Tenho 18 anos ou mais. Menores só tatuam com autorização e presença de um responsável.</span>
                </label>
                <button className="btn gold" style={{ width: '100%' }} id="send">Enviar para o WhatsApp</button>
              </div>
              <div className="ok" id="okb" hidden>
                <u>✓</u>
                <h3 style={{ fontSize: '28px' }}>Pedido enviado</h3>
                <p style={{ color: 'var(--m)', marginTop: '10px' }}>No site real, o WhatsApp abre aqui com a sua mensagem pronta.</p>
              </div>
            </div>
          </div>
        </section>
<<<<<<< HEAD

=======
>>>>>>> 56fb02fe9ad17bc3bb271767f2a201fda33f66a5
        <p className="note">Pré-visualização: fotos, vídeos e mapa são ilustrativos. Toque no “M” do topo para rever a abertura.</p>
      </main>

      <div className="dk"><nav className="glass" id="dock"></nav></div>
      <div className="toast glass" id="toast"></div>
    </>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 56fb02fe9ad17bc3bb271767f2a201fda33f66a5
