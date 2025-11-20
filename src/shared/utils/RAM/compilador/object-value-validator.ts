// src/checkers/object-value-validator.ts
// -----------------------------------------------------------------------------
// Validador de objetos (referencias) con enfoque docente y rutas claras.
// - Usa PrimitiveValueValidator y ArrayValueValidator por campo.
// - Permite null (referencia vacía) y prohíbe undefined (no existe en Java).
// - Soporta objetos anidados y arrays dentro de objetos.
// - Mensajes consistentes con message-factory y el resto de validadores.
// -----------------------------------------------------------------------------

import { Lexicon } from "./lexicon";
import {
  PrimitiveValueValidator,
  type PrimitiveLike,
  type ValidationResult,
} from "./primitive-value-validator";
import {
  ArrayValueValidator,
  type ArrayOptions,
} from "./array-value-validator";
import { prettyValue } from "./message-factory";

type Context = "declaration" | "inner";

/** Especificación de un campo dentro del objeto. */
export type FieldSpec =
  | { kind: "prim"; type: PrimitiveLike; optional?: boolean }
  | {
      kind: "array";
      elem: PrimitiveLike;
      optional?: boolean;
      // Reutilizamos las mismas opciones que el validador de arrays
      exactLength?: ArrayOptions["exactLength"];
      minLength?: ArrayOptions["minLength"];
      maxLength?: ArrayOptions["maxLength"];
    }
  | { kind: "object"; schema: ObjectSchema; optional?: boolean };

/** Esquema del objeto: nombreCampo → especificación */
export type ObjectSchema = Record<string, FieldSpec>;

/** Opciones del validador de objetos. */
export type ObjectOptions = {
  /** Ruta para mensajes (p.ej., "p" o "persona"). */
  path?: string;
  /**
   * ¿Se permiten campos extra no definidos en el schema?
   * Por defecto false: reporta error con la lista de extras.
   */
  allowExtra?: boolean;
};

export class ObjectValueValidator {
  private readonly schema: ObjectSchema;
  private readonly name?: string;
  private readonly value: unknown;
  private readonly ctx: Context;
  private readonly opts: ObjectOptions;

  // --- Overloads ---
  constructor(
    schema: ObjectSchema,
    name: string,
    value: unknown,
    opts?: ObjectOptions
  );
  constructor(schema: ObjectSchema, value: unknown, opts?: ObjectOptions);

  // --- Implementación única ---
  constructor(
    schema: ObjectSchema,
    a: string | unknown,
    b?: unknown | ObjectOptions,
    c?: ObjectOptions
  ) {
    this.schema = schema;

    if (typeof a === "string") {
      // (schema, name, value, opts?) → declaración
      this.ctx = "declaration";
      this.name = a;
      this.value = b as unknown;
      this.opts = c ?? {};
    } else {
      // (schema, value, opts?) → interno (inner)
      this.ctx = "inner";
      this.value = a;
      this.opts = (b as ObjectOptions) ?? {};
    }
  }

