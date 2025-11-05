// src/checkers/snapshot-stack.demo.ts
// -----------------------------------------------------------------------------
// Demo: crea un array de String y muestra por separado Stack, Heap y RAM
// Ejecuta con: npx tsx src/checkers/snapshot-stack.demo.ts
// -----------------------------------------------------------------------------

import { VmController } from "./vm-controller";

type AnyObj = Record<string, unknown>;
const vm = new VmController();

// Helpers de impresión (presentacionales)
function printStack(stack: any[]) {
  console.log("STACK:");
  for (const f of stack ?? []) {
    const id = (f as AnyObj)?.id ?? "?";
    const name = (f as AnyObj)?.name ?? "?";
    console.log(` - frame#${id} "${name}"`);

    const slots = (f as AnyObj)?.slots as any[] | undefined;
    if (!slots || slots.length === 0) {
      console.log("    (sin variables)");
      continue;
    }

    for (const v of slots) {
      const lines = JSON.stringify(v, null, 2).split("\n");
      console.log("    • var:");
      for (const ln of lines) console.log("      " + ln);
    }
  }
  console.log();
}

function printHeap(heap: any[]) {
  console.log("HEAP:");
  if (!heap?.length) {
    console.log(" (vacío)\n");
    return;
  }
  for (const e of heap) {
    // resumen arriba + detalle abajo
    const id = (e as AnyObj)?.id ?? "?";
    const kind = (e as AnyObj)?.kind ?? "?";
    const addr = (e as AnyObj)?.addr ?? "?";
    const rc = (e as AnyObj)?.refCount ?? "?";
    console.log(` - heap#${id} • ${kind} @ ${addr} • rc=${rc}`);

    const lines = JSON.stringify(e, null, 2).split("\n");
    for (const ln of lines) console.log("    " + ln);
  }
  console.log();
}

function printRam(ram: any, maxRows = 16) {
  console.log("RAM:");
  console.log(
    ` used=${ram.used} / capacity=${ram.capacity} (${ram.from}..${ram.to})`
  );
  const rows = (ram.rows as any[])?.slice(0, maxRows) ?? [];
  if (rows.length === 0) {
    console.log(" (sin filas)\n");
    return;
  }
  for (const r of rows) {
    const lbl = r.labels?.length ? `  ${r.labels.join(", ")}` : "";
    console.log(`  ${r.addr}: ${r.hex}${lbl}`);
    if (r.allocs?.length) {
      for (const a of r.allocs) {
        console.log(
          `    alloc at ${a.at} size=${a.size}${a.label ? ` "${a.label}"` : ""}`
        );
      }
    }
  }
  console.log();
}

// Asserts ligeros para verificar el contrato (hex, rows, etc.)
const HEX8 = /^0x[0-9a-f]{8}$/i;
function softAssert(name: string, cond: boolean) {
  if (cond) console.log(`  ✅ ${name}`);
  else console.log(`  ❌ ${name}`);
}

function verifyContract(snap: any) {
  console.log("VERIFICACIÓN DE CONTRATO:");
  // Stack: al menos un frame y direcciones hex en primitivos
  const frames = snap.stack as any[];
  const hasFrame = Array.isArray(frames) && frames.length > 0;
  softAssert("stack tiene frames", hasFrame);

  if (hasFrame) {
    const slots = (frames[0]?.slots as any[]) ?? [];
    const prim = slots.find((s) => s.kind === "prim");
    const ref = slots.find((s) => s.kind === "ref");
    softAssert("frame[0] tiene algún prim o ref", !!(prim || ref));
    if (prim) {
      softAssert("prim.addr es hex8", HEX8.test(prim.addr));
      softAssert("prim.range.from es hex8", HEX8.test(prim.range?.from));
      softAssert("prim.range.to es hex8", HEX8.test(prim.range?.to));
    }
    if (ref) {
      softAssert("ref.refAddr es hex8", HEX8.test(ref.refAddr));
    }
  }

  // Heap: si existe string/array, que traiga campos básicos
  const heap = snap.heap as any[];
  softAssert("heap es array (puede estar vacío)", Array.isArray(heap));
  if (heap.length) {
    const h0 = heap[0];
    softAssert("heap[0].addr es hex8", HEX8.test(h0.addr ?? ""));
  }

  // RAM: rows sin función hexDump
  const ram = snap.ram;
  softAssert("ram.rows existe", Array.isArray(ram.rows));
  softAssert("ram.from es hex8", HEX8.test(ram.from ?? ""));
  softAssert("ram.to es hex8", HEX8.test(ram.to ?? ""));
  console.log();
}

(async () => {
  console.log(`\n▶ Ejecutando: String[] meses = {"Ene", "Feb", null};`);
  const res = vm.run(`String[] meses = {"Ene", "Feb", null};`);
  console.log(res.ok ? "  ✅ OK" : "  ❌ ERROR");
  console.log("  mensaje:", res.message, "\n");

  const snap = res.snapshot;

  // Impresiones separadas
  printStack(snap.stack as any[]);
  printHeap(snap.heap as any[]);
  printRam(snap.ram, 24);

  // Verificación ligera del contrato del snapshot
  verifyContract(snap);

  console.log("--- Fin de la demo de snapshot ---\n");
})();
