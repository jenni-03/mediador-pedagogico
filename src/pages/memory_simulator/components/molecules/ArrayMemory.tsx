import { useEffect, useMemo, useState } from "react";
import { Consola } from "../../../../shared/utils/RAM/Consola";
import { motion, AnimatePresence } from "framer-motion";
import { VariableDetailsModal } from "../atoms/VariableDetailsModal";
import { DeleteConfirmationModal } from "../atoms/DeleteConfirmationModal";
import { ChangeTypeModal } from "../atoms/ChangeTypeModal";

/* ============================================================
 * Tipos y Props
 * ============================================================
 */

interface ArrayMemoryProps {
  searchTerm: string;
  consolaRef: React.RefObject<Consola>;
  memoryState: Record<string, any[]>;
  setMemoryState: (newState: Record<string, any[]>) => void;
}

/** Estructura mínima esperada para cada entrada del segmento "array". */
interface MemoryArrayEntry {
  address: string;
  name: string;
  value: any[]; // valores del arreglo
  // meta opcional si en el futuro agregas más datos
  meta?: Record<string, unknown>;
}

/* ============================================================
 * Helpers de tipos
 * ============================================================
 */

/**
 * Inferencia básica del tipo del elemento a partir de los valores JS.
 * - number: distingue entre int (todos enteros) y float (alguno no entero)
 * - boolean, string, object
 * - mezcla -> any
 * Ajusta "float" => "double" si tu RAM usa ese nombre.
 */
function inferElementType(values: any[]): string {
  if (!values || values.length === 0) return "any";
  if (values.every((v) => typeof v === "boolean")) return "boolean";
  if (values.every((v) => typeof v === "string")) return "char"; // o "string" según tu modelo

  if (values.every((v) => typeof v === "number" && Number.isFinite(v))) {
    const allInts = values.every((v) => Number.isInteger(v));
    return allInts ? "int" : "float"; // cambia a "double" si corresponde
  }

  if (
    values.every(
      (v) => v !== null && typeof v === "object" && !Array.isArray(v)
    )
  ) {
    return "struct"; // o "object" según tu modelo de RAM
  }

  return "any";
}

/**
 * Normaliza el tipo final a mostrar en UI:
 * - Si rawType ya es específico (p.ej. "int[]" o "boolean[]"), úsalo.
 * - Si rawType es "array" o viene vacío, arma "<elemType>[]".
 */
function resolveFinalArrayType(
  rawType: string | undefined,
  elemType: string
): string {
  if (rawType && rawType.toLowerCase() !== "array") return rawType;
  return `${elemType}[]`;
}

/**
 * Consulta a la consola el tipo de una dirección concreta.
 * Devuelve `undefined` si falla o no hay consola.
 */
function getTypeFromConsole(
  consola: Consola | null | undefined,
  address: string
): string | undefined {
  if (!consola) return undefined;
  const res = consola.ejecutarComando(`type address ${address}`);
  return res?.[0] ? String(res[1]) : undefined;
}

/**
 * Firma ligera para dependencias: evita JSON.stringify de todo el objeto.
 * Usa address y length para detectar cambios "importantes".
 */
function signatureForSegment(entries: MemoryArrayEntry[]): string {
  return entries
    .map((e) => `${e.address}:${Array.isArray(e.value) ? e.value.length : 0}`)
    .join("|");
}

/* ============================================================
 * Componente principal
 * ============================================================
 */

