// src/checkers/object-value-validator.demo.ts
// Demo sin framework: imprime SOLO la declaración/contexto y el mensaje.
// Ejecuta con: npx tsx src/checkers/object-value-validator.demo.ts

import { ObjectValueValidator, type ObjectSchema } from "./object-value-validator";

function linea(declaracion: string, fn: () => { ok: boolean; message: string }) {
  const res = fn();
  console.log(declaracion);
  console.log(res.message + "\n");
}

// ===== Esquemas de ejemplo =====
const DireccionSchema: ObjectSchema = {
  calle:  { kind: "prim", type: "String" },
  numero: { kind: "prim", type: "int" },
};

const PersonaSchema: ObjectSchema = {
  nombre:    { kind: "prim", type: "String" },   // String o null
  edad:      { kind: "prim", type: "int" },      // entero
  meses:     { kind: "array", elem: "String", optional: true }, // opcional
  notas:     { kind: "array", elem: "double", minLength: 1 },   // al menos 1
  direccion: { kind: "object", schema: DireccionSchema },       // requerido
};

const PersonaConContactoSchema: ObjectSchema = {
  ...PersonaSchema,
  contacto: { kind: "object", schema: {
    email: { kind: "prim", type: "String" },
    tel:   { kind: "prim", type: "String", optional: true },
  }, optional: true }
};

(async () => {
  // ===================== Declaración =====================

  linea("declaración: Persona p = { OK mínimo }", () =>
    new ObjectValueValidator(PersonaSchema, "p", {
      nombre: "Ana",
      edad: 20,
      notas: [4.5],
      direccion: { calle: "Calle 1", numero: 123 }
      // meses omitido (opcional)
    }).validate()
  );

  linea("declaración: Persona q = null; // referencia vacía permitida", () =>
    new ObjectValueValidator(PersonaSchema, "q", null).validate()
  );

  linea("declaración: Persona id inválido (int)", () =>
    new ObjectValueValidator(PersonaSchema, "int", {
      nombre: "Ana",
      edad: 20,
      notas: [5.0],
      direccion: { calle: "Calle 1", numero: 10 }
    }).validate()
  );

  linea("declaración: Persona con campo extra no permitido", () =>
    new ObjectValueValidator(PersonaSchema, "p2", {
      nombre: "Luis",
      edad: 22,
      notas: [3.8],
      direccion: { calle: "Calle 9", numero: 99 },
      extra: true
    }).validate()
  );

  linea("declaración: Persona sin campo requerido 'edad'", () =>
    new ObjectValueValidator(PersonaSchema, "p3", {
      nombre: "Mia",
      notas: [4.0],
      direccion: { calle: "X", numero: 1 }
    } as any).validate()
  );

  linea('declaración: Persona.meses = {"Ene", 2} // error en meses[1]', () =>
    new ObjectValueValidator(PersonaSchema, "p4", {
      nombre: "Sol",
      edad: 19,
      meses: ["Ene", 2 as any],
      notas: [4.1],
      direccion: { calle: "Calle", numero: 5 }
    }).validate()
  );

  linea("declaración: Persona.notas = [] // minLength=1", () =>
    new ObjectValueValidator(PersonaSchema, "p5", {
      nombre: "Neo",
      edad: 30,
      notas: [],
      direccion: { calle: "Z", numero: 7 }
    }).validate()
  );

  linea("declaración: Persona.direccion.numero = 3.14 // int requerido", () =>
    new ObjectValueValidator(PersonaSchema, "p6", {
      nombre: "Zoe",
      edad: 25,
      notas: [4.5],
      direccion: { calle: "C", numero: 3.14 as any }
    }).validate()
  );

  linea("declaración: Persona.nombre = null // permitido (referencia)", () =>
    new ObjectValueValidator(PersonaSchema, "p7", {
      nombre: null,
      edad: 21,
      notas: [4.2],
      direccion: { calle: "A", numero: 1 }
    }).validate()
  );

  linea("declaración: Persona.meses = null // referencia de array vacía permitida", () =>
    new ObjectValueValidator(PersonaSchema, "p8", {
      nombre: "Ana",
      edad: 20,
      meses: null,
      notas: [4.5],
      direccion: { calle: "Calle 1", numero: 123 }
    }).validate()
  );

  linea("declaración: Persona.contacto opcional ausente (OK)", () =>
    new ObjectValueValidator(PersonaConContactoSchema, "p9", {
      nombre: "Eli",
      edad: 18,
      notas: [3.9],
      direccion: { calle: "B", numero: 2 }
      // contacto ausente → OK porque es opcional
    }).validate()
  );

  linea("declaración: Persona.contacto.email = 123 // error primitivo", () =>
    new ObjectValueValidator(PersonaConContactoSchema, "p10", {
      nombre: "Leo",
      edad: 22,
      notas: [4.0],
      direccion: { calle: "K", numero: 12 },
      contacto: { email: 123 as any } // tel opcional omitido
    }).validate()
  );

  // ===================== Valor interno (inner) =====================

  linea("inner: persona (OK) en path=p", () =>
    new ObjectValueValidator(PersonaSchema, {
      nombre: "Ana",
      edad: 19,
      notas: [5.0],
      direccion: { calle: "Calle 2", numero: 321 }
    }, { path: "p" }).validate()
  );

  linea("inner: persona = undefined // prohibido", () =>
    new ObjectValueValidator(PersonaSchema, undefined as any, { path: "p" }).validate()
  );

  linea("inner: persona = [] // no es objeto", () =>
    new ObjectValueValidator(PersonaSchema, [] as any, { path: "p" }).validate()
  );

  linea("inner: p.direccion.numero = 2.5 // error anidado", () =>
    new ObjectValueValidator(PersonaSchema, {
      nombre: "Kai",
      edad: 23,
      notas: [4.6],
      direccion: { calle: "Q", numero: 2.5 as any }
    }, { path: "p" }).validate()
  );

  linea("inner: p.meses = ['Ene', null, 'Mar'] // OK si String permite null", () =>
    new ObjectValueValidator(PersonaSchema, {
      nombre: "Sam",
      edad: 24,
      meses: ["Ene", null, "Mar"],
      notas: [4.3],
      direccion: { calle: "R", numero: 77 }
    }, { path: "p" }).validate()
  );

  console.log("--- Fin de la demo de objetos ---");
})();
