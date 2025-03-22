import { MemoryC } from "./memoria/MemoryC";

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

    if (command.startsWith("insert ")) {
      return this.ejecutarInsert(command.substring(7).trim());
    }

    if (command.startsWith("delete address ")) {
      return this.ejecutarDeleteAddress(command.substring(15).trim());
    }

    if (command === "clear memory") {
      return this.ejecutarClearMemory();
    }

    return [false, "Comando no reconocido."];
  }

  /**
   * Ejecuta el comando "insert" para almacenar variables u objetos en memoria.
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
    return [true, "Memoria limpiada correctamente.", this.memoria.printMemory()];
  }

  /**
   * Ejecuta el comando para devolver el estado actual de la memoria.
   * Nota: ahora es pública.
   */
  public ejecutarPrintMemory(): [true, object] {
    return [true, this.memoria.printMemory()];
  }
}
