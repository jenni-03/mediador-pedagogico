class MemoryValidator {
  private static globalNames = new Set<string>(); // Almacena nombres globales

  /**
   * Verifica si un nombre ya existe globalmente (sin importar el tipo).
   * @param name Nombre de la variable
   * @param isNested Indica si la variable está dentro de un objeto (permitido)
   * @returns `true` si el nombre es válido, `[false, "mensaje de error"]` si ya existe.
   */
  static validateUniqueGlobalName(
    name: string,
    isNested: boolean
  ): true | [false, string] {
    if (!isNested && this.globalNames.has(name)) {
      return [false, `La variable "${name}" ya existe en el ámbito global.`];
    }

    if (!isNested) {
      this.globalNames.add(name);
    }
    return true;
  }

  /**
   * Verifica si un valor es válido para un tipo de dato específico.
   * @param type Tipo de dato (boolean, int, float, etc.)
   * @param value Valor que se quiere almacenar
   * @returns `true` si el valor es válido, `[false, "mensaje de error"]` si es inválido.
   */
  static validateValueByType(type: string, value: any): true | [false, string] {
    switch (type) {
      case "boolean":
        if (typeof value !== "boolean")
          return [false, `"${value}" no es un booleano válido.`];
        return true;

      case "char":
        if (typeof value !== "string") {
          return [false, `"${value}" no es un carácter válido.`];
        }
        
        const cleanChar = value.replace(/^"(.*)"$/, "$1");

        if (cleanChar.length !== 1) {
          return [false, `"${value}" no es un carácter válido.`];
        }
        return true;

      case "byte":
        if (typeof value !== "number")
          return [false, `"${value}" no es un número válido para byte.`];
        if (!Number.isInteger(value) || value < -128 || value > 127) {
          return [false, `"${value}" excede el rango de byte (-128 a 127).`];
        }
        return true;

      case "short":
        if (typeof value !== "number")
          return [false, `"${value}" no es un número válido para short.`];
        if (!Number.isInteger(value) || value < -32768 || value > 32767) {
          return [
            false,
            `"${value}" excede el rango de short (-32768 a 32767).`,
          ];
        }
        return true;

      case "int":
        if (typeof value !== "number")
          return [false, `"${value}" no es un número válido para int.`];
        if (
          !Number.isInteger(value) ||
          value < -2147483648 ||
          value > 2147483647
        ) {
          return [
            false,
            `"${value}" excede el rango de int (-2147483648 a 2147483647).`,
          ];
        }
        return true;

      case "long":
        if (typeof value !== "number")
          return [false, `"${value}" no es un número válido para long.`];
        if (
          !Number.isInteger(value) ||
          value < -9223372036854775808 ||
          value > 9223372036854775807
        ) {
          return [
            false,
            `"${value}" excede el rango de long (-9223372036854775808 a 9223372036854775807).`,
          ];
        }
        return true;

      case "float":
        if (typeof value !== "number")
          return [false, `"${value}" no es un número válido para float.`];
        if (value < -3.40282347e38 || value > 3.40282347e38) {
          return [
            false,
            `"${value}" excede el rango de float (-3.40282347e+38 a 3.40282347e+38).`,
          ];
        }
        return true;

      case "double":
        if (typeof value !== "number")
          return [false, `"${value}" no es un número válido para double.`];
        if (value < -1.7976931348623157e308 || value > 1.7976931348623157e308) {
          return [
            false,
            `"${value}" excede el rango de double (-1.79769313486231570e+308 a 1.79769313486231570e+308).`,
          ];
        }
        return true;

      case "string":
        if (typeof value !== "string")
          return [false, `"${value}" no es un string válido.`];
        return true;

      default:
        return [false, `Tipo de dato desconocido "${type}".`];
    }
  }
}

export { MemoryValidator };
