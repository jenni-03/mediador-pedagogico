import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VariableDetailsModalProps {
  entry: any;
  tempValue: string;
  setTempValue: (value: string) => void;
  onClose: () => void;
  consolaRef: React.RefObject<any>;
  size: string;
  setMemoryState: (newState: Record<string, any[]>) => void;
}

/* ============================================================
 * Helpers de tipos y consola
 * ============================================================
 */

/** Inferencia básica del tipo del elemento a partir de los valores JS. */
function inferElementType(values: any[]): string {
  if (!values || values.length === 0) return "any";
  if (values.every((v) => typeof v === "boolean")) return "boolean";
  if (values.every((v) => typeof v === "string")) return "char"; // usa "string" si tu RAM lo maneja así
  if (values.every((v) => typeof v === "number" && Number.isFinite(v))) {
    const allInts = values.every((v) => Number.isInteger(v));
    return allInts ? "int" : "float"; // cambia a "double" si corresponde
  }
  if (
    values.every(
      (v) => v !== null && typeof v === "object" && !Array.isArray(v)
    )
  )
    return "struct"; // o "object" según tu modelo
  return "any";
}

/** Si el rawType ya es específico, úsalo; si es "array" o vacío, arma "<elemType>[]". */
function resolveFinalArrayType(
  rawType: string | undefined,
  elemType: string
): string {
  if (rawType && rawType.toLowerCase() !== "array") return rawType;
  return `${elemType}[]`;
}

/** Consulta "type address <addr>" a la consola; undefined si falla. */
function getTypeFromConsole(
  consola: any | null | undefined,
  address: string
): string | undefined {
  if (!consola) return undefined;
  const res = consola.ejecutarComando(`type address ${address}`);
  return res?.[0] ? String(res[1]) : undefined;
}

/** Extrae el tipo base de algo como "int[]", "boolean[]" → "int", "boolean". */
function baseFromResolvedType(resolved: string): string {
  const m = resolved.match(/^(.+)\[\]$/);
  return m ? m[1] : resolved;
}

/* ============================================================
 * Modal
 * ============================================================
 */

