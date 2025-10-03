// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { Comparator, HierarchyNodeData, RotationStep, RotationType, SplayRotationTag, SplayTrace } from "../../../types";
import { NodoSplay } from "../nodes/NodoSplay";
import { defaultComparator } from "../treeUtils";
import { ArbolBinarioBusqueda } from "./ArbolBinarioBusqueda";

/**
 * Clase que representa el funcionamiento de un árbol Splay.
 */
export class ArbolSplay<T> extends ArbolBinarioBusqueda<T> {

    private lastSplayTrace: SplayTrace<T> | null = null;

    /**
     * Constructor de la clase ArbolSplay.
     */
    constructor(
        compare: Comparator<T> = defaultComparator
    ) {
        super(compare);
    }

    /**
     * Método que inserta un nuevo nodo en el árbol Splay. Si el elemento ya existe,
     * no se crea un nuevo nodo, pero se aplica Splay sobre el nodo existente.
     * @param valor Elemento a insertar.
     * @returns Objeto con:
     * - `targetNode`: Nodo asociado al elemento (nuevo o ya existente).
     * - `inserted`: Indica si el elemento fue realmente insertado.
     */
    public insertarSplay(valor: T): { targetNode: NodoSplay<T>, inserted: boolean } {
        if (super.getTamanio() >= this.MAX_NODOS) {
            throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
        }

        // Inicializar la traza de seguimiento del estado del árbol durante la operación
        this.lastSplayTrace = {
            rotations: [],
            hierarchies: {
                bst: null,
                mids: []
            }
        }

        // Inserción BST estándar
        let p: NodoSplay<T> | null = null;
        let cur: NodoSplay<T> | null = this.getRaiz();

        while (cur !== null) {
            p = cur;
            const cmp = this.compare(valor, cur.getInfo());
            if (cmp === 0) {
                this.splay(cur);
                return { targetNode: cur, inserted: false };
            }
            cur = cmp < 0 ? cur.getIzq() : cur.getDer();
        }

        // Actualizar padre del nuevo nodo
        const nuevo = new NodoSplay<T>(valor);
        nuevo.setPadre(p);

        if (!p) {
            this.setRaiz(nuevo);
        } else if (this.compare(valor, p.getInfo()) < 0) {
            p.setIzq(nuevo);
        } else {
            p.setDer(nuevo);
        }

        // Splay del nuevo nodo
        this.splay(nuevo);
        this.setTamanio(this.getTamanio() + 1);

        return { targetNode: nuevo, inserted: true };
    }

    /**
     * Método que elimina un nodo especifico del árbol Splay. Si el elemento no existe,
     * se aplica Splay sobre el nodo más cercano y no se elimina nada.
     * @param valor Elemento a eliminar.
     * @returns Objeto con:
     * - `node`: Nodo asociado al elemento a eliminar o el último nodo vistado.
     * - `deleted`: Indica si el elemento fue realmente eliminado.
     * - `maxLeft`: Nodo máximo del subárbol izquierdo tras la operación de eliminación o null si no existía.
     */
    public eliminarSplay(valor: T): { node: NodoSplay<T>, removed: boolean, maxLeft: NodoSplay<T> | null } {
        if (this.esVacio()) throw new Error("No fue posible eliminar el nodo: El árbol se encuentra vacío (cantidad de nodos: 0).");

        // Splay(valor)
        const { node: foundNode, found } = this.buscarSplay(valor);
        if (!found) {
            return { node: foundNode!, removed: false, maxLeft: null };
        }

        // Split por la raíz
        const L = this.getRaiz()!.getIzq();
        const R = this.getRaiz()!.getDer();
        if (L) { L.setPadre(null); }
        if (R) { R.setPadre(null); }

        // Descartar la raíz actual
        this.getRaiz()!.setDer(null);
        this.getRaiz()!.setIzq(null);
        this.setRaiz(null);

        // Join (L, R)
        if (!L) {
            this.setRaiz(R);
            return { node: foundNode!, removed: true, maxLeft: null };
        }
        // Splay del máximo de L dentro de L
        this.setRaiz(L);
        const maxL = this.maximo(this.getRaiz()!);
        this.splay(maxL);

        // Colgamos R
        this.getRaiz()!.setDer(R)
        if (R) R.setPadre(this.getRaiz());
        this.setTamanio(this.getTamanio() - 1);

        return { node: foundNode!, removed: true, maxLeft: maxL };
    }

