// src/shared//utils/RAM/memoria/memtype.ts
import type { PrimitiveType } from "./layout";

export type MemPrim = PrimitiveType;

export type MemType =
  | { tag: "prim"; name: MemPrim }
  | { tag: "array"; elem: MemType; mode?: "auto" | "inline-prim" | "ref32" }
  | {
      tag: "object";
      compact?: boolean;
      fields: Array<{ key: string; type: MemType }>;
    };

export const Prim = (name: MemPrim): MemType => ({ tag: "prim", name });
export const Arr = (
  elem: MemType,
  mode: "auto" | "inline-prim" | "ref32" = "auto"
): MemType => ({ tag: "array", elem, mode });
export const Obj = (
  fields: Array<{ key: string; type: MemType }>,
  compact = true
): MemType => ({ tag: "object", compact, fields });

// 👇 Type guards
export const isPrim = (t: MemType): t is { tag: "prim"; name: MemPrim } =>
  t.tag === "prim";

export const isString = (t: MemType): t is { tag: "prim"; name: "string" } =>
  t.tag === "prim" && t.name === "string";

export const isPrimNonString = (
  t: MemType
): t is { tag: "prim"; name: Exclude<MemPrim, "string"> } =>
  t.tag === "prim" && t.name !== "string";
