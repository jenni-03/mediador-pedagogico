// logic/ArbolB.ts
import { BHierarchy } from "../../../types"; // Asegúrate del path
import { BNodo, Par, Cmp as KeyCmp } from "../nodes/NodoB"; // Asegúrate del path
import { Cola } from "./Cola"; // Igual que en Arbol23

export class ArbolB<K, V = K> {
  private raiz: BNodo<K, V> | null = null;
  private tamanio = 0; // #nodos (no #claves)
  private readonly MAX_NODOS = 150;

  /**
   * @param cmp   Comparador de claves.
   * @param t     Grado mínimo (t >= 2). Orden = 2t.
   * @param mapValue   (opcional) mapear K -> V si no pasas V explícito al insertar.
   */
  constructor(
    private cmp: KeyCmp<K>,
    private t: number,
    private mapValue: (k: K) => V = (k) => k as unknown as V
  ) {
    if (t < 2) throw new Error("El grado mínimo t debe ser >= 2.");
  }

  /* ───────────────────────────── API PÚBLICA ───────────────────────────── */

  public crearRaiz(k: K, v?: V): BNodo<K, V> {
    if (this.raiz) throw new Error("La raíz ya existe.");
    this.checkCap(1);
    const val = v ?? this.mapValue(k);
    this.raiz = new BNodo<K, V>([{ key: k, value: val }]);
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

    // Si la raíz está llena (2t-1), dividir antes de descender.
    if (this.raiz.getNumeroKeys() === this.maxKeys()) {
      this.checkCap(2); // nueva raíz + un nodo derecho
      const nuevaRaiz = new BNodo<K, V>(); // vacía
      nuevaRaiz.setHijos([this.raiz]); // antigua raíz pasa a hijo 0
      this.raiz.setParent(nuevaRaiz);
      this.splitChild(nuevaRaiz, 0); // divide hijo 0
      this.raiz = nuevaRaiz;
      this.tamanio += 1; // se creó la nueva raíz
    }

    this.insertNonFull(this.raiz!, { key: k, value: val });
  }

  /** Elimina k si existe; lanza error si no está. */
  public eliminar(k: K): void {
    if (!this.raiz) throw new Error("Árbol vacío.");
    if (!this.contiene(k)) throw new Error(`La clave no está: ${String(k)}`);

    this.deleteRec(this.raiz, k);

    // Contraer raíz si se quedó sin claves
    if (this.raiz && this.raiz.getNumeroKeys() === 0) {
      const hijos = this.raiz.getHijos() as BNodo<K, V>[];
      if (hijos.length === 1) {
        this.raiz = hijos[0];
        this.raiz.setParent(null);
        this.tamanio -= 1; // “desaparece” la vieja raíz
      } else if (hijos.length === 0) {
        this.raiz = null;
        this.tamanio = 0;
      } else {
        // raíz interna con 0 claves y >1 hijos no debería ocurrir en B-tree correcto
        throw new Error("Inconsistencia: raíz sin claves con múltiples hijos.");
      }
    }
  }

  /** Retorna true si la clave existe. */
  public contiene(k: K): boolean {
    return this.getNodoYPos(k) !== null;
  }

  /** Busca y retorna el valor asociado, o null si no existe. */
  public get(k: K): V | null {
    const r = this.getNodoYPos(k);
    return r ? r.nodo.getValues()[r.posKey] : null;
  }

  /** Deja el árbol vacío; opcionalmente reinicia contadores de ids de BNodo. */
  public vaciar(resetIds = false): void {
    this.raiz = null;
    this.tamanio = 0;
    if (resetIds) BNodo.reset(1);
  }

  /* ─────────────────────────── Consultas varias ─────────────────────────── */

  public esVacio(): boolean {
    return this.raiz === null;
  }
  public getTamanio(): number {
    return this.tamanio; // #nodos
  }
  public getRaiz(): BNodo<K, V> | null {
    return this.raiz;
  }
  public getAltura(): number {
    return this.alturaNodo(this.raiz);
  }
  public contarHojas(): number {
    return this.contarHojasAux(this.raiz);
  }

  public getById(id: number): BNodo<K, V> | null {
    if (!this.raiz) return null;
    const q = new Cola<BNodo<K, V>>();
    q.encolar(this.raiz);
    while (!q.esVacia()) {
      const x = q.decolar().getValor();
      if (x.getId() === id) return x;
      for (const h of x.getHijos()) q.encolar(h);
    }
    return null;
  }