export function ArrayMemory({
  searchTerm,
  consolaRef,
  memoryState,
  setMemoryState,
}: ArrayMemoryProps) {
  // Segmento de memoria de arreglos
  const memorySegment = useMemo<MemoryArrayEntry[]>(
    () =>
      Array.isArray(memoryState["array"])
        ? (memoryState["array"] as MemoryArrayEntry[])
        : [],
    [memoryState]
  );

  // Estado de UI
  const [selectedEntry, setSelectedEntry] = useState<MemoryArrayEntry | null>(
    null
  );
  const [tempValue, setTempValue] = useState("");
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [addresses, setAddresses] = useState<Record<string, string[]>>({});
  const [types, setTypes] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [changeTypeTarget, setChangeTypeTarget] = useState<string | null>(null);

  // Firma ligera para el efecto
  const segSignature = useMemo(
    () => signatureForSegment(memorySegment),
    [memorySegment]
  );

  /**
   * Efecto: consulta SIZE/TYPE del bloque, resuelve direcciones de elementos
   * y deduce el tipo específico del arreglo (int[], boolean[], etc.)
   *
   * Estrategia de tipo:
   *  1) TYPE del bloque (puede venir como "array")
   *  2) TYPE del primer elemento (por address) si está disponible
   *  3) Inferencia por valores JS si 1/2 fallan
   */
  useEffect(() => {
    const consola = consolaRef.current ?? null;

    const newSizes: Record<string, string> = {};
    const newAddresses: Record<string, string[]> = {};
    const newTypes: Record<string, string> = {};

    for (const entry of memorySegment) {
      // 1) SIZE del bloque del arreglo
      const sizeRes = consola?.ejecutarComando(`size address ${entry.address}`);
      if (sizeRes?.[0]) newSizes[entry.address] = String(sizeRes[1]);

      // 2) TYPE del bloque del arreglo (podría ser "array")
      const rawType = getTypeFromConsole(consola, entry.address);

      // 3) Direcciones de cada elemento
      const addrs = (entry.value ?? []).map((_: any, idx: number) => {
        const res = consola?.ejecutarComando(`address of ${entry.name}_${idx}`);
        return res?.[0] ? String(res[1]) : "—";
      });
      newAddresses[entry.address] = addrs;

      // 4) Intento de tipo de elemento por consola (primer addr válido)
      const firstValidElemAddr = addrs.find((a) => a && a !== "—");
      const elemTypeFromConsole = firstValidElemAddr
        ? getTypeFromConsole(consola, firstValidElemAddr)
        : undefined;

      // 5) Inferencia por valores si consola no dio nada útil
      const elemTypeByInference = inferElementType(entry.value ?? []);

      // 6) Tipo final que verá el usuario
      const chosenElemType = elemTypeFromConsole ?? elemTypeByInference;
      const finalType = resolveFinalArrayType(rawType, chosenElemType);
      newTypes[entry.address] = finalType;
    }

    setSizes(newSizes);
    setAddresses(newAddresses);
    setTypes(newTypes);
  }, [segSignature, consolaRef]);

  /* ============================================================
   * Render
   * ============================================================
   */

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-7xl grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 p-4 sm:gap-5 sm:p-6">
        {memorySegment.length > 0 ? (
          memorySegment
            .filter((entry) =>
              searchTerm ? entry.address.includes(searchTerm) : true
            )
            .map((entry, index) => (
              <motion.div
                key={entry.address}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedEntry(entry);
                  setTempValue(JSON.stringify(entry.value));
                }}
                className="relative bg-gradient-to-br from-[#262626] to-[#1F1F1F]
                  p-5 rounded-2xl border border-[#2E2E2E]
                  shadow-xl shadow-black/40 hover:ring-2 hover:ring-[#D72638]/50
                  transition-all cursor-pointer"
              >
                {/* Botón: engranaje (cambiar tipo) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setChangeTypeTarget(entry.address);
                  }}
                  title="Cambiar tipo de dato"
                  className="absolute top-3 left-3 flex items-center gap-1
                    text-sm text-gray-300 hover:text-white hover:bg-[#D72638]
                    px-2 py-1 rounded-full transition duration-200 cursor-pointer"
                >
                  <span className="text-base">⚙️</span>
                </button>

                {/* Botón: eliminar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(entry.address);
                  }}
                  title="Eliminar variable"
                  className="absolute top-3 right-3 flex items-center gap-1
                    text-sm text-gray-300 hover:text-white hover:bg-[#D72638]
                    px-2 py-1 rounded-full transition duration-200 cursor-pointer"
                >
                  <span className="text-base">✖</span>
                </button>

                {/* ADDR y SIZE */}
                <div className="w-full mt-8 flex justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase text-white/90">
                      ADDR:
                    </span>
                    <span className="text-sm font-bold text-[#D72638]">
                      {entry.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase text-white/90">
                      SIZE:
                    </span>
                    <span className="text-sm font-bold text-[#F59E0B]">
                      {sizes[entry.address] ?? "…"}
                    </span>
                  </div>
                </div>

                {/* Nombre y tipo del arreglo */}
                <div className="mt-4">
                  <p className="text-lg font-bold uppercase truncate w-full px-2 text-[#E0E0E0]">
                    {entry.name}
                  </p>
                  <p className="text-sm font-medium text-[#A0A0A0] mb-2 px-2">
                    Tipo:{" "}
                    <span className="text-[#E0E0E0] font-semibold">
                      {types[entry.address] ?? "—"}
                    </span>
                  </p>
                </div>

                {/* Tabla de valores */}
                <div className="mt-4 w-full overflow-x-auto">
                  <table className="min-w-full border border-[#2E2E2E] text-sm rounded-xl overflow-hidden">
                    <thead className="bg-[#1F1F1F] text-[#D72638] text-xs uppercase tracking-wider">
                      <tr>
                        <th className="py-2 px-3 border-b border-[#2E2E2E]">
                          Dirección
                        </th>
                        <th className="py-2 px-3 border-b border-[#2E2E2E]">
                          Índice
                        </th>
                        <th className="py-2 px-3 border-b border-[#2E2E2E]">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(entry.value ?? []).map((val: any, idx: number) => (
                        <tr
                          key={idx}
                          className="hover:bg-[#2B2B2B] transition-all"
                        >
                          <td className="px-4 py-2 border-b border-[#2E2E2E] text-xs text-[#E0E0E0] font-mono tracking-wider">
                            {addresses[entry.address]?.[idx] ?? "—"}
                          </td>
                          <td className="px-3 py-2 border-b border-[#2E2E2E] text-center font-semibold text-[#D0D0D0]">
                            [{idx}]
                          </td>
                          <td className="px-3 py-2 border-b border-[#2E2E2E] text-center text-[#E0E0E0]">
                            {typeof val === "object"
                              ? JSON.stringify(val)
                              : String(val)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))
        ) : (
          <p className="text-[#A0A0A0] col-span-full text-center text-lg font-semibold">
            No hay arrays en este segmento.
          </p>
        )}
      </div>

      {/* Modales */}
      <AnimatePresence>
        {selectedEntry && (
          <VariableDetailsModal
            entry={selectedEntry}
            tempValue={tempValue}
            setTempValue={setTempValue}
            onClose={() => setSelectedEntry(null)}
            consolaRef={consolaRef}
            setMemoryState={setMemoryState}
            size={sizes[selectedEntry.address] ?? "Desconocido"}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmationModal
            address={deleteTarget}
            consolaRef={consolaRef}
            onClose={() => setDeleteTarget(null)}
            setMemoryState={setMemoryState}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {changeTypeTarget && (
          <ChangeTypeModal
            address={changeTypeTarget}
            consolaRef={consolaRef}
            onClose={() => setChangeTypeTarget(null)}
            setMemoryState={setMemoryState}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
