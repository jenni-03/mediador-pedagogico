import * as d3 from "d3";

export function animateInsertionSquence(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    secuencia: (number | null)[],
    valueToAdd: number,
) {
    // Filtramos el grupo correspondiente
    const targetGroup = svg.selectAll("g.element")
        .filter((d) => d === valueToAdd);

    targetGroup.select("rect")
        .transition()
        .delay(100)
        .duration(700)
        .attr("fill", "dodgerblue")
        .attr("stroke-width", 4)
        .ease(d3.easeBounce);

    targetGroup.select("text")
        .transition()
        .delay(100)
        .duration(700)
        .style("opacity", 0)
        .on("end", function () {
            d3.select(this)
                .text(valueToAdd.toString())
                .transition()
                .duration(700)
                .style("opacity", 1)
        });
}