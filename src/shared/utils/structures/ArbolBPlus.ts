// logic/ArbolBPlus.ts
// Árbol B+ (internos = índices; hojas = datos y enlaces laterales).
// API inspirada en ArbolB.ts, con extras propios de B+ (range/scanFrom).

import { BPlusHierarchy, TraversalNodeType } from "../../../types"; // ajusta path
import { BPlusNode, Par, Cmp as KeyCmp } from "../nodes/NodoBPlus"; // ajusta path
import { Cola } from "./Cola"; // igual que en ArbolB

export class ArbolBPlus<K, V = K> {
  private raiz: BPlusNode<K, V> | null = null;
  private tamanio = 0; // #nodos (NO #claves)
  private readonly MAX_NODOS = 150;

  /**
   * @param cmp       Comparador de claves (total, estable).
   * @param t         Grado mínimo (t >= 2). Orden = 2t. Max keys = 2t - 1.
   * @param mapValue  Mapeo K -> V si no pasas V explícito al insertar.
   */
  constructor(
    private cmp: KeyCmp<K>,
    private t: number,
    private mapValue: (k: K) => V = (k) => k as unknown as V
  ) {
    if (t < 2) throw new Error("El grado mínimo t debe ser >= 2.");
  }

  /** Clona profundamente el árbol (para inmutabilidad en React). */
  public clonar(): ArbolBPlus<K, V> {
    const clone = new ArbolBPlus<K, V>(this.cmp, this.t, this.mapValue);
    if (!this.raiz) return clone;

    const oldToNew = new Map<BPlusNode<K, V>, BPlusNode<K, V>>();

    const cloneRec = (
      n: BPlusNode<K, V>,
      parent: BPlusNode<K, V> | null
    ): BPlusNode<K, V> => {
      let nn: BPlusNode<K, V>;
      if (n.getIsLeaf()) {
        const keys = n.getKeys();
        const vals = n.getValues();
        const entries = keys.map((k, i) => ({ key: k, value: vals[i] }));
        nn = new BPlusNode<K, V>({ isLeaf: true, entries });
      } else {
        const keys = n.getKeys().slice();
        nn = new BPlusNode<K, V>({ isLeaf: false, keys, children: [] });
        const childClones = (n.getChildren() as BPlusNode<K, V>[]).map((c) =>
          cloneRec(c, nn)
        );
        nn.setChildren(childClones);
        for (const c of childClones) c.setParent(nn);
      }
      nn.setParent(parent);
      oldToNew.set(n, nn);
      return nn;
    };

    const newRoot = cloneRec(this.raiz, null);

    // reconstruir belt de hojas
    const leftmostLeaf = (() => {
      let x = this.raiz as BPlusNode<K, V>;
      while (!x.getIsLeaf()) x = x.getChildren()[0] as BPlusNode<K, V>;
      return x;
    })();

    let o: BPlusNode<K, V> | null = leftmostLeaf;
    while (o) {
      const onext = o.getNextLeaf();
      if (onext) {
        const nCur = oldToNew.get(o)!;
        const nNext = oldToNew.get(onext)!;
        nCur.setNextLeaf(nNext);
        nNext.setPrevLeaf(nCur);
      }
      o = onext as BPlusNode<K, V> | null;
    }

    clone["raiz"] = newRoot;
    clone["tamanio"] = this.tamanio;
    return clone;
  }

  /* ───────────────────────────── API PÚBLICA ───────────────────────────── */

  /** Crea raíz HOJA con (k,v). */
  public crearRaiz(k: K, v?: V): BPlusNode<K, V> {
    if (this.raiz) throw new Error("La raíz ya existe.");
    this.checkCap(1);
    const val = v ?? this.mapValue(k);
    this.raiz = new BPlusNode<K, V>({
      isLeaf: true,
      entries: [{ key: k, value: val }],
    });
    this.tamanio = 1;
    return this.raiz;
  }

