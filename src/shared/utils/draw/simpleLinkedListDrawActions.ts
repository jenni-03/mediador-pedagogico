import { Dispatch, SetStateAction } from "react";
import { Selection } from "d3";
import { ListLinkData, ListNodeData } from "../../../domain/utils/types";
import { repositionList } from "./drawActionsUtilities";
import { buildListPath } from "../../../domain/utils/listUtils";
import { SVG_LINKED_LIST_VALUES, SVG_STYLE_VALUES } from "../../../domain/constants/consts";
import { type EventBus } from "../../events/eventBus";
import { getListaSimplementeEnlazadaCode } from "../../../domain/constants/pseudocode/listaSimplementeEnlazadaCode";
import { delay } from "../../../domain/utils/simulatorUtils";

const listaSimpleCode = getListaSimplementeEnlazadaCode();

/**
 * Función encargada de animar el proceso de inserción de un nuevo nodo al inicio de una lista simple.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSimpleInsertFirst(
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
    const labels = listaSimpleCode.insertFirst.labels!;

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
                    ASSIGN_HEAD_EMPTY: labels.ASSIGN_HEAD_EMPTY
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
                    ASSIGN_NEW_HEAD: labels.ASSIGN_NEW_HEAD
                },
                () => repositionList(
                    svg,
                    insertionData.nodesData,
                    insertionData.linksData,
                    insertionData.positions,
                    {
                        headIndicator: svg.select<SVGGElement>("g#head-indicator"),
                        headNodeId: currHeadNodeId,
                        tailIndicator: null,
                        tailNodeId: null,
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
 * Función encargada de animar el proceso de inserción de un nuevo nodo al final de una lista simple.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSimpleInsertLast(
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
    const labels = listaSimpleCode.insertLast.labels!;

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
                    ASSIGN_HEAD_EMPTY: labels.ASSIGN_NEW_HEAD
                }
            );
        } else {
            await animateInsertAtTailNonEmpty(
                svg,
                {
                    newNodeId: newLastNodeId,
                    lastNodeId: currLastNodeId,
                    positions: insertionData.positions,
                    pathNodes: insertionData.nodesData.slice(0, -1)
                },
                bus,
                "insertLast",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    ELSE_EMPTY: labels.ELSE_EMPTY,
                    GET_LAST_NODE: labels.GET_LAST_NODE,
                    LINK_NODE_END: labels.LINK_NODE_END
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
 * Función encargada de animar el proceso de inserción de un nuevo nodo en una posición especifica de una lista simple.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSimpleInsertAt(
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
    const labels = listaSimpleCode.insertAt.labels!;

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
                    VALIDATE_EMPTY: labels.VALIDATE_HEAD,
                    LINK_NEW_TO_HEAD: labels.LINK_NEW_TO_HEAD,
                    ASSIGN_HEAD_EMPTY: labels.ASSIGN_NEW_HEAD
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
                    VALIDATE_EMPTY: labels.VALIDATE_HEAD,
                    LINK_NEW_TO_HEAD: labels.LINK_NEW_TO_HEAD,
                    ASSIGN_NEW_HEAD: labels.ASSIGN_NEW_HEAD
                },
                () => repositionList(
                    svg,
                    insertionData.nodesData,
                    insertionData.linksData,
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
            await animateInsertAtTailNonEmpty(
                svg,
                {
                    newNodeId,
                    lastNodeId: prevNodeId,
                    positions: insertionData.positions,
                    pathNodes: insertionData.nodesData.slice(0, -1)
                },
                bus,
                "insertAt",
                {
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_HEAD,
                    ELSE_EMPTY: labels.ELSE_GENERAL,
                    GET_LAST_NODE: labels.GET_PREV_NODE,
                    LINK_NODE_END: labels.LINK_NEW_TO_NEXT,
                    LINK_PREV_TO_NEW: labels.LINK_PREV_TO_NEW
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

            const newNodeNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${newNodeId}-${nextNodeId}-next`
            );
            newNodeNextLinkGroup.style("opacity", 0);

            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.VALIDATE_POSITION });
            await delay(500);

            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.CREATE_NODE });
            await delay(500);

            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.VALIDATE_HEAD });
            await delay(500);

            bus.emit("step:progress", { stepId: "insertAt", lineIndex: labels.ELSE_GENERAL });
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
            const initialNewNodePos = { x: newNodePos.x, y: newNodePos.y - 75 };

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

            // Aparición y posicionamiento inicial del nuevo nodo
            await animateAppearListNode(newNodeGroup, initialNewNodePos);

            // Establecimiento del enlace siguiente del nuevo nodo
            await newNodeNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();

            // Desconexión del actual enlace siguiente entre el nodo previo y siguiente al nuevo nodo
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
                insertionData.positions.get(prevNodeId!) ?? null,
                newNodePos,
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
 * Función encargada de animar el proceso de eliminación de un nodo al inicio de una lista simple.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSimpleDeleteFirst(
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
    const labels = listaSimpleCode.removeFirst.labels!;

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
                    SAVE_HEAD: labels.SAVE_HEAD,
                    CLEAR_HEAD: labels.MOVE_HEAD
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
                    SAVE_HEAD: labels.SAVE_HEAD,
                    MOVE_HEAD: labels.MOVE_HEAD
                },
                () => repositionList(
                    svg,
                    deletionData.remainingNodesData,
                    deletionData.remainingLinksData,
                    deletionData.positions,
                    {
                        headIndicator: null,
                        headNodeId: null,
                        tailIndicator: null,
                        tailNodeId: null,
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
 * Función encargada de animar el proceso de eliminación de un nodo al final de una lista simple.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSimpleDeleteLast(
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
    const labels = listaSimpleCode.removeLast.labels!;

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
                    DECLARE_REMOVED_NODE: labels.DECLARE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    SAVE_HEAD: labels.SAVE_HEAD,
                    CLEAR_HEAD: labels.CLEAR_HEAD
                }
            );
        } else {
            await animateDeleteAtTailNonEmpty(
                svg,
                {
                    removalNodeId: currLastNodeId,
                    newLastNodeId,
                    positions: deletionData.positions,
                    pathNodes: deletionData.remainingNodesData
                },
                bus,
                "removeLast",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    DECLARE_REMOVED_NODE: labels.DECLARE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_SINGLE_NODE,
                    ELSE_SINGLE_NODE: labels.ELSE_SINGLE_NODE,
                    GET_PREV_NODE: labels.GET_PREV_NODE,
                    SAVE_LAST_NODE: labels.SAVE_LAST_NODE,
                    UNLINK_LAST_NODE: labels.UNLINK_LAST_NODE
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
        deletionData.positions.delete(currLastNodeId);

        // Fin de la operación
        bus.emit("op:done", { op: "removeLast" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de eliminación de un nodo en una posición especifica de una lista simple.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param deletionData Objeto con información de la lista necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSimpleDeleteAt(
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
    const labels = listaSimpleCode.removeAt.labels!;

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
                    VALIDATE_HEAD: labels.VALIDATE_HEAD,
                    SAVE_HEAD: labels.SAVE_HEAD,
                    CLEAR_HEAD: labels.MOVE_HEAD
                }
            );
        } else if (!prevNodeId && nextNodeId) {
            // Eliminación al inicio de la lista
            await animateDeleteAtHeadNonEmpty(
                svg,
                {
                    removalNodeId,
                    newHeadNodeId: nextNodeId,
                    positions: deletionData.positions
                },
                bus,
                "removeAt",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    DECLARE_REMOVED_NODE: labels.DECLARE_REMOVED_NODE,
                    VALIDATE_HEAD: labels.VALIDATE_HEAD,
                    SAVE_HEAD: labels.SAVE_HEAD,
                    MOVE_HEAD: labels.MOVE_HEAD
                },
                () => repositionList(
                    svg,
                    deletionData.remainingNodesData,
                    deletionData.remainingLinksData,
                    deletionData.positions,
                    {
                        headIndicator: null,
                        headNodeId: null,
                        tailIndicator: null,
                        tailNodeId: null,
                    }
                )
            );
        } else if (prevNodeId && !nextNodeId) {
            // Eliminación al final de la lista
            await animateDeleteAtTailNonEmpty(
                svg,
                {
                    removalNodeId,
                    newLastNodeId: prevNodeId,
                    positions: deletionData.positions,
                    pathNodes: deletionData.remainingNodesData.slice(0, -1)

                },
                bus,
                "removeAt",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    DECLARE_REMOVED_NODE: labels.DECLARE_REMOVED_NODE,
                    VALIDATE_SINGLE_NODE: labels.VALIDATE_HEAD,
                    ELSE_SINGLE_NODE: labels.ELSE_REMOVE,
                    GET_PREV_NODE: labels.GET_PREV_NODE,
                    SAVE_LAST_NODE: labels.SAVE_TARGET_NODE,
                    UNLINK_LAST_NODE: labels.BYPASS_NODE
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
            const removeNodeGroup = nodesG.select<SVGGElement>(`g#${removalNodeId}`);

            // Grupo correspondiente al actual enlace siguiente del nodo previo que apunta al nodo a eliminar
            const prevNodeCurrNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${prevNodeId}-${removalNodeId}-next`
            );

            // Grupo correspondiente al nuevo enlace siguiente del nodo previo que apunta al nodo siguiente del nodo a eliminar
            const prevNodeNewNextLinkGroup = linksG.select<SVGPathElement>(
                `g#link-${prevNodeId}-${nextNodeId}-next path.node-link`
            );
            prevNodeNewNextLinkGroup.style("opacity", 0);

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

            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.VALIDATE_HEAD });
            await delay(500);

            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.ELSE_REMOVE });
            await delay(500);

            // Recorrido de los nodos hasta el nodo anterior al nodo a eliminar
            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.GET_PREV_NODE });
            await delay(500);

            const nodesToTraverse = remainingNodesData.slice(0, deletePosition);
            await animateGetListNodePos(nodesG, nodesToTraverse, bus, {
                INIT_TRAVERSAL: labels.INIT_TRAVERSAL,
                WHILE_TRAVERSAL: labels.WHILE_TRAVERSAL,
                ADVANCE_NODE: labels.ADVANCE_NODE,
                DEC_POS: labels.DEC_POS,
                RETURN_NODE_GETPOS: labels.RETURN_NODE_GETPOS
            }, "removeAt");

            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.GET_PREV_NODE });
            await delay(400);

            // Posición de animación final del nodo a eliminar
            const removalNodePos = deletionData.positions.get(removalNodeId)!;
            const finalRemovalNodePos = {
                x: removalNodePos.x,
                y: removalNodePos.y - 75,
            };

            // Forma final de los enlaces a eliminar
            const finalPrevNodeCurrNextLink = buildListPath(
                "next",
                deletionData.positions.get(prevNodeId!) ?? null,
                finalRemovalNodePos,
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

            // Promesas para el movimiento del nodo a eliminar y enlaces asociados a su posición final
            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.SAVE_TARGET_NODE });
            const shiftPromises: Promise<void>[] = [];
            shiftPromises.push(
                removeNodeGroup
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
                removalNodeNextLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1250)
                    .attr("d", finalRemovalNodeNextLink)
                    .end()
            );
            await Promise.all(shiftPromises);

            // Desconexión del actual enlace siguiente del nodo previo que apunta al nodo a eliminar
            bus.emit("step:progress", { stepId: "removeAt", lineIndex: labels.BYPASS_NODE });
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
            await removalNodeNextLinkGroup
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Salida del nodo a eliminar
            await animateExitListNode(removeNodeGroup);

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

/**
 * Función encargada de animar el proceso de búsqueda de un nodo dentro de la lista.
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
export async function animateSearchElement(
    nodesG: Selection<SVGGElement, unknown, null, undefined>,
    targetElement: number,
    nodesData: ListNodeData<number>[],
    bus: EventBus,
    labels: {
        INIT_TRAVERSAL: number,
        WHILE_TRAVERSAL: number,
        IF_MATCH: number,
        RETURN_TRUE: number,
        ADVANCE_NODE: number,
        RETURN_FALSE: number
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "search" });

        bus.emit("step:progress", { stepId: "search", lineIndex: labels.INIT_TRAVERSAL });
        await delay(500);

        let found = false;
        for (const node of nodesData) {
            // Selección del grupo correspondiente al nodo actual
            const currRectElement = nodesG.select<SVGRectElement>(`g#${node.id} rect.node-container`);

            // Resaltado suave del nodo actual
            bus.emit("step:progress", { stepId: "search", lineIndex: labels.WHILE_TRAVERSAL });
            await currRectElement
                .transition()
                .duration(800)
                .attr("stroke", "#f87171")
                .attr("stroke-width", 3)
                .end();

            bus.emit("step:progress", { stepId: "search", lineIndex: labels.IF_MATCH });
            await delay(600);

            if (node.value === targetElement) {
                bus.emit("step:progress", { stepId: "search", lineIndex: labels.RETURN_TRUE });

                // Efecto de latido
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
        }

        if (!found) {
            bus.emit("step:progress", { stepId: "search", lineIndex: labels.WHILE_TRAVERSAL });
            await delay(500);

            bus.emit("step:progress", { stepId: "search", lineIndex: labels.RETURN_FALSE });
            await delay(500);
        }

        // Fin de la operación
        bus.emit("op:done", { op: "search" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el resaltado secuencial de un conjunto de nodos en una lista enlazada.
 * Cada nodo del camino se resalta temporalmente mediante una transición de trazo
 * y luego se restaura a su estilo original, excepto el último nodo, que permanece resaltado.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param nodesLayer Selección D3 del grupo <g> que contiene los nodos de la lista enlazada.
 * @param nodePath Array ordenado de nodos (`ListNodeData<number>`) que define el camino a recorrer.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param labels Objeto de mapeo que asocia etiquetas semánticas con índices de línea numéricos usados en los eventos emitidos.
 * @param stepId Identificador del paso actual; reenviado en los eventos de progreso emitidos.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateGetListNodePos(
    nodesLayer: Selection<SVGGElement, unknown, null, undefined>,
    nodePath: ListNodeData<number>[],
    bus: EventBus,
    labels: {
        INIT_TRAVERSAL: number,
        WHILE_TRAVERSAL: number,
        ADVANCE_NODE: number,
        DEC_POS: number,
        RETURN_NODE_GETPOS: number
    },
    stepId: string
) {
    bus.emit("step:progress", { stepId, lineIndex: labels.INIT_TRAVERSAL });
    await delay(500);

    for (let i = 0; i < nodePath.length - 1; i++) {
        // Selección del grupo correspondiente al nodo actual
        const currRectElement = nodesLayer.select<SVGRectElement>(`g#${nodePath[i].id} rect.node-container`);

        // Resaltado del nodo actual
        bus.emit("step:progress", { stepId, lineIndex: labels.WHILE_TRAVERSAL });
        await currRectElement
            .transition()
            .duration(800)
            .attr("stroke", "#f87171")
            .attr("stroke-width", 3)
            .end();

        // Restablecimiento del borde original del nodo actual (antes de pasar al sig. nodo)
        bus.emit("step:progress", { stepId, lineIndex: labels.ADVANCE_NODE });
        await currRectElement
            .transition()
            .duration(800)
            .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
            .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
            .end();

        bus.emit("step:progress", { stepId, lineIndex: labels.DEC_POS });
        await delay(500);
    }
    bus.emit("step:progress", { stepId, lineIndex: labels.WHILE_TRAVERSAL });
    await delay(500);

    // Resaltado final del elemento objetivo
    const targetElement = nodesLayer.select<SVGRectElement>(`g#${nodePath[nodePath.length - 1].id} rect.node-container`);
    bus.emit("step:progress", { stepId, lineIndex: labels.RETURN_NODE_GETPOS });
    await targetElement
        .transition()
        .duration(800)
        .attr("stroke", "#f87171")
        .attr("stroke-width", 3)
        .end();
}

/**
 * Función encargada de animar la aparición de un nodo en una lista enlazada, con opción de desplazamiento.
 * El nodo se posiciona inicialmente en las coordenadas `initialPos` y se vuelve visible mediante una transición de opacidad.
 * Si se proporciona `finalPos`, el nodo se desplaza suavemente hacia esa posición.
 * @param nodeGroup Selección D3 del grupo <g> que representa el nodo a animar.
 * @param initialPos Coordenadas `{ x, y }` donde se posiciona inicialmente el nodo antes de la animación.
 * @param finalPos Coordenadas `{ x, y }` opcionales que definen la posición final del nodo. Si se omiten, no hay desplazamiento.
 * @returns Promise<`void`>. Se resuelve cuando la animación ha finalizado.
 */
