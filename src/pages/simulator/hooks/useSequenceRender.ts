import { useEffect, useRef } from "react"
import { BaseQueryOperations } from "../../../types";
import * as d3 from "d3";

export function useSequenceRender(secuencia: (number | null)[], query: BaseQueryOperations) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        // En caso de que la secuencia sea nula o indefinida
        if (!secuencia) return;

        // Definimos las dimensiones para el SVG - TODO: revisar responsive 
        const width = 600;
        const height = 100;

        // Margenes para el SVG
        const margin = { left: 20, right: 20 };

        // Dimensiones de cada elemento (rectángulos)
        const elementWidth = 50;
        const elementHeight = 50;

        // Espaciado entre elementos (rectángulos)
        const spacing = 10;

        // Configuración del contenedor SVG
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        // Limpiamos el SVG
        svg.selectAll("*").remove();

        // Creamos un grupo para cada elemento (contendrá el rectángulo y el texto)
        const selection = svg.selectAll<SVGGElement, number | null>("g.element")
            .data(secuencia, (_d, i) => i);

        // --ENTER SELECTION--
        const enterSelection = selection.enter()
            .append("g")
            .attr("class", "element")
            .attr("transform", (_d, i) => {
                // Calculamos la posición X: margen izquierdo + índice * (ancho + espacio)
                const x = margin.left + i * (elementWidth + spacing);
                // Calculamos Y para centrar el elemento
                const y = (height - elementHeight) / 2;
                // Transformación que mueve el elemento a la posición indicada
                return `translate(${x}, ${y})`;
            });

        // Por cada grupo dibujamos un rectángulo para representar cada elemento de la secuencia
        enterSelection.append("rect")
            .attr("width", 0)
            .attr("height", 0)
            .attr("fill", d => d === null ? "lightgray" : "cyan")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .transition()
            .duration(1000)
            .attr("width", elementWidth)
            .attr("height", elementHeight)
            .ease(d3.easeLinear);

        // Por cada grupo añadimos un texto correspondiente al dato del elemento de la secuencia
        enterSelection.append("text")
            .attr("x", elementWidth / 2)
            .attr("y", elementHeight / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(d => d === null ? "" : d.toString())
            .attr("fill", "black")
            .style("opacity", 0)
            .transition()
            .delay(300)
            .duration(700)
            .style("opacity", 1);

        // -- UPDATE SELECTION --
        const updateSelection = selection
            .merge(enterSelection)
            .attr("transform", (_d, i) => {
                const x = margin.left + i * (elementWidth + spacing);
                const y = (height - elementHeight) / 2;
                return `translate(${x}, ${y})`;
            });

        // --- EXIT SELECTION ---
        selection.exit()
            .transition()
            .duration(500)
            .style("opacity", 0)
            .remove();

        // Si hay una operación de inserción, resaltamos el rectangulo
        if (query.toAdd !== null) {
            svg.selectAll("g.element")
                .filter((d) => d === query.toAdd)
                .select("rect")
                .transition()
                .delay(100)
                .duration(700)
                .attr("width", elementWidth)
                .attr("height", elementHeight);
        }

    }, [secuencia, query]);

    return { svgRef }

}