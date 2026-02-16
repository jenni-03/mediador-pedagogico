// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { BinaryTreeDeleteOutput, BinaryTreeGetStep, BinaryTreeInsertOutput, BinaryTreeLevelOutput, BinaryTreeLevelStep, BinaryTreeSearchOutput, BinaryTreeTraversalStep, BinaryTreeTraverseOutput, EqualityFn, HierarchyNodeData } from "../utils/types";
import { DomainError } from "../error/DomainError";
import { NodoBin } from "../nodes/NodoBin";
import { Cola } from "./Cola";

/**
 * Clase que representa el funcionamiento de un árbol binario.
 */
export class ArbolBinario<T> {
    // Nodo raíz del árbol binario.
    private raiz: NodoBin<T> | null;

    // Contador para limitar el número de nodos.
    private tamanio: number;

    // Limite de nodos.
    protected readonly MAX_NODOS = 30;

    /**
     * Constructor de la clase ArbolBinario.
     */
    constructor(
        private equals: EqualityFn<T> = (a, b) => a === b
    ) {
        this.raiz = null;
        this.tamanio = 0;
    }

    /**
     * Método que inserta un nuevo elemento en el árbol binario como hijo izquierdo del elemento padre dado.
     * @param padre Elemento al que se añadirá el hijo.
     * @param info Elemento a insertar.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la búsqueda 
     *    del nodo padre (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `parent`: Nodo padre donde se intentó insertar el nuevo nodo. Será `null` en 2 casos:
     *    1. Si el árbol estaba vacío.
     *    2. Si no se encontró el nodo padre indicado o si el nodo padre ya tenía un hijo izquierdo.
     * 
     * - `targetNode`: Nodo correspondiente al elemento proporcionado.
     * 
     * - `inserted`: Booleano que indica si el elemento fue insertado.
     */
    public insertarHijoIzq(padre: T, info: T): BinaryTreeInsertOutput<T> {
        if (this.tamanio >= this.MAX_NODOS) {
            throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
        }

        if (this.esta(this.getRaiz(), info)) {
            throw new Error(`No fue posible insertar el nodo: El elemento ya existe en el árbol.`);
        }

        const nuevoNodo = new NodoBin(info);
        let nodoPadre: NodoBin<T> | null = null;
        let steps: BinaryTreeGetStep[] = [];
        if (this.esVacio()) {
            this.setRaiz(nuevoNodo);
        } else {
            const result = this.get(padre);
            nodoPadre = result.node;
            steps = result.steps;

            if (nodoPadre === null || nodoPadre.getIzq() !== null) {
                return { steps, parent: nodoPadre, targetNode: nuevoNodo, inserted: false };
            }
            nodoPadre.setIzq(nuevoNodo);
        }

        this.tamanio++;
        return { steps, parent: nodoPadre, targetNode: nuevoNodo, inserted: true };
    }

    /**
     * Método que inserta un nuevo elemento en el árbol binario como hijo derecho del elemento padre dado.
     * @param padre Elemento al que se añadirá el hijo.
     * @param info Elemento a insertar.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la búsqueda 
     *    del nodo padre (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `parent`: Nodo padre donde se intentó insertar el nuevo nodo. Será `null` en 2 casos:
     *    1. Si el árbol estaba vacío.
     *    2. Si no se encontró el nodo padre indicado o si el nodo padre ya tenía un hijo derecho.
     * 
     * - `targetNode`: Nodo correspondiente al elemento proporcionado.
     * 
     * - `inserted`: Booleano que indica si el elemento fue insertado.
     */
    public insertarHijoDer(padre: T, info: T): BinaryTreeInsertOutput<T> {
        if (this.tamanio >= this.MAX_NODOS) {
            throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
        }

        if (this.esta(this.getRaiz(), info)) {
            throw new Error(`No fue posible insertar el nodo: El elemento ya existe en el árbol.`);
        }

        const nuevoNodo = new NodoBin(info);
        let nodoPadre: NodoBin<T> | null = null;
        let steps: BinaryTreeGetStep[] = [];
        if (this.esVacio()) {
            this.setRaiz(nuevoNodo);
        } else {
            const result = this.get(padre);
            nodoPadre = result.node;
            steps = result.steps;

            if (nodoPadre === null || nodoPadre.getDer() !== null) {
                return { steps, parent: nodoPadre, targetNode: nuevoNodo, inserted: false };
            }
            nodoPadre.setDer(nuevoNodo);
        }

        this.tamanio++;
        return { steps, parent: nodoPadre, targetNode: nuevoNodo, inserted: true };
    }

