// logic/Arbol23.ts
import { HierarchyNodeData } from "../../../types";
import { Cola } from "./Cola";
import { Nodo23 } from "../nodes/Nodo23";

export type Cmp<T> = (a: T, b: T) => number;

export class Arbol23<T> {
  private raiz: Nodo23<T> | null = null;
  private tamanio = 0; // nodos
  private readonly MAX_NODOS = 150;

  constructor(private cmp: Cmp<T>) {}

  /* ── API ── */

  public crearRaiz(k: T): Nodo23<T> {
    if (this.raiz) throw new Error("La raíz ya existe.");
    this.checkCap(1);
    this.raiz = new Nodo23<T>([k]);
    this.tamanio = 1;
    return this.raiz;
  }

  public insertar(k: T): void {
    if (!this.raiz) {
      this.crearRaiz(k);
      return;
    }
    if (this.contiene(k)) throw new Error(`La clave ya existe: ${String(k)}`);

    // Descenso
    let cur: Nodo23<T> = this.raiz;
    while (!cur.isHoja()) {
      const i = this.lowerBound(cur.getKeys(), k);
      const hijo = cur.getHijo(i);
      if (!hijo)
        throw new Error("Inconsistencia: hijo inexistente durante descenso.");
      cur = hijo;
    }

    // Insertar en hoja
    cur.insertarKeyOrdenada(k, this.cmp);

    // Reparar splits ascendentes
    this.repararOverflow(cur);
  }

  public vaciar(resetIds = false): void {
    this.raiz = null;
    this.tamanio = 0;
    if (resetIds) Nodo23.reset(1);
  }
  /* ───────────────────── API: DELETE ───────────────────── */

  public eliminar(k: T): void {
    if (!this.raiz) throw new Error("Árbol vacío.");
    // Verifica que exista
    if (!this.contiene(k))
      throw new Error(`La clave no está en el árbol: ${String(k)}`);

    // Caso especial: raíz hoja
    if (this.raiz.isHoja()) {
      const keys = this.raiz.getKeys();
      const idx = this.lowerBound(keys, k);
      if (idx >= keys.length || this.cmp(keys[idx], k) !== 0) {
        throw new Error("Inconsistencia: clave no encontrada en raíz.");
      }
      keys.splice(idx, 1);
      this.raiz.setKeys(keys);
      // Si quedó sin claves, árbol vacío
      if (this.raiz.getNumeroKeys() === 0) {
        this.raiz = null;
        this.tamanio = 0; // no hay nodos
      }
      return;
    }

    // General: eliminar recursivamente y reparar underflow hacia arriba
    this.eliminarRec(this.raiz, k);

    // Contracción de raíz si se quedó sin claves
    if (this.raiz && this.raiz.getNumeroKeys() === 0) {
      const hijos = this.raiz.getHijos() as Nodo23<T>[];
      if (hijos.length === 1) {
        // La raíz colapsa a su único hijo
        this.raiz = hijos[0];
        this.raiz.setParent(null);
        this.tamanio -= 1; // perdió un nodo (la raíz anterior)
      } else if (hijos.length === 0) {
        // Sin claves y sin hijos → árbol vacío
        this.raiz = null;
        this.tamanio = 0;
      } else {
        // Raíz con 0 claves y >1 hijos no debería ocurrir en 2-3 correcto
        throw new Error("Inconsistencia: raíz sin claves con múltiples hijos.");
      }
    }
  }

  /* ───────────────────── Internos: DELETE ───────────────────── */

  /** Elimina k dentro del subárbol de `n`. Repara underflow del hijo si ocurre. */
  private eliminarRec(n: Nodo23<T>, k: T): void {
    const keys = n.getKeys();
    const i = this.lowerBound(keys, k);

    if (i < keys.length && this.cmp(keys[i], k) === 0) {
      // k está en este nodo
      if (n.isHoja()) {
        // 1) Eliminar directamente de hoja
        keys.splice(i, 1);
        n.setKeys(keys);
        return;
      } else {
        // 2) Nodo interno: reemplazar por predecesor (máximo de hijo izquierdo)
        const leftChild = n.getHijo(i)!;
        const { leaf: predLeaf, keyIndex: predIdx } = this.maxLeaf(leftChild);
        const predKeys = predLeaf.getKeys();
        const predKey = predKeys[predIdx];

        // Reemplazar clave en el nodo interno
        const newKeys = n.getKeys();
        newKeys[i] = predKey;
        n.setKeys(newKeys);

        // Borrar la clave del predecesor en su hoja
        predKeys.splice(predIdx, 1);
        predLeaf.setKeys(predKeys);

        // Reparar underflow desde predLeaf hacia arriba
        this.repararUnderflow(predLeaf);
        return;
      }
    } else {
      // k no está en este nodo → descender al hijo correspondiente
      const child = n.getHijo(i);
      if (!child)
        throw new Error("Inconsistencia: hijo inexistente durante delete.");
      // Si el hijo al que bajamos es una hoja con 1 clave y justo queremos borrarla,
      // la lógica de abajo (repararUnderflow) lo manejará.
      this.eliminarRec(child, k);
      // Tras eliminar, repara underflow si el hijo quedó con 0 claves
      this.repararUnderflow(child);
    }
  }

