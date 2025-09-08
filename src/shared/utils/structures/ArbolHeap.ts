import { ArbolBinario } from "./ArbolBinario";
import { NodoBin } from "../nodes/NodoBin";

/**
 * Tipo de heap que se puede crear.
 */
export type TipoHeap = "MAX" | "MIN";

/**
 * Clase que representa un árbol heap (montículo) que extiende de ArbolBinario.
 * Un heap es un árbol binario completo que cumple la propiedad del heap:
 * - MAX HEAP: cada nodo padre es mayor o igual que sus hijos
 * - MIN HEAP: cada nodo padre es menor o igual que sus hijos
 */
export class ArbolHeap<T> extends ArbolBinario<T> {
  private tipo: TipoHeap;
  private compareFn: (a: T, b: T) => number;

  /**
   * Constructor de la clase ArbolHeap.
   * @param tipo Tipo de heap (MAX o MIN)
   * @param compareFn Función de comparación para ordenar los elementos
   */
  constructor(
    tipo: TipoHeap = "MAX",
    compareFn: (a: T, b: T) => number = (a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    }
  ) {
    super();
    this.tipo = tipo;
    this.compareFn = compareFn;
  }

  // /**
  //  * Inserta un elemento en el heap manteniendo las propiedades del heap.
  //  * @param elemento Elemento a insertar
  //  * @returns El nodo insertado
  //  */
  // public insertar(elemento: T): NodoBin<T> {
  //   if (this.getTamanio() >= this.MAX_NODOS) {
  //     throw new Error(
  //       `No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`
  //     );
  //   }

  //   if (this.esta(elemento)) {
  //     throw new Error(
  //       `No fue posible insertar el nodo: El elemento ya existe en el heap.`
  //     );
  //   }

  //   const nuevoNodo = new NodoBin(elemento);

  //   if (this.esVacio()) {
  //     this.setRaiz(nuevoNodo);
  //     this.setTamanio(1);
  //     return nuevoNodo;
  //   }

  //   // Encontrar la posición correcta para insertar (mantener árbol completo)
  //   const padre = this.encontrarPadreParaInsercion();

  //   if (padre.getIzq() === null) {
  //     padre.setIzq(nuevoNodo);
  //   } else {
  //     padre.setDer(nuevoNodo);
  //   }

  //   this.setTamanio(this.getTamanio() + 1);

  //   // Restaurar propiedad del heap (heapify up)
  //   this.heapifyUp(nuevoNodo);

  //   return nuevoNodo;
  // }

  public insertar(elemento: T): { nodo: NodoBin<T>; swapPath: string[] } {
    if (this.getTamanio() >= this.MAX_NODOS) {
      throw new Error(
        `No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`
      );
    }

    if (this.esta(elemento)) {
      throw new Error(
        `No fue posible insertar el nodo: El elemento ya existe en el heap.`
      );
    }

    const nuevoNodo = new NodoBin(elemento);

    if (this.esVacio()) {
      this.setRaiz(nuevoNodo);
      this.setTamanio(1);
      return { nodo: nuevoNodo, swapPath: [] };
    }

    // Encontrar el padre donde se inserta
    const padre = this.encontrarPadreParaInsercion();

    if (padre.getIzq() === null) {
      padre.setIzq(nuevoNodo);
    } else {
      padre.setDer(nuevoNodo);
    }

    this.setTamanio(this.getTamanio() + 1);

    // Restaurar propiedad del heap (heapify up)
    const swapPath = this.heapifyUp(nuevoNodo);

    return { nodo: nuevoNodo, swapPath };
  }

  /**
   * Elimina y retorna el elemento raíz del heap (máximo en MAX heap, mínimo en MIN heap).
   * @returns El elemento eliminado
   */
  public extraerRaiz(): T {
    if (this.esVacio()) {
      throw new Error("No fue posible extraer la raíz: El heap está vacío.");
    }

    const raiz = this.getRaiz()!;
    const elementoRaiz = raiz.getInfo();

    if (this.getTamanio() === 1) {
      this.setRaiz(null);
      this.setTamanio(0);
      return elementoRaiz;
    }

    // Encontrar el último nodo y moverlo a la raíz
    const ultimoNodo = this.encontrarUltimoNodo();
    const ultimoPadre = this.getPadre(ultimoNodo.getInfo());

    // Reemplazar raíz con último elemento
    raiz.setInfo(ultimoNodo.getInfo());

    // Eliminar último nodo
    if (ultimoPadre) {
      if (ultimoPadre.getDer() === ultimoNodo) {
        ultimoPadre.setDer(null);
      } else {
        ultimoPadre.setIzq(null);
      }
    }

    this.setTamanio(this.getTamanio() - 1);

    // Restaurar propiedad del heap (heapify down)
    this.heapifyDown(raiz);

    return elementoRaiz;
  }