export async function animateAppearListNode(
    nodeGroup: Selection<SVGGElement, unknown, null, undefined>,
    initialPos: { x: number; y: number; },
    finalPos?: { x: number; y: number; }
) {
    // Posicionamiento inicial del nodo
    nodeGroup.attr(
        "transform",
        `translate(${initialPos.x}, ${initialPos.y})`
    );

    // Desplazamiento del nodo hacia su posición final
    if (finalPos) {
        await nodeGroup
            .transition()
            .duration(1500)
            .style("opacity", 1)
            .attr(
                "transform",
                `translate(${finalPos.x}, ${finalPos.y})`
            )
            .end();
    } else {
        await nodeGroup.transition().duration(1000).style("opacity", 1).end();
    }
}

/**
 * Función encargada de animar la salida de un nodo en una lista enlazada, con opción de desplazamiento.
 * El nodo se vuelve invisible mediante una transición de opacidad. Si se proporciona `finalPos`, el nodo se desplaza suavemente hacia esa posición antes de ser eliminado.
 * @param nodeGroup Selección D3 del grupo <g> que representa el nodo a animar.
 * @param finalPos Coordenadas `{ x, y }` opcionales que definen la posición de salida del nodo. Si se omiten, no hay desplazamiento.
 * @returns Promise<`void`>. Se resuelve cuando la animación ha finalizado.
 */
