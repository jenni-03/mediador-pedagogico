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

    // Restablecimiento del texto del contenedor donde se va a insertar el elemento
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

    // Restablecimiento del valor del texto del contenedor principal
    targetGroup.select("text").text(insertionValue);

    // Limpieza del grupo de inserción
    insertionGroup.remove();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación del ultimo elemento con valor dentro de la secuencia
 * @param svg Lienzo en el que se va a dibujar 
 * @param targetGroup Grupo dentro del lienzo que se va a animar
 * @param deletedValue Valor del elemento eliminado 
 * @param deletedIndex Indice del elemento eliminado
 * @param dims Dimensiones de los elementos dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function animateDeleteLastElementSequence(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    targetGroup: d3.Selection<SVGGElement, number | null, SVGSVGElement, unknown>,
    deletedValue: number,
    deletedIndex: number,
    dims: {
        margin: { left: number, right: number },
        elementWidth: number,
        elementHeight: number,
        spacing: number,
        height: number
    },
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Dimensiones del lienzo
    const { margin, elementWidth, elementHeight, spacing, height } = dims;

    // Posición del elemento a eliminar
    const destX = margin.left + deletedIndex * (elementWidth + spacing);
    const destY = (height - elementHeight) / 2;

    // Restablecimiento del texto original del contenedor del elemento eliminado
    targetGroup.select("text")
        .text(deletedValue);

    // Restablecimiento del color original de fondo para el contenedor del elemento eliminado
    targetGroup.select("rect.sequence-rect")
        .attr("fill", "#fee2e2");

    // Creación o reutilización de un grupo temporal para la eliminación
    let deleteGroup = svg.select<SVGGElement>("g#delete-group");
    if (deleteGroup.empty()) {
        deleteGroup = svg.append("g")
            .attr("id", "delete-group");
    }

    // Limpieza de todos los elementos hijos previos en ese grupo
    deleteGroup.selectAll("*").remove();

    // Creación del elemento flecha que indica la dirección de eliminación
    const arrow = deleteGroup.append("path")
        .attr("class", "insertion-arrow")
        .attr("d", "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z")
        .attr("fill", "red")
        .attr("transform", `translate(${destX + elementWidth / 2}, ${destY - 40})`)
        .style("opacity", 0);

    // Transición de aparición del elemento flecha
    await arrow.transition()
        .delay(100)
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Desvanecimiento del texto original
    await targetGroup.select("text")
        .transition()
        .delay(100)
        .duration(1500)
        .ease(d3.easeBounce)
        .style("opacity", 0)
        .end();

    // Transición para el cambio de fondo del contenedor del elemento eliminado
    await targetGroup.select("rect.sequence-rect")
        .transition()
        .delay(100)
        .duration(2000)
        .ease(d3.easeBounce)
        .attr("fill", "white")
        .end();

    // Restablecimiento del texto resultante de la operación de eliminación
    targetGroup.select("text")
        .text("")
        .style("opacity", 1);

    // Desvanecimiento del indicador de eliminación
    await arrow.transition()
        .duration(500)
        .style("opacity", 0)
        .end();

    // Limpieza del grupo de eliminación
    deleteGroup.remove();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación de un elemento que requiere el desplazamiento de otros elementos
 * @param svg Lienzo en el que se va a dibujar
 * @param affectedGroups Grupos dentro del lienzo afectados por la eliminación
 * @param nullGroup Grupo dentro del lienzo que termina sin valor
 * @param prevSequence Estado previo de la secuencia
 * @param deletedIndexElement Indice del elemento eliminado
 * @param firstNullIndex Indice del elemento que termina sin valor
 * @param dims Dimensiones de los elementos dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de las queries del usuario 
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function animateDeleteElementWithDisplacement(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    affectedGroups: d3.Selection<SVGGElement, number | null, SVGSVGElement, unknown>,
    nullGroup: d3.Selection<SVGGElement, number | null, SVGSVGElement, unknown>,
    prevSequence: (number | null)[],
    deletedIndexElement: number,
    firstNullIndex: number,
    dims: {
        margin: { left: number, right: number },
        elementWidth: number,
        elementHeight: number,
        spacing: number,
        height: number
    },
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Dimensiones del lienzo
    const { margin, elementWidth, elementHeight, spacing, height } = dims;

    // Ocultamos el texto de los elementos originales afectados
    affectedGroups.select("text")
        .style("opacity", 0);

    // Devolvemos el color original al grupo que termina sin valor
    nullGroup.select("rect")
        .attr("fill", "#fee2e2");

    // Creación o reutilización de una capa overlay para animar el desplazamiento
    let displacementGroup = svg.select<SVGGElement>("g#displacement-group");
    if (displacementGroup.empty()) {
        displacementGroup = svg.append("g")
            .attr("id", "displacement-group");
    }

    // Limpieza de la capa overlay de elementos previos
    displacementGroup.selectAll("*").remove();

    // Uso del estado previo de la secuencia para construir el overlay
    // Por cada índice afectado, posicionamos un <text> en el overlay con el valor correspondiente.
    for (let i = deletedIndexElement; i <= firstNullIndex; i++) {
        const xPos = margin.left + i * (elementWidth + spacing) + elementWidth / 2;
        const yPos = ((height - elementHeight) / 2) + 38;
        const value = prevSequence[i] ?? "";
        displacementGroup.append("text")
            .attr("x", xPos)
            .attr("y", yPos)
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .style("font-size", "16px")
            .text(value);
    }

    // Creación del elemento flecha que indica la dirección del elemento a eliminar
    const arrow = displacementGroup.append("path")
        .attr("class", "insertion-arrow")
        .attr("d", "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z")
        .attr("fill", "red")
        .attr("transform", `translate(${margin.left + deletedIndexElement * (elementWidth + spacing) + elementWidth / 2}, ${((height - elementHeight) / 2) - 40})`)
        .style("opacity", 0);

    // Transición para la aparición del elemento flecha
    await arrow.transition()
        .delay(100)
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Obtención del elemento de texto dentro del overlay correspondiente al elemento a eliminar
    const textElements = displacementGroup.selectAll("text").nodes();
    const deletedTextElement = d3.select(textElements[0]);

    // Transición de desvanecimiento del texto a eliminar
    await deletedTextElement.transition()
        .duration(1500)
        .style("opacity", 0)
        .ease(d3.easeBounce)
        .end();

    // Desplazamiento de los elementos de texto dentro del overlay hacia la izquierda
    await displacementGroup.selectAll("text")
        .transition()
        .duration(2000)
        .attr("x", function () {
            return +d3.select(this).attr("x") - (elementWidth + spacing);
        })
        .ease(d3.easeBack)
        .end();

    // Restablecimiento del color del contenedor del grupo que termina sin valor
    await nullGroup.select("rect")
        .transition()
        .duration(1000)
        .attr("fill", "white")
        .ease(d3.easeBounce)
        .end();

    // Devolvemos la opacidad a los elementos de texto originales
    affectedGroups.select("text")
        .style("opacity", 1);

    // Desvanecimiento del indicador de eliminación
    await arrow.transition()
        .duration(500)
        .style("opacity", 0)
        .end();

    // Limpieza del grupo de inserción
    displacementGroup.remove();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Fin de la animación
    setIsAnimating(false);
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

    // Restablecimiento del valor original del texto del contenedor donde se va a actualizar el elemento
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

    // Restablecimiento del valor del texto del contenedor principal
    targetGroup.select("text")
        .text(newValue)
        .style("opacity", 1);

    // Limpieza del grupo de actualización
    updatedGroup.remove();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la búsqueda de un elemento dentro de la secuencia
 * @param svg Lienzo donde se va a aplicar la animación
 * @param valueToSearch Valor a buscar
 * @param dims Dimensiones de los elementos dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 * @param setIsAnimating Función que establece el estado de animación
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
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
    // Dimensiones del lienzo
    const { margin, elementWidth, elementHeight, spacing, height } = dims;

    // Selección de los elementos
    const elements = svg.selectAll("g.element");

    // Restablecimiento de los bordes y fondos de los contenedores antes de iniciar la animación
    elements.select("rect.sequence-rect")
        .attr("fill", d => d === null ? "white" : "#fee2e2")
        .attr("stroke", "gray")
        .attr("stroke-width", 1);

    // Creación o reutilización de un grupo temporal para la flecha indicatoria
    let searchGroup = svg.select<SVGGElement>("g#search-group");
    if (searchGroup.empty()) {
        searchGroup = svg.append("g")
            .attr("id", "search-group");
    }

    // Creacíon de la flecha indicatoria usando un path
    const arrow = searchGroup.append("path")
        .attr("class", "search-arrow")
        .attr("d", "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z")
        .attr("fill", "red")
        .style("opacity", 0);

    // Posición inicial de la flecha (justo arriba del primer elemento)
    const startX = margin.left + elementWidth / 2;
    const startY = (height - elementHeight) / 2 - 40;
    await arrow.transition()
        .duration(600)
        .style("opacity", 1)
        .attr("transform", `translate(${startX}, ${startY})`)
        .end();

    // Variable de control
    let found = false;

    // Obtención de los nodos de los elementos en forma de array
    const elementsNodes = elements.nodes();

    // Recorremos cada elemento de forma secuencial
    for (let i = 0; i < elementsNodes.length; i++) {
        // Si se encuentra el elemento detenemos la ejecución
        if (found) break;

        // Calculo de la posición del elemento actual
        const xPos = margin.left + i * (elementWidth + spacing) + elementWidth / 2;
        const yPos = (height - elementHeight) / 2 - 40;

        // Transición de la flecha indicatoria a la posición del elemento actual
        await arrow.transition()
            .duration(1000)
            .attr("transform", `translate(${xPos}, ${yPos})`)
            .ease(d3.easeCubicInOut)
            .end();

        // Resaltado breve del rectángulo del elemento actual
        const currentElement = d3.select(elementsNodes[i]);
        await currentElement.select("rect")
            .transition()
            .duration(600)
            .attr("stroke", "#f87171")
            .attr("stroke-width", 3)
            .transition()
            .duration(600)
            .attr("stroke", "gray")
            .attr("stroke-width", 1)
            .end();

        // Data vinculada al elemento actual
        const d = currentElement.datum();

        // Verificamos si el dato del elemento coincide con el valor buscado.
        if (d === valueToSearch) {
            // Resaltado definitivo del elemento encontrado
            await currentElement.select("rect")
                .transition()
                .duration(500)
                .attr("stroke", "#f87171")
                .attr("stroke-width", 4)
                .end();
            found = true;
            break;
        }
    }

    // Desvanecimiento de la flecha indicatoria y limpieza de la capa overlay
    await arrow.transition()
        .duration(600)
        .style("opacity", 0)
        .end();
    searchGroup.remove();

    // Restablecimiento de las consultas del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}