  /** Inserta (k,v). Si omites v, se usa mapValue(k). */
  public insertar(k: K, v?: V): void {
    const val = v ?? this.mapValue(k);

    if (!this.raiz) {
      this.crearRaiz(k, val);
      return;
    }
    if (this.contiene(k)) throw new Error(`La clave ya existe: ${String(k)}`);

    // Si la raíz está llena, dividir antes de descender
    if (this.keyCount(this.raiz) === this.maxKeys()) {
      this.checkCap(2); // nueva raíz (interna) + un nuevo nodo (right)
      const antigua = this.raiz;
      let nuevaRaiz: BPlusNode<K, V>;
      if (antigua.getIsLeaf()) {
        const { left, right, sepKey } = antigua.splitLeafAt(this.t);
        nuevaRaiz = new BPlusNode<K, V>({
          isLeaf: false,
          keys: [sepKey],
          children: [left, right],
        });
        left.setParent(nuevaRaiz);
        right.setParent(nuevaRaiz);
        this.raiz = nuevaRaiz;
        this.tamanio += 1; // nueva raíz
        this.tamanio += 1; // right
      } else {
        const { left, right, promoteKey } = antigua.splitInternalAt(this.t - 1);
        nuevaRaiz = new BPlusNode<K, V>({
          isLeaf: false,
          keys: [promoteKey],
          children: [left, right],
        });
        left.setParent(nuevaRaiz);
        right.setParent(nuevaRaiz);
        this.raiz = nuevaRaiz;
        this.tamanio += 1; // nueva raíz
        this.tamanio += 1; // right
      }
    }

    // Insertar en árbol "no-full"
    this.insertNonFull(this.raiz!, { key: k, value: val });
  }

  /** Elimina k si existe; lanza error si no está. */
  public eliminar(k: K): void {
    if (!this.raiz) throw new Error("Árbol vacío.");
    if (!this.contiene(k)) throw new Error(`La clave no está: ${String(k)}`);

    this.deleteRec(this.raiz, k);

    // Contrae la raíz si es interno vacío
    if (this.raiz && !this.raiz.getIsLeaf() && this.keyCount(this.raiz) === 0) {
      const children = this.raiz.getChildren();
      if (children.length === 1) {
        this.raiz = children[0] as BPlusNode<K, V>;
        this.raiz.setParent(null);
        this.tamanio -= 1;
      } else {
        throw new Error(
          "Inconsistencia: raíz interna sin claves con múltiples hijos."
        );
      }
    }

    // Si todo quedó vacío
    if (this.raiz && this.raiz.getIsLeaf() && this.keyCount(this.raiz) === 0) {
      this.raiz = null;
      this.tamanio = 0;
    }
  }

  /** Retorna true si la clave existe. */
  public contiene(k: K): boolean {
    const found = this.getLeafAndIndex(k);
    return !!found && found.index >= 0;
  }

  /** Busca y retorna el valor asociado, o null si no existe. */
  public get(k: K): V | null {
    const found = this.getLeafAndIndex(k);
    if (!found || found.index < 0) return null;
    return found.leaf.getValues()[found.index] ?? null;
  }

  /** Deja el árbol vacío. Opcionalmente resetea ids de nodos. */
  public vaciar(resetIds = false): void {
    this.raiz = null;
    this.tamanio = 0;
    if (resetIds) BPlusNode.reset(1);
  }

  /* ─────────────────────────── Consultas varias ─────────────────────────── */

  public esVacio(): boolean {
    return this.raiz === null;
  }
  public getTamanio(): number {
    return this.tamanio; // #nodos
  }
  public getRaiz(): BPlusNode<K, V> | null {
    return this.raiz;
  }
  public getAltura(): number {
    return this.alturaNodo(this.raiz);
  }
  public contarHojas(): number {
    return this.contarHojasAux(this.raiz);
  }
  public getPeso(): number {
    return this.tamanio;
  }

