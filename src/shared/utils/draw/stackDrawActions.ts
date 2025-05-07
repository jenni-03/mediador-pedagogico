import { StackNodeData } from "../../../types";
import * as d3 from "d3";
import { SVG_QUEUE_VALUES, SVG_STACK_VALUES } from "../../constants/consts";
import { calculateLinkPath } from "./calculateLinkPath";
import { RefObject } from "react";

/**
 * Función para dibujar el indicador de TOPE en la pila
 * @param svg Lienzo en el que se va a dibujar
 * @param positions Posiciones de cada uno de los nodos dentro del lienzo
 * @param topNodeId ID del nodo que está en el tope de la pila
 * @param elementWidth Ancho de los elementos
 * @param elementHeight Alto de los elementos
 */
export function drawTopIndicator(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    positions: Map<string, { x: number; y: number }>,
    topNodeId: string | undefined,
    elementWidth: number,
    elementHeight: number
) {
    // Eliminamos cualquier indicador de tope existente
    svg.selectAll("g.top-indicator").remove();

    // Si no hay nodos en la pila, no dibujamos el indicador
    if (!topNodeId) return;

    // Obtenemos la posición del nodo superior
    const topNodePos = positions.get(topNodeId);
    if (!topNodePos) return;

    // Creamos un grupo para el indicador de tope
    const topIndicator = svg
        .append("g")
        .attr("class", "top-indicator")
        .attr("id", "stack-top-indicator");

    // Definimos las posiciones para la flecha
    const arrowStartX = topNodePos.x + elementWidth + 30; // 30px a la derecha del nodo (más distancia)
    const arrowStartY = topNodePos.y + elementHeight / 2;
    const arrowEndX = topNodePos.x + elementWidth + 10; // Punta de la flecha cerca del nodo
    const arrowEndY = arrowStartY;

    // Dibujamos la línea de la flecha (más ancha)
    topIndicator
        .append("line")
        .attr("x1", arrowStartX)
        .attr("y1", arrowStartY)
        .attr("x2", arrowEndX)
        .attr("y2", arrowEndY)
        .attr("stroke", SVG_QUEUE_VALUES.NODE_STROKE_COLOR) // Color rojo tomate para destacar
        .attr("stroke-width", 4); // Línea más ancha (aumentado de 2 a 4)

    // Añadimos la punta de la flecha (más grande)
    topIndicator
        .append("polygon")
        .attr(
            "points",
            `
            ${arrowEndX},${arrowEndY} 
            ${arrowEndX + 10},${arrowEndY - 10} 
            ${arrowEndX + 10},${arrowEndY + 10}
        `
        )
        .attr("fill", SVG_QUEUE_VALUES.NODE_STROKE_COLOR);

    // Añadimos el texto "TOPE"
    topIndicator
        .append("text")
        .attr("x", arrowStartX + 10) // 10px a la derecha del inicio de la flecha
        .attr("y", arrowStartY)
        .attr("dy", "0.35em") // Alineación vertical
        .attr("text-anchor", "start")
        .attr("fill", SVG_QUEUE_VALUES.NODE_TEXT_COLOR)
        .style("font-weight", "bold")
        .style("font-size", "18px")
        .text("TOPE");
}

/**
 * Función encargada de dibujar los nodos de la pila
 * @param svg Lienzo en el que se va a dibujar
 * @param pushNodes Nodos a dibujar
 * @param positions Posiciones de cada uno de los nodos dentro del lienzo
 * @param dims Dimensiones de los elementos dentro del lienzo
 */
// export function drawNodes(
//     svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
//     pushNodes: StackNodeData[],
//     positions: Map<string, { x: number; y: number }>,
//     dims: {
//         margin: { left: number; right: number };
//         elementWidth: number;
//         elementHeight: number;
//         verticalSpacing: number;
//         height: number;
//     },
//     setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
// ) {
//     const { margin, elementWidth, elementHeight, verticalSpacing } = dims;

//     // Verificamos si hay un espacio adicional para animación en la parte superior
//     const svgHeight = parseFloat(svg.attr("height"));
//     const nodesHeight =
//         SVG_STACK_VALUES.MARGIN_TOP +
//         pushNodes.length * verticalSpacing +
//         SVG_STACK_VALUES.MARGIN_BOTTOM;
//     const animationSpace = Math.max(0, svgHeight - nodesHeight);

