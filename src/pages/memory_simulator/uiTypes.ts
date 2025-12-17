// src/app/MemoryApp/uiTypes.ts
import type { PrimitiveType } from "../../domain/RAM/memoria/layout";

/** Campo de un objeto compacto mostrado en StackView */
export type ObjField =
  | { kind: "prim";   key: string; type: PrimitiveType }
  | { kind: "array";  key: string; elem: PrimitiveType }
  | { kind: "record"; key: string; name: string }; // anidados (por si luego los usas)

export type ObjectInfo = {
  layout: "compact" | "dispersed";
  schema: ObjField[];
};