export function VariableDetailsModal({
  entry,
  tempValue,
  setTempValue,
  onClose,
  consolaRef,
  size,
  setMemoryState,
}: VariableDetailsModalProps) {
  const consola = consolaRef.current ?? null;

  // Estado interno
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [arrayState, setArrayState] = useState<any[]>([]);
  const [elemAddresses, setElemAddresses] = useState<string[]>([]);
  const [resolvedType, setResolvedType] = useState<string>(entry?.type ?? "—");

  // ¿Es array?
  const isArray = String(entry?.type ?? "").toLowerCase() === "array";
  const emoji = isArray ? "📚" : "🧾";
  const title = isArray ? "Detalles del Array" : "Detalles de la Variable";

  /**
   * Determina el "tipo base" para parsear inputs:
   * - Si es array, usar el tipo base de `resolvedType` (ej. "boolean" para "boolean[]").
   * - Si no, usar `entry.type`.
   */
  const baseType: string = useMemo(() => {
    if (isArray) return baseFromResolvedType(resolvedType);
    return String(entry?.type ?? "string");
  }, [isArray, resolvedType, entry?.type]);

  /** Parser por tipo base: convierte el string del input al tipo correspondiente. */
  const parseByType = (value: string) => {
    switch (baseType) {
      case "int": {
        const n = parseInt(value);
        return Number.isNaN(n) ? null : n;
      }
      case "float": { // o "double"
        const f = parseFloat(value);
        return Number.isNaN(f) ? null : f;
      }
      case "boolean":
        return value === "true" || value === "false" ? value === "true" : null;
      case "char":
      case "string":
      default:
        return value;
    }
  };

  /**
   * Efecto principal: cuando cambia "entry", sincroniza:
   * - contenido del array
   * - direcciones de cada elemento
   * - tipo específico del array (boolean[], int[], …)
   * - valor temporal (para variables escalares)
   */
  useEffect(() => {
    if (!entry) return;

    // 1) Cargar valores del array / valor temporal
    if (isArray && Array.isArray(entry.value)) {
      setArrayState(entry.value);
      setTempValue(JSON.stringify(entry.value));
    } else {
      setTempValue(String(tempValue ?? entry.value ?? ""));
    }

    // 2) Resolver direcciones de elementos (solo arrays)
    if (isArray && Array.isArray(entry.value)) {
      const addrs = entry.value.map((_: any, idx: number) => {
        const res = consola?.ejecutarComando(`address of ${entry.name}_${idx}`);
        return res?.[0] ? String(res[1]) : "—";
      });
      setElemAddresses(addrs);
    } else {
      setElemAddresses([]);
    }

    // 3) Resolver tipo específico a mostrar:
    //    - rawType del bloque: type address <entry.address>
    //    - elemType de primer elemento válido
    //    - inferencia por valores si falla lo anterior
    const rawType = getTypeFromConsole(consola, entry.address);
    let elemTypeFromConsole: string | undefined;
    if (isArray && Array.isArray(entry.value)) {
      // busca primer address válido para consultar su tipo
      const firstValid = (entry.value as any[]).findIndex((_, i) => {
        const res = consola?.ejecutarComando(`address of ${entry.name}_${i}`);
        return res?.[0];
      });
      if (firstValid >= 0) {
        const resAddr = consola?.ejecutarComando(
          `address of ${entry.name}_${firstValid}`
        );
        if (resAddr?.[0]) {
          const typeElem = getTypeFromConsole(consola, String(resAddr[1]));
          if (typeElem) elemTypeFromConsole = typeElem;
        }
      }
    }
    const elemTypeByInference = isArray
      ? inferElementType(entry.value ?? [])
      : String(entry?.type ?? "string");
    const finalType = isArray
      ? resolveFinalArrayType(
          rawType,
          elemTypeFromConsole ?? elemTypeByInference
        )
      : (rawType ?? String(entry?.type ?? "string"));

    setResolvedType(finalType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, isArray]);

  /** Actualiza un elemento del array con parseo por tipo base. */
  const updateArrayValue = (index: number, newValue: string) => {
    const parsed = parseByType(newValue);
    const updated = [...arrayState];
    updated[index] = parsed;
    setArrayState(updated);
  };

  /** Aceptar cambios (array o escalar) y persistir en memoria vía consola. */
  const handleAccept = () => {
    if (isArray) {
      const castedArray = arrayState.map((val) => parseByType(String(val)));
      const invalidIndex = castedArray.findIndex((v) => v === null);
      if (invalidIndex !== -1) {
        setFeedback({
          success: false,
          message: `Elemento ${invalidIndex} inválido: "${arrayState[invalidIndex]}" no es válido para ${baseType}.`,
        });
        return;
      }

      const result = consola?.ejecutarComando(
        `set address ${entry.address} value ${JSON.stringify(castedArray)}`
      );

      if (result) {
        const [success, message, updatedState] = result;
        setFeedback({ success, message });
        if (success) {
          setMemoryState(updatedState);
          setTimeout(() => {
            setFeedback(null);
            onClose();
          }, 1500);
        } else {
          setTimeout(() => setFeedback(null), 2500);
        }
      }
    } else {
      const result = consola?.ejecutarComando(
        `set address ${entry.address} value ${tempValue}`
      );
      if (result) {
        const [success, message, updatedState] = result;
        setFeedback({ success, message });
        if (success) {
          setMemoryState(updatedState);
          setTimeout(() => {
            setFeedback(null);
            onClose();
          }, 1500);
        } else {
          setTimeout(() => setFeedback(null), 2500);
        }
      }
    }
  };

  /* ============================================================
   * Render
   * ============================================================
   */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[1000]"
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.2 }}
        className="bg-[#1A1A1A] text-[#E0E0E0] p-6 rounded-2xl shadow-2xl border border-red-400 w-[90%] max-w-2xl"
      >
        <h2 className="text-2xl font-bold text-red-500 mb-5 text-center flex items-center justify-center gap-2">
          {emoji} {title}
        </h2>

        {/* Encabezado de metadatos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-5 text-gray-300">
          <p>
            <span className="font-semibold text-red-400">🔹 Tipo:</span>{" "}
            {resolvedType}
          </p>
          <p>
            <span className="font-semibold text-red-400">🏷️ Nombre:</span>{" "}
            {entry.name}
          </p>
          <p>
            <span className="font-semibold text-red-400">📍 Dirección base:</span>{" "}
            {entry.address}
          </p>
          <p>
            <span className="font-semibold text-red-400">📦 Tamaño:</span>{" "}
            {size}
          </p>
        </div>

        {/* Escalar vs Array */}
        {!isArray ? (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-red-400 mb-2">
              ✏️ Nuevo Valor:
            </label>
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-[#333] bg-[#262626] text-[#F0F0F0] outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            />
          </div>
        ) : (
          <div className="mb-4 overflow-x-auto border border-[#2E2E2E] rounded-xl">
            <table className="min-w-full text-sm text-left text-[#E0E0E0]">
              <thead className="bg-[#2E2E2E] text-red-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 border-b border-[#444]">
                    Dirección
                  </th>
                  <th className="px-4 py-2 border-b border-[#444]">Índice</th>
                  <th className="px-4 py-2 border-b border-[#444]">Valor</th>
                </tr>
              </thead>
              <tbody>
                {arrayState.map((val: any, i: number) => (
                  <tr key={i} className="even:bg-[#1F1F1F] odd:bg-[#262626]">
                    <td className="px-4 py-2 border-b border-[#333] text-xs text-[#999] font-mono">
                      {elemAddresses[i] ?? "—"}
                    </td>
                    <td className="px-4 py-2 border-b border-[#333] text-xs text-[#999] font-mono">
                      {i}
                    </td>
                    <td className="px-4 py-2 border-b border-[#333]">
                      <input
                        type="text"
                        value={String(val)}
                        onChange={(e) => updateArrayValue(i, e.target.value)}
                        className="w-full px-2 py-1 rounded-md border border-[#444] bg-[#2A2A2A] text-[#E0E0E0] focus:outline-none focus:ring-1 focus:ring-red-500 text-sm shadow-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 px-4 py-2 rounded-xl text-sm font-medium text-center transition-all duration-300 ${
                feedback.success
                  ? "bg-green-600/20 text-green-400 border border-green-600"
                  : "bg-red-600/20 text-red-400 border border-red-600"
              } overflow-y-auto max-h-24 break-all`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botones */}
        <div className="flex justify-end gap-2 mt-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold"
          >
            Cerrar
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAccept}
            className="px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-full text-sm font-semibold"
          >
            Aceptar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
