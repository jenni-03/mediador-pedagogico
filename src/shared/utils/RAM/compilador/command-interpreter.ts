// src/checkers/command-interpreter.ts
// -----------------------------------------------------------------------------
// Pipeline: texto → AST → validación con nuestros validadores.
// Soporta solo declaraciones: "<Type>[[]] ident = <initializer>;"
// - Si Type ∈ Lexicon (primitivo o "String") → primitivo o arreglo de primitivo
// - Si Type ∈ SchemaRegistry → objeto o arreglo de objeto
//
// Notas de robustez del parser:
// * Se eliminan comentarios // y /* */ respetando strings/chars
// * Soporta inicializadores multilínea y con llaves anidadas
// * Captura el inicializador hasta el ';' final
// -----------------------------------------------------------------------------

import { Lexicon } from "./lexicon";
import {
  PrimitiveValueValidator,
  type PrimitiveLike,
} from "./primitive-value-validator";
import { ArrayValueValidator } from "./array-value-validator";
import { ObjectValueValidator } from "./object-value-validator";
import type { ObjectSchema } from "./object-value-validator";
import type { PrimitiveType } from "../memoria/layout";
import type { TypeLikeSummary } from "../memoria/Memory";
// Re-export para tests que importan desde aquí
export type { ObjectSchema } from "./object-value-validator";

// ======== Tipos ========

export type DeclAST = {
  kind: "declaration";
  typeName: string; // "int", "String", "Persona", etc.
  isArray: boolean; // true si "int[]" o "Persona[]"
  name: string; // identificador
  init: Expr; // expresión del lado derecho
};

export type ObjectKind = "class" | "record" | "struct";

export type TypeDefAST = {
  kind: "typeDef";
  objectKind: ObjectKind; // "class" | "record" | "struct"
  typeName: string;
  fields: Array<{
    name: string;
    spec:
      | { kind: "prim"; type: PrimitiveLike | "String" }
      | { kind: "array"; elem: PrimitiveLike | "String" };
  }>;
};

export type Expr =
  | { kind: "number"; value: number }
  | { kind: "boolean"; value: boolean }
  | { kind: "null" }
  | { kind: "string"; value: string } // "hola"
  | { kind: "char"; value: string } // 'A' → string de 1 char
  | { kind: "array"; items: Expr[] } // {1,2,3} ó {"a","b"}
  | { kind: "object"; fields: Record<string, Expr> } // {x:1, y:"a"}
  | { kind: "newArray"; length: number } // ← NUEVO
  | { kind: "absent" }
  | { kind: "ident"; name: string };

// --- Soporte local para consultar tipos de variables existentes (sin acoplar rutas) ---
type FieldSig = { key: string; type: PrimitiveType | "ptr32" };

type MemoryLike = {
  hasVar(name: string): boolean;
  getVarTypeSummary(name: string): TypeLikeSummary | null;
};

// comparación estricta de schemas (mismo orden, misma aridad, mismas claves/tipos)
function sameSchema(a: FieldSig[], b: FieldSig[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].key !== b[i].key || a[i].type !== b[i].type) return false;
  }
  return true;
}