  public getById(id: number): BPlusNode<K, V> | null {
    if (!this.raiz) return null;
    const q = new Cola<BPlusNode<K, V>>();
    q.encolar(this.raiz);
    while (!q.esVacia()) {
      const x = q.decolar().getValor();
      if (x.getId() === id) return x;
      for (const h of x.getChildren()) q.encolar(h as BPlusNode<K, V>);
    }
    return null;
  }

  /** Mapa para renderer jerárquico (incluye isLeaf y enlaces laterales en hojas). */
  public convertirEstructuraJerarquica(
    mapKeyToNumber?: (k: K) => number
  ): BPlusHierarchy | null {
    if (!this.raiz) return null;
    const toNum = mapKeyToNumber ?? ((k: unknown) => Number(k));
    return this.toBPlusHierarchy(this.raiz, toNum);
  }

  /** Recorrido IN-ORDER (todas las claves en hojas encadenadas). */
  public getInOrder(): TraversalNodeType[] {
    const out: TraversalNodeType[] = [];
    for (const k of this.scanIteratorFrom(-Infinity as unknown as K, (a, b) =>
      this.cmp(a, b)
    )) {
      out.push({ id: `seq-${String(k)}-${out.length}`, value: Number(k) });
    }
    return out;
  }

  /** Recorrido por niveles (estructura). */
  public getLevelOrder(): TraversalNodeType[] {
    const res: TraversalNodeType[] = [];
    if (!this.raiz) return res;
    const q = new Cola<{ n: BPlusNode<K, V>; depth: number }>();
    q.encolar({ n: this.raiz, depth: 0 });
    while (!q.esVacia()) {
      const { n } = q.decolar().getValor();
      res.push({
        id: `n-${n.getId()}`,
        value: n.getKeyCount() as unknown as number,
      });
      for (const h of n.getChildren())
        q.encolar({ n: h as BPlusNode<K, V>, depth: 0 });
    }
    return res;
  }

  /* ─────────────────────────────── RANGOS / SCAN ─────────────────────────────── */

  /** Rango inclusivo: devuelve las claves k con from ≤ k ≤ to, en orden ascendente. */
  public range(from: K, to: K): K[] {
    if (this.cmp(from, to) > 0) [from, to] = [to, from];
    const res: K[] = [];
    for (const k of this.scanIteratorFrom(from, this.cmp)) {
      if (this.cmp(k, to) > 0) break;
      res.push(k);
    }
    return res;
  }

  /** Escaneo secuencial hacia la derecha: hasta 'limit' claves desde la primera ≥ start. */
  public scanFrom(start: K, limit: number): K[] {
    if (limit <= 0) return [];
    const res: K[] = [];
    for (const k of this.scanIteratorFrom(start, this.cmp)) {
      res.push(k);
      if (res.length >= limit) break;
    }
    return res;
  }

  /* ───────────────────────────── Internos: Insert ───────────────────────────── */

  // 1) MÁS ROBUSTA
  private insertNonFull(n: BPlusNode<K, V>, entry: Par<K, V>): void {
    // Caso hoja
    if (n.getIsLeaf()) {
      n.insertLeafOrdered(entry.key, entry.value, this.cmp);
      return;
    }

    // Padre actual (puede cambiar tras split)
    let parentRef = n;

    // Índice por el que descender
    let idx = parentRef.childIndexFor(entry.key, this.cmp);

    // Clamp defensivo (por si el padre estuviera temporalmente desbalanceado)
    let kids = parentRef.getChildren() as BPlusNode<K, V>[];
    if (kids.length === 0) throw new Error("Nodo interno sin hijos.");
    if (idx < 0) idx = 0;
    if (idx >= kids.length) idx = kids.length - 1;

    let child = kids[idx];

    // Si el hijo está lleno, dividir ANTES de bajar
    if (this.keyCount(child) === this.maxKeys()) {
      parentRef = this.splitChild(parentRef, idx); // padre “efectivo” tras el split

      // Decidir izquierda/derecha con el separador recién insertado
      const sep = parentRef.getKeys()[idx];
      if (this.cmp(entry.key, sep) >= 0) idx += 1;

      // Releer hijos y volver a acotar
      kids = parentRef.getChildren() as BPlusNode<K, V>[];
      if (idx < 0) idx = 0;
      if (idx >= kids.length) idx = kids.length - 1;

      child = kids[idx];
    }

    this.insertNonFull(child, entry);
  }

