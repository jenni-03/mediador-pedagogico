import * as d3 from "d3";

export function animateSearchSequence(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodoEncontrado: (number | null)[],
    valueToSearch: number
) {

    const elements = svg.selectAll("g.element"); // Seleccionamos los elementos
    let found = false; // Bandera para detener la animación

    // Restablecer todos los elementos a su color original antes de iniciar la animación
    elements.each(function (d) {
        d3.select(this).select("rect")
            .attr("fill", d === null ? "lightgray" : "cyan") // Si el nodo no tiene info, lightgray; si sí, cyan
            .attr("stroke-width", 1);
    });

    elements.each(function (d, i) {
        if (found) return; // Si ya lo encontramos, no hacemos nada más

        setTimeout(() => {
            if (found) return; // Si se encontró antes de que este timeout corra, salir

            const el = d3.select(this);

            el.select("rect")
                .transition()
                .duration(500)
                .attr("fill", "violet") // Resaltar en violet mientras se hace el recorrido
                .transition()
                .duration(500)
                .attr("fill", d === valueToSearch ? "violet" : "cyan") // Si es el buscado, violet; si no, cyan
                .attr("stroke-width",  d === valueToSearch ? 2 : 1);

            if (d === valueToSearch) {
                console.log("Elemento encontrado:", valueToSearch);
                found = true; // Marcamos que lo encontramos
            }
        }, i * 1200);
    });
}