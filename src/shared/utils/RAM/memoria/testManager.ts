import { Memory } from "./Memory";
import { MemoryManager } from "./MemoryManager";

const ram = new Memory();
const manager = new MemoryManager(ram);

// Guardamos un entero
console.log(ram.storePrimitive("int", "x", 3));
console.log(ram.storeArray("int", "xd", [3, 1, 23, ,3]));

// Buscamos por dirección (ejemplo: "4x000")
console.log(manager.getByAddress("4x000"));

// Imprimimos solo los enteros en memoria
console.log(manager.printSegment("int"));

// Verificamos el tamaño en bytes de "xd"
console.log(manager.getSize("Ax000"));

// Convertimos "x" de int a long
console.log(manager.changeType("4x000", "long"));
console.log(manager.getByAddress("5x000"));

// Imprimimos toda la memoria sin errores
console.log(manager.printSegment("long"));

// Limpiamos toda la memoria
console.log(manager.clearMemory());