//     // Calculamos un offset adicional para posicionar la pila más abajo cuando hay espacio para animación
//     const offsetY = animationSpace;

//     // Primero calculamos las posiciones finales de todos los nodos
//     pushNodes.forEach((node, i) => {
//         const x = margin.left;
//         const y = SVG_STACK_VALUES.MARGIN_TOP + offsetY + i * verticalSpacing;
//         positions.set(node.id, { x, y });
//     });

//     // Realizamos el data join para los nodos
//     svg.selectAll<SVGGElement, StackNodeData>("g.node")
//         .data(pushNodes, (d) => d.id)
//         .join(
//             (enter) => {
//                 // Creación de los grupos para nuevos nodos
//                 const gEnter = enter
//                     .append("g")
//                     .attr("class", "node")
//                     .attr("id", (d) => d.id)
//                     .attr("transform", (d) => {
//                         // Posicionamos el nodo directamente en su posición calculada
//                         const pos = positions.get(d.id)!;
//                         return `translate(${pos.x}, ${pos.y})`;
//                     })
//                     .style("opacity", 1); // Los nodos iniciales comienzan visibles

//                 // Contenedor principal del nodo (borde exterior)
//                 gEnter
//                     .append("rect")
//                     .attr("class", "node-container")
//                     .attr("width", elementWidth)
//                     .attr("height", elementHeight)
//                     .attr("rx", 6)
//                     .attr("ry", 6)
//                     .attr("fill", "white")
//                     .attr("stroke", SVG_QUEUE_VALUES.NODE_STROKE_COLOR)
//                     .attr("stroke-width", 1.2);

//                 // Sección superior para el valor
//                 const valueSection = gEnter
//                     .append("g")
//                     .attr("class", "value-section");

//                 // Rectángulo de la sección superior
//                 valueSection
//                     .append("rect")
//                     .attr("class", "value-container")
//                     .attr("width", elementWidth - 2) // 1px menos por cada lado para ver el borde exterior
//                     .attr("height", elementHeight / 2 - 1)
//                     .attr("x", 1)
//                     .attr("y", 1)
//                     .attr("rx", 4)
//                     .attr("ry", 4)
//                     .attr("fill", SVG_QUEUE_VALUES.NODE_FILL_COLOR)
//                     .attr("stroke", SVG_QUEUE_VALUES.NODE_STROKE_COLOR)
//                     .attr("stroke-width", 0.8);

//                 // Texto del valor
//                 valueSection
//                     .append("text")
//                     .attr("class", "value-text")
//                     .attr("x", elementWidth / 2)
//                     .attr("y", elementHeight / 4)
//                     .attr("dy", "0.35em")
//                     .attr("text-anchor", "middle")
//                     .attr("fill", SVG_QUEUE_VALUES.NODE_TEXT_COLOR)
//                     .style("font-weight", SVG_QUEUE_VALUES.NODE_TEXT_WEIGHT)
//                     .style("font-size", SVG_QUEUE_VALUES.NODE_TEXT_SIZE)
//                     .text((d) => d.value)
//                     .style("letter-spacing", "0.5px");

//                 // Sección inferior para la dirección de memoria
//                 const memorySection = gEnter
//                     .append("g")
//                     .attr("class", "memory-section");

//                 // Rectángulo de la sección inferior
//                 memorySection
//                     .append("rect")
//                     .attr("class", "memory-container")
//                     .attr("width", elementWidth - 2)
//                     .attr("height", elementHeight / 2 - 1)
//                     .attr("x", 1)
//                     .attr("y", elementHeight / 2)
//                     .attr("rx", 4)
//                     .attr("ry", 4)
//                     .attr("fill", "#f2f2f2") // Un gris claro para diferenciar
//                     .attr("stroke", SVG_QUEUE_VALUES.NODE_STROKE_COLOR)
//                     .attr("stroke-width", 0.8);

//                 // Texto de la dirección de memoria
//                 memorySection
//                     .append("text")
//                     .attr("class", "memory-text")
//                     .attr("x", elementWidth / 2)
//                     .attr("y", elementHeight * 3 / 4)
//                     .attr("dy", "0.35em")
//                     .attr("text-anchor", "middle")
//                     .attr("fill", "#555") // Color más oscuro para el texto de memoria
//                     .style("font-weight", "normal")
//                     .style("font-size", "12px") // Tamaño más pequeño para la dirección
//                     .text((d) => d.memoryAddress)
//                     .style("letter-spacing", "0.5px");