// ======== Registro de esquemas para objetos ========
/** Intenta parsear:   class|record|struct  TypeName ( fieldList ) ; */
export function parseTypeDef(source: string): TypeDefAST {
  const src = preprocess(source);
  const m = src.match(
    /^\s*(class|record|struct)\s+([A-Za-z_]\w*)\s*\(\s*([\s\S]*?)\s*\)\s*;\s*$/
  );
  if (!m)
    throw new Error("No es una definición de tipo (class/record/struct).");
  const objectKind = m[1] as ObjectKind;
  const typeName = m[2];
  const fieldsSrc = m[3].trim();

  const fields: TypeDefAST["fields"] = [];
  if (fieldsSrc !== "") {
    const parts = splitTopLevel(fieldsSrc, ","); // ya tienes splitTopLevel
    for (const raw of parts) {
      const spec = raw.trim();
      if (!spec) continue;

      // Soporta:   Tipo[]?  nombre[]?   (al estilo que ya soportas en declaraciones)
      const fm = spec.match(
        /^\s*([A-Za-z_]\w*)(\s*\[\s*\])?\s+([A-Za-z_]\w*)(\s*\[\s*\])?\s*$/
      );
      if (!fm) {
        throw new Error(
          `Campo no reconocido: "${spec}". Usa p.ej. "int id" o "String nombre" o "int[] meses".`
        );
      }
      const [, rawType, arrAfterType, rawName, arrAfterName] = fm;
      const dims = (arrAfterType ? 1 : 0) + (arrAfterName ? 1 : 0);
      if (dims > 1) {
        throw new Error(`Solo arreglos 1D en campos. Revisa "${spec}".`);
      }
      const isArray = dims === 1;

      // Validar tipo permitido en campos: primitivos o String
      const typeNameTok = rawType;
      const isPrim = Lexicon.hasType(typeNameTok as any);
      const isString = typeNameTok === "String";
      if (!isPrim && !isString) {
        // Para este sprint, mantenemos simple: solo primitivos y String en campos
        // (si luego quieres objetos anidados, aquí puedes extender a kind:"object")
        throw new Error(
          `Tipo de campo no soportado en este sprint: "${typeNameTok}". Usa primitivos o String.`
        );
      }

      const name = rawName;
      if (!/^[A-Za-z_]\w*$/.test(name)) {
        throw new Error(`Nombre de campo inválido: "${name}".`);
      }

      const fieldSpec = isArray
        ? ({
            kind: "array",
            elem: isString ? "String" : (typeNameTok as PrimitiveLike),
          } as const)
        : ({
            kind: "prim",
            type: isString ? "String" : (typeNameTok as PrimitiveLike),
          } as const);

      fields.push({ name, spec: fieldSpec });
    }
  }

  return { kind: "typeDef", objectKind, typeName, fields };
}

/**
 * Intenta registrar un tipo. Si no matchea como typedef, devuelve { matched:false }.
 * Si matchea, registra en SchemaRegistry y devuelve { matched:true, ok:..., message:... }.
 */
export function defineType(
  source: string
): ({ matched: true } & EvalResult) | { matched: false } {
  try {
    const ast = parseTypeDef(source);
    // Construir ObjectSchema a partir de fields
    const schema: ObjectSchema = {};
    for (const f of ast.fields) {
      if (f.spec.kind === "prim") {
        schema[f.name] = { kind: "prim", type: f.spec.type };
      } else {
        schema[f.name] = { kind: "array", elem: f.spec.elem };
      }
    }
    SchemaRegistry.register(ast.typeName, schema, ast.objectKind);
    return {
      matched: true,
      ok: true,
      message: `✅ ${ast.objectKind} ${ast.typeName} registrado con ${ast.fields.length} campo(s).`,
    };
  } catch (e: any) {
    // Si no era typedef, indicamos que no matcheó; si sí era y falló, devolvemos error.
    const s = String(e?.message ?? e);
    if (s.includes("No es una definición de tipo")) {
      return { matched: false };
    }
    return {
      matched: true,
      ok: false,
      message: `❌ Error en definición de tipo: ${s}`,
    };
  }
}

export class SchemaRegistry {
  private static schemas = new Map<
    string,
    { schema: ObjectSchema; kind: ObjectKind }
  >();

  static register(
    typeName: string,
    schema: ObjectSchema,
    kind: ObjectKind = "class"
  ) {
    this.schemas.set(typeName, { schema, kind });
  }

  /** Compat: devuelve SOLO el ObjectSchema (lo que esperan los validadores). */
  static get(typeName: string): { schema: ObjectSchema; kind: ObjectKind } {
    const s = this.schemas.get(typeName);
    if (!s) throw new Error(`No hay esquema para "${typeName}"`);
    return s;
  }

