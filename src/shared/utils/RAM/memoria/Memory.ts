import { MemoryValidator } from "./MemoryValidator";

/**
 * Tipos de datos primitivos que pueden almacenarse en la memoria.
 */
type PrimitiveType =
  | "boolean"
  | "char"
  | "byte"
  | "short"
  | "int"
  | "long"
  | "float"
  | "double"
  | "string";
/**
 * Tipos de datos complejos en la memoria (objetos y arrays).
 */
type ComplexType = "object" | "array";

/**
 * Representación de una entrada en la memoria.
 */
interface MemoryEntry {
  type: PrimitiveType | ComplexType;
  name: string;
  value: any;
  address: string;
}

/**
 * Clase que simula la gestión de la memoria en un sistema.
 * Permite almacenar y administrar variables primitivas, arrays y objetos.
 */
class Memory {
  /**
   * Contador de direcciones para cada tipo de dato en la memoria.
   * Se usa para generar direcciones únicas.
   */
  private static addressCounters: Record<PrimitiveType | ComplexType, number> =
    {
      boolean: 0,
      char: 0,
      byte: 0,
      short: 0,
      int: 0,
      long: 0,
      float: 0,
      double: 0,
      string: 0,
      object: 0,
      array: 0,
    };

  /**
   * Prefijos utilizados para identificar las direcciones de memoria de cada tipo de dato.
   */
  private static typePrefixes: Record<PrimitiveType | ComplexType, string> = {
    boolean: "0x",
    char: "1x",
    byte: "2x",
    short: "3x",
    int: "4x",
    long: "5x",
    float: "6x",
    double: "7x",
    string: "8x",
    object: "9x",
    array: "Ax",
  };
  /**
   * Segmentos de memoria organizados por tipo de dato.
   */
  private segments: Map<PrimitiveType | ComplexType, Map<string, MemoryEntry>> =
    new Map();

  constructor() {
    // Inicializa los segmentos de memoria para cada tipo de dato.
    Object.keys(Memory.typePrefixes).forEach((type) =>
      this.segments.set(type as PrimitiveType | ComplexType, new Map())
    );
  }

  /**
   * Genera una dirección de memoria única para el tipo de dato especificado.
   * @param type Tipo de dato para el que se generará la dirección.
   * @returns Dirección de memoria única para el tipo dado.
   */
  private generateAddress(type: PrimitiveType | ComplexType): string {
    const prefix = Memory.typePrefixes[type];
    const count = Memory.addressCounters[type]++;
    return `${prefix}${String(count).padStart(3, "0")}`;
  }

  /**
   * Almacena un dato primitivo en la memoria.
   * Primero valida el nombre y luego delega la validación del valor y almacenamiento.
   * @param type Tipo de dato (int, float, string, etc.).
   * @param name Nombre de la variable.
   * @param value Valor a almacenar.
   * @param isNested Indica si es una variable dentro de un objeto o array.
   * @returns `[true, mensaje]` si se almacena correctamente, `[false, error]` si hay un problema.
   */
  storePrimitive(
    type: PrimitiveType,
    name: string,
    value: any,
    isNested: boolean = false
  ): [true, string] | [false, string] {
    // Validar si el nombre ya existe
    const nameValidation = MemoryValidator.validateUniqueGlobalName(
      name,
      isNested
    );
    if (nameValidation !== true) return [false, nameValidation[1]];

    // Delegar la validación del valor y almacenamiento
    return this.validateAndStorePrimitive(type, name, value);
  }

  /**
   * Valida el valor y lo almacena en memoria si es correcto.
   * @param type Tipo de dato (int, float, string, etc.).
   * @param name Nombre de la variable.
   * @param value Valor a almacenar.
   * @returns `[true, mensaje]` si se almacena correctamente, `[false, error]` si hay un problema.
   */
  private validateAndStorePrimitive(
    type: PrimitiveType,
    name: string,
    value: any
  ): [true, string] | [false, string] {
    const segment = this.segments.get(type)!;

    // Validar si el valor es compatible con el tipo
    const valueValidation = MemoryValidator.validateValueByType(type, value);
    if (valueValidation !== true) {
      MemoryValidator.removeGlobalName(name);
      return [false, valueValidation[1]];
    }

    // Si todo está bien, almacenamos el valor en la memoria
    const address = this.generateAddress(type);
    segment.set(address, { type, name, value, address });

    return [true, `Variable "${name}" almacenada en dirección ${address}`];
  }

