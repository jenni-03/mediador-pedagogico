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
    if (valueValidation !== true) return [false, valueValidation[1]];

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
    if (arrayValidation[0] === false)
      return [false, `"Array ${name}": ${arrayValidation[1]}`];

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
      const elementName = `${name}_element_${i}`;
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
    if (objectValidation[0] === false) return [false, objectValidation[1]];

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
  remove(address: string): [true, string] | [false, string] {
    for (const segment of this.segments.values()) {
      if (segment.has(address)) {
        const entry = segment.get(address)!;

        // Si es un objeto, eliminamos todas sus propiedades internas
        if (entry.type === "object") {
          const properties = entry.value as {
            type: PrimitiveType | "array";
            key: string;
            value: any;
          }[];

          properties.forEach((prop) => {
            const propAddress = `${entry.name}_${prop.key}`;

            // Si la propiedad es un array, eliminarlo correctamente
            if (Array.isArray(prop.value)) {
              const arrayAddress = this.getAddressByName(propAddress);
              if (arrayAddress) {
                this.remove(arrayAddress);
              }
            } else {
              this.removeByName(propAddress); // Elimina datos primitivos normalmente
            }
          });
        }

        // Si es un array, eliminamos todos sus elementos internos
        if (entry.type === "array") {
          const elements = entry.value as any[];
          for (let i = 0; i < elements.length; i++) {
            this.removeByName(`${entry.name}_element_${i}`);
          }
        }

        // Finalmente, eliminamos la entrada principal
        segment.delete(address);
        return [
          true,
          `Variable eliminada en dirección ${address} y su contenido interno.`,
        ];
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
   * Elimina un dato de la memoria según su nombre.
   * Se usa internamente para borrar elementos de arrays y objetos.
   * @param name Nombre de la variable a eliminar.
   */
  private removeByName(name: string): void {
    for (const segment of this.segments.values()) {
      for (const [address, entry] of segment.entries()) {
        if (entry.name === name) {
          segment.delete(address);
          break;
        }
      }
    }
  }

  /**
   * Imprime el estado completo de la memoria, mostrando todos los segmentos.
   * @returns Cadena con la representación de la memoria.
   */
  printMemory(): string {
    let output = "";
    this.segments.forEach((segment, type) => {
      output += `\n[${type}]:\n`;
      segment.forEach((entry) => {
        output += `  ${JSON.stringify(entry)}\n`;
      });
    });
    return output;
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
   * Obtiene todas las variables almacenadas en un segmento específico.
   * @param type Tipo de segmento (boolean, int, object, etc.).
   * @returns `[true, segmento]` si se encuentra, `[false, mensaje]` si no existe.
   */
  getSegmentByType(
    type: PrimitiveType | ComplexType
  ): [true, Map<string, MemoryEntry>] | [false, string] {
    if (!this.segments.has(type)) {
      return [false, `No se encontró el segmento de tipo "${type}".`];
    }

    const segment = this.segments.get(type)!;
    if (segment.size === 0) {
      return [false, `El segmento de tipo "${type}" está vacío.`];
    }

    return [true, segment];
  }
}

export { Memory };
export type { PrimitiveType, ComplexType, MemoryEntry };
