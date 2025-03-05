import { ValidadorSintaxis } from "../compilador/datos/Sintaxis"; 

class TestValidadorSintaxis {
  public static ejecutarPruebas(): void {
    const pruebas = [

      { comando: "int edad = 25;", esperado: true },
      { comando: "boolean activo = true;", esperado: true },
      { comando: 'String nombre = "Juan";', esperado: true },
      { comando: "double precio = a;", esperado: true },
      { comando: "char letra = 'A';", esperado: true },
      { comando: "int[] edades = {12, 13, 18};", esperado: true },
      { comando: "double[] valores = {2.5, 3.7, 8.1};", esperado: true },
      {
        comando:
          'Object Persona = (int edad = 25, String nombre = "Pedro", double deuda = 123.12);',
        esperado: true,
      },

      // ❌ Casos inválidos - Errores de sintaxis
      { comando: "int x = ;", esperado: false }, // ❌ Falta el valor después de '='
      { comando: "int = 5;", esperado: false }, // ❌ Falta el nombre de la variable
      { comando: "boolean bandera true;", esperado: false }, // ❌ Falta "="
      { comando: "float precio = 9.99", esperado: false }, // ❌ Falta ";"
      { comando: "int 123numero = 10;", esperado: false }, // ❌ Nombre de variable no puede iniciar con número
      { comando: "int[] datos = {uno, dos, tres};", esperado: false }, // ❌ Elementos no numéricos en un array de int
      {
        comando: 'Object Auto = (marca = "Toyota", int año = 2020);',
        esperado: false,
      }, // ❌ Falta tipo en 'marca'
      { comando: "   ", esperado: false }, // ❌ Línea vacía
      { comando: "int número variable = 20;", esperado: false }, // ❌ Espacios en el nombre de variable
      { comando: "int x", esperado: false }, // ❌ Falta "=" y ";"
      {
        comando: 'Object Persona = (edad = 25, nombre = "Pedro");',
        esperado: false,
      }, // ❌ Falta tipo de datos en los atributos del objeto
      { comando: 'char letra = "B";', esperado: false }, // ❌ Char debe estar entre comillas simples
      { comando: "boolean esMayor = Verdadero;", esperado: false }, // ❌ En Java es "true" o "false"

      // ❌ Casos inválidos - Arrays mal definidos
      { comando: "int[] valores = {1, 2, 3.5};", esperado: false }, // ❌ Mezcla de tipos dentro del array
      { comando: 'String[] palabras = {uno, "dos", "tres"};', esperado: false }, // ❌ Elemento sin comillas en String[]
      { comando: "double[] decimales = {1.1, 2.2, , 4.4};", esperado: false }, // ❌ Coma extra en array
      { comando: "int[] edades = {};", esperado: false }, // ❌ Un array no puede estar vacío en Java

      // ❌ Casos inválidos - Objetos mal definidos
      { comando: "Object Cliente = ();", esperado: false }, // ❌ Un objeto no puede estar vacío
      {
        comando: "Object Vehiculo = (String marca Toyota, int año = 2022);",
        esperado: false,
      }, // ❌ Falta "=" en el primer atributo
      {
        comando: 'Object Persona = int edad = 20, String nombre = "Ana";',
        esperado: false,
      }, // ❌ Falta paréntesis en el objeto

      // ❌ Casos inválidos - Otros errores sintácticos
      { comando: "int[] valores = [1, 2, 3];", esperado: false }, // ❌ En Java los arrays se definen con {} no []
      { comando: 'int edad = 20 nombre = "Juan";', esperado: false }, // ❌ Dos asignaciones incorrectas en una línea
      { comando: "boolean esValido = True;", esperado: false }, // ❌ En Java "True" debe ser en minúscula "true"
    ];

    console.log("🔹 EJECUTANDO PRUEBAS DE VALIDACIÓN DE SINTAXIS\n");

    pruebas.forEach(({ comando, esperado }, index) => {
      const resultado = ValidadorSintaxis.validarComando(comando);
      const esCorrecto = resultado.esValido === esperado ? "✅" : "❌";
      console.log(`${esCorrecto} Prueba ${index + 1}:`);
      console.log(`   Comando: ${comando}`);
      console.log(`   Resultado:`, resultado, "\n");
    });

    console.log("🔹 FIN DE PRUEBAS");
  }
}


TestValidadorSintaxis.ejecutarPruebas();
