// src/shared//utils/RAM/memoria/memory.ts
// ============================================================================
// Memory: orquestador Stack ↔ Heap ↔ RAM (ByteStore)
// ----------------------------------------------------------------------------
// - No define layouts: delega TODOS los bytes a `Layout`.
// - Mantiene refCounts en Heap cuando crea/reasigna referencias.
// - El Stack guarda slots (valor por dirección o referencia por puntero lógico).
// - Snapshot listo para la UI (RAM es la fuente de verdad).
// ============================================================================

import { ByteStore } from "./byte-store";
import { Layout, PrimitiveType, SIZES, sizeOf } from "./layout";
import { Stack, Slot, isRefSlot } from "./stack";
import {
  Heap,
  type ArrayRef32Meta,
  type ArrayInlinePrimMeta,
  type ObjectCompactMeta,
} from "./heap";
import { TypeMismatchError } from "./errors";
import type { Addr } from "./byte-store";
import type { MemType } from "./memtype";
import { Prim, Arr, Obj, isString as isStr } from "./memtype";

export interface Snapshot {
  stack: Array<{ id: number; name: string; slots: Slot[] }>;
  heap: ReturnType<Heap["list"]>;
  ram: ReturnType<ByteStore["dump"]>; // legacy shape (hex). UI nueva puede usar dumpRows() directo del ByteStore si prefieres.
  used: number;
  capacity: number;
}

export type TypeLikeSummary =
  | { category: "prim"; type: PrimitiveType }
  | { category: "string" }
  | { category: "array-prim"; elem: PrimitiveType }
  | { category: "array-string" }
  | {
      category: "array-object";
      schema: Array<{ key: string; type: PrimitiveType | "ptr32" }>;
    }
  | {
      category: "object";
      schema: Array<{ key: string; type: PrimitiveType | "ptr32" }>;
    };

export class Memory {
  private ram: ByteStore;
  private stack = new Stack();
  private heap = new Heap();
  private readonly NULL_GUARD = 16;

  constructor(sizeBytes: number = 1024 * 64) {
    this.ram = new ByteStore(sizeBytes);
    // Reserva inicial para representar 0x0000… como "zona inválida" (null-guard).
    this.ram.allocAligned(this.NULL_GUARD, this.NULL_GUARD, "null guard");
    this.stack.push("global");
  }

  /** 🔴 Limpia completamente la memoria: RAM, Stack y Heap, y vuelve al estado inicial. */
  clearAll() {
    const size = this.ram.capacity();

    // Recrear RAM con mismo tamaño
    this.ram = new ByteStore(size);

    // Resetear estructuras de alto nivel
    this.stack = new Stack();
    this.heap = new Heap();

    // Volver a reservar el null-guard
    this.ram.allocAligned(this.NULL_GUARD, this.NULL_GUARD, "null guard");

    // Volver a crear el frame global
    this.stack.push("global");
  }

  // ==========================================================================
  // Frames
  // ==========================================================================
  pushFrame(name: string) {
    return this.stack.push(name);
  }

  popFrame() {
    const f = this.stack.pop();
    if (!f) return;
    // Al salir del frame: dec() de todas las referencias vivas en él.
    for (const slot of f.slots.values()) {
      if (
        slot.kind === "ref" &&
        slot.refAddr !== 0 &&
        this.heap.has(slot.refAddr)
      ) {
        this.heap.dec(slot.refAddr);
      }
    }
  }

  // ==========================================================================
  // Helpers de asignación de slots en el Stack (maneja refCount)
  // ==========================================================================
  /** Inserta o reemplaza un slot en el frame top, manejando dec() del anterior si era ref. */
  private upsertSlot(name: string, newSlot: Slot) {
    const top = this.stack.top();
    if (!top) throw new Error("No stack frame");
    const prev = top.find(name);

    // Si el anterior era referencia viva → dec
    if (
      prev &&
      prev.kind === "ref" &&
      prev.refAddr !== 0 &&
      this.heap.has(prev.refAddr)
    ) {
      this.heap.dec(prev.refAddr);
    }

    // Normaliza para que el nombre del slot coincida exactamente con la variable.
    const slotToStore: Slot = { ...newSlot, name };
    top.upsert(slotToStore);
  }

  /** Resuelve variable por nombre recorriendo la pila (top → bottom). */
  private resolveSlot(name: string): Slot | undefined {
    return this.stack.resolve(name);
  }

  // ==========================================================================
  // DECLARACIÓN (reserva sin escribir datos)
  // ==========================================================================
  /**
   * Declara un primitivo como en `int x;` reservando bytes sin tocar el contenido.
   * RAM: ocupado por `alloc` y visible en `dumpRows().allocations`.
   */
  declarePrimitive(name: string, type: PrimitiveType) {
    if (this.existsInCurrentFrame(name)) {
      return [false, this.dupMsg(name)] as const;
    }
    const w = Layout.allocPrimitiveReserve(this.ram, type, `prim ${name}#decl`);
    this.upsertSlot(name, { name, kind: "prim", type, valueAddr: w.addr });
    return [true, `decl ${type} ${name} @0x${w.addr.toString(16)}`] as const;
  }

