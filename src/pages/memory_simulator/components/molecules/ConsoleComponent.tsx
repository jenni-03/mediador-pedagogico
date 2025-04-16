import { useEffect, useRef, useState } from "react";

interface ConsoleComponentProps {
  onCommand: (command: string) => void;
  outputMessage: string;
  isSuccess: boolean;
}

export function ConsoleComponent({
  onCommand,
  outputMessage,
  isSuccess,
}: ConsoleComponentProps) {
  const [history, setHistory] = useState<
    { command: string; response: string; success: boolean }[]
  >([]);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const consoleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto‐scroll al último mensaje
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [history]);

  // Actualiza la respuesta del último comando
  useEffect(() => {
    if (!history.length) return;
    setHistory((prev) => {
      const copy = [...prev];
      copy[copy.length - 1].response = outputMessage;
      copy[copy.length - 1].success = isSuccess;
      return copy;
    });
  }, [outputMessage, isSuccess]);

  const executeCommand = (cmd: string) => {
    if (["clear", "cls"].includes(cmd.trim().toLowerCase())) {
      setHistory([]);
      setInput("");
      return;
    }
    setHistory((prev) => [
      ...prev,
      { command: `$ ${cmd}`, response: "", success: true },
    ]);
    onCommand(cmd);
    setInput("");
  };

  // Historial con flechas
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
  const sendCommand = () => input.trim() && executeCommand(input);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      executeCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveHistoryUp();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveHistoryDown();
    }
  };

  // Para triggers externos tipo tour
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

  // Renderiza respuesta con saltos de línea y flechas
  const renderResponse = (resp: string, success: boolean) =>
    resp.split("\n").map((line, i) => {
      const colorClass = success ? "text-[#a8ffdd]" : "text-red-500";
      if (line.startsWith("->")) {
        return (
          <div key={i} className={`flex items-start gap-1 ${colorClass}`}>
            <span>➡️</span>
            <span>{line.slice(2).trim()}</span>
          </div>
        );
      }
      return (
        <div key={i} className={colorClass}>
          {line}
        </div>
      );
    });

  const focusInput = () => inputRef.current?.focus();

  return (
    <div className="w-full h-80 sm:h-full flex flex-col">
      <div
        className="
          flex flex-col w-full h-full
          rounded-2xl shadow-xl shadow-black/40
          bg-gradient-to-tr from-[#0F0F0F] to-[#262626]
          border border-[#3A3A3A]
          hover:ring-1 hover:ring-[#D72638]/70
          transition-all
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#1F1F1F]/90 border-b border-[#2E2E2E] px-4 py-2 rounded-t-2xl">
          <span className="text-sm uppercase font-bold tracking-wider text-gray-300">
            Consola
          </span>
        </div>

        {/* Historial */}
        <div
          ref={consoleRef}
          className="flex-1 min-h-0 overflow-y-auto p-4 text-sm"
          onClick={focusInput}
          data-tour="consola"
        >
          {history.map((entry, idx) => (
            <div key={idx} className="mb-1">
              <div className="text-[#00ff98] font-medium">{entry.command}</div>
              {entry.response && (
                <div>{renderResponse(entry.response, entry.success)}</div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex flex-col sm:flex-row items-center px-4 py-2 border-t border-[#2E2E2E] bg-[#1F1F1F]/80 rounded-b-2xl">
          <span className="text-[#00ff98] font-semibold mr-2 sm:mr-4">$</span>
          <input
            ref={inputRef}
            type="text"
            className="bg-transparent border-none outline-none text-[#dddddd] flex-1 caret-green-400 animate-blink text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
          />
          {/* Botones en móvil */}
          <div className="flex items-center mt-2 sm:hidden gap-2">
            <button
              onClick={moveHistoryUp}
              className="p-2 rounded bg-gray-700 text-white text-lg"
            >
              ↑
            </button>
            <button
              onClick={moveHistoryDown}
              className="p-2 rounded bg-gray-700 text-white text-lg"
            >
              ↓
            </button>
            <button
              onClick={sendCommand}
              className="p-2 rounded bg-[#D72638] text-white text-lg"
            >
              Ejecutar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