  /** Si necesitas el "kind" (class/record/struct) en otra parte. */
  static getKind(typeName: string): ObjectKind {
    const s = this.schemas.get(typeName);
    if (!s) throw new Error(`No hay esquema para "${typeName}"`);
    return s.kind;
  }

  /** Meta completo por si quieres ambas cosas. */
  static getMeta(typeName: string): { schema: ObjectSchema; kind: ObjectKind } {
    const s = this.schemas.get(typeName);
    if (!s) throw new Error(`No hay esquema para "${typeName}"`);
    return s;
  }

  static has(typeName: string) {
    return this.schemas.has(typeName);
  }
}

// ======== Parser (con preprocesado de comentarios) ========

export function parseDeclaration(source: string): DeclAST {
  const src = preprocess(source);

  // Soporta: Tipo[ ]? nombre[ ]? = init ;
  const withInit =
    /^\s*([A-Za-z_]\w*)(\s*\[\s*\])?\s+([A-Za-z_]\w*)(\s*\[\s*\])?\s*=\s*([\s\S]*?)\s*;\s*$/;

  // Soporta: Tipo[ ]? nombre[ ]? ;
  const noInit =
    /^\s*([A-Za-z_]\w*)(\s*\[\s*\])?\s+([A-Za-z_]\w*)(\s*\[\s*\])?\s*;\s*$/;

  let m = src.match(withInit);
  if (m) {
    const [, rawType, arrAfterType, name, arrAfterName, rawInit] = m;

    const dims = (arrAfterType ? 1 : 0) + (arrAfterName ? 1 : 0);
    if (dims > 1) {
      throw new Error(
        `Por ahora solo soportamos arreglos 1D. Detecté ${dims} corchetes (p.ej. int[] a[]).`
      );
    }
    const isArray = dims === 1;
    const typeName = rawType;
    const t = rawInit.trim();

    // 1) new Tipo[n]  (ya lo tenías)
    const mNew = t.match(/^new\s+([A-Za-z_]\w*)\s*\[\s*(\d+)\s*\]\s*$/);
    if (isArray && mNew) {
      const newType = mNew[1];
      if (newType !== typeName) {
        throw new Error(
          `Tipo del 'new' no coincide: declaraste ${typeName}[] pero escribiste new ${newType}[...].`
        );
      }
      return {
        kind: "declaration",
        typeName,
        isArray,
        name,
        init: { kind: "newArray", length: Number(mNew[2]) },
      };
    }
    /* 1b) NUEVO: new Tipo[]{ a, b, c }  (Java-style initializer) */
    const mNewInit = t.match(
      /^new\s+([A-Za-z_]\w*)\s*\[\s*\]\s*\{\s*([\s\S]*?)\s*\}\s*$/
    );
    if (isArray && mNewInit) {
      const newType = mNewInit[1];
      if (newType !== typeName) {
        throw new Error(
          `Tipo del 'new' no coincide: declaraste ${typeName}[] pero escribiste new ${newType}[]{...}.`
        );
      }
      const inner = mNewInit[2].trim();
      const items =
        inner === "" ? [] : splitTopLevel(inner, ",").map(parseExpr);
      return {
        kind: "declaration",
        typeName,
        isArray,
        name,
        init: { kind: "array", items },
      };
    }
    // 2) new Tipo(arg1, arg2, ...)  →  reescribir a objeto literal con el orden del schema
    //    (solo para NO array)
    const mCtor = !isArray
      ? t.match(/^new\s+([A-Za-z_]\w*)\s*\(([\s\S]*)\)\s*$/)
      : null;
    if (mCtor) {
      const newType = mCtor[1];
      if (newType !== typeName) {
        throw new Error(
          `Tipo del 'new' no coincide: declaraste ${typeName} pero escribiste new ${newType}(...).`
        );
      }

      const argsSrc = mCtor[2].trim();
      const args = argsSrc === "" ? [] : splitTopLevel(argsSrc, ",");

      // Usamos el schema registrado para obtener el orden de campos
      const { schema } = SchemaRegistry.get(typeName);
      const keys = Object.keys(schema);

      if (args.length !== keys.length) {
        throw new Error(
          `Constructor de ${typeName} espera ${keys.length} argumentos en orden: ${keys.join(
            ", "
          )}; recibidos ${args.length}.`
        );
      }

      const fields: Record<string, Expr> = {};
      for (let i = 0; i < keys.length; i++) {
        fields[keys[i]] = parseExpr(args[i]);
      }

      return {
        kind: "declaration",
        typeName,
        isArray,
        name,
        init: { kind: "object", fields },
      };
    }

    // 3) Resto de inicializadores (números, strings, {…}, etc.)
    return {
      kind: "declaration",
      typeName,
      isArray,
      name,
      init: parseExpr(t),
    };
  }

  m = src.match(noInit);
  if (m) {
    const [, rawType, arrAfterType, name, arrAfterName] = m;

    const dims = (arrAfterType ? 1 : 0) + (arrAfterName ? 1 : 0);
    if (dims > 1) {
      throw new Error(
        `Por ahora solo soportamos arreglos 1D. Detecté ${dims} corchetes (p.ej. int[] a[]).`
      );
    }
    const isArray = dims === 1;

    return {
      kind: "declaration",
      typeName: rawType,
      isArray,
      name,
      init: { kind: "absent" },
    };
  }

  throw new Error(
    `No pude reconocer la declaración. Formatos:
     • Tipo nombre = inicializador;
     • Tipo[] nombre = inicializador;   • Tipo nombre[] = inicializador;
     • Tipo nombre;
     • Tipo[] nombre = new Tipo[n];     • Tipo nombre[] = new Tipo[n];`
  );
}

