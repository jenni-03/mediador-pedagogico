// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { BinaryTreeLevelOutput, BinaryTreeTraverseOutput, Comparator, HierarchyNodeData, RotationStep, RotationType, SplayDeleteOutput, SplayDeleteStep, SplayInsertOutput, SplayInsertStep, SplayRotationTag, SplaySearchOutput, SplaySearchStep, SplayTrace } from "../utils/types";
import { NodoSplay } from "../nodes/NodoSplay";
import { defaultComparator } from "../utils/treeUtils";
import { ArbolBinarioBusqueda } from "./ArbolBinarioBusqueda";
import { DomainError } from "../error/DomainError";

/** 
 * Clase que representa el funcionamiento de un árbol Splay.
 */
export class ArbolSplay<T> extends ArbolBinarioBusqueda<T> {

    private splayOperationTrace: SplayTrace<T> | null = null;

    /**
     * Constructor de la clase ArbolSplay.
     */
    constructor(
        compare: Comparator<T> = defaultComparator
    ) {
        super(compare);
    }

    /**
     * Método que inserta un nuevo elemento en el árbol Splay.
     * - Si el elemento ya existe, se aplica splay del nodo encontrado para moverlo a la raíz.
     * - Si no existe, se inserta como BST y luego se aplica splay del nuevo nodo para moverlo a la raíz.
     * 
     * @param valor Elemento a insertar o acceder.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la inserción 
     *    (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `parent`: Nodo padre bajo el cual se insertó el nuevo nodo. Será `null` en 2 casos:
     *    1. Si el elemento ya existía en el árbol.
     *    2. Si el nuevo nodo se insertó como raíz.
     * 
     * - `targetNode`: Nodo correspondiente al elemento proporcionado (nuevo o ya existente).
     * 
     * - `inserted`: Booleano que indica si el elemento fue insertado.
     */
    public insertarSplay(valor: T): SplayInsertOutput<T> {
        if (super.getTamanio() >= this.MAX_NODOS) {
            throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
        }

        // Inicializar la traza de seguimiento del estado del árbol durante la operación
        this.splayOperationTrace = {
            rotations: [],
            hierarchies: {
                bst: null,
                mids: []
            }
        }

        const steps: SplayInsertStep[] = [];

        // Inserción BST estándar
        let p: NodoSplay<T> | null = null;
        let curr: NodoSplay<T> | null = this.getRaiz();

        while (curr !== null) {
            steps.push({ type: "visit", at: curr.getId() });

            const cmp = this.compare(valor, curr.getInfo());
            steps.push({ type: "compare", at: curr.getId(), cmp: cmp < 0 ? -1 : cmp > 0 ? 1 : 0 });
            if (cmp === 0) {
                steps.push({ type: "splayCall", xId: curr.getId(), reason: "search" });
                this.splay(curr, steps);

                steps.push({ type: "return" });
                return { steps, parent: null, targetNode: curr, inserted: false };
            }

            p = curr;
            const next = cmp < 0 ? curr.getIzq() : curr.getDer();
            steps.push({ type: "advance", from: curr.getId(), to: next?.getId() ?? null, dir: cmp < 0 ? "L" : "R" });
            curr = next;
        }
        steps.push({ type: "visit", at: null });

        // Creación e inserción del nuevo nodo
        const nuevo = new NodoSplay<T>(valor);
        steps.push({ type: "createNode", id: nuevo.getId() });
        nuevo.setPadre(p);

        if (!p) {
            steps.push({ type: "attachNode", parentId: null, side: "root" });
            this.setRaiz(nuevo);
        } else if (this.compare(valor, p.getInfo()) < 0) {
            steps.push({ type: "attachNode", parentId: null, side: "left" });
            p.setIzq(nuevo);
        } else {
            steps.push({ type: "attachNode", parentId: null, side: "right" });
            p.setDer(nuevo);
        }

        // Splay del nuevo nodo
        steps.push({ type: "splayCall", xId: nuevo.getId(), reason: "insertion" });
        this.splay(nuevo, steps);

        this.setTamanio(this.getTamanio() + 1);
        steps.push({ type: "return" });
        return { steps, parent: p, targetNode: nuevo, inserted: true };
    }

