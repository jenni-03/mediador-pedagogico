import { LinkData, PriorityQueueNodeData, QueueNodeData } from "../../../types";
import * as d3 from "d3";
import { SVG_PRIORITY_QUEUE_VALUES, SVG_QUEUE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { calculateLinkPath } from "./calculateLinkPath";

// Función para obtener el color según la prioridad (ahora retorna un objeto con fill y stroke)
export function getPriorityColor(priority: number): { fill: string; stroke: string } {
    if (priority >= 1 && priority <= 3) {
        return {
            fill: "#FFB3B3",    // Rojo claro
            stroke: "#CC0000"   // Rojo oscuro
        };
    } else if (priority >= 4 && priority <= 6) {
        return {
            fill: "#FFD4AA",    // Naranja claro
            stroke: "#CC6600"   // Naranja oscuro
        };
    } else if (priority >= 7 && priority <= 10) {
        return {
            fill: "#B3D4FF",    // Azul claro
            stroke: "#0066CC"   // Azul oscuro
        };
    } else {
        return {
            fill: "#CCCCCC",    // Gris claro por defecto
            stroke: "#666666"   // Gris oscuro por defecto
        };
    }
}

/**
 * Función encargada renderizar los nodos de la cola de prioridad dentro del lienzo.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param queueNodes Nodos a renderizar.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param dims Dimensiones del lienzo y sus elementos.
 */
export function drawPriorityQueueNodes(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    queueNodes: PriorityQueueNodeData[],
    positions: Map<string, { x: number, y: number }>,
    dims: {
        margin: { left: number; right: number };
        elementWidth: number;
        elementHeight: number;
        nodeSpacing: number;
        height: number;
    },
) {
    // Dimensiones del lienzo
    const { margin, elementWidth, elementHeight, nodeSpacing, height } = dims;

    // Data join para la creación de los nodos
    svg.selectAll<SVGGElement, PriorityQueueNodeData>("g.node")
        .data(queueNodes, d => d.id)
        .join(
            enter => {
                // Creación del grupo para cada nodo entrante
                const gEnter = enter
                    .append("g")
                    .attr("class", "node")
                    .attr("id", (d) => d.id)
                    .attr("transform", (d, i) => {
                        // Cálculo de la posición del nodo
                        const x = margin.left + i * nodeSpacing;
                        const y = (height - elementHeight) / 2;
                        positions.set(d.id, { x, y });
                        return `translate(${x}, ${y})`;
                    });

                // Contenedor del nodo con color dinámico según prioridad
                gEnter.append("rect")
                    .attr("class", "node-container")
                    .attr("width", elementWidth)
                    .attr("height", elementHeight)
                    .attr("rx", 6)
                    .attr("ry", 6)
                    .attr("fill", d => getPriorityColor(d.priority).fill)
                    .attr("stroke", d => getPriorityColor(d.priority).stroke)
                    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                    .style("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))");

                // Valor del nodo
                gEnter.append("text")
                    .attr("class", "node-value")
                    .attr("x", elementWidth / 2 - 11)
                    .attr("y", elementHeight / 2 - 5)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "middle")
                    .attr("fill", SVG_PRIORITY_QUEUE_VALUES.ELEMENT_TEXT_COLOR)
                    .style("font-weight", SVG_PRIORITY_QUEUE_VALUES.ELEMENT_TEXT_WEIGHT)
                    .style("font-size", SVG_PRIORITY_QUEUE_VALUES.ELEMENT_TEXT_SIZE)
                    .text(d => d.value)
                    .style("letter-spacing", "0.5px");

                // Círculo contenedor para la prioridad del nodo
                gEnter.append("circle")
                    .attr("class", "priority-badge")
                    .attr("cx", elementWidth - 15)
                    .attr("cy", SVG_PRIORITY_QUEUE_VALUES.PRIORITY_BADGE_HEIGHT)
                    .attr("r", SVG_PRIORITY_QUEUE_VALUES.PRIORITY_BADGE_RADIUS)
                    .attr("fill", "rgba(0,0,0,0.7)")
                    .attr("stroke", "rgba(255,255,255,0.9)")
                    .attr("stroke-width", SVG_PRIORITY_QUEUE_VALUES.PRIORITY_BADGE_STROKE_WIDTH)
                    .style("filter", "drop-shadow(1px 1px 3px rgba(0,0,0,0.4))");

                // Valor de prioridad del nodo dentro del círculo
                gEnter.append("text")
                    .attr("class", "node-priority")
                    .attr("x", elementWidth - 15)
                    .attr("y", SVG_PRIORITY_QUEUE_VALUES.PRIORITY_BADGE_TEXT_HEIGHT)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "middle")
                    .attr("fill", SVG_PRIORITY_QUEUE_VALUES.PRIORITY_BADGE_TEXT_FILL)
                    .style("font-size", SVG_PRIORITY_QUEUE_VALUES.PRIORITY_BADGE_TEXT_SIZE)
                    .style("font-weight", SVG_PRIORITY_QUEUE_VALUES.PRIORITY_BADGE_TEXT_WEIGHT)
                    .style("letter-spacing", "0.5px")
                    .text(d => `P${d.priority}`);

                // Resplandor sutil para el badge de prioridad
                gEnter.append("circle")
                    .attr("class", "priority-glow")
                    .attr("cx", elementWidth - 15)
                    .attr("cy", SVG_PRIORITY_QUEUE_VALUES.PRIORITY_BADGE_HEIGHT)
                    .attr("r", SVG_PRIORITY_QUEUE_VALUES.PRIORITY_GLOW_RADIUS)
                    .attr("fill", SVG_PRIORITY_QUEUE_VALUES.PRIORITY_GLOW_FILL)
                    .attr("stroke", d => d3.color(getPriorityColor(d.priority).stroke)?.brighter(0.8)?.toString() || getPriorityColor(d.priority).stroke)
                    .attr("stroke-width", SVG_PRIORITY_QUEUE_VALUES.PRIORITY_GLOW_STROKE_WIDTH)
                    .attr("opacity", 0.6)
                    .style("filter", "blur(1px)");

                // Bloque de dirección de memoria
                gEnter
                    .append("rect")
                    .attr("class", "memory-container")
                    .attr("y", elementHeight + 10)
                    .attr("width", elementWidth)
                    .attr("height", 20)
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("fill", SVG_STYLE_VALUES.MEMORY_FILL_COLOR)
                    .attr("stroke", SVG_STYLE_VALUES.MEMORY_STROKE_COLOR)
                    .attr("stroke-width", SVG_STYLE_VALUES.MEMORY_STROKE_WIDTH);

                // Dirección de memoria
                gEnter
                    .append("text")
                    .attr("class", "memory")
                    .attr("x", elementWidth / 2)
                    .attr("y", elementHeight + 25)
                    .attr("text-anchor", "middle")
                    .text((d) => d.memoryAddress)
                    .attr("fill", SVG_STYLE_VALUES.MEMORY_TEXT_COLOR)
                    .style("font-size", SVG_STYLE_VALUES.MEMORY_TEXT_SIZE)
                    .style("font-weight", SVG_STYLE_VALUES.MEMORY_TEXT_WEIGHT);

                return gEnter;
            },
            update => {
                // Guarda la posición actualizada para cada nodo presente en el DOM
                update.each((d, i) => {
                    const x = margin.left + i * nodeSpacing;
                    const y = (height - elementHeight) / 2;
                    positions.set(d.id, { x, y });
                });

                // Actualizar colores en caso de que la prioridad haya cambiado
                update.select(".node-container")
                    .attr("fill", d => getPriorityColor(d.priority).fill)
                    .attr("stroke", d => getPriorityColor(d.priority).stroke)
                    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH);

                // Actualizar texto de prioridad
                update.select(".node-priority")
                    .text(d => `P${d.priority}`);

                // Actualizar el color del resplandor según la nueva prioridad
                update.select(".priority-glow")
                    .attr("stroke", d => d3.color(getPriorityColor(d.priority).stroke)?.brighter(0.8)?.toString() || getPriorityColor(d.priority).stroke);

                return update;
            },
            exit => exit
        );
}

