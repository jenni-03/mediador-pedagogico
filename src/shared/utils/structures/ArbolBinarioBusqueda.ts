// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { BSTDeleteOutput, BSTInsertOutput, BSTSearchOutput, Comparator } from "../../../types";
import { NodoBin } from "../nodes/NodoBin";
import { defaultComparator } from "../treeUtils";
import { ArbolBinario } from "./ArbolBinario";

/**
 * Clase que representa el funcionamiento de un árbol binario de búsqueda.
 */
export class ArbolBinarioBusqueda<T> extends ArbolBinario<T> {

    /**
     * Constructor de la clase ArbolBinarioBusqueda.
     */
    constructor(
        protected compare: Comparator<T> = defaultComparator
    ) {
        super((a, b) => compare(a, b) === 0);
    }

    /**
     * Método que inserta un nuevo nodo en el árbol binario de búsqueda. Si el elemento ya existe en el árbol, no se inserta nada.
     * @param valor Elemento a insertar.
     * @returns Objeto con la siguiente información:
     * 
     *  - `pathIds`: Lista con los IDs de los nodos visitados durante el recorrido de búsqueda, en orden.
     *     Incluye el nodo padre donde se intentó insertar o el nodo ya existente.
     * 
     *  - `parent`: Nodo padre bajo el cual se insertó el nuevo nodo. Será `null` en 2 casos:
     *     1. Si el elemento ya existía en el árbol.
     *     2. Si el nuevo nodo se insertó como raíz.
     * 
     *  - `targetNode`: Nodo asociado al elemento (nuevo o ya existente).
     * 
     *  - `exists`: Booleano que indica si el elemento ya existía (`true`) o si se creó e insertó un nuevo nodo (`false`).
     */
    public insertarABB(valor: T): BSTInsertOutput<T> {
        if (this.getTamanio() >= this.MAX_NODOS) {
            throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
        }

        const pathIds: string[] = [];
        let p: NodoBin<T> | null = null;
        let cur = this.getRaiz();

        // Buscar posición de inserción
        while (cur) {
            pathIds.push(cur.getId());
            p = cur;
            const cmp = this.compare(valor, cur.getInfo());
            if (cmp === 0) {
                return { pathIds, parent: null, targetNode: cur, exists: true };
            }
            cur = cmp < 0 ? cur.getIzq() : cur.getDer();
        }

        // Insertar nuevo nodo
        const nuevo = new NodoBin<T>(valor);
        if (!p) {
            this.setRaiz(nuevo);
        } else if (this.compare(valor, p.getInfo()) < 0) {
            p.setIzq(nuevo);
        } else {
            p.setDer(nuevo);
        }

        this.setTamanio(this.getTamanio() + 1);
        return { pathIds, parent: p, targetNode: nuevo, exists: false };
    }