    /**
     * Método que elimina el elemento específicado del árbol binario.
     * @param info Elemento a eliminar.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la búsqueda 
     *    del nodo padre (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `parent`: Nodo padre del nodo eliminado. Será `null` en 2 casos:
     *    1. Si el nodo eliminado era la raíz.
     *    2. Si el elemento no se encontró en el árbol.
     * 
     * - `targetNode`: Nodo correspondiente al elemento proporcionado. Será `null` si el elemento no se encuentra en el árbol.
     * 
     * - `targetSide`: Dirección del nodo correspondiente al elemento proporcionado ("left", "right"). 
     *    Será `null` si el elemento no se encuentra en el árbol o si el nodo cuenta con 2 hijos.
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
     * - `deleted`: Booleano que indica si el elemento fue eliminado.
     */
    public eliminar(info: T): BinaryTreeDeleteOutput<T> {
        if (this.esVacio()) {
            throw new DomainError("No fue posible eliminar el nodo: El árbol se encuentra vacío (cantidad de nodos: 0).", "DELETE_EMPTY");
        }

        const { parent: nodoPadre, steps } = this.getPadre(info);
        const pathToSuccessorIds: string[] = [];

        let nodo: NodoBin<T> | null = null;
        let lado: "left" | "right" | null = null;
        if (nodoPadre === null) {
            nodo = this.getRaiz();
        } else {
            nodo = nodoPadre.getIzq();
            lado = "left";
            if (!nodo || !this.equals(nodo.getInfo(), info)) {
                nodo = nodoPadre.getDer();
                lado = "right";
            }
        }

        if (!nodo || !this.equals(nodo.getInfo(), info)) {
            return { steps, parent: nodoPadre, targetNode: nodo!, targetSide: null, pathToSuccessorIds, successor: null, successorParent: null, replacement: null, deleted: false };
        }
        const izq = nodo.getIzq();
        const der = nodo.getDer();

        // CASO 1 – nodo hoja
        let reemplazo: NodoBin<T> | null = null;
        if (!izq && !der) {
            this.reemplazarHijo(nodoPadre, nodo, null);
            this.tamanio--;
            return { steps, parent: nodoPadre, targetNode: nodo, targetSide: lado, pathToSuccessorIds, successor: null, successorParent: null, replacement: reemplazo, deleted: true };
        }

        // CASO 2 – un solo hijo
        if (!izq || !der) {
            reemplazo = izq ?? der;
            this.reemplazarHijo(nodoPadre, nodo, reemplazo);
            this.tamanio--;
            return { steps, parent: nodoPadre, targetNode: nodo, targetSide: lado, pathToSuccessorIds, successor: null, successorParent: null, replacement: reemplazo, deleted: true };
        }

        // CASO 3 – dos hijos
        let sucPadre = nodo;
        let succ = der;
        while (succ.getIzq()) {
            pathToSuccessorIds.push(succ.getId());
            sucPadre = succ;
            succ = succ.getIzq()!;
        }
        pathToSuccessorIds.push(succ.getId());

        reemplazo = succ.getDer();
        nodo.setInfo(succ.getInfo());
        this.reemplazarHijo(sucPadre, succ, reemplazo);

        this.tamanio--;
        return { steps, parent: nodoPadre, targetNode: nodo, targetSide: lado, pathToSuccessorIds, successor: succ, successorParent: sucPadre, replacement: reemplazo, deleted: true };
    }

    /**
     * Método que comprueba la existencia del elemento especificado en el árbol binario.
     * @param info Elemento a buscar
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la búsqueda 
     *    del nodo (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `targetNode`: Nodo correspondiente al elemento proporcionado. Será `null` si no fue encontrado.  
     * 
     * - `found`: Booleano que indica si el nodo fue encontrado.
     */
    public buscar(info: T): BinaryTreeSearchOutput<T> {
        const { node, steps } = this.get(info);
        return {
            steps,
            targetNode: node,
            found: node !== null
        };
    }

    /**
     * Método que obtiene todos los nodos hojas presentes en el árbol binario.
     * @returns Arreglo que contiene todos los nodos hoja presentes en el árbol.
     */
    public getHojas(): NodoBin<T>[] {
        const hojas: NodoBin<T>[] = [];
        this.getArrayHojas(this.getRaiz(), hojas);
        return hojas;
    }

