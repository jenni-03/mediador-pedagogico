// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { Comparator } from "../../../types";
import { NodoSplay } from "../nodes/NodoSplay";
import { defaultComparator } from "../treeUtils";
import { ArbolBinarioBusqueda } from "./ArbolBinarioBusqueda";

/**
 * Clase que representa el funcionamiento de un árbol Splay.
 */
export class ArbolSplay<T> extends ArbolBinarioBusqueda<T> {

    /**
     * Constructor de la clase ArbolSplay.
     */
    constructor(
        compare: Comparator<T> = defaultComparator
    ) {
        super(compare);
    }

    public insertarSplay(valor: T): NodoSplay<T> {
        if (super.getTamanio() >= this.MAX_NODOS) {
            throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
        }

        // Inserción BST estándar
        let p: NodoSplay<T> | null = null;
        let cur: NodoSplay<T> | null = this.getRaiz();

        while (cur !== null) {
            p = cur;
            const cmp = this.compare(valor, cur.getInfo());
            if (cmp === 0) {
                this.splay(cur);
                return cur;
            }
            cur = cmp < 0 ? cur.getIzq() : cur.getDer();
        }

        const nuevo = new NodoSplay<T>(valor);
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

        return nuevo;
    }

    public eliminarSplay(valor: T): NodoSplay<T> | null {
        if (this.esVacio()) throw new Error("No fue posible eliminar el nodo: El árbol se encuentra vacío (cantidad de nodos: 0).");

        // Splay(valor)
        const nodo = this.buscarSplay(valor);
        if (nodo === null) {
            return null;
        }

        // Split por la raíz
        const L = this.getRaiz()!.getIzq();
        const R = this.getRaiz()!.getDer();
        if (L) { L.setPadre(null); }
        if (R) { R.setPadre(null); }

        // Descartar la raíz actual
        this.getRaiz()!.setDer(null);
        this.getRaiz()!.setIzq(null);
        this.getRaiz()!.setPadre(null);
        this.setRaiz(null);

        // Join (L, R)
        if (!L) {
            this.setRaiz(R);
            return nodo;
        }
        // Splay del máximo de L dentro de L
        this.setRaiz(L);
        const maxL = this.maximo(this.getRaiz()!);
        this.splay(maxL);

        // Colgamos R
        this.getRaiz()!.setDer(R)
        if (R) R.setPadre(this.getRaiz());
        return nodo;
    }

    public buscarSplay(valor: T): NodoSplay<T> | null {
        if (this.esVacio()) return null;
        let cur: NodoSplay<T> | null = this.getRaiz();
        let last: NodoSplay<T> | null = null;

        while (cur !== null) {
            last = cur;
            const cmp = this.compare(valor, cur.getInfo());
            if (cmp === 0) {
                this.splay(cur);
                return cur;
            }
            cur = cmp < 0 ? cur.getIzq() : cur.getDer();
        }

        // Si el nodo no fue ubicado, splay del último visitado
        if (last) this.splay(last);
        return null;
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
     * Método que verifica si el árbol Splay está vacío.
     * @returns True si se encuentra vacío, false en caso contrario.
     */
    public override esVacio(): boolean {
        return super.esVacio();
    }

    /**
     * Método que mueve el nodo especificado a la raíz del árbol splay.
     * @param x Nodo a splayear hasta la raíz del árbol.
     */
    private splay(x: NodoSplay<T>) {
        while (x.getPadre() !== null) {
            const p = x.getPadre()!;
            const g = p.getPadre();

            if (g === null) {
                // Zig
                if (x === p.getIzq()) {
                    this.rotarDerecha(p);
                } else {
                    this.rotarIzquierda(p);
                }
            } else {
                const xIsLeft = (x === p.getIzq());
                const pIsLeft = (p === g.getIzq());

                if (xIsLeft && pIsLeft) {
                    // Zig-Zig LL
                    this.rotarDerecha(g);
                    this.rotarDerecha(p);
                } else if (!xIsLeft && !pIsLeft) {
                    // Zig-Zig RR
                    this.rotarIzquierda(g);
                    this.rotarIzquierda(p);
                } else if (!xIsLeft && pIsLeft) {
                    // Zig-Zag LR
                    this.rotarIzquierda(p);
                    this.rotarDerecha(g);
                } else {
                    // Zig–Zag RL
                    this.rotarDerecha(p);
                    this.rotarIzquierda(g);
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

}