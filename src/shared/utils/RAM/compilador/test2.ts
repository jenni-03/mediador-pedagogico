// src/checkers/primitive-value-validator.demo.ts
// Demo sin framework: imprime SOLO la declaración/contexto y el mensaje del validador.
// Ejecuta con: npx tsx src/checkers/primitive-value-validator.demo.ts

import { PrimitiveValueValidator } from "./primitive-value-validator";

function linea(declaracion: string, fn: () => { ok: boolean; message: string }) {
  const res = fn();
  console.log(declaracion);
  console.log(res.message + "\n");
}

(async () => {
  // ===================== Declaración =====================

  linea("declaración: boolean b1 = true;", () =>
    new PrimitiveValueValidator("boolean", "b1", true).validate()
  );
  linea('declaración: boolean b2 = "true";', () =>
    new PrimitiveValueValidator("boolean", "b2", "true" as any).validate()
  );

  linea('declaración: String s1 = "hola";', () =>
    new PrimitiveValueValidator("String", "s1", "hola").validate()
  );
  linea("declaración: String s2 = null;", () =>
    new PrimitiveValueValidator("String", "s2", null as any).validate()
  );
  linea("declaración: String s3 = undefined;", () =>
    new PrimitiveValueValidator("String", "s3", undefined as any).validate()
  );

  linea("declaración: char c1 = 'A';", () =>
    new PrimitiveValueValidator("char", "c1", "A").validate()
  );
  linea("declaración: char c2 = 66;", () =>
    new PrimitiveValueValidator("char", "c2", 66).validate()
  );
  linea("declaración: char c3 = 'AB';", () =>
    new PrimitiveValueValidator("char", "c3", "AB").validate()
  );
  linea("declaración: char c4 = 70000;", () =>
    new PrimitiveValueValidator("char", "c4", 70000).validate()
  );

  linea("declaración: byte by1 = -128;", () =>
    new PrimitiveValueValidator("byte", "by1", -128).validate()
  );
  linea("declaración: byte by2 = 127;", () =>
    new PrimitiveValueValidator("byte", "by2", 127).validate()
  );
  linea("declaración: byte by3 = -129;", () =>
    new PrimitiveValueValidator("byte", "by3", -129).validate()
  );
  linea("declaración: byte by4 = 128;", () =>
    new PrimitiveValueValidator("byte", "by4", 128).validate()
  );
  linea("declaración: byte by5 = 3.14;", () =>
    new PrimitiveValueValidator("byte", "by5", 3.14).validate()
  );

  linea("declaración: short sh1 = -32768;", () =>
    new PrimitiveValueValidator("short", "sh1", -32768).validate()
  );
  linea("declaración: short sh2 = 32767;", () =>
    new PrimitiveValueValidator("short", "sh2", 32767).validate()
  );
  linea("declaración: short sh3 = 1.5;", () =>
    new PrimitiveValueValidator("short", "sh3", 1.5).validate()
  );

  linea("declaración: int i1 = -2147483648;", () =>
    new PrimitiveValueValidator("int", "i1", -2147483648).validate()
  );
  linea("declaración: int i2 = 2147483647;", () =>
    new PrimitiveValueValidator("int", "i2", 2147483647).validate()
  );
  linea("declaración: int i3 = 2.2;", () =>
    new PrimitiveValueValidator("int", "i3", 2.2).validate()
  );

  linea("declaración: long l1 = 0n;", () =>
    new PrimitiveValueValidator("long", "l1", 0n).validate()
  );
  linea("declaración: long l2 = 42n;", () =>
    new PrimitiveValueValidator("long", "l2", 42n).validate()
  );
  linea("declaración: long l3 = 1; // número normal (incorrecto)", () =>
    new PrimitiveValueValidator("long", "l3", 1 as any).validate()
  );
  linea("declaración: long l4 = 2^63;", () => {
    const over = (1n << 63n);
    return new PrimitiveValueValidator("long", "l4", over).validate();
  });
  linea("declaración: long l5 = -2^63-1;", () => {
    const under = -(1n << 63n) - 1n;
    return new PrimitiveValueValidator("long", "l5", under).validate();
  });

  linea("declaración: float f1 = 1.5;", () =>
    new PrimitiveValueValidator("float", "f1", 1.5).validate()
  );
  linea("declaración: double d1 = 3.14159;", () =>
    new PrimitiveValueValidator("double", "d1", 3.14159).validate()
  );
  linea("declaración: float fNaN = NaN;", () =>
    new PrimitiveValueValidator("float", "fNaN", Number.NaN).validate()
  );
  linea("declaración: double dInf = +Infinity;", () =>
    new PrimitiveValueValidator("double", "dInf", Number.POSITIVE_INFINITY).validate()
  );

  linea("declaración: int int = 1; // identificador inválido", () =>
    new PrimitiveValueValidator("int", "int", 1).validate()
  );

  // ===================== Valor interno (inner) =====================

  linea("inner: int ← 7", () =>
    new PrimitiveValueValidator("int", 7).validate()
  );
  linea('inner: String ← "hola"', () =>
    new PrimitiveValueValidator("String", "hola").validate()
  );
  linea("inner: String ← null", () =>
    new PrimitiveValueValidator("String", null as any).validate()
  );
  linea("inner: double ← NaN", () =>
    new PrimitiveValueValidator("double", Number.NaN).validate()
  );
  linea('inner: char ← "AB"', () =>
    new PrimitiveValueValidator("char", "AB").validate()
  );
  linea("inner: long ← 5n", () =>
    new PrimitiveValueValidator("long", 5n).validate()
  );

  console.log("--- Fin de la demo de primitivos ---");
})();