  /**
   * Declara un array de tamaño fijo (Java: `new T[n]`) y NO escribe datos.
   * - elem prim no-string → inline-prim: header + bloque contiguo reservado.
   * - string/objeto/array  → ref32: header + tabla u32 reservada (punteros 0 por defecto).
   */
  declareArray(
    name: string,
    elem: MemType, // típicamente Arr(Prim("int")).elem
    length: number,
    mode: "auto" | "inline-prim" | "ref32" = "auto"
  ) {
    if (this.existsInCurrentFrame(name)) {
      return [false, this.dupMsg(name)] as const;
    }

    const isInlinePrim =
      mode === "inline-prim" ||
      (mode === "auto" && elem.tag === "prim" && elem.name !== "string");

    if (isInlinePrim) {
      if (!(elem.tag === "prim" && elem.name !== "string")) {
        throw new Error("inline-prim solo admite primitivos no-string");
      }
      const r = Layout.allocArrayInlinePrimReserve(
        this.ram,
        elem.name,
        length,
        `arr ${name}#decl`
      );
      this.heap.addArrayInlinePrim(
        r.addr,
        {
          length,
          dataPtr: r.dataPtr,
          elemType: elem.name,
          elemSize: sizeOf(elem.name),
        },
        `arr(${name})`
      );
      this.upsertSlot(name, { name, kind: "ref", refAddr: r.addr });
      return [
        true,
        `array ${name} -> @0x${r.addr.toString(16)} (len=${length})`,
      ] as const;
    }

    // ref32 (strings/objetos/anidados)
    const r = Layout.allocArrayRef32Reserve(
      this.ram,
      length,
      `arr ${name}#decl`
    );
    this.heap.addArrayRef32(
      r.addr,
      { length, dataPtr: r.tablePtr, elem },
      `arr(${name})`
    );
    this.upsertSlot(name, { name, kind: "ref", refAddr: r.addr });
    return [
      true,
      `array ${name} -> @0x${r.addr.toString(16)} (len=${length})`,
    ] as const;
  }

  // ==========================================================================
  // Escritura recursiva por MemType (principal)
  // ==========================================================================
  /**
   * API principal para crear/actualizar una variable en el stack.
   * Crea en RAM lo necesario (vía Layout) y registra el nodo en Heap si es compuesto.
   * Esta ruta **sí escribe** los datos (inicializadores).
   */
  storeValue(
    name: string,
    type: MemType,
    value: any,
    opts?: { layout?: "compact" | "dispersed"; mustBeNew?: boolean }
  ) {
    if (opts?.mustBeNew && this.existsInCurrentFrame(name)) {
      return [false, this.dupMsg(name)] as const;
    }
    const res = this.allocDeep(type, value, `var ${name}`, opts);
    this.upsertSlot(name, res.slot);
    return [true, `ok ${name}`] as const;
  }

  /**
   * Crea en RAM según el MemType (con escritura de datos).
   * - prim no-string → PRIM slot por valor (valueAddr)
   * - string         → header UTF-16; HEAP; REF slot a header
   * - array          → inline-prim | ref32 (strings/objetos/nested)
   * - object         → compacto (recomendado) o disperso (legacy)
   */
  private allocDeep(
    t: MemType,
    v: any,
    label?: string,
    opts?: { layout?: "compact" | "dispersed" }
  ): { slot: Slot } {
    // ---------- 1) PRIMITIVO NO-STRING: por VALOR ----------
    if (t.tag === "prim" && t.name !== "string") {
      const w = Layout.writePrimitive(this.ram, t.name, v, label);
      return {
        slot: {
          name: label ?? "tmp",
          kind: "prim",
          type: t.name,
          valueAddr: w.addr,
        },
      };
    }

    // ---------- 2) STRING: header UTF-16 + Heap + REF ----------
    if (t.tag === "prim" && t.name === "string") {
      const hdr = Layout.allocUtf16String(
        this.ram,
        String(v),
        label ? `${label}#str` : undefined
      );
      const len = this.ram.readU32(hdr);
      const dataPtr = this.ram.readU32(hdr + 4);
      this.heap.addString(hdr, { length: len, dataPtr }, label);
      return { slot: { name: label ?? "tmp", kind: "ref", refAddr: hdr } };
    }

    // ---------- 3) ARRAY ----------
    if (t.tag === "array") {
      const arrVals = Array.isArray(v) ? v : [];
      const len = arrVals.length;
      const mode = t.mode ?? "auto";
      const elemT = t.elem;

      // 3.a) inline-prim (auto si elem es prim no-string)
      const useInlinePrim =
        mode === "inline-prim" ||
        (mode === "auto" && elemT.tag === "prim" && elemT.name !== "string");

      if (useInlinePrim) {
        if (!(elemT.tag === "prim" && elemT.name !== "string")) {
          throw new Error("inline-prim solo admite primitivos no-string");
        }
        const wr = Layout.writeArrayInlinePrim(
          this.ram,
          elemT.name,
          arrVals,
          label
        );
        const hdr = wr.addr;
        const dataPtr = this.ram.readU32(hdr + 4);
        this.heap.addArrayInlinePrim(
          hdr,
          {
            length: len,
            dataPtr,
            elemType: elemT.name,
            elemSize: sizeOf(elemT.name),
          },
          label
        );
        return { slot: { name: label ?? "tmp", kind: "ref", refAddr: hdr } };
      }

      // 3.b) strings (ref32)
      if (isStr(elemT)) {
        const wr = Layout.writeArrayOfStrings(
          this.ram,
          arrVals.map((s) => String(s)),
          label
        );
        const hdr = wr.addr;
        const table = this.ram.readU32(hdr + 4);
        this.heap.addArrayRef32(
          hdr,
          { length: len, dataPtr: table, elem: elemT },
          label
        );

        // Registrar cada string en Heap (uno por header creado).
        for (let i = 0; i < len; i++) {
          const sh = this.ram.readU32(table + i * 4);
          const slen = this.ram.readU32(sh);
          const sdata = this.ram.readU32(sh + 4);
          this.heap.addString(
            sh,
            { length: slen, dataPtr: sdata },
            label ? `${label}[${i}]#str` : undefined
          );
        }

        return { slot: { name: label ?? "tmp", kind: "ref", refAddr: hdr } };
      }

      // 3.c) ref32 genérico (objetos/arrays anidados)
      const childPtrs: Addr[] = [];
      for (let i = 0; i < len; i++) {
        const child = this.allocDeep(
          elemT,
          arrVals[i],
          label ? `${label}[${i}]` : undefined
        );
        childPtrs.push(isRefSlot(child.slot) ? child.slot.refAddr : 0);
      }
      const wr = Layout.writeArrayRef32(this.ram, childPtrs, label);
      const hdr = wr.addr;
      const table = this.ram.readU32(hdr + 4);
      this.heap.addArrayRef32(
        hdr,
        { length: len, dataPtr: table, elem: elemT },
        label
      );
      return { slot: { name: label ?? "tmp", kind: "ref", refAddr: hdr } };
    }

    // ---------- 4) OBJECT ----------
    if (t.tag === "object") {
      const wantCompact = t.compact ?? opts?.layout === "compact";
      const fields = t.fields ?? [];

      // 4.a) DISPERSED (legacy/explicativo solo con primitivos)
      if (!wantCompact) {
        const propsLegacy = fields.map(({ key, type }) => {
          if (type.tag === "prim")
            return { key, type: type.name as PrimitiveType, value: v?.[key] };
          // No-prim en disperso: placeholder 0 (docente)
          return { key, type: "int" as PrimitiveType, value: 0 };
        });
        const w = Layout.writeObjectDispersed(this.ram, propsLegacy, label);
        this.heap.addObjectDispersed(
          w.addr,
          {
            schema: propsLegacy.map(({ key, type }) => ({ key, type })),
            memType: t,
          },
          label
        );
        return { slot: { name: label ?? "tmp", kind: "ref", refAddr: w.addr } };
      }

      // 4.b) COMPACTO (recomendado)
      const fieldSpecs: Array<
        | { kind: "prim"; key: string; type: PrimitiveType; value: any }
        | { kind: "ptr"; key: string; ptr: Addr }
      > = [];
      const schema: Array<{ key: string; type: PrimitiveType | "ptr32" }> = [];

      for (const f of fields) {
        const fv = v?.[f.key];

        // --- 1) primitivos NO-string → inline como antes ---
        if (f.type.tag === "prim" && f.type.name !== "string") {
          fieldSpecs.push({
            kind: "prim",
            key: f.key,
            type: f.type.name,
            value: fv,
          });
          schema.push({ key: f.key, type: f.type.name });
          continue;
        }

        // --- 2) String en campos de objeto → nodo propio en Heap + ptr ---
        if (f.type.tag === "prim" && f.type.name === "string") {
          const hdr = Layout.allocUtf16String(
            this.ram,
            String(fv ?? ""),
            label ? `${label}.${f.key}#str` : undefined
          );
          const len = this.ram.readU32(hdr);
          const dataPtr = this.ram.readU32(hdr + 4);

          this.heap.addString(
            hdr,
            { length: len, dataPtr },
            label ? `${label}.${f.key}` : undefined
          );

          // Guardamos un puntero en el objeto
          fieldSpecs.push({ kind: "ptr", key: f.key, ptr: hdr });
          // En el schema sigue siendo "string" para que readObjectCompact
          // lea el texto (sabe que hay un puntero ahí).
          schema.push({ key: f.key, type: "string" });
          continue;
        }

        // --- 3) arrays / objetos anidados → ref32 como ya tenías ---
        const child = this.allocDeep(
          f.type,
          fv,
          label ? `${label}.${f.key}` : undefined
        );
        const refAddr = isRefSlot(child.slot) ? child.slot.refAddr : 0;
        fieldSpecs.push({ kind: "ptr", key: f.key, ptr: refAddr });
        schema.push({ key: f.key, type: "ptr32" });
      }

      const w = Layout.writeObjectCompact(this.ram, fieldSpecs, label);
      this.heap.addObjectCompact(w.addr, { schema, memType: t }, label);
      return { slot: { name: label ?? "tmp", kind: "ref", refAddr: w.addr } };
    }

    throw new Error("Tipo MemType no soportado en allocDeep");
  }