//                 return gEnter;
//             },
//             (update) => {
//                 // Movemos los nodos existentes instantáneamente sin animación
//                 update
//                     .attr("transform", (d) => {
//                         const pos = positions.get(d.id)!;
//                         return `translate(${pos.x}, ${pos.y})`;
//                     })
//                     .style("opacity", 1);

//                 // Actualizamos los textos por si cambiaron
//                 update.select(".value-text").text((d) => d.value);
//                 update.select(".memory-text").text((d) => d.memoryAddress);

//                 return update;
//             }
//         );

//     // Añadimos el indicador de tope si hay nodos en la pila
//     if (pushNodes.length > 0) {
//         // El nodo superior es el primero en el array (debido al orden visual en una pila)
//         const topNodeId = pushNodes[0].id;
//         drawTopIndicator(
//             svg,
//             positions,
//             topNodeId,
//             elementWidth,
//             elementHeight
//         );
//     } else {
//         // Si no hay nodos, eliminamos cualquier indicador existente
//         svg.selectAll("g.top-indicator").remove();
//     }
// }
export function drawNodes(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    pushNodes: StackNodeData[],
    positions: Map<string, { x: number; y: number }>,
    dims: {
        margin: { left: number; right: number };
        elementWidth: number;
        elementHeight: number;
        verticalSpacing: number;
        height: number;
    },
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    const { margin, elementWidth, elementHeight, verticalSpacing } = dims;

    // Verificamos si hay un espacio adicional para animación en la parte superior
    const svgHeight = parseFloat(svg.attr("height"));
    const nodesHeight =
        SVG_STACK_VALUES.MARGIN_TOP +
        pushNodes.length * verticalSpacing +
        SVG_STACK_VALUES.MARGIN_BOTTOM;
    const animationSpace = Math.max(0, svgHeight - nodesHeight);

    // Calculamos un offset adicional para posicionar la pila más abajo cuando hay espacio para animación
    const offsetY = animationSpace;

    // Primero calculamos las posiciones finales de todos los nodos
    pushNodes.forEach((node, i) => {
        const x = margin.left;
        const y = SVG_STACK_VALUES.MARGIN_TOP + offsetY + i * verticalSpacing;
        positions.set(node.id, { x, y });
    });

    // Realizamos el data join para los nodos
    svg.selectAll<SVGGElement, StackNodeData>("g.node")
        .data(pushNodes, (d) => d.id)
        .join(
            (enter) => {
                // Creación de los grupos para nuevos nodos
                const gEnter = enter
                    .append("g")
                    .attr("class", "node")
                    .attr("id", (d) => d.id)
                    .attr("transform", (d) => {
                        // Posicionamos el nodo directamente en su posición calculada
                        const pos = positions.get(d.id)!;
                        return `translate(${pos.x}, ${pos.y})`;
                    })
                    .style("opacity", 1); // Los nodos iniciales comienzan visibles

                // Contenedor principal del nodo (borde exterior con bordes redondeados y sombra)
                gEnter
                    .append("rect")
                    .attr("class", "node-container")
                    .attr("width", elementWidth)
                    .attr("height", elementHeight)
                    .attr("rx", 12)
                    .attr("ry", 12)
                    .attr("fill", "#ffffff")
                    .attr("stroke", SVG_QUEUE_VALUES.NODE_STROKE_COLOR)
                    .attr("stroke-width", 1.5);

                // Sección superior para el valor con color azul más atractivo
                const valueSection = gEnter
                    .append("g")
                    .attr("class", "value-section");

                // Rectángulo de la sección superior
                valueSection
                    .append("rect")
                    .attr("class", "value-container")
                    .attr("width", elementWidth - 2) // margen interior para estética
                    .attr("height", elementHeight / 2 - 1)
                    .attr("x", 1)
                    .attr("y", 1)
                    .attr("rx", 8)
                    .attr("ry", 8)
                    .attr("fill", SVG_QUEUE_VALUES.NODE_STROKE_COLOR); // azul llamativo

                // Texto del valor
                valueSection
                    .append("text")
                    .attr("class", "value-text")
                    .attr("x", elementWidth / 2)
                    .attr("y", elementHeight / 4 + 2)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("fill", "white")
                    .style("font-weight", "bold")
                    .style("font-size", "18px")
                    .style("letter-spacing", "0.5px")
                    .text((d) => d.value);

                // Sección inferior para la dirección de memoria
                const memorySection = gEnter
                    .append("g")
                    .attr("class", "memory-section");

                // Texto de la dirección de memoria directamente sin contenedor gris
                memorySection
                    .append("text")
                    .attr("class", "memory-text")
                    .attr("x", elementWidth / 2)
                    .attr("y", (elementHeight * 3) / 4 + 4)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("fill", "#444") // gris oscuro
                    .style("font-weight", "normal")
                    .style("font-size", "12px")
                    .style("letter-spacing", "0.5px")
                    .text((d) => d.memoryAddress);

                return gEnter;
            },
            //TODO REVISAR, QUITAR TRANSFORMACIONES
            (update) => {
                // Movemos los nodos existentes instantáneamente sin animación
                update
                    .attr("transform", (d) => {
                        const pos = positions.get(d.id)!;
                        return `translate(${pos.x}, ${pos.y})`;
                    })
                    .style("opacity", 1);

                // Actualizamos los textos por si cambiaron
                update.select(".value-text").text((d) => d.value);
                update.select(".memory-text").text((d) => d.memoryAddress);

                return update;
            }
        );

    // Añadimos el indicador de tope si hay nodos en la pila
    if (pushNodes.length > 0) {
        // El nodo superior es el primero en el array (debido al orden visual en una pila)
        const topNodeId = pushNodes[0].id;
        drawTopIndicator(
            svg,
            positions,
            topNodeId,
            elementWidth,
            elementHeight
        );
    } else {
        // Si no hay nodos, eliminamos cualquier indicador existente
        svg.selectAll("g.top-indicator").remove();
    }
}


