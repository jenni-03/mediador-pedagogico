export class ValidadorSintaxis {
  /**
   * Valida la estructura general de un comando de declaración de variable.
   * @param comando - Línea de código ingresada en la consola.
   * @returns Un objeto con `{ esValido: boolean, mensaje: string }`
   */
  public static validarComando(comando: string): {
    esValido: boolean;
    mensaje: string;
  } {
    // ✅ 1. Verificar que la línea no esté vacía
    if (!comando.trim()) {
      return {
        esValido: false,
        mensaje: "Error de sintaxis: El comando está vacío.",
      };
    }

    // ✅ 2. Verificar que la línea termine en ";"
    if (!comando.trim().endsWith(";")) {
      return {
        esValido: false,
        mensaje: "Error de sintaxis: Falta ';' al final de la declaración.",
      };
    }

    // ✅ 3. Verificar si es un objeto (Object Persona = (...);)
    const objetoRegex = /^Object\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\((.+)\);$/;
    const objetoMatch = comando.match(objetoRegex);
    if (objetoMatch) {
      return this.validarObjeto(objetoMatch[1], objetoMatch[2]);
    }

    // ✅ 4. Verificar si es un array (int[] edades = {1,2,3};)
    const arrayRegex = /^(\w+)\[\]\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\{(.+)\};$/;
    const arrayMatch = comando.match(arrayRegex);
    if (arrayMatch) {
      return this.validarArray(arrayMatch[1], arrayMatch[2], arrayMatch[3]);
    }

    // ✅ 5. Verificar la estructura básica de variables simples (tipo nombre = valor;)
    const regex = /^(\w+)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+);$/;
    const match = comando.match(regex);

    if (!match) {
      return {
        esValido: false,
        mensaje: `Error de sintaxis: '${comando}' no es una asignación válida.`,
      };
    }

    let [, tipo, nombre, valor] = match;

    // ✅ 6. Validar que el nombre de la variable sea correcto
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(nombre)) {
      return {
        esValido: false,
        mensaje: `Error de sintaxis: Nombre de variable inválido '${nombre}'.`,
      };
    }

    // ✅ 7. Verificar que no haya múltiples asignaciones incorrectas
    if (valor.includes("=")) {
      return {
        esValido: false,
        mensaje: `Error de sintaxis: Demasiadas asignaciones en una línea.`,
      };
    }

    // ✅ 8. Verificar que haya un valor después del "="
    if (!valor.trim()) {
      return {
        esValido: false,
        mensaje: `Error de sintaxis: Falta un valor después de '=' en la declaración de '${nombre}'.`,
      };
    }

    // ✅ 9. Validar comillas simples para `char`
    if (tipo === "char" && !/^'.'$/.test(valor.trim())) {
      return {
        esValido: false,
        mensaje: `Error de sintaxis: '${valor}' no es un carácter válido (debe ser un solo carácter entre comillas simples).`,
      };
    }

    return { esValido: true, mensaje: "Comando válido." };
  }

  /**
   * Valida la sintaxis de un array.
   */
  private static validarArray(
    tipo: string,
    nombre: string,
    contenido: string
  ): { esValido: boolean; mensaje: string } {
    // Verificar si el array está vacío
    if (!contenido.trim()) {
      return {
        esValido: false,
        mensaje: `Error de sintaxis: El array '${nombre}' no puede estar vacío.`,
      };
    }

    // Verificar la estructura del array
    const valores = contenido.split(",").map((v) => v.trim());

    // No validar tipos de datos aquí, solo estructura
    if (!valores.every((v) => v.length > 0)) {
      return {
        esValido: false,
        mensaje: `Error de sintaxis: Elemento vacío en el array '${nombre}'.`,
      };
    }

    return {
      esValido: true,
      mensaje: `Array '${nombre}' de tipo '${tipo}' válido.`,
    };
  }

  private static validarObjeto(
    nombre: string,
    contenido: string
  ): { esValido: boolean; mensaje: string } {
    // ✅ Verificar si el objeto está completamente vacío (caso Object Cliente = ();)
    if (!contenido.trim() || contenido.trim() === "()") {
      return {
        esValido: false,
        mensaje: `Error de sintaxis: El objeto '${nombre}' no puede estar vacío.`,
      };
    }

    // ✅ Separar los atributos y asegurarse de que haya al menos uno
    const atributos = contenido.split(",").map((attr) => attr.trim());

    if (atributos.length === 0 || atributos[0] === "") {
      return {
        esValido: false,
        mensaje: `Error de sintaxis: El objeto '${nombre}' debe tener al menos un atributo.`,
      };
    }

    for (const atributo of atributos) {
      // ✅ Verificar que cada atributo tenga el formato correcto: tipo nombre = valor
      const regexAtributo =
        /^(\w+)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(".+"|'.'|[^,]+)$/;
      const match = atributo.match(regexAtributo);

      if (!match) {
        return {
          esValido: false,
          mensaje: `Error de sintaxis: El atributo '${atributo}' en el objeto '${nombre}' no es válido.`,
        };
      }
    }

    return { esValido: true, mensaje: `Objeto '${nombre}' válido.` };
  }
}
