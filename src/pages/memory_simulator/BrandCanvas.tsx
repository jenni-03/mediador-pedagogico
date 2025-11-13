// src/ui/BrandCanvas.tsx
import React, { useEffect } from "react";

/** Inyecta CSS una sola vez en <head> (HMR-safe: reemplaza si ya existe) */
function injectOnce(id: string, css: string) {
  if (typeof document === "undefined") return;
  const prev = document.getElementById(id);
  if (prev) prev.remove();
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

type Props = { children: React.ReactNode };

export default function BrandCanvas({ children }: Props) {
  useEffect(() => {
    injectOnce(
      "brand-canvas-styles-aurora-gamer",
      `
/* ======================= BRAND CANVAS — AURORA · ORBITS · PARTICLES ======================= */
/* Un solo scroll: el del documento. No tocamos html/body más de lo necesario. */
:root{
  --bg-0:#454f62;                  /* base media (combina con rojo/blanco/negro) */
  --bg-1:#3f4859;                  /* sombra ligera */
  --accent:#D72638;                /* rojo brand */
  --halo: rgba(215,38,56,.18);     /* halo rojo */
  --lift: rgba(255,255,255,.06);   /* micro-lift para grano */
  --aurora-intensity: .38;         /* 0..1 */
  --orbits-intensity: .32;         /* 0..1 */
  --stars-intensity:  .22;         /* 0..1 */
}

/* El scroll vive en el documento de siempre */
html, body { height:auto; min-height:100%; }

/* ── Lienzo base ─────────────────────────────────────────────────────────────────────────── */
.brand-canvas{
  position: relative;
  isolation: isolate;
  z-index: 0;

  /* fondo base */
  background: linear-gradient(180deg, var(--bg-0) 0%, var(--bg-1) 100%);
  color:#ECEDEF;

  /* clave para que los pseudos no provoquen “scroll fantasma” */
  overflow: hidden;
  min-height: 100dvh;

  /* pequeña viñeta para contraste global */
  box-shadow: inset 0 0 140px rgba(0,0,0,.35);
}

/* ── Capa A: AURORAS + BEAMS ─────────────────────────────────────────────────────────────── */
.brand-canvas::before{
  content:"";
  position:absolute; inset:0; z-index:-2; pointer-events:none;
  /* auroras: mezclas frías + halo rojo brand */
  background:
    /* beam diagonal frío (sheen) */
    linear-gradient(115deg, transparent 0 36%,
                    rgba(255,255,255,.10) 46%,
                    rgba(255,255,255,.05) 56%, transparent 66%),
    /* halo rojo arriba-derecha */
    radial-gradient(42vw 28vh at 86% -8%, var(--halo), transparent 68%),
    /* aurora teal */
    radial-gradient(60vw 40vh at 18% 12%, rgba(45,212,191, calc(.45*var(--aurora-intensity))), transparent 70%),
    /* aurora violet */
    radial-gradient(70vw 44vh at 78% 26%, rgba(167,139,250, calc(.42*var(--aurora-intensity))), transparent 72%),
    /* aurora sky */
    radial-gradient(65vw 42vh at 50% 120%, rgba(56,189,248,  calc(.30*var(--aurora-intensity))), transparent 75%);
  filter: saturate(1.05);
  mix-blend-mode: screen;
  animation: aurora-drift 60s linear infinite;
}

/* ── Capa B: ÓRBITAS + PARTÍCULAS ────────────────────────────────────────────────────────── */
.brand-canvas::after{
  content:"";
  position:absolute; inset:0; z-index:-1; pointer-events:none;
  background:
    /* orbits (conic rings) */
    repeating-conic-gradient(from 210deg at 24% 58%,
      rgba(255,255,255, calc(.20*var(--orbits-intensity))) 0 3deg,
      transparent 3deg 20deg),
    repeating-conic-gradient(from -30deg at 78% 34%,
      rgba(255,255,255, calc(.14*var(--orbits-intensity))) 0 4deg,
      transparent 4deg 22deg),
    /* starfield — capa grande */
    radial-gradient(#fff 1px, transparent 1px),
    /* starfield — capa pequeña */
    radial-gradient(#fff .7px, transparent .7px),
    /* micro-grano */
    radial-gradient(var(--lift) 0.6px, transparent 0.6px);

  background-repeat: no-repeat, no-repeat, repeat, repeat, repeat;
  background-size:
    cover, cover,
    180px 180px,  120px 120px,
    3px 3px;

  /* parallax suave: solo muevo partículas; orbits se quedan estáticas */
  background-position:
    center, center,
    0 0, 0 0, 0 0;

  opacity: 1;
  mix-blend-mode: soft-light;

  /* desvanecido hacia bordes para que no “ensucie” el layout */
  -webkit-mask-image: radial-gradient(120% 100% at 50% 48%, #000 62%, transparent 100%);
          mask-image: radial-gradient(120% 100% at 50% 48%, #000 62%, transparent 100%);

  animation:
    stars-drift 80s linear infinite,
    stars-twinkle 6s ease-in-out infinite;
}

/* Intensidad ajustable (sin JS) */
.brand-canvas::after{
  --starsA: calc(.70*var(--stars-intensity));
  --starsB: calc(.50*var(--stars-intensity));
  --grainA: .28;
}

/* ── Animaciones suaves (se respetan ajustes de accesibilidad) ───────────────────────────── */
@keyframes aurora-drift {
  0%   { transform: translate3d(0,0,0); }
  50%  { transform: translate3d(-1.5%, -1%, 0); }
  100% { transform: translate3d(0,0,0); }
}
@keyframes stars-drift {
  0%   { background-position: center, center, 0 0, 0 0, 0 0; }
  100% { background-position: center, center, -260px -160px, -180px -120px, 0 0; }
}
@keyframes stars-twinkle {
  0%,100% { opacity: .95; }
  50%     { opacity: 1; }
}

/* Reduce motion? Desactivamos animaciones */
@media (prefers-reduced-motion: reduce){
  .brand-canvas::before,
  .brand-canvas::after{ animation: none !important; }
}

/* ── Paddings responsivos del contenido (igual que v9) ───────────────────────────────────── */
.brand-canvas-shell{ padding: 1.5rem; }
@media (min-width: 640px){ .brand-canvas-shell{ padding-inline:1.5rem; } }
@media (min-width: 1280px){ .brand-canvas-shell{ padding-inline:2.5rem; } }
@media (min-width: 1536px){ .brand-canvas-shell{ padding-inline:10rem; } }

/* ── Scrollbars para contenedores internos (.stk-scroll) — intacto ───────────────────────── */
.stk-scroll{
  scrollbar-width: thin;
  scrollbar-color: rgba(200,170,255,.55) rgba(255,255,255,.08);
  scrollbar-gutter: stable both-edges;
}
.stk-scroll::-webkit-scrollbar{ width:12px; height:12px; }
.stk-scroll::-webkit-scrollbar-track{
  background: rgba(255,255,255,.06);
  border-radius:10px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.07);
}
.stk-scroll::-webkit-scrollbar-thumb{
  background: rgba(200,170,255,.72);
  border-radius:10px;
  border:2px solid rgba(22,22,28,.9);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.20),
              0 0 0 1px rgba(255,255,255,.08);
}
.stk-scroll::-webkit-scrollbar-thumb:hover{ background: rgba(200,170,255,.86); }
.stk-scroll::-webkit-scrollbar-corner{ background: transparent; }
`
    );
  }, []);

  return (
    <div className="brand-canvas">
      <div className="brand-canvas-shell text-[#E8E8E8]">
        {children}
      </div>
    </div>
  );
}