/**
 * Función encargada de animar la inserción de un nuevo nodo al inicio de la cola de prioridad.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved Objeto con información de los nodos involucrados en la inserción.
 * @param queueData Objeto con información relacionada a los nodos y enlaces de la cola.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateEnqueueFirstNode(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { nodeEnqueued: string, nextNode: string | null },
    queueData: { queueNodes: PriorityQueueNodeData[], linksData: LinkData[] },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { nodeEnqueued, nextNode } = nodesInvolved;

    // Grupo del lienzo correspondiente al nuevo elemento
    const newNodeGroup = svg.select<SVGGElement>(`g#${nodeEnqueued}`);

    // Estado visual inicial del nuevo nodo
    newNodeGroup.style("opacity", 0);

    if (nextNode) {
        // Información de la lista
        const { queueNodes, linksData } = queueData;

        // Grupo del lienzo correspondiente al indicador del nodo cabeza
        const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

        // Grupo del lienzo correspondiente al enlace siguiente del nuevo nodo
        const newNodeNextLinkGroup = svg.select<SVGGElement>(`g#link-${nodeEnqueued}-${nextNode}-next`);

        // Estado visual inicial del enlace siguiente del nuevo nodo
        newNodeNextLinkGroup.select("path.node-link").style("opacity", 0);

        // Array de promesas para concretar animaciones de desplazamiento de nodos y enlaces
        const shiftPromises: Promise<void>[] = [];

        // Selección de nodos a desplazar (re-vinculación de datos)
        const remainingNodes = svg.selectAll<SVGGElement, QueueNodeData>("g.node")
            .data(queueNodes, d => d.id);

        // Promesa para desplazamiento de nodos existentes a su posición final
        shiftPromises.push(
            remainingNodes
                .transition()
                .duration(1000)
                .ease(d3.easeQuadOut)
                .attr("transform", (d) => {
                    const finalPos = positions.get(d.id)!;
                    return `translate(${finalPos.x}, ${finalPos.y})`;
                })
                .end()
        );

        // Selección de enlaces a desplazar (re-vinculación de datos)
        const remainingLinks = svg.selectAll<SVGGElement, LinkData>("g.link")
            .data(linksData, d => `link-${d.sourceId}-${d.targetId}-${d.type}`);

        // Promesa para desplazamiento de enlaces existentes a su posición final
        shiftPromises.push(
            remainingLinks.select("path.node-link")
                .transition()
                .duration(1000)
                .ease(d3.easeQuadOut)
                .attr("d", d => calculateLinkPath(d, positions, SVG_QUEUE_VALUES.ELEMENT_WIDTH, SVG_QUEUE_VALUES.ELEMENT_HEIGHT))
                .end()
        );

        // Posición de animación inicial del indicador de cabeza
        const initialHeadIndicatorPos = positions.get(nextNode)!;
        shiftPromises.push(
            headIndicatorGroup
                .transition()
                .duration(1000)
                .ease(d3.easeQuadOut)
                .attr("transform", () => {
                    const finalX = initialHeadIndicatorPos.x + SVG_QUEUE_VALUES.ELEMENT_WIDTH / 2;
                    const finalY = initialHeadIndicatorPos.y;
                    return `translate(${finalX}, ${finalY})`;
                })
                .end()
        );

        // Resolución de promesas para animación de desplazamiento
        await Promise.all(shiftPromises);

        // Posición de animación final para inserción del nuevo nodo
        const finalNewNodePos = positions.get(nodeEnqueued)!;

        // Posición de animación inicial para inserción del nuevo nodo
        const initialYOffset = -60;
        const initialNewNodePos = { x: finalNewNodePos.x, y: finalNewNodePos.y + initialYOffset };
        newNodeGroup.attr("transform", `translate(${initialNewNodePos.x}, ${initialNewNodePos.y})`);

        // Desplazamiento del nuevo nodo hacia su posición final
        await newNodeGroup
            .transition()
            .duration(1500)
            .style("opacity", 1)
            .ease(d3.easePolyInOut)
            .attr("transform", `translate(${finalNewNodePos.x}, ${finalNewNodePos.y})`)
            .end();

        // Aparición del enlace siguiente del nuevo nodo que apunta al nodo cabeza anterior
        await newNodeNextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();

        // Movimiento del indicador de cabeza hacia el nuevo nodo
        await headIndicatorGroup
            .transition()
            .duration(1000)
            .ease(d3.easeQuadInOut)
            .attr("transform", () => {
                const finalX = finalNewNodePos.x + SVG_QUEUE_VALUES.ELEMENT_WIDTH / 2;
                const finalY = finalNewNodePos.y;
                return `translate(${finalX}, ${finalY})`;
            })
            .end();
    } else {
        // Animación de aparición simple del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    }

    // Animación de confirmación con el badge de prioridad como protagonista
    const priorityBadge = newNodeGroup.select(".priority-badge");
    const priorityGlow = newNodeGroup.select(".priority-glow");

    await priorityBadge
        .transition()
        .duration(150)
        .attr("r", 18)
        .attr("stroke-width", 3)
        .transition()
        .duration(150)
        .attr("r", 14)
        .attr("stroke-width", 2)
        .end();

    await priorityGlow
        .transition()
        .duration(300)
        .attr("opacity", 1)
        .attr("r", 20)
        .transition()
        .duration(300)
        .attr("opacity", 0.6)
        .attr("r", 16)
        .end();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la inserción de un nuevo nodo al final de la cola de prioridad.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved Objeto con información de los nodos involucrados en la inserción.
 * @param queueNodes Array con información relacionada a los nodos de la cola.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateEnqueueLastNode(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { nodeEnqueued: string, prevNode: string | null },
    queueNodes: PriorityQueueNodeData[],
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { nodeEnqueued, prevNode } = nodesInvolved;

    // Grupo del lienzo correspondiente al nuevo elemento
    const newNodeGroup = svg.select<SVGGElement>(`g#${nodeEnqueued}`);

    // Estado visual inicial del nuevo nodo
    newNodeGroup.style("opacity", 0);

    if (prevNode) {
        // Grupo del lienzo correspondiente al enlace siguiente del nodo previo
        const prevNodeNextLinkGroup = svg.select<SVGGElement>(`g#link-${prevNode}-${nodeEnqueued}-next`);

        // Estado visual inicial del enlace siguiente del nodo previo
        prevNodeNextLinkGroup.select("path.node-link").style("opacity", 0);

        for (const node of queueNodes) {
            // Selección del grupo del nodo actual
            const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);

            // Selección del elemento a animar
            const nodeElement = nodeGroup.select("rect");

            // Resaltado del nodo actual
            await nodeElement
                .transition()
                .duration(600)
                .attr("stroke", "#D72638")
                .attr("stroke-width", 3)
                .end();

            // Restablecimiento del estilo original del nodo (excepto para el último nodo)
            if (node.id !== prevNode) {
                await nodeElement
                    .transition()
                    .duration(600)
                    .attr("stroke", getPriorityColor(node.priority).stroke)
                    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                    .end();
            }
        }

        // Posición de animación final para inserción del nuevo nodo
        const finalNewNodePos = positions.get(nodeEnqueued)!;

        // Posición de animación inicial para inserción del nuevo nodo
        const initialYOffset = -60;
        const initialNewNodePos = { x: finalNewNodePos.x, y: finalNewNodePos.y + initialYOffset };
        newNodeGroup.attr("transform", `translate(${initialNewNodePos.x}, ${initialNewNodePos.y})`);

        // Desplazamiento del nuevo nodo hacia su posición final
        await newNodeGroup
            .transition()
            .duration(1500)
            .style("opacity", 1)
            .ease(d3.easePolyInOut)
            .attr("transform", `translate(${finalNewNodePos.x}, ${finalNewNodePos.y})`)
            .end();

        // Aparición del enlace siguiente entre el nodo previo y el nuevo nodo
        await prevNodeNextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    } else {
        // Animación de aparición simple del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    }

    // Animación de confirmación con el badge de prioridad como protagonista
    const priorityBadge = newNodeGroup.select(".priority-badge");
    const priorityGlow = newNodeGroup.select(".priority-glow");

    await priorityBadge
        .transition()
        .duration(150)
        .attr("r", 18)
        .attr("stroke-width", 3)
        .transition()
        .duration(150)
        .attr("r", 14)
        .attr("stroke-width", 2)
        .end();

    await priorityGlow
        .transition()
        .duration(300)
        .attr("opacity", 1)
        .attr("r", 20)
        .transition()
        .duration(300)
        .attr("opacity", 0.6)
        .attr("r", 16)
        .end();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la inserción de un nuevo nodo entre nodos de la cola de prioridad.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved Objeto con información de los nodos involucrados en la inserción.
 * @param queueData Objeto con información relacionada a los nodos y enlaces de la cola.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateEnqueueBetweenNodes(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { nodeEnqueued: { id: string, index: number }, prevNode: string | null, nextNode: string | null },
    queueData: { queueNodes: PriorityQueueNodeData[], linksData: LinkData[] },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { nodeEnqueued, prevNode, nextNode } = nodesInvolved;

    // Grupo del lienzo correspondiente al nuevo elemento
    const newNodeGroup = svg.select<SVGGElement>(`g#${nodeEnqueued.id}`);

    // Estado visual inicial del nuevo nodo
    newNodeGroup.style("opacity", 0);

    if (prevNode && nextNode) {
        // Información de la lista
        const { queueNodes, linksData } = queueData;

        // Grupo del lienzo correspondiente al enlace siguiente formado entre el nodo previo y el nuevo nodo
        const prevToNewNodeLinkGroup = svg.select<SVGGElement>(`g#link-${prevNode}-${nodeEnqueued.id}-next`);

        // Estado visual inicial del enlace siguiente entre el nodo previo y el nuevo nodo
        prevToNewNodeLinkGroup.select("path.node-link").style("opacity", 0);

        // Grupo del lienzo correspondiente al enlace siguiente del nuevo nodo
        const newNodeNextLinkGroup = svg.select<SVGGElement>(`g#link-${nodeEnqueued.id}-${nextNode}-next`);

        // Estado visual inicial del enlace siguiente del nuevo nodo
        newNodeNextLinkGroup.select("path.node-link").style("opacity", 0);

        // Nodos a recorrer para insertar el nodo
        const nodesToTraverse = queueNodes.slice(0, nodeEnqueued.index);

        for (const node of nodesToTraverse) {
            // Selección del grupo del nodo actual
            const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);

            // Selección del elemento a animar
            const nodeElement = nodeGroup.select("rect");

            // Resaltado del nodo actual
            await nodeElement
                .transition()
                .duration(600)
                .attr("stroke", "#D72638")
                .attr("stroke-width", 3)
                .end();

            // Restablecimiento del estilo original del nodo (excepto para el nodo anterior al nuevo)
            if (node.id !== prevNode) {
                await nodeElement
                    .transition()
                    .duration(600)
                    .attr("stroke", getPriorityColor(node.priority).stroke)
                    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                    .end();
            }
        }

        // Grupo del lienzo correspondiente al enlace siguiente entre el nodo previo y el nodo siguiente
        const prevToNextNodeNextLinkGroup = svg.select<SVGGElement>(`g#link-${prevNode}-${nextNode}-next`);

        // Desconexión del enlace entre el nodo previo y el siguiente
        await prevToNextNodeNextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .end();
        prevToNextNodeNextLinkGroup.remove();

        // Reposicionamiento de los nodos para hacer espacio para el nuevo nodo
        const shiftPromises: Promise<void>[] = [];
        const nodesToShift = queueNodes.slice(nodeEnqueued.index, queueNodes.length);

        // Selección de nodos a desplazar (re-vinculación de datos)
        const remainingNodes = svg.selectAll<SVGGElement, QueueNodeData>("g.node")
            .data(nodesToShift, d => d.id);

        // Promesa para desplazamiento de nodos existentes a su posición final
        shiftPromises.push(
            remainingNodes
                .transition()
                .duration(1000)
                .ease(d3.easeQuadOut)
                .attr("transform", (d) => {
                    const finalPos = positions.get(d.id)!;
                    return `translate(${finalPos.x}, ${finalPos.y})`;
                })
                .end()
        );

        // Selección de enlaces a desplazar (re-vinculación de datos)
        const remainingLinks = svg.selectAll<SVGGElement, LinkData>("g.link")
            .data(linksData, d => `link-${d.sourceId}-${d.targetId}-${d.type}`);

        // Promesa para desplazamiento de enlaces existentes a su posición final
        shiftPromises.push(
            remainingLinks.select("path.node-link")
                .transition()
                .duration(1000)
                .ease(d3.easeQuadOut)
                .attr("d", d => calculateLinkPath(d, positions, SVG_QUEUE_VALUES.ELEMENT_WIDTH, SVG_QUEUE_VALUES.ELEMENT_HEIGHT))
                .end()
        );

        // Resolución de promesas para animación de desplazamiento
        await Promise.all(shiftPromises);

        // Posición de animación final para inserción del nuevo nodo
        const finalNewNodePos = positions.get(nodeEnqueued.id)!;

        // Posición de animación inicial para inserción del nuevo nodo
        const initialYOffset = -60;
        const initialNewNodePos = { x: finalNewNodePos.x, y: finalNewNodePos.y + initialYOffset };
        newNodeGroup.attr("transform", `translate(${initialNewNodePos.x}, ${initialNewNodePos.y})`);

        // Desplazamiento del nuevo nodo hacia su posición final
        await newNodeGroup
            .transition()
            .duration(1500)
            .style("opacity", 1)
            .ease(d3.easePolyInOut)
            .attr("transform", `translate(${finalNewNodePos.x}, ${finalNewNodePos.y})`)
            .end();

        // Aparición del enlace siguiente entre el nuevo nodo y el nodo siguiente
        await newNodeNextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();

        // Aparición del enlace siguiente entre el nodo previo y el nuevo nodo
        await prevToNewNodeLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    } else {
        // Animación de aparición simple del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    }

    // Animación de confirmación con el badge de prioridad como protagonista
    const priorityBadge = newNodeGroup.select(".priority-badge");
    const priorityGlow = newNodeGroup.select(".priority-glow");

    await priorityBadge
        .transition()
        .duration(150)
        .attr("r", 18)
        .attr("stroke-width", 3)
        .transition()
        .duration(150)
        .attr("r", 14)
        .attr("stroke-width", 2)
        .end();

    await priorityGlow
        .transition()
        .duration(300)
        .attr("opacity", 1)
        .attr("r", 20)
        .transition()
        .duration(300)
        .attr("opacity", 0.6)
        .attr("r", 16)
        .end();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la salida de un nodo de la cola de prioridad.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved Objeto con información de los nodos involucrados en la eliminación.
 * @param queueData Objeto con información relacionada a los nodos y enlaces de la cola.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateDequeueNode(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { dequeuedNode: string, nextNode: string | null },
    queueData: { queueNodes: PriorityQueueNodeData[], linksData: LinkData[] },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { dequeuedNode, nextNode } = nodesInvolved;

    // Grupo del lienzo correspondiente al elemento a eliminar
    const nodeToRemoveGroup = svg.select<SVGGElement>(`g#${dequeuedNode}`);

    if (nextNode) {
        // Información de la lista
        const { queueNodes, linksData } = queueData;

        // Grupo del lienzo correspondiente al enlace siguiente del elemento a decolar
        const linkToRemoveGroup = svg.select<SVGGElement>(`g#link-${dequeuedNode}-${nextNode}-next`);

        // Grupo del lienzo correspondiente al indicador del elemento cabeza
        const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

        // Animación de salida del indicador de cabeza
        await headIndicatorGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .end();

        // Animación de salida del enlace perteneciente al nodo a elimnar
        await linkToRemoveGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .ease(d3.easeBounce)
            .style("opacity", 0)
            .end();

        // Movimiento del nodo a decolar 
        const nodeMoveOffsetY = SVG_QUEUE_VALUES.ELEMENT_WIDTH * 0.8;

        // Animación de salida del nodo
        await nodeToRemoveGroup
            .transition()
            .ease(d3.easeBackInOut)
            .duration(1500)
            .attr("transform", () => {
                const currentPos = positions.get(dequeuedNode);
                const x = currentPos?.x ?? 0;
                const y = (currentPos?.y ?? 0) + nodeMoveOffsetY;
                return `translate(${x}, ${y})`;
            })
            .style("opacity", 0)
            .end();

        // Eliminación de los elementos del DOM correspondientes al nodo decolado
        nodeToRemoveGroup.remove();
        linkToRemoveGroup.remove();

        // Eliminación de la posición del nodo decolado
        positions.delete(dequeuedNode);

        // // Array de promesas para concretar animaciones de desplazamiento de nodos y enlaces restantes
        const shiftPromises: Promise<void>[] = [];

        // Selección de nodos restantes (re-vinculación de datos)
        const remainingNodes = svg.selectAll<SVGGElement, QueueNodeData>("g.node")
            .data(queueNodes, d => d.id);

        // Promesa para desplazamiento de nodos restantes a su posición final
        shiftPromises.push(
            remainingNodes
                .transition()
                .duration(1000)
                .ease(d3.easeQuadOut)
                .attr("transform", (d) => {
                    const finalPos = positions.get(d.id)!;
                    return `translate(${finalPos.x}, ${finalPos.y})`;
                })
                .end()
        );

        // Selección de enlaces restantes (re-vinculación de datos)
        const remainingLinks = svg.selectAll<SVGGElement, LinkData>("g.link")
            .data(linksData, d => `link-${d.sourceId}-${d.targetId}-${d.type}`);

        // Promesa para desplazamiento de enlaces restantes a su posición final
        shiftPromises.push(
            remainingLinks.select("path.node-link")
                .transition()
                .duration(1000)
                .ease(d3.easeQuadOut)
                .attr("d", d => calculateLinkPath(d, positions, SVG_QUEUE_VALUES.ELEMENT_WIDTH, SVG_QUEUE_VALUES.ELEMENT_HEIGHT))
                .end()
        );

        // Resolución de promesas para animación de desplazamiento
        await Promise.all(shiftPromises);

        // Entrada del indicador de cabeza
        await headIndicatorGroup
            .transition()
            .duration(1000)
            .ease(d3.easeBounce)
            .style("opacity", 1)
            .end();
    } else {
        // Animación de salida simple del nodo a decolar
        await nodeToRemoveGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .end();

        // Eliminación del elemento del DOM correspondiente al nodo decolado
        nodeToRemoveGroup.remove();

        // Eliminación de la posición del nodo decolado
        positions.delete(dequeuedNode);
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}