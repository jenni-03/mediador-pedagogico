import { useState } from "react"
import { Secuencia } from "../../../shared/utils/structures/Secuencia"
import { BaseQueryOperations } from "../../../types";

export function useSequence() {
    // Estado para manejar la secuencia
    const [secuencia, setSecuencia] = useState(new Secuencia(0));

    //Estado para manejar el error
    const [error, setError] = useState<string | null>(null);

    // Estado para manejar las query del usuario
    const [query, setQuery] = useState<BaseQueryOperations>({
        create: null,
        toAdd: null,
        toDelete: null,
        toSearch: null,
        toUpdate: []
    });

    const insertarElemento = (elemento: number) => {
        try {
            const nuevaSecuencia = secuencia.clonar();
            nuevaSecuencia.insertar(elemento);
            setSecuencia(nuevaSecuencia);
            setQuery((prev) => ({
                ...prev,
                toAdd: elemento
            }));
            setError(null);
        } catch (error: any) {
            setError(error.message);
        }
    }

    const eliminarElemento = (pos: number) => {
        try {
            const nuevaSecuencia = secuencia.clonar();
            nuevaSecuencia.eliminarPos(pos);
            setSecuencia(nuevaSecuencia);
            setQuery((prev) => ({
                ...prev,
                toDelete: pos
            }));
            setError(null);
        } catch (error: any) {
            setError(error.message);
        }
    }

    const buscarElemento = (elemento: number) => {
        try {
            if (secuencia.esta(elemento)) {
                setQuery((prev) => ({
                    ...prev,
                    toSearch: elemento
                }));
            }
        } catch (error: any) {
            setError(error.message);
        }
    };

    const actualizarElemento = (pos: number, elemento: number) => {
        const nuevaSecuencia = secuencia.clonar();
        nuevaSecuencia.set(pos, elemento);
        setSecuencia(nuevaSecuencia);
        setQuery((prev) => ({
            ...prev,
            toUpdate: [pos, elemento]
        }));
    }

    const crearSecuencia = (n: number) => {
        const nuevaSecuencia = new Secuencia(n);
        setSecuencia(nuevaSecuencia);
        setQuery((prev) => ({
            ...prev,
            create: n
        }));
    }

    const vaciarSecuencia = () => {
        const nuevaSecuencia = secuencia.clonar();
        nuevaSecuencia.vaciar();
        setSecuencia(nuevaSecuencia);
    }

    const resetQueryValues = () => {
        setQuery({
            create: null,
            toAdd: null,
            toDelete: null,
            toSearch: null,
            toUpdate: []
        })
    }

    const getMemoria = () => {
        return secuencia.getVectorMemoria();
    }

    return {
        secuencia,
        query,
        error,
        insertarElemento,
        eliminarElemento,
        buscarElemento,
        actualizarElemento,
        crearSecuencia,
        vaciarSecuencia,
        resetQueryValues,
        getMemoria
    }
}