function parseExpr(s: string): Expr {
  const t = s.trim();

  // String literal "..."
  if (/^"(?:[^"\\]|\\.)*"$/.test(t)) {
    return { kind: "string", value: unescapeString(t.slice(1, -1)) };
  }

  // Char literal 'A' (1 char)
  if (/^'(?:[^'\\]|\\.)'$/.test(t)) {
    return { kind: "char", value: unescapeString(t.slice(1, -1)) };
  }

  // null / true / false
  if (t === "null") return { kind: "null" };
  if (t === "true") return { kind: "boolean", value: true };
  if (t === "false") return { kind: "boolean", value: false };

  // Array u Objeto con llaves { ... }
  if (t.startsWith("{") && t.endsWith("}")) {
    const inner = t.slice(1, -1).trim();
    if (!inner) return { kind: "array", items: [] }; // {} → array vacío

    // Heurística: si hay ':' a nivel top → objeto
    if (hasTopLevelColon(inner)) {
      const pairs = splitTopLevel(inner, ",");
      const fields: Record<string, Expr> = {};
      for (const p of pairs) {
        const [k, v] = splitTopLevelOnce(p, ":");
        const key = k.trim();
        if (!/^[A-Za-z_]\w*$/.test(key)) {
          throw new Error(`Clave de objeto inválida: "${key}"`);
        }
        fields[key] = parseExpr(v);
      }
      return { kind: "object", fields };
    } else {
      // array {a, b, c}
      const parts = splitTopLevel(inner, ",");
      return { kind: "array", items: parts.map(parseExpr) };
    }
  }
  // Identificador simple
  if (/^[A-Za-z_]\w*$/.test(t)) {
    return { kind: "ident", name: t };
  }

  // Número
  if (/^[+-]?\d+(?:\.\d+)?$/.test(t)) {
    return { kind: "number", value: Number(t) };
  }

  // Si llega aquí, no reconocimos la expresión
  throw new Error(`Expresión no reconocida: ${t}`);
}