    /**
     * Método que elimina el elemento especificado del árbol Splay.
     * - Si el elemento existe, se aplica splay del nodo encontrado para moverlo a la raíz antes de ser eliminado.
     * - Si no existe, se aplica splay del último nodo visitado durante la búsqueda para moverlo a la raíz y no se elimina nada.
     * 
     * @param valor Elemento a eliminar.
     * @returns Objeto con la siguiente información:
     * 
     * - `searchSteps`: Arreglo de objetos que describen cada acción llevada a cabo durante la búsqueda 
     *    del nodo a eliminar (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `deleteSteps`: Arreglo de objetos que describen cada acción llevada a cabo durante la eliminación 
     *    (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `targetNode`: Nodo correspondiente al elemento proporcionado. Será el último nodo visitado
     *    durante la búsqueda si el elemento no se encuentra en el árbol.
     * 
     * - `deleted`: Booleano que indica si el elemento fue eliminado.
     * 
     * - `maxLeft`: Nodo máximo del subárbol izquierdo tras la operación de eliminación. Será `null` en 2 casos:
     *    1. Si el elemento a eliminar no existe en el árbol.
     *    2. Si el nodo correspondiente al elemento a eliminar no cuenta con un subárbol izquierdo.
     */
    public eliminarSplay(valor: T): SplayDeleteOutput<T> {
        if (this.esVacio()) {
            throw new DomainError("No fue posible eliminar el nodo: El árbol árbol se encuentra vacío (cantidad de nodos: 0).", "DELETE_EMPTY");
        }

        const deleteSteps: SplayDeleteStep[] = [];

        // Splay(valor)
        const { steps: searchSteps, targetNode: foundNode, found } = this.buscarSplay(valor);
        deleteSteps.push({ type: "checkFoundNode", at: foundNode?.getId() ?? null })
        if (!found) {
            deleteSteps.push({ type: "return" });
            return { searchSteps, deleteSteps, targetNode: foundNode!, deleted: false, maxLeft: null };
        }

        // Split por la raíz
        const root = this.getRaiz()!;
        const subIzq = root.getIzq();
        const subDer = root.getDer();
        deleteSteps.push({
            type: "split",
            root: root.getId(),
            leftId: subIzq?.getId() ?? null,
            rightId: subDer?.getId() ?? null
        });

        deleteSteps.push({ type: "detachParent", nodeId: subIzq?.getId() ?? null, parentId: root.getId(), side: "left" });
        if (subIzq) { subIzq.setPadre(null); }

        deleteSteps.push({ type: "detachParent", nodeId: subDer?.getId() ?? null, parentId: root.getId(), side: "right" });
        if (subDer) { subDer.setPadre(null); }

        // Descartar la raíz actual
        deleteSteps.push({ type: "cutChild", fromId: root.getId(), side: "right", childId: subDer?.getId() ?? null });
        root.setDer(null);

        deleteSteps.push({ type: "cutChild", fromId: root.getId(), side: "left", childId: subIzq?.getId() ?? null });
        root.setIzq(null);

        deleteSteps.push({ type: "setRoot", rootId: null, side: "null" });
        this.setRaiz(null);

        // Join (L, R)
        if (!subIzq) {
            deleteSteps.push({ type: "joinCase", kind: "leftNull" });

            deleteSteps.push({ type: "setRoot", rootId: subDer?.getId() ?? null, side: "right" });
            this.setRaiz(subDer);

            deleteSteps.push({ type: "decSize" });
            this.setTamanio(this.getTamanio() - 1);

            deleteSteps.push({ type: "return" });
            return { searchSteps, deleteSteps, targetNode: foundNode!, deleted: true, maxLeft: null };
        }

        // Splay del máximo de L dentro de L
        deleteSteps.push({ type: "joinCase", kind: "leftNotNull" });

        deleteSteps.push({ type: "setRoot", rootId: subIzq.getId(), side: "left" });
        this.setRaiz(subIzq);

        deleteSteps.push({ type: "traverseMaxLeftStart", rootId: subIzq.getId() });
        let maxIzq = this.getRaiz()!;
        while (maxIzq.getDer()) {
            const next = maxIzq.getDer()!;
            deleteSteps.push({ type: "moveToRight", fromId: maxIzq.getId(), toId: next.getId() });
            maxIzq = next;
        }
        deleteSteps.push({ type: "maxLeftFound", nodeId: maxIzq.getId() });

        deleteSteps.push({ type: "splayCall", xId: maxIzq.getId(), reason: "deletion" });
        this.splay(maxIzq, deleteSteps);

        // Colgamos R
        deleteSteps.push({ type: "attachRight", parentId: this.getRaiz()!.getId(), rightId: subDer?.getId() ?? null });
        this.getRaiz()!.setDer(subDer)

        if (subDer) {
            deleteSteps.push({ type: "setParent", nodeId: subDer.getId(), parentId: this.getRaiz()!.getId() });
            subDer.setPadre(this.getRaiz());
        }

        deleteSteps.push({ type: "decSize" });
        this.setTamanio(this.getTamanio() - 1);

        deleteSteps.push({ type: "return" });
        return { searchSteps, deleteSteps, targetNode: foundNode!, deleted: true, maxLeft: maxIzq };
    }

