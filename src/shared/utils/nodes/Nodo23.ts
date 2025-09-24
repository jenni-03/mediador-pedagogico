// nodes/Nodo23.ts

export type Nodo23CtorOpts = {
  keepId?: number;
  bumpCounter?: boolean; // default: true
};

export class Nodo23<T> {
  private static _next = 1;

  private static takeId(): number {
    return this._next++;
  }
  public static reset(start = 1) {
    this._next = start;
  }

  private id: number;
  private parent: Nodo23<T> | null = null;
  private keys: T[] = [];
  private hijos: Nodo23<T>[] = [];

  constructor(keys: T[] = [], opts?: Nodo23CtorOpts) {
    if (opts?.keepId != null) {
      this.id = opts.keepId;
      const bump = opts.bumpCounter ?? true;
      if (bump) Nodo23._next = Math.max(Nodo23._next, this.id + 1);
    } else {
      this.id = Nodo23.takeId();
    }
    this.keys = [...keys];
  }

  /* ── Identidad ── */
  public getId(): number {
    return this.id;
  }
  public setId(newId: number): void {
    this.id = newId;
  }

  /* ── Parent / Hijos ── */
  public getParent(): Nodo23<T> | null {
    return this.parent;
  }
  public setParent(p: Nodo23<T> | null): void {
    this.parent = p;
  }

  public getHijos(): ReadonlyArray<Nodo23<T>> {
    return this.hijos;
  }
  public getNumeroHijos(): number {
    return this.hijos.length;
  }
  public isHoja(): boolean {
    return this.hijos.length === 0;
  }
  public getHijo(i: number): Nodo23<T> | null {
    return i >= 0 && i < this.hijos.length ? this.hijos[i] : null;
  }

  /** Establece la lista completa de hijos y enlaza parent correctamente. */
  public setHijos(h: Nodo23<T>[]): void {
    // desvincular anteriores
    for (const c of this.hijos) this.desvincular(c);
    this.hijos = [];
    // vincular nuevos
    for (const c of h) this.agregarHijo(c);
  }

  public agregarHijo(hijo: Nodo23<T>): number {
    this.vincular(hijo);
    this.hijos.push(hijo);
    return this.hijos.length - 1;
  }
  public insertarHijoEn(i: number, hijo: Nodo23<T>): void {
    if (i < 0 || i > this.hijos.length)
      throw new Error(`Índice de hijo fuera de rango: ${i}.`);
    this.vincular(hijo);
    this.hijos.splice(i, 0, hijo);
  }
  public reemplazarHijoEn(i: number, nuevo: Nodo23<T>): Nodo23<T> | null {
    if (i < 0 || i >= this.hijos.length)
      throw new Error(`Índice de hijo fuera de rango: ${i}.`);
    const anterior = this.hijos[i] ?? null;
    if (anterior) this.desvincular(anterior);
    this.vincular(nuevo);
    this.hijos[i] = nuevo;
    return anterior;
  }
  public eliminarHijoEn(i: number): Nodo23<T> | null {
    if (i < 0 || i >= this.hijos.length) return null;
    const [rem] = this.hijos.splice(i, 1);
    if (rem) this.desvincular(rem);
    return rem ?? null;
  }
  public eliminarHijoPorId(id: number | string): boolean {
    const idx = this.indexOfHijoId(id);
    if (idx === -1) return false;
    const [rem] = this.hijos.splice(idx, 1);
    if (rem) this.desvincular(rem);
    return true;
  }
  public indexOfHijoId(id: number | string): number {
    const key = String(id);
    return this.hijos.findIndex((h) => String(h.getId()) === key);
  }

  /* ── Claves ── */
  public getKeys(): T[] {
    return [...this.keys];
  }
  public setKeys(k: T[]): void {
    this.keys = [...k];
  }
  public getNumeroKeys(): number {
    return this.keys.length;
  }
  public insertarKeyEn(i: number, k: T): void {
    if (i < 0 || i > this.keys.length)
      throw new Error(`Índice de clave fuera de rango: ${i}.`);
    this.keys.splice(i, 0, k);
  }
  public reemplazarKeyEn(i: number, k: T): T | null {
    if (i < 0 || i >= this.keys.length)
      throw new Error(`Índice de clave fuera de rango: ${i}.`);
    const old = this.keys[i];
    this.keys[i] = k;
    return old ?? null;
  }
  public eliminarKeyEn(i: number): T | null {
    if (i < 0 || i >= this.keys.length) return null;
    const [rem] = this.keys.splice(i, 1);
    return rem ?? null;
  }
  public insertarKeyOrdenada(k: T, cmp: (a: T, b: T) => number): number {
    const pos = this.lowerBound(this.keys, k, cmp);
    this.keys.splice(pos, 0, k);
    return pos;
  }
  public lowerBound(arr: T[], x: T, cmp: (a: T, b: T) => number): number {
    let lo = 0,
      hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cmp(arr[mid], x) < 0) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  /* ── Recorridos ── */
  public findDFS(pred: (n: Nodo23<T>) => boolean): Nodo23<T> | null {
    if (pred(this)) return this;
    for (const h of this.hijos) {
      const r = h.findDFS(pred);
      if (r) return r;
    }
    return null;
  }
  public findBFS(pred: (n: Nodo23<T>) => boolean): Nodo23<T> | null {
    const q: Nodo23<T>[] = [this];
    while (q.length) {
      const cur = q.shift()!;
      if (pred(cur)) return cur;
      for (const h of cur.hijos) q.push(h);
    }
    return null;
  }
  public forEachPreorden(fn: (n: Nodo23<T>) => void): void {
    fn(this);
    for (const h of this.hijos) h.forEachPreorden(fn);
  }
  public forEachPostorden(fn: (n: Nodo23<T>) => void): void {
    for (const h of this.hijos) h.forEachPostorden(fn);
    fn(this);
  }

  /* ── Clonado ── */
  public clonar(renovarIds = false): Nodo23<T> {
    const copia = renovarIds
      ? new Nodo23<T>(this.keys)
      : new Nodo23<T>(this.keys, { keepId: this.id, bumpCounter: false });
    for (const h of this.hijos) copia.agregarHijo(h.clonar(renovarIds));
    return copia;
  }

  public static es23<N>(n: unknown): n is Nodo23<N> {
    return n instanceof Nodo23;
  }

  /* ── Privados ── */
  private vincular(hijo: Nodo23<T>): void {
    if (hijo.parent && hijo.parent !== this) {
      const idx = hijo.parent.indexOfHijoId(hijo.getId());
      if (idx !== -1) hijo.parent.eliminarHijoEn(idx);
    }
    hijo.parent = this;
  }
  private desvincular(hijo: Nodo23<T>): void {
    if (hijo.parent === this) hijo.parent = null;
  }
}
