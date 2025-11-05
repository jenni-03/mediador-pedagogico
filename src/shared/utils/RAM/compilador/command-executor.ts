// src/checkers/command-executor.ts
// -----------------------------------------------------------------------------
// Ejecuta una declaración validada por el CommandInterpreter contra Memory.
// Si la validación falla, no toca Memory y retorna el mismo mensaje docente.
// Si pasa, construye un MemType coherente y llama a memory.storeValue(...).
// -----------------------------------------------------------------------------

import { CommandInterpreter, SchemaRegistry, parseDeclaration, type Expr } from "./command-interpreter";
import { Lexicon } from "./lexicon";

import { Memory } from "../memoria/Memory";
import { Prim, Arr, Obj, type MemType } from "../memoria/memtype";

// === API pública =============================================================

export type ExecOutcome =
  | { ok: true; message: string }
  | { ok: false; message: string };

export class CommandExecutor {
  constructor(
    private readonly memory: Memory,
    private readonly interpreter = new CommandInterpreter(),
    private readonly schemas = SchemaRegistry
  ) {}

  /**
   * Valida y, si es correcto, almacena en Memory con el MemType adecuado.
   * Retorna el mismo mensaje del intérprete y, si aplica, una nota de "almacenado".
   */
  execute(line: string): ExecOutcome {
    // 1) Validar con el intérprete (no toca Memory)
    const check = this.interpreter.validateDeclaration(line);
    if (!check.ok) return check; // no tocar Memory si hay error

    // 2) Parsear (AST) para poder construir MemType + valor JS
    const ast = parseDeclaration(line);

    // 3) Elegir tipo de alto nivel
    const typeName = ast.typeName;
    const isPrimOrString = Lexicon.hasType(typeName as any) || typeName === "String";
    const isObject = !isPrimOrString && this.schemas.has(typeName);
    if (!isPrimOrString && !isObject) {
      return { ok: false, message: `❌ Tipo desconocido: "${typeName}".` };
    }

    // 4) Construir valor JS a partir del AST (el validador ya garantizó compatiblidad)
    const valueJs = exprToJs(ast.init);

    // 5) Mapear a MemType
    const memType = this.toMemType(typeName, ast.isArray);

    // 6) Escribir en Memory
    //    - Si es referencia y el valor es null → Memory (parcheado abajo) ya lo entiende
    //      y crea un slot ref con 0. Para arrays de String, el parche también maneja nulls.
    try {
      this.memory.storeValue(ast.name, memType, valueJs);
      return { ok: true, message: `${check.message}\n🧠 Almacenado en memoria.` };
    } catch (e: any) {
      return { ok: false, message: `❌ Error al almacenar en Memory: ${e?.message ?? String(e)}` };
    }
  }

  // === Mappers ===============================================================

  /** Mapea "int"/"String"/"Persona" (+ bandera isArray) a un MemType. */
  private toMemType(typeName: string, isArray: boolean): MemType {
    if (isArray) {
      // Arreglo de primitivo/String/objeto
      if (typeName === "String") return Arr(Prim("string"), "auto");
      if (Lexicon.hasType(typeName as any)) {
        // primitivo Java → prim de Memory (minúscula)
        return Arr(Prim(typeName as any), "auto");
      }
      // Objeto registrado en SchemaRegistry → Obj(...)
      const obj = this.objFromSchema(this.schemas.get(typeName));
      return Arr(obj, "auto");
    }

    // No arreglo
    if (typeName === "String") return Prim("string");
    if (Lexicon.hasType(typeName as any)) return Prim(typeName as any);

    // Objeto
    return this.objFromSchema(this.schemas.get(typeName));
  }

  /** Convierte un ObjectSchema (validator) al MemType de objetos de la VM. */
  private objFromSchema(schema: import("./object-value-validator").ObjectSchema): MemType {
    // El schema es un record { campo: meta }, donde meta.kind ∈ {"prim","array","object"}.
    const fields = Object.entries(schema).map(([key, meta]) => {
      switch (meta.kind) {
        case "prim": {
          const t = meta.type === "String" ? Prim("string") : Prim(meta.type);
          return { key, type: t };
        }
        case "array": {
          // Por simplicidad docente: arrays de prim/String.
          // (Si tu schema soporta array de objetos, puedes extender esto:
          //  const elem = (meta.elem es "String" | PrimName) ? Prim(...) : this.objFromSchema(meta.schema))
          const elem = meta.elem === "String" ? Prim("string") : Prim(meta.elem);
          return { key, type: Arr(elem, "auto") };
        }
        case "object": {
          const t = this.objFromSchema(meta.schema);
          return { key, type: t };
        }
      }
    });
    return Obj(fields, true /*compact*/);
  }
}

// === Builder de Expr → JS (copia local, evita tocar el intérprete) =============

function exprToJs(expr: Expr): unknown {
  switch (expr.kind) {
    case "null":   return null;
    case "number": return expr.value;
    case "boolean":return expr.value;
    case "string": return expr.value;
    case "char":   return expr.value; // pasamos char como string(1); Layout lo sabrá escribir
    case "array":  return expr.items.map(exprToJs);
    case "object": {
      const o: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(expr.fields)) o[k] = exprToJs(v);
      return o;
    }
  }
}
