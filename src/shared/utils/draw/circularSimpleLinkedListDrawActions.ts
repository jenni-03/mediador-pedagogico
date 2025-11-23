import { ListLinkData, ListNodeData } from "../../../types";
import { getListaCircularSimplementeEnlazadaCode } from "../../constants/pseudocode/listaCircularSimplementeEnlazadaCode";
import { Selection } from "d3";
import { type EventBus } from "../../events/eventBus";
import { Dispatch, SetStateAction } from "react";
import { delay } from "../simulatorUtils";
import { animateAppearListNode, animateExitListNode, animateGetListNodePos } from "./simpleLinkedListDrawActions";
import { SVG_LINKED_LIST_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { repositionList } from "./drawActionsUtilities";
import { buildListPath } from "../listUtils";

const listaCircularSimpleCode = getListaCircularSimplementeEnlazadaCode();

/**
 * Función encargada de animar el proceso de inserción de un nuevo nodo al inicio de una lista circular simple.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSimpleCircularInsertFirst(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newHeadNodeId: string;
        currHeadNodeId: string | null;
        tailNodeId: string | null;
        nodesData: ListNodeData<number>[];
        linksData: ListLinkData[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaCircularSimpleCode.insertFirst.labels!;

    // Nodos implicados en la inserción
    const { newHeadNodeId, currHeadNodeId, tailNodeId } = insertionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "insertFirst" });

        if (!currHeadNodeId || !tailNodeId) {
            await animateInsertInEmptyList(
                svg,
                bus,
                newHeadNodeId,
                "insertFirst",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    SET_HEAD_EMPTY: labels.SET_HEAD_EMPTY,
                    SET_TAIL_EMPTY: labels.SET_TAIL_EMPTY,
                    LINK_SELF: labels.LINK_SELF
                }
            );
        } else {
            // Conjunto de enlaces a reposicionar (incluyendo el actual enlace circular siguiente entre el nodo cola y la cabeza actual)
            const repositionLinks = insertionData.linksData.slice(1);
            repositionLinks.push({ sourceId: tailNodeId, targetId: currHeadNodeId, type: "circular-next" });

            await animateInsertAtHeadNonEmpty(
                svg,
                {
                    newNodeId: newHeadNodeId,
                    headNodeId: currHeadNodeId,
                    tailNodeId: tailNodeId,
                    positions: insertionData.positions
                },
                bus,
                "insertFirst",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    ELSE_EMPTY: labels.ELSE_EMPTY,
                    LINK_NEW_TO_HEAD: labels.LINK_NEW_TO_HEAD,
                    LINK_TAIL_TO_NEW: labels.LINK_TAIL_TO_NEW,
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
                        tailIndicator: svg.select<SVGGElement>("g#tail-indicator"),
                        tailNodeId,
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
 * Función encargada de animar el proceso de inserción de un nuevo nodo al final de una lista circular simple.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSimpleCircularInsertLast(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newTailNodeId: string;
        currTailNodeId: string | null;
        headNodeId: string | null;
        nodesData: ListNodeData<number>[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaCircularSimpleCode.insertLast.labels!;

    // Nodos implicados en la inserción
    const { newTailNodeId, currTailNodeId, headNodeId } = insertionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "insertLast" });

        if (!currTailNodeId || !headNodeId) {
            await animateInsertInEmptyList(
                svg,
                bus,
                newTailNodeId,
                "insertLast",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    SET_HEAD_EMPTY: labels.SET_HEAD_EMPTY,
                    SET_TAIL_EMPTY: labels.SET_TAIL_EMPTY,
                    LINK_SELF: labels.LINK_SELF
                }
            );
        } else {
            await animateInsertAtTailNonEmpty(
                svg,
                {
                    newNodeId: newTailNodeId,
                    headNodeId,
                    tailNodeId: currTailNodeId,
                    positions: insertionData.positions,
                },
                bus,
                "insertLast",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    ELSE_EMPTY: labels.ELSE_EMPTY,
                    LINK_TAIL_TO_NEW: labels.LINK_TAIL_TO_NEW,
                    LINK_NEW_TO_HEAD: labels.LINK_NEW_TO_HEAD,
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
 * Función encargada de animar el proceso de inserción de un nuevo nodo en una posición especifica de una lista circular simple.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSimpleCircularInsertAt(
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
    const labels = listaCircularSimpleCode.insertAt.labels!;

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
                    SET_TAIL_EMPTY: labels.SET_TAIL_EMPTY,
                    LINK_SELF: labels.LINK_SELF
                }
            );
        } else if (!prevNodeId && nextNodeId) {
            // Inserción al inicio
            const { nodesData } = insertionData
            const tailNodeId = nodesData[nodesData.length - 1].id;

            // Conjunto de enlaces a reposicionar (incluyendo el actual enlace circular siguiente entre el nodo cola y la cabeza actual)
            const repositionLinks = insertionData.linksData.slice(1);
            repositionLinks.push({ sourceId: tailNodeId, targetId: nextNodeId, type: "circular-next" });

            await animateInsertAtHeadNonEmpty(
                svg,
                {
                    newNodeId,
                    headNodeId: nextNodeId,
                    tailNodeId,
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
                    LINK_TAIL_TO_NEW: labels.LINK_TAIL_TO_NEW,
                    UPDATE_HEAD: labels.UPDATE_HEAD
                },
                () => repositionList(
                    svg,
                    nodesData,
                    repositionLinks,
                    insertionData.positions,
                    {
                        headIndicator: svg.select<SVGGElement>("g#head-indicator"),
                        headNodeId: nextNodeId,
                        tailIndicator: svg.select<SVGGElement>("g#tail-indicator"),
                        tailNodeId,
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
                    tailNodeId: prevNodeId,
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
                    LINK_TAIL_TO_NEW: labels.LINK_TAIL_TO_NEW2,
                    LINK_NEW_TO_HEAD: labels.LINK_NEW_TO_HEAD2,
                    UPDATE_TAIL: labels.UPDATE_TAIL
                }
            );
        } else {
            // Inserción en posición intermedia
            const { insertionPosition, nodesData, linksData, positions } = insertionData;

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

            const newNodeNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${newNodeId}-${nextNodeId}-next`
            );
            newNodeNextLinkGroup.style("opacity", 0);

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
            // (incluyendo el actual enlace siguiente entre el nodo previo y siguiente del nuevo nodo)
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
            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.LINK_NEW_TO_NEXT });
            const tailNodeId = nodesData[nodesData.length - 1].id;
            await repositionList(svg,
                nodesToMove,
                linksToMove,
                positions,
                {
                    headIndicator: null,
                    headNodeId: null,
                    tailIndicator: svg.select<SVGGElement>("g#tail-indicator"),
                    tailNodeId
                }
            );

            // Posición de animación inicial del nuevo nodo
            const newNodePos = positions.get(newNodeId)!;
            const initialNewNodePos = { x: newNodePos.x, y: newNodePos.y - 60 };

            // Forma inicial de los nuevos enlaces producto de la inserción
            const initialPrevNodeNewNextLink = buildListPath(
                "next",
                positions.get(prevNodeId!) ?? null,
                initialNewNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            prevNodeNewNextLinkGroup
                .select("path.node-link")
                .attr("d", initialPrevNodeNewNextLink);

            const initialNewNodeNextLink = buildListPath(
                "next",
                initialNewNodePos,
                positions.get(nextNodeId!) ?? null,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
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

            // Desconexión del actual enlace siguiente entre el nodo previo y el siguiente al nuevo nodo
            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.LINK_PREV_TO_NEW });
            await linksG.select<SVGGElement>(`g#link-${prevNodeId}-${nextNodeId}-next`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Establecimiento del nuevo enlace siguiente del nodo previo que apunta al nuevo nodo
            await prevNodeNewNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();

            // Forma final de los nuevos enlaces producto de la inserción
            const finalPrevNodeNewNextLink = buildListPath(
                "next",
                positions.get(prevNodeId!) ?? null,
                newNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            const finalNewNodeNextLink = buildListPath(
                "next",
                newNodePos,
                positions.get(nextNodeId!) ?? null,
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
                newNodeNextLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1000)
                    .attr("d", finalNewNodeNextLink)
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
 * Función encargada de animar el proceso de eliminación de un nodo al inicio de una lista circular simple.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSimpleCircularDeleteFirst(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        currHeadNodeId: string;
        newHeadNodeId: string | null;
        tailNodeId: string | null;
        remainingNodesData: ListNodeData<number>[];
        remainingLinksData: ListLinkData[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaCircularSimpleCode.removeFirst.labels!;

    // Nodos implicados en la eliminación
    const { currHeadNodeId, newHeadNodeId, tailNodeId } = deletionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "removeFirst" });

        if (!newHeadNodeId || !tailNodeId) {
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
                    tailNodeId,
                    tailIndex: deletionData.remainingNodesData.length,
                    positions: deletionData.positions
                },
                bus,
                "removeFirst",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    DECLARE_REMOVED_NODE: labels.SAVE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    ELSE_SINGLE_NODE: labels.ELSE_REMOVE,
                    MOVE_HEAD: labels.MOVE_HEAD,
                    LINK_TAIL_TO_HEAD: labels.LINK_TAIL_TO_HEAD
                },
                () => repositionList(
                    svg,
                    deletionData.remainingNodesData,
                    deletionData.remainingLinksData,
                    deletionData.positions,
                    {
                        headIndicator: svg.select<SVGGElement>("g#head-indicator"),
                        headNodeId: newHeadNodeId,
                        tailIndicator: svg.select<SVGGElement>("g#tail-indicator"),
                        tailNodeId
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
 * Función encargada de animar el proceso de eliminación de un nodo al final de una lista circular simple.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSimpleCircularDeleteLast(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        currTailNodeId: string;
        newTailNodeId: string | null;
        headNodeId: string | null;
        remainingNodesData: ListNodeData<number>[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaCircularSimpleCode.removeLast.labels!;

    // Nodos implicados en la eliminación
    const { currTailNodeId, newTailNodeId, headNodeId } = deletionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "removeLast" });

        if (!newTailNodeId || !headNodeId) {
            await animateDeleteOneElementList(
                svg,
                bus,
                currTailNodeId,
                "removeLast",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    DECLARE_REMOVED_NODE: labels.SAVE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    CLEAR_HEAD: labels.CLEAR_HEAD,
                    CLEAR_TAIL: labels.CLEAR_TAIL
                }
            );
        } else {
            await animateDeleteAtTailNonEmpty(
                svg,
                {
                    removalNodeId: currTailNodeId,
                    newTailNodeId,
                    headNodeId,
                    positions: deletionData.positions,
                    pathNodes: deletionData.remainingNodesData
                },
                bus,
                "removeLast",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    DECLARE_REMOVED_NODE: labels.SAVE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    ELSE_SINGLE_NODE: labels.ELSE_REMOVE,
                    GET_PREV_NODE: labels.GET_PREV_NODE,
                    LINK_PREV_TO_HEAD: labels.LINK_PREV_TO_HEAD,
                    UPDATE_TAIL: labels.UPDATE_TAIL
                },
                {
                    INIT_TRAVERSAL: labels.INIT_TRAVERSAL,
                    WHILE_TRAVERSAL: labels.WHILE_TRAVERSAL,
                    ADVANCE_NODE: labels.ADVANCE_NODE,
                    DEC_POS: labels.DEC_POS,
                    RETURN_NODE_GETPOS: labels.RETURN_NODE_GETPOS
                }
            );
        }
        bus.emit("step:progress", { stepId: "removeLast", lineIndex: labels.DEC_SIZE });
        await delay(500);

        bus.emit("step:progress", { stepId: "removeLast", lineIndex: labels.RETURN_ELEMENT });
        await delay(500);

        // Limpiamos el registro del nodo eliminado
        deletionData.positions.delete(currTailNodeId);

        // Fin de la operación
        bus.emit("op:done", { op: "removeLast" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de eliminación de un nodo en una posición especifica de una lista circular simple.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSimpleCircularDeleteAt(
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
    const labels = listaCircularSimpleCode.removeAt.labels!;

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
                    CLEAR_HEAD: labels.CLEAR_HEAD,
                    CLEAR_TAIL: labels.CLEAR_TAIL
                }
            );
        } else if (!prevNodeId && nextNodeId) {
            // Eliminación al inicio de la lista
            const { remainingNodesData } = deletionData;
            const tailNodeId = remainingNodesData[remainingNodesData.length - 1].id;

            await animateDeleteAtHeadNonEmpty(
                svg,
                {
                    removalNodeId,
                    newHeadNodeId: nextNodeId,
                    tailNodeId,
                    tailIndex: remainingNodesData.length - 1,
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
                    LINK_TAIL_TO_HEAD: labels.LINK_TAIL_TO_HEAD
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
                        tailNodeId
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
                    newTailNodeId: prevNodeId,
                    headNodeId,
                    positions: deletionData.positions,
                    pathNodes: deletionData.remainingNodesData.slice(0, -1)

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
                    GET_PREV_NODE: labels.GET_PREV_NODE,
                    LINK_PREV_TO_HEAD: labels.LINK_PREV_TO_HEAD,
                    UPDATE_TAIL: labels.UPDATE_TAIL
                },
                {
                    INIT_TRAVERSAL: labels.INIT_TRAVERSAL,
                    WHILE_TRAVERSAL: labels.WHILE_TRAVERSAL,
                    ADVANCE_NODE: labels.ADVANCE_NODE,
                    DEC_POS: labels.DEC_POS,
                    RETURN_NODE_GETPOS: labels.RETURN_NODE_GETPOS
                }
            );
        } else {
            // Eliminación en posición intermedia
            const { deletePosition, remainingNodesData, remainingLinksData } = deletionData;

            // Grupos contenedores de los nodos y enlaces de la lista
            const nodesG = svg.select<SVGGElement>("g#nodes-layer");
            const linksG = svg.select<SVGGElement>("g#links-layer");

            // Grupo correspondiente al nodo a eliminar
            const removalNodeGroup = svg.select<SVGGElement>(`g#${removalNodeId}`);

            // Grupo correspondiente al actual enlace siguiente del nodo previo que apunta al nodo a eliminar
            const prevNodeCurrNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${prevNodeId}-${removalNodeId}-next`
            );

            // Grupo correspondiente al nuevo enlace siguiente del nodo previo que apunta al nodo siguiente del nodo a eliminar
            const prevNodeNewNextLinkGroup = svg.select<SVGPathElement>(
                `g#link-${prevNodeId}-${nextNodeId}-next path.node-link`
            );
            prevNodeNewNextLinkGroup.style("opacity", 0);

            // Grupo correspondiente al enlace siguiente del nodo a eliminar que apunta al nodo siguiente 
            const removeNodeNextLinkGroup = linksG.select<SVGGElement>(
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

            // Recorrido de los nodos hasta el nodo anterior al nodo a eliminar
            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.GET_NODE_AT_POS });
            await delay(500);

            const nodesToTraverse = remainingNodesData.slice(0, deletePosition);
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
            const finalRemoveNodePos = {
                x: removalNodePos.x,
                y: removalNodePos.y - 60,
            };

            // Forma final de los enlaces a eliminar
            const finalPrevNodeCurrNextLink = buildListPath(
                "next",
                deletionData.positions.get(prevNodeId!) ?? null,
                finalRemoveNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );

            const initialNextNodePos = {
                x: SVG_LINKED_LIST_VALUES.MARGIN_LEFT + (deletePosition + 1) * (SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH + SVG_LINKED_LIST_VALUES.SPACING),
                y: removalNodePos.y
            }
            const finalRemoveNodeNextLink = buildListPath(
                "next",
                finalRemoveNodePos,
                initialNextNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );

            // Promesas para el movimiento del nodo a eliminar y enlaces asociados a su posición final
            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.SAVE_REMOVED_NODE });
            const shiftPromises: Promise<void>[] = [];
            shiftPromises.push(
                removalNodeGroup
                    .transition()
                    .duration(1250)
                    .attr("transform", `translate(${finalRemoveNodePos.x}, ${finalRemoveNodePos.y})`)
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
                removeNodeNextLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1250)
                    .attr("d", finalRemoveNodeNextLink)
                    .end()
            );
            await Promise.all(shiftPromises);

            // Desconexión del enlace siguiente actual del nodo previo que apunta al nodo a eliminar
            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.LINK_PREV_TO_NEXT });
            await prevNodeCurrNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Establecimiento del nuevo enlace siguiente del nodo previo
            const initialNextPathToNextNode = buildListPath(
                "next",
                deletionData.positions.get(prevNodeId!) ?? null,
                initialNextNodePos,
                SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
            );
            await prevNodeNewNextLinkGroup
                .transition()
                .duration(1000)
                .attr("d", initialNextPathToNextNode)
                .style("opacity", 1)
                .end();

            // Desconexión del enlace siguiente del nodo a eliminar
            await removeNodeNextLinkGroup
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
                    tailIndicator: svg.select<SVGGElement>("g#tail-indicator"),
                    tailNodeId: remainingNodesData[remainingNodesData.length - 1].id
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

/**
 * Función encargada de animar el proceso de búsqueda de un nodo dentro de una lista circular.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param nodesG Selección D3 del grupo <g> que contiene los nodos de la lista enlazada.
 * @param targetElement Elemento a buscar en la lista.
 * @param nodesData Array de nodos (`ListNodeData<number>`) que componen la lista.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param labels Objeto de mapeo que asocia etiquetas semánticas con índices de línea numéricos usados en los eventos emitidos.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateCircularSearchElement(
    nodesG: Selection<SVGGElement, unknown, null, undefined>,
    targetElement: number,
    nodesData: ListNodeData<number>[],
    bus: EventBus,
    labels: {
        VALIDATE_EMPTY: number,
        RETURN_FALSE_EMPTY: number,
        INIT_TRAVERSAL: number,
        DO_SEARCH_LOOP: number,
        IF_MATCH: number,
        RETURN_TRUE_FOUND: number,
        ADVANCE_NODE: number,
        WHILE_NOT_HEAD: number,
        RETURN_FALSE_NOT_FOUND: number
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "search" });

        bus.emit("step:progress", { stepId: "search", lineIndex: labels.VALIDATE_EMPTY });
        await delay(500);

        if (nodesData.length === 0) {
            bus.emit("step:progress", { stepId: "search", lineIndex: labels.RETURN_FALSE_EMPTY });
            await delay(500);
        } else {
            bus.emit("step:progress", { stepId: "search", lineIndex: labels.INIT_TRAVERSAL });
            await delay(500);

            let found = false;
            for (const node of nodesData) {
                // Selección del grupo correspondiente al nodo actual
                const currRectElement = nodesG.select<SVGRectElement>(`g#${node.id} rect.node-container`);

                // Resaltado del nodo actual
                bus.emit("step:progress", { stepId: "search", lineIndex: labels.DO_SEARCH_LOOP });
                await currRectElement
                    .transition()
                    .duration(800)
                    .attr("stroke", "#f87171")
                    .attr("stroke-width", 3)
                    .end();

                bus.emit("step:progress", { stepId: "search", lineIndex: labels.IF_MATCH });
                await delay(600);

                if (node.value === targetElement) {
                    bus.emit("step:progress", { stepId: "search", lineIndex: labels.RETURN_TRUE_FOUND });

                    // Efecto de latido del nodo objetivo
                    const x = parseFloat(currRectElement.attr("x") || "0");
                    const y = parseFloat(currRectElement.attr("y") || "0");
                    const w = parseFloat(currRectElement.attr("width") || `${SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH}`);
                    const h = parseFloat(currRectElement.attr("height") || `${SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT}`);
                    const scale = 1.15;
                    const cx = x + w / 2;
                    const cy = y + h / 2;
                    const originalTransform = currRectElement.attr("transform") || "";

                    await currRectElement
                        .transition()
                        .duration(500)
                        .attr(
                            "transform",
                            `${originalTransform} translate(${cx},${cy}) scale(${scale}) translate(${-cx},${-cy})`
                        )
                        .transition()
                        .duration(500)
                        .attr("transform", originalTransform)
                        .end();

                    // Restablecimiento mas prolongado del estilo original del nodo
                    await currRectElement
                        .transition()
                        .duration(1000)
                        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                        .end();

                    found = true;
                    break;
                }

                // Restablecimiento de los bordes originales del nodo
                bus.emit("step:progress", { stepId: "search", lineIndex: labels.ADVANCE_NODE });
                await currRectElement
                    .transition()
                    .duration(800)
                    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                    .end();

                bus.emit("step:progress", { stepId: "search", lineIndex: labels.WHILE_NOT_HEAD });
                await delay(500);
            }

            if (!found) {
                bus.emit("step:progress", { stepId: "search", lineIndex: labels.RETURN_FALSE_NOT_FOUND });
                await delay(500);
            }
        }

        // Fin de la operación
        bus.emit("op:done", { op: "search" });
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
        LINK_SELF: number;
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

    // Grupos correspondientes a los indicadores de cabeza y cola
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");
    const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

    // Estado visual inicial de los nuevos elementos producto de la inserción
    newNodeGroup.style("opacity", 0);
    newNodeNextLinkGroup.style("opacity", 0);

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

    // Aparición del indicador de cola
    bus.emit("step:progress", { stepId, lineIndex: labels.SET_TAIL_EMPTY });
    await tailIndicatorGroup.transition().duration(800).style("opacity", 1).end();

    // Establecimiento del enlace circular siguiente del nuevo nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_SELF });
    await newNodeNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();
}

async function animateInsertAtHeadNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newNodeId: string;
        headNodeId: string;
        tailNodeId: string;
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
        LINK_TAIL_TO_NEW: number;
        UPDATE_HEAD: number;
    },
    repositionList: () => Promise<void>
) {
    // Nodos implicados en la inserción
    const { newNodeId, headNodeId, tailNodeId } = insertionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nuevo nodo
    const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);

    // Grupo correspondiente al enlace siguiente del nuevo nodo que apunta a la cabeza
    const newNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newNodeId}-${headNodeId}-next`
    );

    // Grupo correspondiente al actual enlace circular siguiente del nodo cola que apunta a la cabeza
    const tailNodeCurrNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${tailNodeId}-${headNodeId}-circular-next`
    );

    // Grupo correspondiente al nuevo enlace circular siguiente del nodo cola que apunta al nuevo nodo
    const tailNodeNewNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${tailNodeId}-${newNodeId}-circular-next`
    );

    // Grupo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    // Estado visual inicial de los nuevos elementos producto de la inserción
    newNodeGroup.style("opacity", 0);
    newNodeNextLinkGroup.style("opacity", 0);
    tailNodeNewNextLinkGroup.style("opacity", 0);

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

    // Desconexión del actual enlace circular siguiente del nodo cola
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_TAIL_TO_NEW });
    await tailNodeCurrNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Establecimiento del nuevo enlace circular siguiente del nodo cola
    await tailNodeNewNextLinkGroup
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
        tailNodeId: string;
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
        LINK_NEW_TO_HEAD: number,
        UPDATE_TAIL: number,
    }
) {
    // Nodos implicados en la inserción
    const { newNodeId, headNodeId, tailNodeId } = insertionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nuevo nodo
    const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);

    // Grupo correspondiente al actual enlace circular siguiente del nodo cola que apunta a la cabeza
    const tailNodeCurrNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${tailNodeId}-${headNodeId}-circular-next`
    );

    // Grupo correspondiente al nuevo enlace siguiente del nodo cola que apunta al nuevo nodo
    const tailNodeNewNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${tailNodeId}-${newNodeId}-next`
    );

    // Grupo correspondiente al enlace circular siguiente del nuevo nodo que apunta a la cabeza
    const newNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newNodeId}-${headNodeId}-circular-next`
    );

    // Grupo correspondiente al indicador de cola
    const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

    // Estado visual inicial de los nuevos elementos producto de la inserción
    newNodeGroup.style("opacity", 0);
    tailNodeNewNextLinkGroup.style("opacity", 0);
    newNodeNextLinkGroup.style("opacity", 0);

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

    // Desconexión del actual enlace circular siguiente del nodo cola 
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_TAIL_TO_NEW });
    await tailNodeCurrNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Aparición y posicionamiento del nuevo nodo
    const newNodePos = insertionData.positions.get(newNodeId)!;
    const initialNewNodePos = {
        x: newNodePos.x,
        y: newNodePos.y - 60,
    };
    await animateAppearListNode(newNodeGroup, initialNewNodePos, newNodePos);

    // Establecimiento del nuevo enlace siguiente del nodo cola
    await tailNodeNewNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Establecimiento del nuevo enlace circular siguiente del nuevo nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_NEW_TO_HEAD });
    await newNodeNextLinkGroup
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
    removalNodeId: string,
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
    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nodo a eliminar
    const removalNodeGroup = nodesG.select<SVGGElement>(`g#${removalNodeId}`);

    // Grupo correspondiente al enlace circular siguiente del nodo a eliminar que apunta a si mismo
    const removalNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${removalNodeId}-${removalNodeId}-circular-next`
    );

    // Grupos correspondientes a los indicadores de cabeza y cola
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");
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

    // Salida del indicador de cabeza y el enlace circular siguiente del nodo a eliminar 
    bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_HEAD });
    await headIndicatorGroup.transition().duration(800).style("opacity", 0).remove().end();
    await removalNodeNextLinkGroup
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove()
        .end();

    // Salida del indicador de cola y el nodo a eliminar 
    bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_TAIL });
    await tailIndicatorGroup.transition().duration(800).style("opacity", 0).remove().end();
    await removalNodeGroup.transition().duration(1000).style("opacity", 0).remove().end();
}

async function animateDeleteAtHeadNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        removalNodeId: string;
        newHeadNodeId: string;
        tailNodeId: string;
        tailIndex: number;
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
        LINK_TAIL_TO_HEAD: number;
    },
    repositionList: () => Promise<void>
) {
    // Nodos implicados en la eliminación
    const { removalNodeId, newHeadNodeId, tailNodeId, tailIndex } = deletionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nodo a eliminar
    const removalNodeGroup = nodesG.select<SVGGElement>(`g#${removalNodeId}`);

    // Grupo correspondiente al enlace siguiente del nodo a eliminar que apunta a la nueva cabeza
    const removalNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${removalNodeId}-${newHeadNodeId}-next`
    );

    // Grupo correspondiente al actual enlace circular siguiente del nodo cola que apunta al nodo a eliminar
    const tailNodeCurrNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${tailNodeId}-${removalNodeId}-circular-next`
    );

    // Grupo correspondiente al nuevo enlace circular siguiente del nodo cola que apunta a la nueva cabeza
    const tailNodeNewNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${tailNodeId}-${newHeadNodeId}-circular-next`
    );

    // Grupo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    // Estado visual de los nuevos elementos producto de la eliminación
    tailNodeNewNextLinkGroup.style("opacity", 0);

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
    const removalNodePos = deletionData.positions.get(removalNodeId)!;
    const initialNewHeadPos = {
        x: SVG_LINKED_LIST_VALUES.MARGIN_LEFT + (1) * (SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH + SVG_LINKED_LIST_VALUES.SPACING),
        y: removalNodePos.y
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

    // Desconexión del actual enlace circular siguiente del nodo cola
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_TAIL_TO_HEAD });
    await tailNodeCurrNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Forma inicial del nuevo enlace circular del nodo cola
    const initialTailPos = {
        x: SVG_LINKED_LIST_VALUES.MARGIN_LEFT + (tailIndex) * (SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH + SVG_LINKED_LIST_VALUES.SPACING),
        y: removalNodePos.y
    }

    const initialTailNodeNewNextLink = buildListPath(
        "circular-next",
        initialTailPos,
        initialNewHeadPos,
        SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
        SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
    )
    tailNodeNewNextLinkGroup.select("path.node-link")
        .attr("d", initialTailNodeNewNextLink);

    // Establecimiento del nuevo enlace circular siguiente del nodo cola
    await tailNodeNewNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Desconexión del enlace siguiente del nodo a eliminar
    await removalNodeNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Posición de animación final del nodo a eliminar
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
        newTailNodeId: string;
        headNodeId: string;
        pathNodes: ListNodeData<number>[];
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
        GET_PREV_NODE: number;
        LINK_PREV_TO_HEAD: number;
        UPDATE_TAIL: number;
    },
    getPosLabels: {
        INIT_TRAVERSAL: number,
        WHILE_TRAVERSAL: number,
        ADVANCE_NODE: number,
        DEC_POS: number,
        RETURN_NODE_GETPOS: number
    }
) {
    // Nodos implicados en la eliminación
    const { removalNodeId, newTailNodeId, headNodeId } = deletionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nodo a eliminar
    const removalNodeGroup = nodesG.select<SVGGElement>(`g#${removalNodeId}`);

    // Grupo correspondiente al enlace circular siguiente del nodo a eliminar que apunta a la cabeza
    const removalNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${removalNodeId}-${headNodeId}-circular-next`
    );

    // Grupo correspondiente al actual enlace siguiente del nuevo nodo cola que apunta al nodo a eliminar
    const newTailNodeCurrNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newTailNodeId}-${removalNodeId}-next`
    );

    // Grupo correspondiente al nuevo enlace circular siguiente del nuevo nodo cola que apunta a la cabeza
    const newTailNodeNewNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newTailNodeId}-${headNodeId}-circular-next`
    );

    // Grupo correspondiente al indicador de cola
    const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

    // Estado visual inicial de los nuevos elementos producto de la eliminación
    newTailNodeNewNextLinkGroup.style("opacity", 0);

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

    bus.emit("step:progress", { stepId, lineIndex: labels.GET_PREV_NODE });
    await delay(500);

    // Recorrido de los nodos hasta el nuevo último nodo
    await animateGetListNodePos(nodesG, deletionData.pathNodes, bus, getPosLabels, stepId);

    bus.emit("step:progress", { stepId, lineIndex: labels.GET_PREV_NODE });
    await delay(400);

    // Desconexión del actual enlace siguiente del nuevo nodo cola
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_PREV_TO_HEAD });
    await newTailNodeCurrNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Establecimiento del nuevo enlace circular siguiente del nuevo nodo cola
    await newTailNodeNewNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Posicionamiento del indicador de cola a la posición del nuevo nodo cola
    bus.emit("step:progress", { stepId, lineIndex: labels.UPDATE_TAIL });
    const newTailNodePos = deletionData.positions.get(newTailNodeId)!;
    await tailIndicatorGroup
        .transition()
        .duration(1500)
        .attr("transform", () => {
            const finalX =
                newTailNodePos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
            const finalY = newTailNodePos.y;
            return `translate(${finalX}, ${finalY})`;
        })
        .end();

    // Desconexión del enlace circular siguiente del nodo a eliminar 
    await removalNodeNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Posición de animación final del nodo a eliminar
    const removalNodePos = deletionData.positions.get(removalNodeId)!;
    const finalRemovalPos = {
        x: removalNodePos.x,
        y: removalNodePos.y + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8,
    };

    // Salida del nodo a eliminar
    await animateExitListNode(removalNodeGroup, finalRemovalPos);
}