    /**
     * Método que comprueba la existencia del elemento especificado en el árbol Splay.
     * - Si el elemento existe, se aplica splay del nodo encontrado para moverlo a la raíz.
     * - Si no existe, se aplica splay del último nodo visitado durante la búsqueda para moverlo a la raíz.
     * 
     * @param valor Elemento a buscar.
     * @returns Objeto con la siguiente información:
     * 
     * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la búsqueda 
     *    (comprobaciones, visitas, movimientos y retornos).
     * 
     * - `targetNode`: Nodo resultante del proceso de búsqueda. Puede ser:
     *     1. Nodo correspondiente al elemento proporcionado si fue encontrado.
     *     2. Nodo donde la búsqueda se detuvo sin éxito (padre de la rama nula).
     *     3. `null` si el árbol está vacío.
     *  
     * - `found`: Booleano que indica si el nodo fue encontrado.
     */
    public buscarSplay(valor: T): SplaySearchOutput<T> {
        if (this.esVacio()) return { steps: [], targetNode: null, found: false };

        let curr: NodoSplay<T> | null = this.getRaiz();
        let ultimo: NodoSplay<T> | null = null;

        // Inicializar la traza de seguimiento del estado del árbol durante la operación
        this.splayOperationTrace = {
            rotations: [],
            hierarchies: {
                bst: null,
                mids: []
            }
        }

        const steps: SplaySearchStep[] = [];

        while (curr !== null) {
            steps.push({ type: "visit", at: curr.getId() });

            ultimo = curr;
            const cmp = this.compare(valor, curr.getInfo());
            steps.push({ type: "compare", at: curr.getId(), cmp: cmp < 0 ? -1 : cmp > 0 ? 1 : 0 });

            if (cmp === 0) {
                steps.push({ type: "splayCall", xId: curr.getId(), reason: "search-found" });
                this.splay(curr, steps);

                steps.push({ type: "return" });
                return { steps, targetNode: curr, found: true };
            }

            const next = cmp < 0 ? curr.getIzq() : curr.getDer();
            steps.push({
                type: "advance",
                from: curr.getId(),
                to: next?.getId() ?? null,
                dir: cmp < 0 ? "L" : "R"
            });
            curr = next;
        }

        // Si el nodo no fue ubicado, splay del último visitado
        steps.push({ type: "splayCall", xId: ultimo!.getId(), reason: "search-notfound" });
        this.splay(ultimo!, steps);

        steps.push({ type: "return" });
        return { steps, targetNode: ultimo, found: false };
    }

    /**
     * Método que obtiene la raíz del árbol Splay.
     * @returns Nodo raíz del árbol o null si está vacío. 
     */
    public override getRaiz(): NodoSplay<T> | null {
        return super.getRaiz() as NodoSplay<T> | null;
    }

