// MetodoAnalisisCard.tsx
import { useState, useEffect } from "react";
import { MetodoAnalisis } from "./analysisData";

export function MetodoAnalisisCard({ metodo }: { metodo: MetodoAnalisis }) {
    const [mostrar, setMostrar] = useState(false);
    const [lineasMostradas, setLineasMostradas] = useState(0);

    useEffect(() => {
        if (mostrar && lineasMostradas < metodo.codigo.length) {
            const timeout = setTimeout(() => {
                setLineasMostradas((prev) => prev + 1);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [mostrar, lineasMostradas]);

    const handleMostrar = () => {
        setMostrar(true);
        setLineasMostradas(0);
    };

    const handleOcultar = () => {
        setMostrar(false);
        setLineasMostradas(0);
    };

    return (
        <div className="mb-10">
            <h2 className="text-lg font-semibold mb-2">
                {metodo.id}. {metodo.titulo} <span className="text-sm text-gray-500">({metodo.metodo})</span>
            </h2>

            {!mostrar && (
                <button
                    onClick={handleMostrar}
                    className="border border-blue-500 text-blue-500 px-4 py-1 rounded hover:bg-blue-100 transition"
                >
                    Mostrar Análisis
                </button>
            )}

            {mostrar && (
                <div className="mt-4">
                    <div className="bg-gray-900 text-white rounded-lg p-4 font-mono text-sm shadow-md whitespace-pre">
                        {metodo.codigo.slice(0, lineasMostradas).map((linea, idx) => (
                            <div key={idx}>{linea}</div>
                        ))}
                    </div>

                    {lineasMostradas === metodo.codigo.length && (
                        <>
                            <div className="mt-4 px-4 py-2 border-l-4 border-red-500 bg-red-50 text-sm text-gray-800">
                                <p className="font-semibold mb-1">Costo Operacional</p>
                                <p>{metodo.costo}</p>
                                <p className="mt-1 text-gray-700 italic">BigO = {metodo.bigO}</p>
                            </div>

                            <button
                                onClick={handleOcultar}
                                className="mt-4 border border-red-500 text-red-500 px-4 py-1 rounded hover:bg-red-100 transition"
                            >
                                Ocultar Análisis
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
