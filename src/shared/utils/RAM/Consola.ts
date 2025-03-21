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

    if (command.startsWith("get address ")) {
      return this.ejecutarGetAddress(command.substring(12).trim());
    }

    if (command.startsWith("get segment ")) {
      return this.ejecutarGetSegment(command.substring(12).trim());
    }

    if (command.startsWith("delete address ")) {
      return this.ejecutarDeleteAddress(command.substring(15).trim());
    }

    if (command === "print memory") {
      return this.ejecutarPrintMemory();
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

    return [true, result[1], this.memoria.printMemory()]; // ✅ Devuelve un objeto JSON
  }

  /**
   * Ejecuta el comando "get address" para obtener un valor por dirección de memoria.
   */
  private ejecutarGetAddress(
    address: string
  ): [true, string, object] | [false, string] {
    const result = this.memoria.getEntryByAddress(address);

    if (result[0] === false) {
      return [false, result[1]];
    }

    return [true, "Comando recibido", result[1]]; // ✅ Devuelve objeto JSON directamente
  }

  /**
   * Ejecuta el comando "get segment" para obtener todas las variables de un segmento.
   */
  private ejecutarGetSegment(
    segmentType: string
  ): [true, string, object] | [false, string] {
    const result = this.memoria.getSegmentByType(segmentType as any);

    if (result[0] === false) {
      return [false, result[1]];
    }

    return [true, "Comando recibido", [...result[1].values()]]; // ✅ Devuelve array de objetos JSON
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

    return [true, result[1], this.memoria.printMemory()]; // ✅ Devuelve estado actualizado
  }

  /**
   * Ejecuta el comando "print memory" para devolver el estado actual de la memoria.
   */
  private ejecutarPrintMemory(): [true, object] {
    return [true, this.memoria.printMemory()]; // ✅ Devuelve objeto JSON
  }
}