  /** Mapa para renderer jerárquico (puedes usar BHierarchy o HierarchyNodeData). */
  public convertirEstructuraJerarquica(): BHierarchy | null {
    if (!this.raiz) return null;
    return this.toBHierarchy(this.raiz);
  }

  /** Clonado profundo (conserva ids). */
  public clonar(): ArbolB<K, V> {
    const nuevo = new ArbolB<K, V>(this.cmp, this.t, this.mapValue);
    nuevo.raiz = this.clonarNodo(this.raiz);
    nuevo.tamanio = this.contarNodos(this.raiz);
    return nuevo;
  }

  /* ───────────────────────────── Internos: Insert ───────────────────────────── */

  private insertNonFull(n: BNodo<K, V>, entry: Par<K, V>): void {
    if (n.isHoja()) {
      n.insertarEntradaOrdenada(entry.key, entry.value, this.cmp);
      return;
    }
    // En interno: buscar hijo y dividir si está lleno antes de bajar.
    let i = n.childIndexFor(entry.key, this.cmp);
    const child = n.getHijo(i)!;
    if (child.getNumeroKeys() === this.maxKeys()) {
      this.splitChild(n, i);
      // Tras split, hay una clave promovida en n en i; decidir a qué hijo bajar.
      const kAtI = n.getKeys()[i];
      if (this.cmp(entry.key, kAtI) > 0) i += 1;
    }
    this.insertNonFull(n.getHijo(i)!, entry);
  }

  /** Divide el hijo `i` de `parent` (debe estar FULL: 2t-1 claves). */
  private splitChild(parent: BNodo<K, V>, i: number): void {
    const child = parent.getHijo(i);
    if (!child) throw new Error("splitChild: hijo inexistente.");
    if (child.getNumeroKeys() !== this.maxKeys()) {
      throw new Error("splitChild: el hijo no está lleno.");
    }

    const mid = this.t - 1; // separador en índice t-1
    const { separador, left, right } = child.separarEn(mid);

    // Reemplaza child por left e inserta separador y right en parent
    const pChildren = [...(parent.getHijos() as BNodo<K, V>[])];
    pChildren.splice(i, 1, left);
    parent.setHijos(pChildren); // setHijos vuelve a vincular parent

    // Inserta separador y right
    parent.insertarEntradaEn(i, separador.key, separador.value);
    const pChildren2 = [...(parent.getHijos() as BNodo<K, V>[])];
    pChildren2.splice(i + 1, 0, right);
    parent.setHijos(pChildren2);

    // Contabilidad de nodos: +1 (right). left reutiliza el nodo original (id del child)
    this.tamanio += 1;
  }

  /* ───────────────────────────── Internos: Delete ───────────────────────────── */

  private deleteRec(n: BNodo<K, V>, k: K): void {
    const keys = n.getKeys();
    let i = this.lowerBound(keys, k);

    // Caso 1: k está en este nodo.
    if (i < keys.length && this.cmp(keys[i], k) === 0) {
      if (n.isHoja()) {
        // (1a) Hoja: eliminar directamente
        n.eliminarEntradaEn(i);
        return;
      }
      // (1b) Interno:
      const left = n.getHijo(i)!;
      const right = n.getHijo(i + 1)!;

      // Si left tiene >= t claves, reemplazar por predecesor
      if (left.getNumeroKeys() >= this.t) {
        const { predKey, predVal } = this.maxEntry(left);
        // sustituir entrada en n
        n.reemplazarEntradaEn(i, predKey, predVal);
        // borrar predecesor en subárbol izquierdo
        this.deleteRec(left, predKey);
        return;
      }
      // Si right tiene >= t claves, reemplazar por sucesor
      if (right.getNumeroKeys() >= this.t) {
        const { succKey, succVal } = this.minEntry(right);
        n.reemplazarEntradaEn(i, succKey, succVal);
        this.deleteRec(right, succKey);
        return;
      }
      // Ambos hijos tienen t-1 → merge: left + (k) + right
      this.mergeChildren(n, i); // fusiona hijos i e i+1 con la entrada i
      const merged = n.getHijo(i)!; // ahora el hijo resultante en i
      this.deleteRec(merged, k);
      return;
    }

    // Caso 2: k NO está en este nodo.
    if (n.isHoja()) {
      // no existe
      throw new Error(`Clave no encontrada durante delete: ${String(k)}`);
    }

    // Asegurar que el hijo por el que bajaremos tenga al menos t claves.
    const childIdx = n.childIndexFor(k, this.cmp);
    let child = n.getHijo(childIdx)!;

    if (child.getNumeroKeys() === this.t - 1) {
      // Intentar prestar de hermano izquierdo
      const leftSibling = childIdx > 0 ? n.getHijo(childIdx - 1)! : null;
      if (leftSibling && leftSibling.getNumeroKeys() >= this.t) {
        this.borrowFromLeft(n, childIdx, leftSibling, child);
      } else {
        const rightSibling =
          childIdx + 1 < n.getNumeroHijos() ? n.getHijo(childIdx + 1)! : null;
        if (rightSibling && rightSibling.getNumeroKeys() >= this.t) {
          this.borrowFromRight(n, childIdx, child, rightSibling);
        } else {
          // No se puede prestar: fusionar con hermano (prefiere izquierda si existe)
          if (leftSibling) {
            this.mergeChildren(n, childIdx - 1); // fusiona (childIdx-1) con childIdx
            child = n.getHijo(childIdx - 1)!; // merged queda en childIdx-1
          } else if (rightSibling) {
            this.mergeChildren(n, childIdx); // fusiona childIdx con childIdx+1
            child = n.getHijo(childIdx)!; // merged queda en childIdx
          }
        }
      }
    }

    // Ahora el hijo tiene >= t; descendemos
    this.deleteRec(child, k);
  }

