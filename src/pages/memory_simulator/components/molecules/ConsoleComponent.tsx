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

  // Autoscroll para siempre mostrar el último mensaje
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [history]);

  // Actualiza la respuesta del último comando en el historial
  useEffect(() => {
    if (history.length > 0) {
      setHistory((prevHistory) => {
        const newHistory = [...prevHistory];
        newHistory[newHistory.length - 1].response = outputMessage;
        newHistory[newHistory.length - 1].success = isSuccess;
        return newHistory;
      });
    }
  }, [outputMessage, isSuccess]);

  const executeCommand = (cmd: string) => {
    if (
      cmd.trim().toLowerCase() === "clear" ||
      cmd.trim().toLowerCase() === "cls"
    ) {
      setHistory([]);
      setInput("");
      return;
    }
    const commandText = `$ ${cmd}`;
    setHistory((prev) => [
      ...prev,
      { command: commandText, response: "", success: true },
    ]);
    onCommand(cmd.trim());
    setInput("");
  };

  // Funciones para moverse en el historial
  const moveHistoryUp = () => {
    if (history.length > 0) {
      const newIndex =
        historyIndex === -1
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInput(history[newIndex].command.replace("$ ", ""));
    }
  };

  const moveHistoryDown = () => {
    if (history.length > 0) {
      const newIndex =
        historyIndex === history.length - 1 ? -1 : historyIndex + 1;
      setHistoryIndex(newIndex);
      setInput(
        newIndex === -1 ? "" : history[newIndex].command.replace("$ ", "")
      );
    }
  };

  const sendCommand = () => {
    if (input.trim() !== "") {
      executeCommand(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Para PC: se usan las teclas
    if (e.key === "Enter" && input.trim() !== "") {
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

  // Ejecuta comando si se dispara Enter externamente (desde el tour)
  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;
    const handleManualEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter" && inputEl.value.trim() !== "") {
        e.preventDefault();
        executeCommand(inputEl.value);
        inputEl.value = "";
      }
    };
    inputEl.addEventListener("keydown", handleManualEnter);
    return () => inputEl.removeEventListener("keydown", handleManualEnter);
  }, []);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    // En móvil, la consola ocupa 20rem; en ≥sm, se ajusta a la altura del contenedor padre.
    <div className="w-full h-80 sm:h-full flex flex-col">
      {/* Caja de la consola con barra superior */}
      <div
        className="
          flex flex-col w-full h-full
          rounded-2xl
          shadow-xl shadow-black/40
          bg-gradient-to-tr from-[#0F0F0F] to-[#262626]
          border border-[#3A3A3A]
          hover:ring-1 hover:ring-[#D72638]/70
          transition-all
        "
      >
        {/* Barra Superior */}
        <div className="flex items-center justify-between bg-[#1F1F1F]/90 border-b border-[#2E2E2E] px-4 py-2 rounded-t-2xl">
          <span className="text-sm uppercase font-bold tracking-wider text-gray-300">
            Consola
          </span>
        </div>

        {/* Área de historial (scrollable) */}
        <div
          ref={consoleRef}
          className="flex-1 min-h-0 overflow-y-auto p-4 text-sm"
          onClick={focusInput}
          data-tour="consola"
        >
          {history.map((entry, index) => (
            <div key={index} className="mb-1">
              {/* Comando ingresado */}
              <div className="text-[#00ff98] font-medium">{entry.command}</div>
              {/* Respuesta */}
              {entry.response && (
                <div
                  className={entry.success ? "text-[#a8ffdd]" : "text-red-500"}
                >
                  → {entry.response}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Área del input */}
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
          {/* Botones para móviles */}
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