  // 2) SPLIT ATÓMICO (no deja al padre en estado intermedio)
  private splitChild(parent: BPlusNode<K, V>, i: number): BPlusNode<K, V> {
    // Vamos a crear +1 nodo neto (child -> left+right). Verifica capacidad.
    this.checkCap(1);

    const child = parent.getChildren()[i] as BPlusNode<K, V>;
    if (this.keyCount(child) !== this.maxKeys()) {
      throw new Error("splitChild: el hijo no está lleno.");
    }

    if (child.getIsLeaf()) {
      const { left, right, sepKey } = child.splitLeafAt(this.t);

      // Reconstruir al padre en un paso (copia defensiva)
      const keys = parent.getKeys().slice();
      const kids = (parent.getChildren() as BPlusNode<K, V>[]).slice();
      keys.splice(i, 0, sepKey);
      kids.splice(i, 1, left, right);

      const nuevo = new BPlusNode<K, V>({
        isLeaf: false,
        keys,
        children: kids,
      });
      nuevo.setParent(parent.getParent());
      for (const c of kids) (c as BPlusNode<K, V>).setParent(nuevo);

      this.replaceNodeInParent(parent, nuevo);
      this.tamanio += 1; // neto +1 por reemplazar 1 hijo con 2
      return nuevo;
    } else {
      const { left, right, promoteKey } = child.splitInternalAt(this.t - 1);

      const keys = parent.getKeys().slice();
      const kids = (parent.getChildren() as BPlusNode<K, V>[]).slice();
      keys.splice(i, 0, promoteKey);
      kids.splice(i, 1, left, right);

      const nuevo = new BPlusNode<K, V>({
        isLeaf: false,
        keys,
        children: kids,
      });
      nuevo.setParent(parent.getParent());
      for (const c of kids) (c as BPlusNode<K, V>).setParent(nuevo);

      this.replaceNodeInParent(parent, nuevo);
      this.tamanio += 1;
      return nuevo;
    }
  }

  // 3) ADEMÁS: evitar mutaciones in-place de keys aquí también
  private replaceNodeInParent(
    oldNode: BPlusNode<K, V>,
    newNode: BPlusNode<K, V>
  ): void {
    const p = oldNode.getParent();
    if (!p) {
      this.raiz = newNode;
      newNode.setParent(null);
      return;
    }

    const kids = p.getChildren().slice() as BPlusNode<K, V>[];
    const idx = kids.indexOf(oldNode);
    if (idx === -1)
      throw new Error("replaceNodeInParent: oldNode no es hijo del padre.");
    kids[idx] = newNode;

    const keys = p.getKeys().slice(); // ← copiar, no mutar el array original
    const nuevoPadre = new BPlusNode<K, V>({
      isLeaf: false,
      keys,
      children: kids,
    });
    nuevoPadre.setParent(p.getParent());
    for (const c of kids) c.setParent(nuevoPadre);

    if (!p.getParent()) {
      this.raiz = nuevoPadre;
      nuevoPadre.setParent(null);
    } else {
      this.replaceNodeInParent(p, nuevoPadre);
    }
  }

  /* ───────────────────────────── Internos: Delete ───────────────────────────── */