  // ==========================================================================
  // Wrappers legacy (compat consola)
  // ==========================================================================
  /** Crea un primitivo o una string (como referencia) con mensaje clásico. */
  storePrimitive(type: PrimitiveType, name: string, value: any) {
    if (this.existsInCurrentFrame(name)) {
      return [false, this.dupMsg(name)] as const;
    }
    if (type === "string") {
      const hdr = Layout.allocUtf16String(
        this.ram,
        String(value),
        `str ${name}`
      );
      const strLen = this.ram.readU32(hdr);
      const dataPtr = this.ram.readU32(hdr + 4);
      if (!this.heap.has(hdr))
        this.heap.addString(hdr, { length: strLen, dataPtr }, `str(${name})`);
      else this.heap.inc(hdr);
      this.upsertSlot(name, { name, kind: "ref", refAddr: hdr });
      return [true, `var string ${name} @0x${hdr.toString(16)}`] as const;
    }

    try {
      const w = Layout.writePrimitive(this.ram, type, value, `prim ${name}`);
      this.upsertSlot(name, { name, kind: "prim", type, valueAddr: w.addr });
      return [true, `var ${type} ${name} @0x${w.addr.toString(16)}`] as const;
    } catch (err) {
      if (err instanceof RangeError) {
        return [false, (err as Error).message] as const;
      }
      throw err;
    }
  }

  storeArray(elem: PrimitiveType, name: string, values: any[]) {
    if (this.existsInCurrentFrame(name)) {
      return [false, this.dupMsg(name)] as const;
    }
    const mt = Arr(Prim(elem), "auto");
    const r = this.storeValue(name, mt, values);
    const slot = this.resolveSlot(name);
    if (r[0] && slot && slot.kind === "ref") {
      return [
        true,
        `array ${name} -> @0x${slot.refAddr.toString(16)} (len=${values.length})`,
      ] as const;
    }
    return r;
  }

  storeObject(
    name: string,
    props: Array<{ type: PrimitiveType; key: string; value: any }>,
    options?: { compact?: boolean }
  ) {
    if (this.existsInCurrentFrame(name)) {
      return [false, this.dupMsg(name)] as const;
    }
    const mt = Obj(
      props.map((p) => ({ key: p.key, type: Prim(p.type) })),
      options?.compact ?? true
    );
    const value = Object.fromEntries(props.map((p) => [p.key, p.value]));
    const r = this.storeValue(name, mt, value, {
      layout: options?.compact ? "compact" : "dispersed",
    });
    const slot = this.resolveSlot(name);
    if (r[0] && slot && slot.kind === "ref") {
      return [
        true,
        `object ${name} -> @0x${slot.refAddr.toString(16)} (props=${props.length}, compact=${options?.compact ?? true})`,
      ] as const;
    }
    return r;
  }

