import { Memory, PrimitiveType } from "./Memory";

type CastOk = { ok: true; value: any };
type CastErr = { ok: false; error: string };
type CastResult = CastOk | CastErr;

const TYPES = "(boolean|char|byte|short|int|long|float|double|string)";
const ID = "([A-Za-z_]\\w*)";
const JAVA_KEYWORDS = new Set([
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
  "true",
  "false",
  "null",
]);

function idError(id: string, ctx: string): string | null {
  if (/^\d/.test(id))
    return `${ctx}: el identificador no puede iniciar con dígito.`;
  if (JAVA_KEYWORDS.has(id.toLowerCase()))
    return `${ctx}: '${id}' es palabra reservada en Java.`;
  return null;
}

function rx(source: string, flags = "i") {
  return new RegExp(source, flags);
}

export class MemoryC extends Memory {
  constructor() {
    super();
  }

  /**
   * Analiza una instrucción y almacena en la memoria.
   * @returns `[true, mensaje]` si es válido, `[false, error]` si hay un problema.
   */
  parseAndStore(input: string): [true, string] | [false, string] {
    input = input.trim();

    // 1) Objeto: object <nombre> = new object(...);
    if (
      rx(`^object\\s+${ID}\\s*=\\s*new\\s+object\\s*\\((.*)\\)\\s*;\\s*$`).test(
        input
      )
    ) {
      return this.parseObject(input);
    }

    // 2) Array con {} – forma A: tipo[] nombre = {...};
    //                         forma B: tipo nombre[] = {...};
    if (
      rx(
        `^${TYPES}\\s*\\[\\s*\\]\\s+${ID}\\s*=\\s*\\{\\s*([^}]*)\\s*\\}\\s*;\\s*$`
      ).test(input) ||
      rx(
        `^${TYPES}\\s+${ID}\\s*\\[\\s*\\]\\s*=\\s*\\{\\s*([^}]*)\\s*\\}\\s*;\\s*$`
      ).test(input)
    ) {
      return this.parseArray(input);
    }
    //    + NUEVO: con new tipo[]{...}
    if (
      rx(
        `^${TYPES}\\s*\\[\\s*\\]\\s+${ID}\\s*=\\s*\\{\\s*([^}]*)\\s*\\}\\s*;\\s*$`
      ).test(input) ||
      rx(
        `^${TYPES}\\s+${ID}\\s*\\[\\s*\\]\\s*=\\s*\\{\\s*([^}]*)\\s*\\}\\s*;\\s*$`
      ).test(input) ||
      // ---- NUEVO ----
      rx(
        `^${TYPES}\\s*\\[\\s*\\]\\s+${ID}\\s*=\\s*new\\s+${TYPES}\\s*\\[\\s*\\]\\s*\\{\\s*([^}]*)\\s*\\}\\s*;\\s*$`
      ).test(input) ||
      rx(
        `^${TYPES}\\s+${ID}\\s*\\[\\s*\\]\\s*=\\s*new\\s+${TYPES}\\s*\\[\\s*\\]\\s*\\{\\s*([^}]*)\\s*\\}\\s*;\\s*$`
      ).test(input)
    ) {
      return this.parseArray(input);
    }

    // 2.b) Array con [] (error guiado)
    if (
      rx(`^${TYPES}\\s*\\[\\s*\\]\\s+${ID}\\s*=\\s*\\[.*\\]\\s*;\\s*$`).test(
        input
      ) ||
      rx(`^${TYPES}\\s+${ID}\\s*\\[\\s*\\]\\s*=\\s*\\[.*\\]\\s*;\\s*$`).test(
        input
      )
    ) {
      return [
        false,
        "Para arreglos usa llaves `{ }`, no corchetes `[ ]`. Ejemplo: `int[] a = {1, 2, 3};`",
      ];
    }

    // 2.c) Array sin valores: `tipo[] nombre = ;` o `tipo nombre[] = ;`
    if (
      rx(`^${TYPES}\\s*\\[\\s*\\]\\s+${ID}\\s*=\\s*;\\s*$`).test(input) ||
      rx(`^${TYPES}\\s+${ID}\\s*\\[\\s*\\]\\s*=\\s*;\\s*$`).test(input)
    ) {
      return [
        false,
        "Arreglo: falta la lista de valores entre `{ }`. Ejemplo: `int[] a = {1, 2, 3};`",
      ];
    }

    // 2.d) Array con 'new tipo[]' pero SIN valores: `tipo[] nombre = new tipo[];`
    if (
      rx(
        `^${TYPES}\\s*\\[\\s*\\]\\s+${ID}\\s*=\\s*new\\s+${TYPES}\\s*\\[\\s*\\]\\s*;\\s*$`
      ).test(input) ||
      rx(
        `^${TYPES}\\s+${ID}\\s*\\[\\s*\\]\\s*=\\s*new\\s+${TYPES}\\s*\\[\\s*\\]\\s*;\\s*$`
      ).test(input)
    ) {
      const m =
        input.match(
          rx(
            `^${TYPES}\\s*\\[\\s*\\]\\s+${ID}\\s*=\\s*new\\s+${TYPES}\\s*\\[\\s*\\]\\s*;\\s*$`
          )
        ) ||
        input.match(
          rx(
            `^${TYPES}\\s+${ID}\\s*\\[\\s*\\]\\s*=\\s*new\\s+${TYPES}\\s*\\[\\s*\\]\\s*;\\s*$`
          )
        );

      const lhs = (m![1] as string).toLowerCase();
      const name = m![2];
      const rhs = (m![3] as string).toLowerCase();

      if (lhs !== rhs) {
        return [
          false,
          `Tipo inconsistente: declaraste ${lhs}[] pero instancias new ${rhs}[]; deben coincidir.`,
        ];
      }
      return [
        false,
        `Falta el inicializador de valores. Usa: \`${lhs}[] ${name} = new ${lhs}[]{v1, v2, ...};\``,
      ];
    }

    // 3) Variable primitiva (con o sin asignación): tipo nombre = valor;
    if (rx(`^${TYPES}\\s+${ID}(?:\\s*=\\s*(.+?))?\\s*;\\s*$`).test(input)) {
      return this.parsePrimitive(input);
    }

    // 3.b) Asignación sin valor: `tipo nombre = ;`
    const mEqNoVal = input.match(rx(`^${TYPES}\\s+${ID}\\s*=\\s*;\\s*$`));
    if (mEqNoVal) {
      const type = mEqNoVal[1];
      const name = mEqNoVal[2];
      return [
        false,
        `Asignación a '${name}': falta un valor tras '='. Forma correcta: \`${type} ${name} = <valor ${type}>;\``,
      ];
    }

    // Fallback con explicación detallada
    return [false, this.explainFormatError(input)];
  }