  private deleteRec(n: BPlusNode<K, V>, k: K): void {
    if (n.getIsLeaf()) {
      const idx = n.indexOfKey(k, this.cmp);
      if (idx === -1)
        throw new Error(`Clave no encontrada en hoja: ${String(k)}`);
      const wasFirst = idx === 0;
      n.removeLeafAt(idx);

      if (wasFirst) {
        const firstNow = n.getKeys()[0];
        this.updateSeparatorsUpward(n, k, firstNow);
      }

      if (n !== this.raiz && this.keyCount(n) < this.minKeys()) {
        this.fixLeafUnderflow(n);
      }
      return;
    }

    const idx = n.childIndexFor(k, this.cmp);
    const child = n.getChildren()[idx] as BPlusNode<K, V>;

    if (this.keyCount(child) === this.minKeys()) {
      const left =
        idx > 0 ? (n.getChildren()[idx - 1] as BPlusNode<K, V>) : null;
      const right =
        idx + 1 < n.getChildren().length
          ? (n.getChildren()[idx + 1] as BPlusNode<K, V>)
          : null;

      if (left && this.keyCount(left) > this.minKeys()) {
        this.borrowFromLeft(n, idx, left, child);
      } else if (right && this.keyCount(right) > this.minKeys()) {
        this.borrowFromRight(n, idx, child, right);
      } else {
        if (left) {
          this.mergeChildren(n, idx - 1);
        } else if (right) {
          this.mergeChildren(n, idx);
        }
      }
    }

    const newIdx = n.childIndexFor(k, this.cmp);
    const nuevoChild = n.getChildren()[newIdx] as BPlusNode<K, V>;
    this.deleteRec(nuevoChild, k);
  }

  /** Actualiza separadores en la cadena de ancestros si la primera clave de una hoja cambió. */
  private updateSeparatorsUpward(
    leaf: BPlusNode<K, V>,
    oldFirst: K,
    newFirst?: K
  ): void {
    let child: BPlusNode<K, V> | null = leaf;
    let parent = leaf.getParent();

    while (parent) {
      const kids = parent.getChildren() as BPlusNode<K, V>[];
      const pos = kids.indexOf(child!);
      if (pos === -1) break;

      if (pos > 0) {
        const keys = parent.getKeys().slice();
        if (this.cmp(keys[pos - 1], oldFirst) === 0) {
          if (newFirst !== undefined) {
            keys[pos - 1] = newFirst;
            const nuevo = new BPlusNode<K, V>({
              isLeaf: false,
              keys,
              children: kids,
            });
            nuevo.setParent(parent.getParent());
            for (const c of kids) c.setParent(nuevo);
            this.replaceNodeInParent(parent, nuevo);
            parent = nuevo.getParent();
            child = nuevo;
            continue;
          }
        }
      }
      child = parent;
      parent = parent.getParent();
    }
  }

  /** Borrow hacia el hijo idx desde su hermano izquierdo (interno u hoja). */
  private borrowFromLeft(
    parent: BPlusNode<K, V>,
    idx: number,
    left: BPlusNode<K, V>,
    child: BPlusNode<K, V>
  ): void {
    if (child.getIsLeaf() && left.getIsLeaf()) {
      const { newSepKeyForParent } = child.redistributeLeafWith(left, "left");
      this.replaceParentSeparator(parent, idx - 1, newSepKeyForParent);
    } else {
      const sepKey = parent.getKeys()[idx - 1];
      const { newSepKeyForParent } = child.redistributeInternalWith(
        left,
        sepKey,
        "left"
      );
      this.replaceParentSeparator(parent, idx - 1, newSepKeyForParent);
    }
  }

  /** Borrow hacia el hijo idx desde su hermano derecho. */
  private borrowFromRight(
    parent: BPlusNode<K, V>,
    idx: number,
    child: BPlusNode<K, V>,
    right: BPlusNode<K, V>
  ): void {
    if (child.getIsLeaf() && right.getIsLeaf()) {
      const { newSepKeyForParent } = child.redistributeLeafWith(right, "right");
      this.replaceParentSeparator(parent, idx, newSepKeyForParent);
    } else {
      const sepKey = parent.getKeys()[idx];
      const { newSepKeyForParent } = child.redistributeInternalWith(
        right,
        sepKey,
        "right"
      );
      this.replaceParentSeparator(parent, idx, newSepKeyForParent);
    }
  }

