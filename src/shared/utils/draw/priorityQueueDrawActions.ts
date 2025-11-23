import { ListLinkData, PriorityQueueNodeData, QueueNodeData } from "../../../types";
import { color, Selection } from "d3";
import { SVG_PRIORITY_QUEUE_VALUES, SVG_QUEUE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { Dispatch, SetStateAction } from "react";
import { repositionList } from "./drawActionsUtilities";
import { animateAppearListNode, animateExitListNode } from "./simpleLinkedListDrawActions";
import { buildListPath } from "../listUtils";

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
 * Función encargada de renderizar los nodos de una cola de prioridad dentro del lienzo.
 * @param nodesLayer Selección D3 del elemento SVG del grupo (`<g>`) donde se van a renderizar los nodos de la cola.
 * @param queueNodes Array con información de los nodos a renderizar.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param dims Dimensiones del lienzo y sus elementos.
 */
export function drawPriorityQueueNodes(
    nodesLayer: Selection<SVGGElement, unknown, null, undefined>,
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
    nodesLayer.selectAll<SVGGElement, PriorityQueueNodeData>("g.node")
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
                    .attr("stroke", d => color(getPriorityColor(d.priority).stroke)?.brighter(0.8)?.toString() || getPriorityColor(d.priority).stroke)
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
                    .attr("stroke", d => color(getPriorityColor(d.priority).stroke)?.brighter(0.8)?.toString() || getPriorityColor(d.priority).stroke);

                return update;
            },
            exit => exit
        );
}

