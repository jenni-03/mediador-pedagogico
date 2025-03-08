import { useEffect, useRef } from "react"
import { BaseQueryOperations } from "../../../types";
import * as d3 from "d3";
import { drawBaseSequence } from "../../../shared/utils/drawBaseSequence";
import { animateInsertionSquence } from "../../../shared/utils/animateInsertionSequence";
import { usePrevious } from "../../../shared/hooks/usePrevious";
import { animateDeletionSequence } from "../../../shared/utils/animateDeletionSequence";

export function useSequenceRender(secuencia: (number | null)[], query: BaseQueryOperations, resetQueryValues: () => void) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Almacenamos la secuencia previa para la detección de eliminaciones
    const prevSecuencia = usePrevious(secuencia);

    console.log("Secuencia previa xd")
    console.log(prevSecuencia)
    console.log("--------")
    console.log(secuencia);
    console.log(query);

    useEffect(() => {
        // Verificamos que la secuencia sea válida y que la referencia al SVG se haya establecido
        if (!secuencia || !svgRef.current) return;

        console.log("RENDERIZANDO")

        // Margenes para el SVG
        const margin = { left: 20, right: 20 };

        // Dimensiones de cada elemento (rectángulos)
        const elementWidth = 70;
        const elementHeight = 70;

        // Espaciado entre elementos (rectángulos)
        const spacing = 10;

        // Definimos las dimensiones para el SVG dependiendo del número de elementos de la secuencia
        const width = margin.left + secuencia.length * (elementWidth + spacing) - spacing;
        const height = 100;

        // Configuración del contenedor SVG
        const svg = d3.select(svgRef.current)
            .attr("height", height)
            .attr("width", width);

        // Creamos la estructura base de la secuencia en el lienzo
        drawBaseSequence(svg, secuencia, { margin, elementWidth, elementHeight, spacing, height });
    }, [secuencia]);

    // Operación de inserción
    useEffect(() => {
        // Verificamos que la secuencia sea válida, que la referencia al SVG se haya establecido y que query.toAdd no sea nulo
        if (!secuencia || !svgRef.current || query.toAdd === null) return;

        console.log("INSERTANDO")

        // Seleccionamos el elemento SVG de acuerdo a su referencia
        const svg = d3.select(svgRef.current);

        // Animamos la inserción del nuevo elemento
        animateInsertionSquence(svg, query.toAdd, resetQueryValues);
    }, [query.toAdd]);

    // Operación de eliminación
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!secuencia || !svgRef.current || query.toDelete === null || !prevSecuencia) return;

        console.log("ELIMINANDO")

        // Buscamos el índice o índices donde el elemento pasó de tener un valor a ser null
        console.log("Secuencia previa xd")
        console.log(prevSecuencia);
        const indicesEliminados = secuencia.reduce<number[]>((acc, curr, i) => {
            if (prevSecuencia[i] !== null && curr === null) {
                acc.push(i);
            }
            return acc;
        }, []);

        console.log("Índices eliminados:", indicesEliminados);

        // Seleccionamos el elemento SVG de acuerdo a su referencia
        const svg = d3.select(svgRef.current);

        // Para cada índice eliminado, aplicamos la animación de eliminación
        indicesEliminados.forEach((index) => {
            svg.selectAll<SVGGElement, number | null>("g.element")
                .filter((_d, i) => i === index)
                .call(animateDeletionSequence, resetQueryValues);
        });
    }, [query.toDelete]);

    return { svgRef }

}