  /**
   * Almacena un array en la memoria.
   * @param type Tipo de los elementos del array.
   * @param name Nombre del array.
   * @param values Valores del array.
   * @param isNested Indica si es un array dentro de otro objeto.
   * @returns `[true, mensaje]` si se almacena correctamente, `[false, error]` si hay un problema.
   */
  storeArray(
    type: PrimitiveType,
    name: string,
    values: any[],
    isNested: boolean = false
  ): [true, string] | [false, string] {
    // Validar si el nombre ya existe en la memoria
    const nameValidation = MemoryValidator.validateUniqueGlobalName(
      name,
      isNested
    );
    if (nameValidation !== true) return [false, nameValidation[1]];

    // Validamos el array completo antes de almacenarlo
    const arrayValidation = Memory.validateArray(type, values);
    if (arrayValidation[0] === false) {
      MemoryValidator.removeGlobalName(name);
      return [false, `"Array ${name}": ${arrayValidation[1]}`];
    }
    // Si todo es válido, generamos la dirección del array y lo almacenamos
    const arrayAddress = this.generateAddress("array");
    const arraySegment = this.segments.get("array")!;

    arraySegment.set(arrayAddress, {
      type: "array",
      name,
      value: values,
      address: arrayAddress,
    });

    //Ahora almacenamos los elementos después de validar todo
    for (let i = 0; i < values.length; i++) {
      const elementName = `${name}_${i}`;
      this.validateAndStorePrimitive(type, elementName, values[i]); // Ahora sí almacena
    }

    return [true, `Array "${name}" almacenado en dirección ${arrayAddress}`];
  }

  /**
   * Valida un array asegurándose de que todos sus valores sean correctos para el tipo especificado.
   * @param type Tipo de los elementos del array.
   * @param values Array de valores a validar.
   * @returns `[true]` si el array es válido, `[false, mensaje de error]` si hay algún problema.
   */
  static validateArray(
    type: PrimitiveType,
    values: any[]
  ): [true] | [false, string] {
    for (let i = 0; i < values.length; i++) {
      const validationResult = MemoryValidator.validateValueByType(
        type,
        values[i]
      );
      if (validationResult !== true) {
        return [false, `La posición ${i} del array: ${validationResult[1]}`];
      }
    }
    return [true]; //Todos los valores son correctos
  }

  /**
   * Almacena un objeto en la memoria.
   * @param name Nombre del objeto.
   * @param properties Propiedades del objeto (primitivos o arrays).
   * @returns `[true, mensaje]` si se almacena correctamente, `[false, error]` si hay un problema.
   */
  storeObject(
    name: string,
    properties: { type: PrimitiveType; key: string; value: any }[]
  ): [true, string] | [false, string] {
    // Validar si el nombre del objeto ya existe
    const nameValidation = MemoryValidator.validateUniqueGlobalName(
      name,
      false
    );
    if (nameValidation !== true) return [false, nameValidation[1]];

    // Validamos el objeto completo antes de almacenarlo
    const objectValidation = Memory.validateObject(name, properties);
    if (objectValidation[0] === false) {
      MemoryValidator.removeGlobalName(name);
      return [false, objectValidation[1]];
    }
    // Si todo es válido, generamos la dirección del objeto y lo almacenamos
    const objectAddress = this.generateAddress("object");
    const objectSegment = this.segments.get("object")!;

    objectSegment.set(objectAddress, {
      type: "object",
      name,
      value: properties,
      address: objectAddress,
    });

    // Ahora almacenamos cada propiedad en memoria
    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      const isArray = Array.isArray(prop.value);

      if (isArray) {
        this.storeArray(prop.type, `${name}_${prop.key}`, prop.value, true);
      } else {
        this.storePrimitive(prop.type, `${name}_${prop.key}`, prop.value, true);
      }
    }