/**
 *
 * @param newNodeGroup
 * @param nextLinkGroup
 * @param nodeStacked
 * @param positions
 * @param resetQueryValues
 * @param setIsAnimating
 */
export async function pushNode(
    newNodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    nextLinkGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null,
    nodeStacked: string,
    prevNodeId: string | undefined,
    positions: Map<string, { x: number; y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Marcamos el inicio de la animación
    setIsAnimating(true);

    // Importante: Aseguramos que todos los nodos existentes permanezcan visibles
    const svgElement = newNodeGroup.node()?.ownerSVGElement;
    if (svgElement) {
        d3.select(svgElement)
            .selectAll<SVGGElement, unknown>("g.node")
            .filter(function () {
                return this.id !== nodeStacked;
            })
            .style("opacity", 1);
    }

    // Posición final del nuevo nodo
    const finalPos = positions.get(nodeStacked)!;

    // Calculamos la posición inicial en la parte superior del SVG con un pequeño margen
    const topMargin = 20; // Un pequeño margen desde el borde superior
    const initialPos = {
        x: finalPos.x,
        y: topMargin, // Posicionamos el elemento cerca del borde superior del SVG
    };

    // Mapa temporal de posiciones para calcular el path inicial del enlace
    const tempPositions = new Map(positions);
    tempPositions.set(nodeStacked, initialPos);

    // Cálculo formas de enlace inicial y final
    let initialPath = "M0,0";
    let finalPath = "M0,0";
    if (prevNodeId && nextLinkGroup) {
        initialPath = calculateLinkPath(
            { sourceId: prevNodeId, targetId: nodeStacked, type: "next" },
            tempPositions,
            SVG_QUEUE_VALUES.ELEMENT_WIDTH,
            SVG_QUEUE_VALUES.ELEMENT_HEIGHT
        );
        finalPath = calculateLinkPath(
            { sourceId: prevNodeId, targetId: nodeStacked, type: "next" },
            positions,
            SVG_QUEUE_VALUES.ELEMENT_WIDTH,
            SVG_QUEUE_VALUES.ELEMENT_HEIGHT
        );
    }

    // Establecemos el estado visual inicial del nuevo nodo antes de animar
    newNodeGroup
        .style("opacity", 0) // Aseguramos que comienza invisible
        .attr("transform", `translate(${initialPos.x}, ${initialPos.y})`);

    if (nextLinkGroup) {
        nextLinkGroup
            .select("path.node-link")
            .attr("d", initialPath)
            .style("opacity", 0);
    }

    // Durante la animación, eliminamos temporalmente el indicador de tope
    if (svgElement) {
        d3.select(svgElement).selectAll("g.top-indicator").remove();
    }

    // 1. Animación de aparición del nuevo nodo
    await newNodeGroup
        .transition()
        .duration(800)
        .style("opacity", 1)
        .ease(d3.easeCubicInOut)
        .end();

    // 2. Animación de aparición del enlace (si existe)
    if (nextLinkGroup) {
        await nextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(800)
            .style("opacity", 1)
            .ease(d3.easeCubicInOut)
            .end();
    }

    // 3. Animación de movimiento del nuevo nodo a su posición final
    const nodeMovePromise = newNodeGroup
        .transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .attr("transform", `translate(${finalPos.x}, ${finalPos.y})`)
        .end();

    // 4. Animación del enlace (si existe)
    const linkMovePromise = nextLinkGroup
        ? nextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .ease(d3.easeCubicInOut)
            .attr("d", finalPath)
            .end()
        : Promise.resolve();

    // Ejecutamos ambas promesas de animación en paralelo
    await Promise.all([nodeMovePromise, linkMovePromise]);

    // Después de completar la animación, añadimos el indicador de tope al nuevo nodo (que ahora es el superior)
    if (svgElement) {
        const svg = d3.select(svgElement);
        const elementWidth = SVG_STACK_VALUES.ELEMENT_WIDTH;
        const elementHeight = SVG_STACK_VALUES.ELEMENT_HEIGHT;
        drawTopIndicator(
            svg,
            positions,
            nodeStacked,
            elementWidth,
            elementHeight
        );
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

export function highlightTopNode(
    svgRef: RefObject<SVGSVGElement>,
    stackNodes: StackNodeData[],
    onEnd: () => void,
) {
    if (!svgRef.current || stackNodes.length === 0) {
        onEnd();
        return;
    }

    const svg = d3.select(svgRef.current);
    const topNodeId = stackNodes[0].id;
    const topNodeGroup = svg.select<SVGGElement>(`#${topNodeId}`);

    if (topNodeGroup.empty()) {
        console.error("No se encontró el nodo del tope:", topNodeId);
        onEnd();
        return;
    }

    const rect = topNodeGroup.select("rect");
    const text = topNodeGroup.select("text");

    rect.transition()
        .duration(300)
        .attr("stroke", SVG_STACK_VALUES.NODE_STROKE_COLOR)
        .attr("stroke-width", 4);

    text.transition()
        .duration(300)
        .attr("fill", SVG_STACK_VALUES.NODE_STROKE_COLOR)
        .attr("font-weight", "bold");

    d3.timeout(() => {
        rect.transition()
            .duration(300)
            .attr("stroke", SVG_STACK_VALUES.NODE_STROKE_COLOR)
            .attr("stroke-width", 1.2);

        text.transition()
            .duration(300)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("fill", SVG_QUEUE_VALUES.NODE_TEXT_COLOR)
            .style("font-weight", SVG_QUEUE_VALUES.NODE_TEXT_WEIGHT)
            .style("font-size", SVG_QUEUE_VALUES.NODE_TEXT_SIZE)
            .style("letter-spacing", "0.5px");
    }, 1500);

    onEnd();
}


export async function animateNodePopExit(
    nodeToRemove: d3.Selection<SVGGElement, unknown, null, undefined>,
    nodeId: string,
    positions: Map<string, { x: number; y: number }>,
    elementHeight: number,
    elementWidth: number,
    newTopNodeId: string | undefined,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Marcamos que hay animación en curso
    setIsAnimating(true);

    console.log("Animando la salida del nodo:", nodeId);
    console.log(
        "Nodo encontrado:",
        !nodeToRemove.empty() ? "Sí" : "No",
        "Tamaño:",
        nodeToRemove.size()
    );

    // Obtenemos la posición actual del nodo
    const currentPos = positions.get(nodeId);
    if (!currentPos) {
        console.error("No se encontró la posición para el nodo:", nodeId);
        setIsAnimating(false);
        resetQueryValues();
        return;
    }

    // Obtenemos el elemento SVG parent
    const svgElement = nodeToRemove.node()?.ownerSVGElement;
    if (!svgElement) {
        console.error("No se pudo obtener el elemento SVG padre");
        setIsAnimating(false);
        resetQueryValues();
        return;
    }

    // Seleccionamos el SVG completo
    const svg = d3.select(svgElement);

    // Eliminamos el indicador de tope actual
    svg.selectAll("g.top-indicator").remove();

    try {
        // Hacemos que el nodo se destaque primero (escala ligeramente)
        await nodeToRemove
            .transition()
            .duration(200)
            .attr(
                "transform",
                `translate(${currentPos.x}, ${currentPos.y}) scale(1.1)`
            )
            .ease(d3.easeBackOut)
            .end();

        // Luego hacemos un movimiento lateral breve
        await nodeToRemove
            .transition()
            .duration(300)
            .attr(
                "transform",
                `translate(${currentPos.x + 30}, ${currentPos.y}) scale(1.1)`
            )
            .ease(d3.easeQuadOut)
            .end();

        // Finalmente, el nodo se eleva y desaparece
        await nodeToRemove
            .transition()
            .duration(600)
            .attr(
                "transform",
                `translate(${currentPos.x + 30}, ${currentPos.y - 120}) scale(0.8)`
            )
            .style("opacity", 0)
            .ease(d3.easeCubicIn)
            .end();

        // Una vez completada la animación, eliminamos el nodo
        nodeToRemove.remove();

        // Eliminamos la posición del nodo del mapa
        positions.delete(nodeId);

        // Si hay un nuevo nodo superior, actualizamos el indicador de tope
        if (newTopNodeId) {
            drawTopIndicator(
                svg,
                positions,
                newTopNodeId,
                elementWidth,
                elementHeight
            );
        }

        console.log("Animación de pop completada con éxito");
    } catch (error) {
        console.error("Error durante la animación de pop:", error);
    } finally {
        // Aseguramos que siempre se limpie el estado
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función que anima la salida de un nodo (pop) desde la pila.
 */
// export async function animateNodePopExit(
//     exitSelection: d3.Selection<SVGGElement, unknown, null, undefined>,
//     positions: Map<string, { x: number; y: number }>,
//     elementHeight: number,
//     setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
// ) {

//     // Marcamos que hay animación en curso
//     setIsAnimating(true);
//     // Detectamos el nodo que será eliminado: es el último en el dataset (tope de la pila)
//     // const topNode = exitSelection.node()?.ownerSVGElement;

//     console.log("exitSelection.nodes():", exitSelection.nodes());
// console.log("exitSelection.size():", exitSelection.size());

//     const topNode = exitSelection.nodes()[exitSelection.size() - 1];
//     console.log("Top Node:", topNode);
//     // Si no hay nodo, terminamos la animación
//     if (!topNode) {
//         console.log("No hay nodo para eliminar.");
//         setIsAnimating(false);
//         return;
//     }
//     const topNodeId = topNode.id;
//     const pos = positions.get(topNodeId);
//     if (!pos) {
//         setIsAnimating(false);
//         return;
//     }
//     const svgElement = topNode.ownerSVGElement;
//     console.log("SVG Element:", svgElement);
//     if (svgElement) {
//         const svg = d3.select<SVGSVGElement, unknown>(svgElement);
//         svg.selectAll("g.top-indicator").remove();
//         d3.select(topNode)
//             .transition()
//             .duration(1000)
//             .ease(d3.easeCubicInOut)
//             .attr("transform", `translate(${pos.x}, ${-elementHeight})`) // sube fuera del SVG
//             .style("opacity", 0)
//             .on("end", function () {
//                 d3.select(this).remove();
//                 const remainingNodes = svg.selectAll<SVGGElement, unknown>(
//                     "g.node"
//                 );
//                 if (!remainingNodes.empty()) {
//                     const newTop =
//                         remainingNodes.nodes()[remainingNodes.size() - 1];
//                     const newTopId = newTop.id;
//                     const newPos = positions.get(newTopId);
//                     if (newPos) {
//                         drawTopIndicator(
//                             svg,
//                             positions,
//                             newTopId,
//                             SVG_STACK_VALUES.ELEMENT_WIDTH,
//                             SVG_STACK_VALUES.ELEMENT_HEIGHT
//                         );
//                     }
//                 }
//                 setIsAnimating(false);
//             });
//     }
// }