  /* ------------------------ OBJECT ------------------------ */
  private parseObject(input: string): [true, string] | [false, string] {
    const m = input.match(
      rx(`^object\\s+${ID}\\s*=\\s*new\\s+object\\s*\\((.*)\\)\\s*;\\s*$`)
    );
    if (!m) {
      return [
        false,
        "Sintaxis esperada: `object <nombre> = new object(propiedades...);`",
      ];
    }

    const objectKey = m[1];
    const rawProps = m[2].trim();

    // permitir objeto vacío: new object();
    if (rawProps.length === 0) {
      return this.storeObject(objectKey, []);
    }

    // Separar propiedades por ';'
    const propStrings = rawProps
      .split(";")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const properties: { type: PrimitiveType; key: string; value: any }[] = [];

    for (const propStr of propStrings) {
      const [ok, res] = this.parseProperty(propStr);
      if (!ok) return [false, res];
      properties.push(res);
    }
    return this.storeObject(objectKey, properties);
  }

  /* ------------------------ ARRAY ------------------------- */
  private parseArray(input: string): [true, string] | [false, string] {
    // 2.1 Literal en la declaración
    let m = input.match(
      rx(
        `^${TYPES}\\s*\\[\\s*\\]\\s+${ID}\\s*=\\s*\\{\\s*([^}]*)\\s*\\}\\s*;\\s*$`
      )
    );
    if (m) return this.parseArrayWithValues(m[1], m[2], m[3]);

    m = input.match(
      rx(
        `^${TYPES}\\s+${ID}\\s*\\[\\s*\\]\\s*=\\s*\\{\\s*([^}]*)\\s*\\}\\s*;\\s*$`
      )
    );
    if (m) return this.parseArrayWithValues(m[1], m[2], m[3]);

    // 2.2 Declarar + instanciar con new T[]{...}
    m = input.match(
      rx(
        `^${TYPES}\\s*\\[\\s*\\]\\s+${ID}\\s*=\\s*new\\s+${TYPES}\\s*\\[\\s*\\]\\s*\\{\\s*([^}]*)\\s*\\}\\s*;\\s*$`
      )
    );
    if (m) {
      const lhs = (m[1] as string).toLowerCase() as PrimitiveType; // tipo de la izquierda
      const key = m[2];
      const rhs = (m[3] as string).toLowerCase() as PrimitiveType; // tipo dentro del new
      if (lhs !== rhs) {
        return [
          false,
          `Tipo inconsistente: declaraste ${lhs}[] pero instancias new ${rhs}[]{...}. Deben coincidir.`,
        ];
      }
      return this.parseArrayWithValues(lhs, key, m[4]);
    }

    m = input.match(
      rx(
        `^${TYPES}\\s+${ID}\\s*\\[\\s*\\]\\s*=\\s*new\\s+${TYPES}\\s*\\[\\s*\\]\\s*\\{\\s*([^}]*)\\s*\\}\\s*;\\s*$`
      )
    );
    if (m) {
      const lhs = (m[1] as string).toLowerCase() as PrimitiveType;
      const key = m[2];
      const rhs = (m[3] as string).toLowerCase() as PrimitiveType;
      if (lhs !== rhs) {
        return [
          false,
          `Tipo inconsistente: declaraste ${lhs}[] pero instancias new ${rhs}[]{...}. Deben coincidir.`,
        ];
      }
      return this.parseArrayWithValues(lhs, key, m[4]);
    }

    return [
      false,
      "Error al analizar arreglo. Formas válidas:\n" +
        "• `tipo[] nombre = {v1, v2, ...};`  |  `tipo nombre[] = {v1, v2, ...};`\n" +
        "• `tipo[] nombre = new tipo[]{v1, v2, ...};`  |  `tipo nombre[] = new tipo[]{v1, v2, ...};`",
    ];
  }