  // ==========================================================================
  // Lecturas/Comparaciones (compat y seguras con schema completo)
  // ==========================================================================
  readObjectCompact(
    varName: string,
    schema: Array<{ key: string; type: PrimitiveType | "ptr32" }>
  ): Record<string, unknown> | null {
    const slot = this.resolveSlot(varName);
    if (!slot || slot.kind !== "ref" || slot.refAddr === 0) return null;
    return Layout.readObjectCompact(this.ram, schema, slot.refAddr);
  }

  /** Compara dos objetos compactos por el valor de sus campos PRIMITIVOS; ignora ptr32. */
  equalsContent(a: string, b: string): [true, boolean] | [false, string] {
    const sa = this.resolveSlot(a);
    const sb = this.resolveSlot(b);
    if (!sa || !sb) return [false, "Alguna variable no existe"];
    if (sa.kind !== "ref" || sb.kind !== "ref")
      return [false, "Alguna no es referencia"];
    if (sa.refAddr === 0 || sb.refAddr === 0)
      return [false, "Alguna referencia es null"];

    const ea = this.heap.get(sa.refAddr);
    const eb = this.heap.get(sb.refAddr);
    if (!ea || !eb) return [false, "Algún heap entry no existe"];
    if (ea.kind !== "object" || eb.kind !== "object")
      return [false, "Alguna no es objeto"];

    const ma = ea.meta as ObjectCompactMeta | undefined;
    const mb = eb.meta as ObjectCompactMeta | undefined;
    if (
      !ma ||
      ma.tag !== "object-compact" ||
      !mb ||
      mb.tag !== "object-compact"
    ) {
      return [false, "Sólo soportado para layout compacto"];
    }
    if (ma.schema.length !== mb.schema.length)
      return [false, "Schemas distintos (len)"];
    for (let i = 0; i < ma.schema.length; i++) {
      if (
        ma.schema[i].key !== mb.schema[i].key ||
        ma.schema[i].type !== mb.schema[i].type
      ) {
        return [false, "Schemas no coinciden"];
      }
    }

    const objA = Layout.readObjectCompact(this.ram, ma.schema, sa.refAddr);
    const objB = Layout.readObjectCompact(this.ram, mb.schema, sb.refAddr);

    for (let i = 0; i < ma.schema.length; i++) {
      const { key, type } = ma.schema[i];
      if (type === "ptr32") continue; // ignoramos referencias para esta comparación
      if ((objA as any)[key] !== (objB as any)[key]) return [true, false];
    }
    return [true, true];
  }

  // ==========================================================================
  // Asignaciones
  // ==========================================================================
  assignIdToId(target: string, source: string) {
    const t = this.resolveSlot(target);
    const s = this.resolveSlot(source);
    if (!s) return [false, `Fuente "${source}" no existe.`] as const;
    if (!t) return [false, `Destino "${target}" no existe.`] as const;

    if (t.kind === "prim" && s.kind === "prim") {
      if (t.type !== s.type) throw new TypeMismatchError("Tipos distintos");
      const sz = SIZES[t.type];
      this.ram.writeBytes(t.valueAddr, this.ram.readBytes(s.valueAddr, sz));
      return [true, `Asignado (valor): "${target}" = "${source}"`] as const;
    }

    if (t.kind === "ref" && s.kind === "ref") {
      // 🔒 no-op seguro
      if (t.refAddr === s.refAddr) {
        return [
          true,
          `Asignado (ref, sin cambios): "${target}" mantiene 0x${s.refAddr.toString(16)}`,
        ] as const;
      }
      if (t.refAddr !== 0 && this.heap.has(t.refAddr)) this.heap.dec(t.refAddr);
      (t as any).refAddr = s.refAddr;
      if (s.refAddr !== 0) this.heap.inc(s.refAddr);
      return [
        true,
        `Asignado (ref): "${target}" → 0x${s.refAddr.toString(16)}`,
      ] as const;
    }

    return [false, `Tipos incompatibles para asignación.`] as const;
  }

  /** Reasignación directa de literales a primitivos. */
  setPrimitiveLiteral(name: string, value: any) {
    const slot = this.resolveSlot(name);
    if (!slot) return [false, `Variable "${name}" no existe.`] as const;
    if (slot.kind !== "prim")
      return [false, `"${name}" no es primitivo.`] as const;

    try {
      Layout.writePrimitiveAt(
        this.ram,
        slot.type,
        value,
        slot.valueAddr,
        `prim ${name}`
      );
    } catch (err) {
      if (err instanceof RangeError) {
        return [false, (err as Error).message] as const;
      }
      throw err; // otros errores sí son bug
    }

    return [
      true,
      `var ${slot.type} ${name} (reasignado @0x${slot.valueAddr.toString(16)})`,
    ] as const;
  }

  /** p = null */
  setNull(name: string) {
    const slot = this.resolveSlot(name);
    if (!slot) return [false, `Variable "${name}" no existe.`] as const;

    // 1) null NO es válido para primitivos
    if (slot.kind === "prim") {
      return [
        false,
        `No puedes asignar null a un primitivo (${slot.type}). ` +
          `Solo referencias (arrays, objetos, strings) pueden ser null.`,
      ] as const;
    }

    // 2) Si la ref actual apunta a algo, ajusta refCount
    if (slot.refAddr !== 0 && this.heap.has(slot.refAddr)) {
      this.heap.dec(slot.refAddr);
    }

    // 3) Marcar la referencia como puntero nulo (0)
    slot.refAddr = 0;
    return [true, `${name} = null`] as const;
  }

