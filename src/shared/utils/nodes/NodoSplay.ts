import { v4 as uuidv4 } from "uuid";
import { NodoBin } from "./NodoBin";

/**
 * Clase que representa un Nodo Splay.
 */
export class NodoSplay<T> extends NodoBin<T> {

    private padre: NodoSplay<T> | null;

    /**
     * Constructor de la clase Nodo Splay.
     * @param info Información a almacenar en el nodo.
     * @param id Identificador único del nodo (opcional).
     */
    constructor(info: T, id?: string) {
        super(info, id ?? `node-${uuidv4()}`);
        this.padre = null;
    }

    /**
     * Método que obtiene la información almacenada en el nodo Splay.
     * @returns Info almacenada en el nodo Splay.
     */
    public override getInfo(): T {
        return super.getInfo();
    }

    /**
     * Método que obtiene la referencia al hijo izquierdo del nodo Splay.
     * @returns Hijo izquierdo o null según corresponda.
     */
    public override getIzq(): NodoSplay<T> | null {
        return super.getIzq() as NodoSplay<T> | null;
    }

    /**
     * Método que obtiene la referencia al hijo derecho del nodo Splay.
     * @returns Hijo derecho o null según corresponda.
     */
    public override getDer(): NodoSplay<T> | null {
        return super.getDer() as NodoSplay<T> | null;
    }

    /**
     * Método que obtiene el Id del nodo Splay.
     * @returns Id del nodo Splay.
     */
    public override getId(): string {
        return super.getId();
    }

    /**
   * Método que obtiene el padre del nodo Splay.
   * @returns Padre del nodo o null si no tiene.
   */
    public getPadre(): NodoSplay<T> | null {
        return this.padre;
    }

    /**
     * Método que modifica la información almacenada en el nodo Splay.
     * @param info Nueva info a almacenar.
     */
    public override setInfo(info: T): void {
        super.setInfo(info);
    }

    /**
     * Método que modifica la referencia al hijo izquierdo del nodo Splay.
     * @param nodo Nodo a establecer como hijo izquierdo.
     */
    public override setIzq(nodo: NodoSplay<T> | null): void {
        super.setIzq(nodo);
    }

    /**
     * Método que modifica la referencia al hijo derecho del nodo Splay.
     * @param nodo Nodo a establecer como hijo derecho.
     */
    public override setDer(nodo: NodoSplay<T> | null): void {
        super.setDer(nodo);
    }

    /**
     * Método que modifica la referencia al padre del nodo Splay.
     * @param padre Nuevo padre del nodo.
     */
    public setPadre(padre: NodoSplay<T> | null): void {
        this.padre = padre;
    }

}