  /** Ejecuta la validación del objeto completo. */
  validate(): ValidationResult {
    // 0) Validar identificador si aplica
    if (this.ctx === "declaration") {
      if (!this.name || !Lexicon.isValidIdentifier(this.name)) {
        return {
          ok: false,
          message:
            `❌ Identificador inválido: "${this.name ?? ""}".\n` +
            `  • No puede ser palabra reservada, literal ni nombre de tipo.\n` +
            `  • Debe cumplir /[$A-Za-z_][$A-Za-z0-9_]*/.`,
        };
      }
    }

    const path = this.opts.path ?? this.name ?? "obj";

    // 1) Prohibimos undefined (no existe en Java)
    if (this.value === undefined) {
      return {
        ok: false,
        message:
          `❌ ${path}: valor inválido.\n` +
          `  • esperado: objeto (o null como referencia vacía)\n` +
          `  • recibido: undefined\n` +
          `  • regla: En Java no existe 'undefined'.\n` +
          `  • pista: Usa "null" si quieres ausencia de referencia.`,
      };
    }

    // 2) Permitimos null como referencia vacía
    if (this.value === null) {
      return this.okMsg(path, /*isNull*/ true);
    }

    // 3) Debe ser objeto "plano" (no array)
    if (Array.isArray(this.value) || typeof this.value !== "object") {
      return {
        ok: false,
        message:
          `❌ ${path}: se esperaba un objeto (clave → valor).\n` +
          `  • recibido: ${prettyValue(this.value)}`,
      };
    }

    const obj = this.value as Record<string, unknown>;

    // 4) Campos extra (si no se permiten)
    if (!this.opts.allowExtra) {
      const extras = Object.keys(obj).filter((k) => !(k in this.schema));
      if (extras.length > 0) {
        return {
          ok: false,
          message:
            `❌ ${path}: campos no permitidos.\n` +
            `  • extras: ${extras.join(", ")}\n` +
            `  • regla: Este objeto no admite campos fuera del esquema.`,
        };
      }
    }

    // 5) Validar cada campo del esquema
    for (const [field, spec] of Object.entries(this.schema)) {
      const value = obj[field];
      const fieldPath = `${path}.${field}`;

      if (value === undefined) {
        if (spec.optional) continue; // campo opcional ausente → OK
        return {
          ok: false,
          message:
            `❌ ${fieldPath}: campo requerido ausente.\n` +
            `  • regla: Debes proporcionar "${field}".`,
        };
      }

      // Permitir null para referencias (String, array, object):
      // - Para String ya lo maneja PrimitiveValueValidator.
      // - Para arrays y objetos lo contemplamos aquí (null = ref vacía).
      switch (spec.kind) {
        case "prim": {
          const r = new PrimitiveValueValidator(spec.type, value).validate();
          if (!r.ok) return this.prefix(fieldPath, r);
          break;
        }

        case "array": {
          if (value === null) {
            // null permitido como referencia ausente
            break;
          }
          const arrOpts: ArrayOptions = {
            path: fieldPath,
            exactLength: spec.exactLength,
            minLength: spec.minLength,
            maxLength: spec.maxLength,
          };
          const r = new ArrayValueValidator(
            spec.elem,
            value,
            arrOpts
          ).validate();
          if (!r.ok) return r; // ya trae path
          break;
        }

        case "object": {
          if (value === null) {
            // null permitido como referencia ausente
            break;
          }
          const r = new ObjectValueValidator(spec.schema, value, {
            path: fieldPath,
            allowExtra: this.opts.allowExtra,
          }).validate();
          if (!r.ok) return r; // ya trae path
          break;
        }
      }
    }

    // 6) Éxito
    return this.okMsg(path, /*isNull*/ false);
  }

  // ================= Helpers =================

  /** Formatea un resultado de error de un validador anidado, anteponiendo el path. */
  private prefix(fieldPath: string, res: ValidationResult): ValidationResult {
    if (res.ok) return res;
    const msg = res.message.includes("\n")
      ? `${fieldPath}:\n${indent(res.message)}`
      : `${fieldPath}: ${res.message}`;
    return { ok: false, message: msg };
  }

  /** Mensajes de OK consistentes. */
  private okMsg(path: string, isNull: boolean): ValidationResult {
    if (this.ctx === "declaration") {
      const name = this.name!;
      if (isNull) {
        return {
          ok: true,
          message: `✅ ${name} = null (referencia vacía permitida).`,
        };
      }
      const total = Object.keys(this.schema).length;
      return {
        ok: true,
        message: `✅ ${name} coincide con el esquema (${total} campo${total === 1 ? "" : "s"} válidos).`,
      };
    }

    // inner
    if (isNull) {
      return {
        ok: true,
        message: `✅ ${path} = null (referencia vacía permitida).`,
      };
    }
    const total = Object.keys(this.schema).length;
    return {
      ok: true,
      message: `✅ Objeto en ${path} coincide con el esquema (${total} campo${total === 1 ? "" : "s"} válidos).`,
    };
  }
}

function indent(s: string, spaces = 2): string {
  const pad = " ".repeat(spaces);
  return s
    .split("\n")
    .map((line) => pad + line)
    .join("\n");
}
