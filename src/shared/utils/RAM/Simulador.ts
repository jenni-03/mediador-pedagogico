import RAM from "./memoria/RAM";
import ConversorControlador from "./memoria/conversor/ConversorControlador";

class Simulador extends RAM {
  private constructor() {
    super();
  }

  public static override getInstance(): Simulador {
    if (!this.instance || !(this.instance instanceof Simulador)) {
      this.instance = new Simulador();
    }
    return this.instance as Simulador;
  }

  public allocateFromString(declaration: string): string | null {
    const [nombre, tipo, valores, tipos] =
      ConversorControlador.parse(declaration);

    let addr;
    if (tipo === "array") {
      addr = this.allocate(nombre, tipo, valores[nombre], tipos);
    } else if (
      Object.keys(valores).length === 1 &&
      valores[nombre] !== undefined
    ) {
      addr = this.allocate(nombre, tipo, valores[nombre], tipos);
    } else {
      addr = this.allocate(nombre, tipo, valores, tipos);
    }

    return addr;
  }

  public allocateWithDetails(declaration: string): {
    estadoMemoria: Record<string, Record<string, any>>;
    segmentoMemoria: Record<string, any> | null;
    descripcion: string;
  } {
    const [nombre, tipo, valores, tipos] =
      ConversorControlador.parse(declaration);

    let addr;
    if (tipo === "array") {
      addr = this.allocate(nombre, tipo, valores[nombre], tipos);
    } else if (
      Object.keys(valores).length === 1 &&
      valores[nombre] !== undefined
    ) {
      addr = this.allocate(nombre, tipo, valores[nombre], tipos);
    } else {
      addr = this.allocate(nombre, tipo, valores, tipos);
    }

    if (!addr) {
      throw new Error(`Error al asignar la declaración: ${declaration}`);
    }

    const estadoMemoria = this.dumpMemory();

    const segmentoMemoria = this.getMemorySegment(tipo);

    const valorAsignado =
      valores[nombre] !== undefined ? valores[nombre] : valores;
    const descripcion = `${tipo} | Nombre: ${nombre} | Valor: ${JSON.stringify(valorAsignado)} | Dirección: ${addr}`;

    return { estadoMemoria, segmentoMemoria, descripcion };
  }
}

export default Simulador;