  /**
   * Retorna el elemento raíz sin eliminarlo.
   * @returns El elemento en la raíz del heap
   */
  public peek(): T | null {
    return this.esVacio() ? null : this.getRaiz()!.getInfo();
  }

  /**
   * Construye un heap a partir de un array de elementos.
   * @param elementos Array de elementos para construir el heap
   */
  public construirDesdeArray(elementos: T[]): void {
    if (elementos.length > this.MAX_NODOS) {
      throw new Error(
        `No fue posible construir el heap: Demasiados elementos (${elementos.length}). Máximo permitido: ${this.MAX_NODOS}.`
      );
    }

    this.vaciar();

    if (elementos.length === 0) return;

    // Crear todos los nodos
    const nodos: NodoBin<T>[] = elementos.map(
      (elemento) => new NodoBin(elemento)
    );

    // Construir árbol completo
    for (let i = 0; i < nodos.length; i++) {
      if (i === 0) {
        this.setRaiz(nodos[i]);
      } else {
        const padreIndex = Math.floor((i - 1) / 2);
        const padre = nodos[padreIndex];

        if (padre.getIzq() === null) {
          padre.setIzq(nodos[i]);
        } else {
          padre.setDer(nodos[i]);
        }
      }
    }

    this.setTamanio(elementos.length);

    // Heapificar desde el último nodo padre hacia arriba
    for (let i = Math.floor(elementos.length / 2) - 1; i >= 0; i--) {
      this.heapifyDown(nodos[i]);
    }
  }

  /**
   * Verifica si el árbol cumple con las propiedades del heap.
   * @returns true si es un heap válido, false en caso contrario
   */
  public esHeapValido(): boolean {
    return this.verificarPropiedadHeap(this.getRaiz());
  }

  /**
   * Convierte el heap en un array ordenado (heap sort).
   * @returns Array con los elementos ordenados
   */
  public heapSort(): T[] {
    const resultado: T[] = [];
    const heapTemporal = this.clonar() as ArbolHeap<T>;

    while (!heapTemporal.esVacio()) {
      resultado.push(heapTemporal.extraerRaiz());
    }

    return resultado;
  }

  /**
   * Obtiene el tipo del heap.
   * @returns El tipo de heap (MAX o MIN)
   */
  public getTipo(): TipoHeap {
    return this.tipo;
  }

  /**
   * Cambia el tipo de heap y reorganiza los elementos.
   * @param nuevoTipo Nuevo tipo de heap
   */
  public cambiarTipo(nuevoTipo: TipoHeap): void {
    if (this.tipo === nuevoTipo) return;

    this.tipo = nuevoTipo;

    if (!this.esVacio()) {
      // Reheapificar todo el árbol
      const elementos = this.inOrden().map((nodo) => nodo.getInfo());
      this.construirDesdeArray(elementos);
    }
  }

  // Override del método clonar para mantener el tipo correcto
  public clonar(): ArbolHeap<T> {
    const nuevoHeap = new ArbolHeap<T>(this.tipo, this.compareFn);
    nuevoHeap.setRaiz(this.clonarNodo(this.getRaiz()));
    nuevoHeap.setTamanio(this.getTamanio());
    return nuevoHeap;
  }

  // /**
  //  * Actualiza el valor de un elemento específico en el heap.
  //  * @param elementoViejo Elemento actual a cambiar
  //  * @param elementoNuevo Nuevo valor del elemento
  //  * @returns true si la actualización fue exitosa, false si el elemento no se encontró
  //  */
  // public actualizarElemento(elementoViejo: T, elementoNuevo: T): boolean {
  //   if (this.esVacio()) {
  //     return false;
  //   }

  //   // Verificar que el nuevo elemento no existe ya en el heap (evitar duplicados)
  //   if (this.esta(elementoNuevo)) {
  //     throw new Error(
  //       "No fue posible actualizar: El nuevo elemento ya existe en el heap."
  //     );
  //   }

  //   // Buscar el nodo que contiene el elemento viejo
  //   const nodo = this.buscarNodo(elementoViejo);
  //   if (!nodo) {
  //     return false;
  //   }

  //   // Guardar el valor anterior y actualizar
  //   const valorAnterior = nodo.getInfo();
  //   nodo.setInfo(elementoNuevo);

  //   // Determinar la dirección de heapify necesaria
  //   const comparacion = this.compareFn(elementoNuevo, valorAnterior);

