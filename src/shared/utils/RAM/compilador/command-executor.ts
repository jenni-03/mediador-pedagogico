// -----------------------------------------------------------------------------
// Ejecuta una declaración validada por el CommandInterpreter contra Memory.
// Si la validación falla, no toca Memory y retorna el mismo mensaje docente.
// Si pasa, construye un MemType coherente y llama a memory.storeValue(...).
// -----------------------------------------------------------------------------

import {
  CommandInterpreter,
  SchemaRegistry,
  parseDeclaration,
  parseAssignment,
  validateAssignment,
  defineType,
  type Expr,
} from "./command-interpreter";
import { Lexicon } from "./lexicon";

import { Memory } from "../memoria/Memory";
import { Prim, Arr, Obj, type MemType } from "../memoria/memtype";
import type { ObjectSchema, FieldSpec } from "./object-value-validator";
import { isPrimSlot } from "../memoria/stack";

export type ExecOutcome =
  | { ok: true; message: string }
  | { ok: false; message: string };

export class CommandExecutor {
  constructor(
    private readonly memory: Memory,
    private readonly interpreter = new CommandInterpreter(SchemaRegistry, {
      hasVar: (name: string) => !!this.memory.getStack().resolve(name),
      getVarTypeSummary: (name: string) => this.memory.getVarTypeSummary(name),
    }),
    private readonly schemas = SchemaRegistry
  ) {}

  /**
   * Valida y, si es correcto, almacena en Memory con el MemType adecuado.
   * Retorna el mismo mensaje del intérprete y, si aplica, una nota de "almacenado".
   */
  execute(line: string): ExecOutcome {
    // -1) ¿Definición de tipo? (class | record | struct)
    const def = defineType(line);
    if ("matched" in def && def.matched) {
      return def.ok
        ? { ok: true, message: def.message }
        : { ok: false, message: def.message };
    }

    // 0) ¿Asignación?
    const tryAssign = validateAssignment(line);
    if (tryAssign.ok) {
      const ast = parseAssignment(line);
      return this.execAssign(ast);
    }

    // 1) Declaración (flujo clásico)
    const check = this.interpreter.validateDeclaration(line);
    if (!check.ok) return check;

    const ast = parseDeclaration(line);
    const typeName = ast.typeName;
    const isPrimOrString =
      Lexicon.hasType(typeName as any) || typeName === "String";

    try {
      // Declaración sin inicializador
      if (ast.init.kind === "absent") {
        if (!ast.isArray && isPrimOrString) {
          const prim = typeName === "String" ? null : (typeName as any);
          if (prim === null) {
            return {
              ok: false,
              message: `❌ Aún no soportamos "String s;" sin inicializador.`,
            };
          }
          const r = this.memory.declarePrimitive(ast.name, prim);
          return r[0]
            ? { ok: true, message: `${check.message}\n🧠 Reservado en RAM.` }
            : { ok: false, message: r[1] };
        }
        return {
          ok: false,
          message: `❌ Para arreglos usa: ${typeName}[] ${ast.name} = new ${typeName}[n];`,
        };
      }

      // Declaración con new Tipo[n]
      if (ast.init.kind === "newArray") {
        const elemMemType = this.elemMemType(typeName);
        const r = this.memory.declareArray(
          ast.name,
          elemMemType,
          ast.init.length,
          "auto"
        );
        return r[0]
          ? {
              ok: true,
              message: `${check.message}\n🧠 Arreglo reservado en RAM (sin datos).`,
            }
          : { ok: false, message: r[1] };
      }

      // ⬇️⬇️ NUEVO: Declaración con inicializador por identificador (int y = x;)
      if (ast.init.kind === "ident") {
        const from = ast.init.name;

        // Caso soportado ahora: PRIMITIVOS (copia por valor)
        if (!ast.isArray && isPrimOrString && typeName !== "String") {
          const prim = typeName as any; // ya validado por el intérprete
          const rDecl = this.memory.declarePrimitive(ast.name, prim);
          if (!rDecl[0]) return { ok: false, message: rDecl[1] };

          const rAssign = this.memory.assignIdToId(ast.name, from);
          return rAssign[0]
            ? {
                ok: true,
                message: `${check.message}\n🧠 Inicializado desde ${from} (copia de valor).`,
              }
            : { ok: false, message: rAssign[1] };
        }

        // Aún no implementado: String / objetos / arreglos (requiere declarar slot ref y enlazar)
        const destino = ast.isArray
          ? `arreglos`
          : typeName === "String"
            ? `String`
            : `objetos`;
        return {
          ok: false,
          message:
            `❌ Inicialización por identificador no implementada para ${destino}. ` +
            `Declara y luego asigna:\n` +
            `• ${typeName}${ast.isArray ? "[]" : ""} ${ast.name};\n` +
            `• ${ast.name} = ${from};`,
        };
      }

      // Declaración con inicializador literal/objeto/array → store (nombre debe ser nuevo)
      const valueJs = exprToJs(ast.init);
      const memType = this.toMemType(typeName, ast.isArray);
      const r = this.memory.storeValue(ast.name, memType, valueJs, {
        mustBeNew: true,
      });
      return r[0]
        ? { ok: true, message: `${check.message}\n🧠 Almacenado en memoria.` }
        : { ok: false, message: r[1] };
    } catch (e: any) {
      return {
        ok: false,
        message: `❌ Error al almacenar en Memory: ${e?.message ?? String(e)}`,
      };
    }
  }