  /** Arregla underflow en `hijo` (0 claves) usando hermano izq/der o merge. */
  private repararUnderflow(hijo: Nodo23<T>): void {
    if (hijo.getNumeroKeys() > 0) return; // no hay underflow

    const padre = hijo.getParent();
    if (!padre) return; // ya se maneja a nivel de raíz fuera

    // Índice del hijo en el padre
    const pChildren = [...(padre.getHijos() as Nodo23<T>[])];
    const idx = pChildren.findIndex((x) => x === hijo);
    if (idx === -1)
      throw new Error("Inconsistencia: hijo no está en su padre.");

    const leftSibling = idx > 0 ? pChildren[idx - 1] : null;
    const rightSibling = idx + 1 < pChildren.length ? pChildren[idx + 1] : null;

    // 1) Borrow desde la izquierda si tiene 2 claves
    if (leftSibling && leftSibling.getNumeroKeys() > 1) {
      this.borrowRightFromLeft(padre, idx - 1, leftSibling, hijo);
      return;
    }

    // 2) Borrow desde la derecha si tiene 2 claves
    if (rightSibling && rightSibling.getNumeroKeys() > 1) {
      this.borrowLeftFromRight(padre, idx, hijo, rightSibling);
      return;
    }

    // 3) Merge: preferimos fusionar con la izquierda si existe, si no, con la derecha
    if (leftSibling) {
      this.mergeWithLeft(padre, idx - 1, leftSibling, hijo);
      // Tras merge, padre perdió una clave y un hijo → podría underflowear
      if (padre.getNumeroKeys() === 0) this.repararUnderflow(padre);
    } else if (rightSibling) {
      this.mergeWithRight(padre, idx, hijo, rightSibling);
      if (padre.getNumeroKeys() === 0) this.repararUnderflow(padre);
    } else {
      // Nodo sin hermanos: solo posible si es raíz (lo maneja el colapso de raíz)
    }
  }

  /* ────────────── Rotaciones (préstamos) ────────────── */

  /**
   * Borrow desde IZQUIERDA hacia hijo (rota a la DERECHA):
   *  padre.key[pos] baja al hijo
   *  la última key de left sube al padre
   *  si hay hijos, el último hijo de left pasa como primer hijo de hijo
   */
  private borrowRightFromLeft(
    padre: Nodo23<T>,
    pos: number, // posición de la clave del padre entre left y hijo
    left: Nodo23<T>,
    hijo: Nodo23<T>
  ): void {
    const pKeys = padre.getKeys();
    const lKeys = left.getKeys();
    const cKeys = hijo.getKeys();

    // mover clave del padre al hijo (como primera, manteniendo orden)
    const downKey = pKeys[pos];
    const newChildKeys = [downKey, ...cKeys];
    hijo.setKeys(newChildKeys);

    // subir la última del left al padre
    const upKey = lKeys[lKeys.length - 1];
    pKeys[pos] = upKey;
    padre.setKeys(pKeys);

    // left pierde su última clave
    lKeys.pop();
    left.setKeys(lKeys);

    // mover hijo derecho de left como hijo izquierdo de hijo (si existen hijos)
    const lChildren = [...(left.getHijos() as Nodo23<T>[])];
    const cChildren = [...(hijo.getHijos() as Nodo23<T>[])];
    if (lChildren.length > 0) {
      const moved = lChildren.pop()!;
      left.setHijos(lChildren);
      hijo.setHijos([moved, ...cChildren]);
    }
  }

  /**
   * Borrow desde DERECHA hacia hijo (rota a la IZQUIERDA):
   *  padre.key[pos] baja al hijo
   *  la primera key de right sube al padre
   *  si hay hijos, el primer hijo de right pasa como último hijo de hijo
   */
  private borrowLeftFromRight(
    padre: Nodo23<T>,
    pos: number, // posición de la clave del padre entre hijo y right
    hijo: Nodo23<T>,
    right: Nodo23<T>
  ): void {
    const pKeys = padre.getKeys();
    const rKeys = right.getKeys();
    const cKeys = hijo.getKeys();

    // mover clave del padre al hijo (como última)
    const downKey = pKeys[pos];
    const newChildKeys = [...cKeys, downKey];
    hijo.setKeys(newChildKeys);

    // subir la primera de right al padre
    const upKey = rKeys[0];
    pKeys[pos] = upKey;
    padre.setKeys(pKeys);

    // right pierde su primera clave
    rKeys.splice(0, 1);
    right.setKeys(rKeys);

    // mover primer hijo de right como último hijo de hijo (si existen)
    const rChildren = [...(right.getHijos() as Nodo23<T>[])];
    const cChildren = [...(hijo.getHijos() as Nodo23<T>[])];
    if (rChildren.length > 0) {
      const moved = rChildren.shift()!;
      right.setHijos(rChildren);
      hijo.setHijos([...cChildren, moved]);
    }
  }

