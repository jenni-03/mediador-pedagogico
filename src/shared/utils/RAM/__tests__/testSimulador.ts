import Simulador from "../Simulador";

const sim = Simulador.getInstance();

const declaraciones = [
  `object persona = (int edad = 23; string nombre = "Pedro"; double salario = 3200.50; boolean activo = true; char inicial = 'P'; string[] cosas = {"Hola","Hola2"}; string[] meses = {"Enero", "Febrero", "Marzo", "Abril"});`,
  `object vehiculo = (string modelo = "Toyota"; int año = 2022; float kilometraje = 15000.75; boolean electrico = false; char letraTipo = 'T'; string[] colores = {"Rojo", "Azul", "Negro"}; string[] accesorios = {"GPS", "Aire Acondicionado", "Sunroof"});`,
  `int edad = 52;`,
  `float altura = 1.75;`,
  `char inicial = 'A';`,
  `string mensaje = "Hola mundo";`,
  `boolean estado = true;`,
  `int[] edades = {21, 23, 23, 12};`,
  `double[] precios = {10.5, 20.75, 30.99};`,
  `string[] nombres = {"Ana", "Luis", "Carlos"};`,
];

const direcciones: string[] = declaraciones.map(
  (declaracion) => sim.allocateFromString(declaracion)!
);

console.log("\n📌 Estado actual de la memoria:");
console.log(sim.dumpMemory());

direcciones.forEach((addr) => {
  console.log(`\n🔎 Valor en ${addr}:`, sim.getValue(addr));
});

console.log("\n🗑️ Liberando memoria...");
const liberarDirecciones = [direcciones[2], direcciones[6], direcciones[8]]; // Eliminar `edad`, `estado`, `precios`
liberarDirecciones.forEach((addr) => {
  console.log(`🔴 Liberando ${addr}:`, sim.free(addr));
});

console.log("\n📌 Estado de la memoria después de liberar:");
console.log(sim.dumpMemory());