// ======== Helpers de split top-level (ignoran llaves y comillas) ========

function splitTopLevel(s: string, sep: string): string[] {
  const out: string[] = [];
  let buf = "";
  let depth = 0;
  let inS = false,
    inC = false; // "string", 'char'
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const prev = s[i - 1];

    if (!inS && !inC) {
      if (ch === "{") {
        depth++;
        buf += ch;
        continue;
      }
      if (ch === "}") {
        depth--;
        buf += ch;
        continue;
      }
      if (ch === '"') {
        inS = true;
        buf += ch;
        continue;
      }
      if (ch === "'") {
        inC = true;
        buf += ch;
        continue;
      }
      if (depth === 0 && ch === sep) {
        out.push(buf.trim());
        buf = "";
        continue;
      }
      buf += ch;
      continue;
    }

    // dentro de string/char
    if (inS) {
      if (ch === '"' && prev !== "\\") {
        inS = false;
        buf += ch;
        continue;
      }
      buf += ch;
      continue;
    }
    if (inC) {
      if (ch === "'" && prev !== "\\") {
        inC = false;
        buf += ch;
        continue;
      }
      buf += ch;
      continue;
    }
  }
  if (buf.trim() !== "") out.push(buf.trim());
  return out;
}

function splitTopLevelOnce(s: string, sep: string): [string, string] {
  let depth = 0;
  let inS = false,
    inC = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i],
      prev = s[i - 1];
    if (!inS && !inC) {
      if (ch === "{") {
        depth++;
        continue;
      }
      if (ch === "}") {
        depth--;
        continue;
      }
      if (ch === '"') {
        inS = true;
        continue;
      }
      if (ch === "'") {
        inC = true;
        continue;
      }
      if (depth === 0 && ch === sep) {
        return [s.slice(0, i), s.slice(i + 1)];
      }
    } else {
      if (inS && ch === '"' && prev !== "\\") inS = false;
      if (inC && ch === "'" && prev !== "\\") inC = false;
    }
  }
  throw new Error(`Se esperaba separador "${sep}" en: ${s}`);
}

function hasTopLevelColon(s: string): boolean {
  try {
    splitTopLevelOnce(s, ":");
    return true;
  } catch {
    return false;
  }
}

function unescapeString(x: string): string {
  // Soporta \" \\ \n \t \r \'
  return x.replace(/\\(["\\ntr'])/g, (_, g1) => {
    switch (g1) {
      case '"':
        return '"';
      case "'":
        return "'";
      case "\\":
        return "\\";
      case "n":
        return "\n";
      case "t":
        return "\t";
      case "r":
        return "\r";
      default:
        return g1;
    }
  });
}

// ======== Preproceso: quita comentarios respetando strings/chars ========

function preprocess(src: string): string {
  // normaliza saltos de línea
  const s = src.replace(/\r\n?/g, "\n");
  return stripCommentsPreservingStrings(s).trim();
}

function stripCommentsPreservingStrings(input: string): string {
  let out = "";
  let inS = false; // dentro de "..."
  let inC = false; // dentro de '...'
  let inLine = false; // dentro de //
  let inBlock = false; // dentro de /* ... */
  let esc = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];

    // Dentro de comentario de línea
    if (inLine) {
      if (ch === "\n") {
        inLine = false;
        out += "\n";
      }
      continue;
    }

    // Dentro de comentario de bloque
    if (inBlock) {
      if (ch === "*" && next === "/") {
        inBlock = false;
        i++; // saltar '/'
      }
      continue;
    }

    // Dentro de string
    if (inS) {
      out += ch;
      if (esc) {
        esc = false;
      } else if (ch === "\\") {
        esc = true;
      } else if (ch === '"') {
        inS = false;
      }
      continue;
    }

    // Dentro de char
    if (inC) {
      out += ch;
      if (esc) {
        esc = false;
      } else if (ch === "\\") {
        esc = true;
      } else if (ch === "'") {
        inC = false;
      }
      continue;
    }

    // Fuera de strings/chars: detectar comienzos de comentarios
    if (ch === "/" && next === "/") {
      inLine = true;
      i++; // saltar el segundo '/'
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlock = true;
      i++; // saltar '*'
      continue;
    }

    // Apertura de strings/chars
    if (ch === '"') {
      inS = true;
      out += ch;
      continue;
    }
    if (ch === "'") {
      inC = true;
      out += ch;
      continue;
    }

    out += ch;
  }
  return out;
}
// === NUEVO: AST para asignaciones =============================
export type LValue =
  | { kind: "var"; name: string }
  | { kind: "index"; name: string; index: number };