    return [true, `Objeto "${name}" almacenado en dirección ${objectAddress}`];
  }

  /**
   * Valida un objeto asegurándose de que todas sus propiedades sean correctas.
   * @param name Nombre del objeto.
   * @param properties Lista de propiedades del objeto.
   * @returns `[true]` si el objeto es válido, `[false, mensaje de error]` si hay un problema.
   */
  static validateObject(
    name: string,
    properties: { type: PrimitiveType; key: string; value: any }[]
  ): [true] | [false, string] {
    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];

      //Si la propiedad es un array, validamos con validateArray
      if (Array.isArray(prop.value)) {
        const arrayValidation = this.validateArray(prop.type, prop.value);
        if (arrayValidation[0] === false) {
          return [false, `Objeto "${name}.${prop.key}": ${arrayValidation[1]}`];
        }
      } else {
        //Si es primitivo, validamos con validateValueByType
        const primitiveValidation = MemoryValidator.validateValueByType(
          prop.type,
          prop.value
        );
        if (primitiveValidation !== true) {
          return [
            false,
            `Objeto "${name}.${prop.key}": ${primitiveValidation[1]}`,
          ];
        }
      }
    }
    return [true];
  }

  /**
   * Elimina un dato de la memoria según su dirección.
   * Si es un objeto o array, también elimina sus elementos internos.
   * @param address Dirección de memoria a eliminar.
   * @returns `[true, mensaje]` si se eliminó correctamente, `[false, mensaje]` si la dirección no existe.
   */
  removeByAddress(address: string): [true, string] | [false, string] {
    for (const [type, segment] of this.segments.entries()) {
      if (segment.has(address)) {
        const entry = segment.get(address)!;
        let message = `Eliminado: ${entry.type.toUpperCase()} "${entry.name}" en dirección ${address}.`;

        // Eliminar el nombre del ámbito global
        MemoryValidator.removeGlobalName(entry.name);

        // Si es un objeto, eliminar sus propiedades internas
        if (entry.type === "object") {
          const properties = entry.value as {
            type: PrimitiveType;
            key: string;
            value: any;
          }[];

          let deletedProps: string[] = [];

          for (const prop of properties) {
            const propName = `${entry.name}_${prop.key}`;
            const propAddress = this.getAddressByName(propName);

            if (propAddress) {
              this.removeByAddress(propAddress);
              deletedProps.push(`"${propName}" eliminada.`);
            }
          }

          if (deletedProps.length > 0) {
            message += `\nPropiedades eliminadas:\n${deletedProps.join("\n")}`;
          }
        }

        // Si es un array, eliminar cada elemento interno
        if (entry.type === "array") {
          const elements = entry.value as any[];
          let deletedElements: string[] = [];

          for (let i = 0; i < elements.length; i++) {
            const elementName = `${entry.name}_${i}`;
            const elementAddress = this.getAddressByName(elementName);

            if (elementAddress) {
              this.removeByAddress(elementAddress);
              deletedElements.push(`"${elementName}" eliminado.`);
            }
          }

          if (deletedElements.length > 0) {
            message += `\ Elementos del array eliminados:\n${deletedElements.join("\n")}`;
          }
        }

        // Finalmente, eliminar la entrada principal
        segment.delete(address);
        return [true, message];
      }
    }
    return [false, `No se encontró la dirección ${address}.`];
  }

  /**
   * Busca la dirección de memoria de un dato a partir de su nombre.
   * @param name Nombre de la variable a buscar.
   * @returns Dirección de memoria o `null` si no se encuentra.
   */
  private getAddressByName(name: string): string | null {
    for (const segment of this.segments.values()) {
      for (const [address, entry] of segment.entries()) {
        if (entry.name === name) {
          return address;
        }
      }
    }
    return null;
  }

  /**
   * Devuelve el estado completo de la memoria en un formato estructurado.
   * @returns Un objeto con cada segmento de memoria y sus variables.
   */
  printMemory(): Record<string, any[]> {
    const memoryState: Record<string, any[]> = {};

    this.segments.forEach((segment, type) => {
      memoryState[type] = Array.from(segment.values()).map((entry) => {
        return {
          ...entry,
          value: this.serializeValue(entry.value), // Serializamos correctamente el value
        };
      });
    });

    return memoryState;
  }

  /**
   * Serializa valores de arrays y objetos para que se impriman correctamente.
   * @param value Valor a serializar.
   * @returns El valor serializado correctamente.
   */
  private serializeValue(value: any): any {
    if (Array.isArray(value)) {
      return value.map((item) => this.serializeValue(item)); // Recursión para expandir arrays anidados
    }

    if (typeof value === "object" && value !== null) {
      return Object.entries(value).map(([key, val]) => ({
        key,
        value: this.serializeValue(val),
      }));
    }

    return value; // Si no es array ni objeto, devolver tal cual
  }

  /**
   * Obtiene una entrada en la memoria a partir de una dirección específica.
   * @param address Dirección de memoria a buscar.
   * @returns `[true, objeto]` si se encuentra, `[false, mensaje]` si no existe.
   */
  getEntryByAddress(address: string): [true, MemoryEntry] | [false, string] {
    for (const segment of this.segments.values()) {
      if (segment.has(address)) {
        return [true, segment.get(address)!];
      }
    }
    return [
      false,
      `No se encontró ninguna entrada en la dirección ${address}.`,
    ];
  }

  /**
   * Cambia el tipo de dato primitivo de una variable si la conversión es válida.
   * @param address Dirección de memoria de la variable a convertir.
   * @param newType Nuevo tipo de dato al que se desea convertir.
   * @returns `[true, mensaje]` si se convierte, `[false, mensaje de error]` si no.
   */
  convertPrimitiveType(
    address: string,
    newType: PrimitiveType
  ): [true, string] | [false, string] {
    const [ok, entryOrError] = this.getEntryByAddress(address);
    if (!ok) return [false, entryOrError];

    const entry = entryOrError;
    const originalType = entry.type as PrimitiveType;

    // Tipos primitivos válidos para conversión
    const convertibleTypes: PrimitiveType[] = [
      "char",
      "byte",
      "short",
      "int",
      "long",
      "float",
      "double",
    ];

    const sizeInBits: Record<PrimitiveType, number> = {
      boolean: 1,
      char: 16,
      byte: 8,
      short: 16,
      int: 32,
      long: 64,
      float: 32,
      double: 64,
      string: 0, // no convertible
    };

    // Verificar que ambos tipos sean primitivos convertibles
    if (!convertibleTypes.includes(originalType)) {
      return [false, `No se puede convertir desde tipo ${originalType}.`];
    }

    if (!convertibleTypes.includes(newType)) {
      return [false, `No se puede convertir hacia tipo ${newType}.`];
    }

    // Validar si es un valor primitivo dentro de un array u objeto (por nombre)
    const isNested = entry.name.includes("_");
    if (!isNested && (entry.type === "object" || entry.type === "array")) {
      return [
        false,
        `No se puede convertir la estructura completa (${entry.type}), solo variables primitivas.`,
      ];
    }

    const fromSize = sizeInBits[originalType];
    const toSize = sizeInBits[newType];

    if (toSize < fromSize) {
      return [
        false,
        `No se puede convertir de ${originalType} a ${newType} por posible pérdida de datos (overflow).`,
      ];
    }

    let convertedValue: any;

    try {
      switch (newType) {
        case "byte":
        case "short":
        case "int":
        case "long":
          convertedValue = parseInt(entry.value);
          break;
        case "float":
        case "double":
          convertedValue = parseFloat(entry.value);
          break;
        case "char":
          convertedValue = String.fromCharCode(Number(entry.value));
          break;
      }

      const validation = MemoryValidator.validateValueByType(
        newType,
        convertedValue
      );
      if (validation !== true) return [false, validation[1]];

      // Eliminar la entrada antigua
      this.removeByAddress(address);

      // Guardar la nueva entrada
      const [storedOk, msg] = this.storePrimitive(
        newType,
        entry.name,
        convertedValue,
        isNested
      );

      if (!storedOk) return [false, msg];

      return [
        true,
        `Variable "${entry.name}" de tipo ${originalType} fue convertida exitosamente a tipo ${newType}.`,
      ];
    } catch (err) {
      return [false, `Error durante la conversión: ${(err as Error).message}`];
    }
  }

  /**
   * Devuelve el tamaño en memoria de una dirección específica.
   * @param address Dirección de memoria.
   * @returns `[true, tamaño]` o `[false, mensaje de error]`
   */
  getSizeByAddress(address: string): [true, string] | [false, string] {
    const [ok, entryOrMsg] = this.getEntryByAddress(address);
    if (!ok) return [false, entryOrMsg];

    const entry = entryOrMsg;

    if (entry.type === "object") {
      return this.getObjectSize(entry.name, entry.value);
    }

    if (entry.type === "array") {
      return this.getArraySize(entry.name, entry.value);
    }

    return this.getPrimitiveSize(entry.value, entry.type as PrimitiveType);
  }

  /**
   * Calcula el tamaño de un valor primitivo.
   */
  private getPrimitiveSize(
    value: any,
    type: PrimitiveType
  ): [true, string] | [false, string] {
    const sizes: Record<PrimitiveType, number> = {
      boolean: 1 / 8, // 1 bit
      byte: 1,
      short: 2,
      int: 4,
      long: 8,
      float: 4,
      double: 8,
      char: 2,
      string: 2, // por caracter
    };

    if (type === "boolean") return [true, "1 bit"];
    if (type === "string") {
      const length = String(value).length;
      return [true, `${length * 2} bytes`];
    }

    const size = sizes[type];
    return [true, `${size} ${size === 1 ? "byte" : "bytes"}`];
  }

  /**
   * Calcula el tamaño de un array (de cualquier tipo).
   */
  private getArraySize(
    arrayName: string,
    values: any[]
  ): [true, string] | [false, string] {
    if (!Array.isArray(values))
      return [false, "El valor del array no es válido."];

    let totalBits = 0;
    let failedAt: string | null = null;

    for (let i = 0; i < values.length; i++) {
      const elementName = `${arrayName}_${i}`;
      const elementAddress = this.getAddressByName(elementName);
      if (!elementAddress) {
        failedAt = elementName;
        break;
      }

      const [ok, elementEntry] = this.getEntryByAddress(elementAddress);
      if (!ok) {
        failedAt = elementName;
        break;
      }

      const primitiveSize = this.getPrimitiveSize(
        elementEntry.value,
        elementEntry.type as PrimitiveType
      );

      if (!primitiveSize[0]) {
        failedAt = elementName;
        break;
      }

      const sizeStr = primitiveSize[1];

      if (sizeStr.includes("bit")) {
        totalBits += parseInt(sizeStr);
      } else {
        const bytes = parseInt(sizeStr);
        totalBits += bytes * 8;
      }
    }

    if (failedAt)
      return [false, `No se pudo obtener tamaño del elemento ${failedAt}`];

    if (totalBits % 8 === 0) {
      return [true, `${totalBits / 8} bytes`];
    }

    return [true, `${totalBits} bits`];
  }

  /**
   * Calcula el tamaño total de un objeto sumando sus propiedades internas.
   */
  private getObjectSize(
    objectName: string,
    properties: { type: PrimitiveType; key: string; value: any }[]
  ): [true, string] | [false, string] {
    let totalBits = 0;

    for (const prop of properties) {
      const propName = `${objectName}_${prop.key}`;
      const propAddress = this.getAddressByName(propName);
      if (!propAddress)
        return [false, `No se encontró la propiedad ${propName}`];

      const [ok, entry] = this.getEntryByAddress(propAddress);
      if (!ok) return [false, entry];

      let sizeResult: [true, string] | [false, string];

      if (entry.type === "array") {
        sizeResult = this.getArraySize(entry.name, entry.value);
      } else {
        sizeResult = this.getPrimitiveSize(
          entry.value,
          entry.type as PrimitiveType
        );
      }

      if (!sizeResult[0]) return [false, sizeResult[1]];

      const sizeStr = sizeResult[1];

      if (sizeStr.includes("bit")) {
        totalBits += parseInt(sizeStr);
      } else {
        const bytes = parseInt(sizeStr);
        totalBits += bytes * 8;
      }
    }

    if (totalBits % 8 === 0) {
      return [true, `${totalBits / 8} bytes`];
    }

    return [true, `${totalBits} bits`];
  }

  /**
   * Actualiza el valor de una dirección de memoria si es válido.
   * @param address Dirección a actualizar.
   * @param newValue Nuevo valor o array de valores.
   * @returns Resultado de la operación.
   */
  updateValueByAddress(
    address: string,
    newValue: any
  ): [true, string] | [false, string] {
    const [ok, entryOrError] = this.getEntryByAddress(address);
    if (!ok) return [false, entryOrError];

    const entry = entryOrError;
    const { type, name } = entry;

    // Caso 1: Primitivo
    if (type !== "array" && type !== "object") {
      const validation = MemoryValidator.validateValueByType(
        type as PrimitiveType,
        newValue
      );
      if (validation !== true) {
        return [false, `Error al actualizar "${name}": ${validation[1]}`];
      }

      entry.value = newValue;

      // Verificar si forma parte de un array y actualizar el array padre
      if (name.includes("_")) {
        const [arrayName, indexStr] = name.split("_");
        const index = Number(indexStr);

        const arrayAddress = this.getAddressByName(arrayName);
        if (arrayAddress) {
          const [ok, arrayEntry] = this.getEntryByAddress(arrayAddress);
          if (ok && arrayEntry.type === "array") {
            arrayEntry.value[index] = newValue;
          }
        }
      }

      return [
        true,
        `Valor de "${name}" actualizado correctamente a ${newValue}.`,
      ];
    }

    // Caso 2: Array
    if (type === "array") {
      if (!Array.isArray(newValue)) {
        return [false, `El nuevo valor para "${name}" debe ser un array.`];
      }

      const lengthOriginal = (entry.value as any[]).length;
      if (newValue.length !== lengthOriginal) {
        return [
          false,
          `El array "${name}" debe tener exactamente ${lengthOriginal} elementos.`,
        ];
      }

      // Validar tipo del array usando sus elementos en memoria

      for (let i = 0; i < newValue.length; i++) {
        const elementName = `${name}_${i}`;
        const elementAddress = this.getAddressByName(elementName);
        if (!elementAddress)
          return [false, `No se encontró el elemento ${elementName}.`];

        const [ok, elementEntry] = this.getEntryByAddress(elementAddress);
        if (!ok) return [false, elementEntry];

        const elementType = elementEntry.type as PrimitiveType;
        const validation = MemoryValidator.validateValueByType(
          elementType,
          newValue[i]
        );
        if (validation !== true) {
          return [
            false,
            `Elemento ${i} inválido en "${name}": ${validation[1]}`,
          ];
        }
      }

      // Si todo válido, actualizar el array completo
      entry.value = newValue;
      for (let i = 0; i < newValue.length; i++) {
        const elementName = `${name}_${i}`;
        const elementAddress = this.getAddressByName(elementName);
        if (elementAddress) {
          const [ok, elementEntry] = this.getEntryByAddress(elementAddress);
          if (ok) elementEntry.value = newValue[i];
        }
      }

      return [true, `Array "${name}" actualizado correctamente.`];
    }

    // Caso 3: Object → No permitido
    return [
      false,
      `No se puede actualizar directamente un objeto completo ("${name}").`,
    ];
  }

  /**
   * Limpia completamente toda la memoria y los nombres globales registrados.
   */
  clearMemory(): void {
    // 1. Limpiar los nombres globales
    MemoryValidator.clearGlobalNames();

    // 2. Limpiar todos los segmentos de memoria
    this.segments.forEach((segment) => segment.clear());

    // 3. Reiniciar los contadores de direcciones
    Object.keys(Memory.addressCounters).forEach((type) => {
      Memory.addressCounters[type as PrimitiveType | ComplexType] = 0;
    });
  }
}

export { Memory };
export type { PrimitiveType, ComplexType, MemoryEntry };