export async function animateExitListNode(
    nodeGroup: Selection<SVGGElement, unknown, null, undefined>,
    finalPos?: { x: number; y: number; }
) {
    // Desplazamiento del nodo hacia su posición final
    if (finalPos) {
        await nodeGroup
            .transition()
            .duration(1500)
            .attr(
                "transform",
                `translate(${finalPos.x}, ${finalPos.y})`
            )
            .style("opacity", 0)
            .remove()
            .end();
    } else {
        await nodeGroup.transition().duration(1000).style("opacity", 0).remove().end();
    }
}

async function animateInsertInEmptyList(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    bus: EventBus,
    newNodeId: string,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number;
        LINK_NEW_TO_HEAD?: number;
        CREATE_NODE: number;
        VALIDATE_EMPTY: number;
        ASSIGN_HEAD_EMPTY: number;
    }
) {
    // Grupos contenedor de los nodos de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");

    // Grupo correspondiente al nuevo nodo
    const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);

    // Grupo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

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

    if (labels.LINK_NEW_TO_HEAD) {
        bus.emit("step:progress", { stepId, lineIndex: labels.LINK_NEW_TO_HEAD });
        await delay(500);
    }

    // Aparición del nuevo nodo (lista vacía) y del indicador de cabeza
    bus.emit("step:progress", { stepId, lineIndex: labels.ASSIGN_HEAD_EMPTY });
    await newNodeGroup.transition().duration(1000).style("opacity", 1).end();
    await headIndicatorGroup.transition().duration(800).style("opacity", 1).end();
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
        ELSE_EMPTY?: number;
        CREATE_NODE: number;
        VALIDATE_EMPTY: number;
        LINK_NEW_TO_HEAD: number;
        ASSIGN_NEW_HEAD: number;
    },
    repositionList: () => Promise<void>
) {
    // Nodos implicados en la inserción
    const { newNodeId, headNodeId } = insertionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nuevo nodo
    const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);

    // Grupo correspondiente al enlace siguiente del nuevo nodo que apunta a la cabeza
    const newNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newNodeId}-${headNodeId}-next`
    );

    // Grupo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

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

    if (labels.ELSE_EMPTY) {
        bus.emit("step:progress", { stepId, lineIndex: labels.ELSE_EMPTY });
        await delay(500);
    }

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

    // Posicionamiento del indicador de cabeza a la nueva cabeza de la lista
    bus.emit("step:progress", { stepId, lineIndex: labels.ASSIGN_NEW_HEAD });
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
        pathNodes: ListNodeData<number>[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number;
        LINK_PREV_TO_NEW?: number;
        CREATE_NODE: number;
        VALIDATE_EMPTY: number;
        ELSE_EMPTY: number;
        GET_LAST_NODE: number;
        LINK_NODE_END: number;
    },
    getPosLabels: {
        INIT_TRAVERSAL: number,
        WHILE_TRAVERSAL: number,
        ADVANCE_NODE: number,
        DEC_POS: number,
        RETURN_NODE_GETPOS: number
    }
) {
    // Nodos implicados en la inserción
    const { newNodeId, lastNodeId } = insertionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nuevo nodo
    const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);

    // Grupo correspondiente al enlace siguiente del último nodo que apunta al nuevo nodo
    const lastNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${lastNodeId}-${newNodeId}-next`
    );

    // Estado visual inicial de los nuevos elementos producto de la inserción
    newNodeGroup.style("opacity", 0);
    lastNodeNextLinkGroup.style("opacity", 0);

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

    bus.emit("step:progress", { stepId, lineIndex: labels.GET_LAST_NODE });
    await delay(500);

    // Recorrido de los nodos hasta la posición de inserción (último nodo actual)
    await animateGetListNodePos(nodesG, insertionData.pathNodes, bus, getPosLabels, stepId);

    bus.emit("step:progress", { stepId, lineIndex: labels.GET_LAST_NODE });
    await delay(400);

    // Aparición y posicionamiento del nuevo nodo
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_NODE_END });
    const newNodePos = insertionData.positions.get(newNodeId)!;
    const initialNewNodePos = {
        x: newNodePos.x,
        y: newNodePos.y - 60,
    };
    await animateAppearListNode(newNodeGroup, initialNewNodePos, newNodePos);

    // Establecimiento del enlace siguiente del último nodo
    if (labels.LINK_PREV_TO_NEW) bus.emit("step:progress", { stepId, lineIndex: labels.LINK_PREV_TO_NEW });
    await lastNodeNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();
}

