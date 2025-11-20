// src/shared//utils/RAM/memoria/errors.ts

export class OutOfMemoryError extends Error {
  constructor(msg = "OutOfMemory") { super(msg); this.name = "OutOfMemoryError"; }
}
export class MemoryBoundsError extends Error {
  constructor(public addr: number, public len: number, msg?: string) {
    super(msg ?? `Memory OOB: addr=0x${addr.toString(16)} len=${len}`);
    this.name = "MemoryBoundsError";
  }
}
export class TypeMismatchError extends Error {
  constructor(msg = "Type mismatch") { super(msg); this.name = "TypeMismatchError"; }
}
