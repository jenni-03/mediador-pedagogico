import { Dispatch, SetStateAction } from "react";
import { Selection } from "d3";
import { ListLinkData, ListNodeData } from "../../../types";
import { repositionList } from "./drawActionsUtilities";
import { buildListPath } from "../listUtils";
import { SVG_LINKED_LIST_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { type EventBus } from "../../events/eventBus";
import { getListaSimplementeEnlazadaCode } from "../../constants/pseudocode/listaSimplementeEnlazadaCode";
import { delay } from "../simulatorUtils";

const listaSimpleCode = getListaSimplementeEnlazadaCode();

/**
 * Función encargada de animar el proceso de inserción de un nuevo nodo al inicio de la lista simple.
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
                    newHeadNodeId,
                    currHeadNodeId,
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
 * Función encargada de animar el proceso de inserción de un nuevo nodo al final de la lista simple.
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
                "insertFirst",
                {
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    ASSIGN_NEW_HEAD: labels.ASSIGN_NEW_HEAD
                }
            );
        } else {
            await animateInsertAtTailNonEmpty(
                svg,
                {
                    newLastNodeId,
                    currLastNodeId,
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
 * Función encargada de animar el proceso de inserción de un nuevo nodo en una posición especifica de la lista simple.
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
                    VALIDATE_HEAD: labels.VALIDATE_HEAD,
                    LINK_NEW_TO_HEAD: labels.LINK_NEW_TO_HEAD,
                    ASSIGN_NEW_HEAD: labels.ASSIGN_NEW_HEAD
                }
            );
        } else if (!prevNodeId && nextNodeId) {
            // Inserción al inicio
            await animateInsertAtHeadNonEmpty(
                svg,
                {
                    newHeadNodeId: newNodeId,
                    currHeadNodeId: nextNodeId,
                    positions: insertionData.positions
                },
                bus,
                "insertAt",
                {
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_HEAD: labels.VALIDATE_HEAD,
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
                    newLastNodeId: newNodeId,
                    currLastNodeId: prevNodeId,
                    positions: insertionData.positions,
                    pathNodes: insertionData.nodesData.slice(0, -1)
                },
                bus,
                "insertLast",
                {
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    CREATE_NODE: labels.CREATE_NODE,
                    VALIDATE_HEAD: labels.VALIDATE_HEAD,
                    ELSE_GENERAL: labels.ELSE_GENERAL,
                    GET_PREV_NODE: labels.GET_PREV_NODE,
                    LINK_NEW_TO_NEXT: labels.LINK_NEW_TO_NEXT,
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
            const nodesG = svg.select<SVGGElement>("#nodes-layer");
            const linksG = svg.select<SVGGElement>("#links-layer");

            // Grupos correspondientes a los elementos producto de la inserción
            const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);
            newNodeGroup.style("opacity", 0);

            const prevNodeNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${prevNodeId}-${newNodeId}-next`
            );
            prevNodeNextLinkGroup.style("opacity", 0);

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
                ?.select("path.node-link")
                .attr("d", initialPrevNodeNextLink);

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

            // Desconexión del enlace actual entre el nodo previo y el siguiente al nuevo nodo
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
            const finalNewNodeNextLink = buildListPath(
                "next",
                finalNewNodePos,
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
 * Función encargada de animar el proceso de eliminación de un nodo al inicio de la lista simple.
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
                    MOVE_HEAD: labels.MOVE_HEAD
                }
            );
        } else {
            await animateDeleteAtHeadNonEmpty(
                svg,
                {
                    currHeadNodeId,
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
 * Función encargada de animar el proceso de eliminación de un nodo al final de la lista simple.
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
                    currLastNodeId,
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
 * Función encargada de animar el proceso de eliminación de un nodo en una posición especifica de la lista simple.
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
    const labels = listaSimpleCode.removeAt.labels!;

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
                "removeFirst",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    DECLARE_REMOVED_NODE: labels.DECLARE_REMOVED_NODE,
                    VALIDATE_HEAD: labels.VALIDATE_HEAD,
                    SAVE_HEAD: labels.SAVE_HEAD,
                    MOVE_HEAD: labels.MOVE_HEAD
                }
            );
        } else if (!prevNodeId && nextNodeId) {
            // Eliminación al inicio de la lista
            await animateDeleteAtHeadNonEmpty(
                svg,
                {
                    currHeadNodeId: nodeToRemoveId,
                    newHeadNodeId: nextNodeId,
                    positions: deletionData.positions
                },
                bus,
                "removeFirst",
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
                    currLastNodeId: nodeToRemoveId,
                    newLastNodeId: prevNodeId,
                    positions: deletionData.positions,
                    pathNodes: deletionData.remainingNodesData.slice(0, -1)

                },
                bus,
                "removeLast",
                {
                    VALIDATE_EMPTY: labels.VALIDATE_EMPTY,
                    VALIDATE_POSITION: labels.VALIDATE_POSITION,
                    DECLARE_REMOVED_NODE: labels.DECLARE_REMOVED_NODE,
                    VALIDATE_HEAD: labels.VALIDATE_HEAD,
                    ELSE_REMOVE: labels.ELSE_REMOVE,
                    GET_PREV_NODE: labels.GET_PREV_NODE,
                    SAVE_TARGET_NODE: labels.SAVE_TARGET_NODE,
                    BYPASS_NODE: labels.BYPASS_NODE
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
            const nodesG = svg.select<SVGGElement>("#nodes-layer");
            const linksG = svg.select<SVGGElement>("#links-layer");

            // Grupo del lienzo correspondiente al nodo a eliminar
            const removeNodeGroup = svg.select<SVGGElement>(`g#${nodeToRemoveId}`);
            const prevNodeNewNextLinkGroup = svg.select<SVGPathElement>(
                `g#link-${prevNodeId}-${nextNodeId}-next path.node-link`
            );
            prevNodeNewNextLinkGroup.style("opacity", 0);

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

            // Grupo del lienzo correspondiente al enlace siguiente actual del nodo previo que apunta al nodo a eliminar
            const prevNodeCurrNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${prevNodeId}-${nodeToRemoveId}-next`
            );

            // Grupo del lienzo correspondiente al enlace siguiente del nodo a eliminar que apunta al nodo siguiente 
            const removeNodeNextLinkGroup = linksG.select<SVGGElement>(
                `g#link-${nodeToRemoveId}-${nextNodeId}-next`
            );

            // Posición de animación final del nodo a eliminar
            const currRemovePos = deletionData.positions.get(nodeToRemoveId)!;
            const finalRemoveNodePos = {
                x: currRemovePos.x,
                y: currRemovePos.y - 75,
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
                y: currRemovePos.y
            }
            const finalRemoveNodeNextLink = buildListPath(
                "next",
                finalRemoveNodePos,
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
                    .duration(1000)
                    .attr("transform", `translate(${finalRemoveNodePos.x}, ${finalRemoveNodePos.y})`)
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
                removeNodeNextLinkGroup
                    .select("path.node-link")
                    .transition()
                    .duration(1000)
                    .attr("d", finalRemoveNodeNextLink)
                    .end()
            );
            await Promise.all(shiftPromises);

            // Desconexión del enlace siguiente actual del nodo previo que apunta al nodo a eliminar
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
            await removeNodeNextLinkGroup
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
        deletionData.positions.delete(nodeToRemoveId);

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
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param targetElement Elemento a buscar en la lista.
 * @param nodesData Array de nodos (`ListNodeData<number>`) que componen la lista.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSearchElement(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    targetElement: number,
    nodesData: ListNodeData<number>[],
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = listaSimpleCode.search.labels!;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "search" });

        bus.emit("step:progress", { stepId: "search", lineIndex: labels.INIT_TRAVERSAL });
        await delay(500);

        let found = false;
        for (const node of nodesData) {
            // Selección del grupo correspondiente al nodo actual
            const currRectElement = svg.select<SVGRectElement>(`g#${node.id} rect.node-container`);

            bus.emit("step:progress", { stepId: "search", lineIndex: labels.WHILE_TRAVERSAL });
            await delay(500);

            bus.emit("step:progress", { stepId: "search", lineIndex: labels.IF_MATCH });

            if (node.value === targetElement) {
                // Resaltado del nodo objetivo
                await currRectElement
                    .transition()
                    .duration(800)
                    .attr("stroke", "#f87171")
                    .attr("stroke-width", 3)
                    .end();

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

            // Resaltado suave del nodo actual
            await currRectElement
                .transition()
                .duration(800)
                .attr("stroke", "#f87171")
                .attr("stroke-width", 3)
                .end();

            bus.emit("step:progress", { stepId: "search", lineIndex: labels.ADVANCE_NODE });

            // Restablecimiento de los bordes originales del nodo
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
        bus.emit("op:done", { op: "removeAt" });
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
async function animateGetListNodePos(
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

    for (const node of nodePath) {
        // Selección del grupo correspondiente al nodo actual
        const nodeGroup = nodesLayer.select<SVGGElement>(`g#${node.id}`);
        const rect = nodeGroup.select<SVGRectElement>("rect.node-container");

        bus.emit("step:progress", { stepId, lineIndex: labels.WHILE_TRAVERSAL });

        // Resaltado del nodo actual
        await rect
            .transition()
            .duration(700)
            .attr("stroke", "#f87171")
            .attr("stroke-width", 3)
            .end();

        bus.emit("step:progress", { stepId, lineIndex: labels.ADVANCE_NODE });
        await delay(500);

        bus.emit("step:progress", { stepId, lineIndex: labels.DEC_POS });

        // Restablecimiento del borde original del nodo actual (excepto para el nodo objetivo)
        if (node.id !== nodePath[nodePath.length - 1].id) {
            await rect
                .transition()
                .duration(700)
                .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                .end();
        } else {
            await delay(500);
        }
    }
    bus.emit("step:progress", { stepId, lineIndex: labels.WHILE_TRAVERSAL });
    await delay(400);

    bus.emit("step:progress", { stepId, lineIndex: labels.RETURN_NODE_GETPOS });
    await delay(500);
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
async function animateAppearListNode(
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
async function animateExitListNode(
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
        VALIDATE_HEAD?: number;
        VALIDATE_EMPTY?: number;
        LINK_NEW_TO_HEAD?: number;
        ASSIGN_NEW_HEAD?: number;
        ASSIGN_HEAD_EMPTY?: number;
        CREATE_NODE: number;
    }
) {
    // Grupos contenedor de los nodos de la lista
    const nodesG = svg.select<SVGGElement>("#nodes-layer");

    // Grupo del lienzo correspondiente al nuevo nodo
    const newNodeGroup = nodesG.select<SVGGElement>(`g#${newNodeId}`);

    // Grupo del lienzo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    // Estado visual inicial de los elementos producto de la inserción
    newNodeGroup.style("opacity", 0);

    if (labels.VALIDATE_POSITION) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_POSITION });
        await delay(500);
    }

    bus.emit("step:progress", { stepId, lineIndex: labels.CREATE_NODE });
    await delay(500);

    const validateHeadLabel =
        labels.VALIDATE_EMPTY ?? labels.VALIDATE_HEAD ?? null;

    if (validateHeadLabel) {
        bus.emit("step:progress", { stepId, lineIndex: validateHeadLabel });
        await delay(500);
    }

    if (labels.LINK_NEW_TO_HEAD) {
        bus.emit("step:progress", { stepId, lineIndex: labels.LINK_NEW_TO_HEAD });
        await delay(500);
    }

    // Aparición del nuevo nodo (lista vacía) y del indicador de cabeza
    const assignHeadLabel =
        labels.ASSIGN_HEAD_EMPTY ?? labels.ASSIGN_NEW_HEAD ?? null;
    if (assignHeadLabel) {
        bus.emit("step:progress", { stepId, lineIndex: assignHeadLabel });
    }
    await newNodeGroup.transition().duration(1000).style("opacity", 1).end();
    await headIndicatorGroup.transition().duration(500).style("opacity", 1).end();
}

async function animateInsertAtHeadNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newHeadNodeId: string;
        currHeadNodeId: string | null;
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number;
        VALIDATE_EMPTY?: number;
        VALIDATE_HEAD?: number;
        ELSE_EMPTY?: number;
        CREATE_NODE: number;
        LINK_NEW_TO_HEAD: number;
        ASSIGN_NEW_HEAD: number;
    },
    repositionList: () => Promise<void>
) {
    // Nodos implicados en la inserción
    const { newHeadNodeId, currHeadNodeId } = insertionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("#nodes-layer");
    const linksG = svg.select<SVGGElement>("#links-layer");

    // Grupo del lienzo correspondiente al nuevo nodo cabeza
    const newHeadNodeGroup = nodesG.select<SVGGElement>(`g#${newHeadNodeId}`);

    // Grupo del lienzo correspondiente al enlace siguiente del nuevo nodo cabeza que apunta a la cabeza actual
    const newHeadNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newHeadNodeId}-${currHeadNodeId}-next`
    );

    // Grupo del lienzo correspondiente al indicador de cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    // Estado visual inicial de los elementos producto de la inserción
    newHeadNodeGroup.style("opacity", 0);
    newHeadNodeNextLinkGroup.style("opacity", 0);

    if (labels.VALIDATE_POSITION) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_POSITION });
        await delay(500);
    }

    bus.emit("step:progress", { stepId, lineIndex: labels.CREATE_NODE });
    await delay(500);

    const validateHeadLabel = labels.VALIDATE_EMPTY ?? labels.VALIDATE_HEAD ?? null;
    if (validateHeadLabel) {
        bus.emit("step:progress", { stepId, lineIndex: validateHeadLabel });
        await delay(500);
    }

    if (labels.ELSE_EMPTY) {
        bus.emit("step:progress", { stepId, lineIndex: labels.ELSE_EMPTY });
        await delay(500);
    }

    // Reposicionamiento de los elementos actuales de la lista a su posición final
    bus.emit("step:progress", { stepId, lineIndex: labels.LINK_NEW_TO_HEAD });
    await repositionList();

    // Aparición y posicionamiento del nuevo nodo cabeza
    const finalNewNodePos = insertionData.positions.get(newHeadNodeId)!;
    const initialNewNodePos = {
        x: finalNewNodePos.x,
        y: finalNewNodePos.y - 60,
    };
    await animateAppearListNode(newHeadNodeGroup, initialNewNodePos, finalNewNodePos);

    // Establecimiento del enlace siguiente del nuevo nodo cabeza
    await newHeadNodeNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Desplazamiento del indicador de cabeza hacia la nueva cabeza de la lista
    bus.emit("step:progress", { stepId, lineIndex: labels.ASSIGN_NEW_HEAD });
    await headIndicatorGroup
        .transition()
        .duration(1500)
        .attr("transform", () => {
            const finalX =
                finalNewNodePos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
            const finalY = finalNewNodePos.y;
            return `translate(${finalX}, ${finalY})`;
        })
        .end();
}

async function animateInsertAtTailNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    insertionData: {
        newLastNodeId: string;
        currLastNodeId: string | null;
        pathNodes: ListNodeData<number>[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number;
        VALIDATE_EMPTY?: number;
        VALIDATE_HEAD?: number;
        ELSE_GENERAL?: number;
        ELSE_EMPTY?: number;
        GET_LAST_NODE?: number;
        GET_PREV_NODE?: number;
        LINK_NEW_TO_NEXT?: number;
        LINK_NODE_END?: number;
        LINK_PREV_TO_NEW?: number;
        CREATE_NODE: number;
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
    const { newLastNodeId, currLastNodeId } = insertionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("#nodes-layer");
    const linksG = svg.select<SVGGElement>("#links-layer");

    // Grupo del lienzo correspondiente al nuevo último nodo
    const newLastNodeGroup = nodesG.select<SVGGElement>(`g#${newLastNodeId}`);

    // Grupo del lienzo correspondiente al enlace siguiente del último nodo actual que apunta al nuevo último nodo
    const currLastNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${currLastNodeId}-${newLastNodeId}-next`
    );

    // Estado visual inicial de los elementos producto de la inserción
    newLastNodeGroup.style("opacity", 0);
    currLastNodeNextLinkGroup.style("opacity", 0);

    if (labels.VALIDATE_POSITION) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_POSITION });
        await delay(500);
    }

    bus.emit("step:progress", { stepId, lineIndex: labels.CREATE_NODE });
    await delay(500);

    const validateHeadLabel = labels.VALIDATE_EMPTY ?? labels.VALIDATE_HEAD ?? null;
    if (validateHeadLabel) {
        bus.emit("step:progress", { stepId, lineIndex: validateHeadLabel });
        await delay(500);
    }

    const elseLabel = labels.ELSE_EMPTY ?? labels.ELSE_GENERAL ?? null;
    if (elseLabel) {
        bus.emit("step:progress", { stepId, lineIndex: elseLabel });
        await delay(500);
    }

    const getNodeLabel = labels.GET_LAST_NODE ?? labels.GET_PREV_NODE ?? null;
    if (getNodeLabel) {
        bus.emit("step:progress", { stepId, lineIndex: getNodeLabel });
        await delay(500);
    }

    // Recorrido de los nodos hasta la posición de inserción (último nodo actual)
    await animateGetListNodePos(nodesG, insertionData.pathNodes, bus, getPosLabels, "insertLast");

    if (getNodeLabel) {
        bus.emit("step:progress", { stepId, lineIndex: getNodeLabel });
        await delay(400);
    }

    // Aparición y posicionamiento del nuevo último nodo
    const linkNewNodeLabel = labels.LINK_NEW_TO_NEXT ?? labels.LINK_NODE_END ?? null;
    if (linkNewNodeLabel) bus.emit("step:progress", { stepId, lineIndex: linkNewNodeLabel });
    const finalNewNodePos = insertionData.positions.get(newLastNodeId)!;
    const initialNewNodePos = {
        x: finalNewNodePos.x,
        y: finalNewNodePos.y - 60,
    };
    await animateAppearListNode(newLastNodeGroup, initialNewNodePos, finalNewNodePos);

    // Establecimiento del enlace siguiente del último nodo previo
    if (labels.LINK_PREV_TO_NEW) bus.emit("step:progress", { stepId, lineIndex: labels.LINK_PREV_TO_NEW });
    await currLastNodeNextLinkGroup
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
        SAVE_HEAD?: number;
        MOVE_HEAD?: number;
        DECLARE_REMOVED_NODE?: number
        VALIDATE_SINGLE_NODE?: number;
        CLEAR_HEAD?: number;
        VALIDATE_POSITION?: number;
        VALIDATE_HEAD?: number;
        VALIDATE_EMPTY: number;
    }
) {
    // Grupos contenedor de los nodos de la lista
    const nodesG = svg.select<SVGGElement>("#nodes-layer");

    // Grupo del lienzo correspondiente al nodo a eliminar
    const currHeadNodeGroup = nodesG.select<SVGGElement>(`g#${currHeadNodeId}`);

    // Grupo del lienzo correspondiente al indicador de cabeza
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

    const validateHeadLabel =
        labels.VALIDATE_HEAD ?? labels.VALIDATE_SINGLE_NODE ?? null;
    if (validateHeadLabel) {
        bus.emit("step:progress", { stepId, lineIndex: validateHeadLabel });
        await delay(500);
    }

    if (labels.SAVE_HEAD) {
        bus.emit("step:progress", { stepId, lineIndex: labels.SAVE_HEAD });
        await delay(500);
    }

    const deleteHeadLabel =
        labels.MOVE_HEAD ?? labels.CLEAR_HEAD ?? null;
    if (deleteHeadLabel) bus.emit("step:progress", { stepId, lineIndex: deleteHeadLabel });
    await currHeadNodeGroup.transition().duration(1000).style("opacity", 0).remove().end();
    await headIndicatorGroup.transition().duration(250).style("opacity", 0).remove().end();
}

async function animateDeleteAtHeadNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        currHeadNodeId: string;
        newHeadNodeId: string | null;
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number;
        DECLARE_REMOVED_NODE?: number;
        VALIDATE_HEAD?: number;
        VALIDATE_EMPTY: number;
        SAVE_HEAD: number;
        MOVE_HEAD: number;
    },
    repositionList: () => Promise<void>
) {
    // Nodos implicados en la eliminación
    const { currHeadNodeId, newHeadNodeId } = deletionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("#nodes-layer");
    const linksG = svg.select<SVGGElement>("#links-layer");

    // Grupo del lienzo correspondiente al nodo a eliminar
    const currHeadNodeGroup = nodesG.select<SVGGElement>(`g#${currHeadNodeId}`);

    // Grupo del lienzo correspondiente al enlace siguiente del nodo a eliminar que apunta a la nueva cabeza
    const currHeadNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${currHeadNodeId}-${newHeadNodeId}-next`
    );

    // Grupo del lienzo correspondiente al indicador de cabeza
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

    // Posición de animación final del nodo a eliminar
    bus.emit("step:progress", { stepId, lineIndex: labels.MOVE_HEAD });
    const currRemovePos = deletionData.positions.get(currHeadNodeId)!;
    const finalRemoveNodePos = {
        x: currRemovePos.x,
        y: currRemovePos.y + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8,
    };

    // Desconexión del enlace siguiente del nodo a eliminar
    await currHeadNodeNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Salida del nodo a eliminar
    await animateExitListNode(currHeadNodeGroup, finalRemoveNodePos);

    // Salida del indicador de cabeza
    await headIndicatorGroup
        .transition()
        .duration(500)
        .style("opacity", 0)
        .end();

    // Reposicionamiento de los elementos restantes de la lista a su posición final
    await repositionList();

    // Entrada del indicador de cabeza (ahora apuntando a la nueva cabeza de la lista)
    await headIndicatorGroup
        .transition()
        .duration(500)
        .style("opacity", 1)
        .end();
}

async function animateDeleteAtTailNonEmpty(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    deletionData: {
        currLastNodeId: string;
        newLastNodeId: string;
        pathNodes: ListNodeData<number>[];
        positions: Map<string, { x: number; y: number }>;
    },
    bus: EventBus,
    stepId: string,
    labels: {
        VALIDATE_POSITION?: number;
        VALIDATE_EMPTY?: number;
        VALIDATE_HEAD?: number;
        VALIDATE_SINGLE_NODE?: number;
        ELSE_SINGLE_NODE?: number;
        ELSE_REMOVE?: number;
        GET_PREV_NODE?: number;
        GET_LAST_NODE?: number;
        SAVE_LAST_NODE?: number;
        SAVE_TARGET_NODE?: number;
        UNLINK_LAST_NODE?: number;
        BYPASS_NODE?: number;
        DECLARE_REMOVED_NODE: number;
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
    const { currLastNodeId, newLastNodeId } = deletionData;

    // Grupos contenedores de nodos y enlaces de la lista
    const nodesG = svg.select<SVGGElement>("#nodes-layer");
    const linksG = svg.select<SVGGElement>("#links-layer");

    // Grupo del lienzo correspondiente al nodo a eliminar
    const currLastNodeGroup = nodesG.select<SVGGElement>(`g#${currLastNodeId}`);

    // Grupo del lienzo correspondiente al enlace siguiente del nuevo último nodo que apunta al nodo a eliminar
    const newLastNodeNextLinkGroup = linksG.select<SVGGElement>(
        `g#link-${newLastNodeId}-${currLastNodeId}-next`
    );

    if (labels.VALIDATE_EMPTY) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_EMPTY });
        await delay(500);
    }

    if (labels.VALIDATE_POSITION) {
        bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_POSITION });
        await delay(500);
    }

    bus.emit("step:progress", { stepId, lineIndex: labels.DECLARE_REMOVED_NODE });
    await delay(500);

    const validateHeadLabel = labels.VALIDATE_HEAD ?? labels.VALIDATE_SINGLE_NODE ?? null;
    if (validateHeadLabel) {
        bus.emit("step:progress", { stepId, lineIndex: validateHeadLabel });
        await delay(500);
    }

    const elseLabel = labels.ELSE_SINGLE_NODE ?? labels.ELSE_REMOVE ?? null;
    if (elseLabel) {
        bus.emit("step:progress", { stepId, lineIndex: elseLabel });
        await delay(500);
    }

    const getNodeLabel = labels.GET_LAST_NODE ?? labels.GET_PREV_NODE ?? null;
    if (getNodeLabel) {
        bus.emit("step:progress", { stepId, lineIndex: getNodeLabel });
        await delay(500);
    }

    // Recorrido de los nodos hasta el nuevo último nodo
    await animateGetListNodePos(nodesG, deletionData.pathNodes, bus, getPosLabels, "insertLast");

    if (getNodeLabel) {
        bus.emit("step:progress", { stepId, lineIndex: getNodeLabel });
        await delay(400);
    }

    const saveDeleteNodeLabel = labels.SAVE_LAST_NODE ?? labels.SAVE_TARGET_NODE ?? null;
    if (saveDeleteNodeLabel) {
        bus.emit("step:progress", { stepId, lineIndex: saveDeleteNodeLabel });
        await delay(500);
    }

    // Posición de animación final del nodo a eliminar
    const deleteNodeLabel = labels.UNLINK_LAST_NODE ?? labels.BYPASS_NODE ?? null;
    if (deleteNodeLabel) bus.emit("step:progress", { stepId, lineIndex: deleteNodeLabel });
    const currRemovePos = deletionData.positions.get(currLastNodeId)!;
    const finalRemoveNodePos = {
        x: currRemovePos.x,
        y: currRemovePos.y + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8,
    };

    // Desconexión del enlace siguiente del nuevo último nodo
    await newLastNodeNextLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Salida del nodo a eliminar
    await animateExitListNode(currLastNodeGroup, finalRemoveNodePos);
}