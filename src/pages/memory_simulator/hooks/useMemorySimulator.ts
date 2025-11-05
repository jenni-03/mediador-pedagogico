// src/app/MemoryApp/hooks/useMemorySimulator.ts
import { useMemo, useState, useCallback } from "react";
import { Memory } from "../../../shared/utils/RAM/memoria/Memory";
import { VmController } from "../../../shared/utils/RAM/vm-controller";
import type { UiSnapshot } from "../../../shared/utils/RAM/snapshot-builder";
import { buildUiSnapshot } from "../../../shared/utils/RAM/snapshot-builder";

function normErr(e: unknown) {
  if (e instanceof Error) return e.message || String(e);
  return String(e);
}

export function useMemorySimulator(sizeBytes = 64 * 1024) {
  const memory = useMemo(() => new Memory(sizeBytes), [sizeBytes]);
  const vm = useMemo(() => new VmController(memory), [memory]);

  const [snapshot, setSnapshot] = useState<UiSnapshot>(() =>
    buildUiSnapshot(memory, {
      ram: { hideGuards: true, extraHiddenLabels: ["padding"] },
    })
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [animEvents] = useState<any[]>([]); // opcional

  const executeCommand = useCallback(
    (cmd: string) => {
      // Log del comando ejecutado
      setLogs((L) => [...L, `▶ ${cmd}`].slice(-500));

      try {
        const res = vm.run(cmd); // ya viene con try/catch interno, pero este try protege el propio hook
        setSnapshot(buildUiSnapshot(memory, { ram: { hideGuards: true, extraHiddenLabels: ["padding"] } }));

        // Prefijo aquí (no en VmController) para no duplicar iconos
        const line = res.ok ? `✅ ${res.message}` : `❌ ${res.message}`;
        setLogs((L) => [...L, line].slice(-500));
      } catch (e) {
        // Si algo se escapó, no caigas: logea y deja snapshot como estaba
        setLogs((L) => [...L, `❌ ${normErr(e)}`].slice(-500));
      }
    },
    [vm]
  );

  const clearLogs = useCallback(() => setLogs([]), []);

  return {
    memory,
    snapshot,
    vm,
    logs,
    animEvents,
    actions: { executeCommand, clearLogs },
  };
}
