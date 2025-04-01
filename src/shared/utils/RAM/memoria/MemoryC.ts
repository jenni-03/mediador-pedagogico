import { Memory, PrimitiveType } from "./Memory";

export class MemoryC extends Memory {
  constructor() {
    super();
  }

  /**
   * Analiza una instrucción y almacena en la memoria.
   * @param input Instrucción en formato string.
   * @returns `[true, mensaje]` si es válido, `[false, error]` si hay un problema.
   */
  parseAndStore(input: string): [true, string] | [false, string] {
    input = input.trim();

    if (input.startsWith("object")) {
      return this.parseObject(input);
    } else if (/^[a-z]+\[\]\s+\w+\s*=\s*\[.*\];$/.test(input)) {
      return this.parseArray(input);
    } else if (
      /^(boolean|char|byte|short|int|long|float|double|string)\s+\w+\s*=.+;$/.test(
        input
      )
    ) {
      return this.parsePrimitive(input);
    } else {
      return [false, "Formato no soportado"];
    }
  }

  /**
   * Analiza y almacena un valor primitivo.
   */
  private parsePrimitive(input: string): [true, string] | [false, string] {
    const primitiveRegex =
      /^(boolean|char|byte|short|int|long|float|double|string)\s+(\w+)\s*=\s*(.+);$/;
    const match = input.match(primitiveRegex);
    if (!match) return [false, "Error al analizar primitivo."];

    const [_, type, key, rawValue] = match;

    // Convertimos el valor al tipo adecuado antes de pasarlo a storePrimitive
    const convertedValue = this.castValue(
      type as PrimitiveType,
      rawValue.trim()
    );

    return this.storePrimitive(type as PrimitiveType, key, convertedValue);
  }

  /**
   * Analiza y almacena un array.
   */
  private parseArray(input: string): [true, string] | [false, string] {
    const arrayRegex =
      /^(boolean|char|byte|short|int|long|float|double|string)\[\]\s+(\w+)\s*=\s*\[(.+)\];$/;
    const match = input.match(arrayRegex);
    if (!match) return [false, "Error al analizar arreglo."];

    const [_, type, key, rawValues] = match;

    // Convertimos cada valor del array al tipo adecuado
    const values = rawValues
      .split(",")
      .map((val) => this.castValue(type as PrimitiveType, val.trim()));

    return this.storeArray(type as PrimitiveType, key, values);
  }

  /**
   * Analiza y almacena un objeto.
   */
  private parseObject(input: string): [true, string] | [false, string] {
    const objectRegex = /^object\s+(\w+)\s*=\s*\((.+)\);$/;
    const match = input.match(objectRegex);
    if (!match) return [false, "Error al analizar objeto."];

    const [_, objectKey, rawProps] = match;

    const properties: { type: PrimitiveType; key: string; value: any }[] =
      rawProps
        .split(";")
        .map((prop) => prop.trim())
        .filter((prop) => prop.length > 0)
        .map((prop) => this.parseProperty(prop));

    return this.storeObject(objectKey, properties);
  }

  /**
   * Analiza una propiedad dentro de un objeto.
   */
  private parseProperty(prop: string): {
    type: PrimitiveType;
    key: string;
    value: any;
  } {
    if (/^[a-z]+\[\]\s+\w+\s*=\s*\[.*\]$/.test(prop)) {
      const arrayRegex =
        /^(boolean|char|byte|short|int|long|float|double|string)\[\]\s+(\w+)\s*=\s*\[(.+)\]$/;
      const match = prop.match(arrayRegex);
      if (!match)
        throw new Error(`Error al analizar arreglo en objeto: ${prop}`);

      const [_, type, key, rawValues] = match;

      // Convertimos los valores del array al tipo correcto antes de almacenarlo
      const values = rawValues
        .split(",")
        .map((val) => this.castValue(type as PrimitiveType, val.trim()));

      return { type: type as PrimitiveType, key, value: values };
    } else {
      const primitiveRegex =
        /^(boolean|char|byte|short|int|long|float|double|string)\s+(\w+)\s*=\s*(.+)$/;
      const match = prop.match(primitiveRegex);
      if (!match)
        throw new Error(`Error al analizar primitivo en objeto: ${prop}`);

      const [_, type, key, rawValue] = match;

      // Convertimos el valor primitivo al tipo correcto
      const value = this.castValue(type as PrimitiveType, rawValue.trim());

      return { type: type as PrimitiveType, key, value };
    }
  }

  /**
   * Convierte un valor de string al tipo adecuado para almacenamiento.
   */
  private castValue(type: PrimitiveType, value: string): any {
    switch (type) {
      case "int":
      case "byte":
      case "short":
      case "long":
        if (!/^-?\d+$/.test(value)) return value; 
        return parseInt(value, 10);
      case "float":
      case "double":
        if (!/^-?\d+(\.\d+)?$/.test(value)) return value; 
        return parseFloat(value);
      case "boolean":
        if (value !== "true" && value !== "false") return value; 
        return value === "true";
      case "char":
        if (value.length !== 1) return value; 
        return value;
      case "string":
        return value.replace(/^"(.*)"$/, "$1");
      default:
        return value;
    }
  }
}
export type { PrimitiveType };
