import { ControlD } from "../compilador/controlD"; 

class TestControlD {
  public static ejecutarPruebas(): void {
    const pruebas = [
      // ✅ Casos válidos - Declaraciones correctas
      { declaracion: "int edad = 25;", esperado: true },
      { declaracion: "boolean activo = true;", esperado: true },
      { declaracion: 'String nombre = "Juan";', esperado: true },
      { declaracion: "double precio = 3.99;", esperado: true },
      { declaracion: "char letra = 'A';", esperado: true },
      { declaracion: "long numeroLargo = 9223372036854775807;", esperado: true },
      {
        declaracion: 'Object Persona = (int edad = 30, String nombre = "Carlos");',
        esperado: true,
      },

      // ❌ Casos inválidos - Errores de sintaxis detectados por Sintaxis.ts
      { declaracion: "int x = ;", esperado: false }, // ❌ Falta el valor después de '='
      { declaracion: "int = 5;", esperado: false }, // ❌ Falta el nombre de la variable
      { declaracion: "boolean bandera true;", esperado: false }, // ❌ Falta "="
      { declaracion: "float precio = 9.99", esperado: false }, // ❌ Falta ";"
      { declaracion: "int[] edades = {12, 13, , 18};", esperado: false }, // ❌ Coma extra en array

      // ❌ Casos inválidos - Errores de tipo detectados por Tipos.ts
      { declaracion: "int edad = 2147483648;", esperado: false }, // ❌ Fuera del rango de int
      { declaracion: "char letra = 'AB';", esperado: false }, // ❌ Char solo permite un carácter
      { declaracion: 'String mensaje = Hola;', esperado: false }, // ❌ Strings deben estar entre comillas dobles
      { declaracion: "boolean esMayor = Verdadero;", esperado: false }, // ❌ "true" y "false" deben estar en minúscula
      {
        declaracion: 'Object Persona = (edad = 30, String nombre = "Carlos");',
        esperado: false,
      }, // ❌ Falta el tipo de dato en el primer atributo
      {
        declaracion: "Object Vehiculo = ();",
        esperado: false,
      }, // ❌ Un objeto no puede estar vacío
    ];

    console.log("🔹 EJECUTANDO PRUEBAS DE CONTROL DE DECLARACIONES\n");

    pruebas.forEach(({ declaracion, esperado }, index) => {
      const resultado = ControlD.procesarDeclaracion(declaracion);
      const esCorrecto = resultado.esValido === esperado ? "✅" : "❌";
      console.log(`${esCorrecto} Prueba ${index + 1}:`);
      console.log(`   Declaración: ${declaracion}`);
      console.log(`   Resultado:`, resultado, "\n");
    });

    console.log("🔹 FIN DE PRUEBAS");
  }
}

// Ejecutar pruebas
TestControlD.ejecutarPruebas();
