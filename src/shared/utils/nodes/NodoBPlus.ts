// nodes/NodoBPlus.ts
// Nodo para Árbol B+ (internos = índice; hojas = datos + enlaces laterales).

export type Cmp<K> = (a: K, b: K) => number;
export type Par<K, V> = { key: K; value: V };

export type BPlusCtorLeaf<K, V> = {
  isLeaf: true;
  entries?: Par<K, V>[];
  keepId?: number;
  bumpCounter?: boolean; // default: true
  linkPrev?: BPlusNode<K, V> | null;
  linkNext?: BPlusNode<K, V> | null;
};

export type BPlusCtorInternal<K, V> = {
  isLeaf: false;
  keys?: K[];
  children?: BPlusNode<K, V>[];
  keepId?: number;
  bumpCounter?: boolean; // default: true
};

export type BPlusCtor<K, V> = BPlusCtorLeaf<K, V> | BPlusCtorInternal<K, V>;

export class BPlusNode<K, V = unknown> {
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
  private parent: BPlusNode<K, V> | null = null;

  // comunes
  private keys: K[] = [];
  private isLeaf: boolean;

  // solo hojas
  private values: V[] = []; // paralelo a keys cuando isLeaf
  private nextLeaf: BPlusNode<K, V> | null = null;
  private prevLeaf: BPlusNode<K, V> | null = null;

  // solo internos
  private children: BPlusNode<K, V>[] = []; // length = keys.length + 1

  constructor(opts: BPlusCtor<K, V>) {
    // id...
    if (opts.keepId != null) {
      this.id = opts.keepId;
      const bump = opts.bumpCounter ?? true;
      if (bump) BPlusNode._next = Math.max(BPlusNode._next, this.id + 1);
    } else {
      this.id = BPlusNode.takeId();
    }

    this.isLeaf = opts.isLeaf;

    if (opts.isLeaf) {
      if (opts.entries?.length) {
        this.keys = opts.entries.map((e) => e.key);
        this.values = opts.entries.map((e) => e.value);
      }
      this.prevLeaf = opts.linkPrev ?? null;
      this.nextLeaf = opts.linkNext ?? null;
    } else {
      if (opts.keys?.length) this.keys = [...opts.keys];

      // ⬇️ ADOPTAR hijos SIN setChildren (no detach del padre anterior)
      if (opts.children?.length) {
        this.children = opts.children.slice(); // copia superficial
        for (const c of this.children) c.setParent(this); // solo reasigna parent
      }
    }
  }

  /* ── Identidad / tipo ── */
  public getId(): number {
    return this.id;
  }
  public getParent(): BPlusNode<K, V> | null {
    return this.parent;
  }
  public setParent(p: BPlusNode<K, V> | null): void {
    this.parent = p;
  }
  public getIsLeaf(): boolean {
    return this.isLeaf;
  }

  /* ── Acceso a claves ── */
  public getKeys(): K[] {
    return [...this.keys];
  }
  public getKeyCount(): number {
    return this.keys.length;
  }

