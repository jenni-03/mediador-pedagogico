import { Memory, PrimitiveType } from "./Memory";

export class MemoryC extends Memory {
  constructor() {
    super();
  }

  /**
   * Analiza una instrucción y almacena en la memoria.
   * @param input Instrucción en formato string (una sola línea).
   * @returns `[true, mensaje]` si es válido, `[false, error]` si hay un problema.
   */
  parseAndStore(input: string): [true, string] | [false, string] {
    input = input.trim();

    // 1) Objeto: "object <nombre> = new object(...);"
    if (/^object [A-Za-z_]\w* = new object\(.+\);$/.test(input)) {
      return this.parseObject(input);
    }

    // 2) Array: Aceptamos sólo llaves { } para la lista de valores:
    //    - "tipo[] nombre = {valores};"
    //    - "tipo nombre[] = {valores};"
    if (
      /^(boolean|char|byte|short|int|long|float|double|string)\[\] [A-Za-z_]\w* = \{.+\};$/.test(input) ||
      /^(boolean|char|byte|short|int|long|float|double|string) [A-Za-z_]\w*\[\] = \{.+\};$/.test(input)
    ) {
      return this.parseArray(input);
    }

    // 3) Variable primitiva con asignación: "tipo nombre = valor;"
    if (
      /^(boolean|char|byte|short|int|long|float|double|string) [A-Za-z_]\w* = .+;$/.test(input)
    ) {
      return this.parsePrimitive(input);
    }

    // 4) Variable primitiva sin asignación: "tipo nombre;"
    if (
      /^(boolean|char|byte|short|int|long|float|double|string) [A-Za-z_]\w*;$/.test(input)
    ) {
      return this.parsePrimitive(input);
    }

    return [false, "Formato no soportado"];
  }

  /**
   * Analiza y almacena un objeto con sintaxis:
   *   object <nombre> = new object( ...propiedades... );
   */
  private parseObject(input: string): [true, string] | [false, string] {
    const objectRegex = /^object ([A-Za-z_]\w*) = new object\((.+)\);$/;
    const match = input.match(objectRegex);
    if (!match) {
      return [false, "Error al analizar objeto. Sintaxis esperada: object <nombre> = new object(...);"];
    }

    const objectKey = match[1];
    const rawProps = match[2];

    // Separamos propiedades por ";", omitiendo espacios vacíos
    const propStrings = rawProps
      .split(";")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    // Acumularemos las propiedades parseadas aquí
    const properties: { type: PrimitiveType; key: string; value: any }[] = [];

    for (const propStr of propStrings) {
      const [ok, result] = this.parseProperty(propStr);
      if (!ok) {
        // En cuanto falle una propiedad, retornamos el error
        return [false, result];
      }
      properties.push(result);
    }

    // Si todo se parseó bien, almacenamos el objeto
    return this.storeObject(objectKey, properties);
  }

  /**
   * Analiza y almacena un array (solo con llaves {}).
   * Sintaxis permitida:
   *   - "tipo[] nombre = {val1,val2,...};"
   *   - "tipo nombre[] = {val1,val2,...};"
   */
  private parseArray(input: string): [true, string] | [false, string] {
    // Forma A
    let arrayRegex: RegExp = /^(boolean|char|byte|short|int|long|float|double|string)\[\] ([A-Za-z_]\w*) = \{(.+)\};$/;
    let match = input.match(arrayRegex);
    if (!match) {
      // Forma B
      arrayRegex = /^(boolean|char|byte|short|int|long|float|double|string) ([A-Za-z_]\w*)\[\] = \{(.+)\};$/;
      match = input.match(arrayRegex);
    }

    if (!match) {
      return [false, "Error al analizar arreglo. Se requiere usar { } para los valores."];
    }

    const type = match[1] as PrimitiveType;
    const key = match[2];
    const rawValues = match[3].trim();

    // Dividimos valores por coma
    const values = rawValues.split(",").map((val) => this.castValue(type, val.trim()));

    return this.storeArray(type, key, values);
  }

