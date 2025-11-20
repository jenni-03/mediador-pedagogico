import { ListLinkData, QueueNodeData } from "../../../types";
import { Selection } from "d3";
import { SVG_QUEUE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { Dispatch, SetStateAction } from "react";
import { animateAppearListNode, animateExitListNode } from "./simpleLinkedListDrawActions";
import { repositionList } from "./drawActionsUtilities";

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

        // Grupos correspondientes a los indicadores de cabeza y cola
        const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");
        const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

        if (!currLastNodeId) {
            await newNodeGroup.transition().duration(1000).style("opacity", 1).end();
            await headIndicatorGroup.transition().duration(800).style("opacity", 1).end();
            await tailIndicatorGroup.transition().duration(800).style("opacity", 1).end();
        } else {
            const { positions } = insertionData;

            // Grupo correspondiente al enlace siguiente del último nodo actual que apunta al nuevo nodo
            const currLastNodeNextLinkGroup = linksG.select<SVGGElement>(`g#link-${currLastNodeId}-${newLastNodeId}-next`);
            currLastNodeNextLinkGroup.style("opacity", 0);

            // Aparición y posicionamiento del nuevo nodo
            const newNodePos = positions.get(newLastNodeId)!;
            const initialNewNodePos = { x: newNodePos.x, y: newNodePos.y - 60 };
            await animateAppearListNode(newNodeGroup, initialNewNodePos, newNodePos);

            // Establecimiento del enlace siguiente del último nodo actual
            await currLastNodeNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();

            // Posicionamiento del indicador final al nuevo nodo
            await tailIndicatorGroup
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
        currFirstNodeId: string,
        newFirstNodeId: string | null,
        remainingNodesData: QueueNodeData[];
        remainingLinksData: ListLinkData[];
        positions: Map<string, { x: number; y: number }>;
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Nodos implicados en la eliminación
    const { currFirstNodeId, newFirstNodeId } = deletionData;

    try {
        // Grupos contenedores de nodos y enlaces de la lista
        const nodesG = svg.select<SVGGElement>("g#nodes-layer");
        const linksG = svg.select<SVGGElement>("g#links-layer");

        // Grupo correspondiente al nodo a eliminar
        const removalNodeGroup = nodesG.select<SVGGElement>(`g#${currFirstNodeId}`);

        // Grupos correspondientes a los indicadores de cabeza y cola
        const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");
        const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

        if (!newFirstNodeId) {
            // Salida de indicadores y el nodo a eliminar
            await headIndicatorGroup.transition().duration(800).style("opacity", 0).remove().end();
            await tailIndicatorGroup.transition().duration(800).style("opacity", 0).remove().end();
            await removalNodeGroup.transition().duration(1000).style("opacity", 0).remove().end();
        } else {
            const { positions, remainingNodesData, remainingLinksData } = deletionData;

            // Grupo correspondiente al enlace siguiente del nodo a eliminar
            const removalNodeNextLinkGroup = linksG.select<SVGGElement>(`g#link-${currFirstNodeId}-${newFirstNodeId}-next`);

            // Salida del indicador de cabeza
            await headIndicatorGroup
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
            const removalNodePos = positions.get(currFirstNodeId)!;
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
                    tailIndicator: tailIndicatorGroup,
                    tailNodeId: remainingNodesData[remainingNodesData.length - 1].id,
                }
            );

            // Entrada del indicador de cabeza (ahora apuntando al nuevo primer nodo de la cola)
            await headIndicatorGroup
                .transition()
                .duration(800)
                .style("opacity", 1)
                .end();
        }

        // Limpiamos el registro del nodo eliminado
        deletionData.positions.delete(currFirstNodeId);
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}