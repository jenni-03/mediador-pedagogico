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
  // Campos pedagógicos detectados
  expected?: string;
  received?: string;
  rule?: string;
  hint?: string;
};

type CmdBlock = {
  id: string;
  cmd: string; // texto del comando (sin "▶")
  lines: OutputLine[]; // feedback asociado
  status: "ok" | "error" | "mixed" | "info";
  when: number;
};

/* ───────────────────────── Utilidades de parsing ───────────────────────── */

// Clasifica una sola línea
const classifyLine = (s: string): LineKind => {
  const t = s.trim();
  if (t.startsWith("❌")) return "error";
  if (t.startsWith("✅")) return "ok";
  if (/error|invalid|exception|failed/i.test(t)) return "error";
  if (/warn|advertencia|cuidado/i.test(t)) return "warn";
  return "info";
};

// Extrae “esperado / recibido / regla / pista” si vienen en el texto
const extractPedagogy = (raw: string) => {
  // Normalizamos bullets "• ..." o " - ..." y buscamos patrones.
  // Acepta tanto "esperado:" como "Esperado:" etc.
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

// Parte el vector de logs plano en bloques por comando ▶
const buildBlocks = (logs: string[]): CmdBlock[] => {
  const blocks: CmdBlock[] = [];
  let current: CmdBlock | null = null;

  for (const raw of logs) {
    const s = raw.trim();
    if (s.startsWith("▶")) {
      // comienza un bloque nuevo
      current = {
        id: `${Date.now()}-${blocks.length}-${Math.random().toString(36).slice(2, 7)}`,
        cmd: s.replace(/^▶\s*/, ""),
        lines: [],
        status: "info",
        when: Date.now(),
      };
      blocks.push(current);
      continue;
    }
    if (!current) {
      // línea suelta previa a un ▶ — la colocamos en un bloque "anónimo"
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

    // recalcular status del bloque
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
      ? "bg-emerald-600/15 text-emerald-200 ring-emerald-700/40"
      : tone === "error"
        ? "bg-rose-600/15 text-rose-200 ring-rose-700/40"
        : tone === "warn"
          ? "bg-amber-500/15 text-amber-200 ring-amber-700/40"
          : "bg-neutral-600/15 text-neutral-200 ring-neutral-700/40";
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
      cls: "bg-emerald-600/15 text-emerald-200 ring-emerald-700/40",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    error: {
      text: "ERROR",
      cls: "bg-rose-600/15 text-rose-200 ring-rose-700/40",
      icon: <XCircle className="h-3.5 w-3.5" />,
    },
    mixed: {
      text: "MIXTO",
      cls: "bg-purple-600/15 text-purple-200 ring-purple-700/40",
      icon: <Info className="h-3.5 w-3.5" />,
    },
    info: {
      text: "INFO",
      cls: "bg-neutral-600/15 text-neutral-200 ring-neutral-700/40",
      icon: <Info className="h-3.5 w-3.5" />,
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
    className="ml-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]
               bg-neutral-800 text-neutral-200 ring-1 ring-neutral-700 hover:bg-neutral-700 active:translate-y-px"
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

/* Callout pedagógico para una línea con “esperado/recibido/…” */
const PedagogicCallout = ({ line }: { line: OutputLine }) => {
  const tone =
    line.kind === "error"
      ? "border-rose-500/40 bg-rose-500/10"
      : "border-emerald-500/30 bg-emerald-500/10";
  return (
    <div className={`mt-2 rounded-lg border ${tone} px-3 py-2`}>
      <div className="grid gap-1 sm:grid-cols-2">
        {line.expected && (
          <div className="text-[12px]">
            <span className="text-neutral-400">Esperado:</span>{" "}
            <span className="font-mono text-neutral-100">{line.expected}</span>
          </div>
        )}
        {line.received && (
          <div className="text-[12px]">
            <span className="text-neutral-400">Recibido:</span>{" "}
            <span className="font-mono text-neutral-100">{line.received}</span>
          </div>
        )}
        {line.rule && (
          <div className="text-[12px] sm:col-span-2">
            <span className="text-neutral-400">Regla:</span>{" "}
            <span className="text-neutral-100">{line.rule}</span>
          </div>
        )}
        {line.hint && (
          <div className="text-[12px] sm:col-span-2">
            <span className="text-neutral-400">Pista:</span>{" "}
            <span className="text-neutral-100">{line.hint}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* Una línea de salida estilizada */
const OutputRow = ({ line }: { line: OutputLine }) => {
  const icon =
    line.kind === "error" ? (
      <XCircle className="h-4 w-4 text-rose-400" />
    ) : line.kind === "ok" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    ) : line.kind === "warn" ? (
      <Info className="h-4 w-4 text-amber-300" />
    ) : (
      <Info className="h-4 w-4 text-neutral-400" />
    );

  const baseText = line.raw
    .replace(/^([✅❌]\s*)+/, "") // limpia emojis repetidos al inicio
    .replace(/^LOG\s*:?/i, "")
    .trim();

  return (
    <div className="mt-1">
      <div className="flex items-start gap-2">
        {icon}
        <div className="text-[13px] leading-5 text-neutral-200">{baseText}</div>
      </div>
      {(line.expected || line.received || line.rule || line.hint) && (
        <PedagogicCallout line={line} />
      )}
    </div>
  );
};

/* Tarjeta de un bloque comando+feedback */
const CommandBlock = ({ b }: { b: CmdBlock }) => {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        b.status === "error"
          ? "border-rose-900/70 bg-[#180c0e]"
          : b.status === "ok"
            ? "border-emerald-900/60 bg-[#0e1511]"
            : b.status === "mixed"
              ? "border-purple-900/60 bg-[#130f16]"
              : "border-neutral-800 bg-[#0d0e11]"
      }`}
    >
      <div className="flex items-center gap-2">
        <Badge status={b.status} />
        <code className="font-mono text-[12px] text-neutral-100">{b.cmd}</code>
        <CopyBtn text={b.cmd} title="Copiar comando" />
        <span className="ml-auto text-[10px] text-neutral-500">
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

  /* Ejecutar */
  const run = useCallback(() => {
    const raw = cmd;
    const trimmed = raw.trim();
    if (!trimmed) return;

    // permite pegar varias líneas
    const lines = raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const line of lines) {
      try {
        onCommand(line);
      } catch (e) {
        // no romper UI
        console.error(e);
      }
    }

    setHistory((h) => (h[h.length - 1] === raw ? h : [...h, raw]).slice(-100));
    setHistIdx(-1);
    setCmd("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [cmd, onCommand]);

  /* Teclado */
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

  /* Autoscroll */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  /* Construye bloques pedagógicos */
  const blocks = useMemo(() => buildBlocks(logs), [logs]);

  /* Hint */
  const hint = useMemo(
    () =>
      placeholder ??
      'Escribe un comando… ej: int x=42 | String s="hola" | int[] a={1,2,3}',
    [placeholder]
  );

  /* Render */
  return (
    <section className="rounded-2xl border border-[#2E2E2E] bg-[#0E0F12]/80 backdrop-blur-sm shadow-lg shadow-black/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F22] bg-[#0B0C0F]/80">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D72638]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#F6C90E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#4ECB71]" />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#E0E0E0]">
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
            className="inline-flex items-center gap-1 rounded-lg bg-[#16171C] px-2 py-1 text-xs text-[#E0E0E0] hover:bg-[#1F2026] border border-[#2B2C31]"
            title="Copiar todos los logs"
          >
            <CopyIcon className="h-3.5 w-3.5" />
            Copiar
          </button>

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-lg bg-[#1A0C0C] px-2 py-1 text-xs text-[#F2B5B5] hover:bg-[#250E0E] border border-[#7B2222]/50"
              title="Limpiar consola"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Área pedagógica agrupada */}
      <div className="max-h-[260px] overflow-auto bg-gradient-to-b from-[#0E0F12] to-[#09090B] px-3 py-3 scrollbar-thin scrollbar-thumb-[#D72638]/40 scrollbar-track-transparent">
        {blocks.length ? (
          <div className="space-y-2">
            {blocks.map((b) => (
              <CommandBlock key={b.id} b={b} />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[#4F5056]">
            <History className="h-3.5 w-3.5" />
            <span>Sin logs.</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Prompt */}
      <div className="border-t border-[#1F1F22] bg-[#0B0C0F]/80 px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="select-none rounded-md bg-[#D72638]/10 px-2 py-1 font-mono text-xs text-[#F9DDE1]">
            &gt;
          </span>
          <input
            ref={inputRef}
            className="flex-1 rounded-lg border border-[#2E2E2E] bg-[#121316] px-3 py-2 font-mono text-sm text-[#EAEAEA] placeholder:text-[#5E5F63] focus:outline-none focus:ring-2 focus:ring-[#D72638]/70 focus:border-transparent"
            placeholder={hint}
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
          />
          <button
            onClick={run}
            disabled={!cmd.trim()}
            className="rounded-lg bg-gradient-to-r from-[#D72638] to-[#A11421] px-3 py-2 text-sm font-semibold text-white shadow-md shadow-[#D72638]/40 hover:brightness-105 active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ejecutar
          </button>
        </div>
        <p className="mt-2 text-[10px] text-[#5E5F63]">
          Usa ↑/↓ para navegar el historial. Tab inserta 2 espacios.
        </p>
      </div>
    </section>
  );
}