  //   if (comparacion === 0) {
  //     // No hay cambio, no necesita reheapificar
  //     return true;
  //   }

  //   // Decidir si hacer heapify up o down basado en el tipo de heap y la comparación
  //   const necesitaHeapifyUp =
  //     (this.tipo === "MAX" && comparacion > 0) ||
  //     (this.tipo === "MIN" && comparacion < 0);

  //   if (necesitaHeapifyUp) {
  //     // El nuevo valor es "mejor" que el anterior, puede necesitar subir
  //     const padre = this.getPadre(elementoNuevo);
  //     this.heapifyUp(nodo, padre);
  //   } else {
  //     // El nuevo valor es "peor" que el anterior, puede necesitar bajar
  //     this.heapifyDown(nodo);
  //   }

  //   return true;
  // }

  /**
   * Reemplaza la raíz del heap con un nuevo elemento y restaura las propiedades.
   * @param nuevoElemento Nuevo elemento para la raíz
   * @returns El elemento anterior de la raíz
   */
  public reemplazarRaiz(nuevoElemento: T): T {
    if (this.esVacio()) {
      throw new Error("No fue posible reemplazar la raíz: El heap está vacío.");
    }

    // Verificar que el nuevo elemento no existe ya en el heap (evitar duplicados)
    if (this.esta(nuevoElemento)) {
      throw new Error(
        "No fue posible reemplazar la raíz: El nuevo elemento ya existe en el heap."
      );
    }

    const raiz = this.getRaiz()!;
    const elementoAnterior = raiz.getInfo();

    // Reemplazar el valor de la raíz
    raiz.setInfo(nuevoElemento);

    // Restaurar la propiedad del heap hacia abajo
    // (la raíz nunca necesita heapify up ya que no tiene padre)
    this.heapifyDown(raiz);

    return elementoAnterior;
  }

  // Métodos privados

  /**
   * Busca un nodo que contenga el elemento especificado.
   * @param elemento Elemento a buscar
   * @returns El nodo que contiene el elemento o null si no se encuentra
   */
  public buscarNodo(elemento: T): NodoBin<T> | null {
    return this.buscarNodoRecursivo(this.getRaiz(), elemento);
  }

  /**
   * Método que vacia el árbol heap.
   */
  public override vaciar(): void {
    super.vaciar();
  }

  /**
   * Método que realiza el recorrido por niveles del árbol AVL.
   * @returns Array de nodos por niveles.
   */
  public override getNodosPorNiveles(): NodoBin<T>[] {
    return super.getNodosPorNiveles();
  }

  /**
   * Busca recursivamente un nodo que contenga el elemento especificado.
   * @param nodo Nodo actual en la búsqueda
   * @param elemento Elemento a buscar
   * @returns El nodo que contiene el elemento o null si no se encuentra
   */
  private buscarNodoRecursivo(
    nodo: NodoBin<T> | null,
    elemento: T
  ): NodoBin<T> | null {
    if (!nodo) {
      return null;
    }

    if (this.compareFn(nodo.getInfo(), elemento) === 0) {
      return nodo;
    }

    // Buscar en subárbol izquierdo
    const izquierdo = this.buscarNodoRecursivo(nodo.getIzq(), elemento);
    if (izquierdo) {
      return izquierdo;
    }

    // Buscar en subárbol derecho
    return this.buscarNodoRecursivo(nodo.getDer(), elemento);
  }

  /**
   * Encuentra el padre donde se debe insertar el próximo nodo para mantener el árbol completo.
   */
  private encontrarPadreParaInsercion(): NodoBin<T> {
    const nodosPorNivel = this.getNodosPorNiveles();

    // Encontrar el primer nodo que no tenga dos hijos
    for (const nodo of nodosPorNivel) {
      if (nodo.getIzq() === null || nodo.getDer() === null) {
        return nodo;
      }
    }

    // Si todos los nodos tienen dos hijos, insertar en el siguiente nivel
    return nodosPorNivel[0]; // Esto no debería ocurrir en un heap bien formado
  }

  /**
   * Obtiene el padre de un nodo (por referencia, no por valor).
   */
  private getPadreDeNodo(hijo: NodoBin<T>): NodoBin<T> | null {
    const nodosPorNivel = this.getNodosPorNiveles();
    for (const nodo of nodosPorNivel) {
      if (nodo.getIzq() === hijo || nodo.getDer() === hijo) {
        return nodo;
      }
    }
    return null;
  }