  /**
   * Analiza una variable primitiva (con o sin asignación).
   */
  private parsePrimitive(input: string): [true, string] | [false, string] {
    const primitiveRegex = /^(boolean|char|byte|short|int|long|float|double|string) ([A-Za-z_]\w*)( = (.+))?;$/;
    const match = input.match(primitiveRegex);
    if (!match) {
      return [false, "Error al analizar primitivo."];
    }

    const type = match[1] as PrimitiveType;
    const key = match[2];
    let rawValue = match[4];
    let value: any;

    // Si no se asigna valor, ponemos el default
    if (rawValue === undefined) {
      value = this.getDefaultValue(type);
    } else {
      rawValue = rawValue.trim();
      value = this.castValue(type, rawValue);
    }

    return this.storePrimitive(type, key, value);
  }

  /**
   * Analiza una propiedad dentro de un objeto: puede ser array o primitivo.
   * Retorna `[true, { type, key, value }]` en caso de éxito, `[false, mensaje]` en caso de error.
   */
  private parseProperty(
    prop: string
  ): [true, { type: PrimitiveType; key: string; value: any }] | [false, string] {
    // 1) Caso array: "tipo[] nombre = {val1,val2,...}" o "tipo nombre[] = {val1,val2,...}"
    const arrayPattern1 = /^(boolean|char|byte|short|int|long|float|double|string)\[\] ([A-Za-z_]\w*) = \{(.+)\}$/;
    const arrayPattern2 = /^(boolean|char|byte|short|int|long|float|double|string) ([A-Za-z_]\w*)\[\] = \{(.+)\}$/;

    let arrayMatch = prop.match(arrayPattern1);
    if (!arrayMatch) {
      arrayMatch = prop.match(arrayPattern2);
    }

    if (arrayMatch) {
      const type = arrayMatch[1] as PrimitiveType;
      const key = arrayMatch[2];
      const rawValues = arrayMatch[3].trim();

      // Si el usuario intentó usar corchetes "[ ]", esto no coincide con el regex, así que
      // ya estamos en la rama de "sí es un array correcto con {}" y no hay que aceptar "[]".
      // Si no concuerda, no entraría aquí.

      const values = rawValues.split(",").map((val) => this.castValue(type, val.trim()));
      return [true, { type, key, value: values }];
    }

    // 2) Caso primitivo: "tipo nombre = valor"
    const primitiveRegex = /^(boolean|char|byte|short|int|long|float|double|string) ([A-Za-z_]\w*) = (.+)$/;
    const primitiveMatch = prop.match(primitiveRegex);

    if (!primitiveMatch) {
      // No encaja ni con array ni con primitivo → error
      return [false, `Error al analizar propiedad: "${prop}"`];
    }

    const type = primitiveMatch[1] as PrimitiveType;
    const key = primitiveMatch[2];
    const rawValue = primitiveMatch[3].trim();
    const value = this.castValue(type, rawValue);

    return [true, { type, key, value }];
  }

  /**
   * Convierte un valor string al tipo adecuado.
   * Maneja comillas simples/dobles para char y string.
   */
  private castValue(type: PrimitiveType, value: string): any {
    switch (type) {
      case "int":
      case "byte":
      case "short":
      case "long":
        if (/^-?\d+$/.test(value)) {
          return parseInt(value, 10);
        }
        return value; // Si no coincide, devolvemos tal cual
      case "float":
      case "double":
        if (/^-?\d+(\.\d+)?$/.test(value)) {
          return parseFloat(value);
        }
        return value;
      case "boolean":
        if (value === "true") return true;
        if (value === "false") return false;
        return value;
      case "char":
        // 'A' => 3 caracteres
        if (/^'.'$/.test(value)) {
          const innerChar = value.slice(1, -1);
          if (innerChar.length === 1) {
            return innerChar;
          }
        }
        return value;
      case "string":
        // "texto" => le quitamos las comillas
        return value.replace(/^"(.*)"$/, "$1");
      default:
        return value;
    }
  }

  /**
   * Valor por defecto para cada tipo primitivo.
   */
  private getDefaultValue(type: PrimitiveType): any {
    switch (type) {
      case "boolean":
        return false;
      case "char":
        return ""; // O '\u0000'
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