  /** ¿Dos referencias apuntan al mismo header? (identidad) */
  refEquals(a: string, b: string) {
    const sa = this.resolveSlot(a),
      sb = this.resolveSlot(b);
    if (!sa || !sb) return [false, "Var inexistente"] as const;
    if (sa.kind !== "ref" || sb.kind !== "ref")
      return [false, "No son referencias"] as const;
    return [true, sa.refAddr === sb.refAddr] as const;
  }

  // ==========================================================================
  // Mutaciones sobre arrays (por nombre de variable)
  // ==========================================================================
  setArrayIndex(name: string, index: number, value: any) {
    const slot = this.resolveSlot(name);
    if (!slot) return [false, `Variable "${name}" no existe.`] as const;
    if (slot.kind !== "ref" || slot.refAddr === 0)
      return [false, `"${name}" no es una referencia válida.`] as const;

    const entry = this.heap.get(slot.refAddr);
    if (!entry || entry.kind !== "array")
      return [false, `"${name}" no es un array.`] as const;

    // array-inline-prim
    if (entry.meta.tag === "array-inline-prim") {
      const m = entry.meta as ArrayInlinePrimMeta;
      const { length, elemType, elemSize, dataPtr } = m;
      if (index < 0 || index >= length)
        return [false, `Índice fuera de rango: 0..${length - 1}`] as const;

      const addr = dataPtr + index * elemSize;
      Layout.writePrimitiveAt(
        this.ram,
        elemType,
        value,
        addr,
        `arr ${name}[${index}]`
      );
      return [true, `${name}[${index}] actualizado`] as const;
    }

    // array-ref32
    if (entry.meta.tag === "array-ref32") {
      const m = entry.meta as ArrayRef32Meta;
      const { length, dataPtr: table, elem } = m;
      if (index < 0 || index >= length)
        return [false, `Índice fuera de rango: 0..${length - 1}`] as const;

      const cell = table + index * 4;

      // dec del puntero anterior si existía
      const oldPtr = this.ram.readU32(cell);

      if (oldPtr !== 0 && this.heap.has(oldPtr)) this.heap.dec(oldPtr);

      if (isStr(elem)) {
        const sh = Layout.allocUtf16String(
          this.ram,
          String(value),
          `arr ${name}[${index}]#str`
        );
        this.ram.writeU32(cell, sh);
        const slen = this.ram.readU32(sh);
        const sdata = this.ram.readU32(sh + 4);
        this.heap.addString(
          sh,
          { length: slen, dataPtr: sdata },
          `arr(${name})[${index}]#str`
        );
        return [true, `${name}[${index}] actualizado`] as const;
      }

      const child = this.allocDeep(elem, value, `arr ${name}[${index}]`);
      const refAddr = child.slot.kind === "ref" ? child.slot.refAddr : 0;
      this.ram.writeU32(cell, refAddr);
      if (refAddr !== 0) this.heap.inc(refAddr); // el array mantiene ref
      return [true, `${name}[${index}] actualizado`] as const;
    }

    return [false, `Modo de array no soportado para "${name}".`] as const;
  }

  private computeObjectFieldOffset(
    meta: ObjectCompactMeta,
    field: string
  ):
    | [
        true,
        {
          idx: number;
          offset: number;
          schema: { key: string; type: PrimitiveType | "ptr32" | "string" }[];
        },
      ]
    | [false, string] {
    // Tipamos explícitamente el schema para salir del "any"
    const schema = meta.schema as Array<{
      key: string;
      type: PrimitiveType | "ptr32" | "string";
    }>;

    const idx = schema.findIndex((f) => f.key === field);
    if (idx < 0) {
      return [false, `Campo "${field}" no existe en el objeto.`];
    }

    let off = 0;
    for (let i = 0; i < idx; i++) {
      const t = schema[i].type;

      if (t === "ptr32" || t === "string") {
        // puntero de 32 bits
        off += 4;
      } else {
        // aquí YA sabemos que t es PrimitiveType
        off += SIZES[t as PrimitiveType];
      }
    }

    return [true, { idx, offset: off, schema }];
  }

