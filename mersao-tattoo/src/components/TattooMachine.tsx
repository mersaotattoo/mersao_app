/**
 * Máquina de tatuagem animada (SVG + CSS puro, sem bibliotecas).
 * A agulha vibra, a máquina percorre a pele e deixa um traço de tinta dourada.
 * O traço funciona como barra de progresso da abertura do site.
 *
 * Tempos (iguais no traço e na máquina, por isso a ponta da agulha nunca descola da linha):
 *   espera 0,35 s → desenho de 2,6 s
 */
export const TATTOO_DRAW_MS = 2950 // espera + desenho, usado pela abertura para saber quando terminou

const CSS = `
.mt-art { overflow: visible; }
.mt-travel { animation: mt-travel 2.6s cubic-bezier(.5,0,.2,1) .35s both; }
.mt-line   { stroke-dasharray: 1 1; animation: mt-draw 2.6s cubic-bezier(.5,0,.2,1) .35s both; }
.mt-shake  { animation: mt-shake .09s linear infinite; }
.mt-buzz   { animation: mt-buzz .06s linear infinite alternate; }
.mt-spark  { animation: mt-spark .55s ease-out infinite; opacity: 0; }
.mt-spark.b { animation-delay: .18s; }
.mt-spark.c { animation-delay: .36s; }
.mt-pulse  { animation: mt-pulse 1.6s ease-in-out infinite; }
@keyframes mt-travel { from { transform: translateX(150px); } to { transform: translateX(400px); } }
@keyframes mt-draw   { 0% { stroke-dashoffset: 1; opacity: 0; } 1% { opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 1; } }
@keyframes mt-shake  { 0% { transform: translate(0,0); } 50% { transform: translate(.4px,-.3px); } 100% { transform: translate(-.4px,.3px); } }
@keyframes mt-buzz   { from { transform: translateY(0); } to { transform: translateY(3px); } }
@keyframes mt-spark  { 0% { transform: translate(0,0) scale(1); opacity: .95; } 100% { transform: translate(-16px,-20px) scale(.3); opacity: 0; } }
@keyframes mt-pulse  { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .mt-shake, .mt-buzz, .mt-spark, .mt-pulse { animation: none; }
}
`

export default function TattooMachine({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 300" className={`mt-art ${className}`} role="img" aria-label="Máquina de tatuagem desenhando uma linha">
      <style>{CSS}</style>
      <defs>
        <linearGradient id="mt-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3E7C6" />
          <stop offset="0.5" stopColor="#C9A96A" />
          <stop offset="1" stopColor="#7A6238" />
        </linearGradient>
        <linearGradient id="mt-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0c0c0e" />
          <stop offset="0.45" stopColor="#26262b" />
          <stop offset="1" stopColor="#0c0c0e" />
        </linearGradient>
        <linearGradient id="mt-ink" gradientUnits="userSpaceOnUse" x1="150" y1="0" x2="400" y2="0">
          <stop offset="0" stopColor="#B8975A" />
          <stop offset="0.6" stopColor="#F3E7C6" />
          <stop offset="1" stopColor="#D6BC8A" />
        </linearGradient>
        <radialGradient id="mt-skin" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#D6BC8A" stopOpacity="0.16" />
          <stop offset="1" stopColor="#D6BC8A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* brilho suave da "pele" sob o traço */}
      <ellipse cx="275" cy="256" rx="215" ry="26" fill="url(#mt-skin)" />

      {/* batoque de tinta, ao lado de onde o traço começa */}
      <g transform="translate(86 236)">
        <path d="M0 0 L30 0 L26 20 L4 20 Z" fill="#0d0d0f" stroke="#C9A96A" strokeWidth="1.2" strokeOpacity="0.85" />
        <ellipse cx="15" cy="0" rx="15" ry="3.6" fill="#040405" stroke="#C9A96A" strokeWidth="1.2" strokeOpacity="0.85" />
        <ellipse cx="12" cy="-0.6" rx="5" ry="1" fill="#F3E7C6" fillOpacity="0.25" />
      </g>

      {/* traço de tinta (barra de progresso) */}
      <path
        className="mt-line"
        d="M150 250 L400 250"
        pathLength={1}
        fill="none"
        stroke="url(#mt-ink)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      {/* a máquina percorre o traço: a ponta da agulha fica sempre na ponta da linha */}
      <g className="mt-travel">
        <g transform="translate(0 250)">
          {/* respingos de tinta na ponta */}
          <circle className="mt-spark" cx="0" cy="-1" r="1.8" fill="#F3E7C6" />
          <circle className="mt-spark b" cx="1" cy="-1" r="1.4" fill="#D6BC8A" />
          <circle className="mt-spark c" cx="-1" cy="-1" r="1.2" fill="#F3E7C6" />

          <g className="mt-shake">
            {/* máquina inclinada, como na mão do tatuador (ponta na origem) */}
            <g transform="rotate(-30)">
              {/* fio de clip cord */}
              <path d="M0 -198 C -12 -216 -42 -204 -58 -232" fill="none" stroke="#C9A96A" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />

              {/* barra da agulha + agulha: é o que vibra */}
              <g className="mt-buzz">
                <rect x="-20" y="-192" width="40" height="4" rx="1.5" fill="url(#mt-gold)" />
                <line x1="0" y1="-188" x2="0" y2="-24" stroke="#D6BC8A" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="0" y1="-26" x2="0" y2="0" stroke="#F3E7C6" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* bobinas */}
              <rect x="-24" y="-178" width="18" height="50" rx="3" fill="url(#mt-metal)" stroke="url(#mt-gold)" strokeWidth="1.2" />
              <rect x="6" y="-178" width="18" height="50" rx="3" fill="url(#mt-metal)" stroke="url(#mt-gold)" strokeWidth="1.2" />
              {[-170, -163, -156, -149, -142, -135].map((y) => (
                <g key={y} stroke="#C9A96A" strokeOpacity="0.75" strokeWidth="1.4" strokeLinecap="round">
                  <line x1="-22" y1={y} x2="-8" y2={y} />
                  <line x1="8" y1={y} x2="22" y2={y} />
                </g>
              ))}

              {/* quadro: travessa superior e base */}
              <rect x="-28" y="-186" width="56" height="9" rx="3" fill="url(#mt-metal)" stroke="url(#mt-gold)" strokeWidth="1.2" />
              <rect x="-28" y="-128" width="56" height="12" rx="3" fill="url(#mt-metal)" stroke="url(#mt-gold)" strokeWidth="1.2" />

              {/* conector do clip cord */}
              <rect x="-5" y="-200" width="10" height="14" rx="2.5" fill="url(#mt-metal)" stroke="url(#mt-gold)" strokeWidth="1.2" />

              {/* empunhadura (grip) com serrilhado */}
              <rect x="-10" y="-124" width="20" height="62" rx="5" fill="url(#mt-metal)" stroke="url(#mt-gold)" strokeWidth="1.2" />
              {[-114, -106, -98, -90, -82, -74].map((y) => (
                <line key={y} x1="-10" y1={y} x2="10" y2={y} stroke="#C9A96A" strokeOpacity="0.4" strokeWidth="1" />
              ))}

              {/* bico (tip): afunila até a agulha */}
              <path d="M-6 -62 L6 -62 L2.8 -26 L-2.8 -26 Z" fill="url(#mt-metal)" stroke="url(#mt-gold)" strokeWidth="1.2" strokeLinejoin="round" />
              <line x1="-4" y1="-56" x2="-1.8" y2="-30" stroke="#F3E7C6" strokeOpacity="0.35" strokeWidth="1" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
