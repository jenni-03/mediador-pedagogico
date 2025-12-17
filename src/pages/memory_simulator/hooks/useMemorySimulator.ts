import { useMemo, useState, useCallback, useEffect } from "react";
import { Memory } from "../../../domain/RAM/memoria/Memory";
import { VmController } from "../../../domain/RAM/vm-controller";
import type { UiSnapshot } from "../../../domain/RAM/snapshot-builder";

function normErr(e: unknown) {
  if (e instanceof Error) return e.message || String(e);
  return String(e);
}

export function useMemorySimulator(sizeBytes = 64 * 1024) {
  // Fuente de verdad del modelo
  const memory = useMemo(() => new Memory(sizeBytes), [sizeBytes]);
  const vm = useMemo(() => new VmController(memory), [memory]);

  // Opciones de RAM (oculta guards y "padding" siempre)
  const ramOpts = useMemo(
    () => ({
      ram: { hideGuards: true, extraHiddenLabels: ["padding"] as string[] },
    }),
    []
  );

  // Estado UI
  const [snapshot, setSnapshot] = useState<UiSnapshot>(() =>
    vm.getSnapshot(ramOpts)
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [animEvents] = useState<unknown[]>([]); // placeholder: cuando definas eventos, tipa esto

  // Si cambia memory/vm (p.ej. por sizeBytes), resincroniza snapshot
  useEffect(() => {
    setSnapshot(vm.getSnapshot(ramOpts));
    // opcional: limpiar logs para un arranque "limpio"
    setLogs([]);
  }, [vm, ramOpts]);

  const executeCommand = useCallback(
    (cmd: string) => {
      const c = cmd.trim();
      if (!c) return;

      // Log del comando
      setLogs((L) => [...L, `▶ ${c}`].slice(-500));

      try {
        // Ejecuta y usa el snapshot que ya construye VmController con opciones
        const res = vm.run(c, ramOpts);
        setSnapshot(res.snapshot);

        // Mensaje (los íconos los pones aquí, el mensaje de VmController es neutro)
        const line = res.ok ? `✅ ${res.message}` : `❌ ${res.message}`;
        setLogs((L) => [...L, line].slice(-500));
      } catch (e) {
        // Cualquier fuga: log sin romper la UI
        setLogs((L) => [...L, `❌ ${normErr(e)}`].slice(-500));
      }
    },
    [vm, ramOpts]
  );

  const clearLogs = useCallback(() => setLogs([]), []);

  // 🔴 Reset completo de la simulación (botón "Limpiar RAM")
  const reset = useCallback(() => {
    try {
      // Limpia stack, heap y RAM (y recrea null-guard + frame global)
      memory.clearAll();

      // Resincroniza snapshot desde cero
      const snap = vm.getSnapshot(ramOpts);
      setSnapshot(snap);

      // Deja rastro en el log (pero NO borra el historial)
      setLogs((L) =>
        [...L, "🧹 Memoria reiniciada: stack, heap y RAM limpios."].slice(-500)
      );
    } catch (e) {
      setLogs((L) => [...L, `❌ Error al reiniciar: ${normErr(e)}`].slice(-500));
    }
  }, [memory, vm, ramOpts]);

  return {
    memory,
    vm,
    snapshot,
    logs,
    animEvents,
    actions: {
      executeCommand,
      clearLogs,
      reset, // 👈 aquí queda expuesto para el botón
    },
  };
}
