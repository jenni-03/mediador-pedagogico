// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { BinaryTreeLevelOutput, BinaryTreeTraverseOutput, BSTDeleteMeta, BSTDeleteOutput, BSTDeleteStep, BSTInsertMeta, BSTInsertOutput, BSTInsertStep, BSTSearchMeta, BSTSearchOutput, BSTSearchStep, Comparator } from "../utils/types";
import { DomainError } from "../error/DomainError";
import { NodoBin } from "../nodes/NodoBin";
import { defaultComparator } from "../utils/treeUtils";
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
     * Método que inserta un nuevo elemento en el árbol binario de búsqueda.
     * @param valor Elemento a insertar.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la inserción 
     *    (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `parent`: Nodo padre del nuevo nodo. Será `null` si el nuevo nodo se insertó en la raíz.
     * 
     * - `targetNode`: Nodo correspondiente al elemento proporcionado. Será `null` si ya existía en el árbol.
     * 
     * - `inserted`: Booleano que indica si el elemento fue insertado.
     */
    public insertarABB(valor: T): BSTInsertOutput<T> {
        if (this.getTamanio() >= this.MAX_NODOS) {
            throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
        }
        const steps: BSTInsertStep[] = [];
        const meta: BSTInsertMeta<T> = {
            parent: null,
            targetNode: null,
            inserted: false
        };
        const nuevaRaiz = this.insertarABBAux(this.getRaiz(), valor, steps, meta);

        if (meta.inserted) {
            this.setRaiz(nuevaRaiz);
            this.setTamanio(this.getTamanio() + 1);
        }

        return {
            steps,
            parent: meta.parent,
            targetNode: meta.targetNode,
            inserted: meta.inserted
        };
    }

    /**
     * Método que elimina el elemento especificado del árbol binario de búsqueda. 
     * @param valor Elemento a eliminar.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la eliminación 
     *    (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `parent`: Nodo padre del nodo eliminado. Será `null` en 2 casos:
     *    1. Si el nodo eliminado era la raíz.
     *    2. Si el elemento no se encuentra en el árbol.
     * 
     * - `targetNode`: Nodo correspondiente al elemento proporcionado. Será `null` si el elemento no se encuentra en el árbol.
     * 
     * - `pathToSuccessorIds`: Arreglo con los IDs de los nodos visitados durante la búsqueda del sucesor inorden (solo si el nodo eliminado tenía dos hijos).
     * 
     * - `successor`: Nodo que reemplaza lógicamente al nodo eliminado en el caso de dos hijos (nodo cuyo valor fue copiado al nodo objetivo).  
     *    Será `null` en los demás casos.
     * 
     * - `successorParent`: Nodo padre del nodo sucesor (solo si el nodo eliminado tenía dos hijos).
     * 
     * - `replacement`: Nodo que ocupa físicamente el lugar del nodo eliminado en el árbol. Puede ser:
     *    1. El hijo izquierdo o derecho (si existía uno).
     *    2. `null` si se eliminó una hoja.  
     *    3. El hijo derecho del sucesor in-order (en el caso de dos hijos).
     * 
     * - `replacementSide`: Dirección del nodo que ocupa físicamente el lugar del nodo eliminado ("left", "right"). 
     *    Sera `null` si el nodo si el nodo eliminado era un nodo hoja.
     * 
     * - `deleted`: Booleano que indica si el elemento fue eliminado.
     */
    public eliminarABB(valor: T): BSTDeleteOutput<T> {
        if (this.esVacio()) {
            throw new DomainError("No fue posible eliminar el nodo: El árbol árbol se encuentra vacío (cantidad de nodos: 0).", "DELETE_EMPTY");
        }

        const steps: BSTDeleteStep[] = [];
        const meta: BSTDeleteMeta<T> = {
            parent: null,
            targetNode: null,
            pathToSuccessorIds: [],
            successor: null,
            successorParent: null,
            replacement: null,
            replacementSide: null,
            deleted: false
        };
        const nuevaRaiz = this.eliminarABBAux(this.getRaiz(), valor, steps, meta);

        if (!meta.deleted) {
            return {
                steps,
                parent: null,
                targetNode: null,
                pathToSuccessorIds: [],
                successor: null,
                successorParent: null,
                replacement: null,
                replacementSide: null,
                deleted: false
            }
        }

        this.setRaiz(nuevaRaiz);
        this.setTamanio(this.getTamanio() - 1);

        return {
            steps,
            parent: meta.parent,
            targetNode: meta.targetNode,
            pathToSuccessorIds: meta.pathToSuccessorIds,
            successor: meta.successor,
            successorParent: meta.successorParent,
            replacement: meta.replacement,
            replacementSide: meta.replacementSide,
            deleted: meta.deleted
        }
    }

    /**
     * Método que comprueba la existencia del elemento especificado en el árbol binario de búsqueda.
     * @param valor Elemento a buscar.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la búsqueda 
     *    (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `targetNode`: Nodo correspondiente al elemento proporcionado. Será `null` si no fue encontrado.  
     * 
     * - `found`: Booleano que indica si el nodo fue encontrado.
     */
    public buscarABB(valor: T): BSTSearchOutput<T> {
        const steps: BSTSearchStep[] = [];
        const meta: BSTSearchMeta<T> = {
            targetNode: null
        };

        const found = this.buscarABBAux(this.getRaiz(), valor, steps, meta);
        return {
            steps,
            targetNode: meta.targetNode,
            found
        }
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
     * @returns Arreglo que contiene todos los nodos hoja presentes en el árbol.
     */
    public override getHojas(): NodoBin<T>[] {
        return super.getHojas();
    }

    /**
     * Método que cuenta el número de nodos hoja presentes en el árbol binario de búsqueda.
     * @returns Número de nodos hoja presentes en el árbol.
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
     * @returns true si se encuentra vacío, false en caso contrario.
     */
    public override esVacio(): boolean {
        return super.esVacio()
    }

    /**
     * Método que realiza el recorrido inorden del árbol binario de búsqueda.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante el recorrido 
     *    del árbol (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `visited`: Arreglo de nodos visitados durante el recorrido en secuencia inorden.
     */
    public override inOrden(): BinaryTreeTraverseOutput<T> {
        return super.inOrden();
    }

    /**
     * Método que realiza el recorrido preorden del árbol binario de búsqueda.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante el recorrido 
     *    del árbol (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `visited`: Arreglo de nodos visitados durante el recorrido en secuencia preorden.
     */
    public override preOrden(): BinaryTreeTraverseOutput<T> {
        return super.preOrden();
    }

    /**
     * Método que realiza el recorrido postorden del árbol binario de búsqueda.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante el recorrido 
     *    del árbol (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `visited`: Arreglo de nodos visitados durante el recorrido en secuencia postorden.
     */
    public override postOrden(): BinaryTreeTraverseOutput<T> {
        return super.postOrden();
    }

    /**
     * Método que realiza el recorrido por niveles del árbol binario de búsqueda.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante el recorrido 
     *    del árbol (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `visited`: Arreglo de nodos visitados durante el recorrido por niveles.
     */
    public override getNodosPorNiveles(): BinaryTreeLevelOutput<T> {
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
     * Método auxiliar que inserta un nuevo nodo en el subárbol dado, a partir del elemento proporcionado 
     * y aplicando las reglas del árbol binario de búsqueda.
     * @param root Nodo raíz del subárbol actual
     * @param valor Elemento a insertar.
     * @param steps Arreglo para acumular los pasos de inserción para la visualización del algoritmo.
     * @param meta Objeto de metadatos para rastrear el resultado de la inserción y la información del nodo objetivo.
     * @param parentNode Nodo padre del nodo actual.
     * @param via Dirección desde el nodo padre al nodo actual ("left", "right", or null para la raíz).
     * @returns Nodo raíz del subárbol actualizado tras la inserción.
     */
    private insertarABBAux(
        root: NodoBin<T> | null,
        valor: T,
        steps: BSTInsertStep[],
        meta: BSTInsertMeta<T>,
        parentNode: NodoBin<T> | null = null,
        via: "left" | "right" | null = null
    ): NodoBin<T> | null {
        steps.push({
            type: "checkNull",
            at: root?.getId() ?? null,
            isNull: root === null
        });
        if (root === null) {
            const nuevo = new NodoBin<T>(valor);

            steps.push({
                type: "createLeaf",
                parent: parentNode?.getId() ?? null,
                side: parentNode === null ? "root" : via === "left" ? "left" : "right"
            });
            meta.inserted = true;
            meta.targetNode = nuevo;
            meta.parent = parentNode;

            steps.push({ type: "return", from: nuevo.getId(), to: parentNode?.getId() ?? null, via: via ?? "root" });
            return nuevo;
        }

        const cmp = this.compare(valor, root.getInfo());
        steps.push({ type: "compare", at: root.getId(), cmp: cmp < 0 ? -1 : cmp > 0 ? 1 : 0 });
        if (cmp < 0) {
            steps.push({
                type: "goLeft",
                from: root.getId(),
                to: root.getIzq()?.getId() ?? null
            });
            root.setIzq(this.insertarABBAux(root.getIzq(), valor, steps, meta, root, "left"));
        } else if (cmp > 0) {
            steps.push({
                type: "goRight",
                from: root.getId(),
                to: root.getDer()?.getId() ?? null
            });
            root.setDer(this.insertarABBAux(root.getDer(), valor, steps, meta, root, "right"));
        } else {
            meta.inserted = false;
            meta.targetNode = root;
            meta.parent = parentNode;
        }

        steps.push({ type: "return", from: root.getId(), to: parentNode?.getId() ?? null, via: via ?? "root" });
        return root;
    }

    /**
     * Método auxiliar que elimina el nodo correspondiente al elemento proporcionado en el subárbol dado,
     * aplicando las reglas del árbol binario de búsqueda.
     * @param root Nodo raíz del subárbol actual
     * @param valor Elemento a eliminar.
     * @param steps Arreglo para acumular los pasos de eliminación para la visualización del algoritmo.
     * @param meta Objeto de metadatos para rastrear el resultado de la eliminación y la información del nodo objetivo.
     * @param parentNode Nodo padre del nodo actual.
     * @param via Dirección desde el nodo padre al nodo actual ("left", "right", o "root" para la raíz).
     * @returns Nodo raíz del subárbol actualizado tras la eliminación.
     */
    private eliminarABBAux(
        root: NodoBin<T> | null,
        valor: T,
        steps: BSTDeleteStep[],
        meta: BSTDeleteMeta<T>,
        parentNode: NodoBin<T> | null = null,
        via: "left" | "right" | "root" = "root"
    ): NodoBin<T> | null {
        steps.push({
            type: "checkNull",
            at: root?.getId() ?? null,
            isNull: root === null
        });
        if (root === null) {
            steps.push({ type: "return", from: null, to: parentNode?.getId() ?? null, via: via });
            return null;
        }

        const cmp = this.compare(valor, root.getInfo());
        steps.push({ type: "compare", at: root.getId(), cmp: cmp < 0 ? -1 : cmp > 0 ? 1 : 0 });
        if (cmp < 0) {
            steps.push({
                type: "goLeft",
                from: root.getId(),
                to: root.getIzq()?.getId() ?? null
            });
            root.setIzq(this.eliminarABBAux(root.getIzq(), valor, steps, meta, root, "left"));
        } else if (cmp > 0) {
            steps.push({
                type: "goRight",
                from: root.getId(),
                to: root.getDer()?.getId() ?? null
            });
            root.setDer(this.eliminarABBAux(root.getDer(), valor, steps, meta, root, "right"));
        } else {
            steps.push({ type: "match", at: root.getId() });
            meta.deleted = true;
            meta.targetNode = root;
            meta.parent = parentNode;

            const izq = root.getIzq();
            const der = root.getDer();

            if (!izq) {
                meta.replacement = der;
                meta.replacementSide = "right";
                steps.push({ type: "return", from: root.getId(), to: parentNode?.getId() ?? null, via: via });
                return der;
            }

            if (!der) {
                meta.replacement = izq;
                meta.replacementSide = "left";
                steps.push({ type: "return", from: root.getId(), to: parentNode?.getId() ?? null, via: via });
                return izq;
            }

            let sucPadre = root;
            let succ = der;
            while (succ.getIzq()) {
                meta.pathToSuccessorIds.push(succ.getId());
                sucPadre = succ;
                succ = succ.getIzq()!;
            }
            meta.pathToSuccessorIds.push(succ.getId());
            meta.successor = succ;
            meta.successorParent = sucPadre;

            const reemplazo = succ.getDer();
            meta.replacement = reemplazo;

            root.setInfo(succ.getInfo());
            if (sucPadre.getIzq() === succ) {
                sucPadre.setIzq(reemplazo);
            } else {
                sucPadre.setDer(reemplazo);
            }
        }

        steps.push({ type: "return", from: root.getId(), to: parentNode?.getId() ?? null, via: via });
        return root;
    }

    /**
     * Método auxiliar que busca el nodo correspondiente al elemento proporcionado en el subárbol dado, 
     * aplicando las reglas del árbol binario de búsqueda.
     * @param root Nodo raíz del subárbol actual
     * @param valor Elemento a buscar.
     * @param steps Arreglo para acumular los pasos de búsqueda para la visualización del algoritmo.
     * @param meta Objeto de metadatos para rastrear el resultado de la búsqueda y la información del nodo objetivo.
     * @param parentNode Nodo padre del nodo actual.
     * @param via Dirección desde el nodo padre al nodo actual ("left", "right", o "root" para la raíz).
     * @returns true si el elemento existe en el subárbol, false en caso contrario.
     */
    private buscarABBAux(
        root: NodoBin<T> | null,
        valor: T,
        steps: BSTSearchStep[],
        meta: BSTSearchMeta<T>,
        parentNode: NodoBin<T> | null = null,
        via: "left" | "right" | "root" = "root"
    ): boolean {
        steps.push({
            type: "checkNull",
            at: root?.getId() ?? null,
            isNull: root === null
        });
        if (root === null) {
            steps.push({ type: "return", from: null, to: parentNode?.getId() ?? null, via: via });
            return false;
        };

        const cmp = this.compare(valor, root.getInfo());
        steps.push({ type: "compare", at: root.getId(), cmp: cmp < 0 ? -1 : cmp > 0 ? 1 : 0 });
        if (cmp < 0) {
            steps.push({
                type: "goLeft",
                from: root.getId(),
                to: root.getIzq()?.getId() ?? null
            });

            const res = this.buscarABBAux(root.getIzq(), valor, steps, meta, root, "left");
            steps.push({ type: "return", from: root.getId(), to: parentNode?.getId() ?? null, via: via });
            return res
        } else if (cmp > 0) {
            steps.push({
                type: "goRight",
                from: root.getId(),
                to: root.getDer()?.getId() ?? null,

            });

            const res = this.buscarABBAux(root.getDer(), valor, steps, meta, root, "right");
            steps.push({ type: "return", from: root.getId(), to: parentNode?.getId() ?? null, via: via });
            return res;
        } else {
            steps.push({
                type: "match",
                at: root.getId()
            });
            meta.targetNode = root;

            steps.push({ type: "return", from: root.getId(), to: parentNode?.getId() ?? null, via: via });
            return true;
        }
    }

    /**
     * Método auxiliar que clona un árbol binario de búsqueda iniciando desde el nodo raíz dado.
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