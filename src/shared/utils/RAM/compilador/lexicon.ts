// src/shared/utils/RAM/compilador/lexicon.ts
// Almacén central de reglas del lenguaje (Java-like) para el simulador.
// Mantiene: palabras reservadas, tipos y sus rangos, y utilidades de validación.

export type PrimName =
  | "byte"
  | "short"
  | "int"
  | "long"
  | "float"
  | "double"
  | "char"
  | "boolean";

export type RefName = "String" | "array" | "object";

export type TypeName = PrimName | RefName;

export type PrimMeta = {
  kind: "prim";
  name: PrimName;
  sizeBytes: number;
  // Para numéricos enteros: rango exacto.
  // Para char: [0, 65535].
  // Para boolean: sin rango (usa true/false).
  // Para float/double: documentamos IEEE-754 y solo validamos finitud.
  signed?: boolean;
  min?: number | bigint;
  max?: number | bigint;
  numericKind?: "int" | "float";
};

export type RefMeta = {
  kind: "ref";
  name: RefName;
  // Para "array"/"object" son marcadores; "String" es ref con longitud dinámica.
  // Aquí no fijamos layout; eso lo define la VM (heap/layout.ts).
};

export type TypeMeta = PrimMeta | RefMeta;

export class Lexicon {
  // === Palabras reservadas de Java (+ literales + nombres de tipo) ===
  private static readonly javaKeywords = new Set<string>([
    "abstract",
    "assert",
    "boolean",
    "break",
    "byte",
    "case",
    "catch",
    "char",
    "class",
    "const",
    "continue",
    "default",
    "do",
    "double",
    "else",
    "enum",
    "extends",
    "final",
    "finally",
    "float",
    "for",
    "goto",
    "if",
    "implements",
    "import",
    "instanceof",
    "int",
    "interface",
    "long",
    "native",
    "new",
    "package",
    "private",
    "protected",
    "public",
    "return",
    "short",
    "static",
    "strictfp",
    "super",
    "switch",
    "synchronized",
    "this",
    "throw",
    "throws",
    "transient",
    "try",
    "void",
    "volatile",
    "while",
    "record",
    "var",
    "yield",
    "sealed",
    "permits",
    "non-sealed",
  ]);

  // ⬇️ Añadimos "undefined" aquí para prohibirlo como identificador
  private static readonly literalWords = new Set<string>([
    "null",
    "true",
    "false",
    "undefined",
  ]);

  // Los nombres de tipo también se prohíben como identificador por claridad docente.
  private static readonly typeNames: ReadonlySet<string> = new Set<string>([
    "byte",
    "short",
    "int",
    "long",
    "float",
    "double",
    "char",
    "boolean",
    "String",
    "array",
    "object",
  ]);

  /** Identificadores que este curso decide prohibir ad-hoc (opcional). */
  private static readonly extraForbidden = new Set<string>();

  // === Catálogo de tipos con tamaños y rangos ===
  private static readonly catalog: ReadonlyMap<TypeName, TypeMeta> = new Map<
    TypeName,
    TypeMeta
  >([
    [
      "byte",
      {
        kind: "prim",
        name: "byte",
        sizeBytes: 1,
        signed: true,
        numericKind: "int",
        min: -128,
        max: 127,
      },
    ],
    [
      "short",
      {
        kind: "prim",
        name: "short",
        sizeBytes: 2,
        signed: true,
        numericKind: "int",
        min: -32768,
        max: 32767,
      },
    ],
    [
      "int",
      {
        kind: "prim",
        name: "int",
        sizeBytes: 4,
        signed: true,
        numericKind: "int",
        min: -2147483648,
        max: 2147483647,
      },
    ],
    [
      "long",
      {
        kind: "prim",
        name: "long",
        sizeBytes: 8,
        signed: true,
        numericKind: "int",
        min: BigInt("-9223372036854775808"),
        max: BigInt("9223372036854775807"),
      },
    ],
    [
      "char",
      {
        kind: "prim",
        name: "char",
        sizeBytes: 2,
        signed: false,
        numericKind: "int",
        min: 0,
        max: 65535,
      },
    ],
    ["boolean", { kind: "prim", name: "boolean", sizeBytes: 1 }],
    [
      "float",
      { kind: "prim", name: "float", sizeBytes: 4, numericKind: "float" },
    ],
    [
      "double",
      { kind: "prim", name: "double", sizeBytes: 8, numericKind: "float" },
    ],

    ["String", { kind: "ref", name: "String" }],
    ["array", { kind: "ref", name: "array" }],
    ["object", { kind: "ref", name: "object" }],
  ]);