    /**
     * Método que elimina un nodo específico del árbol binario de búsqueda. Si el nodo no existe, no se elimina nada. 
     * @param valor Elemento a eliminar.
     * @returns Objeto con la siguiente información:
     * 
     * - `pathToTargetIds`: Lista con los IDs de los nodos visitados durante la búsqueda, 
     *    en orden desde la raíz hasta el nodo objetivo (incluye el nodo objetivo si fue encontrado).
     * 
     * - `parent`: Nodo padre del nodo eliminado. Será `null` en 2 casos:
     *    1. Si el nodo eliminado era la raíz.
     *    2. Si el valor no se encontró en el árbol.
     * 
     * - `targetNode`: Nodo objetivo que se intentó eliminar (nodo eliminado o último nodo visitado durante la búsqueda).
     * 
     * - `pathToSuccessorIds`: Lista con los IDs de los nodos visitados durante la búsqueda del sucesor in-order (solo se llena si el nodo eliminado tenía dos hijos).
     * 
     * - `successor`: Nodo que reemplazó lógicamente al nodo eliminado en el caso de dos hijos (nodo cuyo valor fue copiado al nodo objetivo).  
     *    Será `null` en los demás casos.
     * 
     * - `replacement`: Nodo que ocupó físicamente el lugar del nodo eliminado en el árbol. Puede ser:
     *    1. El hijo izquierdo o derecho (si existía uno).  
     *    2. `null` si se eliminó una hoja.  
     *    3. El hijo derecho del sucesor in-order (en el caso de dos hijos).
     * 
     * - `exists`: Booleano que indica si el elemento fue encontrado y eliminado (`true`) o no (`false`).
     */
    public eliminarABB(valor: T): BSTDeleteOutput<T> {
        if (this.esVacio()) {
            throw new Error("No fue posible eliminar el nodo: El árbol árbol se encuentra vacío (cantidad de nodos: 0).");
        }

        const pathToTargetIds: string[] = [];
        let p: NodoBin<T> | null = null;
        let cur = this.getRaiz();

        // Buscar nodo a eliminar
        while (cur && this.compare(valor, cur.getInfo()) !== 0) {
            pathToTargetIds.push(cur.getId());
            p = cur;
            if (this.compare(valor, cur.getInfo()) < 0) {
                cur = cur.getIzq();
            } else {
                cur = cur.getDer();
            }
        }

        // No encontrado
        if (!cur) {
            return { pathToTargetIds, parent: null, targetNode: p!, pathToSuccessorIds: [], successor: null, replacement: null, exists: false };
        }

        const removed = cur;
        const pathToSuccessorIds: string[] = [];
        let successor: NodoBin<T> | null = null;

        // Nodo con 0 o 1 hijo
        let replacement: NodoBin<T> | null = null;
        if (!cur.getIzq() || !cur.getDer()) {
            replacement = cur.getIzq() ? cur.getIzq() : cur.getDer();

            if (!p) {
                this.setRaiz(replacement);
            } else if (p.getIzq() === cur) {
                p.setIzq(replacement);
            } else {
                p.setDer(replacement);
            }
        } else {
            // Nodo con 2 hijos
            pathToTargetIds.push(cur.getId());
            pathToSuccessorIds.push(cur.getId());

            let succParent = cur;
            let succ = cur.getDer();
            while (succ && succ.getIzq()) {
                pathToSuccessorIds.push(succ.getId());
                succParent = succ;
                succ = succ.getIzq();
            }
            pathToSuccessorIds.push(succ!.getId());

            // Copiar valor del sucesor al nodo actual
            cur.setInfo(succ!.getInfo());
            successor = succ;

            // Eliminar el sucesor (que tiene a lo sumo un hijo derecho)
            replacement = succ!.getDer();
            if (succParent.getIzq() === succ) {
                succParent.setIzq(replacement);
            } else {
                succParent.setDer(replacement);
            }
            p = succParent;
        }

        this.setTamanio(this.getTamanio() - 1);
        return { pathToTargetIds, parent: p, targetNode: removed, pathToSuccessorIds, successor, replacement, exists: true };
    }

    /**
     * Método que busca un nodo especifico en el árbol binario de búsqueda.
     * @param valor Elemento a buscar.
     * @returns Objeto con la siguiente información:
     * 
     *  - `pathIds`: Lista con los IDs de los nodos visitados, en orden, desde la raíz hasta el nodo donde se detuvo la búsqueda.
     * 
     *  - `lastVisited`: Último nodo visitado durante el recorrido. Puede ser:
     *     1. El nodo que contiene el valor buscado si fue encontrado.
     *     2. El nodo donde la búsqueda se detuvo sin éxito (padre de la rama nula).
     *     3. `null` si el árbol está vacío.
     * 
     *  - `found`: Booleano que indica si el elemento fue encontrado (`true`) o no (`false`).
     */
    public buscarABB(valor: T): BSTSearchOutput<T> {
        const pathIds: string[] = [];
        let cur = this.getRaiz();
        let last = cur;

        while (cur) {
            pathIds.push(cur.getId());
            last = cur;
            const cmp = this.compare(valor, cur.getInfo());
            if (cmp === 0) {
                return { pathIds, found: true, lastVisited: cur };
            }
            cur = cmp < 0 ? cur.getIzq() : cur.getDer();
        }

        return { pathIds, found: false, lastVisited: last }
    }

