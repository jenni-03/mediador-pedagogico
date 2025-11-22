import { ListLinkData, QueueNodeData } from "../../../types";
import { Selection } from "d3";
import { SVG_QUEUE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { Dispatch, SetStateAction } from "react";
import { animateAppearListNode, animateExitListNode } from "./simpleLinkedListDrawActions";
import { repositionList } from "./drawActionsUtilities";
import { type EventBus } from "../../events/eventBus";

/**
 * Función encargada de renderizar los nodos de una cola dentro del lienzo.
 * @param nodesLayer Selección D3 del elemento SVG del grupo (`<g>`) donde se van a renderizar los nodos de la cola.
 * @param queueNodes Array con información de los nodos a renderizar.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param dims Dimensiones del lienzo y sus elementos.
 */
export function drawQueueNodes(
    nodesLayer: Selection<SVGGElement, unknown, null, undefined>,
    queueNodes: QueueNodeData[],
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
    nodesLayer.selectAll<SVGGElement, QueueNodeData>("g.node")
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

                // Contenedor del nodo
                gEnter.append("rect")
                    .attr("class", "node-container")
                    .attr("width", elementWidth)
                    .attr("height", elementHeight)
                    .attr("rx", 6)
                    .attr("ry", 6)
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH);

                // Valor del nodo
                gEnter.append("text")
                    .attr("class", "node-value")
                    .attr("x", elementWidth / 2)
                    .attr("y", elementHeight / 2)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "middle")
                    .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
                    .style("font-weight", SVG_STYLE_VALUES.ELEMENT_TEXT_WEIGHT)
                    .style("font-size", SVG_STYLE_VALUES.ELEMENT_TEXT_SIZE)
                    .text(d => d.value)
                    .style("letter-spacing", "0.5px");

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

                return update;
            },
            exit => exit
        );
}

/**
 * Función encargada de animar el proceso la inserción de un nuevo nodo en una cola.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la cola necesaria para la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateEnqueueNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newLastNodeId: string,
        currLastNodeId: string | null,
        positions: Map<string, { x: number, y: number }>
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { newLastNodeId, currLastNodeId } = insertionData;

    try {
        // Grupos contenedores de nodos y enlaces de la lista
        const nodesG = svg.select<SVGGElement>("g#nodes-layer");
        const linksG = svg.select<SVGGElement>("g#links-layer");

        // Grupo correspondiente al nuevo nodo
        const newNodeGroup = nodesG.select<SVGGElement>(`g#${newLastNodeId}`);
        newNodeGroup.style("opacity", 0);

        // Grupos correspondientes a los indicadores de inicio y fin
        const initialIndicatorGroup = svg.select<SVGGElement>("g#initial-indicator");
        const finalIndicatorGroup = svg.select<SVGGElement>("g#final-indicator");

        if (!currLastNodeId) {
            // Aparición del nuevo nodo junto a los indicadores de inicio y fin
            await newNodeGroup.transition().duration(1000).style("opacity", 1).end();
            await initialIndicatorGroup.transition().duration(800).style("opacity", 1).end();
            await finalIndicatorGroup.transition().duration(800).style("opacity", 1).end();
        } else {
            const { positions } = insertionData;

            // Grupo correspondiente al enlace siguiente del nodo final que apunta al nuevo nodo
            const currLastNodeNextLinkGroup = linksG.select<SVGGElement>(`g#link-${currLastNodeId}-${newLastNodeId}-next`);
            currLastNodeNextLinkGroup.style("opacity", 0);

            // Aparición y posicionamiento del nuevo nodo
            const newNodePos = positions.get(newLastNodeId)!;
            const initialNewNodePos = { x: newNodePos.x, y: newNodePos.y - 70 };
            await animateAppearListNode(newNodeGroup, initialNewNodePos, newNodePos);

            // Establecimiento del enlace siguiente del nodo final
            await currLastNodeNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();

            // Posicionamiento del indicador final al nuevo nodo final de la cola
            await finalIndicatorGroup
                .transition()
                .duration(1500)
                .attr("transform", () => {
                    const finalX =
                        newNodePos.x + SVG_QUEUE_VALUES.ELEMENT_WIDTH / 2;
                    const finalY = newNodePos.y;
                    return `translate(${finalX}, ${finalY})`;
                })
                .end();
        }
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de eliminación de un nodo de una cola.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la cola necesaria para la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDequeueNode(
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
        const removalNodeGroup = nodesG.select<SVGGElement>(`g#${currInitialNodeId}`);

        // Grupos correspondientes a los indicadores de inicio y fin
        const initialIndicatorGroup = svg.select<SVGGElement>("g#initial-indicator");
        const finalIndicatorGroup = svg.select<SVGGElement>("g#final-indicator");

        if (!newInitialNodeId) {
            // Salida del nodo a eliminar junto a los indicadores de inicio y fin
            await initialIndicatorGroup.transition().duration(800).style("opacity", 0).remove().end();
            await finalIndicatorGroup.transition().duration(800).style("opacity", 0).remove().end();
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

            // Reposicionamiento de los elementos restantes de la cola a su posición final
            await repositionList(
                svg,
                remainingNodesData,
                remainingLinksData,
                positions,
                {
                    headIndicator: null,
                    headNodeId: null,
                    tailIndicator: finalIndicatorGroup,
                    tailNodeId: remainingNodesData[remainingNodesData.length - 1].id,
                }
            );

            // Entrada del indicador de inicio (ahora apuntando al nuevo nodo inicial de la cola)
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

/**
 * Función encargada de eliminar todos los nodos y enlaces de una cola dentro del lienzo.
 * @param nodesG Selección D3 del grupo <g> que contiene los nodos de la cola.
 * @param linksG Selección D3 del grupo <g> que contiene los enlaces entre nodos.
 * @param nodePositions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateClearQueue(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    nodePositions: Map<string, { x: number; y: number }>,
    bus: EventBus,
    labels: {
        CLEAR_TAIL?: number;
        CLEAR_HEAD: number;
        RESET_SIZE: number;
    },
    stepId: string,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "clean" });

        // Elementos dentro del lienzo
        const initialIndicatorG = svg.select<SVGGElement>("g#initial-indicator");
        const nodesG = svg.select<SVGGElement>("g#nodes-layer");
        const linksG = svg.select<SVGGElement>("g#links-layer");

        // Salida del indicador de cabeza
        bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_HEAD });
        await initialIndicatorG
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();

        // Salida del indicador de cola
        if (labels.CLEAR_TAIL) {
            const finalIndicatorG = svg.select<SVGGElement>("g#final-indicator");

            bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_TAIL });
            await finalIndicatorG
                .transition()
                .duration(800)
                .style("opacity", 0)
                .remove()
                .end();
        }

        // salida de los enlaces
        bus.emit("step:progress", { stepId, lineIndex: labels.RESET_SIZE });
        await linksG
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();

        // salida de los nodos
        await nodesG
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();

        // Limpieza del mapa de posiciones
        nodePositions.clear();

        // Fin de la operación
        bus.emit("op:done", { op: "clean" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}