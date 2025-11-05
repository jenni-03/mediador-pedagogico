// src/checkers/command-interpreter.demo.ts
// Demo integral del CommandInterpreter.
// Imprime SOLO el comando y el mensaje retornado.

// 1) Importa el intérprete y el registro de esquemas
import {
  CommandInterpreter,
  SchemaRegistry,
  type ObjectSchema,
} from "./command-interpreter";

// 2) Define y registra esquemas de ejemplo
const DireccionSchema: ObjectSchema = {
  calle:  { kind: "prim", type: "String" },
  numero: { kind: "prim", type: "int" },
};

const PersonaSchema: ObjectSchema = {
  nombre:    { kind: "prim", type: "String" },             // String o null
  edad:      { kind: "prim", type: "int" },                // requerido
  meses:     { kind: "array", elem: "String", optional: true }, // opcional
  notas:     { kind: "array", elem: "double", minLength: 1 },   // al menos 1
  direccion: { kind: "object", schema: DireccionSchema },       // requerido
};

SchemaRegistry.register("Direccion", DireccionSchema);
SchemaRegistry.register("Persona", PersonaSchema);

// 3) Instancia del intérprete
const I = new CommandInterpreter();

// 4) Utilidad para correr y mostrar cada caso
function caso(cmd: string) {
  try {
    const res = I.validateDeclaration(cmd);
    console.log(`\n» ${cmd}`);
    console.log(res.message);
  } catch (e: any) {
    console.log(`\n» ${cmd}`);
    console.log(`❌ Error de parsing: ${e?.message ?? String(e)}`);
  }
}

// 5) Casos de prueba

// --- Primitivos ---
caso(`int x = 7;`);
caso(`int y = 2.5; // decimal → no entero`);
caso(`boolean b1 = true;`);
caso(`boolean b2 = "true"; // string → no boolean`);
caso(`char c1 = 'A';`);
caso(`char c2 = 66;`);
caso(`char c3 = 'AB'; // literal char inválido (2 chars)`);
caso(`String s1 = "hola";`);
caso(`String s2 = null;`);
// "undefined" no existe en Java: el parser lo tratará como error de expresión
caso(`String s3 = undefined; // token no reconocido en Java`);


// --- long (según Lexicon: number entero, no BigInt) ---
caso(`long l1 = 1; // OK si tu Lexicon acepta number para long`);
caso(`long l2 = 9007199254740992; // > MAX_SAFE_INTEGER → debería fallar por seguridad JS`);
caso(`long l3 = 1n; // BigInt no soportado por el parser`);

// --- Arreglos de primitivos/String ---
caso(`int[] a = {1,2,3};`);
caso(`int[] b = {1, 2.5};`);
caso(`String[] sarr1 = {"uno","dos"};`);
caso(`String[] sarr2 = {"uno", null}; // null permitido para String`);
caso(`char[] carr1 = {'A', 66};`);
caso(`char[] carr2 = {'AB'}; // char inválido`);
caso(`int[] q = 123; // RHS no es array`);

// --- Objetos simples ---
caso(`Persona p = { nombre: "Ana", edad: 20, notas: {4.5}, direccion: { calle: "Calle 1", numero: 123 } };`);
caso(`Persona q = null; // referencia vacía permitida`);
caso(`Persona r = { nombre: "Ana", notas: {4.2}, direccion: { calle: "X", numero: 1 } }; // falta edad`);
caso(`Persona s = { nombre: "Ana", edad: 19, notas: {}, direccion: { calle: "X", numero: 1 } }; // notas vacío (minLength=1)`);
caso(`Persona t = 5; // no es objeto`);
caso(`Persona u = { nombre: "Ana", edad: 22, notas: {4.0}, direccion: { calle: "Z", numero: 10 }, extra: true }; // extra no permitido`);

// --- Objetos anidados / arrays dentro de objetos ---
caso(`Persona pn = {
  nombre: "Luis",
  edad: 21,
  meses: {"Ene","Feb", null},
  notas: {3.5, 4.1},
  direccion: { calle: "K", numero: 55 }
};`);

caso(`Persona pe = {
  nombre: "Zoe",
  edad: 25,
  notas: {5.0},
  direccion: { calle: "Q", numero: 3.14 } // int requerido
};`);

// --- Arreglo de objetos (valida elemento a elemento) ---
caso(`Persona[] grupo = {
  { nombre: "Ana", edad: 20, notas: {4.0}, direccion: { calle: "A", numero: 1 } },
  null,
  { nombre: "Leo", edad: 22, notas: {}, direccion: { calle: "B", numero: 2 } } // notas vacío
};`);

// --- Tipos desconocidos ---
caso(`Foo z = 1; // tipo no registrado ni primitivo`);

// --- Strings con escapes ---
caso(`String sj = "Hola \\"mundo\\"";`);

// --- Comentarios finales ---
console.log("\n--- Fin de la demo del intérprete ---");
