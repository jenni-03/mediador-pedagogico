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
  type ValidationResult,
} from "./primitive-value-validator";
import { ArrayValueValidator } from "./array-value-validator";
import { ObjectValueValidator } from "./object-value-validator";
import type { ObjectSchema } from "./object-value-validator";

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

export type Expr =
  | { kind: "number"; value: number }
  | { kind: "boolean"; value: boolean }
  | { kind: "null" }
  | { kind: "string"; value: string } // "hola"
  | { kind: "char"; value: string } // 'A' → string de 1 char
  | { kind: "array"; items: Expr[] } // {1,2,3} ó {"a","b"}
  | { kind: "object"; fields: Record<string, Expr> }; // {x:1, y:"a"}

// ======== Registro de esquemas para objetos ========

export class SchemaRegistry {
  private static schemas = new Map<string, ObjectSchema>();
  static register(typeName: string, schema: ObjectSchema) {
    this.schemas.set(typeName, schema);
  }
  static has(typeName: string): boolean {
    return this.schemas.has(typeName);
  }
  static get(typeName: string): ObjectSchema {
    const s = this.schemas.get(typeName);
    if (!s) throw new Error(`No hay esquema para el tipo objeto "${typeName}"`);
    return s;
  }
}

// ======== Parser (con preprocesado de comentarios) ========

export function parseDeclaration(source: string): DeclAST {
  const src = preprocess(source);

  // Captura: Tipo [ ]? nombre = (inicializador hasta ';') ;
  // [\s\S]*? = non-greedy multiline
  const re =
    /^\s*([A-Za-z_]\w*)(\s*\[\s*\])?\s+([A-Za-z_]\w*)\s*=\s*([\s\S]*?)\s*;\s*$/;
  const m = src.match(re);
  if (!m) {
    throw new Error(
      `No pude reconocer la declaración. Formato esperado: Tipo[[]] nombre = inicializador;`
    );
  }
  const [, rawType, arrSuffix, name, rawInit] = m;
  const isArray = !!arrSuffix;

  const typeName = rawType;
  const initExpr = parseExpr(rawInit.trim());

  return { kind: "declaration", typeName, isArray, name, init: initExpr };
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

  // Número (decimal o entero)
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

// ======== Bridge: AST → validadores ========

export type EvalResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export class CommandInterpreter {
  constructor(
    private readonly schema: typeof SchemaRegistry = SchemaRegistry
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

    try {
      if (!ast.isArray) {
        // Caso no arreglo
        if (isPrimOrString) {
          const value = buildJsValue(ast.init);
          return new PrimitiveValueValidator(
            typeName === "String" ? "String" : (typeName as PrimitiveLike),
            ast.name,
            value
          ).validate();
        } else {
          const schema = this.schema.get(typeName);
          const value = buildJsValue(ast.init);
          return new ObjectValueValidator(schema, ast.name, value).validate();
        }
      } else {
        // Caso arreglo
        if (isPrimOrString) {
          const arr = buildJsArray(ast.init);
          return new ArrayValueValidator(
            typeName === "String" ? "String" : (typeName as PrimitiveLike),
            ast.name,
            arr
          ).validate();
        } else {
          // Arreglo de objetos
          const schema = this.schema.get(typeName);
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
        message: `❌ Error al interpretar el inicializador: ${
          e?.message ?? String(e)
        }`,
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