    /**
     * Método que cuenta el número de nodos hoja presentes en el árbol binario.
     * @returns Número de nodos hoja presentes en el árbol.
     */
    public contarHojas(): number {
        return this.contarHojasAux(this.getRaiz());
    }

    /**
     * Método que calcula el peso total (número de nodos) del árbol binario.
     * @returns Número total de nodos del árbol.
     */
    public getPeso(): number {
        return this.getPesoAux(this.getRaiz());
    }

    /**
     * Método que vacia el árbol binario.
     */
    public vaciar(): void {
        this.setRaiz(null);
        this.tamanio = 0;
    }

    /**
     * Método que verifica si el árbol binario está vacío.
     * @returns true si se encuentra vacío, false en caso contrario.
     */
    public esVacio(): boolean {
        return this.raiz === null;
    }

    /**
     * Método que calcula la altura del árbol binario.
     * @returns Altura del árbol.
     */
    public getAltura(): number {
        return this.getAlturaAux(this.getRaiz());
    }

    /**
     * Método que realiza el recorrido inorden del árbol binario.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante el recorrido 
     *    del árbol (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `visited`: Arreglo de nodos visitados durante el recorrido en secuencia inorden.
     */
    public inOrden(): BinaryTreeTraverseOutput<T> {
        const steps: BinaryTreeTraversalStep[] = [];
        const nodos: NodoBin<T>[] = [];
        this.getInOrden(this.getRaiz(), nodos, steps);
        return { steps, visited: nodos };
    }

    /**
     * Método que realiza el recorrido preorden del árbol binario.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante el recorrido 
     *    del árbol (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `visited`: Arreglo de nodos visitados durante el recorrido en secuencia preorden.
     */
    public preOrden(): BinaryTreeTraverseOutput<T> {
        const steps: BinaryTreeTraversalStep[] = [];
        const nodos: NodoBin<T>[] = [];
        this.getPreOrden(this.getRaiz(), nodos, steps);
        return { steps, visited: nodos };
    }

    /**
     * Método que realiza el recorrido postorden del árbol binario.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante el recorrido 
     *    del árbol (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `visited`: Arreglo de nodos visitados durante el recorrido en secuencia postorden.
     */
    public postOrden(): BinaryTreeTraverseOutput<T> {
        const steps: BinaryTreeTraversalStep[] = [];
        const nodos: NodoBin<T>[] = [];
        this.getPostOrden(this.getRaiz(), nodos, steps);
        return { steps, visited: nodos };
    }

    /**
     * Método que realiza el recorrido por niveles del árbol binario.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante el recorrido 
     *    del árbol (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `visited`: Arreglo de nodos visitados durante el recorrido por niveles.
     */
    public getNodosPorNiveles(): BinaryTreeLevelOutput<T> {
        const steps: BinaryTreeLevelStep[] = [];
        const nodos: NodoBin<T>[] = [];

        if (!this.esVacio()) {
            const cola = new Cola<NodoBin<T>>();
            cola.encolar(this.getRaiz()!);
            steps.push({ type: "enqueue", at: this.getRaiz()!.getId(), origin: "root" });

            let x: NodoBin<T>;
            while (!cola.esVacia()) {
                steps.push({ type: "checkEmpty", isEmpty: cola.esVacia() });

                x = cola.decolar().getValor();
                steps.push({ type: "dequeue", at: x.getId() });

                nodos.push(x);
                steps.push({ type: "visit", at: x.getId() });

                const izq = x.getIzq();
                steps.push({ type: "checkChild", side: "left" });
                if (izq !== null) {
                    cola.encolar(izq);
                    steps.push({ type: "enqueue", at: izq.getId(), origin: "left" });
                }

                const der = x.getDer();
                steps.push({ type: "checkChild", side: "right" });
                if (der !== null) {
                    cola.encolar(der);
                    steps.push({ type: "enqueue", at: der.getId(), origin: "right" });
                }
            }
        }

        return { steps, visited: nodos };
    }

    /**
     * Método que obtiene la raíz del árbol binario.
     * @returns Nodo raíz del árbol o null si está vacío.
     */
    public getRaiz(): NodoBin<T> | null {
        return this.raiz;
    }

