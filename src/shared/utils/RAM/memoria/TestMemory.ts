import { Memory } from "./Memory";

class MemoryTest {
  static runTests() {
    console.log("🔍 Ejecutando pruebas de la memoria...\n");

    const ram = new Memory();

    // 🟢 Almacenar datos en memoria
    console.log(ram.storePrimitive("int", "x", 3));
    console.log(ram.storePrimitive("double", "xd", 199.99));
    console.log(ram.storeArray("long", "numeros", [1, 22, 3, 4]));

    console.log(
      ram.storeObject("persona", [
        { type: "string", key: "nombre", value: "Carlos" },
        { type: "int", key: "edad", value: 3.1 },
        { type: "long", key: "deudas", value: [12.3, 123] },
      ])
    );

    console.log("\n📌 Estado de la memoria antes de eliminar:");
    console.log(ram.printMemory());

    // 🔴 PROBANDO ELIMINACIÓN DE DATOS

    // 1️⃣ Eliminamos un valor primitivo
    console.log("\n🗑 Eliminando la variable 'x'...");
    console.log(ram.remove("4x000")); // Suponiendo que "x" tiene la dirección 4x000

    // 2️⃣ Eliminamos un array completo
    console.log("\n🗑 Eliminando el array 'numeros'...");
    console.log(ram.remove("Ax000")); // Suponiendo que "numeros" tiene la dirección Ax000

    // 3️⃣ Eliminamos un objeto completo (y verificamos que se eliminen sus propiedades)
    console.log("\n🗑 Eliminando el objeto 'persona'...");
    console.log(ram.remove("9x000")); // Suponiendo que "persona" tiene la dirección 9x000

    // 🔍 Verificar el estado de la memoria después de eliminar
    console.log("\n📌 Estado de la memoria después de eliminar:");
    console.log(ram.printMemory());
  }
}

MemoryTest.runTests();
