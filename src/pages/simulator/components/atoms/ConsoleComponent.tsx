import { useEffect, useRef, useState } from "react";
import { commandRules } from "../../../../shared/constants/console/commandRules";
import { useAnimation } from "../../../../shared/hooks/useAnimation";
import { parseCommand } from "../../../../shared/constants/console/parseCommand";
import { AnimatedButtonModal } from "../../../../shared/components/AnimatedButtonModal";


export const structureNames: Record<string, string> = {
  secuencia: "se",
  pila: "pila",
  cola: "cola",
  "cola de prioridad": "colaP",
  tabla_hash: "th",
  lista_enlazada: "le",
  arbol_binario: "arbolBi",
  arbol_binario_busqueda: "arbolBB",
  arbol_avl: "arbolA",
  arbol_rojinegro: "arbolRN",
};

interface ConsoleComponentProps {
  structureType: string;
  onCommand: (command: string[], isValid: boolean) => void;
  error: { message: string; id: number } | null;
  structurePrueba: any;
}

export function ConsoleComponent({
  structureType,
  onCommand,
  error,
  structurePrueba,
}: ConsoleComponentProps) {
  const [history, setHistory] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]); // Solo comandos válidos
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isCreated, setIsCreated] = useState<boolean>(false);

  // Estado para el modal
  const [showCreationModal, setShowCreationModal] = useState(false);

  const { isAnimating, setIsAnimating } = useAnimation();

  const inputRef = useRef<HTMLInputElement>(null);

  // Detectar creación de la estructura
  useEffect(() => {
    if (structurePrueba && structurePrueba.getTamanio() > 0 && !isCreated) {
      setIsCreated(true);
      setShowCreationModal(true);
    }
  }, [structurePrueba?.getTamanio()]);

  useEffect(() => {
    if (!isAnimating && inputRef.current) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus(); // Hace que el input obtenga el foco después de 1 segundo
      }, 1000); // 1000 ms = 1 segundo

      return () => clearTimeout(timeout); // Limpia el timeout si el componente se desmonta o el estado cambia
    }
  }, [isAnimating]);

  useEffect(() => {
    if (error) {
      // setVisibleError(error?.message);
      setHistory([...history, `Error: ${error.message}`]);
      setIsAnimating(false); // Detener la animación
    }
  }, [error?.id]);

  // TODO: Cambiar el nombre de las estructuras, revisar si esos son los correctos
  const structuresRequiringCreate = ["secuencia, tabla_hash"];

  // Función para procesar comando (reutilizable)
  const processCommand = (
    commandValue: string,
    isFromTutorial: boolean = false
  ) => {
    if (commandValue.trim().toLowerCase() === "clear") {
      setHistory([]);
      setInput("");
      return;
    }
    console.log(isFromTutorial);

    const expectedPrefix = structureNames[structureType];

    const parsed = parseCommand(commandValue.trim(), structureType, {
      isCreated, // ← clave: solo obliga prefijo cuando ya fue creada
      expectedPrefix,
      disallowPrefixBeforeCreation: true, // Para NO permitir prefijo antes de crear
      structurePrueba,
    });

    // const parsed = parseCommand(commandValue.trim(), structureType);

    if ("error" in parsed) {
      onCommand([], false);
      setHistory((prev) => [
        ...prev,
        `$ ${commandValue}`,
        `Error: ${parsed.error}`,
      ]);
      setCommandHistory((prev) => [...prev, commandValue.trim()]);
      setInput("");
      setHistoryIndex(-1);
      return;
    }

    const parts = parsed;
    const commandValidation = commandRules[structureType](parts);

    // Verifica si el comando es válido según las reglas de la estructura, es decir, es un booleano
    if (typeof commandValidation === "boolean") {
      if (commandValidation) {
        const command = parts[0]?.toLowerCase();

        // Verificar si la estructura necesita "create"
        const needsCreate = structuresRequiringCreate.includes(structureType);

        // Caso 1: Si la estructura no ha sido creada y el comando es distinto a create
        if (needsCreate && !isCreated && command !== "create") {
          onCommand([], false);
          setHistory((prev) => [
            ...prev,
            `$ ${commandValue}`,
            "Error: Debe crear la estructura primero con 'create'",
          ]);
          setCommandHistory((prev) => [...prev, commandValue.trim()]);
        }
        //Caso 2: Si la estructura ya fue creada y el comando es clean
        else if (needsCreate && isCreated && command == "clean") {
          onCommand(parsed, true);
          setHistory((prev) => [
            ...prev,
            `$ ${commandValue}`,
            "Comando válido, procesando...",
          ]);
          setCommandHistory((prev) => [...prev, commandValue.trim()]);
          setIsCreated(false); // Marcar como no creada
        }
        //Caso 3: Cuando es cualquier comando, excepto clean en el caso de que la estructura ya fue creada
        else {
          if (command == "create") {
            setIsCreated(true); // Marcar como creada
            setShowCreationModal(true);
          }
          if (isCreated && command == "clean") {
            setIsCreated(false); // Marcar como no creada
          }

          onCommand(parsed, true);

          setHistory((prev) => [
            ...prev,
            `$ ${commandValue}`,
            "Comando válido, procesando...",
          ]);
          setCommandHistory((prev) => [...prev, commandValue.trim()]);
        }
      } else {
        onCommand([], false);
        setHistory((prev) => [
          ...prev,
          `$ ${commandValue}`,
          "Error: Comando no válido",
        ]);
        setCommandHistory((prev) => [...prev, commandValue.trim()]);
      }
    }
    // Verifica si el comando es inválido según las reglas de la estructura, es decir, es un objeto con un mensaje
    else {
      onCommand([], false);
      setHistory((prev) => [
        ...prev,
        `$ ${commandValue}`,
        `Error: ${commandValidation.message}`,
      ]);
      setCommandHistory((prev) => [...prev, commandValue.trim()]);
    }

    setInput("");
    setHistoryIndex(-1); // Reiniciamos el índice del historial
  };

  // Manejo de Enter para el caso del tutorial
  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const handleManualEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter" && inputEl.value.trim() !== "") {
        // Solo procesar si NO es un evento trusted (viene del tutorial)
        if (!e.isTrusted) {
          e.preventDefault();
          e.stopPropagation();
          processCommand(inputEl.value.trim(), true);
          inputEl.value = "";
        }
      }
    };

    inputEl.addEventListener("keydown", handleManualEnter);
    return () => inputEl.removeEventListener("keydown", handleManualEnter);
  }, [structureType, history, commandHistory, isCreated]); // Agregamos dependencias necesarias

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isAnimating) return;

    // Solo procesar si es un evento trusted (del usuario real)
    if (!e.nativeEvent.isTrusted) return;

    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      processCommand(input.trim(), false);
    }
    // Manejo de Flecha Arriba (recorre solo commandHistory)
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    }
    // Manejo de Flecha Abajo
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === commandHistory.length - 1 ? -1 : historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(newIndex === -1 ? "" : commandHistory[newIndex]);
      }
    }
  };

  return (
    <div className="flex-1 bg-[#101014] text-white mr-2 rounded-xl font-mono">
      {history.map((cmd, index) => (
        <div
          key={index}
          className={
            cmd.startsWith("Error:")
              ? "text-red-500"
              : cmd == "Comando válido, procesando..."
                ? "text-blue-500"
                : "text-white"
          }
        >
          {cmd}
        </div>
      ))}

      <div className="flex">
        <span className="text-white">$</span>
        <input
          type="text"
          className="bg-transparent border-none outline-none text-white ml-2 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnimating}
          ref={inputRef}
          autoFocus
          spellCheck={false}
          data-tour="inputConsola"
        />
      </div>

      {/* Modal */}
      {showCreationModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1E1E22] p-6 rounded-2xl shadow-xl text-center w-96">
            <h2 className="text-xl font-bold text-white mb-4">
              ✅ Objeto creado
            </h2>
            <p className="text-gray-300 mb-6">
              Se creó el objeto {structureType}{" "}
              <span className="font-mono">
                "{structureNames[structureType] || "se"}"
              </span>
            </p>
            <AnimatedButtonModal
              bgColor="#D72638"
              text="Aceptar"
              onClick={() => setShowCreationModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
