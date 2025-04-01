import { Consola } from "./Consola";

const consola = new Consola();

// 📌 Insertando un objeto

var nose = consola.ejecutarComando(
  'insert object persona = (string nombre = "Carlos"; int edad = 30; float[] deudas = [122.12, 2312.23, 12.32]);'
);
console.log(nose[2]);

// 📌 Obteniendo un valor por dirección
nose = consola.ejecutarComando("get address 4x000");
console.log(nose[2]);

nose = consola.ejecutarComando("get segment float");
// 📌 Obteniendo todas las variables de tipo "int"
console.log(nose[2]);

nose = consola.ejecutarComando("delete address 6x000");
console.log(nose);