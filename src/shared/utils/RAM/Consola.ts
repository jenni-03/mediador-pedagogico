import { MemoryC } from "./memoria/MemoryC";
import type { PrimitiveType } from "./memoria/MemoryC";

export class Consola {
  private memoria: MemoryC;

  constructor() {
    this.memoria = new MemoryC();
  }

  /**
   * Ejecuta un comando e interpreta su acción.
   * @param command El comando a ejecutar.
   * @returns `[true, ...any[]]` si tiene éxito, `[false, mensaje]` si hay error.
   */
  ejecutarComando(command: string): [true, ...any[]] | [false, string] {
    command = command.trim();

    if (command === "help") {
      return this.ejecutarHelp();
    }

    if (command.startsWith("delete address ")) {
      return this.ejecutarDeleteAddress(command.substring(15).trim());
    }

    if (command === "clear memory") {
      return this.ejecutarClearMemory();
    }

    if (command.startsWith("convert address ")) {
      return this.ejecutarConvert(command.substring(16).trim());
    }

    if (command.startsWith("size address ")) {
      return this.ejecutarSize(command.substring(13).trim());
    }

    if (command.startsWith("set address ")) {
      return this.ejecutarSet(command.substring(12).trim());
    }

    if (command.startsWith("address of ")) {
      return this.ejecutarAddressOf(command.substring(11).trim());
    }

    if (command.startsWith("type address ")) {
      return this.ejecutarType(command.substring(13).trim());
    }

    // Si el comando no coincide con ningún otro, se asume que es una declaración de variable
    // y se envía al método ejecutarInsert (ahora sin la necesidad de escribir "insert")
    return this.ejecutarInsert(command);
  }

  /**
   * Ejecuta el comando "address of <nombre>" para obtener la dirección de una variable.
   */
  private ejecutarAddressOf(
    name: string
  ): [true, string, object] | [false, string] {
    const address = this.memoria.getAddressByName(name);
    if (!address)
      return [false, `No se encontró una variable con el nombre "${name}".`];
    return [true, address, this.memoria.printMemory()];
  }

  /**
   * Ejecuta el comando "insert" para almacenar variables u objetos en memoria.
   * Ahora se utiliza tanto si el estudiante escribe "insert ..." o si omite el prefijo.
   */
  private ejecutarInsert(
    instruction: string
  ): [true, string, object] | [false, string] {
    const result = this.memoria.parseAndStore(instruction);

    if (result[0] === false) {
      return [false, result[1]];
    }

    return [true, result[1], this.memoria.printMemory()];
  }

  /**
   * Ejecuta el comando "delete address" para eliminar un valor por su dirección de memoria.
   */
  private ejecutarDeleteAddress(
    address: string
  ): [true, string, object] | [false, string] {
    const result = this.memoria.removeByAddress(address);

    if (result[0] === false) {
      return [false, result[1]];
    }

    return [true, result[1], this.memoria.printMemory()];
  }

  /**
   * Ejecuta el comando "clear memory" para borrar toda la memoria y los nombres globales.
   */
  private ejecutarClearMemory(): [true, string, object] {
    this.memoria.clearMemory();
    return [
      true,
      "Memoria limpiada correctamente.",
      this.memoria.printMemory(),
    ];
  }

  /**
   * Ejecuta el comando para devolver el estado actual de la memoria.
   * Nota: ahora es pública.
   */
  public ejecutarPrintMemory(): [true, object] {
    return [true, this.memoria.printMemory()];
  }

  /**
   * Ejecuta el comando "convert address <direccion> to <tipo>" para cambiar el tipo de una variable.
   */
  private ejecutarConvert(
    instruction: string
  ): [true, string, object] | [false, string] {
    const parts = instruction.split(/\s+to\s+/i);
    if (parts.length !== 2) {
      return [
        false,
        `Sintaxis inválida. Usa: convert address <direccion> to <tipo>`,
      ];
    }

    const address = parts[0].trim();
    const newType = parts[1].trim() as PrimitiveType;

    const result = this.memoria.convertPrimitiveType(address, newType);
    if (!result[0]) {
      return [false, result[1]];
    }

    return [true, result[1], this.memoria.printMemory()];
  }

  /**
   * Ejecuta el comando "size address <direccion>" para obtener el tamaño en memoria.
   */
  private ejecutarSize(
    address: string
  ): [true, string, object] | [false, string] {
    const result = this.memoria.getSizeByAddress(address);

    if (!result[0]) {
      return [false, result[1]];
    }

    return [true, result[1], this.memoria.printMemory()];
  }

  /**
   * Ejecuta el comando "help" para listar los comandos disponibles.
   */
  private ejecutarHelp(): [true, string, object] {
    const helpMsg = [
      "Comandos disponibles:",
      "",
      "• Declarar variables: Ej. int x = 3;",
      "• delete address <direccion> --> Eliminar un valor por su dirección.",
      "• clear memory --> Borra completamente toda la memoria.",
      "• convert address <direccion> to <tipo> --> Cambia el tipo de una variable (int, float, etc).",
      "• size address <direccion> --> Muestra el tamaño en memoria de un valor.",
      "• set address <direccion> value <nuevo_valor> --> Cambia el valor de una dirección existente.",
      "• address of <nombre_variable> --> Muestra la dirección de una variable por su nombre.",
      "• type address <direccion> --> Muestra el tipo del valor en la dirección dada.",
      "• help --> Muestra esta lista de comandos.",
    ].join("\n");

    return [true, helpMsg, this.memoria.printMemory()];
  }

  /**
   * Ejecuta el comando "type address <direccion>" para obtener el tipo de dato.
   */
  private ejecutarType(
    address: string
  ): [true, string, object] | [false, string] {
    const result = this.memoria.getTypeByAddress(address);

    if (!result[0]) return [false, result[1]];

    return [true, result[1], this.memoria.printMemory()];
  }

  /**
   * Ejecuta el comando "set address <direccion> value <nuevo_valor>" para actualizar un valor en memoria.
   */
  private ejecutarSet(
    instruction: string
  ): [true, string, object] | [false, string] {
    const parts = instruction.split(/\s+value\s+/i);
    if (parts.length !== 2) {
      return [
        false,
        `Sintaxis inválida. Usa: set address <direccion> value <nuevo_valor>`,
      ];
    }

    const address = parts[0].trim();
    let valueRaw = parts[1].trim();

    let parsedValue: any;

    try {
      // Intentar parsear como JSON para soportar arrays, booleanos, números, etc.
      parsedValue = JSON.parse(valueRaw);
    } catch {
      // Si no es JSON válido, lo dejamos como string plano (útil para 'char', 'string')
      parsedValue = valueRaw;
    }

    const result = this.memoria.updateValueByAddress(address, parsedValue);

    if (!result[0]) {
      return [false, result[1]];
    }

    return [true, result[1], this.memoria.printMemory()];
  }
}
