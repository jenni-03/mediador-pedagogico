import { useEffect, useRef } from "react"
import { BaseQueryOperations } from "../../../types";
import * as d3 from "d3";

export function useSequenceRender(secuencia: (number | null)[], query: BaseQueryOperations) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        // En caso de que la secuencia sea nula o indefinida
        if (!secuencia) return;

        console.log(query);

        // Margenes para el SVG
        const margin = { left: 20, right: 20 };

        // Dimensiones de cada elemento (rectángulos)
        const elementWidth = 70;
        const elementHeight = 70;

        // Espaciado entre elementos (rectángulos)
        const spacing = 10;

        // Definimos las dimensiones para el SVG 
        const width = margin.left + secuencia.length * (elementWidth + spacing) - spacing;
        const height = 100;

        // Configuración del contenedor SVG
        const svg = d3.select(svgRef.current)
            .attr("height", height)
            .attr("width", width);

        // Limpiamos el SVG
        svg.selectAll("*").remove();

        // Creamos un grupo para cada elemento (contendrá el rectángulo y el texto)
        const groups = svg.selectAll<SVGGElement, number | null>("g.element")
            .data(secuencia, (_d, i) => i)
            .join(
                enter => {
                    // Creación y posicionamiento de los grupos
                    const gEnter = enter
                        .append("g")
                        .attr("class", "element")
                        .attr("transform", (_d, i) => {
                            const x = margin.left + i * (elementWidth + spacing);
                            const y = (height - elementHeight) / 2;
                            return `translate(${x}, ${y})`;
                        });

                    // Por cada grupo dibujamos un rectángulo para representar cada elemento de la secuencia
                    gEnter.append("rect")
                        .attr("width", 0)
                        .attr("height", 0)
                        .attr("fill", d => d === null ? "lightgray" : "cyan")
                        .attr("stroke", "black")
                        .attr("stroke-width", 1)
                        .attr("rx", 10)
                        .attr("ry", 10)
                        .transition()
                        .duration(1000)
                        .attr("width", elementWidth)
                        .attr("height", elementHeight)
                        .ease(d3.easeLinear);

                    // Por cada grupo añadimos un texto correspondiente al dato del elemento de la secuencia
                    gEnter.append("text")
                        .attr("x", elementWidth / 2)
                        .attr("y", elementHeight / 2)
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .text(d => d === null ? "" : d.toString())
                        .attr("fill", "black")
                        .style("opacity", 0)
                        .style("font-size", "18px")
                        .transition()
                        .delay(300)
                        .duration(700)
                        .style("opacity", 1);

                    return gEnter;
                }
            );

        // Operación de inserción
        if (query.toAdd !== null) {
            // Resaltar el rectángulo correspondiente a la inserción
            groups
                .filter(d => d === query.toAdd)
                .select("rect")
                .transition()
                .delay(100)
                .duration(700)
                .attr("fill", "cyan")
                .attr("stroke-width", 2)
                .attr("width", elementWidth)
                .attr("height", elementHeight)
                .ease(d3.easeBounce);

            // Actualizar el texto del rectángulo, si es que estaba vacío, con una transición de opacidad
            groups
                .filter(d => d === query.toAdd)
                .select("text")
                .transition()
                .delay(100)
                .duration(700)
                .style("opacity", 0)
                .on("end", function () {
                    d3.select(this)
                        .text(query.toAdd !== null ? query.toAdd.toString() : "")
                        .transition()
                        .duration(700)
                        .style("opacity", 1);
                });
        }

        // Operación de eliminación
        if (query.toDelete !== null) {
            // Cambiamos el valor del texto del rectángulo 
            groups.filter(d => d === null)
                .select("rect")
                .transition()
                .duration(500)
                .attr("fill", "lightgray")
                .ease(d3.easeLinear);

            groups.filter(d => d === null)
                .select("text")
                .transition()
                .duration(500)
                .style("opacity", 0)
                .on("end", function () {
                    d3.select(this).text("");
                });
        }

    }, [secuencia, query]);

    return { svgRef }

}