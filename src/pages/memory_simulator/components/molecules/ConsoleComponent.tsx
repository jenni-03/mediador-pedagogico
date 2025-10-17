import { useEffect, useRef, useState } from "react";

interface ConsoleComponentProps {
  onCommand: (command: string) => void;
  outputMessage: string;
  isSuccess: boolean;
}
type Entry = { command: string; response: string; success: boolean };

export function ConsoleComponent({
  onCommand,
  outputMessage,
  isSuccess,
}: ConsoleComponentProps) {
  const [history, setHistory] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // ⬇️ Nuevo: índice de la entrada "pendiente" + tick para forzar actualización
  const pendingIdxRef = useRef<number | null>(null);
  const [pendingTick, setPendingTick] = useState(0);

  const consoleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => inputRef.current?.focus();
  const clearAll = () => {
    setHistory([]);
    setInput("");
    setHistoryIndex(-1);
    pendingIdxRef.current = null;   // ⬅️ limpia pendiente
    focusInput();
  };
  const copyVisible = async () => {
    const text = history.map((h) => `${h.command}\n${h.response}`.trim()).join("\n\n");
    if (text) await navigator.clipboard.writeText(text);
  };

  // Auto-scroll
  useEffect(() => {
    const el = consoleRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  // ⬇️ Actualiza SIEMPRE la última entrada cuando:
  // - cambia outputMessage o isSuccess (caso normal)
  // - cambia pendingTick (nuevo comando, aunque el mensaje sea idéntico)
  useEffect(() => {
    if (pendingIdxRef.current == null) return;
    setHistory((prev) => {
      const idx = pendingIdxRef.current!;
      if (!prev[idx]) return prev; // ya no existe (clear)
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        response: outputMessage,
        success: isSuccess,
      };
      return copy;
    });
  }, [outputMessage, isSuccess, pendingTick]);

  // Ejecutar comando
  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    if (["clear", "cls"].includes(trimmed.toLowerCase())) {
      clearAll();
      return;
    }

    setHistory((prev) => {
      const idx = prev.length;         // índice de la nueva entrada
      pendingIdxRef.current = idx;     // ⬅️ marcamos pendiente
      return [
        ...prev,
        { command: `$ ${trimmed}`, response: "", success: true },
      ];
    });

    // ⬇️ tick para forzar el efecto incluso si el padre reemite el mismo mensaje
    setPendingTick((t) => t + 1);

    onCommand(trimmed);
    setInput("");
    setHistoryIndex(-1);
  };
  const sendCommand = () => executeCommand(input);

  // Historial (flechas)
  const moveHistoryUp = () => {
    if (!history.length) return;
    const idx =
      historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
    setHistoryIndex(idx);
    setInput(history[idx].command.replace(/^\$\s*/, ""));
  };
  const moveHistoryDown = () => {
    if (!history.length) return;
    const idx = historyIndex === history.length - 1 ? -1 : historyIndex + 1;
    setHistoryIndex(idx);
    setInput(idx === -1 ? "" : history[idx].command.replace(/^\$\s*/, ""));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); sendCommand(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveHistoryUp(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); moveHistoryDown(); }
  };

  // Atajo Enter para tours
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && el.value.trim()) {
        e.preventDefault();
        executeCommand(el.value);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  // UI respuesta
  const renderResponse = (resp: string, success: boolean) => {
    if (!resp) return null;
    const base = "whitespace-pre-wrap leading-6 text-[13px] tracking-wide font-normal";
    const ok = "text-gray-200";
    const err = "text-red-300";
    const border = success ? "border-l-2 border-l-emerald-500/70" : "border-l-2 border-l-[#D72638]";
    return (
      <div className={`mt-1 rounded-lg ${border} bg-[#0F0F0F]/60 px-3 py-2`} role="status" aria-live="polite">
        {resp.split("\n").map((line, i) => {
          const isArrow = line.trim().startsWith("->");
          const content = isArrow ? line.replace(/^->\s*/, "") : line;
          return (
            <div key={i} className={`${base} ${success ? ok : err}`}>
              {isArrow ? (
                <span className="inline-flex items-start gap-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-[#D72638]" />
                  <span>{content}</span>
                </span>
              ) : (
                content
              )}
            </div>
          );
        })}
        <div className="mt-2 text-[11px] uppercase tracking-wider">
          {success ? (
            <span className="px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-300">OK</span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-[#D72638]/20 text-[#ffb3bd]">Error</span>
          )}
        </div>
      </div>
    );
  };

  // ====== Layout (igual que tu versión grande) ======
  return (
    <section className="w-full px-4 sm:px-6 xl:px-10 2xl:px-20 max-w-[1100px] mx-auto mt-4 sm:mt-6">
      <div
        className="
          flex flex-col w-full
          min-h-[360px]
          h-[clamp(460px,60vh,800px)]
          max-h-[calc(100vh-140px)]
          rounded-3xl bg-[#111]/95 border border-white/10
          shadow-[0_10px_40px_-10px_rgba(0,0,0,.8)]
          ring-1 ring-transparent hover:ring-[#D72638]/60
          overflow-hidden transition-all
        "
        data-tour="divInputConsola"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#161616] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2a2a2a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#2a2a2a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#D72638]/70" />
            </div>
            <span className="text-xs sm:text-sm uppercase font-semibold tracking-[0.2em] text-gray-300">Consola</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyVisible} className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-300">Copiar</button>
            <button onClick={clearAll} className="text-[11px] px-2.5 py-1 rounded-md bg-[#D72638]/15 hover:bg-[#D72638]/25 text-[#ff7a8a]">Limpiar</button>
          </div>
        </div>

        {/* Historial */}
        <div
          ref={consoleRef}
          className="flex-1 min-h-0 overflow-y-auto p-4 font-mono text-[13px] text-gray-300 selection:bg-[#D72638]/40"
          onClick={focusInput}
          data-tour="consola"
        >
          {history.map((entry, idx) => (
            <div key={idx} className="mb-3">
              <div className="text-gray-200">
                <span className="text-[#D72638] font-semibold mr-2">$</span>
                <span className="font-medium">{entry.command.replace(/^\$\s*/, "")}</span>
              </div>
              {renderResponse(entry.response, entry.success)}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-3 py-3 bg-[#131313] border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-[#D72638] font-semibold">$</span>
            <input
              ref={inputRef}
              type="text"
              className="
                flex-1 bg-white/5 border border-white/10 rounded-xl
                px-3 py-2 text-[13px] text-gray-200 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-[#D72638]/60 focus:border-[#D72638]/40
                caret-[#D72638] font-mono
              "
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
              placeholder="Escribe un comando… (help, declarar, get, cls)"
              aria-label="Entrada de comandos"
              data-tour="inputConsola"
            />
            <button
              onClick={sendCommand}
              className="shrink-0 px-3 py-2 rounded-xl bg-[#D72638] text-white text-[13px] font-semibold hover:bg-[#c01f2f] active:scale-[.99] transition"
              title="Ejecutar (Enter)"
              aria-label="Ejecutar comando"
            >
              Ejecutar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