    /**
     * Método que modifica la raíz del árbol binario.
     * @param raiz Nuevo nodo raíz del árbol binario.
     */
    public setRaiz(raiz: NodoBin<T> | null) {
        this.raiz = raiz;
    }

    /**
     * Método que convierte el árbol binario en una estructura jerárquica.
     * @returns Representación jerárquica del árbol o null si está vacío.
     */
    public convertirEstructuraJerarquica() {
        if (this.esVacio()) return null;
        return this.toHierarchy(this.getRaiz()!);
    }

    /**
     * Método que crea una copia profunda del árbol binario.
     * @returns Retorna un nuevo árbol correspondiente a una copia profunda del árbol actual.
     */
    public clonar(): ArbolBinario<T> {
        const nuevoArbol = new ArbolBinario<T>(this.equals);
        nuevoArbol.setRaiz(this.clonarAB(this.getRaiz()));
        nuevoArbol.tamanio = this.tamanio;
        return nuevoArbol;
    }

    /**
     * Método que obtiene el nodo padre del elemento proporcionado.
     * @param info Elemento a buscar.
     * @returns Objeto con la siguiente información:
     * 
     * - `parent`: Nodo padre encontrado si existe, de lo contrario null.
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la búsqueda
     *    del nodo (comprobaciones, visitas, movimientos y retornos).
     */
    protected getPadre(info: T): { parent: NodoBin<T> | null, steps: BinaryTreeGetStep[] } {
        const steps: BinaryTreeGetStep[] = [];
        if (!this.raiz || this.equals(this.raiz.getInfo(), info)) {
            return { parent: null, steps };
        }
        const parent = this.getPadreAux(this.getRaiz(), info, steps);
        return { parent, steps };
    }

    /**
     * Método que obtiene el contador de nodos del árbol.
     * @returns Cantidad de nodos existentes en el árbol.
     */
    protected getTamanio() {
        return this.tamanio;
    }

    /**
     * Método que modifica el valor del contador de nodos del árbol.
     * @param tamanio Nuevo valor para el contador de nodos del árbol.
     */
    protected setTamanio(tamanio: number) {
        this.tamanio = tamanio;
    }

    /**
     * Método que crea un nodo marcador de posición para la visualización del árbol binario.
     * @param parent Nodo padre para el que se crea el marcador de posición.
     * @param side Especifica si el marcador de posición es para el hijo izquierdo o derecho.
     * @returns Objeto `HierarchyNodeData<T>` que representa un nodo marcador de posición.
     */
    protected createPlaceholder(parent: NodoBin<T>, side: "left" | "right"): HierarchyNodeData<T> {
        return {
            id: `${parent.getId()}-ph${side === "left" ? "L" : "R"}`,
            isPlaceholder: true
        };
    }

    /**
     * Método auxiliar que crea una copia profunda del árbol binario dado un nodo raíz.
     * @param root Nodo raíz del árbol subárbol actual a clonar.
     * @returns Nodo raíz del árbol clonado.
     */
    private clonarAB(root: NodoBin<T> | null): NodoBin<T> | null {
        if (root === null) return null;

        const nuevoNodo = new NodoBin(root.getInfo(), root.getId());
        nuevoNodo.setIzq(this.clonarAB(root.getIzq()));
        nuevoNodo.setDer(this.clonarAB(root.getDer()));

        return nuevoNodo;
    }

    /**
     * Método auxiliar que transforma el árbol binario en una estructura jerárquica.
     * @param root Nodo raíz del árbol.
     * @returns Estructura jerárquica representativa del árbol.
     */
    private toHierarchy(root: NodoBin<T>): HierarchyNodeData<T> {
        const left = root.getIzq() ? this.toHierarchy(root.getIzq()!) : null;
        const right = root.getDer() ? this.toHierarchy(root.getDer()!) : null;

        let children: HierarchyNodeData<T>[] | undefined;

        if (left && right) {
            children = [left, right];
        } else if (left && !right) {
            children = [left, this.createPlaceholder(root, "right")];
        } else if (!left && right) {
            children = [this.createPlaceholder(root, "left"), right];
        } else {
            children = undefined;
        }

        return {
            id: root.getId(),
            value: root.getInfo(),
            children
        }
    }

