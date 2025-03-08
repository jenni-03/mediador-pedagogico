import * as d3 from "d3";

export function animateDeletionSequence(
    selection: d3.Selection<SVGGElement, number | null, SVGSVGElement, unknown>,
    resetQueryValues: () => void
) {
    // Animamos el rectángulo: se desvanece (fade out) y luego se asigna el color de eliminación
    selection.select("rect")
        .interrupt()
        .transition()
        .duration(2000)
        .style("opacity", 0)
        .on("end", function () {
            d3.select(this)
                .attr("fill", "lightgray")
                .style("opacity", 1);
            resetQueryValues();
        });

    // Animación del texto: fade out
    selection.select("text")
        .interrupt()
        .transition()
        .duration(2000)
        .style("opacity", 0);
}