  // ────────────────────── Ejecutar asignación ────────────────────────
  private execAssign(
    ast: import("./command-interpreter").AssignAST
  ): ExecOutcome {
    try {
      // VAR = ...
      if (ast.target.kind === "var") {
        const name = ast.target.name;
        const slot = this.memory.getStack().resolve(name);
        if (!slot) {
          return { ok: false, message: `❌ La variable "${name}" no existe.` };
        }

        // id = id;
        if (ast.expr.kind === "ident") {
          const r = this.memory.assignIdToId(name, ast.expr.name);
          return r[0]
            ? {
                ok: true,
                message: `✅ ${name} = ${ast.expr.name}. (valor/ref según tipo)`,
              }
            : { ok: false, message: r[1] };
        }

        // id = null;
        if (ast.expr.kind === "null") {
          const r = this.memory.setNull(name);
          return r[0]
            ? { ok: true, message: `✅ ${name} = null.` }
            : { ok: false, message: r[1] };
        }

        // id = "string";
        if (ast.expr.kind === "string") {
          if (slot.kind !== "ref") {
            return {
              ok: false,
              message: `❌ "${name}" es primitivo; no puede recibir String.`,
            };
          }
          if (slot.refAddr !== 0) {
            const e = this.memory.getHeap().get(slot.refAddr);
            if (!e || e.kind !== "string") {
              return {
                ok: false,
                message: `❌ Tipos incompatibles: "${name}" no es String.`,
              };
            }
          }
          this.memory.storeValue(name, Prim("string"), ast.expr.value);
          return {
            ok: true,
            message: `✅ ${name} actualizado (String por referencia).`,
          };
        }

        // Primitivo con literal
        if (isPrimSlot(slot)) {
          const value = exprToJs(ast.expr);
          const r = this.memory.setPrimitiveLiteral(name, value);
          return r[0]
            ? {
                ok: true,
                message: `✅ ${name} actualizado. 🧠 (escritura in-place)`,
              }
            : { ok: false, message: r[1] };
        }

        // Objetos/arrays literales no soportados en asignación directa
        return {
          ok: false,
          message:
            `❌ Asignación no soportada para "${name}". ` +
            `Usa identificadores (p. ej. p1 = p2;) o inicializa con declaración.`,
        };
      }

      // ARR[idx] = ...
      if (ast.target.kind === "index") {
        const name = ast.target.name;
        const idx = ast.target.index;

        if (ast.expr.kind === "ident") {
          const r = this.memory.setArrayIndexFromId(name, idx, ast.expr.name);
          return r[0]
            ? { ok: true, message: `✅ ${name}[${idx}] = ${ast.expr.name}.` }
            : { ok: false, message: r[1] };
        }

        if (ast.expr.kind === "null") {
          return {
            ok: false,
            message:
              `❌ ${name}[${idx}] = null no está soportado para arrays de primitivos. ` +
              `Para arrays de referencias, implementa soporte de null en Memory.setArrayIndex (ref32).`,
          };
        }

        const value = exprToJs(ast.expr);
        const r = this.memory.setArrayIndex(name, idx, value);
        return r[0]
          ? { ok: true, message: `✅ ${name}[${idx}] actualizado.` }
          : { ok: false, message: r[1] };
      }

      return { ok: false, message: `❌ L-value no soportado.` };
    } catch (e: any) {
      return {
        ok: false,
        message: `❌ Error ejecutando asignación: ${e?.message ?? String(e)}`,
      };
    }
  }

  // === MemType helpers =======================================================
  private elemMemType(typeName: string): MemType {
    if (typeName === "String") return Prim("string");
    if (Lexicon.hasType(typeName as any)) return Prim(typeName as any);
    const { schema } = this.schemas.get(typeName); // tipado explícito en SchemaRegistry.get
    return this.objFromSchema(schema);
  }

  private toMemType(typeName: string, isArray: boolean): MemType {
    if (isArray) {
      if (typeName === "String") return Arr(Prim("string"), "auto");
      if (Lexicon.hasType(typeName as any))
        return Arr(Prim(typeName as any), "auto");
      const { schema } = this.schemas.get(typeName);
      return Arr(this.objFromSchema(schema), "auto");
    }
    if (typeName === "String") return Prim("string");
    if (Lexicon.hasType(typeName as any)) return Prim(typeName as any);
    const { schema } = this.schemas.get(typeName);
    return this.objFromSchema(schema);
  }

  private objFromSchema(schema: ObjectSchema): MemType {
    if (!schema)
      throw new Error("Schema indefinido al construir MemType de objeto.");

    // Forzamos el tipo de los entries para que meta sea FieldSpec
    const fields = (Object.entries(schema) as Array<[string, FieldSpec]>).map(
      ([key, meta]) => {
        switch (meta.kind) {
          case "prim": {
            const t = meta.type === "String" ? Prim("string") : Prim(meta.type);
            return { key, type: t };
          }
          case "array": {
            const elem =
              meta.elem === "String" ? Prim("string") : Prim(meta.elem);
            return { key, type: Arr(elem, "auto") };
          }
          case "object": {
            const t = this.objFromSchema(meta.schema); // meta.schema: ObjectSchema
            return { key, type: t };
          }
        }
      }
    );

    return Obj(fields, true /*compact*/);
  }
} // 👈👈👈 CIERRE de la clase (faltaba este corchete)

// === Expr → JS ===============================================================
function exprToJs(expr: Expr): unknown {
  switch (expr.kind) {
    case "null":
      return null;
    case "number":
      return expr.value;
    case "boolean":
      return expr.value;
    case "string":
      return expr.value;
    case "char":
      return expr.value; // char como string(1)
    case "array":
      return expr.items.map(exprToJs);
    case "object": {
      const o: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(expr.fields)) o[k] = exprToJs(v);
      return o;
    }
  }
}