    /**
     * Método auxiliar que realiza el recorrido inorden en el subárbol dado.
     * @param root Nodo raíz del subárbol actual.
     * @param visited Arreglo donde se almacenan los nodos visitados en secuencia inorden.
     * @param steps Arreglo para acumular los pasos del recorrido realizados durante la operación.
     * @param parentId Id del nodo padre del nodo actual.
     * @param via Dirección desde el nodo padre al nodo actual ("left", "right", o "root" para la raíz).
     */
    private getInOrden(
        root: NodoBin<T> | null,
        visited: NodoBin<T>[],
        steps: BinaryTreeTraversalStep[],
        parentId: string | null = null,
        via: "left" | "right" | "root" = "root"
    ) {
        steps.push({
            type: "checkNull",
            at: root?.getId() ?? null,
            isNull: root === null
        });
        if (root === null) {
            steps.push({ type: "return", from: null, to: parentId, via });
            return;
        };

        const izq = root.getIzq();
        steps.push({
            type: "goLeft",
            from: root.getId(),
            to: izq?.getId() ?? null
        });
        this.getInOrden(root.getIzq(), visited, steps, root.getId(), "left");

        steps.push({ type: "visit", at: root.getId() });
        visited.push(root);

        const der = root.getDer();
        steps.push({
            type: "goRight",
            from: root.getId(),
            to: der?.getId() ?? null
        });
        this.getInOrden(root.getDer(), visited, steps, root.getId(), "right");

        steps.push({ type: "return", from: root.getId(), to: parentId, via });
    }

    /**
     * Método auxiliar que realiza el recorrido preorden en el subárbol dado.
     * @param root Nodo raíz del subárbol actual.
     * @param visited Arreglo donde se almacenan los nodos visitados en secuencia preorden.
     * @param steps Arreglo para acumular los pasos del recorrido realizados durante la operación.
     * @param parentId Id del nodo padre del nodo actual.
     * @param via Dirección desde el nodo padre al nodo actual ("left", "right", o "root" para la raíz).
     */
    private getPreOrden(
        root: NodoBin<T> | null,
        visited: NodoBin<T>[],
        steps: BinaryTreeTraversalStep[],
        parentId: string | null = null,
        via: "left" | "right" | "root" = "root"
    ) {
        steps.push({
            type: "checkNull",
            at: root?.getId() ?? null,
            isNull: root === null
        });
        if (root === null) {
            steps.push({ type: "return", from: null, to: parentId, via });
            return;
        }

        steps.push({ type: "visit", at: root.getId() });
        visited.push(root);

        const izq = root.getIzq();
        steps.push({
            type: "goLeft",
            from: root.getId(),
            to: izq?.getId() ?? null
        });
        this.getPreOrden(root.getIzq(), visited, steps, root.getId(), "left");

        const der = root.getDer();
        steps.push({
            type: "goRight",
            from: root.getId(),
            to: der?.getId() ?? null
        });
        this.getPreOrden(root.getDer(), visited, steps, root.getId(), "right");

        steps.push({ type: "return", from: root.getId(), to: parentId, via });
    }

    /**
     * Método auxiliar que realiza el recorrido postorden en el subárbol dado.
     * @param root Nodo raíz del subárbol actual.
     * @param visited Arreglo donde se almacenan los nodos visitados en secuencia postorden.
     * @param steps Arreglo para acumular los pasos del recorrido realizados durante la operación.
     * @param parentId Id del nodo padre del nodo actual.
     * @param via Dirección desde el nodo padre al nodo actual ("left", "right", o "root" para la raíz).
     */
    private getPostOrden(
        root: NodoBin<T> | null,
        visited: NodoBin<T>[],
        steps: BinaryTreeTraversalStep[],
        parentId: string | null = null,
        via: "left" | "right" | "root" = "root"
    ) {
        steps.push({
            type: "checkNull",
            at: root?.getId() ?? null,
            isNull: root === null
        });
        if (root === null) {
            steps.push({ type: "return", from: null, to: parentId, via });
            return;
        }

        const izq = root.getIzq();
        steps.push({
            type: "goLeft",
            from: root.getId(),
            to: izq?.getId() ?? null
        });
        this.getPostOrden(root.getIzq(), visited, steps, root.getId(), "left");

        const der = root.getDer();
        steps.push({
            type: "goRight",
            from: root.getId(),
            to: der?.getId() ?? null
        });
        this.getPostOrden(root.getDer(), visited, steps, root.getId(), "right");

        steps.push({ type: "visit", at: root.getId() });
        visited.push(root);

        steps.push({ type: "return", from: root.getId(), to: parentId, via });
    }