  // === API pública ===

  /** ¿Es un identificador prohibido por el lenguaje/curso? */
  static isForbiddenIdentifier(id: string): boolean {
    const s = id.trim();
    return (
      this.javaKeywords.has(s) ||
      this.literalWords.has(s) ||
      this.typeNames.has(s) ||
      this.extraForbidden.has(s)
    );
  }

  /** ¿Cumple la regla de identificadores? (Java-like) */
  static isValidIdentifier(id: string): boolean {
    if (!/^[$A-Za-z_][$A-Za-z0-9_]*$/.test(id)) return false;
    return !this.isForbiddenIdentifier(id);
  }

  // ======= Overloads para retorno tipado de metadatos =======
  static getTypeMeta(name: PrimName): PrimMeta;
  static getTypeMeta(name: RefName): RefMeta;
  static getTypeMeta(name: TypeName): TypeMeta;
  static getTypeMeta(name: TypeName): TypeMeta {
    const t = this.catalog.get(name);
    if (!t) throw new Error(`Tipo no registrado: ${name}`);
    return t;
  }

  /** ¿Existe el tipo en el catálogo? */
  static hasType(name: string): name is TypeName {
    return this.catalog.has(name as TypeName);
  }

  // ======= Overloads para sizeof (prims→bytes, refs→0 del payload) =======
  static sizeof(name: PrimName): number;
  static sizeof(name: RefName): 0;
  static sizeof(name: TypeName): number;
  static sizeof(name: TypeName): number {
    const meta = this.getTypeMeta(name);
    return meta.kind === "prim" ? meta.sizeBytes : 0;
  }

  /** Helpers de narrowing (por si te ayudan en otros módulos). */
  static isPrimMeta(meta: TypeMeta): meta is PrimMeta {
    return meta.kind === "prim";
  }
  static isRefMeta(meta: TypeMeta): meta is RefMeta {
    return meta.kind === "ref";
  }

  /** Valor prohibido a nivel de lenguaje (JS-specific, no existe en Java). */
  static isForbiddenValue(value: unknown): boolean {
    return value === undefined; // aquí puedes extender con más reglas si lo deseas
  }

  /** Valida si un literal cabe en el tipo primitivo. */
  static literalFits(type: PrimName, value: unknown): boolean {
    // ⬇️ Prohibimos undefined como valor literal para cualquier tipo
    if (value === undefined) return false;

    const meta = this.getTypeMeta(type); // PrimMeta

    if (meta.name === "boolean") return typeof value === "boolean";

    if (meta.name === "char") {
      if (typeof value === "number") {
        const num = value as number;
        return Number.isInteger(num) && num >= 0 && num <= 65535;
      }
      if (typeof value === "string") return value.length === 1;
      return false;
    }

    if (meta.numericKind === "int") {
      if (meta.name === "long") {
        // ACEPTAR SOLO number entero (sin BigInt).
        if (typeof value !== "number" || !Number.isInteger(value)) return false;

        // Limitación pedagógica/JS: exigimos que esté en el rango de enteros seguros de JS.
        // (Esto es un subconjunto del rango real de long en Java, pero evita imprecisiones.)
        if (value < Number.MIN_SAFE_INTEGER || value > Number.MAX_SAFE_INTEGER)
          return false;

        // Dentro del rango seguro → lo consideramos válido para long en el simulador.
        return true;
      } else {
        // byte/short/int como ya lo tienes
        if (typeof value !== "number" || !Number.isInteger(value)) return false;
        const num = value as number;
        const min = meta.min as number,
          max = meta.max as number;
        return num >= min && num <= max;
      }
    }

    if (meta.numericKind === "float") {
      if (typeof value !== "number") return false;
      const num = value as number;
      return Number.isFinite(num);
    }

    return false;
  }

  /** Convierte un número JS al dominio esperado (p.ej., fuerza int de 32 bits). */
  static coerceNumberTo(
    type: PrimName,
    value: number | bigint
  ): number | bigint {
    const meta = this.getTypeMeta(type); // PrimMeta

    if (meta.numericKind === "float") {
      return Number(value);
    }

    if (meta.name === "long") {
      const asBig =
        typeof value === "bigint" ? value : BigInt(Math.trunc(Number(value)));
      const min = meta.min as bigint,
        max = meta.max as bigint;
      return asBig < min ? min : asBig > max ? max : asBig;
    }

    const asNum = typeof value === "number" ? Math.trunc(value) : Number(value);
    const min = meta.min as number,
      max = meta.max as number;
    const clamped = Math.min(Math.max(asNum, min), max);
    return clamped | 0;
  }
}
