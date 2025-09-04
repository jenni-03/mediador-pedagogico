// nodes/NodoaB.ts
// Nodo para Árbol B (NO B+): guarda (clave, valor) en internos y hojas.
// Inspirado en la interfaz/estilo de Nodo23, con API paralela y mejoras para B-tree.

export type BNodoCtorOpts = {
  keepId?: number;
  bumpCounter?: boolean; // default: true
};

export type Par<K, V> = { key: K; value: V };
export type Cmp<K> = (a: K, b: K) => number;

export class BNodo<K, V = unknown> {
  /* ── Id autoincremental ── */
  private static _next = 1;
  private static takeId(): number {
    return this._next++;
  }
  public static reset(start = 1) {
    this._next = start;
  }

  /* ── Estado ── */
  private id: number;
  private parent: BNodo<K, V> | null = null;
  private keys: K[] = [];
  private values: V[] = [];
  private hijos: BNodo<K, V>[] = [];

  /**
   * Crea un nodo con entradas iniciales (par clave/valor).
   * Mantiene API cercana a Nodo23, pero aquí usamos `entries` para no desalinear keys/values.
   */
  constructor(entries: Par<K, V>[] = [], opts?: BNodoCtorOpts) {
    if (opts?.keepId != null) {
      this.id = opts.keepId;
      const bump = opts.bumpCounter ?? true;
      if (bump) BNodo._next = Math.max(BNodo._next, this.id + 1);
    } else {
      this.id = BNodo.takeId();
    }
    if (entries.length) {
      this.keys = entries.map((e) => e.key);
      this.values = entries.map((e) => e.value);
    }
  }

  /* ── Identidad ── */
  public getId(): number {
    return this.id;
  }
  public setId(newId: number): void {
    this.id = newId;
  }

  /* ── Parent / Hijos ── */
  public getParent(): BNodo<K, V> | null {
    return this.parent;
  }
  public setParent(p: BNodo<K, V> | null): void {
    this.parent = p;
  }

  public getHijos(): ReadonlyArray<BNodo<K, V>> {
    return this.hijos;
  }
  public getNumeroHijos(): number {
    return this.hijos.length;
  }
  public isHoja(): boolean {
    return this.hijos.length === 0;
  }
  public getHijo(i: number): BNodo<K, V> | null {
    return i >= 0 && i < this.hijos.length ? this.hijos[i] : null;
  }

  /** Establece la lista completa de hijos y enlaza parent correctamente. */
  public setHijos(h: BNodo<K, V>[]): void {
    // desvincular anteriores
    for (const c of this.hijos) this.desvincular(c);
    this.hijos = [];
    // vincular nuevos
    for (const c of h) this.agregarHijo(c);
  }

