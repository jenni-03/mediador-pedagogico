import { ValidadorTipos } from "../compilador/datos/Tipos"; 

class TestValidadorTipos {
  public static ejecutarPruebas(): void {
    const pruebas = [
      // ✅ Casos válidos - Tipos de datos primitivos correctos
      { tipo: "int", valor: "100", esperado: true },
      { tipo: "boolean", valor: "true", esperado: true },
      { tipo: "char", valor: "'A'", esperado: true },
      { tipo: "String", valor: '"Hola"', esperado: true },
      { tipo: "double", valor: "3.1416", esperado: true },
      { tipo: "long", valor: "9223372036854775807", esperado: true },
      { tipo: "float", valor: "1.2E3", esperado: true },

      // ❌ Casos inválidos - Tipos incorrectos o valores mal formateados
      { tipo: "entero", valor: "10", esperado: false }, // ❌ Tipo inexistente
      { tipo: "byte", valor: "200", esperado: false }, // ❌ Fuera del rango permitido (-128 a 127)
      { tipo: "short", valor: "999999", esperado: false }, // ❌ Fuera del rango permitido (-32768 a 32767)
      { tipo: "int", valor: "2147483648", esperado: false }, // ❌ Fuera del rango permitido (-2147483648 a 2147483647)
      { tipo: "char", valor: "'AB'", esperado: false }, // ❌ Char solo permite un carácter
      { tipo: "String", valor: "Hola", esperado: false }, // ❌ Strings deben estar entre comillas dobles
      { tipo: "boolean", valor: "verdadero", esperado: false }, // ❌ En Java es "true" o "false"
      { tipo: "float", valor: "3.40282347E+39", esperado: false }, // ❌ Fuera de rango

      // ✅ Casos válidos - Objetos bien formateados
      {
        tipo: "Objeto",
        valor: "Persona = (int edad = 25, String nombre = \"Pedro\")",
        esperado: true,
      },
      {
        tipo: "Objeto",
        valor: "Auto = (boolean electrico = false, double precio = 30000.99)",
        esperado: true,
      },

      // ❌ Casos inválidos - Objetos mal formateados
      {
        tipo: "Objeto",
        valor: "Persona = (edad = 25, nombre = \"Pedro\")",
        esperado: false,
      }, // ❌ Falta tipo de datos en los atributos
      {
        tipo: "Objeto",
        valor: "Persona = ()",
        esperado: false,
      }, // ❌ Un objeto no puede estar vacío
      {
        tipo: "Objeto",
        valor: "Carro = (String marca Toyota, int año = 2022)",
        esperado: false,
      }, // ❌ Falta '=' en el primer atributo
      {
        tipo: "Objeto",
        valor: 'Persona = int edad = 20, String nombre = "Ana";',
        esperado: false,
      }, // ❌ Falta paréntesis en el objeto
    ];

    console.log("🔹 EJECUTANDO PRUEBAS DE VALIDACIÓN DE TIPOS DE DATOS\n");

    pruebas.forEach(({ tipo, valor, esperado }, index) => {
      const resultado =
        tipo === "Objeto"
          ? ValidadorTipos.validarObjeto(tipo, valor)
          : ValidadorTipos.validarTipo(tipo, valor);
      const esCorrecto = resultado.esValido === esperado ? "✅" : "❌";
      console.log(`${esCorrecto} Prueba ${index + 1}:`);
      console.log(`   Tipo: ${tipo}`);
      console.log(`   Valor: ${valor}`);
      console.log(`   Resultado:`, resultado, "\n");
    });

    console.log("🔹 FIN DE PRUEBAS");
  }
}

TestValidadorTipos.ejecutarPruebas();
