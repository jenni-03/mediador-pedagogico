import { ValidadorSintaxis } from "./datos/Sintaxis"; // Ajusta la ruta según tu estructura
import { ValidadorTipos } from "./datos/Tipos";

export class ControlD {
  /**
   * Recibe una declaración de variable y la valida con Sintaxis y Tipos.
   * @param declaracion - La cadena de texto con la declaración de variable.
   * @returns `{ esValido: boolean, mensaje?: string }`
   */
  public static procesarDeclaracion(declaracion: string): {
    esValido: boolean;
    mensaje?: string;
  } {
    // ✅ Paso 1: Validar sintaxis
    const resultadoSintaxis = ValidadorSintaxis.validarComando(declaracion);

    if (!resultadoSintaxis.esValido) {
      return { esValido: false, mensaje: resultadoSintaxis.mensaje };
    }

    // ✅ Paso 2: Extraer el tipo, nombre y valor de la declaración válida
    const regex = /^(\w+)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+);$/;
    const match = declaracion.match(regex);

    if (!match) {
      return { esValido: false, mensaje: "Error al analizar la declaración." };
    }

    let [, tipo, nombre, valor] = match;

    // ✅ Paso 3: Validar tipo y valor con ValidadorTipos
    const resultadoTipo =
      tipo === "Object"
        ? ValidadorTipos.validarObjeto(nombre, valor)
        : ValidadorTipos.validarTipo(tipo, valor);

    if (!resultadoTipo.esValido) {
      return { esValido: false, mensaje: resultadoTipo.mensaje };
    }

    // ✅ Si todo está bien, la declaración es válida
    return { esValido: true };
  }
}