  private parseArrayWithValues(
    type: PrimitiveType | string,
    key: string,
    rawValues: string
  ): [true, string] | [false, string] {
    const t = (type as string).toLowerCase() as PrimitiveType;
    const raw = (rawValues ?? "").trim();
    if (raw === "") return this.storeArray(t, key, []); // array vacío permitido
    const parts = raw.split(",").map((s) => s.trim());
    if (parts.some((p) => p === "")) {
      return [
        false,
        `Lista de valores de '${key}': hay una coma duplicada o un valor vacío. Evita ',,' o la coma final.`,
      ];
    }
    const casted: any[] = [];

    const e2 = idError(key, "Arreglo");
    if (e2) return [false, e2];

    for (let i = 0; i < parts.length; i++) {
      const r = this.safeCastValue(t, parts[i], `Elemento ${i} de '${key}'`);
      if (!r.ok) return [false, r.error];
      casted.push(r.value);
    }
    return this.storeArray(t, key, casted);
  }

  /* ---------------------- PRIMITIVE ----------------------- */
  private parsePrimitive(input: string): [true, string] | [false, string] {
    const m = input.match(
      rx(`^${TYPES}\\s+${ID}(?:\\s*=\\s*(.+?))?\\s*;\\s*$`)
    );
    if (!m) return [false, "Error al analizar variable primitiva."];

    const type = m[1].toLowerCase() as PrimitiveType;
    const key = m[2];

    const e1 = idError(key, "Variable");
    if (e1) return [false, e1];

    const rawValue = (m[3] ?? "").trim();

    let value: any;
    if (rawValue === "") {
      value = this.getDefaultValue(type);
    } else {
      const r = this.safeCastValue(type, rawValue, `Asignación a '${key}'`);
      if (!r.ok) return [false, r.error];
      value = r.value;
    }
    return this.storePrimitive(type, key, value);
  }