    /**
     * Método que modifica la raíz del árbol Splay.
     * @param raiz Nuevo nodo raíz del árbol Splay.
     */
    public override setRaiz(raiz: NodoSplay<T> | null): void {
        super.setRaiz(raiz);
        if (this.getRaiz()) this.getRaiz()?.setPadre(null);
    }

    /**
     * Método que obtiene todos los nodos hojas del árbol Splay.
     * @returns Arreglo que contiene todos los nodos hoja presentes en el árbol.
     */
    public override getHojas(): NodoSplay<T>[] {
        return super.getHojas() as NodoSplay<T>[];
    }

    /**
     * Método que cuenta el número de nodos hoja presentes en el árbol Splay.
     * @returns Número de nodos hoja presentes en el árbol.
     */
    public override contarHojas(): number {
        return super.contarHojas();
    }

    /**
     * Método que calcula el peso total (número de nodos) del árbol Splay.
     * @returns Número total de nodos del árbol.
     */
    public override getPeso(): number {
        return super.getPeso();
    }

    /**
     * Método que calcula la altura del árbol Splay.
     * @returns Altura del árbol.
     */
    public override getAltura(): number {
        return super.getAltura();
    }

    /**
     * Método que vacia el árbol Splay.
     */
    public override vaciar(): void {
        super.vaciar();
    }

    /**
     * Método que verifica si el árbol Splay está vacío.
     * @returns True si se encuentra vacío, false en caso contrario.
     */
    public override esVacio(): boolean {
        return super.esVacio();
    }

    /**
     * Método que realiza el recorrido inorden del árbol Splay.
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
     * Método que realiza el recorrido preorden del árbol Splay.
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
     * Método que realiza el recorrido postorden del árbol Splay.
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
     * Método que realiza el recorrido por niveles del árbol Splay.
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
     * Método que convierte el árbol Splay en una estructura jerárquica.
     * @returns Representación jerárquica del árbol o null si está vacío.
     */
    public override convertirEstructuraJerarquica(): HierarchyNodeData<T> | null {
        if (this.esVacio()) return null;
        return this.toSplayHierarchy(this.getRaiz()!);
    }

    /**
     * Método que crea una copia profunda del árbol Splay.
     * @returns Retorna un nuevo árbol correspondiente a la copia profunda del árbol actual.
     */
    public clonarSplay(): ArbolSplay<T> {
        const nuevoArbol = new ArbolSplay<T>(this.compare);
        nuevoArbol.setRaiz(this.clonarSplayRec(this.getRaiz()));
        nuevoArbol.setTamanio(this.getTamanio());
        return nuevoArbol;
    }

    /**
     * Método que consume y limpia la última traza de operación splay registrada.
     * @returns Última traza splay registrada o null si no existe.
     */
    public consumeLastSplayTrace(): SplayTrace<T> | null {
        const t = this.splayOperationTrace;
        this.splayOperationTrace = null;
        return t;
    }

