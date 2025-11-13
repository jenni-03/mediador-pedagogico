// src/features/memory-sim/components/LogPanel.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  Terminal,
  Trash2,
  Copy as CopyIcon,
  History,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

/* ───────────────────────── Paleta gamer sólida ───────────────────────── */
const C = {
  panel: "#202734",
  panelSoft: "#242E3B",
  panelInner: "#1C2430",
  ring: "#2E3948",
  text: "text-zinc-100",
  label: "text-[11px] text-zinc-300",
};

/* ───────────────────────── Tipos ───────────────────────── */
type LogPanelProps = {
  logs: string[];
  onCommand: (cmd: string) => void;
  onClear?: () => void;
  placeholder?: string;
};

type LineKind = "info" | "ok" | "error" | "warn";

type OutputLine = {
  kind: LineKind;
  raw: string;
  expected?: string;
  received?: string;
  rule?: string;
  hint?: string;
};

type CmdBlock = {
  id: string;
  cmd: string;
  lines: OutputLine[];
  status: "ok" | "error" | "mixed" | "info";
  when: number;
};

/* ───────────────────────── Utilidades ───────────────────────── */

const classifyLine = (s: string): LineKind => {
  const t = s.trim();
  if (t.startsWith("❌")) return "error";
  if (t.startsWith("✅")) return "ok";
  if (/error|invalid|exception|failed/i.test(t)) return "error";
  if (/warn|advertencia|cuidado/i.test(t)) return "warn";
  return "info";
};

const extractPedagogy = (raw: string) => {
  const lower = raw;
  const grab = (label: string) => {
    const re = new RegExp(`${label}\\s*:\\s*([^•\\n]+)`, "i");
    const m = lower.match(re);
    return m ? m[1].trim() : undefined;
  };
  return {
    expected: grab("esperado"),
    received: grab("recibido"),
    rule: grab("regla"),
    hint: grab("pista"),
  };
};