/**
 * Función encargada de animar el proceso de inserción de un nuevo nodo en una cola de prioridad.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la cola de prioridad necesaria para la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateEnqueuePriorityNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newNodeId: string;
        prevNodeId: string | null;
        nextNodeId: string | null;
        insertionPosition: number;
        nodesData: PriorityQueueNodeData[];
        linksData: ListLinkData[];
        positions: Map<string, { x: number; y: number }>;
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { newNodeId, prevNodeId, nextNodeId } = insertionData;

    try {
        // Grupos contenedores de nodos y enlaces de la lista
        const nodesG = svg.select<SVGGElement>("g#nodes-layer");
        const linksG = svg.select<SVGGElement>("g#links-layer");

        // Grupo correspondiente al nuevo nodo
        const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);
        newNodeGroup.style("opacity", 0);

        if (!prevNodeId && !nextNodeId) {
            // Grupo correspondiente al indicador de inicio
            const initialIndicatorGroup = svg.select<SVGGElement>("g#initial-indicator");

            // Aparición del nuevo nodo junto al indicador de inicio
            await newNodeGroup.transition().duration(1000).style("opacity", 1).end();
            await initialIndicatorGroup.transition().duration(800).style("opacity", 1).end();
        } else if (!prevNodeId && nextNodeId) {
            // Inserción al inicio
            const initialIndicatorGroup = svg.select<SVGGElement>("g#initial-indicator");

            // Grupo correspondiente al enlace siguiente del nuevo nodo que apunta al inicio
            const newNodeNextLinkGroup = linksG.select<SVGGElement>(`g#link-${newNodeId}-${nextNodeId}-next`);

            // Estado visual inicial del enlace siguiente del nuevo nodo
            newNodeNextLinkGroup.style("opacity", 0);

            // Reposicionamiento de los elementos restantes de la cola de prioridad a su posición final
            await repositionList(
                svg,
                insertionData.nodesData,
                insertionData.linksData,
                insertionData.positions,
                {
                    headIndicator: initialIndicatorGroup,
                    headNodeId: nextNodeId,
                    tailIndicator: null,
                    tailNodeId: null,
                }
            );

            // Aparición y posicionamiento del nuevo nodo
            const newNodePos = insertionData.positions.get(newNodeId)!;
            const initialNewNodePos = {
                x: newNodePos.x,
                y: newNodePos.y - 70,
            };
            await animateAppearListNode(newNodeGroup, initialNewNodePos, newNodePos);

            // Establecimiento del enlace siguiente del nuevo nodo
            await newNodeNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();

            // Posicionamiento del indicador de inicio al nuevo nodo inicial de la cola de prioridad
            await initialIndicatorGroup
                .transition()
                .duration(1500)
                .attr("transform", () => {
                    const finalX = newNodePos.x + SVG_QUEUE_VALUES.ELEMENT_WIDTH / 2;
                    const finalY = newNodePos.y;
                    return `translate(${finalX}, ${finalY})`;
                })
                .end();
        } else if (prevNodeId && !nextNodeId) {
            // Inserción al final
            const { nodesData } = insertionData;

            // Grupo correspondiente al enlace siguiente del nodo final que apunta al nuevo nodo
            const lastNodeNextLinkGroup = linksG.select<SVGGElement>(`g#link-${prevNodeId}-${newNodeId}-next`);

            // Estado visual inicial del enlace siguiente del nodo final
            lastNodeNextLinkGroup.style("opacity", 0);

            // Recorrido de los nodos hasta la posición de inserción (último nodo actual)
            const nodesToTraverse = nodesData.slice(0, -1);
            for (let i = 0; i < nodesToTraverse.length - 1; i++) {
                // Selección del grupo correspondiente al nodo actual
                const currRectElement = nodesG.select<SVGRectElement>(`g#${nodesToTraverse[i].id} rect.node-container`);

                // Resaltado del nodo actual
                await currRectElement
                    .transition()
                    .duration(800)
                    .attr("stroke", "#D72638")
                    .attr("stroke-width", 3)
                    .end();

                // Restablecimiento del borde original del nodo actual (antes de pasar al sig. nodo)
                await currRectElement
                    .transition()
                    .duration(800)
                    .attr("stroke", getPriorityColor(nodesToTraverse[i].priority).stroke)
                    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                    .end();
            }

            // Resaltado final del nodo objetivo
            const targetElement = nodesG.select<SVGRectElement>(`g#${nodesToTraverse[nodesToTraverse.length - 1].id} rect.node-container`);
            await targetElement
                .transition()
                .duration(800)
                .attr("stroke", "#D72638")
                .attr("stroke-width", 3)
                .end();

            // Aparición y posicionamiento del nuevo nodo
            const newNodePos = insertionData.positions.get(newNodeId)!;
            const initialNewNodePos = {
                x: newNodePos.x,
                y: newNodePos.y - 70,
            };
            await animateAppearListNode(newNodeGroup, initialNewNodePos, newNodePos);

            // Establecimiento del enlace siguiente del nodo final
            await lastNodeNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();
        } else {
            // Inserción en una posición intermedia
            const { insertionPosition, nodesData, linksData } = insertionData;

            // Grupos correspondientes a los nuevos elementos producto de la inserción
            const prevNodeNewNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${prevNodeId}-${newNodeId}-next`
            );
            prevNodeNewNextLinkGroup.style("opacity", 0);

            const newNodeNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${newNodeId}-${nextNodeId}-next`
            );
            newNodeNextLinkGroup.style("opacity", 0);

            // Recorrido de los nodos hasta la posición de inserción
            const nodesToTraverse = nodesData.slice(0, insertionPosition);
            for (let i = 0; i < nodesToTraverse.length - 1; i++) {
                // Selección del grupo correspondiente al nodo actual
                const currRectElement = nodesG.select<SVGRectElement>(`g#${nodesToTraverse[i].id} rect.node-container`);

                // Resaltado del nodo actual
                await currRectElement
                    .transition()
                    .duration(800)
                    .attr("stroke", "#D72638")
                    .attr("stroke-width", 3)
                    .end();

                // Restablecimiento del borde original del nodo actual (antes de pasar al sig. nodo)
                await currRectElement
                    .transition()
                    .duration(800)
                    .attr("stroke", getPriorityColor(nodesToTraverse[i].priority).stroke)
                    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                    .end();
            }

            // Resaltado final del nodo objetivo
            const targetElement = nodesG.select<SVGRectElement>(`g#${nodesToTraverse[nodesToTraverse.length - 1].id} rect.node-container`);
            await targetElement
                .transition()
                .duration(800)
                .attr("stroke", "#D72638")
                .attr("stroke-width", 3)
                .end();

            // Nodos a desplazar y enlaces a ajustar para la inclusión del nuevo nodo (incluyendo el actual enlace siguiente
            // entre el nodo previo y siguiente del nuevo nodo)
            const nodesToMove = nodesData.slice(
                insertionPosition,
                nodesData.length
            );
            const linksToMove = linksData.slice(
                insertionPosition,
                linksData.length
            );
            linksToMove.push({ sourceId: prevNodeId!, targetId: nextNodeId!, type: "next" });

            // Reposicionamiento de los elementos indicados de la lista a su posición final
            await repositionList(svg,
                nodesToMove,
                linksToMove,
                insertionData.positions,
                {
                    headIndicator: null,
                    headNodeId: null,
                    tailIndicator: null,
                    tailNodeId: null
                }
            );

            // Posición de animación inicial del nuevo nodo
            const newNodePos = insertionData.positions.get(newNodeId)!;
            const initialNewNodePos = { x: newNodePos.x, y: newNodePos.y - 70 };

            // Forma inicial de los nuevos enlaces producto de la inserción
            const initialPrevNodeNewNextLink = buildListPath(
                "next",
                insertionData.positions.get(prevNodeId!) ?? null,
                initialNewNodePos,
                SVG_QUEUE_VALUES.ELEMENT_WIDTH,
                SVG_QUEUE_VALUES.ELEMENT_HEIGHT
            );
            prevNodeNewNextLinkGroup
                .select("path.node-link")
                .attr("d", initialPrevNodeNewNextLink);

            const initialNewNodeNextLink = buildListPath(
                "next",
                initialNewNodePos,
                insertionData.positions.get(nextNodeId!) ?? null,
                SVG_QUEUE_VALUES.ELEMENT_WIDTH,
                SVG_QUEUE_VALUES.ELEMENT_HEIGHT
            );
            newNodeNextLinkGroup
                .select("path.node-link")
                .attr("d", initialNewNodeNextLink);

            // Aparición y posicionamiento inicial del nuevo nodo
            await animateAppearListNode(newNodeGroup, initialNewNodePos);

            // Establecimiento del enlace siguiente del nuevo nodo
            await newNodeNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();

            // Desconexión del actual enlace siguiente entre el nodo previo y siguiente al nuevo nodo
            await linksG.select<SVGGElement>(`g#link-${prevNodeId}-${nextNodeId}-next`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Establecimiento del nuevo enlace siguiente del nodo previo
            await prevNodeNewNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();

            // Forma final de los nuevos enlaces producto de la inserción
            const finalPrevNodeNewNextLink = buildListPath(
                "next",
                insertionData.positions.get(prevNodeId!) ?? null,
                newNodePos,
                SVG_QUEUE_VALUES.ELEMENT_WIDTH,
                SVG_QUEUE_VALUES.ELEMENT_HEIGHT
            );
            const finalNewNodeNextLink = buildListPath(
                "next",
                newNodePos,
                insertionData.positions.get(nextNodeId!) ?? null,
                SVG_QUEUE_VALUES.ELEMENT_WIDTH,
                SVG_QUEUE_VALUES.ELEMENT_HEIGHT
            );

            // Promesas para movimiento del nuevo nodo y enlaces asociados a sus posiciones finales
            const shiftPromises: Promise<void>[] = [];
            shiftPromises.push(
                newNodeGroup
                    .transition()
                    .duration(1000)
                    .attr(
                        "transform",
                        `translate(${newNodePos.x}, ${newNodePos.y})`
                    )
                    .end()
            );
            shiftPromises.push(
                prevNodeNewNextLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1000)
                    .attr("d", finalPrevNodeNewNextLink)
                    .end()
            );
            shiftPromises.push(
                newNodeNextLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1000)
                    .attr("d", finalNewNodeNextLink)
                    .end()
            );

            await Promise.all(shiftPromises);
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
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de eliminación del nodo con mayor prioridad de una cola de prioridad.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la cola de prioridad necesaria para la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void `>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDequeuePriorityNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        currInitialNodeId: string,
        newInitialNodeId: string | null,
        remainingNodesData: QueueNodeData[];
        remainingLinksData: ListLinkData[];
        positions: Map<string, { x: number; y: number }>;
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Nodos implicados en la eliminación
    const { currInitialNodeId, newInitialNodeId } = deletionData;

    try {
        // Grupos contenedores de nodos y enlaces de la lista
        const nodesG = svg.select<SVGGElement>("g#nodes-layer");
        const linksG = svg.select<SVGGElement>("g#links-layer");

        // Grupo correspondiente al nodo a eliminar
        const removalNodeGroup = nodesG.select<SVGGElement>(`g#${currInitialNodeId} `);

        // Grupo correspondiente al indicador de inicio
        const initialIndicatorGroup = svg.select<SVGGElement>("g#initial-indicator");

        if (!newInitialNodeId) {
            // Salida del nodo a eliminar junto al indicador de inicio
            await initialIndicatorGroup.transition().duration(800).style("opacity", 0).remove().end();
            await removalNodeGroup.transition().duration(1000).style("opacity", 0).remove().end();
        } else {
            const { positions, remainingNodesData, remainingLinksData } = deletionData;

            // Grupo correspondiente al enlace siguiente del nodo a eliminar que apunta al nuevo nodo inicial
            const removalNodeNextLinkGroup = linksG.select<SVGGElement>(`g#link-${currInitialNodeId}-${newInitialNodeId}-next`);

            // Salida del indicador de inicio
            await initialIndicatorGroup
                .transition()
                .duration(800)
                .style("opacity", 0)
                .end();

            // Desconexión del enlace siguiente del nodo a eliminar
            await removalNodeNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Salida del nodo a eliminar
            const removalNodePos = positions.get(currInitialNodeId)!;
            const finalRemovalNodePos = {
                x: removalNodePos.x,
                y: removalNodePos.y + SVG_QUEUE_VALUES.ELEMENT_WIDTH * 0.8,
            };
            await animateExitListNode(removalNodeGroup, finalRemovalNodePos);

            // Reposicionamiento de los elementos restantes de la cola de prioridad a su posición final
            await repositionList(
                svg,
                remainingNodesData,
                remainingLinksData,
                positions,
                {
                    headIndicator: null,
                    headNodeId: null,
                    tailIndicator: null,
                    tailNodeId: null,
                }
            );

            // Entrada del indicador de inicio (ahora apuntando al nuevo nodo inicial de la cola de prioridad)
            await initialIndicatorGroup
                .transition()
                .duration(800)
                .style("opacity", 1)
                .end();
        }

        // Limpiamos el registro del nodo eliminado
        deletionData.positions.delete(currInitialNodeId);
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}