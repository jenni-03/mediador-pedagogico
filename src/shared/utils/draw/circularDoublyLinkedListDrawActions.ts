import { ListLinkData, ListNodeData } from "../../../types";
import { Selection } from "d3";
import { type EventBus } from "../../events/eventBus";
import { Dispatch, SetStateAction } from "react";
import { delay } from "../simulatorUtils";
import { animateAppearListNode, animateExitListNode, animateGetListNodePos } from "./simpleLinkedListDrawActions";
import { SVG_LINKED_LIST_VALUES } from "../../constants/consts";
import { repositionList } from "./drawActionsUtilities";
import { buildListPath } from "../listUtils";
import { getListaCircularDoblementeEnlazadaCode } from "../../constants/pseudocode/listaCircularDoblementeEnlazadaCode";

const listaCircularDobleCode = getListaCircularDoblementeEnlazadaCode();

/**
 * Función encargada de animar el proceso de inserción de un nuevo nodo al inicio de una lista circular doble.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDoublyCircularInsertFirst(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newHeadNodeId: string;
        currHeadNodeId: string | null;
        lastNodeId: string | null;
        nodesData: ListNodeData<number>[];
        linksData: ListLinkData[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaCircularDobleCode.insertFirst.labels!;

    // Nodos implicados en la inserción
    const { newHeadNodeId, currHeadNodeId, lastNodeId } = insertionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "insertFirst" });

        if (!currHeadNodeId || !lastNodeId) {
            await animateInsertInEmptyList(
                svg,
                bus,
                newHeadNodeId,
                "insertFirst",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    SET_HEAD_EMPTY: labels.SET_HEAD_EMPTY,
                    LINK_SELF_NEXT: labels.LINK_SELF_NEXT,
                    LINK_SELF_PREV: labels.LINK_SELF_PREV
                }
            );
        } else {
            // Conjunto de enlaces a reposicionar (incluyendo los actuales enlaces circulares entre la cabeza actual y el útlimo nodo)
            const repositionLinks = insertionData.linksData.slice(3, -1);
            repositionLinks.push({ sourceId: currHeadNodeId, targetId: lastNodeId, type: "circular-prev" });
            repositionLinks.push({ sourceId: lastNodeId, targetId: currHeadNodeId, type: "circular-next" });

            await animateInsertAtHeadNonEmpty(
                svg,
                {
                    newNodeId: newHeadNodeId,
                    headNodeId: currHeadNodeId,
                    lastNodeId,
                    positions: insertionData.positions
                },
                bus,
                "insertFirst",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    ELSE_EMPTY: labels.ELSE_EMPTY,
                    LINK_NEW_TO_HEAD: labels.LINK_NEW_TO_HEAD,
                    LINK_NEW_TO_LAST: labels.LINK_NEW_TO_LAST,
                    LINK_HEAD_TO_NEW: labels.LINK_HEAD_TO_NEW,
                    LINK_LAST_TO_NEW: labels.LINK_LAST_TO_NEW,
                    UPDATE_HEAD: labels.UPDATE_HEAD
                },
                () => repositionList(
                    svg,
                    insertionData.nodesData,
                    repositionLinks,
                    insertionData.positions,
                    {
                        headIndicator: svg.select<SVGGElement>("g#head-indicator"),
                        headNodeId: currHeadNodeId,
                        tailIndicator: null,
                        tailNodeId: null
                    }
                )
            );
        }
        bus.emit("step:progress", { stepId: "insertFirst", lineIndex: labels.INC_SIZE });
        await delay(500);

        // Fin de la operación
        bus.emit("op:done", { op: "insertFirst" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de inserción de un nuevo nodo al final de una lista circular doble.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDoublyCircularInsertLast(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newLastNodeId: string;
        currLastNodeId: string | null;
        headNodeId: string | null;
        nodesData: ListNodeData<number>[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaCircularDobleCode.insertLast.labels!;

    // Nodos implicados en la inserción
    const { newLastNodeId, currLastNodeId, headNodeId } = insertionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "insertLast" });

        if (!currLastNodeId || !headNodeId) {
            await animateInsertInEmptyList(
                svg,
                bus,
                newLastNodeId,
                "insertLast",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    SET_HEAD_EMPTY: labels.SET_HEAD_EMPTY,
                    LINK_SELF_NEXT: labels.LINK_SELF_NEXT,
                    LINK_SELF_PREV: labels.LINK_SELF_PREV
                }
            );
        } else {
            await animateInsertAtTailNonEmpty(
                svg,
                {
                    newNodeId: newLastNodeId,
                    headNodeId,
                    lastNodeId: currLastNodeId,
                    positions: insertionData.positions,
                },
                bus,
                "insertLast",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    ELSE_EMPTY: labels.ELSE_EMPTY,
                    LINK_NEW_TO_HEAD: labels.LINK_NEW_TO_HEAD,
                    LINK_NEW_TO_LAST: labels.LINK_NEW_TO_LAST,
                    LINK_LAST_TO_NEW: labels.LINK_LAST_TO_NEW,
                    LINK_HEAD_TO_NEW: labels.LINK_HEAD_TO_NEW
                },
            );
        }
        bus.emit("step:progress", { stepId: "insertLast", lineIndex: labels.INC_SIZE });
        await delay(500);

        // Fin de la operación
        bus.emit("op:done", { op: "insertLast" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de inserción de un nuevo nodo en una posición especifica de una lista circular doble.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDoublyCircularInsertAt(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newNodeId: string;
        prevNodeId: string | null;
        nextNodeId: string | null;
        insertionPosition: number;
        nodesData: ListNodeData<number>[];
        linksData: ListLinkData[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaCircularDobleCode.insertAt.labels!;

    // Nodos implicados en la inserción
    const { newNodeId, prevNodeId, nextNodeId } = insertionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "insertAt" });

        if (!prevNodeId && !nextNodeId) {
            await animateInsertInEmptyList(
                svg,
                bus,
                newNodeId,
                "insertAt",
                {
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    SET_HEAD_EMPTY: labels.SET_HEAD_EMPTY,
                    LINK_SELF_NEXT: labels.LINK_SELF_NEXT,
                    LINK_SELF_PREV: labels.LINK_SELF_PREV
                }
            );
        } else if (!prevNodeId && nextNodeId) {
            // Inserción al inicio
            const { nodesData } = insertionData
            const lastNodeId = nodesData[nodesData.length - 1].id;

            // Conjunto de enlaces a reposicionar (incluyendo los actuales enlaces circulares entre la cabeza actual y el útlimo nodo)
            const repositionLinks = insertionData.linksData.slice(3, -1);
            repositionLinks.push({ sourceId: nextNodeId, targetId: lastNodeId, type: "circular-prev" });
            repositionLinks.push({ sourceId: lastNodeId, targetId: nextNodeId, type: "circular-next" });

            await animateInsertAtHeadNonEmpty(
                svg,
                {
                    newNodeId,
                    headNodeId: nextNodeId,
                    lastNodeId,
                    positions: insertionData.positions
                },
                bus,
                "insertAt",
                {
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    ELSE_EMPTY: labels.ELSE_IF_HEAD,
                    LINK_NEW_TO_HEAD: labels.LINK_NEW_TO_HEAD,
                    LINK_NEW_TO_LAST: labels.LINK_NEW_TO_LAST,
                    LINK_LAST_TO_NEW: labels.LINK_LAST_TO_NEW,
                    LINK_HEAD_TO_NEW: labels.LINK_HEAD_TO_NEW,
                    UPDATE_HEAD: labels.UPDATE_HEAD
                },
                () => repositionList(
                    svg,
                    insertionData.nodesData,
                    repositionLinks,
                    insertionData.positions,
                    {
                        headIndicator: svg.select<SVGGElement>("g#head-indicator"),
                        headNodeId: nextNodeId,
                        tailIndicator: null,
                        tailNodeId: null,
                    }
                )
            );
        } else if (prevNodeId && !nextNodeId) {
            // Inserción al final
            const { nodesData } = insertionData
            const headNodeId = nodesData[0].id;

            await animateInsertAtTailNonEmpty(
                svg,
                {
                    newNodeId,
                    headNodeId,
                    lastNodeId: prevNodeId,
                    positions: insertionData.positions
                },
                bus,
                "insertAt",
                {
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    ELSE_IF_HEAD: labels.ELSE_IF_HEAD,
                    ELSE_IF_TAIL: labels.ELSE_IF_TAIL,
                    LINK_NEW_TO_HEAD: labels.LINK_NEW_TO_HEAD2,
                    LINK_NEW_TO_LAST: labels.LINK_NEW_TO_LAST2,
                    LINK_LAST_TO_NEW: labels.LINK_LAST_TO_NEW2,
                    LINK_HEAD_TO_NEW: labels.LINK_HEAD_TO_NEW2
                }
            );
        } else {
            // Inserción en posición intermedia
            const { insertionPosition, nodesData, linksData } = insertionData;

            // Grupos contenedores de nodos y enlaces de la lista
            const nodesG = svg.select<SVGGElement>("g#nodes-layer");
            const linksG = svg.select<SVGGElement>("g#links-layer");

            // Grupos correspondientes a los nuevos elementos producto de la inserción
            const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);
            newNodeGroup.style("opacity", 0);

            const prevNodeNewNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${prevNodeId}-${newNodeId}-next`
            );
            prevNodeNewNextLinkGroup.style("opacity", 0);

            const newNodePrevLinkGroup = linksG.select<SVGGElement>(
                `g#link-${newNodeId}-${prevNodeId}-prev`
            );
            newNodePrevLinkGroup.style("opacity", 0);

            const newNodeNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${newNodeId}-${nextNodeId}-next`
            );
            newNodeNextLinkGroup.style("opacity", 0);

            const nextNodeNewPrevLinkGroup = linksG.select<SVGGElement>(
                `g#link-${nextNodeId}-${newNodeId}-prev`
            );
            nextNodeNewPrevLinkGroup.style("opacity", 0);

            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.VALIDATE_POSITION });
            await delay(500);

            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.CREATE_NODE });
            await delay(500);

            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.VALIDATE_EMPTY });
            await delay(500);

            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.ELSE_IF_HEAD });
            await delay(500);

            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.ELSE_IF_TAIL });
            await delay(500);

            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.ELSE_INSERT });
            await delay(500);

            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.GET_PREV_NODE });
            await delay(500);

            // Recorrido de los nodos hasta la posición de inserción
            const nodesToTraverse = nodesData.slice(0, insertionPosition);
            await animateGetListNodePos(
                nodesG,
                nodesToTraverse,
                bus,
                {
                    INIT_TRAVERSAL: labels.INIT_TRAVERSAL,
                    WHILE_TRAVERSAL: labels.WHILE_TRAVERSAL,
                    ADVANCE_NODE: labels.ADVANCE_NODE,
                    DEC_POS: labels.DEC_POS,
                    RETURN_NODE_GETPOS: labels.RETURN_NODE_GETPOS
                }, "insertAt");

            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.GET_PREV_NODE });
            await delay(400);

            // Nodos a desplazar y enlaces a ajustar para la inclusión del nuevo nodo
            // (incluidos los actuales enlaces siguiente y previo entre los nodos previo y siguiente)
            const nodesToMove = nodesData.slice(
                insertionPosition,
                nodesData.length
            );
            const linksToMove = linksData.slice(
                insertionPosition,
                linksData.length
            );
            linksToMove.push({ sourceId: nodesData[0].id, targetId: nodesData[nodesData.length - 1].id, type: "circular-prev" });
            linksToMove.push({ sourceId: prevNodeId!, targetId: nextNodeId!, type: "next" });
            linksToMove.push({ sourceId: nextNodeId!, targetId: prevNodeId!, type: "prev" });

            // Reposicionamiento de los elementos indicados de la lista a su posición final
            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.LINK_NEW_TO_NEXT });
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
            const initialNewNodePos = { x: newNodePos.x, y: newNodePos.y - 60 };

            // Forma inicial de los nuevos enlaces producto de la inserción
            const initialPrevNodeNewNextLink = buildListPath(
                "next",
                insertionData.positions.get(prevNodeId!) ?? null,
                initialNewNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            prevNodeNewNextLinkGroup
                .select("path.node-link")
                .attr("d", initialPrevNodeNewNextLink);

            const initialNewNodePrevLink = buildListPath(
                "prev",
                initialNewNodePos,
                insertionData.positions.get(prevNodeId!) ?? null,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            newNodePrevLinkGroup
                .select("path.node-link")
                .attr("d", initialNewNodePrevLink);

            const initialNewNodeNextLink = buildListPath(
                "next",
                initialNewNodePos,
                insertionData.positions.get(nextNodeId!) ?? null,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            newNodeNextLinkGroup
                .select("path.node-link")
                .attr("d", initialNewNodeNextLink);

            const initialNextNodeNewPrevLink = buildListPath(
                "prev",
                insertionData.positions.get(nextNodeId!) ?? null,
                initialNewNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            nextNodeNewPrevLinkGroup
                .select("path.node-link")
                .attr("d", initialNextNodeNewPrevLink);

            // Aparición y posicionamiento inicial del nuevo nodo
            await animateAppearListNode(newNodeGroup, initialNewNodePos);

            // Establecimiento del enlace siguiente del nuevo nodo
            await newNodeNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();

            // Establecimiento del enlace anterior del nuevo nodo
            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.LINK_NEW_TO_PREV });
            await newNodePrevLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();

            // Desconexión del actual enlace anterior del nodo siguiente al nuevo nodo
            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.LINK_NEXT_TO_NEW });
            await linksG.select<SVGGElement>(`g#link-${nextNodeId}-${prevNodeId}-prev`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Establecimiento del nuevo enlace anterior del nodo siguiente al nuevo nodo
            await nextNodeNewPrevLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();

            // Desconexión del actual enlace siguiente del nodo previo al nuevo nodo
            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.LINK_PREV_TO_NEW });
            await linksG.select<SVGGElement>(`g#link-${prevNodeId}-${nextNodeId}-next`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Establecimiento del nuevo enlace siguiente del nodo previo al nuevo nodo
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
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            const finalNewNodePrevLink = buildListPath(
                "prev",
                newNodePos,
                insertionData.positions.get(prevNodeId!) ?? null,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            const finalNewNodeNextLink = buildListPath(
                "next",
                newNodePos,
                insertionData.positions.get(nextNodeId!) ?? null,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            const finalNextNodeNewPrevLink = buildListPath(
                "prev",
                insertionData.positions.get(nextNodeId!) ?? null,
                newNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
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
                newNodePrevLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1000)
                    .attr("d", finalNewNodePrevLink)
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

            shiftPromises.push(
                nextNodeNewPrevLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1000)
                    .attr("d", finalNextNodeNewPrevLink)
                    .end()
            );

            await Promise.all(shiftPromises);
        }
        bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.INC_SIZE });
        await delay(500);

        // Fin de la operación
        bus.emit("op:done", { op: "insertAt" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de eliminación de un nodo al inicio de una lista circular doble.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDoublyCircularDeleteFirst(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        currHeadNodeId: string;
        newHeadNodeId: string | null;
        lastNodeId: string | null;
        remainingNodesData: ListNodeData<number>[];
        remainingLinksData: ListLinkData[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaCircularDobleCode.removeFirst.labels!;

    // Nodos implicados en la eliminación
    const { currHeadNodeId, newHeadNodeId, lastNodeId } = deletionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "removeFirst" });

        if (!newHeadNodeId || !lastNodeId) {
            await animateDeleteOneElementList(
                svg,
                bus,
                currHeadNodeId,
                "removeFirst",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    DECLARE_REMOVED_NODE: labels.SAVE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    CLEAR_HEAD: labels.CLEAR_HEAD
                }
            );
        } else {
            await animateDeleteAtHeadNonEmpty(
                svg,
                {
                    removalNodeId: currHeadNodeId,
                    newHeadNodeId,
                    lastNodeId,
                    lastNodeIndex: deletionData.remainingNodesData.length,
                    positions: deletionData.positions
                },
                bus,
                "removeFirst",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    DECLARE_REMOVED_NODE: labels.SAVE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    ELSE_SINGLE_NODE: labels.ELSE_REMOVE,
                    LINK_LAST_TO_NEWHEAD: labels.LINK_LAST_TO_NEWHEAD,
                    LINK_NEWHEAD_TO_LAST: labels.LINK_NEWHEAD_TO_LAST,
                    UPDATE_HEAD: labels.UPDATE_HEAD,
                    CLEAR_REMOVED_NEXT: labels.CLEAR_REMOVED_NEXT,
                    CLEAR_REMOVED_PREV: labels.CLEAR_REMOVED_PREV
                },
                () => repositionList(
                    svg,
                    deletionData.remainingNodesData,
                    deletionData.remainingLinksData,
                    deletionData.positions,
                    {
                        headIndicator: svg.select<SVGGElement>("g#head-indicator"),
                        headNodeId: newHeadNodeId,
                        tailIndicator: null,
                        tailNodeId: null
                    }
                )
            );
        }
        bus.emit("step:progress", { stepId: "removeFirst", lineIndex: labels.DEC_SIZE });
        await delay(500);

        bus.emit("step:progress", { stepId: "removeFirst", lineIndex: labels.RETURN_ELEMENT });
        await delay(500);

        // Limpiamos el registro del nodo eliminado
        deletionData.positions.delete(currHeadNodeId);

        // Fin de la operación
        bus.emit("op:done", { op: "removeFirst" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de eliminación de un nodo al final de una lista circular doble.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDoublyCircularDeleteLast(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        currLastNodeId: string;
        newLastNodeId: string | null;
        headNodeId: string | null;
        remainingNodesData: ListNodeData<number>[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaCircularDobleCode.removeLast.labels!;

    // Nodos implicados en la eliminación
    const { currLastNodeId, newLastNodeId, headNodeId } = deletionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "removeLast" });

        if (!newLastNodeId || !headNodeId) {
            await animateDeleteOneElementList(
                svg,
                bus,
                currLastNodeId,
                "removeLast",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    DECLARE_REMOVED_NODE: labels.SAVE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    CLEAR_HEAD: labels.CLEAR_HEAD
                }
            );
        } else {
            await animateDeleteAtTailNonEmpty(
                svg,
                {
                    removalNodeId: currLastNodeId,
                    newLastNodeId,
                    headNodeId,
                    positions: deletionData.positions
                },
                bus,
                "removeLast",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    DECLARE_REMOVED_NODE: labels.SAVE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    ELSE_SINGLE_NODE: labels.ELSE_REMOVE,
                    LINK_PREV_TO_HEAD: labels.LINK_PREV_TO_HEAD,
                    LINK_HEAD_TO_PREV: labels.LINK_HEAD_TO_PREV,
                    CLEAR_REMOVED_NEXT: labels.CLEAR_REMOVED_NEXT,
                    CLEAR_REMOVED_PREV: labels.CLEAR_REMOVED_PREV
                }
            );
        }
        bus.emit("step:progress", { stepId: "removeLast", lineIndex: labels.DEC_SIZE });
        await delay(500);

        bus.emit("step:progress", { stepId: "removeLast", lineIndex: labels.RETURN_ELEMENT });
        await delay(500);

        // Limpiamos el registro del nodo eliminado
        deletionData.positions.delete(currLastNodeId);

        // Fin de la operación
        bus.emit("op:done", { op: "removeLast" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de eliminación de un nodo en una posición especifica de una lista circular doble.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDoublyCircularDeleteAt(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        removalNodeId: string;
        prevNodeId: string | null;
        nextNodeId: string | null;
        deletePosition: number;
        remainingNodesData: ListNodeData<number>[];
        remainingLinksData: ListLinkData[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaCircularDobleCode.removeAt.labels!;

    // Nodos implicados en la eliminación
    const { removalNodeId, prevNodeId, nextNodeId } = deletionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "removeAt" });

        if (!prevNodeId && !nextNodeId) {
            // Salida del único nodo en la lista
            await animateDeleteOneElementList(
                svg,
                bus,
                removalNodeId,
                "removeAt",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    DECLARE_REMOVED_NODE: labels.DECLARE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    SAVE_SINGLE_NODE: labels.SAVE_SINGLE_NODE,
                    CLEAR_HEAD: labels.CLEAR_HEAD
                }
            );
        } else if (!prevNodeId && nextNodeId) {
            // Eliminación al inicio de la lista
            const { remainingNodesData } = deletionData;
            const lastNodeId = remainingNodesData[remainingNodesData.length - 1].id;

            await animateDeleteAtHeadNonEmpty(
                svg,
                {
                    removalNodeId,
                    newHeadNodeId: nextNodeId,
                    lastNodeId,
                    lastNodeIndex: remainingNodesData.length - 1,
                    positions: deletionData.positions
                },
                bus,
                "removeAt",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    DECLARE_REMOVED_NODE: labels.DECLARE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    ELSE_SINGLE_NODE: labels.ELSE_IF_HEAD,
                    SAVE_HEAD_NODE: labels.SAVE_HEAD_NODE,
                    LINK_LAST_TO_NEWHEAD: labels.LINK_LAST_TO_NEWHEAD,
                    LINK_NEWHEAD_TO_LAST: labels.LINK_NEWHEAD_TO_LAST,
                    UPDATE_HEAD: labels.UPDATE_HEAD,
                    CLEAR_REMOVED_NEXT: labels.CLEAR_REMOVED_NEXT,
                    CLEAR_REMOVED_PREV: labels.CLEAR_REMOVED_PREV
                },
                () => repositionList(
                    svg,
                    deletionData.remainingNodesData,
                    deletionData.remainingLinksData,
                    deletionData.positions,
                    {
                        headIndicator: svg.select<SVGGElement>("g#head-indicator"),
                        headNodeId: nextNodeId,
                        tailIndicator: null,
                        tailNodeId: null
                    }
                )
            );
        } else if (prevNodeId && !nextNodeId) {
            // Eliminación al final de la lista
            const { remainingNodesData } = deletionData;
            const headNodeId = remainingNodesData[0].id;

            await animateDeleteAtTailNonEmpty(
                svg,
                {
                    removalNodeId,
                    newLastNodeId: prevNodeId,
                    headNodeId,
                    positions: deletionData.positions

                },
                bus,
                "removeAt",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    DECLARE_REMOVED_NODE: labels.DECLARE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    ELSE_IF_HEAD: labels.ELSE_IF_HEAD,
                    ELSE_IF_TAIL: labels.ELSE_IF_TAIL,
                    SAVE_TAIL_NODE: labels.SAVE_TAIL_NODE,
                    LINK_PREV_TO_HEAD: labels.LINK_PREV_TO_HEAD,
                    LINK_HEAD_TO_PREV: labels.LINK_HEAD_TO_PREV,
                    CLEAR_REMOVED_NEXT: labels.CLEAR_REMOVED_NEXT2,
                    CLEAR_REMOVED_PREV: labels.CLEAR_REMOVED_PREV2
                }
            );
        } else {
            // Eliminación en posición intermedia
            const { deletePosition, remainingNodesData, remainingLinksData } = deletionData;

            // Grupos contenedores de los nodos y enlaces de la lista
            const nodesG = svg.select<SVGGElement>("g#nodes-layer");
            const linksG = svg.select<SVGGElement>("g#links-layer");

            // Grupo correspondiente al nodo a eliminar
            const removalNodeGroup = nodesG.select<SVGGElement>(`g#${removalNodeId}`);

            // Grupo correspondiente al actual enlace siguiente del nodo previo que apunta al nodo a eliminar
            const prevNodeCurrNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${prevNodeId}-${removalNodeId}-next`
            );

            // Grupo correspondiente al nuevo enlace siguiente del nodo previo que apunta al nodo siguiente del nodo a eliminar
            const prevNodeNewNextLinkGroup = linksG.select<SVGPathElement>(
                `g#link-${prevNodeId}-${nextNodeId}-next path.node-link`
            );
            prevNodeNewNextLinkGroup.style("opacity", 0);

            // Grupo correspondiente al actual enlace anterior del nodo siguiente que apunta al nodo a eliminar 
            const nextNodeCurrPrevLinkGroup = linksG.select<SVGGElement>(
                `g#link-${nextNodeId}-${removalNodeId}-prev`
            );

            // Grupo correspondiente al nuevo enlace anterior del nodo siguiente que apunta al nodo previo del nodo a eliminar
            const nextNodeNewPrevLinkGroup = linksG.select<SVGPathElement>(
                `g#link-${nextNodeId}-${prevNodeId}-prev path.node-link`
            );
            nextNodeNewPrevLinkGroup.style("opacity", 0);

            // Grupo correspondiente al enlace anterior del nodo a eliminar que apunta al nodo previo
            const removalNodePrevLinkGroup = linksG.select<SVGGElement>(
                `g#link-${removalNodeId}-${prevNodeId}-prev`
            );

            // Grupo correspondiente al enlace siguiente del nodo a eliminar que apunta al nodo siguiente 
            const removalNodeNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${removalNodeId}-${nextNodeId}-next`
            );

            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.VALIDATE_EMPTY });
            await delay(500);

            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.VALIDATE_POSITION });
            await delay(500);

            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.DECLARE_REMOVED_NODE });
            await delay(500);

            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.VALIDATE_SINGLE_NODE });
            await delay(500);

            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.ELSE_IF_HEAD });
            await delay(500);

            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.ELSE_IF_TAIL });
            await delay(500);

            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.ELSE_REMOVE });
            await delay(500);

            // Recorrido de los nodos hasta el nodo a eliminar
            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.GET_NODE_AT_POS });
            await delay(500);

            const nodesToTraverse = remainingNodesData.slice(0, deletePosition + 1);
            await animateGetListNodePos(nodesG, nodesToTraverse, bus, {
                INIT_TRAVERSAL: labels.INIT_TRAVERSAL,
                WHILE_TRAVERSAL: labels.WHILE_TRAVERSAL,
                ADVANCE_NODE: labels.ADVANCE_NODE,
                DEC_POS: labels.DEC_POS,
                RETURN_NODE_GETPOS: labels.RETURN_NODE_GETPOS
            }, "removeAt");

            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.GET_NODE_AT_POS });
            await delay(400);

            // Posición de animación final del nodo a eliminar
            const removalNodePos = deletionData.positions.get(removalNodeId)!;
            const finalRemovalNodePos = {
                x: removalNodePos.x,
                y: removalNodePos.y - 60,
            };

            // Forma final de los enlaces a eliminar
            const finalPrevNodeCurrNextLink = buildListPath(
                "next",
                deletionData.positions.get(prevNodeId!) ?? null,
                finalRemovalNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );

            const finalRemovalNodePrevLink = buildListPath(
                "prev",
                finalRemovalNodePos,
                deletionData.positions.get(prevNodeId!) ?? null,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );

            const initialNextNodePos = {
                x: SVG_LINKED_LIST_VALUES.MARGIN_LEFT + (deletePosition + 1) * (SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH + SVG_LINKED_LIST_VALUES.SPACING),
                y: removalNodePos.y
            }
            const finalRemovalNodeNextLink = buildListPath(
                "next",
                finalRemovalNodePos,
                initialNextNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );

            const finalNextNodeCurrPrevLink = buildListPath(
                "prev",
                initialNextNodePos,
                finalRemovalNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );

            // Promesas para el movimiento del nodo a eliminar y enlaces asociados a su posición final
            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.LINK_PREV_TO_NEXT });
            const shiftPromises: Promise<void>[] = [];
            shiftPromises.push(
                removalNodeGroup
                    .transition()
                    .duration(1250)
                    .attr("transform", `translate(${finalRemovalNodePos.x}, ${finalRemovalNodePos.y})`)
                    .end()
            );

            shiftPromises.push(
                prevNodeCurrNextLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1250)
                    .attr("d", finalPrevNodeCurrNextLink)
                    .end()
            );

            shiftPromises.push(
                removalNodePrevLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1250)
                    .attr("d", finalRemovalNodePrevLink)
                    .end()
            );

            shiftPromises.push(
                removalNodeNextLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1250)
                    .attr("d", finalRemovalNodeNextLink)
                    .end()
            );

            shiftPromises.push(
                nextNodeCurrPrevLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1250)
                    .attr("d", finalNextNodeCurrPrevLink)
                    .end()
            );
            await Promise.all(shiftPromises);

            // Desconexión del actual enlace siguiente del nodo previo que apunta al nodo a eliminar
            await prevNodeCurrNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Establecimiento del nuevo enlace siguiente del nodo previo
            const prevNodeNewNextLink = buildListPath(
                "next",
                deletionData.positions.get(prevNodeId!) ?? null,
                initialNextNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            await prevNodeNewNextLinkGroup
                .transition()
                .duration(1000)
                .attr("d", prevNodeNewNextLink)
                .style("opacity", 1)
                .end();

            // Desconexión del actual enlace anterior del nodo siguiente
            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.LINK_NEXT_TO_PREV });
            await nextNodeCurrPrevLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Establecimiento del nuevo enlace anterior del nodo siguiente
            const nextNodeNewPrevLink = buildListPath(
                "prev",
                initialNextNodePos,
                deletionData.positions.get(prevNodeId!) ?? null,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            await nextNodeNewPrevLinkGroup
                .transition()
                .duration(1000)
                .attr("d", nextNodeNewPrevLink)
                .style("opacity", 1)
                .end();

            // Desconexión de los enlaces asociados al nodo a eliminar
            await removalNodeNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            await removalNodePrevLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Salida del nodo a eliminar
            await animateExitListNode(removalNodeGroup);

            // Nodos a desplazar y enlaces a ajustar luego de la eliminación
            const nodesToMove = remainingNodesData.slice(
                deletePosition + 1,
                remainingNodesData.length
            );
            const linksToMove = remainingLinksData.slice(
                deletePosition - 1,
                remainingLinksData.length
            );
            linksToMove.push({ sourceId: remainingNodesData[0].id, targetId: remainingNodesData[remainingNodesData.length - 1].id, type: "circular-prev" });

            // Reposicionamiento de los elementos indicados de la lista a sus posiciones finales
            await repositionList(svg,
                nodesToMove,
                linksToMove,
                deletionData.positions,
                {
                    headIndicator: null,
                    headNodeId: null,
                    tailIndicator: null,
                    tailNodeId: null
                }
            );
        }

        bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.DEC_SIZE });
        await delay(500);

        bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.RETURN_ELEMENT });
        await delay(500);

        // Limpiamos el registro del nodo eliminado
        deletionData.positions.delete(removalNodeId);

        // Fin de la operación
        bus.emit("op:done", { op: "removeAt" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

async function animateInsertInEmptyList(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    bus: EventBus,
    newNodeId: string,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number;
        CREATE_NODE: number;
        VALIDATE_EMPTY: number;
        SET_HEAD_EMPTY: number;
        LINK_SELF_NEXT: number;
        LINK_SELF_PREV: number;
    }
) {
    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nuevo nodo
    const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);

    // Grupo correspondiente al enlace circular siguiente del nuevo nodo que apunta a si mismo
    const newNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newNodeId}-${newNodeId}-circular-next`
    );

    // Grupo correspondiente al enlace circular anterior del nuevo nodo que apunta a si mismo
    const newNodePrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newNodeId}-${newNodeId}-circular-prev`
    );

    // Grupo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    // Estado visual inicial de los nuevos elementos producto de la inserción
    newNodeGroup.style("opacity", 0);
    newNodeNextLinkGroup.style("opacity", 0);
    newNodePrevLinkGroup.style("opacity", 0);

    if (labels.VALIDATE_POSITION) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_POSITION });
        await delay(500);
    }

    bus.emit("step:progress", { stepId, lineIndex: labels.CREATE_NODE });
    await delay(500);

    bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_EMPTY });
    await delay(500);

    // Aparición del nuevo nodo (lista vacía) y del indicador de cabeza
    bus.emit("step:progress", { stepId, lineIndex: labels.SET_HEAD_EMPTY });
    await newNodeGroup.transition().duration(1000).style("opacity", 1).end();
    await headIndicatorGroup.transition().duration(800).style("opacity", 1).end();

    // Establecimiento del enlace circular siguiente del nuevo nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_SELF_NEXT });
    await newNodeNextLinkGroup.transition().duration(800).style("opacity", 1).end();

    // Establecimiento del enlace circular anterior del nuevo nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_SELF_PREV });
    await newNodePrevLinkGroup.transition().duration(800).style("opacity", 1).end();
}

async function animateInsertAtHeadNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newNodeId: string;
        headNodeId: string;
        lastNodeId: string;
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number;
        CREATE_NODE: number;
        VALIDATE_EMPTY: number;
        ELSE_EMPTY: number;
        LINK_NEW_TO_HEAD: number;
        LINK_NEW_TO_LAST: number;
        LINK_LAST_TO_NEW: number;
        LINK_HEAD_TO_NEW: number;
        UPDATE_HEAD: number;
    },
    repositionList: () => Promise<void>
) {
    // Nodos implicados en la inserción
    const { newNodeId, headNodeId, lastNodeId } = insertionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nuevo nodo
    const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);

    // Grupo correspondiente al enlace siguiente del nuevo nodo que apunta a la cabeza
    const newNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newNodeId}-${headNodeId}-next`
    );

    // Grupo correspondiente al enlace circular anterior del nuevo nodo que apunta al último
    const newNodePrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newNodeId}-${lastNodeId}-circular-prev`
    );

    // Grupo correspondiente al actual enlace circular anterior del nodo cabeza que apunta al último
    const headNodeCurrPrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${headNodeId}-${lastNodeId}-circular-prev`
    );

    // Grupo correspondiente al nuevo enlace anterior del nodo cabeza que apunta al nuevo nodo
    const headNodeNewPrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${headNodeId}-${newNodeId}-prev`
    );

    // Grupo correspondiente al actual enlace circular siguiente del último nodo que apunta a la cabeza
    const lastNodeCurrNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${lastNodeId}-${headNodeId}-circular-next`
    );

    // Grupo correspondiente al nuevo enlace circular siguiente del último nodo que apunta al nuevo nodo
    const lastNodeNewNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${lastNodeId}-${newNodeId}-circular-next`
    );

    // Grupo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    // Estado visual inicial de los nuevos elementos producto de la inserción
    newNodeGroup.style("opacity", 0);
    newNodeNextLinkGroup.style("opacity", 0);
    newNodePrevLinkGroup.style("opacity", 0);
    headNodeNewPrevLinkGroup.style("opacity", 0);
    lastNodeNewNextLinkGroup.style("opacity", 0);

    if (labels.VALIDATE_POSITION) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_POSITION });
        await delay(500);
    }

    bus.emit("step:progress", { stepId, lineIndex: labels.CREATE_NODE });
    await delay(500);

    bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_EMPTY });
    await delay(500);

    bus.emit("step:progress", { stepId, lineIndex: labels.ELSE_EMPTY });
    await delay(500);

    // Reposicionamiento de los elementos actuales de la lista a su posición final
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_NEW_TO_HEAD });
    await repositionList();

    // Aparición y posicionamiento del nuevo nodo
    const newNodePos = insertionData.positions.get(newNodeId)!;
    const initialNewNodePos = {
        x: newNodePos.x,
        y: newNodePos.y - 60,
    };
    await animateAppearListNode(newNodeGroup, initialNewNodePos, newNodePos);

    // Establecimiento del enlace siguiente del nuevo nodo
    await newNodeNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Establecimiento del enlace circular anterior del nuevo nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_NEW_TO_LAST });
    await newNodePrevLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Desconexión del actual enlace circular siguiente del último nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_LAST_TO_NEW });
    await lastNodeCurrNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Establecimiento del nuevo enlace circular siguiente del último nodo
    await lastNodeNewNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Desconexión del actual enlace circular anterior del nodo cabeza
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_HEAD_TO_NEW });
    await headNodeCurrPrevLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Establecimiento del nuevo enlace anterior del nodo cabeza
    await headNodeNewPrevLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Posicionamiento del indicador de cabeza a la nueva cabeza de la lista
    bus.emit("step:progress", { stepId, lineIndex: labels.UPDATE_HEAD });
    await headIndicatorGroup
        .transition()
        .duration(1500)
        .attr("transform", () => {
            const finalX =
                newNodePos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
            const finalY = newNodePos.y;
            return `translate(${finalX}, ${finalY})`;
        })
        .end();
}

async function animateInsertAtTailNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newNodeId: string;
        headNodeId: string;
        lastNodeId: string;
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number;
        ELSE_EMPTY?: number;
        ELSE_IF_HEAD?: number;
        ELSE_IF_TAIL?: number;
        CREATE_NODE: number;
        VALIDATE_EMPTY: number;
        LINK_NEW_TO_HEAD: number;
        LINK_NEW_TO_LAST: number;
        LINK_LAST_TO_NEW: number;
        LINK_HEAD_TO_NEW: number;
    }
) {
    // Nodos implicados en la inserción
    const { newNodeId, headNodeId, lastNodeId } = insertionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nuevo nodo
    const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);

    // Grupo correspondiente al enlace circular siguiente del nuevo nodo que apunta a la cabeza
    const newNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newNodeId}-${headNodeId}-circular-next`
    );

    // Grupo correspondiente al enlace anterior del nuevo nodo que apunta al último
    const newNodePrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newNodeId}-${lastNodeId}-prev`
    );

    // Grupo correspondiente al actual enlace circular siguiente del último nodo que apunta a la cabeza
    const lastNodeCurrNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${lastNodeId}-${headNodeId}-circular-next`
    );

    // Grupo correspondiente al nuevo enlace siguiente del último nodo que apunta al nuevo nodo
    const lastNodeNewNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${lastNodeId}-${newNodeId}-next`
    );

    // Grupo correspondiente al actual enlace circular anterior del nodo cabeza que apunta al último
    const headNodeCurrPrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${headNodeId}-${lastNodeId}-circular-prev`
    );

    // Grupo correspondiente al nuevo enlace circular anterior del nodo cabeza que apunta al nuevo nodo
    const headNodeNewPrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${headNodeId}-${newNodeId}-circular-prev`
    );

    // Estado visual inicial de los nuevos elementos producto de la inserción
    newNodeGroup.style("opacity", 0);
    newNodeNextLinkGroup.style("opacity", 0);
    newNodePrevLinkGroup.style("opacity", 0);
    lastNodeNewNextLinkGroup.style("opacity", 0);
    headNodeNewPrevLinkGroup.style("opacity", 0);

    if (labels.VALIDATE_POSITION) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_POSITION });
        await delay(500);
    }

    bus.emit("step:progress", { stepId, lineIndex: labels.CREATE_NODE });
    await delay(500);

    bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_EMPTY });
    await delay(500);

    if (labels.ELSE_IF_HEAD) {
        bus.emit("step:progress", { stepId, lineIndex: labels.ELSE_IF_HEAD });
        await delay(500);
    }

    const elseTailLabel = labels.ELSE_EMPTY ?? labels.ELSE_IF_TAIL ?? null;
    if (elseTailLabel) {
        bus.emit("step:progress", { stepId, lineIndex: elseTailLabel });
        await delay(500);
    }

    // Aparición y posicionamiento del nuevo nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_NEW_TO_HEAD });
    const newNodePos = insertionData.positions.get(newNodeId)!;
    const initialNewNodePos = {
        x: newNodePos.x,
        y: newNodePos.y - 60,
    };
    await animateAppearListNode(newNodeGroup, initialNewNodePos, newNodePos);

    // Establecimiento del enlace circular siguiente del nuevo nodo
    await newNodeNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Establecimiento del enlace anterior del nuevo nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_NEW_TO_LAST });
    await newNodePrevLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Desconexión del actual enlace circular siguiente del último nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_LAST_TO_NEW });
    await lastNodeCurrNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Establecimiento del nuevo enlace siguiente del último nodo
    await lastNodeNewNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Desconexión del actual enlace circular anterior del nodo cabeza
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_HEAD_TO_NEW });
    await headNodeCurrPrevLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Establecimiento del nuevo enlace circular anterior del nodo cabeza
    await headNodeNewPrevLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();
}

async function animateDeleteOneElementList(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    bus: EventBus,
    removalNodeId: string,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number,
        SAVE_SINGLE_NODE?: number;
        VALIDATE_EMPTY: number;
        DECLARE_REMOVED_NODE: number,
        VALIDATE_SINGLE_NODE: number;
        CLEAR_HEAD: number;
    }
) {
    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nodo a eliminar
    const removalNodeGroup = nodesG.select<SVGGElement>(`g#${removalNodeId}`);

    // Grupo correspondiente al enlace circular siguiente del nodo a eliminar que apunta a si mismo
    const removalNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${removalNodeId}-${removalNodeId}-circular-next`
    );

    // Grupo correspondiente al enlace circular anterior del nodo a eliminar que apunta a si mismo
    const removalNodePrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${removalNodeId}-${removalNodeId}-circular-prev`
    );

    // Grupo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_EMPTY });
    await delay(500);

    if (labels.VALIDATE_POSITION) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_POSITION });
        await delay(500);
    }

    bus.emit("step:progress", { stepId, lineIndex: labels.DECLARE_REMOVED_NODE });
    await delay(500);

    bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_SINGLE_NODE });
    await delay(500);

    if (labels.SAVE_SINGLE_NODE) {
        bus.emit("step:progress", { stepId, lineIndex: labels.SAVE_SINGLE_NODE });
        await delay(500);
    }

    // Salida del nodo a eliminar y del indicador de cabeza
    bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_HEAD });
    await headIndicatorGroup.transition().duration(800).style("opacity", 0).remove().end();
    await removalNodeNextLinkGroup.transition().duration(800).style("opacity", 0).remove().end();
    await removalNodePrevLinkGroup.transition().duration(800).style("opacity", 0).remove().end();
    await removalNodeGroup.transition().duration(1000).style("opacity", 0).remove().end();
}

async function animateDeleteAtHeadNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        removalNodeId: string;
        newHeadNodeId: string;
        lastNodeId: string;
        lastNodeIndex: number;
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number;
        SAVE_HEAD_NODE?: number;
        VALIDATE_EMPTY: number;
        DECLARE_REMOVED_NODE: number;
        VALIDATE_SINGLE_NODE: number;
        ELSE_SINGLE_NODE: number;
        LINK_LAST_TO_NEWHEAD: number;
        LINK_NEWHEAD_TO_LAST: number;
        UPDATE_HEAD: number;
        CLEAR_REMOVED_NEXT: number;
        CLEAR_REMOVED_PREV: number;
    },
    repositionList: () => Promise<void>
) {
    // Nodos implicados en la eliminación
    const { removalNodeId, newHeadNodeId, lastNodeId, lastNodeIndex } = deletionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nodo a eliminar
    const removalNodeGroup = nodesG.select<SVGGElement>(`g#${removalNodeId}`);

    // Grupo correspondiente al enlace siguiente del nodo a eliminar que apunta a la nueva cabeza
    const removalNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${removalNodeId}-${newHeadNodeId}-next`
    );

    // Grupo correspondiente al enlace circular anterior del nodo a eliminar que apunta al último
    const removalNodePrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${removalNodeId}-${lastNodeId}-circular-prev`
    );

    // Grupo correspondiente al actual enlace anterior del nuevo nodo cabeza que apunta al nodo a eliminar
    const newHeadNodeCurrPrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newHeadNodeId}-${removalNodeId}-prev`
    );

    // Grupo correspondiente al nuevo enlace circular anterior del nuevo nodo cabeza que apunta al último
    const newHeadNodeNewPrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newHeadNodeId}-${lastNodeId}-circular-prev`
    );

    // Grupo correspondiente al actual enlace circular siguiente del último nodo que apunta al nodo a eliminar
    const lastNodeCurrNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${lastNodeId}-${removalNodeId}-circular-next`
    );

    // Grupo correspondiente al nuevo enlace circular siguiente del último nodo que apunta a la nueva cabeza
    const lastNodeNewNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${lastNodeId}-${newHeadNodeId}-circular-next`
    );

    // Grupo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    // Estado visual inicial de los nuevos elementos producto de la eliminación
    newHeadNodeNewPrevLinkGroup.style("opacity", 0);
    lastNodeNewNextLinkGroup.style("opacity", 0);

    bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_EMPTY });
    await delay(500);

    if (labels.VALIDATE_POSITION) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_POSITION });
        await delay(500);
    }

    bus.emit("step:progress", { stepId, lineIndex: labels.DECLARE_REMOVED_NODE });
    await delay(500);

    bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_SINGLE_NODE });
    await delay(500);

    bus.emit("step:progress", { stepId, lineIndex: labels.ELSE_SINGLE_NODE });
    await delay(500);

    if (labels.SAVE_HEAD_NODE) {
        bus.emit("step:progress", { stepId, lineIndex: labels.SAVE_HEAD_NODE });
        await delay(500);
    }

    // Desconexión del actual enlace circular siguiente del último nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_LAST_TO_NEWHEAD });
    await lastNodeCurrNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Forma inicial del nuevo enlace circular siguiente del último nodo
    const removalNodePos = deletionData.positions.get(removalNodeId)!;
    const initialNewHeadPos = {
        x: SVG_LINKED_LIST_VALUES.MARGIN_LEFT + (1) * (SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH + SVG_LINKED_LIST_VALUES.SPACING),
        y: removalNodePos.y
    }
    const initialLastNodePos = {
        x: SVG_LINKED_LIST_VALUES.MARGIN_LEFT + (lastNodeIndex) * (SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH + SVG_LINKED_LIST_VALUES.SPACING),
        y: removalNodePos.y
    }

    const initialLastNodeNewNextLink = buildListPath(
        "circular-next",
        initialLastNodePos,
        initialNewHeadPos,
        SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
        SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
    )
    lastNodeNewNextLinkGroup.select("path.node-link")
        .attr("d", initialLastNodeNewNextLink);

    // Establecimiento del nuevo enlace circular siguiente del último nodo
    await lastNodeNewNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Desconexión del actual enlace anterior del nuevo nodo cabeza
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_NEWHEAD_TO_LAST });
    await newHeadNodeCurrPrevLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Forma inicial del nuevo enlace circular anterior del nuevo nodo cabeza
    const initialNewHeadNodeNewPrevLink = buildListPath(
        "circular-prev",
        initialNewHeadPos,
        initialLastNodePos,
        SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
        SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
    )
    newHeadNodeNewPrevLinkGroup.select("path.node-link")
        .attr("d", initialNewHeadNodeNewPrevLink);

    // Establecimiento del nuevo enlace circular anterior del nuevo nodo cabeza
    await newHeadNodeNewPrevLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Posicionamiento del indicador de cabeza a la nueva cabeza de la lista
    bus.emit("step:progress", { stepId, lineIndex: labels.UPDATE_HEAD });
    await headIndicatorGroup
        .transition()
        .duration(1500)
        .attr("transform", () => {
            const finalX =
                initialNewHeadPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
            const finalY = initialNewHeadPos.y;
            return `translate(${finalX}, ${finalY})`;
        })
        .end();

    // Desconexión del enlace siguiente del nodo a eliminar
    bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_REMOVED_NEXT });
    await removalNodeNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Desconexión del enlace circular anterior del nodo a eliminar
    bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_REMOVED_PREV });
    await removalNodePrevLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Salida del nodo a eliminar
    const finalRemovalNodePos = {
        x: removalNodePos.x,
        y: removalNodePos.y + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8,
    };
    await animateExitListNode(removalNodeGroup, finalRemovalNodePos);

    // Reposicionamiento de los elementos restantes de la lista a su posición final
    await repositionList();
}

async function animateDeleteAtTailNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        removalNodeId: string;
        newLastNodeId: string;
        headNodeId: string;
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number;
        ELSE_SINGLE_NODE?: number;
        ELSE_IF_HEAD?: number;
        ELSE_IF_TAIL?: number;
        SAVE_TAIL_NODE?: number;
        VALIDATE_EMPTY: number;
        DECLARE_REMOVED_NODE: number;
        VALIDATE_SINGLE_NODE: number;
        LINK_PREV_TO_HEAD: number;
        LINK_HEAD_TO_PREV: number;
        CLEAR_REMOVED_NEXT: number;
        CLEAR_REMOVED_PREV: number;
    }
) {
    // Nodos implicados en la eliminación
    const { removalNodeId, newLastNodeId, headNodeId } = deletionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nodo a eliminar
    const removalNodeGroup = nodesG.select<SVGGElement>(`g#${removalNodeId}`);

    // Grupo correspondiente al enlace circular siguiente del nodo a eliminar que apunta a la cabeza
    const removalNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${removalNodeId}-${headNodeId}-circular-next`
    );

    // Grupo correspondiente al enlace anterior del nodo a eliminar que apunta al nuevo último
    const removalNodePrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${removalNodeId}-${newLastNodeId}-prev`
    );

    // Grupo correspondiente al actual enlace siguiente del nuevo último nodo que apunta al nodo a eliminar
    const newLastNodeCurrNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newLastNodeId}-${removalNodeId}-next`
    );

    // Grupo correspondiente al nuevo enlace circular siguiente del nuevo último nodo que apunta a la cabeza
    const newLastNodeNewNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newLastNodeId}-${headNodeId}-circular-next`
    );

    // Grupo correspondiente al actual enlace circular anterior del nodo cabeza que apunta al nodo a eliminar
    const headNodeCurrPrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${headNodeId}-${removalNodeId}-circular-prev`
    );

    // Grupo correspondiente al nuevo enlace circular anterior del nodo cabeza que apunta al nuevo último nodo
    const headNodeNewPrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${headNodeId}-${newLastNodeId}-circular-prev`
    );

    // Estado visual inicial de los nuevos elementos producto de la eliminación
    newLastNodeNewNextLinkGroup.style("opacity", 0);
    headNodeNewPrevLinkGroup.style("opacity", 0);

    bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_EMPTY });
    await delay(500);

    if (labels.VALIDATE_POSITION) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_POSITION });
        await delay(500);
    }

    bus.emit("step:progress", { stepId, lineIndex: labels.DECLARE_REMOVED_NODE });
    await delay(500);

    bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_SINGLE_NODE });
    await delay(500);

    if (labels.ELSE_IF_HEAD) {
        bus.emit("step:progress", { stepId, lineIndex: labels.ELSE_IF_HEAD });
        await delay(500);
    }

    const elseLabel = labels.ELSE_SINGLE_NODE ?? labels.ELSE_IF_TAIL ?? null;
    if (elseLabel) {
        bus.emit("step:progress", { stepId, lineIndex: elseLabel });
        await delay(500);
    }

    if (labels.SAVE_TAIL_NODE) {
        bus.emit("step:progress", { stepId, lineIndex: labels.SAVE_TAIL_NODE });
        await delay(500);
    }

    // Desconexión del actual enlace siguiente del nuevo último nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_PREV_TO_HEAD });
    await newLastNodeCurrNextLinkGroup
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove()
        .end();

    // Establecimiento del nuevo enlace circular siguiente del nuevo último nodo
    await newLastNodeNewNextLinkGroup
        .transition()
        .duration(800)
        .style("opacity", 1)
        .end();

    // Desconexión del actual enlace circular previo del nodo cabeza
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_HEAD_TO_PREV });
    await headNodeCurrPrevLinkGroup
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove()
        .end();

    // Establecimiento del nuevo enlace circular anterior del nodo cabeza
    await headNodeNewPrevLinkGroup
        .transition()
        .duration(800)
        .style("opacity", 1)
        .end();

    // Desconexión del enlace siguiente del nodo a eliminar
    bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_REMOVED_NEXT });
    await removalNodeNextLinkGroup
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove()
        .end();

    // Desconexión del enlace anterior del nodo a eliminar
    bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_REMOVED_PREV });
    await removalNodePrevLinkGroup
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove()
        .end();

    // Posición de animación final del nodo a eliminar
    const removalNodePos = deletionData.positions.get(removalNodeId)!;
    const finalRemovalNodePos = {
        x: removalNodePos.x,
        y: removalNodePos.y + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8,
    };

    // Salida del nodo a eliminar
    await animateExitListNode(removalNodeGroup, finalRemovalNodePos);
}