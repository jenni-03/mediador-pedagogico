// src/hooks/estructures/pila/useStack.ts
import { useState } from "react";
import { Pila } from "./Pila";

export function useStack() {
    const [pila] = useState(new Pila());
    const [query, setQuery] = useState({ valor: "", indice: "" });
    const [error, setError] = useState("");

    const getMemoria = () => pila.getMemoria();

    const crearPila = () => {
        pila.vaciar();
        setError("");
    };

    const insertarElemento = (valor: number) => {
        try {
            pila.insertar(valor);
            setError("");
        } catch (err: any) {
            setError(err.message);
        }
    };

    const eliminarElemento = () => {
        try {
            pila.eliminar();
            setError("");
        } catch (err: any) {
            setError(err.message);
        }
    };

    const buscarElemento = (valor: number) => {
        const encontrado = pila.buscar(valor);
        setError(encontrado ? "Elemento encontrado" : "No se encontró");
    };

    const actualizarElemento = (indice: number, valor: number) => {
        try {
            pila.actualizar(indice, valor);
            setError("");
        } catch (err: any) {
            setError(err.message);
        }
    };

    const vaciarPila = () => {
        pila.vaciar();
        setError("");
    };

    const resetQueryValues = () => {
        setQuery({ valor: "", indice: "" });
    };

    return {
        pila,
        query,
        error,
        crearPila,
        insertarElemento,
        eliminarElemento,
        buscarElemento,
        actualizarElemento,
        vaciarPila,
        resetQueryValues,
        getMemoria,
    };
}
