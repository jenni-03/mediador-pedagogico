import RAM from "../memoria/RAM";
import ConversorControlador from "../memoria/conversor/ConversorControlador";

const ram = RAM.getInstance();

// 🔹 Declaraciones variadas
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

const direcciones: string[] = [];

declaraciones.forEach((declaracion) => {
  const [nombre, tipo, valores, tipos] =
    ConversorControlador.parse(declaracion);

  let addr;
  if (tipo === "array") {
    addr = ram.allocate(nombre, tipo, valores[nombre], tipos);
  } else if (
    Object.keys(valores).length === 1 &&
    valores[nombre] !== undefined
  ) {
    addr = ram.allocate(nombre, tipo, valores[nombre], tipos);
  } else {
    addr = ram.allocate(nombre, tipo, valores, tipos);
  }

  direcciones.push(addr!);
});

console.log("\n📌 Estado actual de la memoria:");
console.log(ram.dumpMemory());

direcciones.forEach((addr) => {
  console.log(`\n🔎 Valor en ${addr}:`, ram.getValue(addr));
});