  /** Funde hijos i e i+1 usando separador i del padre. Maneja hojas e internos. */
  private mergeChildren(parent: BPlusNode<K, V>, i: number): void {
    const left = parent.getChildren()[i] as BPlusNode<K, V>;
    const right = parent.getChildren()[i + 1] as BPlusNode<K, V>;

    if (left.getIsLeaf() && right.getIsLeaf()) {
      const keys = parent.getKeys().slice();
      keys.splice(i, 1);
      const kids = parent.getChildren().slice() as BPlusNode<K, V>[];
      kids.splice(i + 1, 1);

      left.mergeLeafWithRight(right);

      const nuevo = new BPlusNode<K, V>({
        isLeaf: false,
        keys,
        children: kids,
      });
      nuevo.setParent(parent.getParent());
      for (const c of kids) c.setParent(nuevo);
      this.replaceNodeInParent(parent, nuevo);

      this.tamanio -= 1; // se elimina 'right'
    } else if (!left.getIsLeaf() && !right.getIsLeaf()) {
      const sepKey = parent.getKeys()[i];
      const merged = left.mergeInternalWithRight(sepKey, right);

      const keys = parent.getKeys().slice();
      keys.splice(i, 1);
      const kids = parent.getChildren().slice() as BPlusNode<K, V>[];
      kids.splice(i + 1, 1);
      kids[i] = merged;

      const nuevo = new BPlusNode<K, V>({
        isLeaf: false,
        keys,
        children: kids,
      });
      nuevo.setParent(parent.getParent());
      for (const c of kids) c.setParent(nuevo);
      this.replaceNodeInParent(parent, nuevo);

      this.tamanio -= 1;
    } else {
      throw new Error(
        "mergeChildren: tipos inconsistentes (mezcla hoja/interno)."
      );
    }
  }

  /** Reemplaza clave separadora en 'parent' en posición idx por 'newKey'. */
  private replaceParentSeparator(
    parent: BPlusNode<K, V>,
    idx: number,
    newKey: K
  ): void {
    const keys = parent.getKeys().slice();
    keys[idx] = newKey;
    const kids = parent.getChildren().slice() as BPlusNode<K, V>[];
    const nuevo = new BPlusNode<K, V>({ isLeaf: false, keys, children: kids });
    nuevo.setParent(parent.getParent());
    for (const c of kids) c.setParent(nuevo);
    this.replaceNodeInParent(parent, nuevo);
  }

  /** Arregla underflow en hoja n (no-raíz) intentando prestar o fusionar. */
  private fixLeafUnderflow(n: BPlusNode<K, V>): void {
    const p = n.getParent();
    if (!p) return;
    const kids = p.getChildren() as BPlusNode<K, V>[];
    const idx = kids.indexOf(n);
    if (idx === -1)
      throw new Error("fixLeafUnderflow: hoja no encontrada en su padre.");

    const left = idx > 0 ? kids[idx - 1] : null;
    const right = idx + 1 < kids.length ? kids[idx + 1] : null;

    if (left && this.keyCount(left) > this.minKeys()) {
      this.borrowFromLeft(p, idx, left, n);
      return;
    }
    if (right && this.keyCount(right) > this.minKeys()) {
      this.borrowFromRight(p, idx, n, right);
      return;
    }

    if (left) {
      this.mergeChildren(p, idx - 1);
    } else if (right) {
      this.mergeChildren(p, idx);
    }
  }

  /* ───────────────────────────── Utilidades ───────────────────────────── */

  private keyCount(n: BPlusNode<K, V>): number {
    return n.getKeyCount();
  }
  private minKeys(): number {
    return this.t - 1;
  }
  private maxKeys(): number {
    return 2 * this.t - 1;
  }

