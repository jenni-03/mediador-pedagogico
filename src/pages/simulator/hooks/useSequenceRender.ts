import { useEffect, useRef } from "react"
import { BaseQueryOperations } from "../../../types";
import * as d3 from "d3";
import { drawBaseSequence } from "../../../shared/utils/drawBaseSequence";
import { animateInsertionSquence } from "../../../shared/utils/animateInsertionSequence";

export function useSequenceRender(secuencia: (number | null)[], query: BaseQueryOperations) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

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

    useEffect(() => {
        // Verificamos que la secuencia sea válida, que la referencia al SVG se haya establecido y que query.toAdd no sea nulo
        if (!secuencia || !svgRef.current || query.toAdd === null) return;

        console.log("INSERTANDO")

        // Seleccionamos el elemento SVG de acuerdo a su referencia
        const svg = d3.select(svgRef.current);

        // Animamos la inserción del nuevo elemento
        animateInsertionSquence(svg, secuencia, query.toAdd);
    }, [query.toAdd])

    return { svgRef }

}