  /* ── Buscadores base ── */
  public static lowerBound<T>(
    arr: T[],
    x: T,
    cmp: (a: T, b: T) => number
  ): number {
    let lo = 0,
      hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cmp(arr[mid], x) < 0) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }
  public lowerBound(x: K, cmp: Cmp<K>): number {
    return BPlusNode.lowerBound(this.keys, x, cmp);
  }
  public indexOfKey(x: K, cmp: Cmp<K>): number {
    const i = this.lowerBound(x, cmp);
    return i < this.keys.length && cmp(this.keys[i], x) === 0 ? i : -1;
  }

  /* ── Internos: hijos ── */
  public getChildren(): ReadonlyArray<BPlusNode<K, V>> {
    return this.children;
  }
  public childIndexFor(k: K, cmp: Cmp<K>): number {
    // #keys < k  → índice de hijo por lowerBound
    return this.lowerBound(k, cmp);
  }
  public setChildren(cs: BPlusNode<K, V>[]): void {
    for (const c of this.children) this.detach(c);
    this.children = [];
    for (const c of cs) this.addChild(c);
  }
  public addChild(c: BPlusNode<K, V>): number {
    this.attach(c);
    this.children.push(c);
    return this.children.length - 1;
  }
  public insertChildAt(i: number, c: BPlusNode<K, V>): void {
    if (i < 0 || i > this.children.length)
      throw new Error(`Índice hijo inválido: ${i}`);
    this.attach(c);
    this.children.splice(i, 0, c);
  }
  public replaceChildAt(i: number, c: BPlusNode<K, V>): BPlusNode<K, V> | null {
    if (i < 0 || i >= this.children.length)
      throw new Error(`Índice hijo inválido: ${i}`);
    const old = this.children[i] ?? null;
    if (old) this.detach(old);
    this.attach(c);
    this.children[i] = c;
    return old;
  }
  public removeChildAt(i: number): BPlusNode<K, V> | null {
    if (i < 0 || i >= this.children.length) return null;
    const [rem] = this.children.splice(i, 1);
    if (rem) this.detach(rem);
    return rem ?? null;
  }

  /* ── Hojas: valores + enlaces ── */
  public getValues(): V[] {
    if (!this.isLeaf) throw new Error("getValues(): no es hoja");
    return [...this.values];
  }
  public getNextLeaf(): BPlusNode<K, V> | null {
    if (!this.isLeaf) throw new Error("getNextLeaf(): no es hoja");
    return this.nextLeaf;
  }
  public getPrevLeaf(): BPlusNode<K, V> | null {
    if (!this.isLeaf) throw new Error("getPrevLeaf(): no es hoja");
    return this.prevLeaf;
  }
  public setNextLeaf(n: BPlusNode<K, V> | null): void {
    if (!this.isLeaf) throw new Error("setNextLeaf(): no es hoja");
    this.nextLeaf = n;
  }
  public setPrevLeaf(p: BPlusNode<K, V> | null): void {
    if (!this.isLeaf) throw new Error("setPrevLeaf(): no es hoja");
    this.prevLeaf = p;
  }

  /** Inserta (k,v) ordenado en hoja y devuelve posición. */
  public insertLeafOrdered(k: K, v: V, cmp: Cmp<K>): number {
    if (!this.isLeaf) throw new Error("insertLeafOrdered(): no es hoja");
    const pos = this.lowerBound(k, cmp);
    this.keys.splice(pos, 0, k);
    this.values.splice(pos, 0, v);
    return pos;
  }
  public replaceLeafAt(i: number, k: K, v: V): Par<K, V> {
    if (!this.isLeaf) throw new Error("replaceLeafAt(): no es hoja");
    if (i < 0 || i >= this.keys.length)
      throw new Error(`Índice clave inválido: ${i}`);
    const old: Par<K, V> = { key: this.keys[i], value: this.values[i] };
    this.keys[i] = k;
    this.values[i] = v;
    return old;
  }
  public removeLeafAt(i: number): Par<K, V> | null {
    if (!this.isLeaf) throw new Error("removeLeafAt(): no es hoja");
    if (i < 0 || i >= this.keys.length) return null;
    const k = this.keys.splice(i, 1)[0];
    const v = this.values.splice(i, 1)[0];
    return { key: k, value: v };
  }

  /* ── Invariantes ── */
  public invariantsOk(): boolean {
    if (this.isLeaf)
      return (
        this.children.length === 0 && this.keys.length === this.values.length
      );
    return this.children.length === this.keys.length + 1;
  }

  /* ── Split / Merge / Redistribute ── */

  /**
   * Split de HOJA.
   * Política común en B+: la clave separadora para el padre es la **primera del hermano derecho**.
   * Retorna { sepKey, left, right } con enlaces next/prev actualizados.
   */
  public splitLeafAt(mid: number): {
    sepKey: K;
    left: BPlusNode<K, V>;
    right: BPlusNode<K, V>;
  } {
    if (!this.isLeaf) throw new Error("splitLeafAt(): no es hoja");
    if (mid <= 0 || mid >= this.keys.length) {
      throw new Error(`mid inválido en splitLeafAt: ${mid}`);
    }

    const left = new BPlusNode<K, V>({
      isLeaf: true,
      entries: this.keys
        .slice(0, mid)
        .map((k, i) => ({ key: k, value: this.values[i] })),
      linkPrev: this.prevLeaf,
      linkNext: null,
    });
    const right = new BPlusNode<K, V>({
      isLeaf: true,
      entries: this.keys.slice(mid).map((k, i) => ({
        key: k,
        value: this.values[mid + i],
      })),
      linkPrev: null,
      linkNext: this.nextLeaf,
    });

    // Enlaces laterales
    left.nextLeaf = right;
    right.prevLeaf = left;
    if (left.prevLeaf) left.prevLeaf.nextLeaf = left;
    if (right.nextLeaf) right.nextLeaf.prevLeaf = right;

    const sepKey = right.keys[0]; // duplicada hacia arriba

    return { sepKey, left, right };
  }

  /**
   * Split de INTERNO: promueve keys[mid] y reparte hijos.
   * Retorna { promoteKey, left, right }.
   */
  public splitInternalAt(mid: number): {
    promoteKey: K;
    left: BPlusNode<K, V>;
    right: BPlusNode<K, V>;
  } {
    if (this.isLeaf) throw new Error("splitInternalAt(): es hoja");
    if (mid <= 0 || mid >= this.keys.length) {
      throw new Error(`mid inválido en splitInternalAt: ${mid}`);
    }

    const promoteKey = this.keys[mid];

    const left = new BPlusNode<K, V>({
      isLeaf: false,
      keys: this.keys.slice(0, mid),
      children: this.children.slice(0, mid + 1),
    });
    const right = new BPlusNode<K, V>({
      isLeaf: false,
      keys: this.keys.slice(mid + 1),
      children: this.children.slice(mid + 1),
    });

    return { promoteKey, left, right };
  }

  /**
   * Merge de HOJA con hermano derecho. Actualiza enlaces laterales.
   * Devuelve la hoja fusionada (this).
   */
  public mergeLeafWithRight(right: BPlusNode<K, V>): BPlusNode<K, V> {
    if (!this.isLeaf || !right.isLeaf)
      throw new Error("mergeLeafWithRight(): ambas deben ser hojas");
    this.keys.push(...right.keys);
    this.values.push(...right.values);

    // relink
    this.nextLeaf = right.nextLeaf ?? null;
    if (this.nextLeaf) this.nextLeaf.prevLeaf = this;

    return this;
  }

  /**
   * Merge de INTERNO con hermano derecho usando sepKey del padre.
   * Devuelve el interno fusionado (this).
   */
  public mergeInternalWithRight(
    sepKey: K,
    right: BPlusNode<K, V>
  ): BPlusNode<K, V> {
    if (this.isLeaf || right.isLeaf)
      throw new Error("mergeInternalWithRight(): deben ser internos");
    // this + [sepKey] + right
    this.keys.push(sepKey, ...right.keys);
    this.children.push(...right.children);
    for (const c of right.children) c.setParent(this);
    return this;
  }

  /**
   * Redistribución HOJA: mueve una clave entre hojas hermanas.
   * direction = "left"  → toma del hermano izquierdo (donante) hacia this
   * direction = "right" → toma del hermano derecho hacia this
   * Devuelve la clave que debe actualizar en el separador del padre (nueva primera del derecho).
   */
  public redistributeLeafWith(
    sibling: BPlusNode<K, V>,
    direction: "left" | "right"
  ): { newSepKeyForParent: K } {
    if (!this.isLeaf || !sibling.isLeaf)
      throw new Error("redistributeLeafWith(): hojas");

    if (direction === "left") {
      // tomar la última del izquierdo
      if (sibling.keys.length === 0) throw new Error("sibling vacío (left)");
      const k = sibling.keys.pop()!;
      const v = sibling.values.pop()!;
      this.keys.unshift(k);
      this.values.unshift(v);
    } else {
      // tomar la primera del derecho
      if (sibling.keys.length === 0) throw new Error("sibling vacío (right)");
      const k = sibling.keys.shift()!;
      const v = sibling.values.shift()!;
      this.keys.push(k);
      this.values.push(v);
    }

    // nueva primera clave del "derecho" para el separador en el padre:
    const rightLike = direction === "left" ? this : sibling;
    if (rightLike.keys.length === 0) {
      // No debería ocurrir si el árbol mantiene mínimos
      throw new Error("rightLike quedó vacío tras redistribución");
    }
    return { newSepKeyForParent: rightLike.keys[0] };
  }

  /**
   * Redistribución INTERNO: mueve una clave + 1 hijo entre internos,
   * ajustando la clave separadora del padre.
   * direction = "left"  → dono desde izquierdo a this
   * direction = "right" → dono desde derecho a this
   * Devuelve la clave que debe reemplazar al separador del padre.
   */
  public redistributeInternalWith(
    sibling: BPlusNode<K, V>,
    sepKeyFromParent: K,
    direction: "left" | "right"
  ): { newSepKeyForParent: K } {
    if (this.isLeaf || sibling.isLeaf)
      throw new Error("redistributeInternalWith(): internos");

    if (direction === "left") {
      // (left) [ ... Lkeys ]  sep  [ this.keys ... ]
      // Toma última key de L y su hijo derecho; sube al padre la última de L; baja sep a this
      const borrowKey = sibling.keys.pop();
      const borrowChild = sibling.children.pop();
      if (borrowKey === undefined || !borrowChild) throw new Error("izq vacío");
      // this recibe sepKeyFromParent como su primera key
      this.keys.unshift(sepKeyFromParent);
      this.children.unshift(borrowChild);
      borrowChild.setParent(this);
      // nueva sep = borrowKey
      return { newSepKeyForParent: borrowKey };
    } else {
      // (this) [ ... keys ]  sep  [ Rkeys ... ]
      // Toma primera key de R y su hijo izquierdo; sube al padre la primera de R; baja sep a this
      const borrowKey = sibling.keys.shift();
      const borrowChild = sibling.children.shift();
      if (borrowKey === undefined || !borrowChild) throw new Error("der vacío");
      this.keys.push(sepKeyFromParent);
      this.children.push(borrowChild);
      borrowChild.setParent(this);
      // nueva sep = borrowKey
      return { newSepKeyForParent: borrowKey };
    }
  }

  /* ── Clonado superficial (sin rewire de enlaces externos) ── */
  public clone(shallowIds = false): BPlusNode<K, V> {
    if (this.isLeaf) {
      const node = shallowIds
        ? new BPlusNode<K, V>({
            isLeaf: true,
            entries: this.keys.map((k, i) => ({
              key: k,
              value: this.values[i],
            })),
          })
        : new BPlusNode<K, V>({
            isLeaf: true,
            entries: this.keys.map((k, i) => ({
              key: k,
              value: this.values[i],
            })),
            keepId: this.id,
            bumpCounter: false,
          });
      node.prevLeaf = this.prevLeaf;
      node.nextLeaf = this.nextLeaf;
      return node;
    } else {
      const node = shallowIds
        ? new BPlusNode<K, V>({
            isLeaf: false,
            keys: [...this.keys],
            children: [],
          })
        : new BPlusNode<K, V>({
            isLeaf: false,
            keys: [...this.keys],
            children: [],
            keepId: this.id,
            bumpCounter: false,
          });
      // hijos no se clonan aquí (se deja al árbol decidir).
      return node;
    }
  }

  /* ── Utilidades privadas ── */
  private attach(c: BPlusNode<K, V>): void {
    if (c.parent && c.parent !== this) {
      // desvincula del antiguo
      const idx = c.parent.children.indexOf(c);
      if (idx !== -1) c.parent.children.splice(idx, 1);
    }
    c.parent = this;
  }
  private detach(c: BPlusNode<K, V>): void {
    if (c.parent === this) c.parent = null;
  }
}
