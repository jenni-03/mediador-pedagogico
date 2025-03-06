import * as d3 from "d3";

export function drawBaseSequence(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    secuencia: (number | null)[],
    { margin, elementWidth, elementHeight, spacing, height }:
        { margin: { left: number, right: number }, elementWidth: number, elementHeight: number, spacing: number, height: number }
) {
    // Realizamos el data join usando el indice como key
    const groups = svg.selectAll<SVGGElement, number | null>("g.element")
        .data(secuencia, (_d, i) => i)
        .join(
            enter => {
                const gEnter = enter.append("g")
                    .attr("class", "element")
                    .attr("transform", (_d, i) => {
                        const x = margin.left + i * (elementWidth + spacing);
                        const y = (height - elementHeight) / 2;
                        return `translate(${x}, ${y})`;
                    });

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
            },
            update => {
                update.attr("transform", (_d, i) => {
                    const x = margin.left + i * (elementWidth + spacing);
                    const y = (height - elementHeight) / 2;
                    return `translate(${x}, ${y})`;
                });

                // Aquí forzamos los atributos de todos los rectángulos existentes
                update.select("rect")
                    .attr("fill", d => d === null ? "lightgray" : "cyan")
                    .attr("stroke-width", 1)
                    .attr("rx", 10)
                    .attr("ry", 10);

                // También podrías actualizar el texto si lo deseas:
                update.select("text")
                    .text(d => d === null ? "" : d.toString())
                    .style("opacity", 1)
                    .style("font-size", "18px");

                return update;
            },
            exit => exit.transition().duration(500).style("opacity", 0).remove()
        );

    return groups;
}