  // ========================================================================
  // Mutaciones sobre arrays dentro de objetos compactos: obj.campo[idx]
  // ========================================================================
  setFieldArrayIndex(objVar: string, field: string, index: number, value: any) {
    const slot = this.resolveSlot(objVar);
    if (!slot || slot.kind !== "ref" || slot.refAddr === 0) {
      return [false, `Objeto "${objVar}" no existe.`] as const;
    }

    const objHdr = slot.refAddr;
    const objE = this.heap.get(objHdr);
    if (!objE || objE.kind !== "object") {
      return [false, `"${objVar}" no es objeto.`] as const;
    }

    const meta = objE.meta as ObjectCompactMeta | undefined;
    if (!meta || meta.tag !== "object-compact") {
      return [
        false,
        `Sólo soportado para objetos con layout compacto.`,
      ] as const;
    }

    // Usamos el helper para evitar el SIZES[any]
    const [okOff, info] = this.computeObjectFieldOffset(meta, field);
    if (!okOff) return [false, info] as const;

    const { offset: off, schema } = info;
    const fieldInfo = schema[info.idx];

    // El campo debe ser una referencia (ptr32) a un array
    if (fieldInfo.type !== "ptr32") {
      const human = fieldInfo.type === "string" ? "String" : fieldInfo.type;
      return [
        false,
        `Campo "${objVar}.${field}" no es un arreglo (es ${human}).`,
      ] as const;
    }

    // Dirección donde está almacenado el puntero al array
    const ptrAddr = objHdr + 4 + off;
    const fieldPtr = this.ram.readU32(ptrAddr);

    if (fieldPtr === 0) {
      return [
        false,
        `Campo "${objVar}.${field}" es referencia null; aún no apunta a un arreglo.`,
      ] as const;
    }

    const arrE = this.heap.get(fieldPtr);
    if (!arrE || arrE.kind !== "array") {
      return [false, `"${objVar}.${field}" no es array.`] as const;
    }

    // === Caso: array-inline-prim dentro del objeto ===
    if (arrE.meta.tag === "array-inline-prim") {
      const m = arrE.meta as ArrayInlinePrimMeta;
      const { elemType, elemSize, dataPtr, length } = m;

      if (index < 0 || index >= length) {
        return [false, `Índice fuera de rango 0..${length - 1}`] as const;
      }

      const addr = dataPtr + index * elemSize;
      Layout.writePrimitiveAt(
        this.ram,
        elemType,
        value,
        addr,
        `${objVar}.${field}[${index}]`
      );
      return [true, `${objVar}.${field}[${index}] actualizado`] as const;
    }

    // === Caso: array-ref32 dentro del objeto ===
    if (arrE.meta.tag === "array-ref32") {
      const m = arrE.meta as ArrayRef32Meta;
      const { dataPtr: table, length, elem } = m;

      if (index < 0 || index >= length) {
        return [false, `Índice fuera de rango 0..${length - 1}`] as const;
      }

      const cell = table + index * 4;

      // dec del puntero anterior si existía
      const oldPtr = this.ram.readU32(cell);
      if (oldPtr !== 0 && this.heap.has(oldPtr)) {
        this.heap.dec(oldPtr);
      }

      // String dentro del array de campo
      if (isStr(elem)) {
        const sh = Layout.allocUtf16String(
          this.ram,
          String(value),
          `${objVar}.${field}[${index}]#str`
        );
        this.ram.writeU32(cell, sh);
        const slen = this.ram.readU32(sh);
        const sdata = this.ram.readU32(sh + 4);
        this.heap.addString(
          sh,
          { length: slen, dataPtr: sdata },
          `${objVar}.${field}[${index}]#str`
        );
        return [true, `${objVar}.${field}[${index}] actualizado`] as const;
      }

      // Elementos que son otros objetos/arrays → allocDeep
      const child = this.allocDeep(elem, value, `${objVar}.${field}[${index}]`);
      const refAddr = child.slot.kind === "ref" ? child.slot.refAddr : 0;

      this.ram.writeU32(cell, refAddr);
      if (refAddr !== 0) this.heap.inc(refAddr);

      return [true, `${objVar}.${field}[${index}] actualizado`] as const;
    }

    return [false, `Modo de array no soportado.`] as const;
  }

  // ==========================================================================
  // Mutaciones sobre campos de objetos compactos
  // ==========================================================================

  setObjectFieldPrimitive(objVar: string, field: string, value: any) {
    const slot = this.resolveSlot(objVar);
    if (!slot || slot.kind !== "ref" || slot.refAddr === 0) {
      return [false, `Objeto "${objVar}" no existe.`] as const;
    }

    const objHdr = slot.refAddr;
    const objE = this.heap.get(objHdr);
    if (!objE || objE.kind !== "object") {
      return [false, `"${objVar}" no es objeto.`] as const;
    }

    const meta = objE.meta as ObjectCompactMeta | undefined;
    if (!meta || meta.tag !== "object-compact") {
      return [
        false,
        `Sólo soportado para objetos con layout compacto.`,
      ] as const;
    }

    const [okOff, info] = this.computeObjectFieldOffset(meta, field);
    if (!okOff) return [false, info] as const;

    const { idx, offset: off, schema } = info;
    const fieldInfo = schema[idx];

    // string/ptr32 no van por aquí
    if (fieldInfo.type === "ptr32" || fieldInfo.type === "string") {
      return [
        false,
        `Campo "${objVar}.${field}" no es primitivo; no puedes asignarle un literal numérico/booleano/char directamente.`,
      ] as const;
    }

    const primType = fieldInfo.type as PrimitiveType;

    // Chequeo de tipo didáctico
    if (primType === "boolean") {
      if (typeof value !== "boolean") {
        return [
          false,
          `Campo "${objVar}.${field}" es boolean; solo acepta true/false.`,
        ] as const;
      }
    } else if (primType === "char") {
      if (typeof value !== "string" || value.length !== 1) {
        return [
          false,
          `Campo "${objVar}.${field}" es char; usa un carácter entre comillas simples, p.ej. 'A'.`,
        ] as const;
      }
    } else {
      if (typeof value !== "number") {
        return [
          false,
          `Campo "${objVar}.${field}" es ${primType}; solo acepta literales numéricos.`,
        ] as const;
      }
    }

    const fieldAddr = objHdr + 4 + off; // +4: header [len:u32]

    try {
      Layout.writePrimitiveAt(
        this.ram,
        primType,
        value,
        fieldAddr,
        `${objVar}.${field}`
      );
    } catch (err) {
      if (err instanceof RangeError) {
        return [false, (err as Error).message] as const;
      }
      throw err;
    }

    return [true, `${objVar}.${field} actualizado`] as const;
  }

  setObjectFieldStringLiteral(objVar: string, field: string, value: string) {
    const slot = this.resolveSlot(objVar);
    if (!slot || slot.kind !== "ref" || slot.refAddr === 0) {
      return [false, `Objeto "${objVar}" no existe.`] as const;
    }

    const objHdr = slot.refAddr;
    const objE = this.heap.get(objHdr);
    if (!objE || objE.kind !== "object") {
      return [false, `"${objVar}" no es objeto.`] as const;
    }

    const meta = objE.meta as ObjectCompactMeta | undefined;
    if (!meta || meta.tag !== "object-compact") {
      return [
        false,
        `Sólo soportado para objetos con layout compacto.`,
      ] as const;
    }

    const [okOff, info] = this.computeObjectFieldOffset(meta, field);
    if (!okOff) return [false, info] as const;

    const { idx, offset: off, schema } = info;
    const fieldInfo = schema[idx];

    if (fieldInfo.type !== "string") {
      const expected =
        fieldInfo.type === "ptr32"
          ? "referencia (array/objeto)"
          : fieldInfo.type;
      return [
        false,
        `Campo "${objVar}.${field}" no es String (es ${expected}).`,
      ] as const;
    }

    const ptrAddr = objHdr + 4 + off;

    // dec() de la string anterior si la había
    const oldPtr = this.ram.readU32(ptrAddr);
    if (oldPtr !== 0 && this.heap.has(oldPtr)) {
      this.heap.dec(oldPtr);
    }

    // nueva string en heap
    const hdr = Layout.allocUtf16String(
      this.ram,
      String(value),
      `${objVar}.${field}#str`
    );
    this.ram.writeU32(ptrAddr, hdr);
    const len = this.ram.readU32(hdr);
    const dataPtr = this.ram.readU32(hdr + 4);
    this.heap.addString(hdr, { length: len, dataPtr }, `${objVar}.${field}`);

    return [true, `${objVar}.${field} actualizado`] as const;
  }

