// src/checkers/primitive-value-validator.ts
// -----------------------------------------------------------------------------
// Validador de literales primitivos + String (referencia) con enfoque docente.
// - Contextos: declaración (type, name, value) e interno (type, value)
// - Mensajes uniformes (ok/err) vía message-factory
// - Rechaza 'undefined' (no existe en Java) y valida tipo/rango con Lexicon
//
// Idea pedagógica:
// * Primitivos viven por valor en el stack (dirección directa).
// * String/arrays/objetos son referencias (direccionamiento indirecto).
// -----------------------------------------------------------------------------

import { Lexicon, type PrimName } from "./lexicon";
import {
  okDecl,
  okInner,
  badIdentifier,
  typeMismatch,
  expectedText,
  prettyValue,
} from "./message-factory";

// Permitimos validar primitivos de Java + String literal
export type PrimitiveLike = PrimName | "String";

export type ValidationResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

type Context = "declaration" | "inner";

/**
 * Valida un valor contra un tipo primitivo o String.
 * - Declaración: (type, name, value)
 * - Interno (en arrays/objetos/args): (type, value)
 *
 * Ejemplos:
 *  new PrimitiveValueValidator("int", "x", 7).validate();
 *  new PrimitiveValueValidator("String", "s", "hola").validate();
 *  new PrimitiveValueValidator("int", 7).validate(); // inner
 */
export class PrimitiveValueValidator {
  private readonly type: PrimitiveLike;
  private readonly name?: string;
  private readonly value: unknown;
  private readonly ctx: Context;

  // --- Overloads públicos (no cambiar firmas) ---
  constructor(type: PrimitiveLike, name: string, value: unknown);
  constructor(type: PrimitiveLike, value: unknown);

  // --- Implementación única ---
  constructor(type: PrimitiveLike, a: string | unknown, b?: unknown) {
    this.type = PrimitiveValueValidator.normalizeType(type);
    if (typeof b !== "undefined" && typeof a === "string") {
      // (type, name, value) → declaración
      this.ctx = "declaration";
      this.name = a;
      this.value = b;
    } else {
      // (type, value) → valor interno (array/objeto/arg)
      this.ctx = "inner";
      this.value = a;
    }
  }

  // ============================================================================
  // API
  // ============================================================================

  /** Ejecuta la validación y retorna booleando + mensaje docente. */
  validate(): ValidationResult {
    // 1) Identificador (solo en declaración)
    if (this.ctx === "declaration") {
      if (!this.name || !Lexicon.isValidIdentifier(this.name)) {
        return { ok: false, message: badIdentifier(this.name ?? "") };
      }
    }

    // 2) Prohibimos 'undefined' en cualquier tipo (en Java no existe)
    if (this.value === undefined) {
      return {
        ok: false,
        message:
          `❌ Error de tipo:\n` +
          `  • esperado: ${this.type === "String" ? "String (cadena de texto)" : String(this.type)}\n` +
          `  • recibido: undefined\n` +
          `  • regla: En Java no existe 'undefined'.\n` +
          `  • pista: Usa "null" si quieres representar ausencia de referencia.`,
      };
    }

    // 3) Derivación por tipo
    const t = this.type;
    const v = this.value;

    if (t === "String") return this.validateString(v);

    switch (t) {
      case "boolean":
        return this.validateBoolean(v);

      case "char":
        return this.validateChar(v);

      case "byte":
      case "short":
      case "int":
        return this.validateIntLike(t, v);

      case "long":
        // Nota: el comportamiento exacto depende de Lexicon.literalFits("long", v)
        // Si ajustaste Lexicon para aceptar sólo number enteros (no BigInt),
        // aquí se reflejará automáticamente.
        return this.validateLong(v);

      case "float":
      case "double":
        return this.validateFloatLike(t, v);
    }
  }

  // ============================================================================
  // Validadores específicos por tipo (privados)
  // ============================================================================

  private validateString(v: unknown): ValidationResult {
    // Permitimos null (referencia vacía en Java) y string literal.
    if (v === null || typeof v === "string") return this.ok();

    return this.fail("String", v, {
      rule: "String es una referencia; admite 'null' o una cadena de texto.",
      hint: 'Escribe "hola" o usa null para ausencia de objeto.',
    });
  }

  private validateBoolean(v: unknown): ValidationResult {
    if (Lexicon.literalFits("boolean", v)) return this.ok();
    return this.fail("boolean", v, {
      rule: "Boolean solo admite true o false.",
    });
  }

  private validateChar(v: unknown): ValidationResult {
    if (Lexicon.literalFits("char", v)) return this.ok();
    return this.fail("char", v, {
      rule: "char es entero sin signo de 16 bits o cadena de longitud 1.",
      hint:
        typeof v === "string"
          ? 'Usa un único carácter, p. ej. "A".'
          : "Usa un entero 0..65535 o una cadena de longitud 1.",
    });
  }

  private validateIntLike(
    kind: "byte" | "short" | "int",
    v: unknown
  ): ValidationResult {
    if (Lexicon.literalFits(kind, v)) return this.ok();
    return this.fail(kind, v, {
      rule: "Debe ser un entero dentro del rango del tipo.",
      hint: "Evita decimales; usa números enteros.",
    });
  }

  private validateLong(v: unknown): ValidationResult {
    if (Lexicon.literalFits("long", v)) return this.ok();
    return this.fail("long", v, {
      rule: "long es entero de 64 bits en el simulador.",
      hint: "Usa números enteros sin sufijo (ej: 42). No uses BigInt (42n).",
    });
  }

  private validateFloatLike(
    kind: "float" | "double",
    v: unknown
  ): ValidationResult {
    if (Lexicon.literalFits(kind, v)) return this.ok();
    return this.fail(kind, v, {
      rule: "El valor debe ser número finito (no NaN, no ±Infinity).",
    });
  }

  // ============================================================================
  // Helpers de mensajes y normalización
  // ============================================================================

  /** Mensaje de éxito uniforme según el contexto. */
  private ok(): ValidationResult {
    return this.ctx === "declaration"
      ? { ok: true, message: okDecl(this.name!, this.type) }
      : { ok: true, message: okInner(this.type) };
  }

  /** Mensaje de error uniforme y docente. */
  private fail(
    t: PrimitiveLike | PrimName,
    v: unknown,
    extra?: { rule?: string; hint?: string }
  ): ValidationResult {
    return {
      ok: false,
      message: typeMismatch({
        expected: expectedText(t as PrimitiveLike),
        received: prettyValue(v),
        rule: extra?.rule,
        hint: extra?.hint,
      }),
    };
  }

  /** Normaliza variantes de tipo (p. ej., "string" → "String"). */
  private static normalizeType(t: PrimitiveLike): PrimitiveLike {
    if ((t as string).toLowerCase() === "string") return "String";
    if (t !== "String" && !Lexicon.hasType(t)) {
      throw new Error(`Tipo no soportado: ${String(t)}`);
    }
    return t;
  }
}