    /**
     * Método auxiliar que realiza la operación de splay sobre el nodo dado, moviéndolo hasta la raíz
     * mediante rotaciones Zig, Zig-Zig, Zig-Zag según corresponda;
     * 
     * 1. Zig: Nodo es hijo directo de la raíz -> una rotación.
     * 2. Zig-Zig: Nodo y padre son ambos hijos izquierdos o derechos -> dos rotaciones en la misma dirección.
     * 3. Zig-Zag: Nodo y padre están en direcciones opuestas -> dos rotaciones en direcciones distintas.
     * 
     * Durante cada rotación, captura estados pre- y post-rotación para propositos de seguimiento y visualización.
     * @param x Nodo a splayear hasta la raíz.
     * @param steps Arreglo para acumular los pasos de fixup realizados durante la operación.
     */
    private splay(
        x: NodoSplay<T>,
        steps: SplayInsertStep[] | SplayDeleteStep[] | SplaySearchStep[]
    ) {
        const trace = this.splayOperationTrace;

        while (x.getPadre() !== null) {
            steps.push({
                type: "splayWhileCheck",
                xId: x.getId(),
                parentId: x.getPadre()?.getId() ?? null,
                continue: true
            });

            const p = x.getPadre()!;
            const g = p.getPadre();
            steps.push({ type: "resolvePG", xId: x.getId(), pId: p.getId(), gId: g?.getId() ?? null });

            // Capturar el estado pre-rotación
            this.ensureSplayTraceInit();

            if (g === null) {
                const shape = x === p.getIzq() ? "LL" : "RR";
                steps.push({ type: "splayCase", kind: "zig", shape });

                // Capturar info de la rotación a aplicar
                this.pushSplayRotationStep(p, x, x === p.getIzq() ? x.getDer() : x.getIzq(), "Zig", shape);

                // Zig
                const pivotSide = this.getPivotSideOnParent(p);
                if (x === p.getIzq()) {
                    this.rotarDerecha(p);
                } else {
                    this.rotarIzquierda(p);
                }

                // Capturar el estado post-rotación
                this.pushSplayRotationHierarchy();
                this.captureSplayRotateStep(steps, trace, "zig", shape === "LL" ? "right" : "left", p, pivotSide);
            } else {
                const xEsIzq = (x === p.getIzq());
                const pEsIzq = (p === g.getIzq());

                if (xEsIzq && pEsIzq) {
                    // Zig-Zig LL
                    steps.push({ type: "splayCase", kind: "zig-zig", shape: "LL" });

                    // Capturar info de la rotación a aplicar
                    this.pushSplayRotationStep(g, p, p.getDer(), "Zig-Zig", "LL");

                    // Rotación y Captura del estado posterior
                    const firstRotationPivotSide = this.getPivotSideOnParent(g);
                    this.rotarDerecha(g);
                    this.pushSplayRotationHierarchy();
                    this.captureSplayRotateStep(steps, trace, "zigzig-1", "right", g, firstRotationPivotSide);

                    // Capturar info de la segunda rotación a aplicar
                    this.pushSplayRotationStep(p, x, x.getDer(), "Zig-Zig", "LL");

                    // Rotación y Captura del estado posterior
                    const secondRotationPivotSide = this.getPivotSideOnParent(p);
                    this.rotarDerecha(p);
                    this.pushSplayRotationHierarchy();
                    this.captureSplayRotateStep(steps, trace, "zigzig-2", "right", p, secondRotationPivotSide);
                } else if (!xEsIzq && !pEsIzq) {
                    // Zig-Zig RR
                    steps.push({ type: "splayCase", kind: "zig-zig", shape: "RR" });

                    // Capturar info de la rotación a aplicar
                    this.pushSplayRotationStep(g, p, p.getIzq(), "Zig-Zig", "RR");

                    // Rotación y Captura del estado posterior
                    const firstRotationPivotSide = this.getPivotSideOnParent(g);
                    this.rotarIzquierda(g);
                    this.pushSplayRotationHierarchy();
                    this.captureSplayRotateStep(steps, trace, "zigzig-1", "left", g, firstRotationPivotSide);

                    // Capturar info de la segunda rotación a aplicar
                    this.pushSplayRotationStep(p, x, x.getIzq(), "Zig-Zig", "RR");

                    // Rotación y Captura del estado posterior
                    const secondRotationPivotSide = this.getPivotSideOnParent(p);
                    this.rotarIzquierda(p);
                    this.pushSplayRotationHierarchy();
                    this.captureSplayRotateStep(steps, trace, "zigzig-2", "left", p, secondRotationPivotSide);
                } else if (!xEsIzq && pEsIzq) {
                    // Zig-Zag LR
                    steps.push({ type: "splayCase", kind: "zig-zag", shape: "LR" });

                    // Capturar info de la rotación a aplicar
                    this.pushSplayRotationStep(p, x, x.getIzq(), "Zig-Zag", "LR");

                    // Rotación y Captura del estado posterior
                    const firstRotationPivotSide = this.getPivotSideOnParent(p);
                    this.rotarIzquierda(p);
                    this.pushSplayRotationHierarchy();
                    this.captureSplayRotateStep(steps, trace, "zigzag-1", "left", p, firstRotationPivotSide);

                    // Capturar info de la segunda rotación a aplicar
                    this.pushSplayRotationStep(g, x, x.getDer(), "Zig-Zag", "LR");

                    // Rotación y Captura del estado posterior
                    const secondRotationPivotSide = this.getPivotSideOnParent(g);
                    this.rotarDerecha(g);
                    this.pushSplayRotationHierarchy();
                    this.captureSplayRotateStep(steps, trace, "zigzag-2", "right", g, secondRotationPivotSide);
                } else {
                    // Zig–Zag RL
                    steps.push({ type: "splayCase", kind: "zig-zag", shape: "RL" });

                    // Capturar info de la rotación a aplicar
                    this.pushSplayRotationStep(p, x, x.getDer(), "Zig-Zag", "RL");

                    // Rotación y Captura del estado posterior
                    const firstRotationPivotSide = this.getPivotSideOnParent(p);
                    this.rotarDerecha(p);
                    this.pushSplayRotationHierarchy();
                    this.captureSplayRotateStep(steps, trace, "zigzag-1", "right", p, firstRotationPivotSide);

                    // Capturar info de la segunda rotación a aplicar
                    this.pushSplayRotationStep(g, x, x.getIzq(), "Zig-Zag", "RL");

                    // Rotación y Captura del estado posterior
                    const secondRotationPivotSide = this.getPivotSideOnParent(g);
                    this.rotarIzquierda(g);
                    this.pushSplayRotationHierarchy();
                    this.captureSplayRotateStep(steps, trace, "zigzag-2", "left", g, secondRotationPivotSide);
                }
            }
        }
        steps.push({
            type: "splayWhileCheck",
            xId: x.getId(),
            parentId: null,
            continue: false
        });

        steps.push({ type: "setRoot", rootId: x.getId() });
        this.setRaiz(x);
    }

