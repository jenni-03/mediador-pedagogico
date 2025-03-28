import * as d3 from "d3";

/**
 * Función encargada de renderizar la estructura base de la secuencia
 * @param svg Lienzo en el que se va a dibujar
 * @param secuencia Secuencia a dibujar
 * @param memoria Direcciones de memoria asociadas a cada elemento de la secuencia
 * @param dims Dimensiones de los elementos dentro del lienzo
 * @returns 
 */
export function drawBaseSequence(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    secuencia: (number | null)[],
    memoria: number[],
    dims: {
        margin: { left: number, right: number },
        elementWidth: number,
        elementHeight: number,
        spacing: number,
        height: number
    },
) {
    // Dimensiones del lienzo
    const { margin, elementWidth, elementHeight, spacing, height } = dims;

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
                    .attr("class", "sequence-rect")
                    .attr("width", 0)
                    .attr("height", 0)
                    .attr("fill", "white")
                    .attr("stroke", "gray")
                    .attr("stroke-width", 1)
                    .transition()
                    .duration(1000)
                    .attr("width", elementWidth)
                    .attr("height", elementHeight)
                    .ease(d3.easeQuad);

                // Elemento de texto para el valor del elemento
                gEnter.append("text")
                    .attr("x", elementWidth / 2)
                    .attr("y", elementHeight / 2)
                    .attr("dy", ".35em")
                    .attr("text-anchor", "middle")
                    .text("")
                    .attr("fill", "black");

                // Contenedor rect para el texto de memoria
                gEnter.append("rect")
                    .attr("class", "memory-container")
                    .attr("y", elementHeight + 10)
                    .attr("width", 0)
                    .attr("height", 0)
                    .attr("fill", "#d1fae5")
                    .attr("stroke", "gray")
                    .attr("stroke-width", 1)
                    .transition()
                    .duration(1000)
                    .attr("width", elementWidth)
                    .attr("height", 20)
                    .ease(d3.easeQuad);

                // Elemento de texto para la dirección de memoria
                gEnter.append("text")
                    .attr("class", "memory")
                    .attr("x", elementWidth / 2)
                    .attr("y", elementHeight + 25)
                    .attr("text-anchor", "middle")
                    .style("opacity", 0)
                    .text((_d, i) => memoria[i])
                    .attr("fill", "black")
                    .style("font-size", "14px")
                    .style("font-weight", "500")
                    .transition()
                    .duration(2500)
                    .style("opacity", 1);

                // Elemento de texto para el indice del elemento
                gEnter.append("text")
                    .attr("class", "index")
                    .attr("x", elementWidth / 2)
                    .attr("y", -15)
                    .attr("text-anchor", "middle")
                    .style("opacity", 0)
                    .text((_d, i) => i)
                    .attr("fill", "black")
                    .style("font-size", "14px")
                    .style("font-weight", "500")
                    .transition()
                    .duration(2500)
                    .style("opacity", 1);

                return gEnter;
            },
            // Actualización de elementos existentes
            update => {
                update.attr("transform", (_d, i) => {
                    const x = margin.left + i * (elementWidth + spacing);
                    const y = (height - elementHeight) / 2;
                    return `translate(${x}, ${y})`;
                });

                // Actualización del rectángulo principal
                update.select("rect.sequence-rect")
                    .attr("fill", d => d === null ? "white" : "#fee2e2")
                    .attr("stroke", "gray")
                    .attr("stroke-width", 1);

                // Actualización del texto correspondiente al valor del elemento
                update.select("text")
                    .text(d => d === null ? "" : d.toString())
                    .style("font-size", "16px");

                // Actualización del texto correspondiente al indice del elemento
                update.select("text.index")
                    .text((_d, i) => i);

                return update;
            }
        );

    return groups;
}