    /**
     * Método que obtiene la raíz del árbol binario de búsqueda.
     * @returns Nodo raíz del árbol o null si está vacío.
     */
    public override getRaiz(): NodoBin<T> | null {
        return super.getRaiz();
    }

    /**
     * Método que modifica la raíz del árbol binario de búsqueda.
     * @param raiz Nuevo nodo raíz del árbol binario de búsqueda.
     */
    public override setRaiz(raiz: NodoBin<T> | null) {
        super.setRaiz(raiz);
    }

    /**
     * Método que obtiene todos los nodos hojas del árbol binario de búsqueda.
     * @returns Array de nodos que representan las hojas del árbol.
     */
    public override getHojas(): NodoBin<T>[] {
        return super.getHojas();
    }

    /**
     * Método que cuenta el número de nodos hoja del árbol binario de búsqueda.
     * @returns Número de nodos hoja del árbol.
     */
    public override contarHojas(): number {
        return super.contarHojas();
    }

    /**
     * Método que calcula el peso total (número de nodos) del árbol binario de búsqueda.
     * @returns Número total de nodos del árbol.
     */
    public override getPeso(): number {
        return super.getPeso();
    }

    /**
     * Método que calcula la altura del árbol binario de búsqueda.
     * @returns Altura del árbol.
     */
    public override getAltura(): number {
        return super.getAltura();
    }

    /**
     * Método que vacia el árbol binario de búsqueda.
     */
    public override vaciar(): void {
        super.vaciar();
    }

    /**
     * Método que verifica si el árbol binario de búsqueda está vacío.
     * @returns True si se encuentra vacío, false en caso contrario.
     */
    public override esVacio(): boolean {
        return super.esVacio()
    }

    /**
     * Método que realiza el recorrido in-orden del árbol binario de búsqueda.
     * @returns Array de nodos en secuencia in-orden.
     */
    public override inOrden(): NodoBin<T>[] {
        return super.inOrden();
    }

    /**
     * Método que realiza el recorrido pre-orden del árbol binario de búsqueda.
     * @returns Array de nodos en secuencia pre-orden.
     */
    public override preOrden(): NodoBin<T>[] {
        return super.preOrden();
    }

    /**
     * Método que realiza el recorrido post-orden del árbol binario de búsqueda.
     * @returns Array de nodos en secuencia post-orden.
     */
    public override postOrden(): NodoBin<T>[] {
        return super.postOrden();
    }

    /**
     * Método que realiza el recorrido por niveles del árbol binario de búsqueda.
     * @returns Array de nodos por niveles.
     */
    public override getNodosPorNiveles(): NodoBin<T>[] {
        return super.getNodosPorNiveles();
    }

    /**
     * Método que convierte el árbol binario de búsqueda en una estructura jerárquica.
     * @returns Representación jerárquica del árbol o null si está vacío.
     */
    public override convertirEstructuraJerarquica() {
        return super.convertirEstructuraJerarquica();
    }

    /**
     * Método que crea una copia profunda del árbol binario de búsqueda.
     * @returns Retorna un nuevo árbol correspondiente a una copia profunda del árbol actual.
     */
    public clonarABB(): ArbolBinarioBusqueda<T> {
        const nuevoArbol = new ArbolBinarioBusqueda<T>(this.compare);
        nuevoArbol.setRaiz(this.clonarABBrec(this.getRaiz()));
        nuevoArbol.setTamanio(this.getTamanio());
        return nuevoArbol;
    }

    /**
     * Método recursivo que clona un árbol binario de búsqueda iniciando desde el nodo raíz dado.
     * @param root Nodo raíz del árbol BST a clonar.
     * @returns Nuevo subárbol clonado con raíz en el nodo dado.
     */
    private clonarABBrec(root: NodoBin<T> | null): NodoBin<T> | null {
        if (root === null) return null;

        const nuevoNodo = new NodoBin(root.getInfo(), root.getId());
        nuevoNodo.setIzq(this.clonarABBrec(root.getIzq()));
        nuevoNodo.setDer(this.clonarABBrec(root.getDer()));

        return nuevoNodo;
    }

}