    /**
     * Método auxiliar que realiza una rotación simple a la derecha en el subárbol dado.
     * @param y Nodo raíz del subárbol a rotar.
     */
    private rotarDerecha(y: NodoSplay<T>) {
        const x = y.getIzq()!;
        const T2 = x.getDer();

        // Enlazar x con el padre y
        x.setPadre(y.getPadre());
        if (x.getPadre() === null) this.setRaiz(x);
        else if (y === y.getPadre()!.getDer()) y.getPadre()!.setDer(x);
        else y.getPadre()!.setIzq(x);

        // Colocar y bajo x
        x.setDer(y);
        y.setPadre(x);

        // Recolocar T2 como hijo izquierdo de y
        y.setIzq(T2);
        if (T2 !== null) T2.setPadre(y);
    }

    /**
     * Método auxiliar que realiza una rotación simple a la izquierda en el subárbol dado.
     * @param x Nodo raíz del subárbol a rotar.
     */
    private rotarIzquierda(x: NodoSplay<T>): void {
        const y = x.getDer()!;
        const T2 = y.getIzq();

        // Enlazar y con el padre x
        y.setPadre(x.getPadre());
        if (x.getPadre() === null) this.setRaiz(y);
        else if (x === x.getPadre()!.getIzq()) x.getPadre()!.setIzq(y);
        else x.getPadre()!.setDer(y);

        // Colocar x bajo y
        y.setIzq(x);
        x.setPadre(y);

        // Recolocar T2 como hijo derecho de x
        x.setDer(T2);
        if (T2 !== null) T2.setPadre(x);
    }

    /**
     * Método auxiliar que convierte un nodo del árbol Splay en una estructura de datos
     * jerárquica adecuada para visualización o procesamiento posterior.
     * @param root Nodo raíz del árbol Splay.
     * @returns Objeto que representa la estructura jerárquica del árbol Splay.
     */
    private toSplayHierarchy(root: NodoSplay<T>): HierarchyNodeData<T> {
        const left = root.getIzq()
            ? this.toSplayHierarchy(root.getIzq() as NodoSplay<T>)
            : null;
        const right = root.getDer()
            ? this.toSplayHierarchy(root.getDer() as NodoSplay<T>)
            : null;

        let children: HierarchyNodeData<T>[] | undefined;

        if (left && right) {
            children = [left, right];
        } else if (left && !right) {
            children = [left, super.createPlaceholder(root, "right")];
        } else if (!left && right) {
            children = [super.createPlaceholder(root, "left"), right];
        } else {
            children = undefined;
        }

        return {
            id: root.getId(),
            value: root.getInfo(),
            children
        };
    }