  /** Borrow desde IZQUIERDA hacia child (rota a la DERECHA alrededor de parent). */
  private borrowFromLeft(
    parent: BNodo<K, V>,
    childIdx: number,
    left: BNodo<K, V>,
    child: BNodo<K, V>
  ) {
    // Tomamos la entrada de parent[childIdx-1] y la movemos a child.
    // Sube la última entrada de left a parent[childIdx-1].
    const pKeys = parent.getKeys();
    const pVals = parent.getValues();

    const leftEntries = left.getEntries();
    const borrow = leftEntries[leftEntries.length - 1]; // última de left

    // La clave del padre que separa left/child baja al child.
    const sep: Par<K, V> = {
      key: pKeys[childIdx - 1],
      value: pVals[childIdx - 1],
    };

    // Actualiza parent con la entrada prestada (sube la última de left)
    parent.reemplazarEntradaEn(childIdx - 1, borrow.key, borrow.value);

    // Insertar en child (como primera entrada, manteniendo orden)
    child.insertarEntradaEn(0, sep.key, sep.value);

    // Ajustar hijos si son internos
    if (!left.isHoja()) {
      const leftChildren = [...(left.getHijos() as BNodo<K, V>[])];
      const moved = leftChildren.pop()!;
      left.setHijos(leftChildren);
      const cChildren = [...(child.getHijos() as BNodo<K, V>[])];
      child.setHijos([moved, ...cChildren]);
    }

    // left pierde su última entrada
    left.eliminarEntradaEn(leftEntries.length - 1);
  }

  /** Borrow desde DERECHA hacia child (rota a la IZQUIERDA alrededor de parent). */
  private borrowFromRight(
    parent: BNodo<K, V>,
    childIdx: number,
    child: BNodo<K, V>,
    right: BNodo<K, V>
  ) {
    const pKeys = parent.getKeys();
    const pVals = parent.getValues();

    const rightEntries = right.getEntries();
    const borrow = rightEntries[0]; // primera de right

    // La clave separadora parent[childIdx] baja a child
    const sep: Par<K, V> = { key: pKeys[childIdx], value: pVals[childIdx] };

    // parent recibe la primera de right como nueva separadora
    parent.reemplazarEntradaEn(childIdx, borrow.key, borrow.value);

    // child recibe sep al final
    child.insertarEntradaEn(child.getNumeroKeys(), sep.key, sep.value);

    // mover primer hijo de right al final de child si son internos
    if (!right.isHoja()) {
      const rChildren = [...(right.getHijos() as BNodo<K, V>[])];
      const moved = rChildren.shift()!;
      right.setHijos(rChildren);
      const cChildren = [...(child.getHijos() as BNodo<K, V>[])];
      child.setHijos([...cChildren, moved]);
    }

    // right pierde su primera entrada
    right.eliminarEntradaEn(0);
  }

