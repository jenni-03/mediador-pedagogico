import type { HierarchyNode, Selection } from "d3";
import { getArbolBinarioBusquedaCode } from "../../constants/pseudocode/arbolBinarioBusquedaCode";
import { BSTDeleteStep, BSTInsertStep, BSTSearchStep, HierarchyNodeData, TreeLinkData } from "../../../types";
import { type EventBus } from "../../events/eventBus";
import type { Dispatch, SetStateAction } from "react";
import { delay } from "../simulatorUtils";
import { defaultAppearTreeNode, repositionTree, showTreeHint } from "./drawActionsUtilities";
import { straightPath } from "../treeUtils";
import { SVG_BINARY_TREE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { animateGetInOrderSuccessor, animateReplaceChildNode } from "./BinaryTreeDrawActions";

const arbolABBCode = getArbolBinarioBusquedaCode();

/**
 * Función encargada de animar el proceso de inserción de un nodo en un árbol binario de búsqueda.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param insertionData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateInsertBSTNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    insertionData: {
        targetNodeId: string;
        parentNodeId: string | null;
        inserted: boolean;
        insertSteps: BSTInsertStep[];
        nodesData: HierarchyNode<HierarchyNodeData<number>>[];
        linksData: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
        highlightColor: string;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = arbolABBCode.insert.labels;

    // Elementos implicados en la inserción 
    const { targetNodeId, parentNodeId, inserted, insertSteps } = insertionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "insert" });

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g#tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido (inicialmente oculto)
        const seqG = svg.select<SVGGElement>("g#seq-container");
        seqG.style("opacity", 0);

        // Estado visual inicial de los nuevos elementos producto de la inserción
        let newNodeGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
        let parentNodeNewLinkGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
        if (inserted) {
            newNodeGroup = treeG.select<SVGGElement>(`g#${targetNodeId}`);
            newNodeGroup.style("opacity", 0);

            if (parentNodeId) {
                parentNodeNewLinkGroup = treeG.select<SVGGElement>(
                    `g#link-${parentNodeId}-${targetNodeId}`
                );
                parentNodeNewLinkGroup.style("opacity", 0);
            }
        }

        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.RESET_INSERTED_FLAG });
        await delay(600);

        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CALL_RECURSIVE_INSERT });
        await delay(600);

        let prevStep: BSTInsertStep | null = null;
        for (const step of insertSteps) {
            const lastStep = prevStep;

            switch (step.type) {
                case "checkNull": {
                    bus.emit("step:progress", {
                        stepId: "insert",
                        lineIndex: labels.IF_NULL_NODE
                    });
                    if (step.isNull) {
                        await delay(600);
                    } else {
                        // Resaltado del nodo actual
                        await treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("fill", insertionData.highlightColor)
                            .end();
                    }
                    break;
                }
                case "createLeaf": {
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CREATE_LEAF_NODE });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_INSERTED_TRUE });
                    await delay(600);

                    // Aparición del nuevo nodo
                    bus.emit("step:progress", {
                        stepId: "insert",
                        lineIndex: labels.RETURN_LEAF
                    });
                    await repositionBSTTree(treeG, insertionData.nodesData, insertionData.linksData, insertionData.positions);
                    if (newNodeGroup) await defaultAppearTreeNode(newNodeGroup);
                    break;
                }
                case "compare": {
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.DECLARE_CMP });
                    await delay(600);

                    if (step.cmp === -1) {
                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_CMP_LT_ZERO });
                        await delay(600);
                    } else {
                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_CMP_LT_ZERO });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_IF_CMP_GT_ZERO });
                        await delay(600);

                        if (step.cmp === 0) {
                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_DUPLICATE });
                            await delay(600);

                            // Pulsación del nodo identificado
                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.MARK_NOT_INSERTED });
                            await treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`)
                                .transition()
                                .duration(300)
                                .attr("r", 30)
                                .transition()
                                .duration(300)
                                .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
                                .end();

                            // Indicador visual de que el nodo a insertar ya existe en el árbol
                            await showTreeHint(
                                svg,
                                { type: "node", id: step.at },
                                { label: "Elemento", value: `ya existente` },
                                insertionData.positions,
                                treeOffset,
                                {
                                    size: { width: 75, height: 35 },
                                    typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                                    anchor: { side: "below", dx: 10, dy: -8 },
                                    palette: { bg: "#1b2330", stroke: "#14b8a6" }
                                }
                            );
                        }
                    }
                    break;
                }
                case "goLeft": {
                    // Restablecimiento del fondo del nodo actual antes de pasar al siguiente
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CALL_LEFT_SUBTREE });
                    await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                        .transition()
                        .duration(800)
                        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                        .end();
                    break;
                }
                case "goRight": {
                    // Restablecimiento del fondo del nodo actual antes de pasar al siguiente
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CALL_RIGHT_SUBTREE });
                    await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                        .transition()
                        .duration(800)
                        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                        .end();
                    break;
                }
                case "return": {
                    const isLeafReturn = lastStep?.type === "createLeaf";
                    if (!isLeafReturn) {
                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.RETURN_NODE });
                        await delay(600);
                    }

                    if (step.to !== null && step.via !== "root") {
                        const lineToRemark = step.via === "left" ? labels.CALL_LEFT_SUBTREE : labels.CALL_RIGHT_SUBTREE;
                        bus.emit("step:progress", {
                            stepId: "insert",
                            lineIndex: lineToRemark
                        });
                    }

                    if (step.from) {
                        // Restablecimiento del fondo del nodo en la llamada actual (backtracking)
                        await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                            .end();
                    }
                    if (step.to) {
                        // Resaltado del nodo en la nueva llamada (backtracking)
                        await treeG.select<SVGCircleElement>(`g#${step.to} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("fill", insertionData.highlightColor)
                            .end();

                        if (isLeafReturn) {
                            // Establecimiento del nuevo enlace del nodo padre
                            if (parentNodeNewLinkGroup) {
                                await parentNodeNewLinkGroup
                                    .transition()
                                    .duration(800)
                                    .style("opacity", 1)
                                    .end();
                            }
                        }
                    }
                    break;
                }
            }

            prevStep = step;
        }
        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CALL_RECURSIVE_INSERT });
        await delay(600);

        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_INSERTED });
        await delay(600);

        if (inserted) {
            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.INC_SIZE });
            await delay(600);
        }

        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.RETURN_RESULT });
        await delay(600);

        // Fin de la operación
        bus.emit("op:done", { op: "insert" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de eliminación de un nodo en un árbol binario de búsqueda.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param deletionData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDeleteBSTNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    deletionData: {
        targetNodeId: string | null;
        parentNodeId: string | null;
        successorNodeId: string | null;
        successorParentNodeId: string | null;
        replacementNodeId: string | null;
        replacementSide: "left" | "right" | null;
        pathToSuccessor: string[];
        deleted: boolean;
        deleteSteps: BSTDeleteStep[];
        remainingNodesData: HierarchyNode<HierarchyNodeData<number>>[];
        remainingLinksData: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
        highlightTargetColor: string;
        highlightSuccessorColor: string;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = arbolABBCode.delete.labels;

    // Elementos implicados en la eliminación 
    const { targetNodeId,
        parentNodeId,
        successorNodeId,
        successorParentNodeId,
        replacementNodeId,
        deleted,
        deleteSteps } = deletionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "delete" });

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g#tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido (inicialmente oculto)
        const seqG = svg.select<SVGGElement>("g#seq-container");
        seqG.style("opacity", 0);

        // Id del nodo a eliminar (depende de la existencia del sucesor)
        const removalNodeId = successorNodeId ?? targetNodeId

        // Id del nodo padre del nodo a eliminar (depende de la existencia del sucesor)
        const parentRemovalNodeId = successorParentNodeId ?? parentNodeId;

        // Estado visual inicial del nuevo enlace formado entre el nodo padre del nodo a eliminar y el nodo que lo reemplaza
        if (deleted) {
            if (parentRemovalNodeId && replacementNodeId) {
                treeG.select<SVGGElement>(
                    `g#link-${parentRemovalNodeId}-${replacementNodeId}`
                ).style("opacity", 0);
            }
        }

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.VALIDATE_EMPTY });
        await delay(600);

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RESET_DELETED_FLAG });
        await delay(600);

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.CALL_RECURSIVE_DELETE });
        await delay(600);

        let prevStep: BSTDeleteStep | null = null;
        for (const step of deleteSteps) {
            const lastStep = prevStep;

            switch (step.type) {
                case "checkNull": {
                    bus.emit("step:progress", {
                        stepId: "delete",
                        lineIndex: labels.IF_NULL_NODE
                    });
                    if (step.isNull) {
                        await delay(600);
                        bus.emit("step:progress", {
                            stepId: "delete",
                            lineIndex: labels.RETURN_NULL
                        });
                        await delay(600);
                    } else {
                        // Resaltado del nodo actual
                        await treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("fill", deletionData.highlightTargetColor)
                            .end();
                    }
                    break;
                }
                case "compare": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECLARE_CMP });
                    await delay(600);

                    if (step.cmp === -1) {
                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_CMP_LT_ZERO });
                        await delay(600);
                    } else {
                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_CMP_LT_ZERO });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_IF_CMP_GT_ZERO });
                        await delay(600);

                        if (step.cmp === 0) {
                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_FOUND });
                            await delay(600);
                        }
                    }
                    break;
                }
                case "goLeft": {
                    // Restablecimiento del fondo del nodo actual antes de pasar al siguiente
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.CALL_LEFT_SUBTREE });
                    await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                        .transition()
                        .duration(800)
                        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                        .end();
                    break;
                }
                case "goRight": {
                    // Restablecimiento del fondo del nodo actual antes de pasar al siguiente
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.CALL_RIGHT_SUBTREE });
                    await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                        .transition()
                        .duration(800)
                        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                        .end();
                    break;
                }
                case "match": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_DELETED_TRUE });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_NO_LEFT_CHILD });
                    await delay(600);

                    if (!replacementNodeId && !successorNodeId) {
                        // Nodo hoja
                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RETURN_RIGHT_CHILD });
                        await delay(600);
                    } else if (!successorNodeId) {
                        // Nodo con 1 hijo
                        if (deletionData.replacementSide === "right") {
                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RETURN_RIGHT_CHILD });
                            await delay(600);
                        } else {
                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_NO_RIGHT_CHILD });
                            await delay(600);

                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RETURN_LEFT_CHILD });
                            await delay(600);
                        }
                    } else {
                        // Nodo con 2 hijos
                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_NO_RIGHT_CHILD });
                        await delay(600);

                        // Recorrido de los nodos desde el nodo objetivo hasta el sucesor (nodo a eliminar)
                        await animateGetInOrderSuccessor(
                            treeG,
                            deletionData.pathToSuccessor,
                            deletionData.highlightSuccessorColor,
                            "delete",
                            bus,
                            {
                                DECLARE_SUCC_PARENT: labels.DECLARE_SUCC_PARENT,
                                DECLARE_SUCC_NODE: labels.DECLARE_SUCC_NODE,
                                WHILE_TRAVERSAL: labels.WHILE_TRAVERSAL,
                                SET_SUCC_PARENT: labels.SET_SUCC_PARENT,
                                SET_SUCC_NODE: labels.SET_SUCC_NODE,
                            }
                        );

                        // Desvanecimiento del valor actual del nodo objetivo
                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.UPDATE_NODE_INFO });
                        const targetNodeValueGroup = treeG.select<SVGTextElement>(`g#${targetNodeId} text.node-value`);
                        await targetNodeValueGroup
                            .transition()
                            .duration(1000)
                            .style("opacity", 0)
                            .end();

                        // Establecimiento del nuevo valor del nodo objetivo copiado del nodo a eliminar
                        targetNodeValueGroup.text(treeG.select<SVGGElement>(`g#${removalNodeId}`).select("text").text());

                        // Aparición del nuevo valor del nodo objetivo
                        await targetNodeValueGroup
                            .transition()
                            .duration(1000)
                            .style("opacity", 1)
                            .end();

                        // Salida y reemplazo del nodo a eliminar
                        bus.emit("step:progress", {
                            stepId: "delete",
                            lineIndex: labels.IF_SUCC_IS_LEFT_CHILD
                        });
                        await delay(600);

                        if (deletionData.pathToSuccessor.length > 1) {
                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_LEFT_CHILD });
                        } else {
                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_SET_RIGHT_CHILD });
                            await delay(600);

                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_RIGHT_CHILD });
                        }

                        await animateReplaceChildNode(
                            treeG,
                            removalNodeId!,
                            parentRemovalNodeId,
                            replacementNodeId
                        );

                        // Reposicionamiento de los nodos y enlaces del árbol luego de la salida del nodo
                        await repositionBSTTree(treeG, deletionData.remainingNodesData, deletionData.remainingLinksData, deletionData.positions);
                    }
                    break;
                }
                case "return": {
                    const isMatchReturn = lastStep?.type === "match";
                    if ((isMatchReturn && successorNodeId) || (!isMatchReturn && step.from)) {
                        console.log("MONDONGO")
                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RETURN_NODE });
                        await delay(600);
                    }

                    if (step.to !== null && step.via !== "root") {
                        const lineToRemark = step.via === "left" ? labels.CALL_LEFT_SUBTREE : labels.CALL_RIGHT_SUBTREE;
                        bus.emit("step:progress", {
                            stepId: "delete",
                            lineIndex: lineToRemark
                        });
                    }

                    if (step.from) {
                        // Restablecimiento del fondo del nodo en la llamada actual (backtracking)
                        await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                            .end();
                    }
                    if (step.to) {
                        // Resaltado del nodo en la nueva llamada (backtracking)
                        await treeG.select<SVGCircleElement>(`g#${step.to} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("fill", deletionData.highlightTargetColor)
                            .end();
                    }

                    if (isMatchReturn && !successorNodeId) {
                        // Salida y reemplazo del nodo a eliminar
                        if (removalNodeId) {
                            await animateReplaceChildNode(
                                treeG,
                                removalNodeId,
                                parentRemovalNodeId,
                                replacementNodeId
                            );

                            // Reposicionamiento de los nodos y enlaces del árbol luego de la salida del nodo
                            await repositionBSTTree(treeG, deletionData.remainingNodesData, deletionData.remainingLinksData, deletionData.positions);
                        }
                    }
                    break;
                }
            }

            prevStep = step;
        }

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.CALL_RECURSIVE_DELETE });
        await delay(600);

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_DELETED });
        await delay(600);

        if (deleted) {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DEC_SIZE });
            await delay(600);

            bus.emit("step:progress", {
                stepId: "delete",
                lineIndex: labels.RETURN_RESULT
            });
            await delay(600);

            // Limpiamos el registro del nodo eliminado
            deletionData.positions.delete(removalNodeId!);
        } else {
            // Indicador visual de que el nodo a eliminar no existe en el árbol
            const firstVisited = deletionData.deleteSteps
                .filter(s => s.type === "checkNull")
                .at(0);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RETURN_RESULT });
            await showTreeHint(
                svg,
                { type: "node", id: firstVisited!.at! },
                { label: "Elemento", value: `no ubicado` },
                deletionData.positions,
                treeOffset,
                {
                    size: { width: 75, height: 35 },
                    typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                    anchor: { side: "below", dx: 10, dy: -8 },
                    palette: { bg: "#1b2330", stroke: "#14b8a6" }
                }
            );
        }

        // Fin de la operación
        bus.emit("op:done", { op: "delete" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de búsqueda de un nodo en un árbol binario de búsqueda.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param searchData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSearchBSTNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    searchData: {
        targetNodeId: string | null;
        found: boolean;
        searchSteps: BSTSearchStep[];
        positions: Map<string, { x: number; y: number }>;
        highlightColor: string;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = arbolABBCode.search.labels;

    // Elementos implicados en la búsqueda 
    const { targetNodeId, found, searchSteps } = searchData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "search" });

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g#tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido (inicialmente oculta)
        const seqG = svg.select<SVGGElement>("g#seq-container");
        seqG.style("opacity", 0);

        bus.emit("step:progress", { stepId: "search", lineIndex: labels.CALL_RECURSIVE_SEARCH });
        await delay(600);

        for (const step of searchSteps) {
            switch (step.type) {
                case "checkNull": {
                    bus.emit("step:progress", {
                        stepId: "search",
                        lineIndex: labels.IF_NULL_NODE
                    });
                    if (step.isNull) {
                        await delay(600);
                        bus.emit("step:progress", {
                            stepId: "search",
                            lineIndex: labels.RETURN_FALSE
                        });
                        await delay(600);
                    } else if (step.at) {
                        // Resaltado del nodo actual
                        await treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("fill", searchData.highlightColor)
                            .end();
                    }
                    break;
                }
                case "compare": {
                    bus.emit("step:progress", { stepId: "search", lineIndex: labels.DECLARE_CMP });
                    await delay(600);

                    if (step.cmp === -1) {
                        bus.emit("step:progress", { stepId: "search", lineIndex: labels.IF_CMP_LT_ZERO });
                        await delay(600);
                    } else {
                        bus.emit("step:progress", { stepId: "search", lineIndex: labels.IF_CMP_LT_ZERO });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "search", lineIndex: labels.ELSE_IF_CMP_GT_ZERO });
                        await delay(600);

                        if (step.cmp === 0) {
                            bus.emit("step:progress", { stepId: "search", lineIndex: labels.ELSE_FOUND });
                            await delay(600);
                        }
                    }
                    break;
                }
                case "goLeft": {
                    // Restablecimiento del fondo del nodo actual antes de pasar al siguiente
                    bus.emit("step:progress", { stepId: "search", lineIndex: labels.CALL_LEFT_SUBTREE });
                    await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                        .transition()
                        .duration(800)
                        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                        .end();
                    break;
                }
                case "goRight": {
                    // Restablecimiento del fondo del nodo actual antes de pasar al siguiente
                    bus.emit("step:progress", { stepId: "search", lineIndex: labels.CALL_RIGHT_SUBTREE });
                    await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                        .transition()
                        .duration(800)
                        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                        .end();
                    break;
                }
                case "match": {
                    // Pulsación del nodo identificado
                    bus.emit("step:progress", {
                        stepId: "search",
                        lineIndex: labels.RETURN_TRUE
                    });
                    await treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`)
                        .transition()
                        .duration(300)
                        .attr("r", 30)
                        .transition()
                        .duration(300)
                        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
                        .end();

                    // Indicador visual de que el nodo existe en el árbol
                    await showTreeHint(
                        svg,
                        { type: "node", id: targetNodeId! },
                        { label: "Elemento", value: `ubicado` },
                        searchData.positions,
                        treeOffset,
                        {
                            size: { width: 75, height: 35 },
                            typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                            anchor: { side: "below", dx: 10, dy: -8 },
                            palette: { bg: "#1b2330", stroke: "#14b8a6" }
                        }
                    );
                    break;
                }
                case "return": {
                    if (step.to !== null && step.via !== "root") {
                        const lineToRemark = step.via === "left" ? labels.CALL_LEFT_SUBTREE : labels.CALL_RIGHT_SUBTREE;
                        bus.emit("step:progress", {
                            stepId: "search",
                            lineIndex: lineToRemark
                        });
                        await delay(600);
                    }

                    if (step.from) {
                        // Restablecimiento del fondo del nodo en la llamada actual (backtracking)
                        await treeG.select(`g#${step.from} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                            .end();
                    }
                    if (step.to) {
                        // Resaltado del nodo en la nueva llamada (backtracking)
                        await treeG.select(`g#${step.to} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("fill", searchData.highlightColor)
                            .end();
                    }
                    break;
                }
            }
        }

        bus.emit("step:progress", {
            stepId: "search",
            lineIndex: labels.CALL_RECURSIVE_SEARCH
        });
        if (!found) {
            // Indicador visual de que el nodo no existe en el árbol
            const firstVisited = searchSteps
                .filter(s => s.type === "checkNull")
                .at(0);

            await showTreeHint(
                svg,
                { type: "node", id: firstVisited!.at! },
                { label: "Elemento", value: `no ubicado` },
                searchData.positions,
                treeOffset,
                {
                    size: { width: 75, height: 35 },
                    typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                    anchor: { side: "below", dx: 10, dy: -8 },
                    palette: { bg: "#1b2330", stroke: "#14b8a6" }
                }
            );
        } else {
            await delay(600);
        }

        // Fin de la operación
        bus.emit("op:done", { op: "search" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de reubicar los nodos y ajustar los enlaces de conexión de un árbol binario de búsqueda.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) contenedor de los nodos y enlaces del árbol.
 * @param nodes Array de nodos de jerarquía que representan la estructura del árbol.
 * @param linksData Array de objetos de datos de enlace que representan las conexiones entre nodos.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @returns Promise<`void`>. Se resuelve cuando se han completado todas las transiciones de nodos y enlaces.
 */
async function repositionBSTTree(
    g: Selection<SVGGElement, unknown, null, undefined>,
    nodes: HierarchyNode<HierarchyNodeData<number>>[],
    linksData: TreeLinkData[],
    positions: Map<string, { x: number; y: number }>
) {
    return repositionTree(g, nodes, linksData, positions, straightPath);
}