const buildBlocks = (logs: string[]): CmdBlock[] => {
  const blocks: CmdBlock[] = [];
  let current: CmdBlock | null = null;

  for (const raw of logs) {
    const s = raw.trim();
    if (s.startsWith("▶")) {
      current = {
        id: `${Date.now()}-${blocks.length}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
        cmd: s.replace(/^▶\s*/, ""),
        lines: [],
        status: "info",
        when: Date.now(),
      };
      blocks.push(current);
      continue;
    }
    if (!current) {
      current = {
        id: `${Date.now()}-pre-${Math.random().toString(36).slice(2, 7)}`,
        cmd: "(sistema)",
        lines: [],
        status: "info",
        when: Date.now(),
      };
      blocks.push(current);
    }

    const kind = classifyLine(s);
    const pedagogy = extractPedagogy(s);

    current.lines.push({ kind, raw: s, ...pedagogy });

    const hasErr = current.lines.some((l) => l.kind === "error");
    const hasOk = current.lines.some((l) => l.kind === "ok");
    current.status = hasErr
      ? hasOk
        ? "mixed"
        : "error"
      : hasOk
        ? "ok"
        : "info";
  }

  return blocks;
};

/* ───────────────────────── UI Atómica ───────────────────────── */

const Pill = ({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "error" | "warn";
}) => {
  const cls =
    tone === "ok"
      ? "bg-emerald-600/20 text-emerald-100 ring-emerald-400/35"
      : tone === "error"
        ? "bg-rose-600/20 text-rose-100 ring-rose-400/35"
        : tone === "warn"
          ? "bg-amber-500/20 text-amber-100 ring-amber-300/35"
          : "bg-[#2F394B] text-zinc-100 ring-[#3B4659]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] ring-1 ${cls}`}
    >
      {children}
    </span>
  );
};

const Badge = ({ status }: { status: CmdBlock["status"] }) => {
  const map = {
    ok: {
      text: "OK",
      cls: "bg-emerald-600/20 text-emerald-100 ring-emerald-400/35",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      bar: "linear-gradient(90deg, #34d399, transparent)",
      border: "#2dd4bf",
    },
    error: {
      text: "ERROR",
      cls: "bg-rose-600/20 text-rose-100 ring-rose-400/35",
      icon: <XCircle className="h-3.5 w-3.5" />,
      bar: "linear-gradient(90deg, #f43f5e, transparent)",
      border: "#f43f5e",
    },
    mixed: {
      text: "MIXTO",
      cls: "bg-fuchsia-600/20 text-fuchsia-100 ring-fuchsia-400/35",
      icon: <Info className="h-3.5 w-3.5" />,
      bar: "linear-gradient(90deg, #a78bfa, transparent)",
      border: "#a78bfa",
    },
    info: {
      text: "INFO",
      cls: "bg-[#2F394B] text-zinc-100 ring-[#3B4659]",
      icon: <Info className="h-3.5 w-3.5" />,
      bar: "linear-gradient(90deg, #94a3b8, transparent)",
      border: "#3B4659",
    },
  } as const;
  const { text, cls, icon } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] ring-1 ${cls}`}
    >
      {icon}
      {text}
    </span>
  );
};

const CopyBtn = ({ text, title }: { text: string; title: string }) => (
  <button
    onClick={() => navigator?.clipboard?.writeText?.(text)}
    className="ml-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px]
               bg-[#2F394B] text-zinc-100 ring-1 ring-[#3B4659] hover:bg-[#324057] active:translate-y-px"
    title={title}
  >
    copiar
    <svg
      className="h-3.5 w-3.5 opacity-80"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 17H8V7h11v15Z" />
    </svg>
  </button>
);

const PedagogicCallout = ({ line }: { line: OutputLine }) => {
  const tone =
    line.kind === "error"
      ? { border: "rgba(244,63,94,.35)", bg: "rgba(244,63,94,.10)" }
      : { border: "rgba(52,211,153,.35)", bg: "rgba(52,211,153,.10)" };
  return (
    <div
      className="mt-2 rounded-lg px-3 py-2"
      style={{ border: `1px solid ${tone.border}`, background: tone.bg }}
    >
      <div className="grid gap-1 sm:grid-cols-2">
        {line.expected && (
          <div className="text-[12px]">
            <span className="text-zinc-300/80">Esperado:</span>{" "}
            <span className="font-mono text-zinc-50">{line.expected}</span>
          </div>
        )}
        {line.received && (
          <div className="text-[12px]">
            <span className="text-zinc-300/80">Recibido:</span>{" "}
            <span className="font-mono text-zinc-50">{line.received}</span>
          </div>
        )}
        {line.rule && (
          <div className="text-[12px] sm:col-span-2">
            <span className="text-zinc-300/80">Regla:</span>{" "}
            <span className="text-zinc-50">{line.rule}</span>
          </div>
        )}
        {line.hint && (
          <div className="text-[12px] sm:col-span-2">
            <span className="text-zinc-300/80">Pista:</span>{" "}
            <span className="text-zinc-50">{line.hint}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const OutputRow = ({ line }: { line: OutputLine }) => {
  const icon =
    line.kind === "error" ? (
      <XCircle className="h-4 w-4 text-rose-300" />
    ) : line.kind === "ok" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
    ) : line.kind === "warn" ? (
      <Info className="h-4 w-4 text-amber-300" />
    ) : (
      <Info className="h-4 w-4 text-zinc-300" />
    );

  const baseText = line.raw
    .replace(/^([✅❌]\s*)+/, "")
    .replace(/^LOG\s*:?/i, "")
    .trim();

  return (
    <div className="mt-1">
      <div className="flex items-start gap-2">
        {icon}
        <div className="text-[13px] leading-5 text-zinc-100">{baseText}</div>
      </div>
      {(line.expected || line.received || line.rule || line.hint) && (
        <PedagogicCallout line={line} />
      )}
    </div>
  );
};

/* estado→tema para el bloque */
function statusTheme(status: CmdBlock["status"]) {
  switch (status) {
    case "error":
      return {
        border: "#f43f5e66",
        bar: "linear-gradient(90deg,#f43f5e,transparent)",
      };
    case "ok":
      return {
        border: "#22c55e66",
        bar: "linear-gradient(90deg,#22c55e,transparent)",
      };
    case "mixed":
      return {
        border: "#a78bfacc",
        bar: "linear-gradient(90deg,#a78bfa,transparent)",
      };
    default:
      return {
        border: C.ring,
        bar: "linear-gradient(90deg,#94a3b8,transparent)",
      };
  }
}

const CommandBlock = ({ b }: { b: CmdBlock }) => {
  const t = statusTheme(b.status);
  return (
    <div
      className="rounded-xl px-3 py-2 relative"
      style={{ background: C.panelSoft, border: `1px solid ${t.border}` }}
    >
      <div
        className="absolute left-0 top-0 h-[3px] w-full rounded-t-xl"
        style={{ background: t.bar as any }}
      />
      <div className="flex items-center gap-2">
        <Badge status={b.status} />
        <code className="font-mono text-[12px] text-zinc-50">{b.cmd}</code>
        <CopyBtn text={b.cmd} title="Copiar comando" />
        <span className="ml-auto text-[10px] text-zinc-300/70">
          {new Date(b.when).toLocaleTimeString()}
        </span>
      </div>

      {b.lines.length > 0 && (
        <div className="mt-2">
          {b.lines.map((ln, i) => (
            <OutputRow key={i} line={ln} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ───────────────────────── Componente principal ───────────────────────── */
export function LogPanel({
  logs,
  onCommand,
  onClear,
  placeholder,
}: LogPanelProps) {
  const [cmd, setCmd] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [_histIdx, setHistIdx] = useState<number>(-1);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const run = useCallback(() => {
    const raw = cmd;
    const trimmed = raw.trim();
    if (!trimmed) return;
    const lines = raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const line of lines) {
      try {
        onCommand(line);
      } catch (e) {
        console.error(e);
      }
    }
    setHistory((h) => (h[h.length - 1] === raw ? h : [...h, raw]).slice(-100));
    setHistIdx(-1);
    setCmd("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [cmd, onCommand]);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (
      (e.key === "Enter" && !e.shiftKey) ||
      (e.key === "Enter" && e.ctrlKey)
    ) {
      e.preventDefault();
      run();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      setHistIdx((i) => {
        const next = i < 0 ? history.length - 1 : Math.max(0, i - 1);
        setCmd(history[next]);
        return next;
      });
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!history.length) return;
      setHistIdx((i) => {
        if (i < 0) return -1;
        const next = i + 1;
        if (next >= history.length) {
          setCmd("");
          return -1;
        }
        setCmd(history[next]);
        return next;
      });
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart ?? cmd.length;
      const end = el.selectionEnd ?? cmd.length;
      const newCmd = cmd.slice(0, start) + "  " + cmd.slice(end);
      setCmd(newCmd);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const blocks = useMemo(() => buildBlocks(logs), [logs]);

  const hint = useMemo(
    () =>
      placeholder ??
      'Escribe un comando… ej: int x=42 | String s="hola" | int[] a={1,2,3}',
    [placeholder]
  );

  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: C.panel,
        border: `1px solid ${C.ring}`,
        boxShadow: "0 8px 30px -12px rgba(0,0,0,.35)",
      }}
    >
      {/* barra energética superior */}
      <div className="h-[2px] w-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300" />

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: C.panelSoft, borderBottom: `1px solid ${C.ring}` }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D72638]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#F6C90E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#4ECB71]" />
          </div>
          <div
            className={`flex items-center gap-2 text-sm font-semibold ${C.text}`}
          >
            <Terminal className="h-4 w-4 text-[#D72638]" />
            <span>CONSOLA</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Pill>
            <span className="font-mono">{blocks.length}</span> intentos
          </Pill>

          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(logs.join("\n"));
              } catch {
                /* no-op */
              }
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs
                       bg-[#2F394B] text-zinc-100 ring-1 ring-[#3B4659] hover:bg-[#324057]"
            title="Copiar todos los logs"
          >
            <CopyIcon className="h-3.5 w-3.5" />
            Copiar
          </button>

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs
                         bg-rose-600/15 text-rose-100 ring-1 ring-rose-400/35 hover:bg-rose-600/25"
              title="Limpiar consola"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Área de logs: sólido + micro-grid */}
      <div
        className="relative max-h-[260px] overflow-auto px-3 py-3 stk-scroll"
        style={{ background: C.panelInner }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        {blocks.length ? (
          <div className="space-y-2">
            {blocks.map((b) => (
              <CommandBlock key={b.id} b={b} />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-zinc-400">
            <History className="h-3.5 w-3.5" />
            <span>Sin logs.</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Prompt */}
      <div
        className="px-3 py-3"
        style={{ background: C.panelSoft, borderTop: `1px solid ${C.ring}` }}
      >
        <div className="flex items-center gap-2">
          <span className="select-none rounded-md bg-rose-600/20 px-2 py-1 font-mono text-xs text-rose-100 ring-1 ring-rose-400/35">
            &gt;
          </span>
          <input
            ref={inputRef}
            className="flex-1 rounded-lg px-3 py-2 font-mono text-sm text-zinc-50 placeholder:text-zinc-300/70 focus:outline-none"
            style={{
              background: C.panelInner,
              border: `1px solid ${C.ring}`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)",
            }}
            placeholder={hint}
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
          />
          <button
            onClick={run}
            disabled={!cmd.trim()}
            className="rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-[0_6px_20px_-8px_rgba(215,38,56,.55)] hover:brightness-105 active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ejecutar
          </button>
        </div>
        <p className="mt-2 text-[10px] text-zinc-300/70">
          Usa ↑/↓ para navegar el historial. Tab inserta 2 espacios.
        </p>
      </div>
    </section>
  );
}
