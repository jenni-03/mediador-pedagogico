import { ListLinkData, ListNodeData } from "../../../types";
import { getListaDoblementeEnlazadaCode } from "../../constants/pseudocode/listDoblementeEnlazadaCode";
import { Selection } from "d3";
import { type EventBus } from "../../events/eventBus";
import { Dispatch, SetStateAction } from "react";
import { delay } from "../simulatorUtils";
import { animateAppearListNode, animateExitListNode, animateGetListNodePos } from "./simpleLinkedListDrawActions";
import { SVG_LINKED_LIST_VALUES } from "../../constants/consts";
import { repositionList } from "./drawActionsUtilities";
import { buildListPath } from "../listUtils";

const listaDobleCode = getListaDoblementeEnlazadaCode();

/**
 * Función encargada de animar el proceso de inserción de un nuevo nodo al inicio de la lista doble.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDoublyInsertFirst(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newHeadNodeId: string;
        currHeadNodeId: string | null;
        nodesData: ListNodeData<number>[];
        linksData: ListLinkData[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaDobleCode.insertFirst.labels!;

    // Nodos implicados en la inserción
    const { newHeadNodeId, currHeadNodeId } = insertionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "insertFirst" });

        if (!currHeadNodeId) {
            await animateInsertInEmptyList(
                svg,
                bus,
                newHeadNodeId,
                "insertFirst",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    SET_HEAD_EMPTY: labels.SET_HEAD_EMPTY,
                    SET_TAIL_EMPTY: labels.SET_TAIL_EMPTY
                }
            );
        } else {
            await animateInsertAtHeadNonEmpty(
                svg,
                {
                    newNodeId: newHeadNodeId,
                    headNodeId: currHeadNodeId,
                    positions: insertionData.positions
                },
                bus,
                "insertFirst",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    ELSE_EMPTY: labels.ELSE_EMPTY,
                    LINK_NEW_TO_HEAD: labels.LINK_NEW_TO_HEAD,
                    LINK_HEAD_TO_NEW: labels.LINK_HEAD_TO_NEW,
                    UPDATE_HEAD: labels.UPDATE_HEAD
                },
                () => repositionList(
                    svg,
                    insertionData.nodesData,
                    insertionData.linksData,
                    insertionData.positions,
                    {
                        headIndicator: svg.select<SVGGElement>("g#head-indicator"),
                        headNodeId: currHeadNodeId,
                        tailIndicator: svg.select<SVGGElement>("g#tail-indicator"),
                        tailNodeId: insertionData.nodesData[insertionData.nodesData.length - 1].id
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
 * Función encargada de animar el proceso de inserción de un nuevo nodo al final de la lista doble.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDoublyInsertLast(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newLastNodeId: string;
        currLastNodeId: string | null;
        nodesData: ListNodeData<number>[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaDobleCode.insertLast.labels!;

    // Nodos implicados en la inserción
    const { newLastNodeId, currLastNodeId } = insertionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "insertLast" });

        if (!currLastNodeId) {
            await animateInsertInEmptyList(
                svg,
                bus,
                newLastNodeId,
                "insertLast",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    SET_HEAD_EMPTY: labels.SET_HEAD_EMPTY,
                    SET_TAIL_EMPTY: labels.SET_TAIL_EMPTY
                }
            );
        } else {
            await animateInsertAtTailNonEmpty(
                svg,
                {
                    newNodeId: newLastNodeId,
                    lastNodeId: currLastNodeId,
                    positions: insertionData.positions,
                },
                bus,
                "insertLast",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    ELSE_EMPTY: labels.ELSE_EMPTY,
                    LINK_TAIL_TO_NEW: labels.LINK_TAIL_TO_NEW,
                    LINK_NEW_TO_TAIL: labels.LINK_NEW_TO_TAIL,
                    UPDATE_TAIL: labels.UPDATE_TAIL
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
 * Función encargada de animar el proceso de inserción de un nuevo nodo en una posición especifica de la lista doble.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDoublyInsertAt(
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
    const labels = listaDobleCode.insertAt.labels!;

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
                    SET_TAIL_EMPTY: labels.SET_TAIL_EMPTY
                }
            );
        } else if (!prevNodeId && nextNodeId) {
            // Inserción al inicio
            await animateInsertAtHeadNonEmpty(
                svg,
                {
                    newNodeId,
                    headNodeId: nextNodeId,
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
                    LINK_HEAD_TO_NEW: labels.LINK_HEAD_TO_NEW,
                    UPDATE_HEAD: labels.UPDATE_HEAD
                },
                () => repositionList(
                    svg,
                    insertionData.nodesData,
                    insertionData.linksData,
                    insertionData.positions,
                    {
                        headIndicator: svg.select<SVGGElement>("g#head-indicator"),
                        headNodeId: nextNodeId,
                        tailIndicator: svg.select<SVGGElement>("g#tail-indicator"),
                        tailNodeId: insertionData.nodesData[insertionData.nodesData.length - 1].id,
                    }
                )
            );
        } else if (prevNodeId && !nextNodeId) {
            // Inserción al final
            await animateInsertAtTailNonEmpty(
                svg,
                {
                    newNodeId,
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
                    LINK_TAIL_TO_NEW: labels.LINK_TAIL_TO_NEW,
                    LINK_NEW_TO_TAIL: labels.LINK_NEW_TO_TAIL,
                    UPDATE_TAIL: labels.UPDATE_TAIL
                }
            );
        } else {
            // Inserción en posición intermedia
            const { insertionPosition, nodesData, linksData } = insertionData;

            // Grupos contenedores de nodos y enlaces de la lista
            const nodesG = svg.select<SVGGElement>("g#nodes-layer");
            const linksG = svg.select<SVGGElement>("g#links-layer");

            // Grupos correspondientes a los elementos producto de la inserción
            const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);
            newNodeGroup.style("opacity", 0);

            const prevNodeNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${prevNodeId}-${newNodeId}-next`
            );
            prevNodeNextLinkGroup.style("opacity", 0);

            const newNodePrevLinkGroup = linksG.select<SVGGElement>(
                `g#link-${newNodeId}-${prevNodeId}-prev`
            );
            newNodePrevLinkGroup.style("opacity", 0);

            const newNodeNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${newNodeId}-${nextNodeId}-next`
            );
            newNodeNextLinkGroup.style("opacity", 0);

            const nextNodePrevLinkGroup = linksG.select<SVGGElement>(
                `g#link-${nextNodeId}-${newNodeId}-prev`
            );
            nextNodePrevLinkGroup.style("opacity", 0);

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
            const nodesToMove = nodesData.slice(
                insertionPosition,
                nodesData.length
            );
            const linksToMove = linksData.slice(
                insertionPosition,
                linksData.length
            );
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
                    tailIndicator: svg.select<SVGGElement>("g#tail-indicator"),
                    tailNodeId: insertionData.nodesData[insertionData.nodesData.length - 1].id
                }
            );

            // Posición de animación final e inicial del nuevo nodo
            const finalNewNodePos = insertionData.positions.get(newNodeId)!;
            const initialNewNodePos = { x: finalNewNodePos.x, y: finalNewNodePos.y - 75 };

            // Forma inicial de los nuevos enlaces producto de la inserción
            const initialPrevNodeNextLink = buildListPath(
                "next",
                insertionData.positions.get(prevNodeId!) ?? null,
                initialNewNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            prevNodeNextLinkGroup
                .select("path.node-link")
                .attr("d", initialPrevNodeNextLink);

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

            const initialNextNodePrevLink = buildListPath(
                "prev",
                insertionData.positions.get(nextNodeId!) ?? null,
                initialNewNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            nextNodePrevLinkGroup
                .select("path.node-link")
                .attr("d", initialNextNodePrevLink);

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

            // Desconexión del enlace anterior actual del nodo siguiente al nuevo nodo
            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.LINK_NEXT_TO_NEW });
            await linksG.select<SVGGElement>(`g#link-${nextNodeId}-${prevNodeId}-prev`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Establecimiento del enlace anterior del nodo siguiente que apunta al nuevo nodo
            await nextNodePrevLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();

            // Desconexión del enlace siguiente actual del nodo previo al nuevo nodo
            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.LINK_PREV_TO_NEW });
            await linksG.select<SVGGElement>(`g#link-${prevNodeId}-${nextNodeId}-next`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Establecimiento del enlace siguiente del nodo previo que apunta al nuevo nodo
            await prevNodeNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();

            // Forma final de los nuevos enlaces producto de la inserción
            const finalPrevNodeNextLink = buildListPath(
                "next",
                insertionData.positions.get(prevNodeId!) ?? null,
                finalNewNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            const finalNewNodePrevLink = buildListPath(
                "prev",
                finalNewNodePos,
                insertionData.positions.get(prevNodeId!) ?? null,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            const finalNewNodeNextLink = buildListPath(
                "next",
                finalNewNodePos,
                insertionData.positions.get(nextNodeId!) ?? null,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            const finalNextNodePrevLink = buildListPath(
                "prev",
                insertionData.positions.get(nextNodeId!) ?? null,
                finalNewNodePos,
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
                        `translate(${finalNewNodePos.x}, ${finalNewNodePos.y})`
                    )
                    .end()
            );

            shiftPromises.push(
                prevNodeNextLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1000)
                    .attr("d", finalPrevNodeNextLink)
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
                nextNodePrevLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1000)
                    .attr("d", finalNextNodePrevLink)
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
 * Función encargada de animar el proceso de eliminación de un nodo al inicio de la lista doble.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDoublyDeleteFirst(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        currHeadNodeId: string;
        newHeadNodeId: string | null;
        remainingNodesData: ListNodeData<number>[];
        remainingLinksData: ListLinkData[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaDobleCode.removeFirst.labels!;

    // Nodos implicados en la eliminación
    const { currHeadNodeId, newHeadNodeId } = deletionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "removeFirst" });

        if (!newHeadNodeId) {
            await animateDeleteOneElementList(
                svg,
                bus,
                currHeadNodeId,
                "removeFirst",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    DECLARE_REMOVED_NODE: labels.SAVE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    CLEAR_HEAD: labels.CLEAR_HEAD,
                    CLEAR_TAIL: labels.CLEAR_TAIL
                }
            );
        } else {
            await animateDeleteAtHeadNonEmpty(
                svg,
                {
                    removalNodeId: currHeadNodeId,
                    newHeadNodeId,
                    positions: deletionData.positions
                },
                bus,
                "removeFirst",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    DECLARE_REMOVED_NODE: labels.SAVE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    ELSE_SINGLE_NODE: labels.ELSE_SINGLE_NODE,
                    MOVE_HEAD: labels.MOVE_HEAD,
                    CLEAR_PREV_LINK: labels.CLEAR_PREV_LINK
                },
                () => repositionList(
                    svg,
                    deletionData.remainingNodesData,
                    deletionData.remainingLinksData,
                    deletionData.positions,
                    {
                        headIndicator: svg.select<SVGGElement>("g#head-indicator"),
                        headNodeId: currHeadNodeId,
                        tailIndicator: svg.select<SVGGElement>("g#tail-indicator"),
                        tailNodeId: deletionData.remainingNodesData[deletionData.remainingNodesData.length - 1].id
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
 * Función encargada de animar el proceso de eliminación de un nodo al final de la lista doble.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDoublyDeleteLast(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        currLastNodeId: string;
        newLastNodeId: string | null;
        remainingNodesData: ListNodeData<number>[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaDobleCode.removeLast.labels!;

    // Nodos implicados en la eliminación
    const { currLastNodeId, newLastNodeId } = deletionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "removeLast" });

        if (!newLastNodeId) {
            await animateDeleteOneElementList(
                svg,
                bus,
                currLastNodeId,
                "removeLast",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    DECLARE_REMOVED_NODE: labels.SAVE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    CLEAR_HEAD: labels.CLEAR_HEAD,
                    CLEAR_TAIL: labels.CLEAR_TAIL,
                }
            );
        } else {
            await animateDeleteAtTailNonEmpty(
                svg,
                {
                    removalNodeId: currLastNodeId,
                    newLastNodeId,
                    positions: deletionData.positions
                },
                bus,
                "removeLast",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    DECLARE_REMOVED_NODE: labels.SAVE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    ELSE_SINGLE_NODE: labels.ELSE_SINGLE_NODE,
                    MOVE_TAIL: labels.MOVE_TAIL,
                    CLEAR_NEXT_LINK: labels.CLEAR_NEXT_LINK
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
 * Función encargada de animar el proceso de eliminación de un nodo en una posición especifica de la lista doble.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDoublyDeleteAt(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        nodeToRemoveId: string;
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
    const labels = listaDobleCode.removeAt.labels!;

    // Nodos implicados en la eliminación
    const { nodeToRemoveId, prevNodeId, nextNodeId } = deletionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "removeAt" });

        if (!prevNodeId && !nextNodeId) {
            // Salida del único nodo en la lista
            await animateDeleteOneElementList(
                svg,
                bus,
                nodeToRemoveId,
                "removeAt",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    DECLARE_REMOVED_NODE: labels.DECLARE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    SAVE_SINGLE_NODE: labels.SAVE_SINGLE_NODE,
                    CLEAR_HEAD: labels.CLEAR_HEAD,
                    CLEAR_TAIL: labels.CLEAR_TAIL
                }
            );
        } else if (!prevNodeId && nextNodeId) {
            // Eliminación al inicio de la lista
            await animateDeleteAtHeadNonEmpty(
                svg,
                {
                    removalNodeId: nodeToRemoveId,
                    newHeadNodeId: nextNodeId,
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
                    MOVE_HEAD: labels.MOVE_HEAD,
                    CLEAR_PREV_LINK: labels.CLEAR_PREV_LINK
                },
                () => repositionList(
                    svg,
                    deletionData.remainingNodesData,
                    deletionData.remainingLinksData,
                    deletionData.positions,
                    {
                        headIndicator: svg.select<SVGGElement>("g#head-indicator"),
                        headNodeId: nextNodeId,
                        tailIndicator: svg.select<SVGGElement>("g#tail-indicator"),
                        tailNodeId: deletionData.remainingNodesData[deletionData.remainingNodesData.length - 1].id
                    }
                )
            );
        } else if (prevNodeId && !nextNodeId) {
            // Eliminación al final de la lista
            await animateDeleteAtTailNonEmpty(
                svg,
                {
                    removalNodeId: nodeToRemoveId,
                    newLastNodeId: prevNodeId,
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
                    MOVE_TAIL: labels.MOVE_TAIL,
                    CLEAR_NEXT_LINK: labels.CLEAR_NEXT_LINK
                }
            );
        } else {
            // Eliminación en posición intermedia
            const { deletePosition, remainingNodesData, remainingLinksData } = deletionData;

            // Grupos contenedores de los nodos y enlaces de la lista
            const nodesG = svg.select<SVGGElement>("g#nodes-layer");
            const linksG = svg.select<SVGGElement>("g#links-layer");

            // Grupo correspondiente al nodo a eliminar
            const removalNodeGroup = svg.select<SVGGElement>(`g#${nodeToRemoveId}`);

            // Grupos correspondientes a los elementos producto de la eliminación
            const prevNodeNewNextLinkGroup = svg.select<SVGPathElement>(
                `g#link-${prevNodeId}-${nextNodeId}-next path.node-link`
            );
            prevNodeNewNextLinkGroup.style("opacity", 0);

            const nextNodeNewPrevLinkGroup = svg.select<SVGPathElement>(
                `g#link-${nextNodeId}-${prevNodeId}-prev path.node-link`
            );
            nextNodeNewPrevLinkGroup.style("opacity", 0);

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

            // Grupo del lienzo correspondiente al enlace siguiente actual del nodo previo que apunta al nodo a eliminar
            const prevNodeCurrNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${prevNodeId}-${nodeToRemoveId}-next`
            );

            // Grupo del lienzo correspondiente al enlace anterior del nodo a eliminar que apunta al nodo previo
            const removalNodePrevLinkGroup = linksG.select<SVGGElement>(
                `g#link-${nodeToRemoveId}-${prevNodeId}-prev`
            );

            // Grupo del lienzo correspondiente al enlace siguiente del nodo a eliminar que apunta al nodo siguiente 
            const removalNodeNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${nodeToRemoveId}-${nextNodeId}-next`
            );

            // Grupo del lienzo correspondiente al enlace anterior actual del nodo siguiente que apunta al nodo a eliminar 
            const nextNodeCurrPrevLinkGroup = linksG.select<SVGGElement>(
                `g#link-${nextNodeId}-${nodeToRemoveId}-prev`
            );

            // Posición de animación final del nodo a eliminar
            const currRemovalPos = deletionData.positions.get(nodeToRemoveId)!;
            const finalRemovalPos = {
                x: currRemovalPos.x,
                y: currRemovalPos.y - 75,
            };

            // Forma final de los enlaces a eliminar
            const finalPrevNodeCurrNextLink = buildListPath(
                "next",
                deletionData.positions.get(prevNodeId!) ?? null,
                finalRemovalPos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );

            const finalRemovalNodePrevLink = buildListPath(
                "prev",
                finalRemovalPos,
                deletionData.positions.get(prevNodeId!) ?? null,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );

            const initialNextNodePos = {
                x: SVG_LINKED_LIST_VALUES.MARGIN_LEFT + (deletePosition + 1) * (SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH + SVG_LINKED_LIST_VALUES.SPACING),
                y: currRemovalPos.y
            }
            const finalRemovalNodeNextLink = buildListPath(
                "next",
                finalRemovalPos,
                initialNextNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );

            const finalNextNodePrevLink = buildListPath(
                "prev",
                initialNextNodePos,
                finalRemovalPos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );

            // Promesas para el movimiento del nodo a eliminar y enlaces asociados a su posición final
            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.LINK_PREV_TO_NEXT });
            const shiftPromises: Promise<void>[] = [];
            shiftPromises.push(
                removalNodeGroup
                    .transition()
                    .duration(1000)
                    .attr("transform", `translate(${finalRemovalPos.x}, ${finalRemovalPos.y})`)
                    .end()
            );

            shiftPromises.push(
                prevNodeCurrNextLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1000)
                    .attr("d", finalPrevNodeCurrNextLink)
                    .end()
            );

            shiftPromises.push(
                removalNodePrevLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1000)
                    .attr("d", finalRemovalNodePrevLink)
                    .end()
            );

            shiftPromises.push(
                removalNodeNextLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1000)
                    .attr("d", finalRemovalNodeNextLink)
                    .end()
            );

            shiftPromises.push(
                nextNodeCurrPrevLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1000)
                    .attr("d", finalNextNodePrevLink)
                    .end()
            );
            await Promise.all(shiftPromises);

            // Desconexión del enlace siguiente actual del nodo previo que apunta al nodo a eliminar
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

            // Desconexión del enlace anterior actual del nodo siguiente
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

            // Reposicionamiento de los elementos indicados de la lista a sus posiciones finales
            await repositionList(svg,
                nodesToMove,
                linksToMove,
                deletionData.positions,
                {
                    headIndicator: null,
                    headNodeId: null,
                    tailIndicator: svg.select("g#tail-indicator"),
                    tailNodeId: remainingNodesData[remainingNodesData.length - 1].id
                }
            );
        }

        bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.DEC_SIZE });
        await delay(500);

        bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.RETURN_ELEMENT });
        await delay(500);

        // Limpiamos el registro del nodo eliminado
        deletionData.positions.delete(nodeToRemoveId);

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
        SET_TAIL_EMPTY: number;
    }
) {
    // Grupos contenedor de los nodos de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");

    // Grupo del lienzo correspondiente al nuevo nodo
    const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);

    // Grupo del lienzo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    // Grupo del lienzo correspondiente al indicador de cola
    const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

    // Estado visual inicial de los elementos producto de la inserción
    newNodeGroup.style("opacity", 0);

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
    await headIndicatorGroup.transition().duration(600).style("opacity", 1).end();

    // Aparición del indicador de cola
    bus.emit("step:progress", { stepId, lineIndex: labels.SET_TAIL_EMPTY });
    await tailIndicatorGroup.transition().duration(600).style("opacity", 1).end();
}

async function animateInsertAtHeadNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newNodeId: string;
        headNodeId: string;
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
        LINK_HEAD_TO_NEW: number;
        UPDATE_HEAD: number;
    },
    repositionList: () => Promise<void>
) {
    // Nodos implicados en la inserción
    const { newNodeId, headNodeId } = insertionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo del lienzo correspondiente al nuevo nodo
    const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);

    // Grupo del lienzo correspondiente al enlace siguiente del nuevo nodo que apunta a la cabeza
    const newNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newNodeId}-${headNodeId}-next`
    );

    // Grupo del lienzo correspondiente al enlace anterior del nodo cabeza que apunta al nuevo nodo
    const headNodePrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${headNodeId}-${newNodeId}-prev`
    );

    // Grupo del lienzo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    // Estado visual inicial de los elementos producto de la inserción
    newNodeGroup.style("opacity", 0);
    newNodeNextLinkGroup.style("opacity", 0);
    headNodePrevLinkGroup.style("opacity", 0);

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

    // Establecimiento del enlace anterior del nodo cabeza
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_HEAD_TO_NEW });
    await headNodePrevLinkGroup
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
        LINK_TAIL_TO_NEW: number,
        LINK_NEW_TO_TAIL: number,
        UPDATE_TAIL: number,
    }
) {
    // Nodos implicados en la inserción
    const { newNodeId, lastNodeId } = insertionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo del lienzo correspondiente al nuevo nodo
    const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);

    // Grupo del lienzo correspondiente al enlace siguiente del último nodo que apunta al nuevo nodo
    const lastNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${lastNodeId}-${newNodeId}-next`
    );

    // Grupo del lienzo correspondiente al enlace anterior del nuevo nodo que apunta al último
    const newNodePrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newNodeId}-${lastNodeId}-prev`
    );

    // Grupo del lienzo correspondiente al indicador de cola
    const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

    // Estado visual inicial de los elementos producto de la inserción
    newNodeGroup.style("opacity", 0);
    lastNodeNextLinkGroup.style("opacity", 0);
    newNodePrevLinkGroup.style("opacity", 0);

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
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_TAIL_TO_NEW });
    const newNodePos = insertionData.positions.get(newNodeId)!;
    const initialNewNodePos = {
        x: newNodePos.x,
        y: newNodePos.y - 60,
    };
    await animateAppearListNode(newNodeGroup, initialNewNodePos, newNodePos);

    // Establecimiento del enlace siguiente del último nodo
    await lastNodeNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Establecimiento del enlace anterior del nuevo nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_NEW_TO_TAIL });
    await newNodePrevLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Posicionamiento del indicador de cola a la nueva cola de la lista
    bus.emit("step:progress", { stepId, lineIndex: labels.UPDATE_TAIL });
    await tailIndicatorGroup
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

async function animateDeleteOneElementList(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    bus: EventBus,
    currHeadNodeId: string,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number,
        SAVE_SINGLE_NODE?: number;
        VALIDATE_EMPTY: number;
        DECLARE_REMOVED_NODE: number,
        VALIDATE_SINGLE_NODE: number;
        CLEAR_HEAD: number;
        CLEAR_TAIL: number;
    }
) {
    // Grupos contenedor de los nodos de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");

    // Grupo del lienzo correspondiente al nodo a eliminar
    const currHeadNodeGroup = nodesG.select<SVGGElement>(`g#${currHeadNodeId}`);

    // Grupo del lienzo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    // Grupo del lienzo correspondiente al indicador de cola
    const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

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

    // Salida del indicador de cola
    bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_TAIL });
    await tailIndicatorGroup.transition().duration(800).style("opacity", 0).remove().end();

    await currHeadNodeGroup.transition().duration(1000).style("opacity", 0).remove().end();
}

async function animateDeleteAtHeadNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        removalNodeId: string;
        newHeadNodeId: string;
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
        MOVE_HEAD: number;
        CLEAR_PREV_LINK: number;
    },
    repositionList: () => Promise<void>
) {
    // Nodos implicados en la eliminación
    const { removalNodeId, newHeadNodeId } = deletionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo del lienzo correspondiente al nodo a eliminar
    const removalNodeGroup = nodesG.select<SVGGElement>(`g#${removalNodeId}`);

    // Grupo del lienzo correspondiente al enlace siguiente del nodo a eliminar que apunta a la nueva cabeza
    const removalNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${removalNodeId}-${newHeadNodeId}-next`
    );

    // Grupo del lienzo correspondiente al enlace anterior del nuevo nodo cabeza que apunta al nodo a eliminar
    const newHeadNodePrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newHeadNodeId}-${removalNodeId}-prev`
    );

    // Grupo del lienzo correspondiente al indicador de cabeza
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

    bus.emit("step:progress", { stepId, lineIndex: labels.ELSE_SINGLE_NODE });
    await delay(500);

    if (labels.SAVE_HEAD_NODE) {
        bus.emit("step:progress", { stepId, lineIndex: labels.SAVE_HEAD_NODE });
        await delay(500);
    }

    // Posicionamiento del indicador de cabeza a la nueva cabeza de la lista
    bus.emit("step:progress", { stepId, lineIndex: labels.MOVE_HEAD });
    const currRemovePos = deletionData.positions.get(removalNodeId)!;
    const initialNewHeadPos = {
        x: SVG_LINKED_LIST_VALUES.MARGIN_LEFT + (1) * (SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH + SVG_LINKED_LIST_VALUES.SPACING),
        y: currRemovePos.y
    }
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

    // Desconexión del enlace anterior del nuevo nodo cabeza
    bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_PREV_LINK });
    await newHeadNodePrevLinkGroup
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove()
        .end();

    // Desconexión del enlace siguiente del nodo a eliminar
    await removalNodeNextLinkGroup
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove()
        .end();

    // Posición de animación final del nodo a eliminar
    const finalRemovalPos = {
        x: currRemovePos.x,
        y: currRemovePos.y + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8,
    };
    await animateExitListNode(removalNodeGroup, finalRemovalPos);

    // Reposicionamiento de los elementos restantes de la lista a su posición final
    await repositionList();
}

async function animateDeleteAtTailNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        removalNodeId: string;
        newLastNodeId: string;
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
        MOVE_TAIL: number;
        CLEAR_NEXT_LINK: number;
    }
) {
    // Nodos implicados en la eliminación
    const { removalNodeId, newLastNodeId } = deletionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo del lienzo correspondiente al nodo a eliminar
    const removalNodeGroup = nodesG.select<SVGGElement>(`g#${removalNodeId}`);

    // Grupo del lienzo correspondiente al enlace siguiente del nuevo último nodo que apunta al nodo a eliminar
    const newLastNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newLastNodeId}-${removalNodeId}-next`
    );

    // Grupo del lienzo correspondiente al enlace anterior del nodo a eliminar que apunta al nuevo último
    const removalNodePrevLinkGroup = linksG.select<SVGGElement>(
        `g#link-${removalNodeId}-${newLastNodeId}-prev`
    );

    // Grupo del lienzo correspondiente al indicador de cola
    const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

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

    // Posicionamiento del indicador de cola a la posición del nuevo último nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.MOVE_TAIL });
    const newLastPos = deletionData.positions.get(newLastNodeId)!;
    await tailIndicatorGroup
        .transition()
        .duration(1500)
        .attr("transform", () => {
            const finalX =
                newLastPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
            const finalY = newLastPos.y;
            return `translate(${finalX}, ${finalY})`;
        })
        .end();

    // Desconexión del enlace siguiente del nuevo último nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_NEXT_LINK });
    await newLastNodeNextLinkGroup
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove()
        .end();

    // Desconexión del enlace anterior del nodo a eliminar
    await removalNodePrevLinkGroup
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove()
        .end();

    // Posición de animación final del nodo a eliminar
    const currRemovalPos = deletionData.positions.get(removalNodeId)!;
    const finalRemovalPos = {
        x: currRemovalPos.x,
        y: currRemovalPos.y + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8,
    };

    // Salida del nodo a eliminar
    await animateExitListNode(removalNodeGroup, finalRemovalPos);
}