  /* ---------------------- PROPERTIES ---------------------- */
  private parseProperty(
    prop: string
  ):
    | [true, { type: PrimitiveType; key: string; value: any }]
    | [false, string] {
    // Arrays dentro del object
    let m =
      prop.match(
        rx(`^${TYPES}\\s*\\[\\s*\\]\\s+${ID}\\s*=\\s*\\{\\s*([^}]*)\\s*\\}$`)
      ) ||
      prop.match(
        rx(`^${TYPES}\\s+${ID}\\s*\\[\\s*\\]\\s*=\\s*\\{\\s*([^}]*)\\s*\\}$`)
      );

    if (m) {
      const t = (m[1] || m[2]).toLowerCase() as PrimitiveType;
      const id = (m[2] || m[1 + 1]) as string;
      const e3 = idError(id, "Propiedad");
      if (e3) return [false, e3];
      const groups = prop.match(
        rx(`^${TYPES}\\s*\\[\\s*\\]\\s+${ID}\\s*=\\s*\\{\\s*([^}]*)\\s*\\}$`)
      )
        ? { type: (m[1] as string).toLowerCase(), id: m[2], values: m[3] }
        : { type: (m[1] as string).toLowerCase(), id: m[2], values: m[3] };

      const rawValues = (groups.values || "").trim();
      const parts = rawValues.length
        ? rawValues.split(",").map((s) => s.trim())
        : [];
      const casted: any[] = [];

      for (let i = 0; i < parts.length; i++) {
        const r = this.safeCastValue(t, parts[i], `Elemento ${i} de '${id}'`);
        if (!r.ok) return [false, r.error];
        casted.push(r.value);
      }
      return [true, { type: t, key: id, value: casted }];
    }

    // Primitivo dentro del object: tipo nombre = valor
    const mp = prop.match(rx(`^${TYPES}\\s+${ID}\\s*=\\s*(.+)$`));
    if (!mp)
      return [
        false,
        `Propiedad no válida: "${prop}". Usa "tipo nombre = valor" o "tipo[] nombre = {...}".`,
      ];

    const t = mp[1].toLowerCase() as PrimitiveType;
    const id = mp[2];
    const raw = mp[3].trim();

    const r = this.safeCastValue(t, raw, `Propiedad '${id}'`);
    if (!r.ok) return [false, r.error];

    return [true, { type: t, key: id, value: r.value }];
  }

  /* ---------------------- CAST & HELP --------------------- */