/**
 * Función encargada de animar la inserción de un nuevo elemento a la secuencia
 * @param svg Lienzo en el que se va a dibujar
 * @param targetGroup Grupo dentro del lienzo que se va a animar
 * @param insertionValue Valor a insertar
 * @param insertionIndex Indice del elemento donde se va a insertar el nuevo valor
 * @param dims Dimensiones de los elementos dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function animateInsertionSequence(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    targetGroup: d3.Selection<SVGGElement, number | null, SVGSVGElement, unknown>,
    insertionValue: number,
    insertionIndex: number,
    dims: {
        margin: { left: number, right: number },
        elementWidth: number,
        elementHeight: number,
        spacing: number,
        height: number
    },
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
    // Dimensiones del lienzo
    const { margin, elementWidth, elementHeight, spacing, height } = dims;

    // Posición de destino del nuevo elemento
    const destX = margin.left + insertionIndex * (elementWidth + spacing);
    const destY = (height - elementHeight) / 2;

    // Posición incial del nuevo elemento
    const startX = destX + elementWidth / 2;
    const startY = 12;

    // Reestablecimiento del texto del contenedor donde se va a insertar el elemento
    targetGroup.select("text")
        .text("");

    // Creación o reutilización de un grupo temporal para la inserción
    let insertionGroup = svg.select<SVGGElement>("g#insertion-group");
    if (insertionGroup.empty()) {
        insertionGroup = svg.append("g")
            .attr("id", "insertion-group");
    }

    // Limpieza de todos los elementos hijos previos en ese grupo
    insertionGroup.selectAll("*").remove();

    // Creación del elemento flecha que indica la dirección de inserción
    const arrow = insertionGroup.append("path")
        .attr("class", "insertion-arrow")
        .attr("d", "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z")
        .attr("fill", "red")
        .attr("transform", `translate(${destX + elementWidth / 2}, ${destY - 40})`)
        .style("opacity", 0);

    // Transición del elemento flecha para que aparezca
    await arrow.transition()
        .delay(100)
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Elemento de texto que representa el valor a insertar, 
    // posicionado inicialmente justo arriba del indicador de inserción.
    const newElement = insertionGroup.append("text")
        .attr("x", startX)
        .attr("y", startY)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("font-size", "16px")
        .text(insertionValue)
        .style("opacity", 0);

    // Transición para la aparición del valor a insertar 
    await newElement.transition()
        .duration(1500)
        .style("opacity", 1)
        .end();

    // Transición para el resaltado del contenedor donde se va a insertar el nuevo elemento
    await targetGroup.select("rect.sequence-rect")
        .transition()
        .duration(500)
        .attr("stroke", "#f87171")
        .attr("stroke-width", 3)
        .end();

    // Transición para el desplazamiento del nuevo elemento al centro de la posición de destino
    await newElement.transition()
        .duration(2000)
        .attr("x", destX + elementWidth / 2)
        .attr("y", destY + 38)
        .ease(d3.easePoly)
        .end();

    // Desvanecimiento del indicador de inserción
    await arrow.transition()
        .duration(500)
        .style("opacity", 0)
        .end();

    // Reestablecemos el valor del texto del contenedor principal
    targetGroup.select("text").text(insertionValue);

    // Eliminamos el grupo de inserción
    insertionGroup.remove();

    // Restablecemos los valores de las queries del usuario
    resetQueryValues();

    // Finalizamos la animación
    setIsAnimating(false);
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
    valueToDelete: number,
    onAnimationEnd: () => void
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
            onAnimationEnd()
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
 * @param svg Lienzo en el que se va a dibujar
 * @param targetGroup Grupo dentro del lienzo que se va a animar
 * @param oldValue Valor del elemento antes de ser actualizado
 * @param newValue Valor del elemento luego de ser actualizado
 * @param pos Posición del elemento dentro de la secuencia que se va a actualizar
 * @param dims Dimensiones de los elementos dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 * @param setIsAnimating Función que establece el estado de animación 
 */
