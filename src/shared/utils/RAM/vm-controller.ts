// src/checkers/vm-controller.ts
import { Memory, type Snapshot as RawSnapshot } from "./memoria/Memory";
import { CommandExecutor } from "./compilador/command-executor";
import {
  buildUiSnapshot,
  buildUiStack,
  buildUiHeap,
  buildUiRam,
  formatStack as fmtStack,
  formatHeap as fmtHeap,
  formatRam as fmtRam,
  type UiSnapshot,
  type UiFrame,
  type UiRamView,
  type UiHeapEntry,
} from "./snapshot-builder";

/** Resultado estándar para la UI (usa UiSnapshot). */
export type RunResult = {
  ok: boolean;
  message: string;       // ← mensaje neutro (sin emojis)
  snapshot: UiSnapshot;  // ← snapshot listo para frontend
  raw?: RawSnapshot;     // ← opcional: compat con Memory
};

function normalizeError(e: unknown): string {
  if (e instanceof Error) return e.message || String(e);
  return String(e);
}

export class VmController {
  private readonly mem: Memory;
  private readonly exec: CommandExecutor;

  constructor(mem: Memory = new Memory(64 * 1024)) {
    this.mem = mem;
    this.exec = new CommandExecutor(this.mem);
  }

  /** Ejecuta un comando y devuelve el snapshot “bonito” para la UI. */
  run(cmd: string): RunResult {
    try {
      const res = this.exec.execute(cmd);          // puede lanzar
      const uiSnap = buildUiSnapshot(this.mem);
      const raw = this.mem.snapshot();
      return { ok: res.ok, message: res.message, snapshot: uiSnap, raw };
    } catch (e) {
      // No rompas la UI: devuelve snapshot ACTUAL y el error normalizado
      const uiSnap = buildUiSnapshot(this.mem);
      const raw = this.mem.snapshot();
      return { ok: false, message: normalizeError(e), snapshot: uiSnap, raw };
    }
  }

  /** Snapshot completo para la UI (sin ejecutar nada). */
  getSnapshot(): UiSnapshot {
    return buildUiSnapshot(this.mem);
  }

  /** Compatibilidad: snapshot crudo de Memory. */
  getRawSnapshot(): RawSnapshot {
    return this.mem.snapshot();
  }

  // ─────────────────────────────────────────────────────────────
  // Vistas separadas (Stack / Heap / RAM) para la UI
  // ─────────────────────────────────────────────────────────────
  getUiStack(): UiFrame[] {
    return buildUiStack(this.mem);
  }

  getUiHeap(): UiHeapEntry[] {
    return buildUiHeap(this.mem);
  }

  getUiRam(): UiRamView {
    return buildUiRam(this.mem);
  }

  // ─────────────────────────────────────────────────────────────
  // Pretty printers (tests / consola)
  // ─────────────────────────────────────────────────────────────
  formatStack(): string {
    return fmtStack(this.getUiStack());
  }

  formatHeap(): string {
    return fmtHeap(this.getUiHeap());
  }

  formatRam(opts?: { from?: number; to?: number; maxRows?: number }): string {
    return fmtRam(this.getUiRam(), opts);
  }
}
