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
    memoria: number[],
    { margin, elementWidth, elementHeight, spacing, height }:
        { margin: { left: number, right: number }, elementWidth: number, elementHeight: number, spacing: number, height: number },
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

                // Dirección de memoria del elemento
                gEnter.append("text")
                    .attr("class", "memory")
                    .attr("x", elementWidth / 2)
                    .attr("y", elementHeight + 20)
                    .attr("text-anchor", "middle")
                    .style("opacity", 0)
                    .text((_d, i) => memoria[i])
                    .attr("fill", "black")
                    .style("font-size", "14px")
                    .transition()
                    .duration(2500)
                    .style("opacity", 1)

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

                // Actualizamos el texto correspondiente al valor del elemento
                update.select("text")
                    .text(d => d === null ? "" : d.toString())
                    .style("opacity", 1)
                    .style("font-size", "18px");

                // Actualizamos el texto correspondiente a la dirección de memoria
                update.select("text.memory")
                    .style("font-weight", "normal");

                return update;
            }
        );

    return groups;
}

/**
 * Función encargada de animar la inserción de un nuevo elemento a la secuencia
 * @param targetGroup Grupo dentro del lienzo que se va a animar
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 */
export function animateInsertionSequence(
    targetGroup: d3.Selection<SVGGElement, number | null, SVGSVGElement, unknown>,
    resetQueryValues: () => void,
    onAnimationEnd: () => void
) {
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
            resetQueryValues();
            onAnimationEnd();
        });
}

/**
 * Función encargada de animar la eliminación de un elemento existente dentro de la secuencia
 * @param targetGroup Grupo dentro del lienzo que se va a animar
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 * @param valueToDelete Valor del elemento a ser eliminado
 */
export function animateDeleteElementSequence(
    targetGroup: d3.Selection<SVGGElement, number | null, SVGSVGElement, unknown>,
    resetQueryValues: () => void,
    valueToDelete: number
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
                .text("")
            resetQueryValues()
        });
}

/**
 * Función encargada de animar la reestructuración de los elementos afectados por una eliminación
 * @param deletedGroup Grupo dentro del lienzo referente al elemento eliminado
 * @param affectedGroups Grupos del lienzo afectados por la eliminación
 * @param nullGroup Grupo del lienzo que termina sin valor
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 * @param valueToDelete Valor eliminado
 * @param actualValue Valor que reemplaza al valor eliminado
 * @param lastValue Ultimo valor afectado por la eliminación
 */
export function animateTransformDeleteSequence(
    deletedGroup: d3.Selection<SVGGElement, number | null, SVGSVGElement, unknown>,
    affectedGroups: d3.Selection<SVGGElement, number | null, SVGSVGElement, unknown>,
    nullGroup: d3.Selection<SVGGElement, number | null, SVGSVGElement, unknown>,
    resetQueryValues: () => void,
    valueToDelete: number,
    actualValue: number | null,
    lastValue: number
) {
    // Transición para el rectángulo: fade-out y luego cambio a lightgray
    const rectTransition = deletedGroup.select("rect")
        .transition()
        .duration(1500)
        .attr("fill", "gray")
        .style("opacity", 0)
        .ease(d3.easeBack)
        .transition()
        .duration(1000)
        .attr("fill", "lightgray")
        .style("opacity", 1)
        .end()

    // Transición para el texto: fade-out y cambio final de texto
    const textTransition = deletedGroup.select("text")
        .text(valueToDelete)
        .transition()
        .delay(100)
        .duration(1500)
        .style("opacity", 0)
        .on("end", function () {
            d3.select(this).text(actualValue);
        })
        .end();

    // Una vez que ambas transiciones han finalizado, se lanza la segunda animación
    Promise.all([rectTransition, textTransition]).then(() => {
        affectedGroups.select("rect")
            .transition()
            .duration(1000)
            .attr("fill", "skyblue");

        affectedGroups.select("text")
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .transition()
            .duration(5500)
            .style("opacity", 1)
            .on("end", resetQueryValues);

        nullGroup.select("rect")
            .transition()
            .duration(1500)
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .style("opacity", 1)
            .attr("fill", "lightgray");

        nullGroup.select("text")
            .transition()
            .duration(1500)
            .style("opacity", 0)
            .on("end", function () {
                d3.select(this)
                    .text("")
            });
    });

    // Elementos necesarios antes de comenzar la eliminación
    nullGroup.select("rect")
        .attr("fill", "skyblue")

    nullGroup.select("text")
        .text(lastValue);
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

/**
 * Función encargada de animar la búsqueda de un elemento dentro de la secuencia
 * @param svg Lienzo donde se va a aplicar la animación
 * @param valueToSearch Valor a buscar
 */
export function animateSearchSequence(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    valueToSearch: number
) {
    // Seleccionamos los elementos
    const elements = svg.selectAll("g.element");

    // Bandera para detener la animación
    let found = false;

    // Restablecemos todos los elementos a su color original antes de iniciar la animación
    elements.each(function (d) {
        d3.select(this).select("rect")
            .attr("fill", d === null ? "lightgray" : "skyblue")
            .attr("stroke-width", 1);

        d3.select(this).select("text.memory")
            .style("font-weight", "normal");
    });

    // Recorremos cada elemento
    elements.each(function (d, i) {
        // Si se encuentra el elemento detenemos la ejecución
        if (found) return;

        // Añadimos un retardo al procesamiento de cada elemento
        setTimeout(() => {
            // Evitamos que se procese el timeout si el elemento ya fue encontrado
            if (found) return;

            // Selección del elemento actual
            const el = d3.select(this);

            // Transición en cascada
            el.select("rect")
                .transition()
                .duration(500)
                .attr("fill", "violet")
                .transition()
                .duration(500)
                .attr("fill", d === valueToSearch ? "violet" : "skyblue")
                .attr("stroke-width", d === valueToSearch ? 2 : 1);

            // Si se encuentra el elemento, actualizamos el flag de busqueda
            if (d === valueToSearch) {
                el.select("text.memory").style("font-weight", "bold")
                found = true;
            }
        }, i * 1200);
    });
}