  /* ────────────── Fusiones (merge) ────────────── */

  /** Fusiona LEFT + padre.key[pos] + HIJO → LEFT. Elimina HIJO del padre. */
  private mergeWithLeft(
    padre: Nodo23<T>,
    pos: number, // clave del padre entre left y hijo
    left: Nodo23<T>,
    hijo: Nodo23<T>
  ): void {
    const pKeys = padre.getKeys();
    const mergeKey = pKeys[pos];

    // Claves fusionadas
    const newLeftKeys = [...left.getKeys(), mergeKey, ...hijo.getKeys()];
    left.setKeys(newLeftKeys);

    // Hijos fusionados
    const leftChildren = [...(left.getHijos() as Nodo23<T>[])];
    const childChildren = [...(hijo.getHijos() as Nodo23<T>[])];
    if (leftChildren.length || childChildren.length) {
      left.setHijos([...leftChildren, ...childChildren]);
    }

    // Padre pierde esa clave y elimina HIJO
    pKeys.splice(pos, 1);
    padre.setKeys(pKeys);

    const pChildren = [...(padre.getHijos() as Nodo23<T>[])];
    const idxHijo = pChildren.findIndex((x) => x === hijo);
    if (idxHijo !== -1) pChildren.splice(idxHijo, 1);
    padre.setHijos(pChildren);

    // Se eliminó un nodo del árbol
    this.tamanio -= 1;
  }

  /** Fusiona HIJO + padre.key[pos] + RIGHT → HIJO. Elimina RIGHT del padre. */
  private mergeWithRight(
    padre: Nodo23<T>,
    pos: number, // clave del padre entre hijo y right
    hijo: Nodo23<T>,
    right: Nodo23<T>
  ): void {
    const pKeys = padre.getKeys();
    const mergeKey = pKeys[pos];

    const newChildKeys = [...hijo.getKeys(), mergeKey, ...right.getKeys()];
    hijo.setKeys(newChildKeys);

    const childChildren = [...(hijo.getHijos() as Nodo23<T>[])];
    const rightChildren = [...(right.getHijos() as Nodo23<T>[])];
    if (childChildren.length || rightChildren.length) {
      hijo.setHijos([...childChildren, ...rightChildren]);
    }

    // Padre pierde esa clave y elimina RIGHT
    pKeys.splice(pos, 1);
    padre.setKeys(pKeys);

    const pChildren = [...(padre.getHijos() as Nodo23<T>[])];
    const idxRight = pChildren.findIndex((x) => x === right);
    if (idxRight !== -1) pChildren.splice(idxRight, 1);
    padre.setHijos(pChildren);

    this.tamanio -= 1;
  }

  /* ────────────── Utilidades para delete ────────────── */

  /** Retorna la hoja más a la derecha del subárbol y el índice de su última clave. */
  private maxLeaf(root: Nodo23<T>): { leaf: Nodo23<T>; keyIndex: number } {
    let cur = root;
    while (!cur.isHoja()) {
      const hijos = cur.getHijos();
      cur = hijos[hijos.length - 1] as Nodo23<T>;
    }
    const keys = cur.getKeys();
    return { leaf: cur, keyIndex: keys.length - 1 };
  }

  /* ── Consultas ── */

  public esVacio(): boolean {
    return this.raiz === null;
  }
  public getTamanio(): number {
    return this.tamanio;
  } // nodos
  public getPeso(): number {
    return this.tamanio;
  }
  public getRaiz(): Nodo23<T> | null {
    return this.raiz;
  }
  public getAltura(): number {
    return this.alturaNodo(this.raiz);
  }
  public contarHojas(): number {
    return this.contarHojasAux(this.raiz);
  }

  public contiene(k: T): boolean {
    return this.getNodoYPos(k) !== null;
  }

  public getById(id: number): Nodo23<T> | null {
    if (!this.raiz) return null;
    const q = new Cola<Nodo23<T>>();
    q.encolar(this.raiz);
    while (!q.esVacia()) {
      const x = q.decolar().getValor();
      if (x.getId() === id) return x;
      for (const h of x.getHijos()) q.encolar(h);
    }
    return null;
  }