  private alturaNodo(n: BPlusNode<K, V> | null): number {
    if (!n) return 0;
    const children = n.getChildren();
    if (children.length === 0) return 1;
    let h = 0;
    for (const c of children)
      h = Math.max(h, this.alturaNodo(c as BPlusNode<K, V>));
    return h + 1;
  }

  private contarHojasAux(n: BPlusNode<K, V> | null): number {
    if (!n) return 0;
    if (n.getIsLeaf()) return 1;
    let total = 0;
    for (const h of n.getChildren())
      total += this.contarHojasAux(h as BPlusNode<K, V>);
    return total;
  }

  private checkCap(extraNodes = 0) {
    if (this.tamanio + extraNodes > this.MAX_NODOS) {
      throw new Error(
        `No fue posible insertar: límite máximo de nodos alcanzado (${this.MAX_NODOS}).`
      );
    }
  }

  /** Encuentra la hoja que contiene la primera clave >= k, y el índice dentro de la hoja. */
  private findLeafLowerBound(
    k: K
  ): { leaf: BPlusNode<K, V>; index: number } | null {
    if (!this.raiz) return null;
    let cur = this.raiz;
    while (!cur.getIsLeaf()) {
      const idx = cur.childIndexFor(k, this.cmp);
      cur = cur.getChildren()[idx] as BPlusNode<K, V>;
    }
    const i = cur.lowerBound(k, this.cmp);
    return { leaf: cur, index: i };
  }

  /** Devuelve la hoja donde está exactamente k, y su índice; o index=-1 si no existe. */
  private getLeafAndIndex(
    k: K
  ): { leaf: BPlusNode<K, V>; index: number } | null {
    const lb = this.findLeafLowerBound(k);
    if (!lb) return null;
    const { leaf, index } = lb;
    if (
      index < leaf.getKeyCount() &&
      this.cmp(leaf.getKeys()[index], k) === 0
    ) {
      return { leaf, index };
    }
    return { leaf, index: -1 };
  }

  /** Iterador que recorre claves desde la primera ≥ start usando enlaces de hojas. */
  private *scanIteratorFrom(
    start: K,
    _cmp: KeyCmp<K>
  ): Generator<K, void, unknown> {
    const lb = this.findLeafLowerBound(start);
    if (!lb) return;
    let { leaf, index } = lb;

    while (index >= leaf.getKeyCount()) {
      const next = leaf.getNextLeaf();
      if (!next) return;
      leaf = next;
      index = 0;
    }

    while (true) {
      const keys = leaf.getKeys();
      for (; index < keys.length; index++) {
        yield keys[index];
      }
      const next = leaf.getNextLeaf();
      if (!next) return;
      leaf = next;
      index = 0;
    }
  }

  /** Conversión a jerarquía para renderer BPlusHierarchy (incluye enlaces laterales de hojas). */
  private toBPlusHierarchy(
    n: BPlusNode<K, V>,
    toNum: (k: K) => number
  ): BPlusHierarchy {
    const idNum = n.getId();
    const children = (n.getChildren() as BPlusNode<K, V>[]).map((c) =>
      this.toBPlusHierarchy(c, toNum)
    );
    const isLeaf = n.getIsLeaf();

    const nextLeaf = isLeaf
      ? n.getNextLeaf()
        ? `n-${n.getNextLeaf()!.getId()}`
        : undefined
      : undefined;
    const prevLeaf = isLeaf
      ? n.getPrevLeaf()
        ? `n-${n.getPrevLeaf()!.getId()}`
        : undefined
      : undefined;

    return {
      id: `n-${idNum}`,
      idNum,
      keys: n.getKeys().map(toNum),
      isLeaf,
      degree: n.getChildren().length,
      order: 2 * this.t,
      minKeys: this.minKeys(),
      maxKeys: this.maxKeys(),
      nextLeafId: nextLeaf,
      prevLeafId: prevLeaf,
      children: children.length ? children : undefined,
    } as unknown as BPlusHierarchy;
  }
}
