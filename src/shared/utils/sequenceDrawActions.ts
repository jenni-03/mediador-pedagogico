import * as d3 from "d3";

/**
 * Función encargada de renderizar la estructura base de la secuencia
 * @param svg Lienzo en el que se va a dibujar 
 * @param secuencia Secuencia a dibujar
 * @param param2 Parámetros de configuración para elementos dentro del lienzo
 * @returns 
 */
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
            // Entrada de nuevos grupos
            enter => {
                // Posicionamiento de los grupos entrantes
                const gEnter = enter.append("g")
                    .attr("class", "element")
                    .attr("transform", (_d, i) => {
                        const x = margin.left + i * (elementWidth + spacing);
                        const y = (height - elementHeight) / 2;
                        return `translate(${x}, ${y})`;
                    });

                // Por cada grupo añadimos un contenedor rect
                gEnter.append("rect")
                    .attr("width", 0)
                    .attr("height", 0)
                    .attr("fill", "lightgray")
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("rx", 10)
                    .attr("ry", 10)
                    .transition()
                    .duration(1000)
                    .attr("width", elementWidth)
                    .attr("height", elementHeight)
                    .ease(d3.easeLinear);

                // Por cada grupo añadimos un elemento de texto
                gEnter.append("text")
                    .attr("x", elementWidth / 2)
                    .attr("y", elementHeight / 2)
                    .attr("dy", ".35em")
                    .attr("text-anchor", "middle")
                    .text("")
                    .attr("fill", "black")
                    .style("font-size", "18px");

                return gEnter;
            },
            // Actualización de elementos existentes
            update => {
                update.attr("transform", (_d, i) => {
                    const x = margin.left + i * (elementWidth + spacing);
                    const y = (height - elementHeight) / 2;
                    return `translate(${x}, ${y})`;
                });

                // Actualizamos los atributos de todos los rectángulos existentes
                update.select("rect")
                    .attr("fill", d => d === null ? "lightgray" : "skyblue")
                    .attr("stroke-width", 1)
                    .attr("rx", 10)
                    .attr("ry", 10);

                // Actualizamos el texto
                update.select("text")
                    .text(d => d === null ? "" : d.toString())
                    .style("opacity", 1)
                    .style("font-size", "18px");

                return update;
            }
        );

    return groups;
}

/**
 * Función encargada de animar la inserción de un nuevo elemento a la secuencia
 * @param svg Lienzo donde se va a aplicar la animación
 * @param valueToAdd Valor por añadir a la secuencia
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 */
export function animateInsertionSequence(
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
        .duration(800)
        .attr("fill", "deepskyblue")
        .attr("stroke-width", 2.5)
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

/**
 * Función encargada de animar la eliminación de un elemento existente dentro de la secuencia
 * @param targetGroup Grupo dentro del lienzo que se va a animar
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 * @param valueToDelete Valor del elemento a ser eliminado
 * @param actualValue Valor que ocupa el elemento una vez es eliminado
 */
export function animateDeleteElementSequence(
    targetGroup: d3.Selection<SVGGElement, number | null, SVGSVGElement, unknown>,
    resetQueryValues: () => void,
    valueToDelete: number,
    actualValue?: number | null
) {
    // Animamos el rectángulo: se desvanece (fade out) y luego se asigna el color de eliminación
    targetGroup.select("rect")
        .transition()
        .duration(1500)
        .attr("fill", "gray")
        .style("opacity", 0)
        .ease(d3.easeBack)
        .on("end", function () {
            d3.select(this)
                .transition()
                .duration(1000)
                .attr("fill", "lightgray")
                .style("opacity", 1);
        });

    // Animación para desvanecimiento del texto
    targetGroup.select("text")
        .text(valueToDelete)
        .transition()
        .delay(100)
        .duration(1500)
        .style("opacity", 0)
        .on("end", function () {
            d3.select(this)
                .text(actualValue ?? "")
            resetQueryValues()
        });
}

/**
 * Función encargada de animar la actualización de un elemento existente dentro de la secuencia
 * @param targetGroup Grupo dentro del lienzo que se va a animar
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 * @param oldValue Valor del elemento antes de ser actualizado
 * @param newValue Valor del elemento luego de ser actualizado
 */
export function animateUpdateSequence(
    targetGroup: d3.Selection<SVGGElement, number | null, SVGSVGElement, unknown>,
    resetQueryValues: () => void,
    oldValue: number,
    newValue: number
) {
    // Animación de resaltado
    targetGroup.select("rect")
        .transition()
        .duration(1500)
        .attr("fill", "lightgreen")
        .style("opacity", 0.5)
        .transition()
        .duration(1500)
        .attr("fill", "skyblue")
        .style("opacity", 1);

    // Animación de actualización del elemento
    targetGroup.select("text")
        .text(oldValue.toString())
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .text(newValue.toString())
        .style("opacity", 1)
        .on("end", () => {
            resetQueryValues();
        });
}

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
            .attr("fill", d === null ? "lightgray" : "skyblue") // Si el nodo no tiene info, lightgray; si sí, cyan
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
                .attr("fill", d === valueToSearch ? "violet" : "skyblue") // Si es el buscado, violet; si no, cyan
                .attr("stroke-width",  d === valueToSearch ? 2 : 1);

            if (d === valueToSearch) {
                console.log("Elemento encontrado:", valueToSearch);
                found = true; // Marcamos que lo encontramos
            }
        }, i * 1200);
    });
}