  /** Fusiona hijos i e i+1 usando la entrada i del padre: left + sep + right → left. */
  private mergeChildren(parent: BNodo<K, V>, i: number): void {
    const left = parent.getHijo(i)!;
    const right = parent.getHijo(i + 1)!;

    // Tomar separador del padre
    const sepKV = parent.eliminarEntradaEn(i);
    if (!sepKV) throw new Error("mergeChildren: separador inexistente.");

    // left absorbe sep + right
    left.fusionarCon(sepKV, right);

    // El padre elimina right de la lista de hijos
    const pChildren = [...(parent.getHijos() as BNodo<K, V>[])];
    pChildren.splice(i + 1, 1);
    parent.setHijos(pChildren);

    // Contabilidad de nodos: se elimina 1 (right)
    this.tamanio -= 1;
  }

  /* ───────────────────────────── Utilidades ───────────────────────────── */

  private lowerBound(arr: K[], k: K): number {
    let lo = 0,
      hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.cmp(arr[mid], k) < 0) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  private maxEntry(root: BNodo<K, V>): { predKey: K; predVal: V } {
    let cur = root;
    while (!cur.isHoja()) {
      const hijos = cur.getHijos() as BNodo<K, V>[];
      cur = hijos[hijos.length - 1];
    }
    const entries = cur.getEntries();
    const last = entries[entries.length - 1];
    return { predKey: last.key, predVal: last.value };
  }

  private minEntry(root: BNodo<K, V>): { succKey: K; succVal: V } {
    let cur = root;
    while (!cur.isHoja()) {
      const hijos = cur.getHijos() as BNodo<K, V>[];
      cur = hijos[0];
    }
    const entries = cur.getEntries();
    const first = entries[0];
    return { succKey: first.key, succVal: first.value };
  }

  private alturaNodo(n: BNodo<K, V> | null): number {
    if (!n) return 0;
    const hijos = n.getHijos();
    if (hijos.length === 0) return 1;
    let maxH = 0;
    for (const h of hijos)
      maxH = Math.max(maxH, this.alturaNodo(h as BNodo<K, V>));
    return maxH + 1;
  }

  private contarHojasAux(n: BNodo<K, V> | null): number {
    if (!n) return 0;
    const hijos = n.getHijos();
    if (hijos.length === 0) return 1;
    let total = 0;
    for (const h of hijos) total += this.contarHojasAux(h as BNodo<K, V>);
    return total;
  }

  private contarNodos(n: BNodo<K, V> | null): number {
    if (!n) return 0;
    let total = 1;
    for (const h of n.getHijos()) total += this.contarNodos(h as BNodo<K, V>);
    return total;
  }

  private toBHierarchy(n: BNodo<K, V>): BHierarchy {
    const kids = (n.getHijos() as BNodo<K, V>[]).map((h) =>
      this.toBHierarchy(h)
    );
    const idNum = n.getId();
    const order = this.order();
    return {
      id: `n-${idNum}`,
      idNum,
      keys: n.getKeys() as unknown as number[], // si tus renders son numéricos; si usas genérico, adapta el mapper
      degree: n.getNumeroHijos(),
      order,
      minKeys: this.t - 1,
      maxKeys: this.maxKeys(),
      children: kids.length ? kids : undefined,
    };
  }

  private clonarNodo(n: BNodo<K, V> | null): BNodo<K, V> | null {
    if (!n) return null;
    const copia = new BNodo<K, V>(n.getEntries(), {
      keepId: n.getId(),
      bumpCounter: false,
    });
    for (const h of n.getHijos()) {
      const hc = this.clonarNodo(h as BNodo<K, V>)!;
      copia.agregarHijo(hc);
    }
    return copia;
  }

  private checkCap(extraNodes = 0) {
    if (this.tamanio + extraNodes > this.MAX_NODOS) {
      throw new Error(
        `No fue posible insertar: límite máximo de nodos alcanzado (${this.MAX_NODOS}).`
      );
    }
  }

  private getNodoYPos(k: K): { nodo: BNodo<K, V>; posKey: number } | null {
    let cur = this.raiz as BNodo<K, V> | null;
    while (cur) {
      const keys = cur.getKeys();
      const i = this.lowerBound(keys, k);
      if (i < keys.length && this.cmp(keys[i], k) === 0) {
        return { nodo: cur, posKey: i };
      }
      cur = cur.getHijo(i);
    }
    return null;
  }

  private order(): number {
    return 2 * this.t;
  }
  private maxKeys(): number {
    return 2 * this.t - 1;
  }

  public getPeso(): number {
    return this.tamanio;
  }
}
