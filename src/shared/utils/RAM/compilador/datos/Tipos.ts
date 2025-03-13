export class ValidadorTipos {
    private static tiposValidos: { [key: string]: { regex: RegExp; rango?: [number, number] } } = {
      boolean: { regex: /^(true|false)$/ },
      char: { regex: /^'.'$/ },
      byte: { regex: /^-?\d+$/, rango: [-128, 127] },
      short: { regex: /^-?\d+$/, rango: [-32768, 32767] },
      int: { regex: /^-?\d+$/, rango: [-2147483648, 2147483647] },
      long: { regex: /^-?\d+$/, rango: [-9223372036854775808, 9223372036854775807] },
      float: { regex: /^-?\d+(\.\d+)?(E[+-]?\d+)?$/, rango: [-3.40282347e+38, 3.40282347e+38] },
      double: { regex: /^-?\d+(\.\d+)?(E[+-]?\d+)?$/, rango: [-1.7976931348623157e+308, 1.7976931348623157e+308] },
      String: { regex: /^".*"$/ },
      Objeto: { regex: /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\((.+)\)$/ },
    };
  
    /**
     * Valida si un tipo de dato es válido y si su valor corresponde a dicho tipo.
     * @param tipo - Tipo de dato en Java.
     * @param valor - Valor asignado.
     * @returns Un objeto con `{ esValido: boolean, mensaje: string }`.
     */
    public static validarTipo(tipo: string, valor: string): {
      esValido: boolean;
      mensaje: string;
    } {
      // Verificar si el tipo de dato existe
      if (!this.tiposValidos.hasOwnProperty(tipo)) {
        return {
          esValido: false,
          mensaje: `Error: El tipo '${tipo}' no es un tipo de dato válido.`,
        };
      }
  
      // Validar el valor según el tipo
      const tipoInfo = this.tiposValidos[tipo];
  
      if (!tipoInfo.regex.test(valor.trim())) {
        return {
          esValido: false,
          mensaje: `Error: El valor '${valor}' no es válido para el tipo '${tipo}'.`,
        };
      }
  
      // Validar rango si aplica
      if (tipoInfo.rango) {
        const numValor = parseFloat(valor);
        if (numValor < tipoInfo.rango[0] || numValor > tipoInfo.rango[1]) {
          return {
            esValido: false,
            mensaje: `Error: El valor '${valor}' está fuera del rango permitido para '${tipo}' (${tipoInfo.rango[0]} a ${tipoInfo.rango[1]}).`,
          };
        }
      }
  
      return { esValido: true, mensaje: "Tipo y valor válidos." };
    }
  
    /**
     * Valida la sintaxis de un Objeto y sus atributos internos.
     * @param tipoObjeto - Nombre del objeto.
     * @param contenido - Contenido del objeto con atributos.
     * @returns Un objeto con `{ esValido: boolean, mensaje: string }`.
     */
    public static validarObjeto(tipoObjeto: string, contenido: string): {
      esValido: boolean;
      mensaje: string;
    } {
      // Separar los atributos y asegurarse de que haya al menos uno
      const atributos = contenido.split(",").map((attr) => attr.trim());
  
      if (atributos.length === 0 || atributos[0] === "") {
        return {
          esValido: false,
          mensaje: `Error: El objeto '${tipoObjeto}' debe tener al menos un atributo.`,
        };
      }
  
      for (const atributo of atributos) {
        // Verificar que cada atributo tenga el formato correcto: tipo nombre = valor
        const regexAtributo = /^(?<tipo>\w+)\s+(?<nombre>[a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?<valor>".*"|'.'|-?\d+(\.\d+)?(E[+-]?\d+)?|true|false)$/;
        const match = atributo.match(regexAtributo);
  
        if (!match || !match.groups) {
          return {
            esValido: false,
            mensaje: `Error de sintaxis: El atributo '${atributo}' en el objeto '${tipoObjeto}' no es válido.`,
          };
        }
  
        const { tipo, valor } = match.groups;
        const validacion = this.validarTipo(tipo, valor);
  
        if (!validacion.esValido) {
          return {
            esValido: false,
            mensaje: `Error en el atributo '${match.groups.nombre}': ${validacion.mensaje}`,
          };
        }
      }
  
      return { esValido: true, mensaje: `Objeto '${tipoObjeto}' válido.` };
    }
  }
  