async function animateDeleteOneElementList(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    bus: EventBus,
    currHeadNodeId: string,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number;
        DECLARE_REMOVED_NODE?: number;
        VALIDATE_SINGLE_NODE?: number;
        VALIDATE_HEAD?: number;
        VALIDATE_EMPTY: number;
        SAVE_HEAD: number;
        CLEAR_HEAD: number;
    }
) {
    // Grupos contenedor de los nodos de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");

    // Grupo correspondiente al nodo a eliminar
    const currHeadNodeGroup = nodesG.select<SVGGElement>(`g#${currHeadNodeId}`);

    // Grupo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_EMPTY });
    await delay(500);

    if (labels.VALIDATE_POSITION) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_POSITION });
        await delay(500);
    }

    if (labels.DECLARE_REMOVED_NODE) {
        bus.emit("step:progress", { stepId, lineIndex: labels.DECLARE_REMOVED_NODE });
        await delay(400);
    }

    const validateHeadLabel = labels.VALIDATE_HEAD ?? labels.VALIDATE_SINGLE_NODE ?? null;
    if (validateHeadLabel) {
        bus.emit("step:progress", { stepId, lineIndex: validateHeadLabel });
        await delay(500);
    }

    bus.emit("step:progress", { stepId, lineIndex: labels.SAVE_HEAD });
    await delay(500);

    bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_HEAD });
    await headIndicatorGroup.transition().duration(800).style("opacity", 0).remove().end();
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
        DECLARE_REMOVED_NODE?: number;
        VALIDATE_EMPTY: number;
        VALIDATE_HEAD?: number;
        SAVE_HEAD: number;
        MOVE_HEAD: number;
    },
    repositionList: () => Promise<void>
) {
    // Nodos implicados en la eliminación
    const { removalNodeId, newHeadNodeId } = deletionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nodo a eliminar
    const removalNodeGroup = nodesG.select<SVGGElement>(`g#${removalNodeId}`);

    // Grupo correspondiente al enlace siguiente del nodo a eliminar que apunta a la nueva cabeza
    const removalNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${removalNodeId}-${newHeadNodeId}-next`
    );

    // Grupo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_EMPTY });
    await delay(500);

    if (labels.VALIDATE_POSITION) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_POSITION });
        await delay(500);
    }

    if (labels.DECLARE_REMOVED_NODE) {
        bus.emit("step:progress", { stepId, lineIndex: labels.DECLARE_REMOVED_NODE });
        await delay(500);
    }

    if (labels.VALIDATE_HEAD) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_HEAD });
        await delay(500);
    }

    bus.emit("step:progress", { stepId, lineIndex: labels.SAVE_HEAD });
    await delay(500);

    // Salida del indicador de cabeza
    bus.emit("step:progress", { stepId, lineIndex: labels.MOVE_HEAD });
    await headIndicatorGroup
        .transition()
        .duration(600)
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
    const removalNodePos = deletionData.positions.get(removalNodeId)!;
    const finalRemovalNodePos = {
        x: removalNodePos.x,
        y: removalNodePos.y + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8,
    };
    await animateExitListNode(removalNodeGroup, finalRemovalNodePos);

    // Reposicionamiento de los elementos restantes de la lista a su posición final
    await repositionList();

    // Entrada del indicador de cabeza (ahora apuntando a la nueva cabeza de la lista)
    await headIndicatorGroup
        .transition()
        .duration(600)
        .style("opacity", 1)
        .end();
}

async function animateDeleteAtTailNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        removalNodeId: string;
        newLastNodeId: string;
        pathNodes: ListNodeData<number>[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number;
        VALIDATE_EMPTY: number;
        DECLARE_REMOVED_NODE: number;
        VALIDATE_SINGLE_NODE: number;
        ELSE_SINGLE_NODE: number;
        GET_PREV_NODE: number;
        SAVE_LAST_NODE: number;
        UNLINK_LAST_NODE: number;
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
    const { removalNodeId, newLastNodeId } = deletionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("g#nodes-layer");
    const linksG = svg.select<SVGGElement>("g#links-layer");

    // Grupo correspondiente al nodo a eliminar
    const removalNodeGroup = nodesG.select<SVGGElement>(`g#${removalNodeId}`);

    // Grupo correspondiente al enlace siguiente del nuevo último nodo que apunta al nodo a eliminar
    const newLastNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newLastNodeId}-${removalNodeId}-next`
    );

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

    bus.emit("step:progress", { stepId, lineIndex: labels.GET_PREV_NODE });
    await delay(500);

    // Recorrido de los nodos hasta el nuevo último nodo
    await animateGetListNodePos(nodesG, deletionData.pathNodes, bus, getPosLabels, stepId);

    bus.emit("step:progress", { stepId, lineIndex: labels.GET_PREV_NODE });
    await delay(400);

    bus.emit("step:progress", { stepId, lineIndex: labels.SAVE_LAST_NODE });
    await delay(500);

    // Posición de animación final del nodo a eliminar
    bus.emit("step:progress", { stepId, lineIndex: labels.UNLINK_LAST_NODE });
    const removalNodePos = deletionData.positions.get(removalNodeId)!;
    const finalRemoveNodePos = {
        x: removalNodePos.x,
        y: removalNodePos.y + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8,
    };

    // Desconexión del enlace siguiente del nuevo último nodo
    await newLastNodeNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Salida del nodo a eliminar
    await animateExitListNode(removalNodeGroup, finalRemoveNodePos);
}