  public getNodosPorNiveles(): Nodo23<T>[] {
    const nodos: Nodo23<T>[] = [];
    if (this.raiz) {
      const q = new Cola<Nodo23<T>>();
      q.encolar(this.raiz);
      while (!q.esVacia()) {
        const x = q.decolar().getValor();
        nodos.push(x);
        for (const h of x.getHijos()) q.encolar(h);
      }
    }
    return nodos;
  }

  public convertirEstructuraJerarquica(): HierarchyNodeData<T[]> | null {
    if (!this.raiz) return null;
    return this.toHierarchy(this.raiz);
  }

  public clonar(): Arbol23<T> {
    const nuevo = new Arbol23<T>(this.cmp);
    nuevo.raiz = this.clonarNodo(this.raiz);
    nuevo.tamanio = this.contarNodos(this.raiz);
    return nuevo;
  }

  /* ── Internos ── */

  private lowerBound(arr: T[], k: T): number {
    let lo = 0,
      hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.cmp(arr[mid], k) < 0) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  private repararOverflow(n: Nodo23<T>): void {
    let cur: Nodo23<T> | null = n;
    let creados = 0;

    while (cur && cur.getNumeroKeys() > 2) {
      const keys = cur.getKeys();
      if (keys.length !== 3)
        throw new Error("Overflow inválido: se esperaban 3 claves.");
      const [k0, k1, k2] = keys as unknown as [T, T, T];

      const hijos = [...cur.getHijos()] as Nodo23<T>[];

      // L = cur (conserva el id)
      const L: Nodo23<T> = cur;
      L.setKeys([k0]);

      // R = nuevo hermano derecho
      this.checkCap(1);
      const R = new Nodo23<T>([k2]);
      creados += 1;

      if (hijos.length) {
        const hL = hijos.slice(0, 2);
        const hR = hijos.slice(2);
        L.setHijos(hL);
        R.setHijos(hR);
      }

      const padre: Nodo23<T> | null = L.getParent();

      if (!padre) {
        // Crear nueva raíz [k1] con hijos [L, R]
        this.checkCap(1);
        const nuevaRaiz = new Nodo23<T>([k1]);
        nuevaRaiz.setHijos([L, R]);
        this.raiz = nuevaRaiz;
        creados += 1;
        cur = null; // fin
      } else {
        // Insertar k1 en padre y ubicar R a la derecha de L
        const pKeys = padre.getKeys();
        const posK = this.lowerBound(pKeys, k1);
        padre.insertarKeyEn(posK, k1);

        const pChildren = [...padre.getHijos()] as Nodo23<T>[];
        const idxL = pChildren.findIndex((x) => x === L);
        if (idxL === -1)
          throw new Error("Inconsistencia: L no está en el padre.");
        pChildren.splice(idxL + 1, 0, R);
        padre.setHijos(pChildren);

        cur = padre; // seguir subiendo por si el padre overflowea
      }
    }

    if (creados) this.tamanio += creados;
  }

  private alturaNodo(n: Nodo23<T> | null): number {
    if (!n) return 0;
    const hijos = n.getHijos();
    if (hijos.length === 0) return 1;
    let maxH = 0;
    for (const h of hijos) maxH = Math.max(maxH, this.alturaNodo(h));
    return maxH + 1;
  }

  private contarHojasAux(n: Nodo23<T> | null): number {
    if (!n) return 0;
    const hijos = n.getHijos();
    if (hijos.length === 0) return 1;
    let total = 0;
    for (const h of hijos) total += this.contarHojasAux(h as Nodo23<T>);
    return total;
  }

  private contarNodos(n: Nodo23<T> | null): number {
    if (!n) return 0;
    let total = 1;
    for (const h of n.getHijos()) total += this.contarNodos(h as Nodo23<T>);
    return total;
  }

  private toHierarchy(n: Nodo23<T>): HierarchyNodeData<T[]> {
    const children = (n.getHijos() as Nodo23<T>[]).map((h) =>
      this.toHierarchy(h)
    );
    const idNum = n.getId();
    return {
      id: `n-${idNum}`,
      idNum,
      value: n.getKeys(),
      degree: n.getNumeroHijos(),
      height: this.alturaNodo(n),
      children: children.length ? children : undefined,
    };
  }

  private clonarNodo(n: Nodo23<T> | null): Nodo23<T> | null {
    if (!n) return null;
    const copia = new Nodo23<T>(n.getKeys(), {
      keepId: n.getId(),
      bumpCounter: false,
    });
    for (const h of n.getHijos()) {
      const hc = this.clonarNodo(h as Nodo23<T>)!;
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

  private getNodoYPos(k: T): { nodo: Nodo23<T>; posKey: number } | null {
    let cur = this.raiz as Nodo23<T> | null;
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
}
