import React from "react";
import { useAnchors } from "./AnchorRegistry";

type Edge = { fromId: string; toId: string; highlight?: boolean };
type Line = { d: string; highlight?: boolean };

export function EdgesLayer({ edges }: { edges: Edge[] }) {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [lines, setLines] = React.useState<Line[]>([]);
  const { getRect } = useAnchors();
  const rafRef = React.useRef(0);

  const compute = React.useCallback(() => {
    const svg = svgRef.current;
    if (!svg || !svg.parentElement) return;
    const crect = svg.parentElement.getBoundingClientRect();
    const out: Line[] = [];

    for (const e of edges) {
      const fr =
        getRect(e.fromId) ??
        document.getElementById(e.fromId)?.getBoundingClientRect();
      const tr =
        getRect(e.toId) ??
        document.getElementById(e.toId)?.getBoundingClientRect();
      if (!fr || !tr) continue;

      const x1 = fr.right - crect.left;
      const y1 = fr.top + fr.height / 2 - crect.top;
      const x2 = tr.left - crect.left;
      const y2 = tr.top + tr.height / 2 - crect.top;
      const dx = Math.max(32, Math.min(160, (x2 - x1) * 0.5));
      out.push({
        d: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`,
        highlight: e.highlight,
      });
    }
    setLines(out);
  }, [edges, getRect]);

  const debouncedCompute = React.useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(compute);
  }, [compute]);

  React.useLayoutEffect(() => {
    compute();
    const parent = svgRef.current?.parentElement ?? document.body;
    const ro = new ResizeObserver(debouncedCompute);
    ro.observe(parent);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [compute, debouncedCompute]);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 z-10"
      width="100%"
      height="100%"
    >
      <defs>
        <marker
          id="arrow"
          markerWidth="8"
          markerHeight="8"
          refX="8"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 8 3.5, 0 7" fill="currentColor" />
        </marker>
      </defs>

      {lines.map((l, i) => {
        const base =
          "fill-none stroke-[1.5] text-indigo-400 dark:text-indigo-300 opacity-80";
        const hi =
          "stroke-[2.5] text-emerald-400 dark:text-emerald-300";
        return (
          <path
            key={i}
            d={l.d}
            className={`${base} ${l.highlight ? hi : ""}`}
            markerEnd="url(#arrow)"
          />
        );
      })}
    </svg>
  );
}