    /**
     * Método auxiliar que calcula la altura del árbol binario a partir del nodo raíz dado.
     * @param root Nodo raíz del subárbol actual.
     * @returns Altura del árbol enraizado en el nodo dado.
     */
    private getAlturaAux(root: NodoBin<T> | null): number {
        if (!root) return 0
        const hi = this.getAlturaAux(root.getIzq())
        const hd = this.getAlturaAux(root.getDer())
        return 1 + Math.max(hi, hd)
    }

    /**
     * Método auxiliar que calcula el número total de nodos (peso) presentes en el árbol binario.
     * @param root Nodo raíz del subárbol actual.
     * @returns Número total de nodos presentes en el árbol.
     */
    private getPesoAux(root: NodoBin<T> | null): number {
        if (root === null) {
            return 0;
        }
        return this.getPesoAux(root.getIzq()) + 1 + this.getPesoAux(root.getDer());
    }

    /**
     * Método auxiliar que realiza una búsqueda en el subárbol dado para
     * obtener el nodo padre nodo cuyo hijo izquierdo o derecho corresponde al elemento proporcionado.
     * @param root Nodo raíz del subárbol actual donde se va a buscar.
     * @param info Elemento a buscar.
     * @param steps Arreglo para acumular los pasos de búsqueda realizados durante la operación.
     * @param parentId Id del nodo padre del nodo actual.
     * @param via Dirección desde el nodo padre al nodo actual ("left", "right", or "root" para la raíz).
     * @returns Nodo padre encontrado o null si no existe.
     */
    private getPadreAux(
        root: NodoBin<T> | null,
        info: T,
        steps: BinaryTreeGetStep[],
        parentId: string | null = null,
        via: "left" | "right" | "root" = "root"
    ): NodoBin<T> | null {
        steps.push({
            type: "checkNull",
            at: root?.getId() ?? null,
            isNull: root === null
        });
        if (root === null) {
            steps.push({ type: "return", from: null, to: parentId, via, found: false });
            return null;
        }

        const izq = root.getIzq();
        const der = root.getDer();

        const izqMatch = izq !== null && this.equals(izq.getInfo(), info);
        const derMatch = der !== null && this.equals(der.getInfo(), info);
        steps.push({ type: "match", at: root.getId(), found: izqMatch || derMatch });
        if (izqMatch || derMatch) {
            steps.push({ type: "return", from: root.getId(), to: parentId, via, found: true });
            return root;
        }

        steps.push({
            type: "goLeft",
            from: root.getId(),
            to: izq?.getId() ?? null
        });
        const resIzq = this.getPadreAux(izq, info, steps, root.getId(), "left");
        steps.push({
            type: "checkLeftResult",
            from: root.getId(),
            found: resIzq !== null
        });
        if (resIzq !== null) {
            steps.push({ type: "return", from: root.getId(), to: parentId, via, found: true });
            return resIzq;
        };

        steps.push({
            type: "goRight",
            from: root.getId(),
            to: der?.getId() ?? null
        });
        const resDer = this.getPadreAux(der, info, steps, root.getId(), "right");
        steps.push({ type: "return", from: root.getId(), to: parentId, via, found: resDer !== null });
        return resDer;
    }

    /**
     * Método auxiliar que verifica si un nodo es una hoja.
     * @param nodo Nodo a verificar.
     * @returns True si sus 2 hijos son nulos.
     */
    private esHoja(nodo: NodoBin<T> | null): boolean {
        return nodo !== null && nodo.getIzq() === null && nodo.getDer() === null;
    }

    /**
     * Método auxiliar que cuenta el número de nodos hoja presentes en el árbol binario.
     * @param root Nodo raíz del subárbol actual.
     * @returns Número de nodos hoja presentes en el árbol binario.
     */
    private contarHojasAux(root: NodoBin<T> | null): number {
        if (root === null) return 0;

        if (this.esHoja(root)) {
            return 1;
        }

        const chi = this.contarHojasAux(root.getIzq());
        const chd = this.contarHojasAux(root.getDer());
        return chi + chd;
    }

