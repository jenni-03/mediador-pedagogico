import { Lexicon } from "./lexicon";
import {
  PrimitiveValueValidator,
  type PrimitiveLike,
  type ValidationResult,
} from "./primitive-value-validator";
import {
  prettyType, prettyValue, arrayExpected,
  arrayLenExact, arrayLenMin, arrayLenMax
} from "./message-factory";

type Context = "declaration" | "inner";

export type ArrayOptions = {
  /** Ruta para mensajes (p.ej. "arr" o "p.meses"). */
  path?: string;
  /** Si se define, la longitud debe ser exactamente esta. */
  exactLength?: number;
  /** Límite inferior opcional. Ignorado si exactLength está definido. */
  minLength?: number;
  /** Límite superior opcional. Ignorado si exactLength está definido. */
  maxLength?: number;
};

export class ArrayValueValidator {
  private readonly elemType: PrimitiveLike;
  private readonly name?: string;
  private readonly value: unknown;
  private readonly ctx: Context;
  private readonly opts: ArrayOptions;

  // --- Overloads ---
  constructor(elemType: PrimitiveLike, name: string, value: unknown, opts?: ArrayOptions);
  constructor(elemType: PrimitiveLike, value: unknown, opts?: ArrayOptions);

  // --- Implementación única ---
  constructor(
    elemType: PrimitiveLike,
    a: string | unknown,
    b?: unknown | ArrayOptions,
    c?: ArrayOptions
  ) {
    this.elemType = this.normalizePrimitiveLike(elemType);

    if (typeof a === "string") {
      this.ctx = "declaration";
      this.name = a;
      this.value = b;
      this.opts = c ?? {};
    } else {
      this.ctx = "inner";
      this.value = a;
      this.opts = (b as ArrayOptions) ?? {};
    }
  }

  /** Ejecuta la validación del array completo. */
  validate(): ValidationResult {
    // 0) Validar identificador si aplica
    if (this.ctx === "declaration") {
      if (!this.name || !Lexicon.isValidIdentifier(this.name)) {
        return {
          ok: false,
          message:
            `❌ Identificador inválido: "${this.name ?? ""}".\n` +
            `  • No puede ser palabra reservada, literal ni nombre de tipo.\n` +
            `  • Debe cumplir /[$A-Za-z_][$A-Za-z0-9_]*/.`
        };
      }
    }

    const path = this.opts.path ?? this.name ?? "arr";

    // 1) Debe ser un arreglo JS
    if (!Array.isArray(this.value)) {
      return { ok: false, message: arrayExpected(path, prettyValue(this.value)) };
    }

    const arr = this.value as unknown[];

    // 2) Reglas de longitud (si se proporcionan)
    if (typeof this.opts.exactLength === "number") {
      if (arr.length !== this.opts.exactLength) {
        return { ok: false, message: arrayLenExact(path, this.opts.exactLength, arr.length) };
      }
    } else {
      if (typeof this.opts.minLength === "number" && arr.length < this.opts.minLength) {
        return { ok: false, message: arrayLenMin(path, this.opts.minLength, arr.length) };
      }
      if (typeof this.opts.maxLength === "number" && arr.length > this.opts.maxLength) {
        return { ok: false, message: arrayLenMax(path, this.opts.maxLength, arr.length) };
      }
    }

    // 3) Validar elemento a elemento con PrimitiveValueValidator
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      const item = new PrimitiveValueValidator(this.elemType, v).validate();
      if (!item.ok) {
        // Prefija el contexto con path[i], pero conserva el texto claro del validador de primitivos
        const prefixed = item.message.includes("\n")
          ? `${path}[${i}]:\n${indent(item.message)}`
          : `${path}[${i}]: ${item.message}`;
        return { ok: false, message: prefixed };
      }
    }

    // 4) Éxito
    const label = prettyType(this.elemType);
    if (this.ctx === "declaration") {
      return {
        ok: true,
        message: `✅ ${this.name} es un arreglo de ${label} con ${arr.length} elementos válidos.`,
      };
    }
    return {
      ok: true,
      message: `✅ Arreglo de ${label} con ${arr.length} elementos válidos.`,
    };
  }

  // ================= Helpers =================

  /** Normaliza variantes (p. ej. "string" → "String"). */
  private normalizePrimitiveLike(t: PrimitiveLike): PrimitiveLike {
    if ((t as string).toLowerCase() === "string") return "String";
    if (t !== "String" && !Lexicon.hasType(t)) {
      throw new Error(`Tipo de elemento no soportado: ${String(t)}`);
    }
    return t;
  }
}

function indent(s: string, spaces = 2): string {
  const pad = " ".repeat(spaces);
  return s.split("\n").map(line => pad + line).join("\n");
}