  setObjectFieldFromId(objVar: string, field: string, source: string) {
    const src = this.resolveSlot(source);
    if (!src) return [false, `Fuente "${source}" no existe.`] as const;

    const slot = this.resolveSlot(objVar);
    if (!slot || slot.kind !== "ref" || slot.refAddr === 0) {
      return [false, `Objeto "${objVar}" no existe.`] as const;
    }

    const objHdr = slot.refAddr;
    const objE = this.heap.get(objHdr);
    if (!objE || objE.kind !== "object") {
      return [false, `"${objVar}" no es objeto.`] as const;
    }

    const meta = objE.meta as ObjectCompactMeta | undefined;
    if (!meta || meta.tag !== "object-compact") {
      return [
        false,
        `Sólo soportado para objetos con layout compacto.`,
      ] as const;
    }

    const [okOff, info] = this.computeObjectFieldOffset(meta, field);
    if (!okOff) return [false, info] as const;

    const { idx, offset: off, schema } = info;
    const fieldInfo = schema[idx];
    const addr = objHdr + 4 + off;

    // 1) Campo String: copiamos referencia a la misma string
    if (fieldInfo.type === "string") {
      if (src.kind !== "ref") {
        return [
          false,
          `Tipos incompatibles: "${objVar}.${field}" es String y "${source}" no es referencia.`,
        ] as const;
      }
      if (src.refAddr === 0) {
        return [
          false,
          `No puedes asignar null directamente a "${objVar}.${field}" (String).`,
        ] as const;
      }
      const se = this.heap.get(src.refAddr);
      if (!se || se.kind !== "string") {
        return [
          false,
          `Tipos incompatibles: "${objVar}.${field}" es String y "${source}" no es String.`,
        ] as const;
      }

      const oldPtr = this.ram.readU32(addr);
      if (oldPtr === src.refAddr) {
        return [true, `${objVar}.${field} sin cambios`] as const;
      }
      if (oldPtr !== 0 && this.heap.has(oldPtr)) this.heap.dec(oldPtr);

      this.ram.writeU32(addr, src.refAddr >>> 0);
      this.heap.inc(src.refAddr);

      return [
        true,
        `${objVar}.${field} ahora referencia el mismo String que "${source}".`,
      ] as const;
    }

    // 2) Campo referencia (array/objeto) → no lo soportamos todavía
    if (fieldInfo.type === "ptr32") {
      return [
        false,
        `Campo "${objVar}.${field}" es un arreglo u objeto (referencia). ` +
          `Por ahora solo soportamos asignación directa a campos primitivos o String.`,
      ] as const;
    }

    // 3) Campo primitivo: copiamos bytes desde el primitivo fuente
    if (src.kind !== "prim" || src.type !== fieldInfo.type) {
      const got = src.kind === "prim" ? src.type : "referencia";
      return [
        false,
        `Tipos incompatibles: campo "${objVar}.${field}" es ${fieldInfo.type} y "${source}" es ${got}.`,
      ] as const;
    }

    const primType = fieldInfo.type as PrimitiveType;
    const sz = SIZES[primType];
    const bytes = this.ram.readBytes(src.valueAddr, sz);
    this.ram.writeBytes(addr, bytes);

    return [true, `${objVar}.${field} ← (bytes de "${source}")`] as const;
  }

  // ==========================================================================
  // Snapshot (para UI)
  // ==========================================================================
  snapshot(): Snapshot {
    return {
      stack: this.stack.all().map((f) => ({
        id: f.id,
        name: f.name,
        slots: Array.from(f.slots.values()).map((s) => ({ ...s })),
      })),
      heap: this.heap.list(),
      ram: this.ram.dump(this.NULL_GUARD), // UI nueva puede migrar a dumpRows()
      used: this.ram.used(),
      capacity: this.ram.capacity(),
    };
  }

  // ==========================================================================
  // Soporte para UI (expansiones rápidas)
  // ==========================================================================
  /** Para expandir arrays inline (o strings) en una grilla de bytes. */
  getArrayInfo(
    addr: number
  ): { elemType: PrimitiveType; length: number; dataPtr: number } | null {
    const e = this.heap.get(addr);
    if (!e) return null;

    // String como arreglo de char (didáctico)
    if (e.kind === "string" && e.meta.tag === "string") {
      const { length, dataPtr } = e.meta;
      return { elemType: "char", length, dataPtr };
    }

    if (e.kind === "array" && e.meta.tag === "array-inline-prim") {
      const m = e.meta as ArrayInlinePrimMeta;
      return { elemType: m.elemType, length: m.length, dataPtr: m.dataPtr };
    }

    return null; // ref32 no se expande como celdas contiguas de bytes
  }

  /** Devuelve layout/schema simplificado para tarjetas de objeto. */
  getObjectInfo(addr: number): {
    layout: "compact" | "dispersed";
    schema: Array<{ key: string; type: PrimitiveType | "ptr32" }>;
  } | null {
    const e = this.heap.get(addr);
    if (!e || e.kind !== "object") return null;

    if (e.meta.tag === "object-compact") {
      return { layout: "compact", schema: e.meta.schema };
    }
    if (e.meta.tag === "object-dispersed") {
      // Legacy: puede traer PrimitiveType o MemType; simplificamos a PrimitiveType donde se pueda
      const raw = e.meta.schema;
      const schema = raw.map(({ key, type }) => {
        if (typeof type === "string") return { key, type }; // PrimitiveType
        // MemType recursivo → muéstralo como ptr32
        return { key, type: "ptr32" as const };
      });
      return { layout: "dispersed", schema };
    }
    return null;
  }

