import { GestorMemoria } from "../memoria/GestorMemoria";

console.log("🔹 Prueba 1: Generación de Direcciones Únicas");
const var1 = GestorMemoria.obtenerDireccion("perro", "int");
const var2 = GestorMemoria.obtenerDireccion("orrep", "int");
console.log("perro (int):", var1);
console.log("orrep (int):", var2);

console.log("\n🔹 Prueba 2: Cálculo del Tamaño de Memoria");
console.log("boolean:", GestorMemoria.calcularEspacio("boolean"), "bytes");
console.log("char:", GestorMemoria.calcularEspacio("char"), "bytes");
console.log("int:", GestorMemoria.calcularEspacio("int"), "bytes");
console.log("double:", GestorMemoria.calcularEspacio("double"), "bytes");

console.log("\n🔹 Prueba 3: Variables con Nombres Diferentes");
const var3 = GestorMemoria.obtenerDireccion("x", "int");
const var4 = GestorMemoria.obtenerDireccion("y", "int");
console.log("x (int):", var3);
console.log("y (int):", var4);

console.log("\n🔹 Prueba 4: Error en Tipo de Dato No Soportado");
try {
  GestorMemoria.calcularEspacio("vector");
} catch (error: any) {
  console.log("Error esperado:", error.message);
}

try {
  GestorMemoria.obtenerDireccion("objeto", "vector");
} catch (error: any) {
  console.log("Error esperado:", error.message);
}