    /**
     * Método auxiliar que clona un árbol Splay iniciando desde el nodo raíz dado.
     * @param root Nodo raíz del subárbol a clonar.
     * @returns Una nueva instancia `NodoSplay<T>` que es una clonación profunda del subárbol.
     */
    private clonarSplayRec(root: NodoSplay<T> | null): NodoSplay<T> | null {
        if (root === null) return null;

        const clon = new NodoSplay<T>(root.getInfo(), root.getId());

        const clonIzq = this.clonarSplayRec(root.getIzq());
        const clonDer = this.clonarSplayRec(root.getDer());

        clon.setIzq(clonIzq);
        clon.setDer(clonDer);

        if (clonIzq) clonIzq.setPadre(clon);
        if (clonDer) clonDer.setPadre(clon);

        return clon;
    }

    /**
     * Método auxiliar que registra información sobre un paso de rotación realizado durante la operación splay.
     * @param zNode Nodo que rota (z).
     * @param yNode Nodo implicado en la rotación (y).
     * @param BNode Nodo del subárbol (B) afectado por la rotación.
     * @param rotationTag Etiqueta que identifica el tipo de rotación splay.
     * @param rotationType Tipo de rotación realizada.
     */
    private pushSplayRotationStep(
        zNode: NodoSplay<T>,
        yNode: NodoSplay<T>,
        BNode: NodoSplay<T> | null,
        rotationTag: SplayRotationTag,
        rotationType: RotationType
    ): void {
        const step: RotationStep = {
            type: rotationType,
            zId: zNode.getId(),
            yId: yNode.getId(),
            parentOfZId: zNode.getPadre()?.getId() ?? null,
            BId: BNode?.getId() ?? null
        }
        this.splayOperationTrace?.rotations.push({ tag: rotationTag, step });
    }

    /**
     * Método auxiliar que registra un estado intermedio del árbol durante una operación splay para propósitos de visualización y análisis.
     * Toma la estructura jerárquica actual del árbol y la agrega a la colección de jerarquías intermedias en la traza de operación splay.
     */
    private pushSplayRotationHierarchy(): void {
        if (!this.splayOperationTrace) return;
        this.splayOperationTrace.hierarchies.mids.push(
            this.convertirEstructuraJerarquica() as HierarchyNodeData<T>
        );
    }

    /**
     * Método auxiliar que garantiza la inicialización de la jerarquía BST en la traza de operación splay.
     * Convierte la estructura actual del árbol en una representación jerárquica y asegura la disposición 
     * de un estado base del árbol antes de registrar rotaciones intermedias
     */
    private ensureSplayTraceInit(): void {
        if (this.splayOperationTrace && !this.splayOperationTrace.hierarchies.bst) {
            this.splayOperationTrace.hierarchies.bst = this.convertirEstructuraJerarquica();
        }
    }

    /**
     * Método auxiliar que determina el lado del nodo pivote con respecto a su padre.
     * @param pivot Nodo pivote.
     * @returns Lado del nodo pivote con respecto a su padre ("left", "right", o "root").
     */
    private getPivotSideOnParent(pivot: NodoSplay<T>): "left" | "right" | "root" {
        const up = pivot.getPadre();
        if (!up) return "root";
        return up.getIzq() === pivot ? "left" : "right";
    }

    private captureSplayRotateStep(
        steps: (SplayInsertStep | SplayDeleteStep | SplaySearchStep)[],
        trace: SplayTrace<T> | null,
        caseKind: "zig" | "zigzig-1" | "zigzig-2" | "zigzag-1" | "zigzag-2",
        dir: "left" | "right",
        pivot: NodoSplay<T>,
        pivotSide: "root" | "left" | "right"
    ) {
        if (!trace) return;
        steps.push({
            type: "rotate",
            kind: "splay",
            subkind: caseKind,
            dir,
            pivot: pivot.getId(),
            frameIndex: trace.hierarchies.mids.length - 1,
            rotationIndex: trace.rotations.length - 1,
            pivotSideOnParent: pivotSide
        });
    }
}