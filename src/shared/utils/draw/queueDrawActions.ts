import { LinkData, QueueNodeData } from "../../../types";
import * as d3 from "d3";
import { SVG_QUEUE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { calculateLinkPath } from "./calculateLinkPath";

/**
 * Función encargada renderizar los nodos de la cola dentro del lienzo.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param queueNodes Array con información de los nodos a renderizar.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param dims Dimensiones del lienzo y sus elementos.
 */
export function drawQueueNodes(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
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
    svg.selectAll<SVGGElement, QueueNodeData>("g.node")
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
                    .attr("width", elementWidth)
                    .attr("height", elementHeight)
                    .attr("rx", 6)
                    .attr("ry", 6)
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH);

                // Valor del nodo
                gEnter.append("text")
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
 * Función encargada de animar la inserción de un nuevo nodo en la cola.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param enqueuedNode Id del nodo encolado.
 * @param prevNode Id del nodo anterior al nuevo nodo.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateEnqueueNode(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    enqueuedNode: string,
    prevNode: string | null,
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    console.log("Nodo a encolar: ", enqueuedNode);
    console.log("Nodo previo: ", prevNode);
    console.log("Posiciones: ", positions);

    // Grupo del lienzo correspondiente al nuevo elemento
    const newNodeGroup = svg.select<SVGGElement>(`g#${enqueuedNode}`);

    // Estado visual inicial del nuevo nodo
    newNodeGroup.style("opacity", 0);

    if (prevNode) {
        // Grupo del lienzo correspondiente al enlace del nodo previo que apunta al nuevo nodo
        const nextLinkGroup = svg.select<SVGGElement>(`g#link-${prevNode}-${enqueuedNode}-next`);

        // Estado visual inicial del enlace del nodo previo que apunta al nuevo nodo
        nextLinkGroup.select("path.node-link").style("opacity", 0);

        // Posición de animación final del nuevo nodo
        const finalPos = positions.get(enqueuedNode)!;

        // Posición de animación inicial del nuevo nodo
        const initialYOffset = -60;
        const initialPos = { x: finalPos.x, y: finalPos.y + initialYOffset };

        // Mapa temporal de posiciones para calular la forma inicial del enlace
        const tempPositions: Map<string, {
            x: number;
            y: number;
        }> = new Map(positions);
        tempPositions.set(enqueuedNode, initialPos);

        // Cálculo de la forma inicial y final del enlace
        const initialPath = calculateLinkPath({ sourceId: prevNode, targetId: enqueuedNode, type: 'next' }, tempPositions, SVG_QUEUE_VALUES.ELEMENT_WIDTH, SVG_QUEUE_VALUES.ELEMENT_HEIGHT);
        const finalPath = calculateLinkPath({ sourceId: prevNode, targetId: enqueuedNode, type: 'next' }, positions, SVG_QUEUE_VALUES.ELEMENT_WIDTH, SVG_QUEUE_VALUES.ELEMENT_HEIGHT);

        // Posicionamiento inicial del nodo a encolar y el enlace que apunta a él
        newNodeGroup.attr("transform", `translate(${initialPos.x}, ${initialPos.y})`);
        nextLinkGroup.select("path.node-link").attr("d", initialPath);

        // Aparición del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .ease(d3.easePolyInOut)
            .end();

        // Aparición del enlace entre el nodo previo y el nuevo nodo
        await nextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .ease(d3.easeExpInOut)
            .end();

        // Promesas para movimiento del nuevo nodo y su enlace a su posición final
        const nodeMovePromise = newNodeGroup
            .transition()
            .duration(1500)
            .ease(d3.easeBounce)
            .attr("transform", `translate(${finalPos.x}, ${finalPos.y})`)
            .end();

        const linkMovePromise = nextLinkGroup.select("path.node-link")
            .transition()
            .duration(1500)
            .ease(d3.easeBounce)
            .attr("d", finalPath)
            .end();

        // Resolución de las promesas para animación de movimiento del nuevo nodo y su enlace
        await Promise.all([nodeMovePromise, linkMovePromise]);

        // Grupo del lienzo correspondiente al indicador del elemento final
        const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

        // Movimiento del indicador final a la posición del nuevo nodo
        await tailIndicatorGroup
            .transition()
            .duration(1000)
            .ease(d3.easeQuadInOut)
            .attr("transform", () => {
                const finalX = finalPos.x + SVG_QUEUE_VALUES.ELEMENT_WIDTH / 2;
                const finalY = finalPos.y;
                return `translate(${finalX}, ${finalY})`;
            })
            .end();
    } else {
        // Animación de aparición simple del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(1000)
            .ease(d3.easePolyInOut)
            .style("opacity", 1)
            .end();
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la salida de un nodo de la cola.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved Objeto con información de los nodos involucrados en la operación.
 * @param queueData Objeto con información de los nodos y enlaces de la cola.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateDequeueNode(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { dequeuedNode: string, newFirstNode: string | null },
    queueData: { remainingNodesData: QueueNodeData[], remainingLinksData: LinkData[] },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { dequeuedNode, newFirstNode } = nodesInvolved;

    // Grupo del lienzo correspondiente al elemento a decolar
    const nodeToRemoveGroup = svg.select<SVGGElement>(`g#${dequeuedNode}`);

    if (newFirstNode) {
        // Información de la cola
        const { remainingNodesData, remainingLinksData } = queueData;

        // Grupo del lienzo correspondiente al enlace del elemento a decolar
        const linkToRemoveGroup = svg.select<SVGGElement>(`g#link-${dequeuedNode}-${newFirstNode}-next`);

        // Grupo del lienzo correspondiente al indicador del elemento cabeza
        const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

        // Grupo del lienzo correspondiente al indicador del elemento final
        const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

        // Movimiento del nodo a decolar 
        const nodeMoveOffsetY = SVG_QUEUE_VALUES.ELEMENT_WIDTH * 0.8;

        // Salida del indicador de cabeza
        await headIndicatorGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .end();

        // Salida del enlace entre el nodo a decolar y el nuevo nodo cabeza
        await linkToRemoveGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .ease(d3.easeBounce)
            .style("opacity", 0)
            .end();

        // Salida del nodo a decolar
        await nodeToRemoveGroup
            .transition()
            .duration(1500)
            .ease(d3.easePolyInOut)
            .attr("transform", () => {
                const currentPos = positions.get(dequeuedNode);
                const x = currentPos?.x ?? 0;
                const y = (currentPos?.y ?? 0) + nodeMoveOffsetY;
                return `translate(${x}, ${y})`;
            })
            .style("opacity", 0)
            .end();

        // Eliminación de los elementos del DOM asociados al nodo decolado
        nodeToRemoveGroup.remove();
        linkToRemoveGroup.remove();

        // Eliminación de la posición del nodo decolado
        positions.delete(dequeuedNode);

        // Array de promesas para animaciones de desplazamiento de nodos y enlaces restantes
        const shiftPromises: Promise<void>[] = [];

        // Selección de nodos restantes (re-vinculación de datos)
        const remainingNodes = svg.selectAll<SVGGElement, QueueNodeData>("g.node")
            .data(remainingNodesData, d => d.id);

        // Promesa para desplazamiento de nodos restantes a su posición final
        shiftPromises.push(
            remainingNodes
                .transition()
                .duration(1000)
                .ease(d3.easeQuadInOut)
                .attr("transform", (d) => {
                    const finalPos = positions.get(d.id)!;
                    return `translate(${finalPos.x}, ${finalPos.y})`;
                })
                .end()
        );

        // Selección de enlaces restantes (re-vinculación de datos)
        const remainingLinks = svg.selectAll<SVGGElement, LinkData>("g.link")
            .data(remainingLinksData, d => `link-${d.sourceId}-${d.targetId}-${d.type}`);

        // Promesa para desplazamiento de enlaces restantes a su posición final
        shiftPromises.push(
            remainingLinks.select("path.node-link")
                .transition()
                .duration(1000)
                .ease(d3.easeQuadInOut)
                .attr("d", d => calculateLinkPath(d, positions, SVG_QUEUE_VALUES.ELEMENT_WIDTH, SVG_QUEUE_VALUES.ELEMENT_HEIGHT))
                .end()
        );

        // Promesa para posicionamiento del indicador del elemento final a su correspondiente elemento
        const finalTailIndicatorPos = positions.get(remainingNodesData[remainingNodesData.length - 1].id)!;
        shiftPromises.push(
            tailIndicatorGroup
                .transition()
                .duration(1000)
                .ease(d3.easeQuadInOut)
                .attr("transform", () => {
                    const finalX = finalTailIndicatorPos.x + SVG_QUEUE_VALUES.ELEMENT_WIDTH / 2;
                    const finalY = finalTailIndicatorPos.y;
                    return `translate(${finalX}, ${finalY})`;
                })
                .end()
        );

        // Resolución de las promesas de animación de desplazamiento
        await Promise.all(shiftPromises);

        // Entrada del indicador de cabeza
        await headIndicatorGroup
            .transition()
            .duration(1000)
            .ease(d3.easeBounce)
            .style("opacity", 1)
            .end();
    } else {
        // Animación de salida simple del nodo
        await nodeToRemoveGroup
            .transition()
            .duration(1000)
            .ease(d3.easePolyInOut)
            .style("opacity", 0)
            .end();

        // Eliminación de los elementos del DOM correspondientes al nodo decolado
        nodeToRemoveGroup.remove();

        // Eliminación de la posición del nodo decolado
        positions.delete(dequeuedNode);
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}