export type NodoNarioCtorOpts = {
  /** Si lo pasas, el nodo conservará este id. */
  keepId?: number;
  /**
   * Si mantienes el id, define si el autoincremental _next debe avanzar
   * (por defecto TRUE para no romper consecutividad en usos normales).
   * En clonado interno conviene ponerlo en FALSE para no “gastar” ids.
   */
  bumpCounter?: boolean; // default: true
};

export class NodoNario<T> {
  /* ─────────── Id autoincremental ─────────── */
  private static _next = 1;

  private static takeId(): number {
    return this._next++;
  }

  /** Reinicia el contador global de ids (1 por defecto). */
  public static reset(start = 1) {
    this._next = start;
  }

  /* ─────────── Datos del nodo ─────────── */
  private id: number;
  private info: T;
  private parent: NodoNario<T> | null = null;
  private hijos: NodoNario<T>[] = [];

  /**
   * Constructor:
   * - normal: new NodoNario(info)
   * - preservando id (clonado): new NodoNario(info, { keepId, bumpCounter })
   */
  constructor(info: T, opts?: NodoNarioCtorOpts) {
    this.info = info;

    if (opts?.keepId != null) {
      this.id = opts.keepId;
      const bump = opts.bumpCounter ?? true;
      if (bump) {
        // Asegura que el siguiente id sea mayor que el que acabamos de fijar
        NodoNario._next = Math.max(NodoNario._next, this.id + 1);
      }
    } else {
      this.id = NodoNario.takeId();
    }
  }

  /* ─────────── Identidad y datos ─────────── */
  public getId(): number {
    return this.id;
  }
  /** Útil sólo si de verdad lo necesitas al clonar/construir a mano */
  public setId(newId: number): void {
    this.id = newId;
  }

  public getInfo(): T {
    return this.info;
  }
  public setInfo(value: T): void {
    this.info = value;
  }

  /* ─────────── Parent / Hijos ─────────── */
  public getParent(): NodoNario<T> | null {
    return this.parent;
  }
  public setParent(p: NodoNario<T> | null): void {
    this.parent = p;
  }

  public getHijos(): ReadonlyArray<NodoNario<T>> {
    return this.hijos;
  }
  public getNumeroHijos(): number {
    return this.hijos.length;
  }
  public isHoja(): boolean {
    return this.hijos.length === 0;
  }
  public getHijo(i: number): NodoNario<T> | null {
    return i >= 0 && i < this.hijos.length ? this.hijos[i] : null;
  }

  public agregarHijo(hijo: NodoNario<T>): number {
    this.vincular(hijo);
    this.hijos.push(hijo);
    return this.hijos.length - 1;
  }

  public insertarHijoEn(i: number, hijo: NodoNario<T>): void {
    if (i < 0 || i > this.hijos.length)
      throw new Error(`Índice fuera de rango: ${i}.`);
    this.vincular(hijo);
    this.hijos.splice(i, 0, hijo);
  }

  public reemplazarHijoEn(i: number, nuevo: NodoNario<T>): NodoNario<T> | null {
    if (i < 0 || i >= this.hijos.length)
      throw new Error(`Índice fuera de rango: ${i}.`);
    const anterior = this.hijos[i] ?? null;
    if (anterior) this.desvincular(anterior);
    this.vincular(nuevo);
    this.hijos[i] = nuevo;
    return anterior;
  }

  public eliminarHijoEn(i: number): NodoNario<T> | null {
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

  /* ─────────── Búsquedas / Recorridos ─────────── */
  public findDFS(pred: (n: NodoNario<T>) => boolean): NodoNario<T> | null {
    if (pred(this)) return this;
    for (const h of this.hijos) {
      const r = h.findDFS(pred);
      if (r) return r;
    }
    return null;
  }

  public findBFS(pred: (n: NodoNario<T>) => boolean): NodoNario<T> | null {
    const q: NodoNario<T>[] = [this];
    while (q.length) {
      const cur = q.shift()!;
      if (pred(cur)) return cur;
      for (const h of cur.hijos) q.push(h);
    }
    return null;
  }

  public forEachPreorden(fn: (n: NodoNario<T>) => void): void {
    fn(this);
    for (const h of this.hijos) h.forEachPreorden(fn);
  }

  public forEachPostorden(fn: (n: NodoNario<T>) => void): void {
    for (const h of this.hijos) h.forEachPostorden(fn);
    fn(this);
  }

  /* ─────────── Integración / Clonado ─────────── */
  public clonar(renovarIds = false): NodoNario<T> {
    const copia = renovarIds
      ? new NodoNario<T>(this.info) // ids nuevos
      : new NodoNario<T>(this.info, { keepId: this.id, bumpCounter: false }); // conserva id sin gastar contador

    for (const h of this.hijos) copia.agregarHijo(h.clonar(renovarIds));
    return copia;
  }

  public static esNario<N>(n: unknown): n is NodoNario<N> {
    return n instanceof NodoNario;
  }

  /* ─────────── Privados ─────────── */
  private vincular(hijo: NodoNario<T>): void {
    if (hijo.parent && hijo.parent !== this) {
      const idx = hijo.parent.indexOfHijoId(hijo.getId());
      if (idx !== -1) hijo.parent.eliminarHijoEn(idx);
    }
    hijo.parent = this;
  }

  private desvincular(hijo: NodoNario<T>): void {
    if (hijo.parent === this) hijo.parent = null;
  }
}
