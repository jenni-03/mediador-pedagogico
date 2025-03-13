import { GestorMemoria } from "./GestorMemoria";

class AlmacenMemoria {
  private static instance: AlmacenMemoria;
  private memoria: Map<string, Map<string, any>>;
  private contadorGlobal = 0;

  private constructor() {
    this.memoria = new Map<string, Map<string, any>>([
      ["boolean", new Map<string, any>()],
      ["char", new Map<string, any>()],
      ["byte", new Map<string, any>()],
      ["short", new Map<string, any>()],
      ["int", new Map<string, any>()],
      ["long", new Map<string, any>()],
      ["float", new Map<string, any>()],
      ["double", new Map<string, any>()],
      ["string", new Map<string, any>()],
      ["object", new Map<string, any>()],
      ["array", new Map<string, any>()],
    ]);
  }

  public static getInstance(): AlmacenMemoria {
    if (!AlmacenMemoria.instance) {
      AlmacenMemoria.instance = new AlmacenMemoria();
    }
    return AlmacenMemoria.instance;
  }

  public obtenerNuevaDireccion(tipo: string): string {
    this.contadorGlobal++;
    return GestorMemoria.generarDireccion(tipo, this.contadorGlobal);
  }

  public insertar(tipo: string, direccion: string, valor: any): void {
    if (!this.memoria.has(tipo)) {
      console.error(`Tipo de dato no soportado: '${tipo}'`);
      return;
    }
    this.memoria.get(tipo)!.set(direccion, valor);
  }

  public obtener(direccion: string): any | null {
    for (const segmento of this.memoria.values()) {
      if (segmento.has(direccion)) {
        return segmento.get(direccion);
      }
    }
    return null;
  }

  public eliminar(direccion: string): boolean {
    for (const segmento of this.memoria.values()) {
      if (segmento.has(direccion)) {
        segmento.delete(direccion);
        return true;
      }
    }
    return false;
  }

  public modificar(direccion: string, nuevoValor: any): boolean {
    for (const segmento of this.memoria.values()) {
      if (segmento.has(direccion)) {
        segmento.set(direccion, nuevoValor);
        return true;
      }
    }
    return false;
  }

  public obtenerEstado(): Record<string, Record<string, any>> {
    const estado: Record<string, Record<string, any>> = {};
    this.memoria.forEach((segmento, tipo) => {
      estado[tipo] = Object.fromEntries(segmento);
    });
    return estado;
  }

  public obtenerSegmento(tipo: string): Record<string, any> | null {
    if (!this.memoria.has(tipo)) {
      console.error(`Tipo de segmento no encontrado: '${tipo}'`);
      return null;
    }
    return Object.fromEntries(this.memoria.get(tipo)!);
  }
}

export default AlmacenMemoria;