export async function animateUpdateSequence(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    targetGroup: d3.Selection<SVGGElement, number | null, SVGSVGElement, unknown>,
    oldValue: number,
    newValue: number,
    pos: number,
    dims: {
        margin: { left: number, right: number },
        elementWidth: number,
        elementHeight: number,
        spacing: number,
        height: number
    },
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
    // Dimensiones del lienzo
    const { margin, elementWidth, elementHeight, spacing, height } = dims;

    // Posición de destino del nuevo elemento
    const destX = margin.left + pos * (elementWidth + spacing);
    const destY = (height - elementHeight) / 2;

    // Posición incial del nuevo elemento
    const startX = destX + elementWidth / 2;
    const startY = 12;

    // Reestablecimiento del valor original del texto del contenedor donde se va a actualizar el elemento
    targetGroup.select("text")
        .text(oldValue);

    // Creación o reutilización de un grupo temporal para la actualización
    let updatedGroup = svg.select<SVGGElement>("g#update-group");
    if (updatedGroup.empty()) {
        updatedGroup = svg.append("g")
            .attr("id", "update-group");
    }

    // Limpieza de todos los elementos hijos previos en ese grupo
    updatedGroup.selectAll("*").remove();

    // Creación del elemento flecha que indica el elemento que se va actualizar
    const arrow = updatedGroup.append("path")
        .attr("class", "update-arrow")
        .attr("d", "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z")
        .attr("fill", "red")
        .attr("transform", `translate(${destX + elementWidth / 2}, ${destY - 40})`)
        .style("opacity", 0);

    // Transición del elemento flecha para que aparezca
    await arrow.transition()
        .delay(100)
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Elemento de texto que representa el nuevo valor del elemento, 
    // posicionado inicialmente justo arriba del indicador de actualización.
    const newElement = updatedGroup.append("text")
        .attr("x", startX)
        .attr("y", startY)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("font-size", "16px")
        .text(newValue.toString())
        .style("opacity", 0);

    // Transición para la aparición del texto correspondiente al nuevo valor 
    await newElement.transition()
        .duration(1500)
        .style("opacity", 1)
        .end();

    // Transición para el resaltado del contenedor a actualizar
    await targetGroup.select("rect.sequence-rect")
        .transition()
        .duration(500)
        .attr("stroke", "#f87171")
        .attr("stroke-width", 3)
        .end();

    // Desvanecimiento del texto original
    await targetGroup.select("text")
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .end();

    // Transición para el desplazamiento del nuevo elemento al centro de la posición de destino
    await newElement.transition()
        .duration(2000)
        .attr("x", destX + elementWidth / 2)
        .attr("y", destY + 38)
        .ease(d3.easePoly)
        .end();

    // Desvanecimiento del indicador de actualización
    await arrow.transition()
        .duration(500)
        .style("opacity", 0)
        .end();

    // Reestablecemos el valor del texto del contenedor principal
    targetGroup.select("text")
        .text(newValue)
        .style("opacity", 1);

    // Eliminamos el grupo de actualización
    updatedGroup.remove();

    // Restablecemos los valores de las queries del usuario
    resetQueryValues();

    // Finalizamos la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la búsqueda de un elemento dentro de la secuencia
 * @param svg Lienzo donde se va a aplicar la animación
 * @param valueToSearch Valor a buscar
 */
export async function animateSearchSequence(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    valueToSearch: number,
    dims: {
        margin: { left: number, right: number },
        elementWidth: number,
        elementHeight: number,
        spacing: number,
        height: number
    },
    onAnimationEnd: () => void
): Promise<void> {
    // Extraemos las dimensiones
    const { margin, elementWidth, elementHeight, spacing, height } = dims;

    // Seleccionamos los elementos
    const elements = svg.selectAll("g.element");

    // Restablecemos los bordes de los contenedores antes de iniciar la animación
    elements.each(function () {
        d3.select(this).select("rect.sequence-rect")
            .attr("stroke", "gray")
            .attr("stroke-width", 1);
    });

    // Creamos o reutilizamos una grupo temporal para la flecha indicatoria
    let searchGroup = svg.select<SVGGElement>("g#search-group");
    if (searchGroup.empty()) {
        searchGroup = svg.append("g")
            .attr("id", "search-group");
    }

    // Creamos la flecha indicatoria usando un path
    const arrow = searchGroup.append("path")
        .attr("class", "search-arrow")
        .attr("d", "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z")
        .attr("fill", "red")
        .style("opacity", 0);

    // Indicamos la posición inicial de la flecha (justo arriba del primer elemento)
    const startX = margin.left + elementWidth / 2;
    const startY = (height - elementHeight) / 2 - 40;
    await arrow.transition()
        .duration(500)
        .style("opacity", 1)
        .attr("transform", `translate(${startX}, ${startY})`)
        .end();

    // Variable de control
    let found = false;
    const elementsNodes = elements.nodes();

    // Recorremos cada elemento de forma secuencial
    for (let i = 0; i < elementsNodes.length; i++) {
        // Si se encuentra el elemento detenemos la ejecución
        if (found) break;

        // Calculamos la posición del elemento actual
        const xPos = margin.left + i * (elementWidth + spacing) - elementWidth / 2;
        const yPos = (height - elementHeight) / 2 - 20;

        // Movemos la flecha al elemento actual
        await arrow.transition()
            .duration(1000)
            .attr("transform", `translate(${xPos}, ${yPos})`)
            .end();

        // Resaltamos brevemente el rectángulo del elemento actual
        const currentElement = d3.select(elementsNodes[i]);
        await currentElement.select("rect")
            .transition()
            .duration(400)
            .attr("fill", "violet")
            .transition()
            .duration(400)
            .attr("fill", "lightgray")
            .end();

        // Verificar si el dato del elemento coincide con el valor buscado.
        const d = currentElement.datum();
        if (d === valueToSearch) {
            // Resaltar el elemento encontrado de forma definitiva
            currentElement.select("rect")
                .attr("fill", "violet")
                .attr("stroke-width", 2);
            currentElement.select("text.memory")
                .style("font-weight", "bold");
            found = true;
            break;
        }
    }

    // Desvanecer la flecha y limpiar la capa overlay
    await arrow.transition()
        .duration(500)
        .style("opacity", 0)
        .end();
    searchGroup.remove();
    onAnimationEnd();
}