export type AssignAST = {
  kind: "assign";
  target: LValue;
  expr: Expr;
};

// Parseo simple:  id = expr;   |   id[123] = expr;
export function parseAssignment(source: string): AssignAST {
  const src = preprocess(source);

  // id[index] = expr;
  {
    const m = src.match(
      /^\s*([A-Za-z_]\w*)\s*\[\s*(\d+)\s*\]\s*=\s*([\s\S]*?)\s*;\s*$/
    );
    if (m) {
      const [, name, idx, rhs] = m;
      return {
        kind: "assign",
        target: { kind: "index", name, index: Number(idx) },
        expr: parseExpr(rhs.trim()),
      };
    }
  }

  // id = expr;
  {
    const m = src.match(/^\s*([A-Za-z_]\w*)\s*=\s*([\s\S]*?)\s*;\s*$/);
    if (m) {
      const [, name, rhs] = m;
      return {
        kind: "assign",
        target: { kind: "var", name },
        expr: parseExpr(rhs.trim()),
      };
    }
  }

  throw new Error(
    `No reconocí una asignación. Formatos: id = expr;  |  id[n] = expr;`
  );
}

// Validación liviana (el tipo real lo verifica Memory en ejecución)
export function validateAssignment(src: string): EvalResult {
  try {
    const ast = parseAssignment(src);
    if (ast.target.kind === "index") {
      if (!Number.isInteger(ast.target.index) || ast.target.index < 0) {
        return { ok: false, message: `❌ El índice debe ser un entero ≥ 0.` };
      }
      return {
        ok: true,
        message: `✅ Asignación a ${ast.target.name}[${ast.target.index}].`,
      };
    }
    return { ok: true, message: `✅ Asignación a ${ast.target.name}.` };
  } catch (e: any) {
    return { ok: false, message: `❌ ${e?.message ?? String(e)}` };
  }
}

// ======== Bridge: AST → validadores ========

