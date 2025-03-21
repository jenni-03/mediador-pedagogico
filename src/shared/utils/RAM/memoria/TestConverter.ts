import { MemoryC } from "./MemoryC";

class MemoryConverterTest {
  static runTests() {
    console.log("🔍 Ejecutando pruebas de MemoryConverter...\n");

    const converter = new MemoryC();

    const testCases = [
      "int x = 10;",
      "double y = 20.5;",
      'string nombre = "Carlos";',
      "boolean activo = truee;",
      'char inicial = "C";',
      "float temperatura = 36.7;",
      "long numeroGrande = 9999999a99999;",
      "int[] numeros = [1.1, 2, 3, 4, 5];",
      "double[] precios = [99.99, 199.99, 299.99];",
      'string[] nombres = ["Juan", "Ana", "Luis"];',
      'object persona = (string nombre = "Carlos"; int edad = 30; float[] deudas = [122.12, 2312.23, 12.32]);',
      'object coche = (string marca = "Toyota"; int anio = 20.20; boolean electrico = true; double[] precios = [25000.50, 27000.75]);',
    ];

    testCases.forEach((test) => {
      try {
        console.log(`📌 Input: ${test}`);
        console.log(converter.parseAndStore(test));
      } catch (error) {
        console.error(`❌ Error en "${test}": ${error}`);
      }
    });

    console.log("\n📌 Estado final de la memoria:");
    const memoryState = converter.printMemory();
    console.log(memoryState.object[0].value);
  }
}

MemoryConverterTest.runTests();