  getNullGuard(): number {
    return this.NULL_GUARD;
  }

  setArrayIndexFromId(name: string, index: number, source: string) {
    const arrSlot = this.resolveSlot(name);
    if (!arrSlot || arrSlot.kind !== "ref" || arrSlot.refAddr === 0)
      return [false, `"${name}" no es un array válido.`] as const;

    const entry = this.heap.get(arrSlot.refAddr);
    if (!entry || entry.kind !== "array")
      return [false, `"${name}" no es un array.`] as const;

    const src = this.resolveSlot(source);
    if (!src) return [false, `Fuente "${source}" no existe.`] as const;

    // 1) Array inline-prim: copiamos BYTES desde el primitivo fuente
    if (entry.meta.tag === "array-inline-prim") {
      const m = entry.meta;
      const { length, elemType, elemSize, dataPtr } = m;
      if (index < 0 || index >= length)
        return [false, `Índice fuera de rango: 0..${length - 1}`] as const;

      if (src.kind !== "prim" || src.type !== elemType)
        return [
          false,
          `Tipos incompatibles: se esperaba ${elemType} y "${source}" es ${src.kind === "prim" ? src.type : "ref"}.`,
        ] as const;

      const dst = dataPtr + index * elemSize;
      const bytes = this.ram.readBytes(src.valueAddr, elemSize);
      this.ram.writeBytes(dst, bytes);
      return [true, `${name}[${index}] ← (bytes de ${source})`] as const;
    }

    // 2) Array ref32: escribimos PUNTERO y ajustamos refCounts
    if (entry.meta.tag === "array-ref32") {
      const m = entry.meta;
      const { length, dataPtr: table } = m;
      if (index < 0 || index >= length)
        return [false, `Índice fuera de rango: 0..${length - 1}`] as const;

      if (src.kind !== "ref")
        return [
          false,
          `Tipos incompatibles: "${name}" guarda referencias y "${source}" no es referencia.`,
        ] as const;

      const cell = table + index * 4;
      const oldPtr = this.ram.readU32(cell);
      if (oldPtr === src.refAddr) {
        return [true, `${name}[${index}] sin cambios`] as const; // 🔒 no-op
      }
      if (oldPtr !== 0 && this.heap.has(oldPtr)) this.heap.dec(oldPtr);

      this.ram.writeU32(cell, src.refAddr >>> 0);
      if (src.refAddr !== 0) this.heap.inc(src.refAddr);

      return [
        true,
        `${name}[${index}] → 0x${src.refAddr.toString(16)}`,
      ] as const;
    }

    return [false, `Modo de array no soportado para "${name}".`] as const;
  }

  /** ¿Hay una variable con ese nombre en el frame ACTUAL (top)? */
  private existsInCurrentFrame(name: string): boolean {
    const top = this.stack.top();
    return !!top && !!top.find(name);
  }

  /** Mensaje estándar para duplicados. */
  private dupMsg(name: string) {
    return `Variable "${name}" ya existe en este ámbito. Usa otro nombre.`;
  }
  // ==========================================================================
  // Accesos directos (tests/depuración)
  // ==========================================================================
  getByteStore() {
    return this.ram;
  }
  getHeap() {
    return this.heap;
  }
  getStack() {
    return this.stack;
  }

  /** ¿Existe una variable (en cualquier frame visible)? */
  hasVar(name: string): boolean {
    return !!this.stack.resolve(name);
  }

  /** Convierte un MemType de objeto a un schema simplificado (ptr32 para no-prims) */
  private memTypeToSchema(
    mt: MemType
  ): Array<{ key: string; type: PrimitiveType | "ptr32" }> | null {
    if (mt.tag !== "object" || !Array.isArray(mt.fields)) return null;
    const out: Array<{ key: string; type: PrimitiveType | "ptr32" }> = [];
    for (const f of mt.fields) {
      if (f.type.tag === "prim") out.push({ key: f.key, type: f.type.name });
      else out.push({ key: f.key, type: "ptr32" });
    }
    return out;
  }
  /** Firma de tipo en vivo de una variable para chequeos del intérprete/UI. */
  getVarTypeSummary(name: string): TypeLikeSummary | null {
    const slot = this.stack.resolve(name);
    if (!slot) return null;

    if (slot.kind === "prim") {
      return { category: "prim", type: slot.type };
    }

    // referencia
    if (slot.refAddr === 0) return null;
    const e = this.heap.get(slot.refAddr);
    if (!e) return null;

    if (e.kind === "string") return { category: "string" };

    if (e.kind === "array") {
      if (e.meta.tag === "array-inline-prim") {
        return { category: "array-prim", elem: e.meta.elemType };
      }
      if (e.meta.tag === "array-ref32") {
        const elem = e.meta.elem;
        if (elem.tag === "prim" && elem.name === "string") {
          return { category: "array-string" };
        }
        const schemaFromMemType = this.memTypeToSchema(elem);
        if (schemaFromMemType) {
          return { category: "array-object", schema: schemaFromMemType };
        }
        return { category: "array-object", schema: [] };
      }
      return null;
    }

    if (e.kind === "object") {
      const info = this.getObjectInfo(slot.refAddr);
      if (info) return { category: "object", schema: info.schema };
      return { category: "object", schema: [] };
    }

    return null;
  }

  getRefOwners(addr: number): Array<{ frame: string; name: string }> {
    const out: Array<{ frame: string; name: string }> = [];
    for (const f of this.stack.all()) {
      for (const s of f.slots.values()) {
        if (s.kind === "ref" && s.refAddr === addr)
          out.push({ frame: f.name, name: s.name });
      }
    }
    return out;
  }
}
