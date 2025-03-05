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
}

export default Simulador;