  private safeCastValue(
    type: PrimitiveType,
    raw: string,
    ctx: string
  ): CastResult {
    switch (type) {
      case "int":
      case "byte":
      case "short":
      case "long": {
        if (/^-?\d+$/.test(raw)) return { ok: true, value: parseInt(raw, 10) };
        return {
          ok: false,
          error: `${ctx}: "${raw}" no es un entero válido. Usa dígitos opcionalmente con signo, p. ej. \`-42\`.`,
        };
      }
      case "float":
      case "double": {
        if (/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(raw))
          return { ok: true, value: parseFloat(raw) };
        return {
          ok: false,
          error: `${ctx}: "${raw}" no es un número real válido. Ejemplos: \`3.14\`, \`-0.5\`, \`1e-3\`.`,
        };
      }
      case "boolean": {
        if (/^(true|false)$/i.test(raw))
          return { ok: true, value: /^true$/i.test(raw) };
        return {
          ok: false,
          error: `${ctx}: boolean debe ser \`true\` o \`false\`.`,
        };
      }
      case "char": {
        if (/^".*"$/.test(raw)) {
          return {
            ok: false,
            error: `${ctx}: char usa comillas simples. Ej.: 'A'.`,
          };
        }
        // 'a' o escapes como '\n' - un solo caracter lógico
        if (/^'(?:\\.|[^\\])'$/.test(raw)) {
          const inner = raw.slice(1, -1);
          // manejar escape simple
          return { ok: true, value: inner.startsWith("\\") ? inner : inner };
        }
        return {
          ok: false,
          error: `${ctx}: char requiere comillas simples con un solo carácter, p. ej. \`'A'\` o \`'\\n'\`.`,
        };
      }
      case "string": {
        if (/^'.*'$/.test(raw)) {
          return {
            ok: false,
            error: `${ctx}: string usa comillas dobles. Ej.: "hola".`,
          };
        }

        // Acepta "texto" (recomendado) o sin comillas si no tiene espacios
        if (/^".*"$/.test(raw))
          return { ok: true, value: raw.replace(/^"(.*)"$/, "$1") };
        if (!/\s/.test(raw)) return { ok: true, value: raw }; // modo permisivo
        return {
          ok: false,
          error: `${ctx}: string debe ir entre comillas dobles si contiene espacios, p. ej. \`"hola mundo"\`.`,
        };
      }
      default:
        return { ok: false, error: `${ctx}: tipo no soportado (${type}).` };
    }
  }

  private explainFormatError(input: string): string {
    // Sugerencias guiadas para errores típicos
    if (!/;\s*$/.test(input)) {
      return "Falta ';' al final. Ejemplos válidos: `int x = 3;`, `string nombre = \"Ana\";`, `int[] a = {1,2,3};`";
    }
    if (/^\s*object\b/i.test(input) && !/\bnew\s+object\s*\(/i.test(input)) {
      return "Objeto: falta `new object(...)`. Forma: `object persona = new object(tipo nombre = valor; ...);`";
    }
    if (
      rx(`^${TYPES}\\b`, "i").test(input) && // empieza con un tipo
      !rx(`^${TYPES}\\s*\\[\\s*\\]`, "i").test(input) && // no es 'tipo[] ...'
      !rx(`^${TYPES}\\s+${ID}`, "i").test(input) // y no hay identificador después del tipo
    ) {
      return "Después del tipo debe ir un identificador válido. Ej: `int contador;`";
    }

    if (
      /\[\s*.*\s*\]\s*;?\s*$/.test(input) &&
      /=/.test(input) &&
      /{/.test(input) === false
    ) {
      return "Para los valores del array usa `{ }`, no `[ ]`. Ej: `char[] c = {'a','b'};`";
    }
    return (
      "Formato no soportado. Formatos admitidos:\n" +
      "• `tipo nombre;`\n" +
      "• `tipo nombre = valor;`\n" +
      "• `tipo[] nombre = {v1, v2, ...};` o `tipo nombre[] = {v1, v2, ...};`\n" +
      "• `object nombre = new object(tipo1 k1 = v1; tipo2[] k2 = { ... }; ...);`"
    );
  }

  /* -------------------- Defaults (igual) ------------------- */
  private getDefaultValue(type: PrimitiveType): any {
    switch (type) {
      case "boolean":
        return false;
      case "char":
        return "";
      case "byte":
      case "short":
      case "int":
      case "long":
        return 0;
      case "float":
      case "double":
        return 0.0;
      case "string":
        return "";
      default:
        return null;
    }
  }
}
export type { PrimitiveType };