    /**
     * Método que busca un nodo especifico en el árbol Splay.
     * Aplica splay sobre el nodo encontrado o sobre el último nodo visitado.
     * @param valor Elemento a buscar en el árbol Splay.
     * @returns Objeto con:
     * - `node`: Nodo que contiene el elemento buscado o el último nodo visitado si no fue encontrado. 
     * - `found`: Indica si el elemento esta presente en el árbol.
     */
    public buscarSplay(valor: T): { node: NodoSplay<T> | null, found: boolean } {
        if (this.esVacio()) return { node: null, found: false };
        let cur: NodoSplay<T> | null = this.getRaiz();
        let last: NodoSplay<T> | null = null;

        // Inicializar la traza de seguimiento del estado del árbol durante la operación
        this.lastSplayTrace = {
            rotations: [],
            hierarchies: {
                bst: null,
                mids: []
            }
        }

        while (cur !== null) {
            last = cur;
            const cmp = this.compare(valor, cur.getInfo());
            if (cmp === 0) {
                this.splay(cur);
                return { node: cur, found: true };
            }
            cur = cmp < 0 ? cur.getIzq() : cur.getDer();
        }

        // Si el nodo no fue ubicado, splay del último visitado
        this.splay(last!);
        return { node: last, found: false };
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
     * @returns Array de nodos que representan las hojas del árbol.
     */
    public override getHojas(): NodoSplay<T>[] {
        return super.getHojas() as NodoSplay<T>[];
    }

    /**
     * Método que cuenta el número de nodos hoja del árbol Splay.
     * @returns Número de nodos hoja del árbol.
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
     * Método que retorna un array de nodos resultante del recorrido in-orden del árbol Splay.
     * @returns Array de nodos en secuencia in-orden.
     */
    public override inOrden(): NodoSplay<T>[] {
        return super.inOrden() as NodoSplay<T>[];
    }

    /**
     * Método que retorna un array de nodos resultante del recorrido pre-orden del árbol Splay.
     * @returns Array de nodos en secuencia pre-orden.
     */
    public override preOrden(): NodoSplay<T>[] {
        return super.preOrden() as NodoSplay<T>[];
    }

    /**
     * Método que retorna un array de nodos resultante del recorrido post-orden del árbol Splay.
     * @returns Array de nodos en secuencia post-orden.
     */
    public override postOrden(): NodoSplay<T>[] {
        return super.postOrden() as NodoSplay<T>[];
    }

    /**
     * Método que retorna un array de nodos resultante del recorrido por niveles del árbol Splay.
     * @returns Array de nodos por niveles.
     */
    public override getNodosPorNiveles(): NodoSplay<T>[] {
        return super.getNodosPorNiveles() as NodoSplay<T>[];
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
     * Método que consume y limpia la última traza splay registrada.
     * @returns Última traza splay o null si no existe.
     */
    public consumeLastSplayTrace(): SplayTrace<T> | null {
        const t = this.lastSplayTrace;
        this.lastSplayTrace = null;
        return t;
    }

    /**
     * Método que realiza la operación splay en el nodo dado, moviendolo a la raíz del árbol splay.
     * Aplica una serie de rotaciones (Zig, Zig-Zig, Zig-Zag) dependiendo de la posición del nodo.
     * Durante cada rotación, captura estados pre- y post-rotación para propositos de seguimiento y visualización.
     * @param x Nodo a splayear hasta la raíz.
     */
    private splay(x: NodoSplay<T>) {
        while (x.getPadre() !== null) {
            const p = x.getPadre()!;
            const g = p.getPadre();

            // Capturar el estado pre-rotación
            this.ensureSplayTraceInit();

            if (g === null) {
                // Capturar info de la rotación a aplicar
                this.pushSplayRotationInfo(
                    p,
                    x,
                    x === p.getIzq() ? x.getDer() : x.getIzq(),
                    "Zig",
                    x === p.getIzq() ? "LL" : "RR",
                    "first"
                );

                // Zig
                if (x === p.getIzq()) {
                    this.rotarDerecha(p);
                } else {
                    this.rotarIzquierda(p);
                }

                // Capturar el estado post-rotación
                this.pushSplayRotationHierarchy();
            } else {
                const xIsLeft = (x === p.getIzq());
                const pIsLeft = (p === g.getIzq());

                if (xIsLeft && pIsLeft) {
                    // Zig-Zig LL

                    // Capturar info de la rotación a aplicar
                    this.pushSplayRotationInfo(g, p, p.getDer(), "Zig-Zig", "LL", "first");

                    // Rotación y Captura del estado posterior
                    this.rotarDerecha(g);
                    this.pushSplayRotationHierarchy();

                    // Capturar info de la segunda rotación a aplicar
                    this.pushSplayRotationInfo(p, x, x.getDer(), "Zig-Zig", "LL", "second");

                    // Rotación y Captura del estado posterior
                    this.rotarDerecha(p);
                    this.pushSplayRotationHierarchy();
                } else if (!xIsLeft && !pIsLeft) {
                    // Zig-Zig RR

                    // Capturar info de la rotación a aplicar
                    this.pushSplayRotationInfo(g, p, p.getIzq(), "Zig-Zig", "RR", "first");

                    // Rotación y Captura del estado posterior
                    this.rotarIzquierda(g);
                    this.pushSplayRotationHierarchy();

                    // Capturar info de la segunda rotación a aplicar
                    this.pushSplayRotationInfo(p, x, x.getIzq(), "Zig-Zig", "RR", "second");

                    // Rotación y Captura del estado posterior
                    this.rotarIzquierda(p);
                    this.pushSplayRotationHierarchy();
                } else if (!xIsLeft && pIsLeft) {
                    // Zig-Zag LR

                    // Capturar info de la rotación a aplicar
                    this.pushSplayRotationInfo(p, x, x.getIzq(), "Zig-Zag", "LR", "first");

                    // Rotación y Captura del estado posterior
                    this.rotarIzquierda(p);
                    this.pushSplayRotationHierarchy();

                    // Capturar info de la segunda rotación a aplicar
                    this.pushSplayRotationInfo(g, x, x.getDer(), "Zig-Zag", "LR", "second");

                    // Rotación y Captura del estado posterior
                    this.rotarDerecha(g);
                    this.pushSplayRotationHierarchy();
                } else {
                    // Zig–Zag RL

                    // Capturar info de la rotación a aplicar
                    this.pushSplayRotationInfo(p, x, x.getDer(), "Zig-Zag", "RL", "first");

                    // Rotación y Captura del estado posterior
                    this.rotarDerecha(p);
                    this.pushSplayRotationHierarchy();

                    // Capturar info de la segunda rotación a aplicar
                    this.pushSplayRotationInfo(g, x, x.getIzq(), "Zig-Zag", "RL", "second");

                    // Rotación y Captura del estado posterior
                    this.rotarIzquierda(g);
                    this.pushSplayRotationHierarchy();
                }
            }
        }
        this.setRaiz(x);
    }

    /**
     * Método que realiza una rotación izquierda en el nodo Splay dado.
     * @param p Nodo raíz del subárbol a rotar.
     */
    private rotarIzquierda(p: NodoSplay<T>): void {
        const x = p.getDer();
        if (!x) return;

        // Recolocar B como hijo derecho de p
        const B = x.getIzq();
        p.setDer(B);
        if (B) B.setPadre(p);

        // Enlazar x con el padre p
        x.setPadre(p.getPadre());
        if (p.getPadre() === null) this.setRaiz(x);
        else if (p.getPadre()?.getIzq() === p) p.getPadre()?.setIzq(x);
        else p.getPadre()?.setDer(x);

        // Colocar p bajo x
        x.setIzq(p);
        p.setPadre(x);
    }

    /**
     * Método que realiza una rotación derecha en el nodo Splay dado.
     * @param p Nodo raíz del subárbol a rotar.
     */
    private rotarDerecha(p: NodoSplay<T>) {
        const x = p.getIzq();
        if (!x) return;

        // Recolocar B como hijo izquierdo de p
        const B = x.getDer();
        p.setIzq(B);
        if (B) B.setPadre(p);

        // Enlazar x con el padre p
        x.setPadre(p.getPadre());
        if (p.getPadre() === null) this.setRaiz(x);
        else if (p.getPadre()?.getIzq() === p) p.getPadre()?.setIzq(x);
        else p.getPadre()?.setDer(x);

        // Colocar p bajo x
        x.setDer(p);
        p.setPadre(x);
    }

    /**
     * Método que recorre los hijos derechos del subárbol dado hasta encontrar el nodo más a la derecha.
     * @param n Nodo raíz del subárbol a buscar.
     * @returns Nodo con el máximo valor en el subárbol.
     */
    private maximo(n: NodoSplay<T>): NodoSplay<T> {
        let actual = n
        while (actual.getDer()) actual = actual.getDer()!;
        return actual;
    }

    /**
     * Método recursivo que convierte un nodo del árbol Splay en una estructura de datos
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
     * Método recursivo que clona un árbol Splay iniciando desde el nodo raíz dado.
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
     * Método que registra información sobre un paso de rotación realizado durante la operación splay.
     * @param zNode Nodo que rota (z).
     * @param yNode Nodo implicado en la rotación (y).
     * @param BNode Nodo del subárbol (B) afectado por la rotación.
     * @param rotationTag Etiqueta que identifica el tipo de rotación splay.
     * @param rotationType Tipo de rotación realizada.
     * @param rotationOrder Indica si se trata se la "primera" o "segunda" rotación de la secuencia splay.
     */
    private pushSplayRotationInfo(
        zNode: NodoSplay<T>,
        yNode: NodoSplay<T>,
        BNode: NodoSplay<T> | null,
        rotationTag: SplayRotationTag,
        rotationType: RotationType,
        rotationOrder: "first" | "second",
    ): void {
        const step: RotationStep = {
            type: rotationType,
            zId: zNode.getId(),
            yId: yNode.getId(),
            parentOfZId: zNode.getPadre()?.getId() ?? null,
            BId: BNode?.getId() ?? null
        }
        this.lastSplayTrace?.rotations.push({ tag: rotationTag, rotation: step, rotationOrder: rotationOrder });
    }

    /**
     * Método que agrega la estructura jerárquica actual a la traza de seguimiento del estado del árbol.
     */
    private pushSplayRotationHierarchy(): void {
        if (!this.lastSplayTrace) return;
        this.lastSplayTrace.hierarchies.mids.push(
            this.convertirEstructuraJerarquica() as HierarchyNodeData<T>
        );
    }

    /**
     * Método que asegura que se inicialice la traza splay de la jerárquia BST.
     */
    private ensureSplayTraceInit() {
        if (this.lastSplayTrace && !this.lastSplayTrace.hierarchies.bst) {
            this.lastSplayTrace.hierarchies.bst = this.convertirEstructuraJerarquica();
        }
    }

}