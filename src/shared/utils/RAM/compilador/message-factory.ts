// src/checkers/message-factory.ts
// Fábrica de mensajes docentes y consistentes para validadores.
// No depende de DOM/React. Solo arma strings.

import { Lexicon, type PrimName } from "./lexicon";
import type { PrimitiveLike } from "./primitive-value-validator";

export function prettyType(t: PrimitiveLike): string {
  return (t as string).toLowerCase() === "string" ? "String" : String(t);
}

export function prettyValue(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return `arreglo (longitud ${v.length})`;
  switch (typeof v) {
    case "string": return `cadena "${v}"`;
    case "number": {
      const num = v;
      if (Number.isNaN(num)) return "NaN";
      if (!Number.isFinite(num)) return num > 0 ? "+Infinity" : "-Infinity";
      return Number.isInteger(num) ? `entero ${num}` : `decimal ${num}`;
    }
    case "bigint": return `BigInt ${v}n`;
    case "boolean": return `boolean ${v}`;
    case "undefined": return "undefined";
    default: return "objeto";
  }
}

function expectedTextForPrim(t: PrimName): string {
  if (t === "boolean") return "boolean (solo true/false)";
  if (t === "char") return "char (entero 0..65535 o cadena de longitud 1, p. ej. \"A\")";

  const meta = Lexicon.getTypeMeta(t);
  if (meta.numericKind === "int") {
    const [min, max] = [meta.min!, meta.max!];
    return `${t} (entero, rango ${String(min)}..${String(max)})`;
  }
  if (meta.numericKind === "float") {
    return `${t} (número finito; no NaN, no ±Infinity)`;
  }
  return t;
}

export function expectedText(t: PrimitiveLike): string {
  return t === "String" ? "String (cadena de texto)" : expectedTextForPrim(t);
}

export function okDecl(name: string, t: PrimitiveLike): string {
  return `✅ ${name} es compatible con ${prettyType(t)}.`;
}
export function okInner(t: PrimitiveLike): string {
  return `✅ Valor compatible con ${prettyType(t)}.`;
}

export function badIdentifier(name: string): string {
  return [
    `❌ Identificador inválido: "${name}".`,
    `  • No puede ser palabra reservada, literal ni nombre de tipo.`,
    `  • Debe cumplir /[$A-Za-z_][$A-Za-z0-9_]*/.`
  ].join("\n");
}

export function typeMismatch(opts: {
  where?: string;               // p.ej. "arr[2]" o "p.meses[1]"
  expected: string;
  received: string;
  rule?: string;                // explicación corta
  hint?: string;                // sugerencia concreta
}): string {
  const header = opts.where ? `❌ Error de tipo en ${opts.where}:` : `❌ Error de tipo:`;
  const lines = [
    header,
    `  • esperado: ${opts.expected}`,
    `  • recibido: ${opts.received}`,
  ];
  if (opts.rule) lines.push(`  • regla: ${opts.rule}`);
  if (opts.hint) lines.push(`  • pista: ${opts.hint}`);
  return lines.join("\n");
}

export function arrayExpected(where: string, received: string): string {
  return [
    `❌ ${where}: se esperaba un arreglo (lista [])`,
    `  • recibido: ${received}`,
    `  • pista: En Java, un arreglo es una referencia; aquí representamos su contenido con una lista [].`
  ].join("\n");
}

export function arrayLenExact(where: string, expectedLen: number, got: number): string {
  return [
    `❌ ${where}: longitud incorrecta.`,
    `  • esperado: exactamente ${expectedLen}`,
    `  • recibido: ${got}`
  ].join("\n");
}

export function arrayLenMin(where: string, min: number, got: number): string {
  return [
    `❌ ${where}: longitud mínima no cumplida.`,
    `  • mínimo: ${min}`,
    `  • recibido: ${got}`
  ].join("\n");
}

export function arrayLenMax(where: string, max: number, got: number): string {
  return [
    `❌ ${where}: longitud máxima excedida.`,
    `  • máximo: ${max}`,
    `  • recibido: ${got}`
  ].join("\n");
}
