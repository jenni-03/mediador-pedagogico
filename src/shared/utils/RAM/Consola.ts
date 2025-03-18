import { MemoryC } from "./memoria/MemoryC";

export class Consola {
  private memoria: MemoryC;

  constructor() {
    this.memoria = new MemoryC();
  }

  /**
   * Ejecuta un comando e interpreta su acción.
   * @param command El comando a ejecutar.
   * @returns `[true, ...mensajes]` si tiene éxito, `[false, mensaje]` si hay error.
   */
  ejecutarComando(command: string): [true, ...string[]] | [false, string] {
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

    return [false, "Comando no reconocido."];
  }

  /**
   * Ejecuta el comando "insert" para almacenar variables u objetos en memoria.
   */
  private ejecutarInsert(
    instruction: string
  ): [true, string, string] | [false, string] {
    const result = this.memoria.parseAndStore(instruction);

    if (result[0] === false) {
      return [false, result[1]];
    }

    return [true, result[1], this.memoria.printMemory()];
  }

  /**
   * Ejecuta el comando "get address" para obtener un valor por dirección de memoria.
   */
  private ejecutarGetAddress(
    address: string
  ): [true, ...string[]] | [false, string] {
    const result = this.memoria.getEntryByAddress(address);

    if (result[0] === false) {
      return [false, result[1]];
    }

    return [
      true,
      "Comando recibido",
      this.memoria.printMemory(),
      JSON.stringify(result[1]),
    ];
  }

  /**
   * Ejecuta el comando "get segment" para obtener todas las variables de un segmento.
   */
  private ejecutarGetSegment(
    segmentType: string
  ): [true, ...string[]] | [false, string] {
    const result = this.memoria.getSegmentByType(segmentType as any);

    if (result[0] === false) {
      return [false, result[1]];
    }

    return [
      true,
      "Comando recibido",
      this.memoria.printMemory(),
      JSON.stringify([...result[1].values()], null, 2),
    ];
  }
}