  public agregarHijo(hijo: BNodo<K, V>): number {
    this.vincular(hijo);
    this.hijos.push(hijo);
    return this.hijos.length - 1;
  }
  public insertarHijoEn(i: number, hijo: BNodo<K, V>): void {
    if (i < 0 || i > this.hijos.length)
      throw new Error(`Índice de hijo fuera de rango: ${i}.`);
    this.vincular(hijo);
    this.hijos.splice(i, 0, hijo);
  }
  public reemplazarHijoEn(i: number, nuevo: BNodo<K, V>): BNodo<K, V> | null {
    if (i < 0 || i >= this.hijos.length)
      throw new Error(`Índice de hijo fuera de rango: ${i}.`);
    const anterior = this.hijos[i] ?? null;
    if (anterior) this.desvincular(anterior);
    this.vincular(nuevo);
    this.hijos[i] = nuevo;
    return anterior;
  }
  public eliminarHijoEn(i: number): BNodo<K, V> | null {
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

  /* ── Claves / Valores ── */
  public getKeys(): K[] {
    return [...this.keys];
  }
  public getValues(): V[] {
    return [...this.values];
  }
  public getNumeroKeys(): number {
    return this.keys.length;
  }
  public getEntries(): Par<K, V>[] {
    return this.keys.map((k, i) => ({ key: k, value: this.values[i] }));
  }

  /** Reemplaza por completo las entradas del nodo. */
  public setEntries(entries: Par<K, V>[]): void {
    this.keys = entries.map((e) => e.key);
    this.values = entries.map((e) => e.value);
  }

  /** Inserta (k,v) en posición i. */
  public insertarEntradaEn(i: number, k: K, v: V): void {
    if (i < 0 || i > this.keys.length)
      throw new Error(`Índice de clave fuera de rango: ${i}.`);
    this.keys.splice(i, 0, k);
    this.values.splice(i, 0, v);
  }

  /** Reemplaza (k,v) en i y devuelve el par anterior. */
  public reemplazarEntradaEn(i: number, k: K, v: V): Par<K, V> {
    if (i < 0 || i >= this.keys.length)
      throw new Error(`Índice de clave fuera de rango: ${i}.`);
    const old: Par<K, V> = { key: this.keys[i], value: this.values[i] };
    this.keys[i] = k;
    this.values[i] = v;
    return old;
  }

  /** Elimina la entrada en i y la devuelve (o null). */
  public eliminarEntradaEn(i: number): Par<K, V> | null {
    if (i < 0 || i >= this.keys.length) return null;
    const k = this.keys.splice(i, 1)[0];
    const v = this.values.splice(i, 1)[0];
    return { key: k, value: v };
  }

  /** Inserta (k,v) ordenado por cmp y devuelve la posición. */
  public insertarEntradaOrdenada(k: K, v: V, cmp: Cmp<K>): number {
    const pos = this.lowerBound(this.keys, k, cmp);
    this.keys.splice(pos, 0, k);
    this.values.splice(pos, 0, v);
    return pos;
  }

  /* ── Búsquedas en el nodo ── */
  public lowerBound(arr: K[], x: K, cmp: Cmp<K>): number {
    let lo = 0,
      hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cmp(arr[mid], x) < 0) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  /** Índice exacto de clave, o -1 si no está. */
  public indexOfKey(k: K, cmp: Cmp<K>): number {
    const i = this.lowerBound(this.keys, k, cmp);
    return i < this.keys.length && cmp(this.keys[i], k) === 0 ? i : -1;
  }

  /** Para descender por k en un nodo interno: #claves < k. */
  public childIndexFor(k: K, cmp: Cmp<K>): number {
    return this.lowerBound(this.keys, k, cmp);
  }

  /* ── Invariantes (útiles para tests) ── */
  /** En internos debe cumplirse hijos.length === keys.length + 1 */
  public invariantesOk(): boolean {
    return this.isHoja() || this.hijos.length === this.keys.length + 1;
  }

  /* ── Recorridos ── */
  public findDFS(pred: (n: BNodo<K, V>) => boolean): BNodo<K, V> | null {
    if (pred(this)) return this;
    for (const h of this.hijos) {
      const r = h.findDFS(pred);
      if (r) return r;
    }
    return null;
  }
  public findBFS(pred: (n: BNodo<K, V>) => boolean): BNodo<K, V> | null {
    const q: BNodo<K, V>[] = [this];
    while (q.length) {
      const cur = q.shift()!;
      if (pred(cur)) return cur;
      for (const h of cur.hijos) q.push(h);
    }
    return null;
  }
  public forEachPreorden(fn: (n: BNodo<K, V>) => void): void {
    fn(this);
    for (const h of this.hijos) h.forEachPreorden(fn);
  }
  public forEachPostorden(fn: (n: BNodo<K, V>) => void): void {
    for (const h of this.hijos) h.forEachPostorden(fn);
    fn(this);
  }

  /* ── Clonado ── */
  public clonar(renovarIds = false): BNodo<K, V> {
    const copia = renovarIds
      ? new BNodo<K, V>(this.getEntries())
      : new BNodo<K, V>(this.getEntries(), {
          keepId: this.id,
          bumpCounter: false,
        });
    for (const h of this.hijos) copia.agregarHijo(h.clonar(renovarIds));
    return copia;
  }

  public static esBNodo<A, B = unknown>(n: unknown): n is BNodo<A, B> {
    return n instanceof BNodo;
  }

  /* ── Helpers split/merge usados por el árbol ── */

  /**
   * Separa el nodo en left [0..mid-1] y right [mid+1..], retornando también la entrada separadora (mid).
   * El árbol decide mid según su política (p. ej., t o mitad).
   */
  public separarEn(mid: number): {
    separador: Par<K, V>;
    left: BNodo<K, V>;
    right: BNodo<K, V>;
  } {
    if (mid < 0 || mid >= this.keys.length) {
      throw new Error(`mid inválido en separarEn: ${mid}`);
    }

    const separador: Par<K, V> = {
      key: this.keys[mid],
      value: this.values[mid],
    };

    const left = new BNodo<K, V>();
    const right = new BNodo<K, V>();

    // Copiar claves/valores
    left.keys = this.keys.slice(0, mid);
    left.values = this.values.slice(0, mid);
    right.keys = this.keys.slice(mid + 1);
    right.values = this.values.slice(mid + 1);

    // Copiar hijos
    if (this.isHoja()) {
      left.hijos = [];
      right.hijos = [];
    } else {
      left.hijos = this.hijos.slice(0, mid + 1);
      right.hijos = this.hijos.slice(mid + 1);
      for (const h of left.hijos) h.setParent(left);
      for (const h of right.hijos) h.setParent(right);
    }

    return { separador, left, right };
  }

  /**
   * Funde this + [sep] + hermanoDerecho en este nodo (this).
   * Útil en merge tras borrado. Devuelve el propio nodo.
   */
  public fusionarCon(sep: Par<K, V>, hermanoDerecho: BNodo<K, V>): BNodo<K, V> {
    this.keys.push(sep.key, ...hermanoDerecho.keys);
    this.values.push(sep.value, ...hermanoDerecho.values);
    if (!this.isHoja() || !hermanoDerecho.isHoja()) {
      this.hijos.push(...hermanoDerecho.hijos);
      for (const h of hermanoDerecho.hijos) h.setParent(this);
    }
    return this;
  }

  /* ── Privados ── */
  private vincular(hijo: BNodo<K, V>): void {
    if (hijo.parent && hijo.parent !== this) {
      const idx = hijo.parent.indexOfHijoId(hijo.getId());
      if (idx !== -1) hijo.parent.eliminarHijoEn(idx);
    }
    hijo.parent = this;
  }
  private desvincular(hijo: BNodo<K, V>): void {
    if (hijo.parent === this) hijo.parent = null;
  }
}
