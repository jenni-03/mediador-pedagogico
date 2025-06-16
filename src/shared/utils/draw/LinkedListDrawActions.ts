import { LinkData, ListNodeData } from "../../../types";
import { SVG_LINKED_LIST_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { calculateLinkPath } from "./calculateLinkPath";
import * as d3 from "d3";

/**
 * Función encargada de animar la inserción de un nuevo nodo al inicio de la lista.
 * 
 * @param svg - Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved - Objeto con información de los nodos involucrados en la inserción.
 * @param listData - Objeto con información de los nodos y enlaces de la lista.
 * @param positions - Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues - Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating - Función para establecer el estado de animación.
 */
export async function animateInsertFirst(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { newHeadNode: string, prevHeadNode: string | null },
    listData: { existingNodesData: ListNodeData[], existingLinksData: LinkData[], showDoubleLinks: boolean, showTailIndicator: boolean },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { newHeadNode, prevHeadNode } = nodesInvolved;

    // Grupo del lienzo correspondiente al nuevo nodo
    const newNodeGroup = svg.select<SVGGElement>(`g#${newHeadNode}`);

    // Estado inicial del nuevo nodo
    newNodeGroup.style("opacity", 0);

    if (prevHeadNode) {
        // Información de la lista
        const { existingNodesData, existingLinksData, showDoubleLinks, showTailIndicator } = listData;

        // Grupo del lienzo correspondiente al indicador del nodo cabeza
        const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

        // Posición de animación final del nuevo nodo
        const finalNewNodePos = positions.get(newHeadNode)!;

        // Grupo del lienzo correspondiente al enlace siguiente del nuevo nodo
        const nextLinkGroup = svg.select<SVGGElement>(`g#link-${newHeadNode}-${prevHeadNode}-next`);

        // Estado visual inicial del enlace del del nuevo nodo
        nextLinkGroup.select("path.node-link").style("opacity", 0);

        // Grupo del lienzo correspondiente al enlace previo del anterior primer nodo (solo para listas dobles)
        const prevLinkToNewNodeGroup = showDoubleLinks ? svg.select<SVGGElement>(`g#link-${prevHeadNode}-${newHeadNode}-prev`) : null;

        // Estado visual inicial del enlace previo del anterior primer nodo
        if (prevLinkToNewNodeGroup) {
            prevLinkToNewNodeGroup.select("path.node-link").style("opacity", 0);
        }

        // Array de promesas para concretar animaciones de desplazamiento de nodos y enlaces
        const shiftPromises: Promise<void>[] = [];

        // Selección de nodos restantes (re-vinculación de datos)
        const remainingNodes = svg.selectAll<SVGGElement, ListNodeData>("g.node")
            .data(existingNodesData, d => d.id);

        // Promesa para animación de desplazamiento de nodos existentes a su posición final
        shiftPromises.push(
            remainingNodes
                .transition()
                .duration(1500)
                .ease(d3.easePolyInOut)
                .attr("transform", (d) => {
                    const finalPos = positions.get(d.id)!;
                    return `translate(${finalPos.x}, ${finalPos.y})`;
                })
                .end()
        );

        // Selección de enlaces restantes (re-vinculación de datos)
        const remainingLinks = svg.selectAll<SVGGElement, LinkData>("g.link")
            .data(existingLinksData, d => `link-${d.sourceId}-${d.targetId}-${d.type}`);

        // Promesa para animación de desplazamiento de enlaces existentes a su posición final
        shiftPromises.push(
            remainingLinks.select("path.node-link")
                .transition()
                .duration(1500)
                .ease(d3.easePolyInOut)
                .attr("d", d => calculateLinkPath(d, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT))
                .end()
        );

        // Posición de animación inicial del indicador de cabeza
        const initialHeadIndicatorPos = positions.get(prevHeadNode)!;
        shiftPromises.push(
            headIndicatorGroup
                .transition()
                .duration(1500)
                .ease(d3.easePolyInOut)
                .attr("transform", () => {
                    const finalX = initialHeadIndicatorPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
                    const finalY = initialHeadIndicatorPos.y;
                    return `translate(${finalX}, ${finalY})`;
                })
                .end()
        );

        if (showTailIndicator) {
            // Grupo del lienzo correspondiente al indicador del nodo cola
            const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

            // Posición de animación final del indicador de cola
            const finalTailIndicatorPos = positions.get(existingNodesData[existingNodesData.length - 1].id)!;
            shiftPromises.push(
                tailIndicatorGroup
                    .transition()
                    .duration(1500)
                    .ease(d3.easePolyInOut)
                    .attr("transform", () => {
                        const finalX = finalTailIndicatorPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
                        const finalY = finalTailIndicatorPos.y;
                        return `translate(${finalX}, ${finalY})`;
                    })
                    .end()
            );
        }

        // Resolución de las promesas de animación de movimiento
        await Promise.all(shiftPromises);

        // Posición de animación inicial del nuevo nodo
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
        await nextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();

        // Aparición del enlace previo del nodo cabeza anterior que apunta al nuevo nodo (solo para listas dobles)
        if (prevLinkToNewNodeGroup) {
            await prevLinkToNewNodeGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();
        }

        // Movimiento del indicador de cabeza hacia el nuevo nodo
        await headIndicatorGroup
            .transition()
            .duration(1000)
            .ease(d3.easeQuadInOut)
            .attr("transform", () => {
                const finalX = finalNewNodePos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
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

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la inserción de un nuevo nodo al final de la lista.
 * 
 * @param svg - Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved - Objeto con información de los nodos involucrados en la inserción.
 * @param listData - Objeto con información relacionada a los nodos de la lista. 
 * @param positions - Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues - Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating - Función para establecer el estado de animación.
 */
export async function animateInsertLast(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { newLastNode: string, prevLastNode: string | null },
    listData: { existingNodesData: ListNodeData[], showDoubleLinks: boolean, showTailIndicator: boolean },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { newLastNode, prevLastNode } = nodesInvolved;

    // Grupo del lienzo correspondiente al nuevo elemento
    const newNodeGroup = svg.select<SVGGElement>(`g#${newLastNode}`);

    // Estado visual inicial del nuevo nodo
    newNodeGroup.style("opacity", 0);

    if (prevLastNode) {
        // Información de la lista
        const { existingNodesData, showDoubleLinks, showTailIndicator } = listData;

        // Posición de animación final del nuevo nodo
        const finalNewNodePos = positions.get(newLastNode)!;

        // Grupo del lienzo correspondiente al enlace que apunta al nuevo último nodo
        const nextLinkToNewNodeGroup = svg.select<SVGGElement>(`g#link-${prevLastNode}-${newLastNode}-next`);

        // Estado visual inicial del enlace que apunta al nuevo último nodo
        nextLinkToNewNodeGroup.select("path.node-link").style("opacity", 0);

        // Grupo del lienzo correspondiente al enlace previo del nuevo último nodo (solo para listas dobles)
        const newNodePrevLinkGroup = showDoubleLinks ? svg.select<SVGGElement>(`g#link-${newLastNode}-${prevLastNode}-prev`) : null;

        // Estado visual inicial del enlace previo del nuevo último nodo
        if (newNodePrevLinkGroup) {
            newNodePrevLinkGroup.select("path.node-link").style("opacity", 0);
        }

        // Grupo del lienzo correspondiente al nodo anterior al nuevo último nodo
        const prevLastNodeGroup = svg.select<SVGGElement>(`g#${prevLastNode}`);

        // Si no es una lista doblemente enlazada, se recorre la lista hasta el último nodo
        if (!showDoubleLinks) {
            for (const node of existingNodesData) {
                // Selección del grupo del nodo actual
                const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);

                // Selección del elemento a animar
                const nodeElement = nodeGroup.select("rect");

                // Resaltado del nodo actual
                await nodeElement
                    .transition()
                    .duration(700)
                    .attr("stroke", "#f87171")
                    .attr("stroke-width", 3)
                    .end();

                // Restablecimiento del estilo original del nodo (excepto para el último nodo)
                if (node.id !== prevLastNode) {
                    await nodeElement
                        .transition()
                        .duration(700)
                        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                        .end();
                }
            }
        } else {
            // Resaltado del nodo anterior al nuevo útlimo nodo
            await prevLastNodeGroup
                .select("rect")
                .transition()
                .duration(1000)
                .attr("stroke", "#f87171")
                .attr("stroke-width", 3)
                .end();
        }

        // Posición de animación inicial del nuevo nodo
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

        // Aparición del enlace que apunta al nuevo último nodo
        await nextLinkToNewNodeGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();

        // Aparición del enlace previo del nuevo último nodo (solo para listas dobles)
        if (newNodePrevLinkGroup) {
            await newNodePrevLinkGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();
        }

        // Restablecimiento del estilo del nodo anterior al nuevo último nodo
        await prevLastNodeGroup
            .select("rect")
            .transition()
            .duration(500)
            .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
            .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
            .end();

        if (showTailIndicator) {
            // Grupo del lienzo correspondiente al indicador del nodo cola
            const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

            // Desplazamiento del indicador de cola a la posición del nuevo último nodo
            const finalTailIndicatorPos = positions.get(newLastNode)!;
            await tailIndicatorGroup
                .transition()
                .duration(1000)
                .ease(d3.easeQuadInOut)
                .attr("transform", () => {
                    const finalX = finalTailIndicatorPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
                    const finalY = finalTailIndicatorPos.y;
                    return `translate(${finalX}, ${finalY})`;
                })
                .end();
        }
    } else {
        // Animación de aparición simple del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la inserción de un nuevo nodo en una posición especifica.
 *  
 * @param svg - Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved - Objeto con información de los nodos involucrados en la inserción.
 * @param listData -  Objeto con información de los nodos y enlaces de la lista.
 * @param insertionPosition - Posición en la que el nuevo nodo será insertado.
 * @param positions - Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues - Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating - Función para establecer el estado de animación.
 */
export async function animateInsertAtPosition(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { newNode: string, prevNode: string, nextNode: string },
    listData: { existingNodesData: ListNodeData[], existingLinksData: LinkData[], showDoubleLinks: boolean, showTailIndicator: boolean },
    insertionPosition: number,
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { newNode, prevNode, nextNode } = nodesInvolved;

    // Información de la lista
    const { existingNodesData, existingLinksData, showDoubleLinks, showTailIndicator } = listData;

    // Grupo del lienzo correspondiente al nuevo elemento
    const newNodeGroup = svg.select<SVGGElement>(`g#${newNode}`);

    // Grupo del lienzo correspondiente al nodo anterior al nodo a insertar
    const prevNodeGroup = svg.select<SVGGElement>(`g#${prevNode}`);

    // Posición de animación final del nuevo nodo
    const finalNewNodePos = positions.get(newNode)!;

    // Grupo del lienzo correspondiente al enlace siguiente del nodo previo que apunta al nuevo nodo
    const nextLinkToNewNodeGroup = svg.select<SVGGElement>(`g#link-${prevNode}-${newNode}-next`);

    // Grupo del lienzo correspondiente al enlace siguiente del nuevo nodo
    const nextLinkOfNewNodeGroup = svg.select<SVGGElement>(`g#link-${newNode}-${nextNode}-next`);

    // Estado inicial del nuevo nodo
    newNodeGroup.style("opacity", 0);

    // Estado inicial del enlace que apunta al nuevo nodo
    nextLinkToNewNodeGroup.select("path.node-link").style("opacity", 0);

    // Estado inicial del enlace que apunta al siguiente del nuevo nodo
    nextLinkOfNewNodeGroup.select("path.node-link").style("opacity", 0);

    // Grupo del lienzo correspondiente al enlace anterior del nodo siguiente que apunta al nuevo nodo (solo para listas dobles)
    const prevLinkToNewNodeGroup = showDoubleLinks ? svg.select<SVGGElement>(`g#link-${nextNode}-${newNode}-prev`) : null;

    // Grupo del lienzo correspondiente al enlace previo del nuevo nodo (solo para listas dobles)
    const prevLinkOfNewNodeGroup = showDoubleLinks ? svg.select<SVGGElement>(`g#link-${newNode}-${prevNode}-prev`) : null;

    // Estado visual inicial de los enlaces previos referentes al nuevo nodo
    if (prevLinkToNewNodeGroup && prevLinkOfNewNodeGroup) {
        prevLinkToNewNodeGroup.select("path.node-link").style("opacity", 0);
        prevLinkOfNewNodeGroup.select("path.node-link").style("opacity", 0);
    }

    // Nodos a recorrer para insertar el nodo
    const nodesToTraverse = existingNodesData.slice(0, insertionPosition);

    for (const node of nodesToTraverse) {
        // Selección del grupo del nodo actual
        const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);

        // Selección del eleento a animar
        const nodeElement = nodeGroup.select("rect");

        // Resaltado del nodo actual
        await nodeElement
            .transition()
            .duration(700)
            .attr("stroke", "#f87171")
            .attr("stroke-width", 3)
            .end();

        // Restablecimiento del estilo original del nodo (excepto para el último nodo)
        if (node.id !== prevNode) {
            await nodeElement
                .transition()
                .duration(700)
                .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                .end();
        }
    }

    // Nodos a mover para la inclusión del nuevo nodo
    const nodesToMove = existingNodesData.slice(insertionPosition, existingNodesData.length);

    // Array de promesas para animaciones de desplazamiento de nodos y enlaces
    const shiftPromises: Promise<void>[] = [];

    // Desconexión del enlace siguiente presente entre el nodo anterior y siguiente al nuevo nodo
    const prevToNextNodeNextLinkGroup = svg.select<SVGGElement>(`g#link-${prevNode}-${nextNode}-next`);

    await prevToNextNodeNextLinkGroup.select("path.node-link")
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .end();
    prevToNextNodeNextLinkGroup.remove();

    // Desconexión del enlace previo presente entre el nodo siguiente y anterior al nuevo nodo (solo para listas dobles)
    if (showDoubleLinks) {
        const nextToPrevNodePrevLinkGroup = svg.select<SVGGElement>(`g#link-${nextNode}-${prevNode}-prev`);

        await nextToPrevNodePrevLinkGroup.select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .end();
        nextToPrevNodePrevLinkGroup.remove();
    }

    // Selección de nodos que requieren posicionamiento (re-vinculación de datos)
    const remainingNodes = svg.selectAll<SVGGElement, ListNodeData>("g.node")
        .data(nodesToMove, d => d.id);

    // Promesa para animación de desplazamiento de nodos existentes a su posición final
    shiftPromises.push(
        remainingNodes
            .transition()
            .duration(1500)
            .ease(d3.easeQuadInOut)
            .attr("transform", (d) => {
                const finalPos = positions.get(d.id)!;
                return `translate(${finalPos.x}, ${finalPos.y})`;
            })
            .end()
    );

    // Selección de enlaces restantes (re-vinculación de datos)
    const remainingLinks = svg.selectAll<SVGGElement, LinkData>("g.link")
        .data(existingLinksData, d => `link-${d.sourceId}-${d.targetId}-${d.type}`);

    // Promesa para animación de desplazamiento de enlaces existentes a su posición final
    shiftPromises.push(
        remainingLinks.select("path.node-link")
            .transition()
            .duration(1500)
            .ease(d3.easeQuadInOut)
            .attr("d", d => calculateLinkPath(d, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT))
            .end()
    );

    if (showTailIndicator) {
        // Grupo del lienzo correspondiente al indicador del nodo cola
        const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

        // Posición de animación final del indicador de cola
        const finalTailIndicatorPos = positions.get(existingNodesData[existingNodesData.length - 1].id)!;
        shiftPromises.push(
            tailIndicatorGroup
                .transition()
                .duration(1500)
                .ease(d3.easeQuadInOut)
                .attr("transform", () => {
                    const finalX = finalTailIndicatorPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
                    const finalY = finalTailIndicatorPos.y;
                    return `translate(${finalX}, ${finalY})`;
                })
                .end()
        );
    }

    // Resolución de las promesas para animación de movimiento
    await Promise.all(shiftPromises);

    // Posición de animación inicial del nuevo nodo
    const initialYOffset = -75;
    const initialPos = { x: finalNewNodePos.x, y: finalNewNodePos.y + initialYOffset };

    // Mapa temporal de posiciones para calular la forma inicial de los enlaces
    const tempPositions: Map<string, {
        x: number;
        y: number;
    }> = new Map(positions);
    tempPositions.set(newNode, initialPos);

    // Forma inicial de los enlaces siguientes producto de la inserción
    const initialNextPathToNewNode = calculateLinkPath({ sourceId: prevNode, targetId: newNode, type: 'next' }, tempPositions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);
    const initialNextPathOfNewNode = calculateLinkPath({ sourceId: newNode, targetId: nextNode, type: 'next' }, tempPositions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);

    nextLinkToNewNodeGroup.select("path.node-link").attr("d", initialNextPathToNewNode);
    nextLinkOfNewNodeGroup.select("path.node-link").attr("d", initialNextPathOfNewNode);

    // Forma inicial de los enlaces previos producto de la inserción (solo para listas dobles)
    if (prevLinkToNewNodeGroup && prevLinkOfNewNodeGroup) {
        const initialPrevPathToNewNode = calculateLinkPath({ sourceId: nextNode, targetId: newNode, type: 'prev' }, tempPositions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);
        const initialPrevPathOfNewNode = calculateLinkPath({ sourceId: newNode, targetId: prevNode, type: 'prev' }, tempPositions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);

        prevLinkToNewNodeGroup.select("path.node-link").attr("d", initialPrevPathToNewNode);
        prevLinkOfNewNodeGroup.select("path.node-link").attr("d", initialPrevPathOfNewNode);
    }

    // Posicionamiento inicial del nuevo nodo
    newNodeGroup.attr("transform", `translate(${initialPos.x}, ${initialPos.y})`);

    // Array de promesas para aparición de todos los elementos relacionados al nuevo nodo
    const newNodeAppearancePromises: Promise<void>[] = [];

    // Promesa para animación de aparición del nuevo nodo 
    newNodeAppearancePromises.push(
        newNodeGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end()
    );

    // Promesa para animación de aparición del enlace siguiente del nuevo nodo
    newNodeAppearancePromises.push(
        nextLinkOfNewNodeGroup.select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end()
    );

    // Promesa para animación de conexión del nodo previo con el nuevo nodo
    newNodeAppearancePromises.push(
        nextLinkToNewNodeGroup.select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end()
    );

    // Promesas para animación de aparición de enlaces previos (solo para listas dobles)
    if (prevLinkToNewNodeGroup && prevLinkOfNewNodeGroup) {
        newNodeAppearancePromises.push(
            prevLinkToNewNodeGroup.select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end()
        );

        newNodeAppearancePromises.push(
            prevLinkOfNewNodeGroup.select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end()
        );
    }

    // Resolución de las promesas de animación para aparición del nuevo nodo
    await Promise.all(newNodeAppearancePromises);

    // Forma final de los enlaces siguientes producto de la inserción
    const finalNextPathToNewNode = calculateLinkPath({ sourceId: prevNode, targetId: newNode, type: 'next' }, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);
    const finalNextPathOfNewNode = calculateLinkPath({ sourceId: newNode, targetId: nextNode, type: 'next' }, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);

    // Array de promesas para movimiento de los elementos del nuevo nodo a su posición final
    const newNodeFinalMovementPromises: Promise<void>[] = [];

    // Promesas para animación de movimiento de los elementos del nuevo nodo a su posición final
    newNodeFinalMovementPromises.push(
        newNodeGroup
            .transition()
            .duration(1500)
            .ease(d3.easeBounce)
            .attr("transform", `translate(${finalNewNodePos.x}, ${finalNewNodePos.y})`)
            .end()
    );

    newNodeFinalMovementPromises.push(
        nextLinkToNewNodeGroup.select("path.node-link")
            .transition()
            .duration(1500)
            .ease(d3.easeBounce)
            .attr("d", finalNextPathToNewNode)
            .end()
    );

    newNodeFinalMovementPromises.push(
        nextLinkOfNewNodeGroup.select("path.node-link")
            .transition()
            .duration(1500)
            .ease(d3.easeBounce)
            .attr("d", finalNextPathOfNewNode)
            .end()
    );

    // Movimiento de enlaces previos (solo para listas dobles)
    if (prevLinkToNewNodeGroup && prevLinkOfNewNodeGroup) {
        const finalPrevPathToNewNode = calculateLinkPath({ sourceId: nextNode, targetId: newNode, type: 'prev' }, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);
        const finalPrevPathOfNewNode = calculateLinkPath({ sourceId: newNode, targetId: prevNode, type: 'prev' }, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);

        newNodeFinalMovementPromises.push(
            prevLinkToNewNodeGroup.select("path.node-link")
                .transition()
                .duration(1500)
                .ease(d3.easeBounce)
                .attr("d", finalPrevPathToNewNode)
                .end()
        );

        newNodeFinalMovementPromises.push(
            prevLinkOfNewNodeGroup.select("path.node-link")
                .transition()
                .duration(1500)
                .ease(d3.easeBounce)
                .attr("d", finalPrevPathOfNewNode)
                .end()
        );
    }

    // Resolución de las promesas de animación para movimiento de los elementos del nuevo nodo a su posición final
    await Promise.all(newNodeFinalMovementPromises);

    // Restablecimiento del estilo del nodo anterior al nuevo nodo
    await prevNodeGroup
        .select("rect")
        .transition()
        .duration(500)
        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
        .end();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación del nodo al inicio de la lista.
 * 
 * @param svg - Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved - Objeto con información de los nodos involucrados en la eliminación. 
 * @param listData - Objeto con información de los nodos y enlaces de la lista.
 * @param positions - Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues - Función para restablecer los valores de la query del usuario. 
 * @param setIsAnimating - Función para establecer el estado de animación. 
 */
export async function animateRemoveFirst(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { prevHeadNode: string, newHeadNode: string | null },
    listData: { remainingNodesData: ListNodeData[], remainingLinksData: LinkData[], showDoubleLinks: boolean, showTailIndicator: boolean },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la eliminación
    const { newHeadNode, prevHeadNode } = nodesInvolved;

    // Grupo del lienzo correspondiente al nodo a eliminar
    const nodeToRemoveGroup = svg.select<SVGGElement>(`g#${prevHeadNode}`);

    if (newHeadNode) {
        // Información de la lista
        const { remainingNodesData, remainingLinksData, showDoubleLinks, showTailIndicator } = listData;

        // Grupo del lienzo correspondiente al indicador del nodo cabeza
        const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

        // Grupo del lienzo correspondiente al enlace siguiente entre el nodo a eliminar y el nuevo nodo cabeza
        const nextLinkOfNodeToRemoveGroup = svg.select<SVGGElement>(`g#link-${prevHeadNode}-${newHeadNode}-next`);

        // Grupo del lienzo correspondiente al enlace previo entre el nuevo nodo cabeza y el nodo a eliminar (solo para listas dobles)
        const prevLinkToNodeToRemoveGroup = showDoubleLinks ? svg.select<SVGGElement>(`g#link-${newHeadNode}-${prevHeadNode}-prev`) : null;

        // Posición actual del nodo a eliminar
        const nodeToRemoveCurrentPos = positions.get(prevHeadNode)!;

        // Movimiento del nodo a eliminar 
        const nodeMoveOffsetY = SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8;

        // Salida del enlace sig entre el nodo a eliminar y su siguiente
        await nextLinkOfNodeToRemoveGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .end();

        // Salida el enlace previo entre el nuevo nodo cabeza y el nodo a eliminar
        if (prevLinkToNodeToRemoveGroup) {
            await prevLinkToNodeToRemoveGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .end();
        }

        // Salida del nodo a eliminar
        await nodeToRemoveGroup
            .transition()
            .duration(1500)
            .ease(d3.easePolyInOut)
            .attr("transform", () => {
                const x = nodeToRemoveCurrentPos.x;
                const y = nodeToRemoveCurrentPos.y + nodeMoveOffsetY;
                return `translate(${x}, ${y})`;
            })
            .style("opacity", 0)
            .end();

        // Eliminación de los elementos del DOM asociados al nodo eliminado
        nodeToRemoveGroup.remove();
        nextLinkOfNodeToRemoveGroup.remove();
        if (prevLinkToNodeToRemoveGroup) prevLinkToNodeToRemoveGroup.remove();

        // Eliminación de la posición del nodo eliminado
        positions.delete(prevHeadNode);

        // Salida del indicador de cabeza
        await headIndicatorGroup
            .transition()
            .duration(500)
            .style("opacity", 0)
            .end();

        // Array de promesas para desplazamiento de nodos y enlaces restantes
        const shiftPromises: Promise<void>[] = [];

        // Selección de nodos restantes (re-vinculación de datos)
        const remainingNodes = svg.selectAll<SVGGElement, ListNodeData>("g.node")
            .data(remainingNodesData, d => d.id);

        // Promesa para animación de desplazamiento de nodos restantes a su posición final
        shiftPromises.push(
            remainingNodes
                .transition()
                .duration(1500)
                .ease(d3.easePolyInOut)
                .attr("transform", (d) => {
                    const finalPos = positions.get(d.id)!;
                    return `translate(${finalPos.x}, ${finalPos.y})`;
                })
                .end()
        );

        // Selección de enlaces restantes (re-vinculación de datos)
        const remainingLinks = svg.selectAll<SVGGElement, LinkData>("g.link")
            .data(remainingLinksData, d => `link-${d.sourceId}-${d.targetId}-${d.type}`);

        // Promesa para animación de desplazamiento de enlaces restantes a su posición final
        shiftPromises.push(
            remainingLinks.select("path.node-link")
                .transition()
                .duration(1500)
                .ease(d3.easePolyInOut)
                .attr("d", d => calculateLinkPath(d, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT))
                .end()
        );

        if (showTailIndicator) {
            // Grupo del lienzo correspondiente al indicador del nodo cola
            const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

            // Posición de animación final del indicador de cola
            const finalTailIndicatorPos = positions.get(remainingNodesData[remainingNodesData.length - 1].id)!;
            shiftPromises.push(
                tailIndicatorGroup
                    .transition()
                    .duration(1500)
                    .ease(d3.easePolyInOut)
                    .attr("transform", () => {
                        const finalX = finalTailIndicatorPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
                        const finalY = finalTailIndicatorPos.y;
                        return `translate(${finalX}, ${finalY})`;
                    })
                    .end()
            );
        }

        // Resolución de las promesas de animación de movimiento
        await Promise.all(shiftPromises);

        // Entrada del indicador de cabeza
        await headIndicatorGroup
            .transition()
            .duration(500)
            .style("opacity", 1)
            .end();
    } else {
        // Animación de salida simple del nodo
        await nodeToRemoveGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .ease(d3.easePolyInOut)
            .end();

        // Eliminación de los elementos del DOM asociados al nodo eliminado
        nodeToRemoveGroup.remove();

        // Eliminación de la posición del nodo eliminado
        positions.delete(prevHeadNode);
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación del nodo al final de la lista.
 * 
 * @param svg - Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved - Objeto con información de los nodos involucrados en la eliminación. 
 * @param listData - Objeto con información relacionada a los nodos de la lista.
 * @param positions - Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues - Función para restablecer los valores de la query del usuario. 
 * @param setIsAnimating - Función para establecer el estado de animación.
 */
export async function animateRemoveLast(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { prevLastNode: string, newLastNode: string | null },
    listData: { remainingNodesData: ListNodeData[], showDoubleLinks: boolean, showTailIndicator: boolean },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la eliminación
    const { newLastNode, prevLastNode } = nodesInvolved;

    // Grupo del lienzo correspondiente al nodo a eliminar
    const nodeToRemoveGroup = svg.select<SVGGElement>(`g#${prevLastNode}`);

    if (newLastNode) {
        // Información de la lista
        const { remainingNodesData, showDoubleLinks, showTailIndicator } = listData;

        // Grupo del lienzo correspondiente al enlace siguiente entre el nuevo último nodo y el nuevo a eliminar
        const nextLinkToNodeToRemoveGroup = svg.select<SVGGElement>(`g#link-${newLastNode}-${prevLastNode}-next`);

        // Grupo del lienzo correspondiente al enlace previo del nodo a eliminar (solo para listas dobles)
        const prevLinkOfNodeToRemoveGroup = showDoubleLinks ? svg.select<SVGGElement>(`g#link-${prevLastNode}-${newLastNode}-prev`) : null;

        // Grupo del lienzo correspondiente al nuevo último nodo
        const newLastNodeGroup = svg.select<SVGGElement>(`g#${newLastNode}`);

        // Posición actual del nodo a eliminar
        const nodeToRemoveCurrentPos = positions.get(prevLastNode)!;

        // Movimiento del nodo a eliminar 
        const nodeMoveOffsetY = SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8;

        // Si no es una lista doblemente enlazada, se recorre la lista hasta el último nodo
        if (!showDoubleLinks) {
            for (const node of remainingNodesData) {
                // Selección del grupo del nodo actual
                const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);

                // Selección del elemento a animar
                const nodeElement = nodeGroup.select("rect");

                // Resaltado del nodo actual
                await nodeElement
                    .transition()
                    .duration(700)
                    .attr("stroke", "#f87171")
                    .attr("stroke-width", 3)
                    .end();

                // Restablecimiento del estilo original del nodo (excepto para el nuevo último nodo)
                if (node.id !== newLastNode) {
                    await nodeElement
                        .transition()
                        .duration(700)
                        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                        .end();
                }
            }
        }

        if (showTailIndicator) {
            // Grupo del lienzo correspondiente al indicador del nodo cola
            const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

            // Desplazamiento del indicador de cola a la posición del nuevo último nodo
            const finalTailIndicatorPos = positions.get(newLastNode)!;
            await tailIndicatorGroup
                .transition()
                .duration(1000)
                .ease(d3.easeQuadInOut)
                .attr("transform", () => {
                    const finalX = finalTailIndicatorPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
                    const finalY = finalTailIndicatorPos.y;
                    return `translate(${finalX}, ${finalY})`;
                })
                .end();
        }

        // Salida del enlace entre el nuevo último nodo y el nodo a eliminar
        await nextLinkToNodeToRemoveGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .ease(d3.easePolyInOut)
            .style("opacity", 0)
            .end();

        // Salida del enlace previo del nodo a eliminar (solo para listas dobles)
        if (prevLinkOfNodeToRemoveGroup) {
            await prevLinkOfNodeToRemoveGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .ease(d3.easePolyInOut)
                .style("opacity", 0)
                .end();
        }

        // Salida del nodo a eliminar
        await nodeToRemoveGroup
            .transition()
            .duration(1500)
            .ease(d3.easePolyInOut)
            .attr("transform", () => {
                const x = nodeToRemoveCurrentPos.x;
                const y = nodeToRemoveCurrentPos.y + nodeMoveOffsetY;
                return `translate(${x}, ${y})`;
            })
            .style("opacity", 0)
            .end();

        // Restablecimiento del estilo del nuevo último nodo
        if (!showDoubleLinks) {
            await newLastNodeGroup
                .select("rect")
                .transition()
                .duration(500)
                .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                .end();
        }

        // Eliminación de los elementos del DOM asociados al nodo eliminado
        nodeToRemoveGroup.remove();
        nextLinkToNodeToRemoveGroup.remove();
        if (prevLinkOfNodeToRemoveGroup) prevLinkOfNodeToRemoveGroup.remove();

        // Eliminación de la posición del nodo eliminado
        positions.delete(prevLastNode);
    } else {
        // Animación de salida simple del nodo
        await nodeToRemoveGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .ease(d3.easePolyInOut)
            .end();

        // Eliminación de los elementos del DOM asociados al nodo eliminado
        nodeToRemoveGroup.remove();

        // Eliminación de la posición del nodo eliminado
        positions.delete(prevLastNode);
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación de un nodo en una posición especifica
 * @param svg Lienzo en el que se va a dibujar
 * @param nodesInvolved Objeto con información de los nodos involucrados en la eliminación 
 * @param listData Objeto con información de los nodos y enlaces de la lista
 * @param deletePosition Posición del nodo a eliminar dentro de la lista 
 * @param positions Mapa de posiciones de cada nodo dentro del lienzo
 * @param resetQueryValues Función para restablecer los valores de la query del usuario 
 * @param setIsAnimating Función para establecer el estado de animación 
 */
export async function animateRemoveAtPosition(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { nodeToRemove: string, prevNode: string, nextNode: string },
    listData: { existingNodesData: ListNodeData[], existingLinksData: LinkData[] },
    deletePosition: number,
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la eliminación
    const { nodeToRemove, prevNode, nextNode } = nodesInvolved;

    // Información de la lista
    const { existingNodesData, existingLinksData } = listData;

    // Grupo del lienzo correspondiente al nodo a eliminar
    const nodeToRemoveGroup = svg.select<SVGGElement>(`g#${nodeToRemove}`);

    // Grupo del lienzo correspondiente al nodo anterior al nodo a eliminar
    const prevNodeGroup = svg.select<SVGGElement>(`g#${prevNode}`);

    // Grupo del lienzo correspondiente al enlace siguiente formado entre el nodo anterior y siguiente del nodo a eliminar
    const prevNodeToNextNodeLinkGroup = svg.select<SVGGElement>(`g#link-${prevNode}-${nextNode}-next`);

    // Estado inicial del enlace siguiente entre el nodo previo y siguiente del nodo a eliminar
    prevNodeToNextNodeLinkGroup.select("path.node-link").style("opacity", 0);

    // Nodos a recorrer para eliminar el nodo
    const nodesToTraverse = existingNodesData.slice(0, deletePosition);

    for (const node of nodesToTraverse) {
        // Selección del grupo correspondiente al nodo actual
        const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);

        // Selección del elemento a animar
        const nodeElement = nodeGroup.select("rect");

        // Resaltado del nodo actual
        await nodeElement
            .transition()
            .duration(700)
            .attr("stroke", "#f87171")
            .attr("stroke-width", 3)
            .end();

        // Restablecimiento del estilo original del nodo (excepto para el último nodo)
        if (node.id !== prevNode) {
            await nodeElement
                .transition()
                .duration(700)
                .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                .end();
        }
    }

    // Grupo del lienzo correspondiente al enlace siguiente del nodo previo que apunta al nodo eliminado
    const nextLinkToRemovalNodeGroup = svg.select<SVGGElement>(`g#link-${prevNode}-${nodeToRemove}-next`);

    // Grupo del lienzo correspondiente al enlace siguiente del nodo eliminado
    const nextLinkOfRemovalNodeGroup = svg.select<SVGGElement>(`g#link-${nodeToRemove}-${nextNode}-next`);

    // Posición inicial en x del nodo siguiente al nodo a eliminar
    const nextNodeInitialXPos = SVG_LINKED_LIST_VALUES.MARGIN_LEFT + (deletePosition + 1) * (SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH + SVG_LINKED_LIST_VALUES.SPACING);

    // Posición de animación inicial del nodo a eliminar
    const initialRemovalNodePos = positions.get(nodeToRemove)!;

    // Posición de animación final del nodo a eliminar
    const initialYOffset = -75;
    const finalPos = { x: initialRemovalNodePos.x, y: initialRemovalNodePos.y + initialYOffset };

    // Mapa temporal de posiciones para calular la forma final de los enlaces asociados al nodo a eliminar
    const tempPositions: Map<string, {
        x: number;
        y: number;
    }> = new Map(positions);
    tempPositions.set(nodeToRemove, finalPos);
    tempPositions.set(nextNode, { x: nextNodeInitialXPos, y: initialRemovalNodePos.y });

    // Forma final de los enlaces asociados al nodo a eliminar
    const finalNextPathToRemovalNode = calculateLinkPath({ sourceId: prevNode, targetId: nodeToRemove, type: 'next' }, tempPositions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);
    const finalNextPathOfRemovalNode = calculateLinkPath({ sourceId: nodeToRemove, targetId: nextNode, type: 'next' }, tempPositions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);

    // Array de promesas para animaciones de desplazamiento del nodo a eliminar y sus enlaces
    const removalNodeShiftPromises: Promise<void>[] = [];

    removalNodeShiftPromises.push(
        nextLinkToRemovalNodeGroup.select("path.node-link")
            .transition()
            .duration(1000)
            .ease(d3.easeQuadInOut)
            .attr("d", finalNextPathToRemovalNode)
            .end()
    );

    removalNodeShiftPromises.push(
        nodeToRemoveGroup
            .transition()
            .duration(1000)
            .ease(d3.easeQuadInOut)
            .attr("transform", `translate(${finalPos.x}, ${finalPos.y})`)
            .end()
    );

    removalNodeShiftPromises.push(
        nextLinkOfRemovalNodeGroup.select("path.node-link")
            .transition()
            .duration(1000)
            .ease(d3.easeQuadInOut)
            .attr("d", finalNextPathOfRemovalNode)
            .end()
    );

    // Resolución de las promesas para animación de movimiento de elementos asociados al nodo a eliminar
    await Promise.all(removalNodeShiftPromises);

    // Animación de desconexión entre el nodo previo y el nodo a eliminar
    await nextLinkToRemovalNodeGroup.select("path.node-link")
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .end();
    nextLinkToRemovalNodeGroup.remove();

    // Forma inicial del enlace entre el nodo anterior y el nodo siguiente al nodo eliminado
    const initialNextPathToNextNode = calculateLinkPath({ sourceId: prevNode, targetId: nextNode, type: 'next' }, tempPositions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);
    await prevNodeToNextNodeLinkGroup.select("path.node-link")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .attr("d", initialNextPathToNextNode)
        .end();

    // Animación de desconexión y sálida del nodo a eliminar
    await nextLinkOfRemovalNodeGroup.select("path.node-link")
        .transition()
        .duration(800)
        .style("opacity", 0)
        .end()

    await nodeToRemoveGroup
        .transition()
        .duration(800)
        .style("opacity", 0)
        .end();

    // Eliminación de los elementos asociados en el DOM
    nextLinkOfRemovalNodeGroup.remove();
    nodeToRemoveGroup.remove();

    // Eliminación de la posición del nodo eliminado
    positions.delete(nodeToRemove);

    // Nodos a mover para la inclusión del nuevo nodo
    const nodesToMove = existingNodesData.slice(deletePosition, existingNodesData.length);

    // Array de promesas para animaciones de desplazamiento de nodos y enlaces
    const shiftPromises: Promise<void>[] = [];

    // Selección de nodos que requieren posicionamiento (re-vinculación de datos)
    const remainingNodes = svg.selectAll<SVGGElement, ListNodeData>("g.node")
        .data(nodesToMove, d => d.id);

    // Promesa para animación de desplazamiento de nodos existentes a su posición final
    shiftPromises.push(
        remainingNodes
            .transition()
            .duration(1500)
            .ease(d3.easeQuadInOut)
            .attr("transform", (d) => {
                const finalPos = positions.get(d.id)!;
                return `translate(${finalPos.x}, ${finalPos.y})`;
            })
            .end()
    );

    // Selección de enlaces restantes (re-vinculación de datos)
    const remainingLinks = svg.selectAll<SVGGElement, LinkData>("g.link")
        .data(existingLinksData, d => `link-${d.sourceId}-${d.targetId}-${d.type}`);

    // Promesa para animación de desplazamiento de enlaces existentes a su posición final
    shiftPromises.push(
        remainingLinks.select("path.node-link")
            .transition()
            .duration(1500)
            .ease(d3.easeQuadInOut)
            .attr("d", d => calculateLinkPath(d, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT))
            .end()
    );

    // Resolución de las promesas para animación de movimiento
    await Promise.all(shiftPromises);

    // Restablecimiento del estilo del nodo anterior al nuevo nodo
    await prevNodeGroup
        .select("rect")
        .transition()
        .duration(500)
        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
        .end();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la búsqueda de un elemento en la lista
 * @param svg Lienzo en el que se va a dibujar
 * @param elementToSearch Elemento a buscar en la lista 
 * @param existingNodesData Información de los nodos de la lista
 * @param resetQueryValues Función para restablecer los valores de la query del usuario 
 * @param setIsAnimating Función para establecer el estado de animación 
 */
export async function animateSearchElement(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    elementToSearch: number,
    existingNodesData: ListNodeData[],
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Recorremos los nodos en busca de elemento especificado
    for (const node of existingNodesData) {
        // Selección del grupo del nodo actual
        const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);

        // Selección del elemento a animar
        const nodeElement = nodeGroup.select("rect");

        if (node.value === elementToSearch) {
            // Resaltado más fuerte del nodo
            await nodeElement
                .transition()
                .duration(800)
                .attr("stroke", "#f87171")
                .attr("stroke-width", 4)
                .end();

            // Restablecimiento mas prolongado del estilo original del nodo
            await nodeElement
                .transition()
                .duration(2000)
                .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                .end();

            break;
        }

        // Resaltado suave del nodo actual
        await nodeElement
            .transition()
            .duration(800)
            .attr("stroke", "#f87171")
            .attr("stroke-width", 2)
            .end();

        // Restablecimiento del estilo original del nodo
        await nodeElement
            .transition()
            .duration(700)
            .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
            .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
            .end();
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de eliminar todos los nodos y enlaces del lienzo
 * @param svg Lienzo que se va a limpiar
 * @param nodePositions Mapa de posiciones de los nodos dentro del lienzo
 * @param resetQueryValues Función para restablecer los valores de la query del usuario
 * @param setIsAnimating Función para establecer el estado de animación
 */
export async function animateClearList(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodePositions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Animación de salida de los enlaces
    await svg.selectAll("g.link")
        .transition()
        .duration(800)
        .style("opacity", 0)
        .end();

    // Animacición de salida de los nodos
    await svg.selectAll("g.node")
        .transition()
        .duration(800)
        .style("opacity", 0)
        .end();

    // Eliminación de los nodos y enlaces del DOM
    svg.selectAll("g.node").remove();
    svg.selectAll("g.link").remove();

    // Liempiza del mapa de posiciones
    nodePositions.clear();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}