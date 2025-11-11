// Tipos sin dependencias externas: compartidos entre panel e inspector
export type HexAddr = `0x${string}`;
export type ByteRange = { from: HexAddr; to: HexAddr };

export type UiRamItem = {
  id: string;
  source: "stack-prim" | "stack-ref" | "heap-header" | "heap-data";
  label: string;
  type: string;
  range: ByteRange;
  bytes: number;
  meta?: Record<string, unknown>;
};

/** ---- Inspectores (deben match con snapshot-builder) ---- */
export type UiInspectorArrayInlinePrim = {
  kind: "array-inline-prim";
  id: string; // "heap#X:data"
  header: HexAddr;
  dataPtr: HexAddr;
  length: number;
  elemType: string; // PrimitiveType
  elemSize: number;
  items: Array<{ index: number; range: ByteRange; preview: number | string }>;
};
export type UiInspectorArrayRef32 = {
  kind: "array-ref32";
  id: string; // "heap#X:data"
  header: HexAddr;
  dataPtr: HexAddr;
  length: number;
  items: Array<{
    index: number;
    ptrRange: ByteRange;
    ptr: HexAddr;
    target?: {
      kind: "string" | "array" | "object";
      headerRange: ByteRange;
      dataRange?: ByteRange;
    };
  }>;
};
export type UiInspectorObjectCompact = {
  kind: "object-compact";
  id: string; // "heap#X:header"
  header: HexAddr;
  fields: Array<{
    key: string;
    type: string; // PrimitiveType | "string" | "ptr32"
    inlineRange: ByteRange;
    preview: unknown;
    target?: {
      kind: "string" | "array" | "object";
      headerRange: ByteRange;
      dataRange?: ByteRange;
    };
  }>;
};

export type UiInspector =
  | UiInspectorArrayInlinePrim
  | UiInspectorArrayRef32
  | UiInspectorObjectCompact;
