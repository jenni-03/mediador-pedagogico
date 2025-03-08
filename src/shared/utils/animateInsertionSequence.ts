import * as d3 from "d3";

export function animateInsertionSquence(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    valueToAdd: number,
    resetQueryValues: () => void
) {
    // Filtramos el grupo correspondiente
    const targetGroup = svg.selectAll("g.element")
        .filter((d) => d === valueToAdd);

    // Resaltamos el elemento donde se realizó la inserción
    targetGroup.select("rect")
        .transition()
        .delay(100)
        .duration(700)
        .attr("fill", "deepskyblue")
        .attr("stroke-width", 3)
        .ease(d3.easeBounce);

    // Transición para la aparición del elemento insertado
    targetGroup.select("text")
        .style("opacity", 0)
        .transition()
        .delay(100)
        .duration(2000)
        .style("opacity", 1)
        .on("end", function () {
            resetQueryValues()
        });
}