    /**
     * Método auxiliar que recolecta todas las hojas presentes en el árbol binario.
     * @param root Nodo raíz del sunárbol actual.
     * @param hojas Arreglo para almacenar los nodos hoja ubicados.
     * @returns Arreglo que contiene todos los nodos hoja encontrados en el árbol.
     */
    private getArrayHojas(root: NodoBin<T> | null, hojas: NodoBin<T>[] = []): NodoBin<T>[] {
        if (!root) return hojas;

        if (this.esHoja(root)) {
            hojas.push(root);
        } else {
            this.getArrayHojas(root.getIzq(), hojas);
            this.getArrayHojas(root.getDer(), hojas);
        }

        return hojas;
    }

    /**
     * Método auxiliar que reemplaza un hijo de un nodo padre por otro nodo.
     * @param padre Nodo padre.
     * @param antiguo Nodo hijo a reemplazar.
     * @param nuevo Nuevo nodo hijo.
     */
    private reemplazarHijo(padre: NodoBin<T> | null, antiguo: NodoBin<T>, nuevo: NodoBin<T> | null) {
        if (padre === null) this.setRaiz(nuevo);
        else if (padre.getIzq() === antiguo) padre.setIzq(nuevo);
        else padre.setDer(nuevo);
    }

    /**
     * Método auxiliar que verifica la existencia de un nodo dentro del dentro del árbol binario.
     * @param root Nodo raíz del subárbol actual donde se va a buscar.
     * @param info Info del nodo a buscar 
     * @returns true si el elemento existe en el árbol, false en caso contrario.
     */
    private esta(root: NodoBin<T> | null, info: T): boolean {
        if (root === null) return false;
        if (this.equals(root.getInfo(), info)) return true;
        return this.esta(root.getIzq(), info) || this.esta(root.getDer(), info);
    }

    /**
     * Método auxiliar que obtiene el nodo correspondiente al elemento proporcionado.
     * @param info Elemento a obtener.
     * @returns Objeto con la siguiente información:
     * 
     *  - `node`: Nodo encontrado si existe, de lo contrario null.
     * 
     *  - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la búsqueda
     *    del nodo (comprobaciones, visitas, movimientos y retornos).
     */
    private get(info: T): { node: NodoBin<T> | null, steps: BinaryTreeGetStep[] } {
        const steps: BinaryTreeGetStep[] = [];
        const node = this.getNodo(this.getRaiz(), info, steps);
        return { node, steps }
    }

    /**
     * Método auxiliar que realiza una búsqueda en el subárbol dado para
     * obtener el primer nodo correspondiente al elemento proporcionado.
     * @param root Nodo raíz del subárbol actual donde se va a buscar.
     * @param info Elemento a buscar.
     * @param steps Arreglo para acumular los pasos de búsqueda realizados durante la operación.
     * @param parentId Id del nodo padre del nodo actual.
     * @param via Dirección desde el nodo padre al nodo actual ("left", "right", or "root" para la raíz).
     * @returns Nodo encontrado o null si no existe.
     */
    private getNodo(
        root: NodoBin<T> | null,
        info: T,
        steps: BinaryTreeGetStep[],
        parentId: string | null = null,
        via: "left" | "right" | "root" = "root"
    ): NodoBin<T> | null {
        steps.push({
            type: "checkNull",
            at: root?.getId() ?? null,
            isNull: root === null
        });
        if (root === null) {
            steps.push({ type: "return", from: null, to: parentId, via, found: false });
            return null;
        }

        const izq = root.getIzq();
        const der = root.getDer();

        const found = this.equals(root.getInfo(), info);
        steps.push({ type: "match", at: root.getId(), found });
        if (found) {
            steps.push({ type: "return", from: root.getId(), to: parentId, via, found: true });
            return root;
        }

        steps.push({
            type: "goLeft",
            from: root.getId(),
            to: izq?.getId() ?? null
        });
        const resIzq = this.getNodo(izq, info, steps, root.getId(), "left");
        steps.push({
            type: "checkLeftResult",
            from: root.getId(),
            found: resIzq !== null
        });
        if (resIzq !== null) {
            steps.push({ type: "return", from: root.getId(), to: parentId, via, found: true });
            return resIzq;
        }

        steps.push({
            type: "goRight",
            from: root.getId(),
            to: der?.getId() ?? null
        });
        const resDer = this.getNodo(der, info, steps, root.getId(), "right");
        steps.push({ type: "return", from: root.getId(), to: parentId, via, found: resDer !== null });
        return resDer;
    }
}