  /**
   * Encuentra el último nodo del heap (el más a la derecha en el último nivel).
   */
  private encontrarUltimoNodo(): NodoBin<T> {
    const nodosPorNivel = this.getNodosPorNiveles();
    return nodosPorNivel[nodosPorNivel.length - 1];
  }

  // /**
  //  * Restaura la propiedad del heap hacia arriba (bubble up).
  //  */
  // private heapifyUp(nodo: NodoBin<T>): void {
  //   let padre = this.getPadreDeNodo(nodo);

  //   while (padre) {
  //     const debeIntercambiar =
  //       this.tipo === "MAX"
  //         ? this.compareFn(nodo.getInfo(), padre.getInfo()) > 0
  //         : this.compareFn(nodo.getInfo(), padre.getInfo()) < 0;

  //     if (!debeIntercambiar) break;

  //     // Intercambiar valores
  //     const temp = nodo.getInfo();
  //     nodo.setInfo(padre.getInfo());
  //     padre.setInfo(temp);

  //     // Subir un nivel
  //     nodo = padre;
  //     padre = this.getPadreDeNodo(nodo);
  //   }
  // }

  /**
   * Heapify up con registro de la ruta de swaps.
   */
  private heapifyUp(nodo: NodoBin<T>): string[] {
    const swapPath: string[] = [nodo.getId()];
    let padre = this.getPadreDeNodo(nodo);

    while (padre) {
      const debeIntercambiar =
        this.tipo === "MAX"
          ? this.compareFn(nodo.getInfo(), padre.getInfo()) > 0
          : this.compareFn(nodo.getInfo(), padre.getInfo()) < 0;

      if (!debeIntercambiar) break;

      // Intercambiar valores
      const temp = nodo.getInfo();
      nodo.setInfo(padre.getInfo());
      padre.setInfo(temp);

      // Guardamos en la ruta
      swapPath.push(padre.getId());

      // Subir un nivel
      nodo = padre;
      padre = this.getPadreDeNodo(nodo);
    }

    return swapPath;
  }

  /**
   * Restaura la propiedad del heap hacia abajo (bubble down).
   */
  private heapifyDown(nodo: NodoBin<T>): void {
    const izq = nodo.getIzq();
    const der = nodo.getDer();
    let candidato = nodo;

    // Encontrar el candidato para intercambio
    if (izq && this.debeIntercambiar(izq.getInfo(), candidato.getInfo())) {
      candidato = izq;
    }

    if (der && this.debeIntercambiar(der.getInfo(), candidato.getInfo())) {
      candidato = der;
    }

    // Si hay que hacer intercambio
    if (candidato !== nodo) {
      const temp = nodo.getInfo();
      nodo.setInfo(candidato.getInfo());
      candidato.setInfo(temp);

      // Continuar hacia abajo
      this.heapifyDown(candidato);
    }
  }

  /**
   * Determina si dos elementos deben intercambiarse según el tipo de heap.
   */
  private debeIntercambiar(hijo: T, padre: T): boolean {
    return this.tipo === "MAX"
      ? this.compareFn(hijo, padre) > 0
      : this.compareFn(hijo, padre) < 0;
  }

  /**
   * Verifica recursivamente si se cumple la propiedad del heap.
   */
  private verificarPropiedadHeap(nodo: NodoBin<T> | null): boolean {
    if (!nodo) return true;

    const izq = nodo.getIzq();
    const der = nodo.getDer();

    // Verificar hijo izquierdo
    if (izq && !this.cumplePropiedadHeap(nodo.getInfo(), izq.getInfo())) {
      return false;
    }

    // Verificar hijo derecho
    if (der && !this.cumplePropiedadHeap(nodo.getInfo(), der.getInfo())) {
      return false;
    }

    // Verificar recursivamente subárboles
    return this.verificarPropiedadHeap(izq) && this.verificarPropiedadHeap(der);
  }

  /**
   * Verifica si se cumple la propiedad del heap entre padre e hijo.
   */
  private cumplePropiedadHeap(padre: T, hijo: T): boolean {
    return this.tipo === "MAX"
      ? this.compareFn(padre, hijo) >= 0
      : this.compareFn(padre, hijo) <= 0;
  }

  /**
   * Clona un nodo y sus subárboles recursivamente.
   */
  private clonarNodo(nodo: NodoBin<T> | null): NodoBin<T> | null {
    if (!nodo) return null;

    const nuevoNodo = new NodoBin(nodo.getInfo(), nodo.getId());
    nuevoNodo.setIzq(this.clonarNodo(nodo.getIzq()));
    nuevoNodo.setDer(this.clonarNodo(nodo.getDer()));

    return nuevoNodo;
  }
}
