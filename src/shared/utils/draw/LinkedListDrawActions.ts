import { LinkData, ListNodeData } from "../../../types";
import { SVG_LINKED_LIST_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { calculateLinkPath } from "./calculateLinkPath";
import * as d3 from "d3";

/**
 * Función encargada de animar la inserción de un nuevo nodo al inicio de la lista
 * @param svg Lienzo en el que se va a dibujar
 * @param nodesInvolvedInsertion Objeto con información de los nodos involucrados en la inserción
 * @param listData Objeto con información de los nodos y enlaces de la lista
 * @param positions Mapa de posiciones de cada nodo dentro del lienzo
 * @param resetQueryValues Función para restablecer los valores de la query del usuario
 * @param setIsAnimating Función para establecer el estado de animación
 */
export async function animateInsertFirst(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { newHeadNode: string, prevHeadNode: string | null },
    listData: { existingNodesData: ListNodeData[], existingLinksData: LinkData[] },
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
        const { existingNodesData, existingLinksData } = listData;

        // Grupo del lienzo correspondiente al indicador del nodo cabeza
        const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

        // Posición de animación final del nuevo nodo
        const finalNewNodePos = positions.get(newHeadNode)!;

        // Grupo del lienzo correspondiente al enlace entre el nuevo nodo y el anterior primer nodo
        const nextLinkGroup = svg.select<SVGGElement>(`g#link-${newHeadNode}-${prevHeadNode}-next`);

        // Estado inicial del enlace entre el nuevo nodo y la anterior cabeza de la lista
        nextLinkGroup.select("path.node-link").style("opacity", 0);

        // Array de promesas para animaciones de desplazamiento de nodos y enlaces
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

        // Resolución de las promesas de animación de movimiento
        await Promise.all(shiftPromises);

        // Posición de animación inicial del nuevo nodo
        const initialYOffset = -60;
        const initialNewNodePos = { x: finalNewNodePos.x, y: finalNewNodePos.y + initialYOffset };
        newNodeGroup.attr("transform", `translate(${initialNewNodePos.x}, ${initialNewNodePos.y})`);

        // Animación de desplazamiento del nuevo nodo hacia su posición final
        await newNodeGroup
            .transition()
            .duration(1500)
            .style("opacity", 1)
            .ease(d3.easePolyInOut)
            .attr("transform", `translate(${finalNewNodePos.x}, ${finalNewNodePos.y})`)
            .end();

        // Animación de aparición del enlace entre el nuevo nodo y el nodo cabeza anterior
        await nextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1200)
            .ease(d3.easePolyInOut)
            .style("opacity", 1)
            .end();

        // Animación de movimiento del indicador de cabeza hacia el nuevo nodo
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
            .ease(d3.easePolyInOut)
            .end();
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la inserción de un nuevo nodo al final de la lista
 * @param svg Lienzo en el que se va a dibujar
 * @param nodesInvolvedInsertion Objeto con información de los nodos involucrados en la inserción
 * @param existingNodesData Nodos existentes dentro de la lista anterior a la inserción 
 * @param positions Mapa de posiciones de cada nodo dentro del lienzo
 * @param resetQueryValues Función para restablecer los valores de la query del usuario
 * @param setIsAnimating Función para establecer el estado de animación
 */
export async function animateInsertLast(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { newLastNode: string, prevLastNode: string | null },
    existingNodesData: ListNodeData[],
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { newLastNode, prevLastNode } = nodesInvolved;

    // Grupo del lienzo correspondiente al nuevo elemento
    const newNodeGroup = svg.select<SVGGElement>(`g#${newLastNode}`);

    // Estado inicial del nuevo nodo
    newNodeGroup.style("opacity", 0);

    if (prevLastNode) {
        // Posición de animación final del nuevo nodo
        const finalNewNodePos = positions.get(newLastNode)!;

        // Grupo del lienzo correspondiente al enlace que apunta al nuevo último nodo
        const nextLinkGroup = svg.select<SVGGElement>(`g#link-${prevLastNode}-${newLastNode}-next`);

        // Estado inicial del enlace que apunta al nuevo último nodo
        nextLinkGroup.select("path.node-link").style("opacity", 0);

        // Grupo del lienzo correspondiente al nodo anterior al nuevo último nodo
        const prevNodeGroup = svg.select<SVGGElement>(`g#${prevLastNode}`);

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

        // Posición de animación inicial del nuevo nodo
        const initialYOffset = -60;
        const initialNewNodePos = { x: finalNewNodePos.x, y: finalNewNodePos.y + initialYOffset };
        newNodeGroup.attr("transform", `translate(${initialNewNodePos.x}, ${initialNewNodePos.y})`);

        // Animación de desplazamiento del nuevo nodo hacia su posición final
        await newNodeGroup
            .transition()
            .duration(1500)
            .style("opacity", 1)
            .ease(d3.easePolyInOut)
            .attr("transform", `translate(${finalNewNodePos.x}, ${finalNewNodePos.y})`)
            .end();

        // Animación de aparición del enlace que apunta al nuevo último nodo
        await nextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1200)
            .ease(d3.easePolyInOut)
            .style("opacity", 1)
            .end();

        // Restablecimiento del estilo del nodo anterior al nuevo último nodo
        await prevNodeGroup
            .select("rect")
            .transition()
            .duration(500)
            .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
            .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
            .end();
    } else {
        // Animación de aparición simple del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .ease(d3.easePolyInOut)
            .end();
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la inserción de un nuevo nodo en una posición especifica
 * @param svg Lienzo en el que se va a dibujar
 * @param nodesInvolvedInsertion Objeto con información de los nodos involucrados en la inserción 
 * @param listData Objeto con información de los nodos y enlaces de la lista
 * @param insertionPosition Posición del nuevo nodo dentro de la lista 
 * @param positions Mapa de posiciones de cada nodo dentro del lienzo
 * @param resetQueryValues Función para restablecer los valores de la query del usuario 
 * @param setIsAnimating Función para establecer el estado de animación 
 */
export async function animateInsertAtPosition(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { newNode: string, prevNode: string, nextNode: string },
    listData: { existingNodesData: ListNodeData[], existingLinksData: LinkData[] },
    insertionPosition: number,
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { newNode, prevNode, nextNode } = nodesInvolved;

    // Información de la lista
    const { existingNodesData, existingLinksData } = listData;

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

    // Grupo del lienzo correspondiente al enlace presente anteriormente entre el nodo anterior y siguiente del nuevo nodo
    const prevNodeToNextNodeLinkGroup = svg.select<SVGGElement>(`g#link-${prevNode}-${nextNode}-next`);

    // Desconexión del enlace entre el nodo previo y siguiente del nuevo nodo
    await prevNodeToNextNodeLinkGroup.select("path.node-link")
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .end();
    prevNodeToNextNodeLinkGroup.remove();

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

    // Posición de animación inicial del nuevo nodo
    const initialYOffset = -75;
    const initialPos = { x: finalNewNodePos.x, y: finalNewNodePos.y + initialYOffset };

    // Mapa temporal de posiciones para calular la forma inicial del enlace
    const tempPositions: Map<string, {
        x: number;
        y: number;
    }> = new Map(positions);
    tempPositions.set(newNode, initialPos);

    // Forma inicial de los nuevos enlaces producto de la inserción
    const initialNextPathToNewNode = calculateLinkPath({ sourceId: prevNode, targetId: newNode, type: 'next' }, tempPositions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);
    const initialNextPathOfNewNode = calculateLinkPath({ sourceId: newNode, targetId: nextNode, type: 'next' }, tempPositions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);

    // Posicionamiento inicial de los elementos asociados al nuevo nodo
    newNodeGroup.attr("transform", `translate(${initialPos.x}, ${initialPos.y})`);
    nextLinkToNewNodeGroup.select("path.node-link").attr("d", initialNextPathToNewNode);
    nextLinkOfNewNodeGroup.select("path.node-link").attr("d", initialNextPathOfNewNode);

    // Array de promesas para animaciones de aparición de todos los elementos relacionados al nuevo nodo
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

    // Resolución de las promesas de animación para aparición del nuevo nodo
    await Promise.all(newNodeAppearancePromises);

    // Forma final de los nuevos enlaces producto de la inserción
    const finalNextPathToNewNode = calculateLinkPath({ sourceId: prevNode, targetId: newNode, type: 'next' }, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);
    const finalNextPathOfNewNode = calculateLinkPath({ sourceId: newNode, targetId: nextNode, type: 'next' }, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);

    // Array de promesas para animaciones de movimiento de los elementos relacionados al nuevo nodo a su posición final
    const newNodeFinalMovementPromises: Promise<void>[] = [];

    // Promesas para animación del movimiento de los elementos del nuevo nodo a su posición final
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
 * Función encargada de animar la eliminación del nodo al inicio de la lista
 * @param svg Lienzo en el que se va a dibujar
 * @param nodesInvolved Objeto con información de los nodos involucrados en la eliminación 
 * @param listData Objeto con información de los nodos y enlaces de la lista
 * @param positions Mapa de posiciones de cada nodo dentro del lienzo
 * @param resetQueryValues Función para restablecer los valores de la query del usuario 
 * @param setIsAnimating Función para establecer el estado de animación 
 */
export async function animateRemoveFirst(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { prevHeadNode: string, newHeadNode: string | null },
    listData: { remainingNodesData: ListNodeData[], remainingLinksData: LinkData[] },
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
        const { remainingNodesData, remainingLinksData } = listData;

        // Grupo del lienzo correspondiente al indicador del nodo cabeza
        const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

        // Grupo del lienzo correspondiente al enlace entre el nodo a eliminar y el nuevo nodo cabeza
        const nextLinkToRemoveGroup = svg.select<SVGGElement>(`g#link-${prevHeadNode}-${newHeadNode}-next`);

        // Posición actual del nodo a eliminar
        const nodeToRemoveCurrentPos = positions.get(prevHeadNode)!;

        // Movimiento del nodo a eliminar 
        const nodeMoveOffsetY = SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8;

        // Animación de salida del enlace entre el nodo a eliminar y su siguiente
        await nextLinkToRemoveGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .ease(d3.easePolyInOut)
            .style("opacity", 0)
            .end();

        // Animación de salida del nodo a eliminar
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
        nextLinkToRemoveGroup.remove();

        // Eliminación de la posición del nodo eliminado
        positions.delete(prevHeadNode);

        // Animación de salida del indicador de cabeza
        await headIndicatorGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .end();

        // Array de promesas para la animación de desplazamiento de nodos y enlaces restantes
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

        // Resolución de las promesas de animación de movimiento
        await Promise.all(shiftPromises);

        // Animación de entrada del indicador de cabeza
        await headIndicatorGroup
            .transition()
            .duration(1000)
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
 * Función encargada de animar la eliminación del nodo al final de la lista
 * @param svg Lienzo en el que se va a dibujar
 * @param nodesInvolved Objeto con información de los nodos involucrados en la eliminación 
 * @param listData Objeto con información de los nodos y enlaces de la lista
 * @param positions Mapa de posiciones de cada nodo dentro del lienzo
 * @param resetQueryValues Función para restablecer los valores de la query del usuario 
 * @param setIsAnimating Función para establecer el estado de animación 
 */
export async function animateRemoveLast(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { prevLastNode: string, newLastNode: string | null },
    remainingNodesData: ListNodeData[],
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la eliminación
    const { newLastNode, prevLastNode } = nodesInvolved;

    // Grupo del lienzo correspondiente al nodo a eliminar
    const nodeToRemoveGroup = svg.select<SVGGElement>(`g#${prevLastNode}`);

    if (newLastNode) {
        // Grupo del lienzo correspondiente al enlace entre el nodo a eliminar y el nuevo nodo cabeza
        const nextLinkToRemoveGroup = svg.select<SVGGElement>(`g#link-${newLastNode}-${prevLastNode}-next`);

        // Grupo del lienzo correspondiente al nuevo último nodo
        const newLastNodeGroup = svg.select<SVGGElement>(`g#${newLastNode}`);

        // Posición actual del nodo a eliminar
        const nodeToRemoveCurrentPos = positions.get(prevLastNode)!;

        // Movimiento del nodo a eliminar 
        const nodeMoveOffsetY = SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8;

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

        // Animación de salida del enlace entre el nuevo último nodo y el nodo a eliminar
        await nextLinkToRemoveGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .ease(d3.easePolyInOut)
            .style("opacity", 0)
            .end();

        // Animación de salida del nodo a eliminar
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
        await newLastNodeGroup
            .select("rect")
            .transition()
            .duration(500)
            .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
            .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
            .end();

        // Eliminación de los elementos del DOM asociados al nodo eliminado
        nodeToRemoveGroup.remove();
        nextLinkToRemoveGroup.remove();

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