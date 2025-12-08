import type { HierarchyNode, Selection } from "d3";
import { BinaryTreeGetStep, BinaryTreeLevelStep, BinaryTreeTraversalStep, HierarchyNodeData, LinkPathFn, TreeLinkData } from "../../../types";
import { defaultAppearTreeNode, defaultDeleteTreeNode, repositionTree, showTreeHint } from "./drawActionsUtilities";
import { SVG_BINARY_TREE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import type { Dispatch, SetStateAction } from "react";
import { straightPath } from "../treeUtils";
import { type EventBus } from "../../events/eventBus";
import { getArbolBinarioCode } from "../../constants/pseudocode/arbolBinarioCode";
import { delay } from "../simulatorUtils";

const arbolBinarioCode = getArbolBinarioCode();

/**
 * Función encargada de animar el proceso de inserción de un nodo en un árbol binario.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param insertionData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateInsertBinaryNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    insertionData: {
        newNodeId: string;
        parentNodeId: string | null;
        inserted: boolean;
        side: "izquierdo" | "derecho";
        searchSteps: BinaryTreeGetStep[];
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
    const labels = insertionData.side === "izquierdo" ? arbolBinarioCode.insertLeft.labels! : arbolBinarioCode.insertRight.labels!;
    const op = insertionData.side === "izquierdo" ? "insertLeft" : "insertRight";

    // Nodos implicados en la inserción 
    const { newNodeId, parentNodeId, inserted, searchSteps } = insertionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op });

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g#tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido (inicialmente oculto)
        const seqG = svg.select<SVGGElement>("g#seq-container");
        seqG.style("opacity", 0);

        if (inserted) {
            // Grupo correspondiente al nuevo nodo
            const newNodeGroup = treeG.select<SVGGElement>(`g#${newNodeId}`);

            // Estado visual inicial del nuevo nodo
            newNodeGroup.style("opacity", 0);

            // Grupos correspondientes al nodo padre del nuevo nodo y al nuevo enlace del nodo padre que apunta al nuevo nodo
            let parentNewNodeGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
            let parentNodeNewLinkGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
            if (parentNodeId) {
                parentNewNodeGroup = treeG.select<SVGGElement>(`g#${parentNodeId}`);
                parentNodeNewLinkGroup = treeG.select<SVGGElement>(
                    `g#link-${parentNodeId}-${newNodeId}`
                );
                parentNodeNewLinkGroup.style("opacity", 0);
            }

            bus.emit("step:progress", { stepId: op, lineIndex: labels.CREATE_NODE });
            await delay(600);

            bus.emit("step:progress", { stepId: op, lineIndex: labels.VALIDATE_EMPTY });
            await delay(600);

            if (!parentNodeId) {
                // Aparición del nuevo nodo raíz
                bus.emit("step:progress", { stepId: op, lineIndex: labels.SET_ROOT });
                await newNodeGroup
                    .transition()
                    .duration(800)
                    .style("opacity", 1)
                    .end();
            } else {
                bus.emit("step:progress", { stepId: op, lineIndex: labels.ELSE_EMPTY });
                await delay(600);

                bus.emit("step:progress", { stepId: op, lineIndex: labels.GET_PARENT_NODE });
                await delay(600);

                // Reposicionamiento de los nodos y enlaces del árbol antes de insertar
                bus.emit("step:progress", { stepId: op, lineIndex: labels.CALL_RECURSIVE_GET });
                await repositionBinaryTree(treeG, insertionData.nodesData, insertionData.linksData, insertionData.positions);

                // Recorrido recursivo desde el nodo raíz hasta el nodo padre del nuevo nodo
                await animateGetNodeSteps(
                    treeG,
                    searchSteps,
                    insertionData.highlightColor,
                    op,
                    bus,
                    {
                        IF_NULL_NODE: labels.IF_NULL_NODE,
                        RETURN_NULL: labels.RETURN_NULL,
                        IF_MATCH_NODE: labels.IF_MATCH_NODE,
                        RETURN_NODE: labels.RETURN_NODE,
                        SEARCH_LEFT: labels.SEARCH_LEFT,
                        VALIDATE_LEFT_RESULT: labels.VALIDATE_LEFT_RESULT,
                        RETURN_LEFT_RESULT: labels.RETURN_LEFT_RESULT,
                        SEARCH_RIGHT: labels.SEARCH_RIGHT
                    }
                );

                bus.emit("step:progress", { stepId: op, lineIndex: labels.GET_PARENT_NODE });
                await delay(600);

                bus.emit("step:progress", { stepId: op, lineIndex: labels.IF_INVALID_PARENT });
                await delay(600);

                // Aparición del nuevo nodo
                const linkNodeLabel = insertionData.side === "izquierdo" ? labels.LINK_LEFT_CHILD : labels.LINK_RIGHT_CHILD;
                bus.emit("step:progress", { stepId: op, lineIndex: linkNodeLabel });
                await defaultAppearTreeNode(newNodeGroup);

                // Establecimiento del nuevo enlace del nodo padre
                await parentNodeNewLinkGroup
                    ?.transition()
                    .duration(800)
                    .style("opacity", 1)
                    .end();

                // Restablecimiento del fondo del nodo padre del nuevo nodo
                await parentNewNodeGroup?.select<SVGCircleElement>("circle.node-container")
                    .transition()
                    .duration(800)
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .end();;
            }

            bus.emit("step:progress", { stepId: op, lineIndex: labels.INC_SIZE });
            await delay(600);

            bus.emit("step:progress", { stepId: op, lineIndex: labels.RETURN_TRUE });
            await delay(600);
        } else {
            const { positions } = insertionData;

            bus.emit("step:progress", { stepId: op, lineIndex: labels.CREATE_NODE });
            await delay(600);

            bus.emit("step:progress", { stepId: op, lineIndex: labels.VALIDATE_EMPTY });
            await delay(600);

            bus.emit("step:progress", { stepId: op, lineIndex: labels.ELSE_EMPTY });
            await delay(600);

            bus.emit("step:progress", { stepId: op, lineIndex: labels.GET_PARENT_NODE });
            await delay(600);

            bus.emit("step:progress", { stepId: op, lineIndex: labels.CALL_RECURSIVE_GET });
            await delay(600);

            // Recorrido recursivo hasta el último nodo visitado durante la búsqueda del nodo padre del nuevo nodo
            await animateGetNodeSteps(treeG,
                searchSteps,
                insertionData.highlightColor,
                op,
                bus,
                {
                    IF_NULL_NODE: labels.IF_NULL_NODE,
                    RETURN_NULL: labels.RETURN_NULL,
                    IF_MATCH_NODE: labels.IF_MATCH_NODE,
                    RETURN_NODE: labels.RETURN_NODE,
                    SEARCH_LEFT: labels.SEARCH_LEFT,
                    VALIDATE_LEFT_RESULT: labels.VALIDATE_LEFT_RESULT,
                    RETURN_LEFT_RESULT: labels.RETURN_LEFT_RESULT,
                    SEARCH_RIGHT: labels.SEARCH_RIGHT
                }
            );

            bus.emit("step:progress", { stepId: op, lineIndex: labels.GET_PARENT_NODE });
            await delay(600);

            bus.emit("step:progress", { stepId: op, lineIndex: labels.IF_INVALID_PARENT });
            await delay(600);

            bus.emit("step:progress", {
                stepId: op,
                lineIndex: labels.RETURN_FALSE
            });
            if (parentNodeId) {
                // Indicador visual de que el nodo padre ya contaba con un hijo en el lado especificado
                await showTreeHint(
                    svg,
                    { type: "node", id: parentNodeId },
                    { label: `Hijo ${insertionData.side}`, value: "ya existente" },
                    positions,
                    treeOffset,
                    {
                        size: { width: 80, height: 35 },
                        typography: { labelFz: "9.8px", valueFz: "9.8px", labelFw: 800, valueFw: 800 },
                        anchor: { side: "below", dx: 10, dy: -8 },
                        palette: { bg: "#1b2330", stroke: "#14b8a6" }
                    }
                );
            } else {
                // Indicador visual de que el nodo padre indicado no existe en el árbol
                const firstVisited = insertionData.searchSteps
                    .filter(s => s.type === "match")
                    .at(0);

                await showTreeHint(
                    svg,
                    { type: "node", id: firstVisited!.at },
                    { label: "Nodo padre", value: `no ubicado` },
                    positions,
                    treeOffset,
                    {
                        size: { width: 80, height: 35 },
                        typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                        anchor: { side: "below", dx: 10, dy: -8 },
                        palette: { bg: "#1b2330", stroke: "#14b8a6" }
                    }
                );
            }
        }

        // Fin de la operación
        bus.emit("op:done", { op });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de eliminación de un nodo en un árbol binario.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param deletionData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDeleteBinaryNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    deletionData: {
        targetNodeId: string;
        parentNodeId: string | null;
        successorNodeId: string | null;
        successorParentNodeId: string | null;
        replacementNodeId: string | null;
        deleted: boolean;
        targetSide: "left" | "right" | null;
        searchSteps: BinaryTreeGetStep[];
        pathToSuccessor: string[];
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
    const labels = arbolBinarioCode.delete.labels;

    // Nodos implicados en la eliminación
    const { targetNodeId, parentNodeId, successorNodeId, successorParentNodeId, replacementNodeId, deleted } = deletionData;

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
        if (parentRemovalNodeId && replacementNodeId) {
            treeG.select<SVGGElement>(
                `g#link-${parentRemovalNodeId}-${replacementNodeId}`
            ).style("opacity", 0);
        }

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.VALIDATE_EMPTY });
        await delay(600);

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_PARENT_NODE });
        await delay(600);

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.VALIDATE_ROOT });
        await delay(600);

        if (!parentNodeId && deleted) {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RETURN_NULL });
            await delay(600);
        } else {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.CALL_RECURSIVE_GETPADRE });
            await delay(600);

            // Recorrido recursivo desde el nodo raíz hasta el nodo padre del nodo a eliminar o el último nodo visitado durante la búsqueda
            await animateGetNodeSteps(
                treeG,
                deletionData.searchSteps,
                deletionData.highlightTargetColor,
                "delete",
                bus,
                {
                    IF_NULL_NODE: labels.IF_NULL_NODE,
                    RETURN_NULL: labels.RETURN_NULL2,
                    IF_MATCH_NODE: labels.IF_MATCH_CHILD,
                    RETURN_NODE: labels.RETURN_PARENT,
                    SEARCH_LEFT: labels.SEARCH_LEFT,
                    VALIDATE_LEFT_RESULT: labels.VALIDATE_LEFT_RESULT,
                    RETURN_LEFT_RESULT: labels.RETURN_LEFT_RESULT,
                    SEARCH_RIGHT: labels.SEARCH_RIGHT
                }
            );
        }

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_PARENT_NODE });
        await delay(600);

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECLARE_NODE });
        await delay(600);

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_PARENT_NULL });
        await delay(600);

        if (!parentNodeId) {
            // Resaltado del nodo raíz
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_NODE_ROOT });
            await treeG.select(`g#${targetNodeId} circle.node-container`)
                .transition()
                .duration(800)
                .attr("fill", deletionData.highlightTargetColor)
                .end();
        } else {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_PARENT_NULL });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_PARENT_LEFT_CHILD });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_INVALID_LEFT_CHILD });
            await delay(600);

            if (deletionData.targetSide === "right") {
                bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_PARENT_RIGHT_CHILD });
                await delay(600);
            }
        }

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_NODE_NOT_FOUND });
        await delay(600);

        if (deleted) {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_NODE_LEFT_CHILDREN });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_NODE_RIGHT_CHILDREN });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_LEAF_NODE });
            await delay(600);

            let decreaseSizeLabel: number | null = null;
            let returnLabel: number | null = null;
            if (!replacementNodeId && !successorNodeId) {
                // Eliminación de nodo hoja
                bus.emit("step:progress", { stepId: "delete", lineIndex: labels.REPLACE_WITH_NULL });
                await delay(600);

                decreaseSizeLabel = labels.DEC_SIZE;
                returnLabel = labels.RETURN_TRUE;
            } else if (!successorNodeId) {
                // Eliminación de nodo con 1 hijo
                bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_SINGLE_CHILD });
                await delay(600);

                bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_ONLY_CHILD });
                await delay(600);

                bus.emit("step:progress", { stepId: "delete", lineIndex: labels.REPLACE_WITH_CHILD });
                await delay(600);

                decreaseSizeLabel = labels.DEC_SIZE2;
                returnLabel = labels.RETURN_TRUE2;
            } else {
                // Eliminación de nodo con 2 hijos
                bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_SINGLE_CHILD });
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

                bus.emit("step:progress", { stepId: "delete", lineIndex: labels.REPLACE_SUCCESSOR });
                await delay(600);

                decreaseSizeLabel = labels.DEC_SIZE3;
                returnLabel = labels.RETURN_TRUE3;
            }

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.VALIDATE_PARENT_NULL });
            await delay(600);
            if (!parentRemovalNodeId) {
                bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_ROOT });
            } else {
                bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_IF_LEFT_MATCH });
                await delay(600);

                const removalNodeSide = successorNodeId ?
                    deletionData.pathToSuccessor.length > 1 ? "left" : "right"
                    : deletionData.targetSide;
                if (removalNodeSide === "left") {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_LEFT_CHILD });
                } else {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_RIGHT_BRANCH });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_RIGHT_CHILD });
                }
            }

            // Salida y reemplazo del nodo a eliminar
            await animateReplaceChildNode(
                treeG,
                removalNodeId,
                parentRemovalNodeId,
                replacementNodeId
            );

            // Restablecimiento del fondo del nodo objetivo o el nodo padre de este
            await treeG.select<SVGCircleElement>(`g#${parentNodeId ?? targetNodeId} circle.node-container`)
                .transition()
                .duration(800)
                .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                .end();

            bus.emit("step:progress", { stepId: "delete", lineIndex: decreaseSizeLabel });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: returnLabel });
            await delay(600);

            // Limpiamos el registro del nodo eliminado
            deletionData.positions.delete(removalNodeId);

            // Reposicionamiento de los nodos y enlaces del árbol luego de la salida del nodo
            await repositionBinaryTree(treeG, deletionData.remainingNodesData, deletionData.remainingLinksData, deletionData.positions);
        } else {
            // Indicador visual de que el nodo a eliminar no existe en el árbol
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RETURN_FALSE });
            await showTreeHint(
                svg,
                { type: "node", id: targetNodeId },
                { label: `Elemento`, value: "no ubicado" },
                deletionData.positions,
                treeOffset,
                {
                    size: { width: 70, height: 35 },
                    typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
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
 * Función encargada de animar el proceso de búsqueda de un nodo en un árbol binario.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param searchData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSearchBinaryNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    searchData: {
        targetNodeId: string | null;
        found: boolean;
        searchSteps: BinaryTreeGetStep[];
        positions: Map<string, { x: number, y: number }>;
        highlightColor: string;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = arbolBinarioCode.search.labels;

    // Elementos implicados en la búsqueda 
    const { targetNodeId, found, searchSteps } = searchData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "search" });

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g#tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido (inicialmente oculto)
        const seqG = svg.select<SVGGElement>("g#seq-container");
        seqG.style("opacity", 0);

        // Grupo correspondiente al nodo objetivo
        let targetNodeGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
        if (targetNodeId) targetNodeGroup = treeG.select<SVGGElement>(`g#${targetNodeId}`);

        bus.emit("step:progress", { stepId: "search", lineIndex: labels.CHECK_NOT_NULL });
        await delay(600);

        bus.emit("step:progress", { stepId: "search", lineIndex: labels.CALL_RECURSIVE_GET });
        await delay(600);

        // Recorrido recursivo hasta el nodo objetivo o el último nodo visitado durante la búsqueda
        await animateGetNodeSteps(treeG,
            searchSteps,
            searchData.highlightColor,
            "search",
            bus,
            {
                IF_NULL_NODE: labels.IF_NULL_NODE,
                RETURN_NULL: labels.RETURN_NULL,
                IF_MATCH_NODE: labels.IF_MATCH_NODE,
                RETURN_NODE: labels.RETURN_NODE,
                SEARCH_LEFT: labels.SEARCH_LEFT,
                VALIDATE_LEFT_RESULT: labels.VALIDATE_LEFT_RESULT,
                RETURN_LEFT_RESULT: labels.RETURN_LEFT_RESULT,
                SEARCH_RIGHT: labels.SEARCH_RIGHT
            }
        );

        bus.emit("step:progress", { stepId: "search", lineIndex: labels.CHECK_NOT_NULL });
        if (!found) {
            // Indicador visual de que el nodo indicado no existe en el árbol
            const firstVisited = searchData.searchSteps
                .filter(s => s.type === "match")
                .at(0);

            await showTreeHint(
                svg,
                { type: "node", id: firstVisited!.at },
                { label: "Elemento", value: `no ubicado` },
                searchData.positions,
                treeOffset,
                {
                    size: { width: 80, height: 35 },
                    typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                    anchor: { side: "below", dx: 10, dy: -8 },
                    palette: { bg: "#1b2330", stroke: "#14b8a6" }
                }
            );
        } else {
            if (targetNodeGroup) {
                // Resaltado del nodo identificado
                await targetNodeGroup.select<SVGCircleElement>("circle.node-container")
                    .transition()
                    .duration(800)
                    .attr("fill", searchData.highlightColor)
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

                // Restablecimiento del fondo del nodo identificado
                await treeG.select<SVGCircleElement>(`g#${targetNodeId} circle.node-container`)
                    .transition()
                    .duration(800)
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .end();
            }
        }

        // Fin de la operación
        bus.emit("op:done", { op: "search" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de recorrido recursivo de un árbol.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param traversalData Objeto con información del árbol necesaria para la animación.
 * @param stepId Identificador del paso de animación actual; reenviado en los eventos de progreso emitidos.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateRecursiveTraversal(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    traversalData: {
        traversalSteps: BinaryTreeTraversalStep[];
        seqPositions: Map<string, { x: number, y: number }>;
        strokeColor: string;
        baseStroke: string;
        baseStrokeWidth: number;
    },
    stepId: string,
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = arbolBinarioCode[stepId].labels;

    // Elementos implicados en el recorrido
    const { traversalSteps, seqPositions, strokeColor } = traversalData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: stepId });

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g#tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido
        const seqG = svg.select<SVGGElement>("g#seq-container");
        seqG.style("opacity", 1);

        bus.emit("step:progress", { stepId, lineIndex: labels.DECLARE_LIST });
        await delay(600);

        bus.emit("step:progress", { stepId, lineIndex: labels.CALL_RECURSIVE_INORDER });
        await delay(600);

        for (const step of traversalSteps) {
            switch (step.type) {
                case "checkNull": {
                    bus.emit("step:progress", {
                        stepId,
                        lineIndex: labels.IF_NULL_NODE
                    });
                    if (step.isNull) {
                        await delay(600);
                        bus.emit("step:progress", {
                            stepId,
                            lineIndex: labels.RETURN_NULL
                        });
                        await delay(600);
                    } else {
                        // Resaltado del nodo actual
                        await treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("stroke", strokeColor)
                            .attr("stroke-width", 2)
                            .end();
                    }
                    break;
                }
                case "goLeft": {
                    // Restablecimiento de los bordes del nodo actual antes de pasar al siguiente
                    bus.emit("step:progress", { stepId, lineIndex: labels.CALL_LEFT });
                    await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                        .transition()
                        .duration(800)
                        .attr("stroke", traversalData.baseStroke)
                        .attr("stroke-width", traversalData.baseStrokeWidth)
                        .end();
                    break;
                }
                case "visit": {
                    const nodeCircleElement = treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`);
                    const seqText = seqG.select<SVGTextElement>(`text#${step.at}`);

                    // Creación del anillo de pulso
                    bus.emit("step:progress", { stepId, lineIndex: labels.VISIT_NODE });
                    const pulseRing = nodeCircleElement
                        .select(function () {
                            // Selección del grupo g padre del círculo
                            return (this!.parentNode as SVGGElement) || this!;
                        })
                        .append("circle")
                        .attr("class", "pulse-ring")
                        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS + 2)
                        .attr("fill", "none")
                        .attr("stroke", strokeColor)
                        .attr("stroke-width", 2)
                        .style("opacity", 0.9);

                    // Pulsación del nodo
                    await pulseRing
                        .transition()
                        .duration(600)
                        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS + 12)
                        .style("opacity", 0)
                        .remove()
                        .end();

                    // Bounce del nodo
                    await nodeCircleElement
                        .transition()
                        .duration(300)
                        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS * 1.12)
                        .transition()
                        .duration(300)
                        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
                        .end();

                    // Posicionamiento del valor en la secuencia de valores de recorrido
                    await seqText
                        .transition()
                        .duration(800)
                        .attr("transform", () => {
                            const finalPos = seqPositions.get(step.at)!;
                            return `translate(${finalPos.x}, ${finalPos.y})`;
                        })
                        .end();
                    break;
                }
                case "goRight": {
                    // Restablecimiento de los bordes del nodo actual antes de pasar al siguiente
                    bus.emit("step:progress", { stepId, lineIndex: labels.CALL_RIGHT });
                    await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                        .transition()
                        .duration(800)
                        .attr("stroke", traversalData.baseStroke)
                        .attr("stroke-width", traversalData.baseStrokeWidth)
                        .end();
                    break;
                }
                case "return": {
                    if (step.to !== null && step.via !== null) {
                        const lineToRemark = step.via === "left" ? labels.CALL_LEFT : labels.CALL_RIGHT;
                        bus.emit("step:progress", {
                            stepId,
                            lineIndex: lineToRemark
                        });
                    }

                    if (step.from) {
                        // Restablecimiento de los bordes del nodo en la llamada actual (backtracking)
                        await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("stroke", traversalData.baseStroke)
                            .attr("stroke-width", traversalData.baseStrokeWidth)
                            .end();
                    }

                    if (step.to) {
                        // Resaltado del nodo en la nueva llamada (backtracking)
                        await treeG.select<SVGCircleElement>(`g#${step.to} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("stroke", strokeColor)
                            .attr("stroke-width", 2)
                            .end();
                    }
                    break;
                }
            }
        }
        bus.emit("step:progress", { stepId, lineIndex: labels.CALL_RECURSIVE_INORDER });
        await delay(600);

        bus.emit("step:progress", {
            stepId: stepId,
            lineIndex: labels.RETURN_LIST
        });
        await delay(600);

        // Fin de la operación
        bus.emit("op:done", { op: stepId });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de recorrido por niveles de un árbol.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param traversalData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateLevelOrderTraversal(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    traversalData: {
        traversalSteps: BinaryTreeLevelStep[];
        seqPositions: Map<string, { x: number, y: number }>;
        highlightColor: string;
        baseStroke: string;
        baseStrokeWidth: number;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = arbolBinarioCode.getLevelOrder.labels;

    // Elementos implicados en el recorrido
    const { traversalSteps, seqPositions, highlightColor } = traversalData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "getLevelOrder" });

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g#tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido
        const seqG = svg.select<SVGGElement>("g#seq-container");
        seqG.style("opacity", 1);

        // Estado lógico de la cola
        const queue: string[] = [];

        // Setup etiqueta cola
        let queueLabel = seqG.select<SVGTextElement>("text#queue-label");
        if (queueLabel.empty()) {
            queueLabel = seqG
                .append("text")
                .attr("id", "queue-label")
                .attr("transform", `translate(${-12}, ${SVG_BINARY_TREE_VALUES.ROW_QUEUE_Y - 25})`)
                .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
                .style("font-weight", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_WEIGHT)
                .style("font-size", "14px")
                .text("Cola:");
        }

        // Setup etiqueta nodo
        let nodeLabel = seqG.select<SVGTextElement>("text#node-label");
        if (nodeLabel.empty()) {
            nodeLabel = seqG
                .append("text")
                .attr("id", "queue-label")
                .attr("transform", `translate(${-12}, ${SVG_BINARY_TREE_VALUES.ROW_QUEUE_Y + 30})`)
                .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
                .style("font-weight", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_WEIGHT)
                .style("font-size", "14px")
                .text("Nodo:");
        }

        bus.emit("step:progress", { stepId: "getLevelOrder", lineIndex: labels.DECLARE_LIST });
        await delay(600);

        bus.emit("step:progress", { stepId: "getLevelOrder", lineIndex: labels.VALIDATE_EMPTY });
        await delay(600);

        bus.emit("step:progress", { stepId: "getLevelOrder", lineIndex: labels.DECLARE_QUEUE });
        await delay(600);

        for (const step of traversalSteps) {
            switch (step.type) {
                case "checkEmpty": {
                    bus.emit("step:progress", {
                        stepId: "getLevelOrder",
                        lineIndex: labels.WHILE_CHECK
                    });
                    await delay(600);
                    break;
                }
                case "checkChild": {
                    if (step.side === "left") {
                        bus.emit("step:progress", { stepId: "getLevelOrder", lineIndex: labels.IF_LEFT_NOT_NULL });
                        await delay(600);
                    } else {
                        bus.emit("step:progress", { stepId: "getLevelOrder", lineIndex: labels.IF_RIGHT_NOT_NULL });
                        await delay(600);
                    }
                    break;
                }
                case "enqueue": {
                    const enqueueLabel = step.origin === "root" ? labels.ENQUEUE_ROOT
                        : step.origin === "left" ? labels.ENQUEUE_LEFT
                            : labels.ENQUEUE_RIGHT;
                    bus.emit("step:progress", { stepId: "getLevelOrder", lineIndex: enqueueLabel });

                    // Resaltado del nodo actual procesado
                    const nodeCircleElement = treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`);
                    await nodeCircleElement
                        .transition()
                        .duration(800)
                        .attr("stroke", highlightColor)
                        .attr("stroke-width", 2)
                        .end();

                    // Creación del anillo de pulso
                    const pulseRing = nodeCircleElement
                        .select(function () {
                            // Selección del grupo g padre del círculo
                            return (this!.parentNode as SVGGElement) || this!;
                        })
                        .append("circle")
                        .attr("class", "pulse-ring")
                        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS + 2)
                        .attr("fill", "none")
                        .attr("stroke", highlightColor)
                        .attr("stroke-width", 2)
                        .style("opacity", 0.9);

                    // Pulsación del nodo
                    await pulseRing
                        .transition()
                        .duration(500)
                        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS + 12)
                        .style("opacity", 0)
                        .remove()
                        .end();

                    // Bounce del nodo
                    await nodeCircleElement
                        .transition()
                        .duration(250)
                        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS * 1.12)
                        .transition()
                        .duration(250)
                        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
                        .end();

                    // Restaurar borde
                    await nodeCircleElement
                        .transition()
                        .duration(800)
                        .attr("stroke", traversalData.baseStroke)
                        .attr("stroke-width", traversalData.baseStrokeWidth)
                        .end();

                    // Añadir elemento al estado lógico
                    queue.push(step.at);
                    const queueIndex = queue.length - 1;

                    // Posicionamiento del valor en la cola 
                    const seqText = seqG.select<SVGTextElement>(`text#${step.at}`);
                    const targetX = queueIndex * SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING;
                    await seqText
                        .transition()
                        .duration(800)
                        .attr("transform", `translate(${targetX}, ${SVG_BINARY_TREE_VALUES.ROW_QUEUE_Y})`)
                        .end();
                    break;
                }
                case "dequeue": {
                    bus.emit("step:progress", { stepId: "getLevelOrder", lineIndex: labels.DEQUEUE_NODE });

                    // Eliminar elemento tope del estado lógico
                    queue.shift();

                    // Posicionamiento del elemento tope fuera de la cola
                    const seqText = seqG.select<SVGTextElement>(`text#${step.at}`);
                    await seqText
                        .transition()
                        .duration(800)
                        .attr("transform", `translate(${0}, ${SVG_BINARY_TREE_VALUES.ROW_QUEUE_Y + 50})`)
                        .end();

                    // Ajuste de los elementos restantes en la cola
                    for (let i = 0; i < queue.length; i++) {
                        const qId = queue[i];
                        const newX = i * SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING;

                        await seqG
                            .select<SVGTextElement>(`text#${qId}`)
                            .transition()
                            .duration(800)
                            .attr("transform", `translate(${newX}, ${SVG_BINARY_TREE_VALUES.ROW_QUEUE_Y})`)
                            .end();
                    }
                    break;
                }
                case "visit": {
                    // Posicionamiento del valor en la secuencia de valores de recorrido
                    bus.emit("step:progress", { stepId: "getLevelOrder", lineIndex: labels.VISIT_NODE });
                    const finalValuePos = seqPositions.get(step.at)!;
                    const seqText = seqG.select<SVGTextElement>(`text#${step.at}`);
                    await seqText
                        .transition()
                        .duration(800)
                        .attr("transform", `translate(${finalValuePos.x}, ${finalValuePos.y})`)
                        .end();
                    break;
                }
            }
        }
        bus.emit("step:progress", { stepId: "getLevelOrder", lineIndex: labels.WHILE_CHECK });
        await delay(600);

        bus.emit("step:progress", {
            stepId: "getLevelOrder",
            lineIndex: labels.RETURN_LIST
        });
        await delay(600);

        // Desvanecimiento de la etiqueta de cola
        if (!queueLabel.empty()) {
            await queueLabel
                .transition()
                .duration(600)
                .style("opacity", 0)
                .end();
            queueLabel.remove();
        }

        // Desvanecimiento de la etiqueta de nodo
        if (!nodeLabel.empty()) {
            await nodeLabel
                .transition()
                .duration(600)
                .style("opacity", 0)
                .end();
            nodeLabel.remove();
        }

        // Fin de la operación
        bus.emit("op:done", { op: "getLevelOrder" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar la búsqueda recursiva de un nodo en un árbol binario.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param steps Array de objetos de paso que describen la progresión del algoritmo de búsqueda.
 * @param highlightColor Color usado para el resaltado de los nodos durante la búsqueda.
 * @param stepId Identificador del paso de animación actual; reenviado en los eventos de progreso emitidos.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param labels Objeto de mapeo que asocia etiquetas semánticas con índices de línea numéricos usados en los eventos emitidos.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
async function animateGetNodeSteps(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    steps: BinaryTreeGetStep[],
    highlightColor: string,
    stepId: string,
    bus: EventBus,
    labels: {
        IF_NULL_NODE: number,
        RETURN_NULL: number,
        IF_MATCH_NODE: number,
        RETURN_NODE: number,
        SEARCH_LEFT: number,
        VALIDATE_LEFT_RESULT: number,
        RETURN_LEFT_RESULT: number,
        SEARCH_RIGHT: number
    }
) {
    for (const step of steps) {
        switch (step.type) {
            case "checkNull": {
                bus.emit("step:progress", {
                    stepId,
                    lineIndex: labels.IF_NULL_NODE
                });
                if (step.isNull) {
                    await delay(600);
                    bus.emit("step:progress", {
                        stepId,
                        lineIndex: labels.RETURN_NULL
                    });
                    await delay(600);
                } else {
                    // Resaltado del nodo actual
                    await treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`)
                        .transition()
                        .duration(800)
                        .attr("fill", highlightColor)
                        .end();
                }
                break;
            }
            case "match": {
                bus.emit("step:progress", { stepId, lineIndex: labels.IF_MATCH_NODE });
                await delay(600);

                if (step.found) {
                    // Pulsación del nodo encontrado
                    bus.emit("step:progress", { stepId, lineIndex: labels.RETURN_NODE });
                    await treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`)
                        .transition()
                        .duration(300)
                        .attr("r", 30)
                        .transition()
                        .duration(300)
                        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
                        .end();
                }
                break;
            }
            case "goLeft": {
                // Restablecimiento del fondo del nodo actual antes de pasar al siguiente
                bus.emit("step:progress", { stepId, lineIndex: labels.SEARCH_LEFT });
                await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                    .transition()
                    .duration(800)
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .end();
                break;
            }
            case "checkLeftResult": {
                bus.emit("step:progress", { stepId, lineIndex: labels.VALIDATE_LEFT_RESULT });
                await delay(600);

                if (step.found) {
                    bus.emit("step:progress", { stepId, lineIndex: labels.RETURN_LEFT_RESULT });
                    await delay(600);
                }
                break;
            }
            case "goRight": {
                // Restablecimiento del fondo del nodo actual antes de pasar al siguiente
                bus.emit("step:progress", { stepId, lineIndex: labels.SEARCH_RIGHT });
                await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                    .transition()
                    .duration(800)
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .end();
                break;
            }
            case "return": {
                if (step.to !== null && step.via !== "root") {
                    const lineToRemark = step.via === "left" ? labels.SEARCH_LEFT : labels.SEARCH_RIGHT;
                    bus.emit("step:progress", {
                        stepId,
                        lineIndex: lineToRemark
                    });
                    if (step.found) await delay(800);
                }

                if (!step.found) {
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
                            .attr("fill", highlightColor)
                            .end();
                    }
                }
                break;
            }
        }
    }
}

/**
 * Función encargada de animar el reemplazo de un nodo hijo en un árbol.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param removalNodeId ID del nodo a ser reemplazado.
 * @param parentNodeId ID del nodo padre, o null si el nodo a eliminar es la raíz.
 * @param replacementNodeId ID del nodo que reemplaza al nodo a eliminar, o null si no hay reemplazo.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateReplaceChildNode(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    removalNodeId: string,
    parentNodeId: string | null,
    replacementNodeId: string | null
) {
    // Grupo correspondiente al nodo a eliminar
    const removalNodeGroup = treeG.select<SVGGElement>(`g#${removalNodeId}`);

    // Grupo correspondiente al actual enlace formado entre el nodo padre y el nodo a eliminar
    const parentRemovalNodeCurrLinkGroup = parentNodeId
        ? treeG.select<SVGGElement>(`g#link-${parentNodeId}-${removalNodeId}`)
        : null;

    // Grupo correspondiente al nuevo enlace formado entre el nodo padre del nodo a eliminar y su reemplazo 
    const parentRemovalNodeNewLinkGroup = parentNodeId && replacementNodeId
        ? treeG.select<SVGGElement>(`g#link-${parentNodeId}-${replacementNodeId}`)
        : null;

    // Grupo correspondiente al enlace formado entre el nodo a eliminar y el nodo que tomara su lugar
    const removalNodeLinkGroup = replacementNodeId
        ? treeG.select<SVGGElement>(`g#link-${removalNodeId}-${replacementNodeId}`)
        : null;

    // Desconexión del actual enlace formado entre el nodo padre y el nodo a eliminar
    if (parentRemovalNodeCurrLinkGroup) {
        await parentRemovalNodeCurrLinkGroup
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Desconexión del enlace formado entre el nodo a eliminar y el nodo que tomara su lugar
    if (removalNodeLinkGroup) {
        await removalNodeLinkGroup
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Animación de salida del nodo a eliminar
    await defaultDeleteTreeNode(removalNodeGroup);

    if (parentNodeId && replacementNodeId) {
        // Forma inicial del nuevo enlace entre el nodo padre del nodo a eliminar y su reemplazo
        updateTreeLinkPath(treeG, parentNodeId, replacementNodeId, SVG_BINARY_TREE_VALUES.NODE_RADIUS, straightPath);

        // Establecimiento del nuevo enlace formado entre el nodo padre del nodo a eliminar y su reemplazo
        await parentRemovalNodeNewLinkGroup!
            .transition()
            .duration(800)
            .style("opacity", 1)
            .end();
    }
}

/**
 * Función encargada de animar el proceso de búsqueda y resaltado del sucesor in-orden en un árbol binario.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param pathIds Array de IDs de nodos que representan la ruta al sucesor.
 * @param highlightColor Color usado para el resaltado de los nodos durante el recorrido.
 * @param stepId Identificador del paso de animación actual; reenviado en los eventos de progreso emitidos.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param labels Objeto de mapeo que asocia etiquetas semánticas con índices de línea numéricos usados en los eventos emitidos.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateGetInOrderSuccessor(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    pathIds: string[],
    highlightColor: string,
    stepId: string,
    bus: EventBus,
    labels: {
        DECLARE_SUCC_PARENT: number,
        DECLARE_SUCC_NODE: number,
        WHILE_TRAVERSAL: number,
        SET_SUCC_PARENT: number,
        SET_SUCC_NODE: number,
    }
) {
    bus.emit("step:progress", { stepId, lineIndex: labels.DECLARE_SUCC_PARENT });
    await delay(600);

    bus.emit("step:progress", { stepId, lineIndex: labels.DECLARE_SUCC_NODE });
    await delay(600);

    for (let i = 0; i < pathIds.length - 1; i++) {
        // Selección del grupo correspondiente al nodo actual
        const currCircleElement = treeG.select<SVGCircleElement>(`g#${pathIds[i]} circle.node-container`);

        // Resaltado del nodo actual
        bus.emit("step:progress", { stepId, lineIndex: labels.WHILE_TRAVERSAL });
        await currCircleElement
            .transition()
            .duration(800)
            .attr("stroke", highlightColor)
            .attr("stroke-width", 3)
            .end();

        bus.emit("step:progress", { stepId, lineIndex: labels.SET_SUCC_PARENT });
        await delay(600);

        // Restablecimiento del fondo original del nodo actual (antes de pasar al sig. nodo)
        bus.emit("step:progress", { stepId, lineIndex: labels.SET_SUCC_NODE });
        await currCircleElement
            .transition()
            .duration(800)
            .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
            .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
            .end();
    }

    // Resaltado final del elemento objetivo
    bus.emit("step:progress", { stepId, lineIndex: labels.WHILE_TRAVERSAL });
    const targetElement = treeG.select<SVGCircleElement>(`g#${pathIds[pathIds.length - 1]} circle.node-container`);
    await targetElement
        .transition()
        .duration(800)
        .attr("stroke", highlightColor)
        .attr("stroke-width", 3)
        .end();
}

/**
 * Función encargada de animar la inserción de un nuevo nodo siguiendo la lógica de un árbol binario de búsqueda.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param seqG Selección D3 del elemento SVG del grupo (`<g>`) que contiene la secuencia de valores de recorrido.
 * @param data Objeto con información del árbol necesaria para la animación (nodos, enlaces, posiciones, rutas).
 * @param opts Objeto con opciones de animación para la aparición, resaltado y reposicionamiento de nodos.
 */
export async function animateBSTInsertCore(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    seqG: Selection<SVGGElement, unknown, null, undefined>,
    data: {
        newNodeId: string;
        parentId: string | null;
        nodesData: HierarchyNode<HierarchyNodeData<number>>[];
        linksData: TreeLinkData[];
        pathToParent: string[];
        positions: Map<string, { x: number, y: number }>;
    },
    opts: {
        reposition: (
            g: Selection<SVGGElement, unknown, null, undefined>,
            nodes: HierarchyNode<HierarchyNodeData<number>>[],
            linksData: TreeLinkData[],
            positions: Map<string, { x: number; y: number }>
        ) => Promise<void>;
        appearNode: (
            nodeGroup: Selection<SVGGElement, unknown, null, undefined>
        ) => Promise<void>;
        highlight: (
            g: Selection<SVGGElement, unknown, null, undefined>,
            path: string[],
            highlightColor: string
        ) => Promise<void>;
        highlightColor: string;
    }
) {
    // Elementos del árbol requeridos para la animación
    const { newNodeId, parentId, nodesData, linksData, pathToParent, positions } = data;

    // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
    seqG.style("opacity", 0);

    // Grupo del lienzo correspondiente al nuevo nodo
    const newNodeGroup = treeG.select<SVGGElement>(`g#${newNodeId}`);

    // Estado inicial del nuevo nodo
    newNodeGroup.style("opacity", 0);

    if (parentId) {
        // Grupo del lienzo correspondiente al nuevo enlace del nodo padre que apunta al nuevo nodo
        const newParentLinkGroup = treeG.select<SVGGElement>(
            `g#link-${parentId}-${newNodeId}`
        );

        // Estado visual inicial del nuevo enlace
        newParentLinkGroup.style("opacity", 0);

        // Reposicionamiento de los nodos y enlaces del árbol antes de insertar
        await opts.reposition(treeG, nodesData, linksData, positions);

        // Animación de recorrido desde el nodo raíz hasta el nodo padre del nuevo nodo
        await opts.highlight(treeG, pathToParent, opts.highlightColor);

        // Animación de aparición del nuevo nodo
        await opts.appearNode(newNodeGroup);

        // Establecimiento del enlace entre el nodo padre al nuevo nodo
        await newParentLinkGroup
            .transition()
            .duration(800)
            .style("opacity", 1)
            .end();
    } else {
        // Animación de aparición simple del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    }
}

/**
 * Función encargada de animar el proceso de eliminación de un nodo hoja o un nodo con un único hijo en un árbol ABB.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param nodeToDeleteId ID del nodo a eliminar.
 * @param parentNodeId ID del nodo padre del nodo a eliminar o null si el nodo a eliminar es la raíz.
 * @param childNodeId ID del nodo hijo del nodo a eliminar o null si el nodo a eliminar no tiene hijos.
 * @param pathToParent Lista de IDs de los nodos que representan el camino desde la raíz hasta el padre del nodo a eliminar.
 * @param opts Objeto con opciones de animación para el desvanecimiento, resaltado de nodos y dibujado de enlaces.
 */
export async function animateLeafOrSingleChild(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    nodeToDeleteId: string | null,
    parentNodeId: string | null,
    childNodeId: string | null,
    pathToParent: string[],
    opts: {
        deleteNode: (
            nodeGroup: Selection<SVGGElement, unknown, null, undefined>
        ) => Promise<void>;
        highlightNodePath: (
            g: Selection<SVGGElement, unknown, null, undefined>,
            path: string[],
            highlightColor: string
        ) => Promise<void>;
        highlightColor: string;
        buildPath: LinkPathFn;
    }
) {
    // Grupo del lienzo correspondiente al nodo a eliminar
    const removedG = treeG.select<SVGGElement>(`g#${nodeToDeleteId}`);

    // Grupo del lienzo correspondiente al nuevo enlace formado entre el nodo padre y el nodo hijo del nodo a elimimar (solo si ambos están presentes)
    const newParentLinkGroup = parentNodeId && childNodeId
        ? treeG.select<SVGGElement>(`g#link-${parentNodeId}-${childNodeId}`)
        : null;

    // Grupo del lienzo correspondiente al enlace a eliminar entre el nodo padre y el nodo a eliminar (solo si el padre esta presente)
    const parentRemovalLinkGroup = parentNodeId
        ? treeG.select<SVGGElement>(`g#link-${parentNodeId}-${nodeToDeleteId}`)
        : null;

    // Grupo del lienzo correspondiente al enlace a eliminar entre el nodo a eliminar y su nodo hijo (solo si el hijo esta presente)
    const removalNodeLinkGroup = childNodeId
        ? treeG.select<SVGGElement>(`g#link-${nodeToDeleteId}-${childNodeId}`)
        : null;

    // Estado visual inicial del nuevo enlace entre el nodo padre y nodo hijo del nodo a eliminar (si aplica)
    if (newParentLinkGroup) {
        newParentLinkGroup.style("opacity", 0);
    }

    // Si el nodo a eliminar cuenta con nodo padre
    if (parentRemovalLinkGroup) {
        // Animación de recorrido desde el nodo raíz hasta el nodo padre del nodo a eliminar
        await opts.highlightNodePath(treeG, pathToParent, opts.highlightColor);

        // Desconexión del enlace entre el nodo padre y el nodo a eliminar
        await parentRemovalLinkGroup
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Desconexión del enlace entre el nodo a eliminar y su hijo (si el nodo a eliminar cuenta con uno)
    if (removalNodeLinkGroup) {
        await removalNodeLinkGroup
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Animación de salida del nodo a eliminar
    await opts.deleteNode(removedG);

    // Si el nodo a eliminar cuenta tanto con un nodo padre y un nodo hijo
    if (newParentLinkGroup) {
        // Establecemos la forma inicial del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        updateTreeLinkPath(treeG, parentNodeId!, childNodeId!, SVG_BINARY_TREE_VALUES.NODE_RADIUS, opts.buildPath);

        // Aparición del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        await newParentLinkGroup
            .transition()
            .duration(800)
            .style("opacity", 1)
            .end();
    }
}

/**
 * Función encargada de animar el proceso de eliminación de un nodo con 2 hijos en un árbol ABB.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param nodeToDeleteId ID del nodo a eliminar.
 * @param nodeToUpdateId ID del nodo que actualizará su valor.
 * @param parentNodeId ID del nodo padre del nodo a eliminar.
 * @param childNodeId ID del nodo hijo del nodo a eliminar o null si el nodo a eliminar no tiene hijos.
 * @param pathToUpdateNode Lista de IDs de los nodos que representan el camino desde la raíz hasta el nodo a actualizar.
 * @param pathToRemovalNode Lista de IDs de los nodos que representan el camino desde el nodo a actualizar hasta el nodo a eliminar.
 * @param opts Objeto con opciones de animación para el resaltado de nodos.
 */
export async function animateTwoChildren(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    nodeToDeleteId: string,
    nodeToUpdateId: string,
    parentNodeId: string,
    childNodeId: string | null,
    pathToUpdateNode: string[],
    pathToRemovalNode: string[],
    opts: {
        highlightNodePath: (
            treeG: Selection<SVGGElement, unknown, null, undefined>,
            path: string[],
            highlightColor: string
        ) => Promise<void>,
        highlightTargetColor: string,
        highlightSuccessorColor: string
    }
) {
    // Grupo del lienzo correspondiente al nodo a eliminar
    const removedG = treeG.select<SVGGElement>(`g#${nodeToDeleteId}`);

    // Grupo del lienzo correspondiente al nodo a actualizar
    const updatedG = treeG.select<SVGGElement>(`g#${nodeToUpdateId}`);

    // Grupo del lienzo correspondiente al enlace a eliminar entre el nodo padre y el nodo a eliminar
    const removalParentLinkGroup = treeG.select<SVGGElement>(`g#link-${parentNodeId}-${nodeToDeleteId}`);

    // Grupo del lienzo correspondiente al nuevo enlace entre el nodo padre y el nodo hijo del nodo a eliminar (solo si el nodo a eliminar cuenta con un nodo hijo)
    const newParentLinkGroup = childNodeId
        ? treeG.select<SVGGElement>(`g#link-${parentNodeId}-${childNodeId}`)
        : null;

    // Grupo del lienzo correspondiente al enlace a eliminar entre el nodo a eliminar y su nodo hijo (solo si el nodo a eliminar cuenta con un nodo hijo)
    const removalNodeLinkGroup = childNodeId
        ? treeG.select<SVGGElement>(`g#link-${nodeToDeleteId}-${childNodeId}`)
        : null;

    // Estado visual inicial del nuevo enlace entre el nodo padre y el nodo hijo del nodo a eliminar (si aplica)
    if (newParentLinkGroup) {
        newParentLinkGroup.select("path.tree-link").style("opacity", 0);
    }

    // Animación de recorrido desde el nodo raíz hasta el nodo que actualizará su valor
    await opts.highlightNodePath(treeG, pathToUpdateNode, opts.highlightTargetColor);

    // Animación de recorrido desde el nodo a actualizar hasta el nodo a eliminar
    for (const nodeId of pathToRemovalNode) {
        // Selección del círculo contenedor del nodo actual
        const nodeCircleGroup = treeG.select<SVGGElement>(`g#${nodeId} circle.node-container`);

        // Resaltado de bordes del contenedor del nodo actual
        await nodeCircleGroup
            .transition()
            .duration(800)
            .attr("stroke", opts.highlightSuccessorColor)
            .attr("stroke-width", 3)
            .end();

        if (nodeId !== nodeToDeleteId) {
            // Restablecimiento del borde original
            await nodeCircleGroup
                .transition()
                .duration(800)
                .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                .end();
        }
    }

    // Desvanecimiento del valor actual del nodo a actualizar
    await updatedG.select("text")
        .transition()
        .duration(800)
        .style("opacity", 0)
        .end();

    // Actualizar el valor del nodo copiando el valor del nodo a eliminar
    updatedG.select("text").text(removedG.select<SVGTextElement>("text").text());

    // Aparición del nuevo valor del nodo a actualizar
    await updatedG.select("text")
        .transition()
        .duration(800)
        .style("opacity", 1)
        .end();

    // Desconexión del enlace entre el nodo padre y el nodo a eliminar
    await removalParentLinkGroup
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove()
        .end();

    // Desconexión del enlace entre el nodo a eliminar y su hijo (solo si el nodo a eliminar cuenta con un hijo)
    if (removalNodeLinkGroup) {
        await removalNodeLinkGroup
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Animación de salida del nodo a eliminar
    await defaultDeleteTreeNode(removedG);

    // Si el nodo a eliminar cuenta con un nodo hijo
    if (newParentLinkGroup) {
        // Establecemos la forma inicial del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        updateTreeLinkPath(treeG, parentNodeId, childNodeId!, SVG_BINARY_TREE_VALUES.NODE_RADIUS, straightPath);

        // Aparición del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        await newParentLinkGroup.select("path.tree-link")
            .transition()
            .duration(800)
            .style("opacity", 1)
            .end();
    }
}

/**
 * Función encargada de resaltar secuencialmente cada nodo del árbol binario a lo largo de un camino dado.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param pathIds Array con los identificadores de los nodos que representan el camino a resaltar. El orden determina la secuencia de resaltado.
 * @param highlightColor Color a usar para resaltar el contenedor de cada nodo a lo largo del camino.
 */
export async function highlightBinaryTreePath(
    g: Selection<SVGGElement, unknown, null, undefined>,
    pathIds: string[],
    highlightColor: string
) {
    for (const nodeId of pathIds) {
        // Selección del grupo contenedor del nodo actual
        const nodeCircle = g.select<SVGGElement>(`g#${nodeId} circle.node-container`);

        // Resaltado del nodo actual
        await nodeCircle
            .transition()
            .duration(800)
            .attr("fill", highlightColor)
            .end();

        // Restablecimiento del fondo original del último nodo visitado
        if (nodeId !== pathIds[pathIds.length - 1]) {
            await nodeCircle
                .transition()
                .duration(800)
                .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                .end();
        }
    }
}

/**
 * Función encargada de animar el proceso de rotación de los nodos en un árbol binario de búsqueda especial.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param parentOfUnbalanced ID del nodo padre del nodo desbalanceado (o null si no hay).
 * @param unbalancedNode ID del nodo desbalanceado (el nodo donde ocurre la rotación).
 * @param sonOfUnbalanced ID del nodo hijo involucrado en la rotación.
 * @param rotationNode ID del nodo del subárbol afectado por la rotación (o null si no hay).
 * @param repositionStrategy Función asincrona encargada de reposicionar los nodos y enlaces al aplicarse la rotación.
 * @param repositionData Objeto que contiene información de los nodos, enlaces y sus posiciones al rotar.
 */
export async function animateEspecialBSTsRotation(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    parentOfUnbalanced: string | null,
    unbalancedNode: string,
    sonOfUnbalanced: string,
    rotationNode: string | null,
    repositionStrategy: (
        g: Selection<SVGGElement, unknown, null, undefined>,
        nodes: HierarchyNode<HierarchyNodeData<number>>[],
        linksData: TreeLinkData[],
        positions: Map<string, { x: number; y: number }>
    ) => Promise<void>,
    repositionData: {
        nodes: HierarchyNode<HierarchyNodeData<number>>[];
        links: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
    }
) {
    // Obtenemos los datos de reposicionamiento
    const { nodes, links, positions } = repositionData;

    // Fade out del nuevo enlace entre p y y (si p)
    if (parentOfUnbalanced) {
        treeG.select<SVGGElement>(`g#link-${parentOfUnbalanced}-${sonOfUnbalanced} path.tree-link`)
            .style("opacity", 0);
    }

    // Fade out del nuevo enlace entre y y z
    treeG.select<SVGGElement>(`g#link-${sonOfUnbalanced}-${unbalancedNode} path.tree-link`)
        .style("opacity", 0);

    // Fade out del nuevo enlace entre z y B (si B)
    if (rotationNode) {
        treeG.select<SVGGElement>(`g#link-${unbalancedNode}-${rotationNode} path.tree-link`)
            .style("opacity", 0);
    }

    // Eliminar enlace previo entre p y z (si p)
    if (parentOfUnbalanced) {
        await treeG.select<SVGGElement>(`g#link-${parentOfUnbalanced}-${unbalancedNode}`)
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Eliminar enlace previo entre z y y
    await treeG.select<SVGGElement>(`g#link-${unbalancedNode}-${sonOfUnbalanced}`)
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove()
        .end();

    // Eliminar enlace previo entre y y B (si B)
    if (rotationNode) {
        await treeG.select<SVGGElement>(`g#link-${sonOfUnbalanced}-${rotationNode}`)
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Reposicionamiento de los nodos y enlaces del árbol
    await repositionStrategy(treeG, nodes, links, positions);

    // Fade in del nuevo enlace entre p y y (si p)
    if (parentOfUnbalanced) {
        await treeG.select<SVGGElement>(`g#link-${parentOfUnbalanced}-${sonOfUnbalanced} path.tree-link`)
            .transition()
            .duration(800)
            .style("opacity", 1)
            .end();
    }

    // Fade in del nuevo enlace entre y y z
    await treeG.select<SVGGElement>(`g#link-${sonOfUnbalanced}-${unbalancedNode} path.tree-link`)
        .transition()
        .duration(800)
        .style("opacity", 1)
        .end();

    // Fade in del nuevo enlace entre z y B (si B)
    if (rotationNode) {
        await treeG.select<SVGGElement>(`g#link-${unbalancedNode}-${rotationNode} path.tree-link`)
            .transition()
            .duration(800)
            .style("opacity", 1)
            .end();
    }
}

/**
 * Función encargada de actualizar el enlace entre el nodo padre y su hijo en base a sus posiciones actuales.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param parentId ID del nodo padre.
 * @param childId ID del nodo hijo.
 * @param r Radio del contenedor del nodo.
 * @param buildPath Función encargada de construir el SVG path del enlace entre 2 posiciones.
 */
export function updateTreeLinkPath(
    g: Selection<SVGGElement, unknown, null, undefined>,
    parentId: string,
    childId: string,
    r: number,
    buildPath: LinkPathFn
) {
    // Seleccionamos el nodo padre y el hijo
    const childNodeGroup = g.select<SVGGElement>(`g#${childId}`).node();
    const parentNodeGroup = g.select<SVGGElement>(`g#${parentId}`).node();

    if (!childNodeGroup || !parentNodeGroup) return;

    // Consolidamos todas las transformaciones
    const childForm = childNodeGroup.transform.baseVal.consolidate();
    const parentForm = parentNodeGroup.transform.baseVal.consolidate();

    if (!childForm || !parentForm) return;

    // Extraemos las posiciones actuales del nodo padre e hijo
    const { e: px, f: py } = parentForm.matrix;
    const { e: cx, f: cy } = childForm.matrix;

    // Construimos el nuevo "d"
    const d = buildPath({ x: px, y: py }, { x: cx, y: cy }, r);

    // Aplicamos el nuevo enlace al elemento path
    g.select<SVGGElement>(`g#link-${parentId}-${childId} path.tree-link`)
        .attr("d", d);
}

/**
 * Función encargada de reubicar los nodos y ajustar los enlaces de conexión de un árbol binario.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param nodes Array de nodos de jerarquía que representan la estructura del árbol.
 * @param linksData Array de objetos de datos de enlace que representan las conexiones entre nodos.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @returns Una promesa que se resuelve cuando se han completado todas las transiciones de nodos y enlaces.
 */
async function repositionBinaryTree(
    g: Selection<SVGGElement, unknown, null, undefined>,
    nodes: HierarchyNode<HierarchyNodeData<number>>[],
    linksData: TreeLinkData[],
    positions: Map<string, { x: number; y: number }>
) {
    return repositionTree(g, nodes, linksData, positions, straightPath);
}