export type EvalResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export class CommandInterpreter {
  constructor(
    private readonly schema: typeof SchemaRegistry = SchemaRegistry,
    private readonly memory?: MemoryLike
  ) {}

  /** Valida una declaración: usa el validador adecuado según tipo. */
  validateDeclaration(src: string): EvalResult {
    const ast = parseDeclaration(src);

    const typeName = ast.typeName;
    const isPrimOrString =
      Lexicon.hasType(typeName as any) || typeName === "String";
    const isObject = !isPrimOrString && this.schema.has(typeName);

    if (!isPrimOrString && !isObject) {
      return {
        ok: false,
        message: `❌ Tipo desconocido: "${typeName}". Regístralo en SchemaRegistry o en Lexicon.`,
      };
    }

    // Ramas nuevas primero
    if (ast.init.kind === "absent") {
      // Aceptamos: prim sin init (p.ej. int x;)
      if (!ast.isArray && isPrimOrString) {
        return {
          ok: true,
          message: `✅ Declaración de ${typeName} ${ast.name} (sin inicializador).`,
        };
      }
      // Para este sprint, forzamos que los arreglos sin init usen new Tipo[n]
      if (ast.isArray) {
        return {
          ok: false,
          message: `❌ Para reservar un arreglo usa: ${typeName}[] ${ast.name} = new ${typeName}[n];`,
        };
      }
      // Objetos sin init (null) los podemos habilitar luego.
      return {
        ok: false,
        message: `❌ Aún no soportamos declaración sin inicializador para "${typeName}".`,
      };
    }

    if (ast.init.kind === "newArray") {
      if (!ast.isArray) {
        return {
          ok: false,
          message: `❌ "new ${typeName}[n]" solo tiene sentido con ${typeName}[]`,
        };
      }
      if (!Number.isInteger(ast.init.length) || ast.init.length < 0) {
        return {
          ok: false,
          message: `❌ El tamaño del arreglo debe ser entero ≥ 0.`,
        };
      }
      return {
        ok: true,
        message: `✅ ${ast.name} será un arreglo de ${typeName} de tamaño ${ast.init.length}.`,
      };
    }

    // 1c) NUEVO: inicializar desde otra variable: int x = y;  Persona p2 = p;  int[] b = a; ...
    if (ast.init.kind === "ident") {
      const from = ast.init.name;

      if (!this.memory) {
        return {
          ok: false,
          message:
            "❌ No puedo resolver inicializadores por identificador sin un contexto de memoria.",
        };
      }
      const sum = this.memory.getVarTypeSummary(from);
      if (!sum) {
        return {
          ok: false,
          message: `❌ Variable fuente "${from}" no existe o es null.`,
        };
      }

      // Caso NO array
      if (!ast.isArray) {
        if (isPrimOrString) {
          // Primitivo o String
          if (typeName === "String") {
            if (sum.category === "string") {
              return {
                ok: true,
                message: `✅ ${typeName} ${ast.name} inicializado desde ${from}.`,
              };
            }
            return {
              ok: false,
              message: `❌ Tipos incompatibles: declaraste String pero "${from}" no es String.`,
            };
          } else {
            // primitivo exacto (sin promociones por ahora)
            if (
              sum.category === "prim" &&
              sum.type === (typeName as PrimitiveLike)
            ) {
              return {
                ok: true,
                message: `✅ ${typeName} ${ast.name} inicializado desde ${from}.`,
              };
            }
            const got =
              sum.category === "prim"
                ? sum.type
                : sum.category === "string"
                  ? "String"
                  : "no-prim";
            return {
              ok: false,
              message: `❌ Tipos incompatibles: declaraste ${typeName} pero "${from}" es ${got}.`,
            };
          }
        } else {
          // Objeto con schema
          if (!this.schema.has(typeName)) {
            return {
              ok: false,
              message: `❌ Tipo desconocido: "${typeName}". Regístralo en SchemaRegistry.`,
            };
          }
          const { schema } = this.schema.get(typeName);
          const target: FieldSig[] = Object.entries(schema).map(([key, def]) =>
            def.kind === "prim"
              ? {
                  key,
                  type: (def.type === "String"
                    ? "string"
                    : def.type) as PrimitiveType,
                }
              : { key, type: "ptr32" as const }
          );

          if (sum.category !== "object") {
            return {
              ok: false,
              message: `❌ Tipos incompatibles: declaraste ${typeName} (objeto) pero "${from}" no es objeto.`,
            };
          }
          if (!sameSchema(target, sum.schema)) {
            return {
              ok: false,
              message: `❌ Schema incompatible entre ${typeName} y "${from}".`,
            };
          }
          return {
            ok: true,
            message: `✅ ${typeName} ${ast.name} inicializado desde ${from}.`,
          };
        }
      }

      // Caso ARRAY
      if (ast.isArray) {
        if (isPrimOrString) {
          // Arreglo de primitivos o de String
          if (typeName === "String") {
            if (sum.category === "array-string") {
              return {
                ok: true,
                message: `✅ ${typeName}[] ${ast.name} inicializado desde ${from}.`,
              };
            }
            return {
              ok: false,
              message: `❌ Arreglo incompatible: esperabas String[] y "${from}" no es String[].`,
            };
          } else {
            if (
              sum.category === "array-prim" &&
              sum.elem === (typeName as PrimitiveLike)
            ) {
              return {
                ok: true,
                message: `✅ ${typeName}[] ${ast.name} inicializado desde ${from}.`,
              };
            }
            const got =
              sum.category === "array-prim"
                ? `${sum.elem}[]`
                : sum.category === "array-string"
                  ? "String[]"
                  : "no-array-prim";
            return {
              ok: false,
              message: `❌ Arreglo incompatible: esperabas ${typeName}[] y "${from}" es ${got}.`,
            };
          }
        } else {
          // Arreglo de objetos
          if (!this.schema.has(typeName)) {
            return {
              ok: false,
              message: `❌ Tipo desconocido: "${typeName}". Regístralo en SchemaRegistry.`,
            };
          }
          const { schema } = this.schema.get(typeName);
          const elemSig: FieldSig[] = Object.entries(schema).map(
            ([key, def]) =>
              def.kind === "prim"
                ? {
                    key,
                    type: (def.type === "String"
                      ? "string"
                      : def.type) as PrimitiveType,
                  }
                : { key, type: "ptr32" as const }
          );

          if (sum.category !== "array-object") {
            return {
              ok: false,
              message: `❌ Arreglo incompatible: esperabas ${typeName}[] y "${from}" no es arreglo de objetos.`,
            };
          }
          if (!sameSchema(elemSig, sum.schema)) {
            return {
              ok: false,
              message: `❌ Arreglo incompatible: schema de ${typeName} no coincide con el de "${from}".`,
            };
          }
          return {
            ok: true,
            message: `✅ ${typeName}[] ${ast.name} inicializado desde ${from}.`,
          };
        }
      }
    }

    try {
      if (!ast.isArray) {
        if (isPrimOrString) {
          const value = buildJsValue(ast.init);
          return new PrimitiveValueValidator(
            typeName === "String" ? "String" : (typeName as PrimitiveLike),
            ast.name,
            value
          ).validate();
        } else {
          const { schema } = this.schema.get(typeName);
          const value = buildJsValue(ast.init);
          return new ObjectValueValidator(schema, ast.name, value).validate();
        }
      } else {
        if (isPrimOrString) {
          const arr = buildJsArray(ast.init);
          return new ArrayValueValidator(
            typeName === "String" ? "String" : (typeName as PrimitiveLike),
            ast.name,
            arr
          ).validate();
        } else {
          const { schema } = this.schema.get(typeName);
          const arr = buildJsArray(ast.init);
          for (let i = 0; i < arr.length; i++) {
            const r = new ObjectValueValidator(schema, arr[i], {
              path: `${ast.name}[${i}]`,
            }).validate();
            if (!r.ok) return r;
          }
          return {
            ok: true,
            message: `✅ ${ast.name} es un arreglo de ${typeName} con ${arr.length} elementos válidos.`,
          };
        }
      }
    } catch (e: any) {
      return {
        ok: false,
        message: `❌ Error al interpretar el inicializador: ${e?.message ?? String(e)}`,
      };
    }
  }
}

// ======== Builders: Expr → JS ========

function buildJsValue(expr: Expr): unknown {
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
      return expr.value; // char: string de 1 char (o el validador podrá quejarse)
    case "array":
      return expr.items.map(buildJsValue);
    case "object": {
      const o: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(expr.fields)) {
        o[k] = buildJsValue(v);
      }
      return o;
    }
  }
}

function buildJsArray(expr: Expr): unknown[] {
  if (expr.kind !== "array") {
    throw new Error(`Se esperaba array {..} como inicializador de arreglo.`);
  }
  return expr.items.map(buildJsValue);
}
