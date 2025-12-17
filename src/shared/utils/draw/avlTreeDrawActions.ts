import type { HierarchyNode, Selection } from "d3";
import { AVLDeleteStep, AvlFrame, AVLInsertStep, HierarchyNodeData, RotationStep, TreeLinkData } from "../../../domain/utils/types";
import { defaultAppearTreeNode, drawTreeLinks, drawTreeNodes, repositionTree, showTreeHint } from "./drawActionsUtilities";
import { SVG_AVL_TREE_VALUES, SVG_BINARY_TREE_VALUES, SVG_STYLE_VALUES } from "../../../domain/constants/consts";
import { animateEspecialBSTsRotation, animateGetInOrderSuccessor, animateReplaceChildNode } from "./BinaryTreeDrawActions";
import type { Dispatch, SetStateAction } from "react";
import { straightPath } from "../../../domain/utils/treeUtils";
import { type EventBus } from "../../events/eventBus";
import { getArbolAVLCode } from "../../../domain/constants/pseudocode/arbolAVLCode";
import { delay } from "../../../domain/utils/simulatorUtils";

const arbolAVLCode = getArbolAVLCode();

/**
 * Función encargada de animar el proceso de inserción de un nodo en un árbol AVL.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param insertionData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateInsertAVLNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    insertionData: {
        targetNodeId: string;
        parentNodeId: string | null;
        inserted: boolean;
        insertSteps: AVLInsertStep[];
        nodesData: HierarchyNode<HierarchyNodeData<number>>[];
        linksData: TreeLinkData[];
        positions: Map<string, { x: number; y: number }>;
        rotations: RotationStep[];
        frames: AvlFrame[];
        highlightColor: string;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = arbolAVLCode.insert.labels;

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

        // Layout base
        let layoutNodes = insertionData.nodesData;
        let layoutLinks = insertionData.linksData;

        // Capas internas para nodos y enlaces
        const linksLayer = treeG.select<SVGGElement>("g#links-layer");
        const nodesLayer = treeG.select<SVGGElement>("g#nodes-layer");

        // Renderizado inicial de los nodos y enlaces del árbol
        drawTreeNodes(nodesLayer, layoutNodes, insertionData.positions);
        drawTreeLinks(linksLayer, layoutLinks, insertionData.positions);

        // Renderizado de badges bf/h para los nodos del árbol
        buildAvlMetricsBadge(nodesLayer, insertionData.nodesData);

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

        let prevStep: AVLInsertStep | null = null;
        let prevParentOfUnbalanced: string | null = null;
        let prevSonOfUnbalanced: string | null = null;
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
                    await repositionAVLTree(treeG, insertionData.nodesData, insertionData.linksData, insertionData.positions);
                    if (newNodeGroup) await appearAVLTreeNode(newNodeGroup);
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
                case "updateHeight": {
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.UPDATE_HEIGHT });
                    await delay(700);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.GET_LEFT_HEIGHT });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.GET_RIGHT_HEIGHT });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_HEIGHT });
                    await updateSingleAvlMetricsBadge(nodesLayer, layoutNodes, step.at);
                    break;
                }
                case "computeBalance": {
                    bus.emit("step:progress", {
                        stepId: "insert",
                        lineIndex: labels.CALL_REBALANCE
                    });
                    await delay(700);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.COMPUTE_BF });
                    await delay(700);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_NODE_NULL_BALANCE });
                    await delay(600);

                    if (!step.at) {
                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.RETURN_ZERO_BALANCE });
                        await delay(600);
                    } else {
                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.GET_LEFT_HEIGHT2 });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.GET_RIGHT_HEIGHT2 });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.RETURN_BF });
                        await delay(600);
                    }

                    // Caso de inserción sin rotación
                    if (step.bf >= -1 && step.bf <= 1) {
                        bus.emit("step:progress", {
                            stepId: "insert",
                            lineIndex: labels.IF_BF_POS_TWO
                        });
                        await delay(600);

                        bus.emit("step:progress", {
                            stepId: "insert",
                            lineIndex: labels.ELSE_IF_BF_NEG_TWO
                        });
                        await delay(600);

                        bus.emit("step:progress", {
                            stepId: "insert",
                            lineIndex: labels.RETURN_REBALANCED
                        });
                        await delay(600);
                    }
                    break;
                }
                case "rotationCase": {
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_BF_POS_TWO });
                    await delay(600);

                    if (step.kind === "LL" || step.kind === "LR") {
                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_Y_LEFT });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_INNER_LR });
                        await delay(600);

                        if (step.kind === "LR") {
                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.APPLY_LR_LEFT_ROT });
                        } else {
                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_LL });
                            await delay(600);

                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.APPLY_LL_ROT });
                        }
                    } else {
                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_IF_BF_NEG_TWO });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_Y_RIGHT });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_INNER_RL });
                        await delay(600);

                        if (step.kind === "RL") {
                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.APPLY_RL_RIGHT_ROT });
                        } else {
                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_RR });
                            await delay(600);

                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.APPLY_RR_ROT });
                        }
                    }

                    // Indicador visual del tipo de rotación a aplicar
                    await showTreeHint(
                        svg,
                        { type: "node", id: step.at },
                        { label: "Rotación", value: step.kind },
                        insertionData.positions,
                        treeOffset,
                        {
                            size: { width: 65, height: 35 },
                            typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                            anchor: { side: "below", dx: 10, dy: -8 },
                            palette: { bg: "#1b2330", stroke: "#14b8a6" }
                        }
                    );
                    break;
                }
                case "rotate": {
                    const frame = insertionData.frames[step.frameIndex + 1];
                    const rotation = insertionData.rotations[step.rotationIndex];

                    // Actualizar el layout al frame de la rotación
                    layoutNodes = frame.nodes;
                    layoutLinks = frame.links;

                    drawTreeLinks(linksLayer, layoutLinks, insertionData.positions);
                    drawTreeNodes(nodesLayer, layoutNodes, insertionData.positions);

                    const isDouble = rotation.type === "LR" || rotation.type === "RL";
                    const isSimple = rotation.type === "LL" || rotation.type === "RR";

                    const parentOfUnbalanced = isDouble && step.phase === 0 ? rotation.zId : rotation.parentOfZId ?? null;
                    const unbalancedNode = isDouble && step.phase === 0 ? rotation.yId : rotation.zId;
                    const sonOfUnbalanced = isDouble ? rotation.xId ?? null : rotation.yId;
                    const rotationNode = isSimple ? rotation.BId ?? null
                        : rotation.type === "LR" || rotation.type === "RL" ? rotation.xLeftId ?? null : rotation.xRightId ?? null;

                    // Estado visual inicial del nuevo enlace entre p y y (si p)
                    if (parentOfUnbalanced) {
                        treeG.select<SVGGElement>(`g#link-${parentOfUnbalanced}-${sonOfUnbalanced}`)
                            .style("opacity", 0);
                    }

                    // Estado visual inicial del nuevo enlace entre y y z
                    treeG.select<SVGGElement>(`g#link-${sonOfUnbalanced}-${unbalancedNode}`)
                        .style("opacity", 0);

                    // Estado visual inicial del nuevo enlace entre z y B (si B)
                    if (rotationNode) {
                        treeG.select<SVGGElement>(`g#link-${unbalancedNode}-${rotationNode}`)
                            .style("opacity", 0);
                    }

                    if (rotation.type === "LL" || rotation.type === "RR") {
                        // Animación para rotación simple (RR/LL)
                        await animateEspecialBSTsRotation(
                            treeG,
                            parentOfUnbalanced,
                            unbalancedNode,
                            sonOfUnbalanced!,
                            rotationNode,
                            repositionAVLTree,
                            {
                                nodes: layoutNodes,
                                links: layoutLinks,
                                positions: insertionData.positions
                            },
                            {
                                bus,
                                stepId: "insert",
                                labels: {
                                    DECL_MAIN: step.dir === "right" ? labels.ROT_RIGHT_DECL_X : labels.ROT_LEFT_DECL_Y,
                                    DECL_AUX: step.dir === "right" ? labels.ROT_RIGHT_DECL_T2 : labels.ROT_LEFT_DECL_T2,
                                    SET_FIRST_LINK: step.dir === "right" ? labels.SET_X_RIGHT_LINK : labels.SET_Y_LEFT_LINK2,
                                    SET_SECOND_LINK: step.dir === "right" ? labels.SET_Y_LEFT_LINK : labels.SET_X_RIGHT_LINK2
                                }
                            }
                        );
                    } else if (step.phase === 0) {
                        // Animación para primer paso de rotación doble (LR/RL)
                        await animateEspecialBSTsRotation(
                            treeG,
                            parentOfUnbalanced,
                            unbalancedNode,
                            sonOfUnbalanced!,
                            rotationNode,
                            repositionAVLTree,
                            {
                                nodes: layoutNodes,
                                links: layoutLinks,
                                positions: insertionData.positions
                            },
                            {
                                bus,
                                stepId: "insert",
                                labels: {
                                    DECL_MAIN: step.dir === "right" ? labels.ROT_RIGHT_DECL_X : labels.ROT_LEFT_DECL_Y,
                                    DECL_AUX: step.dir === "right" ? labels.ROT_RIGHT_DECL_T2 : labels.ROT_LEFT_DECL_T2,
                                    SET_FIRST_LINK: step.dir === "right" ? labels.SET_X_RIGHT_LINK : labels.SET_Y_LEFT_LINK2,
                                    SET_SECOND_LINK: step.dir === "right" ? labels.SET_Y_LEFT_LINK : labels.SET_X_RIGHT_LINK2
                                }
                            }
                        );
                    } else {
                        const firstRotationLabel = rotation.type === "LR" ? labels.APPLY_LR_LEFT_ROT : labels.APPLY_RL_RIGHT_ROT;
                        bus.emit("step:progress", { stepId: "insert", lineIndex: firstRotationLabel });
                        if (prevParentOfUnbalanced && prevSonOfUnbalanced) {
                            await treeG.select<SVGGElement>(`g#link-${prevParentOfUnbalanced}-${prevSonOfUnbalanced}`)
                                .transition()
                                .duration(800)
                                .style("opacity", 1)
                                .end();
                        } else {
                            await delay(600);
                        }

                        const secondRotationLabel = rotation.type === "LR" ? labels.APPLY_LR_RIGHT_ROT : labels.APPLY_RL_LEFT_ROT;
                        bus.emit("step:progress", { stepId: "insert", lineIndex: secondRotationLabel });
                        await delay(600);

                        // Animación para segundo paso de rotación compuesta (LR/RL)
                        await animateEspecialBSTsRotation(
                            treeG,
                            parentOfUnbalanced,
                            unbalancedNode,
                            sonOfUnbalanced!,
                            rotationNode,
                            repositionAVLTree,
                            {
                                nodes: layoutNodes,
                                links: layoutLinks,
                                positions: insertionData.positions
                            },
                            {
                                bus,
                                stepId: "insert",
                                labels: {
                                    DECL_MAIN: step.dir === "right" ? labels.ROT_RIGHT_DECL_X : labels.ROT_LEFT_DECL_Y,
                                    DECL_AUX: step.dir === "right" ? labels.ROT_RIGHT_DECL_T2 : labels.ROT_LEFT_DECL_T2,
                                    SET_FIRST_LINK: step.dir === "right" ? labels.SET_X_RIGHT_LINK : labels.SET_Y_LEFT_LINK2,
                                    SET_SECOND_LINK: step.dir === "right" ? labels.SET_Y_LEFT_LINK : labels.SET_X_RIGHT_LINK2
                                }
                            }
                        );
                    }

                    // Actualizar la altura del primer nodo
                    const recalFirstNodeHeightLabel = step.dir === "right" ? labels.ROT_RIGHT_RECALC_Y : labels.ROT_LEFT_RECALC_X;

                    bus.emit("step:progress", { stepId: "insert", lineIndex: recalFirstNodeHeightLabel });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.GET_LEFT_HEIGHT });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.GET_RIGHT_HEIGHT });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_HEIGHT });
                    await updateSingleAvlMetricsBadge(nodesLayer, layoutNodes, step.pivot);

                    // Actualizar la altura del segundo nodo
                    const recalSecondNodeHeightLabel = step.dir === "right" ? labels.ROT_RIGHT_RECALC_X : labels.ROT_LEFT_RECALC_Y;
                    const secondRotateNodeId = rotation.type === "LL" || rotation.type === "RR" ? rotation.yId : rotation.xId!;

                    bus.emit("step:progress", { stepId: "insert", lineIndex: recalSecondNodeHeightLabel });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.GET_LEFT_HEIGHT });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.GET_RIGHT_HEIGHT });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_HEIGHT });
                    await updateSingleAvlMetricsBadge(nodesLayer, layoutNodes, secondRotateNodeId);

                    const returnRotationLabel = step.dir === "right" ? labels.ROT_RIGHT_RETURN : labels.ROT_LEFT_RETURN;
                    bus.emit("step:progress", { stepId: "insert", lineIndex: returnRotationLabel });
                    await delay(600);

                    if ((isDouble && step.phase === 1) || isSimple) {
                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.RETURN_REBALANCED });
                        await delay(600);
                    }

                    prevParentOfUnbalanced = parentOfUnbalanced;
                    prevSonOfUnbalanced = sonOfUnbalanced;
                    break;
                }
                case "return": {
                    const isLeafReturn = lastStep?.type === "createLeaf";
                    const isRotationReturn = lastStep?.type === "rotate";
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

                        if (isRotationReturn) {
                            // Establecimiento del nuevo enlace del nodo padre del nodo rotado
                            if (prevParentOfUnbalanced && prevSonOfUnbalanced) {
                                await treeG.select<SVGGElement>(`g#link-${prevParentOfUnbalanced}-${prevSonOfUnbalanced}`)
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
 * Función encargada de animar el proceso de eliminación de un nodo en un árbol AVL.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param deletionData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDeleteAVLNode(
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
        deleteSteps: AVLDeleteStep[];
        remainingNodesData: HierarchyNode<HierarchyNodeData<number>>[];
        remainingLinksData: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
        rotations: RotationStep[];
        frames: AvlFrame[];
        highlightTargetColor: string;
        highlightSuccessorColor: string;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = arbolAVLCode.delete.labels;

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

        // Layout base
        let layoutNodes = deletionData.remainingNodesData;
        let layoutLinks = deletionData.remainingLinksData;

        // Capas internas para nodos y enlaces
        const linksLayer = treeG.select<SVGGElement>("g#links-layer");
        const nodesLayer = treeG.select<SVGGElement>("g#nodes-layer");

        // Renderizado inicial de los nodos y enlaces del árbol
        drawTreeNodes(nodesLayer, layoutNodes, deletionData.positions);
        drawTreeLinks(linksLayer, layoutLinks, deletionData.positions);

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

        let prevStep: AVLDeleteStep | null = null;
        let prevParentOfUnbalanced: string | null = null;
        let prevSonOfUnbalanced: string | null = null;
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
                        await repositionAVLTree(treeG, deletionData.remainingNodesData, deletionData.remainingLinksData, deletionData.positions);
                    }
                    break;
                }
                case "updateHeight": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.UPDATE_HEIGHT });
                    await delay(700);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_LEFT_HEIGHT });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_RIGHT_HEIGHT });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_HEIGHT });
                    await updateSingleAvlMetricsBadge(nodesLayer, layoutNodes, step.at);
                    break;
                }
                case "computeBalance": {
                    bus.emit("step:progress", {
                        stepId: "delete",
                        lineIndex: labels.CALL_REBALANCE
                    });
                    await delay(700);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.COMPUTE_BF });
                    await delay(700);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_NODE_NULL_BALANCE });
                    await delay(600);

                    if (!step.at) {
                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RETURN_ZERO_BALANCE });
                        await delay(600);
                    } else {
                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_LEFT_HEIGHT2 });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_RIGHT_HEIGHT2 });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RETURN_BF });
                        await delay(600);
                    }

                    // Caso de inserción sin rotación
                    if (step.bf >= -1 && step.bf <= 1) {
                        bus.emit("step:progress", {
                            stepId: "delete",
                            lineIndex: labels.IF_BF_POS_TWO
                        });
                        await delay(600);

                        bus.emit("step:progress", {
                            stepId: "delete",
                            lineIndex: labels.ELSE_IF_BF_NEG_TWO
                        });
                        await delay(600);

                        bus.emit("step:progress", {
                            stepId: "delete",
                            lineIndex: labels.RETURN_REBALANCED
                        });
                        await delay(600);
                    }
                    break;
                }
                case "rotationCase": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_BF_POS_TWO });
                    await delay(600);

                    if (step.kind === "LL" || step.kind === "LR") {
                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_Y_LEFT });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_INNER_LR });
                        await delay(600);

                        if (step.kind === "LR") {
                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.APPLY_LR_LEFT_ROT });
                        } else {
                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_LL });
                            await delay(600);

                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.APPLY_LL_ROT });
                        }
                    } else {
                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_IF_BF_NEG_TWO });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_Y_RIGHT });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_INNER_RL });
                        await delay(600);

                        if (step.kind === "RL") {
                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.APPLY_RL_RIGHT_ROT });
                        } else {
                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_RR });
                            await delay(600);

                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.APPLY_RR_ROT });
                        }
                    }

                    // Indicador visual del tipo de rotación a aplicar
                    await showTreeHint(
                        svg,
                        { type: "node", id: step.at },
                        { label: "Rotación", value: step.kind },
                        deletionData.positions,
                        treeOffset,
                        {
                            size: { width: 65, height: 35 },
                            typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                            anchor: { side: "below", dx: 10, dy: -8 },
                            palette: { bg: "#1b2330", stroke: "#14b8a6" }
                        }
                    );
                    break;
                }
                case "rotate": {
                    const frame = deletionData.frames[step.frameIndex + 1];
                    const rotation = deletionData.rotations[step.rotationIndex];

                    // Actualizar el layout al frame de la rotación
                    layoutNodes = frame.nodes;
                    layoutLinks = frame.links;

                    drawTreeLinks(linksLayer, layoutLinks, deletionData.positions);
                    drawTreeNodes(nodesLayer, layoutNodes, deletionData.positions);

                    const isDouble = rotation.type === "LR" || rotation.type === "RL";
                    const isSimple = rotation.type === "LL" || rotation.type === "RR";

                    const parentOfUnbalanced = isDouble && step.phase === 0 ? rotation.zId : rotation.parentOfZId ?? null;
                    const unbalancedNode = isDouble && step.phase === 0 ? rotation.yId : rotation.zId;
                    const sonOfUnbalanced = isDouble ? rotation.xId ?? null : rotation.yId;
                    const rotationNode = isSimple ? rotation.BId ?? null
                        : rotation.type === "LR" || rotation.type === "RL" ? rotation.xLeftId ?? null : rotation.xRightId ?? null;

                    // Estado visual inicial del nuevo enlace entre p y y (si p)
                    if (parentOfUnbalanced) {
                        treeG.select<SVGGElement>(`g#link-${parentOfUnbalanced}-${sonOfUnbalanced}`)
                            .style("opacity", 0);
                    }

                    // Estado visual inicial del nuevo enlace entre y y z
                    treeG.select<SVGGElement>(`g#link-${sonOfUnbalanced}-${unbalancedNode}`)
                        .style("opacity", 0);

                    // Estado visual inicial del nuevo enlace entre z y B (si B)
                    if (rotationNode) {
                        treeG.select<SVGGElement>(`g#link-${unbalancedNode}-${rotationNode}`)
                            .style("opacity", 0);
                    }

                    if (rotation.type === "LL" || rotation.type === "RR") {
                        // Animación para rotación simple (RR/LL)
                        await animateEspecialBSTsRotation(
                            treeG,
                            parentOfUnbalanced,
                            unbalancedNode,
                            sonOfUnbalanced!,
                            rotationNode,
                            repositionAVLTree,
                            {
                                nodes: layoutNodes,
                                links: layoutLinks,
                                positions: deletionData.positions
                            },
                            {
                                bus,
                                stepId: "delete",
                                labels: {
                                    DECL_MAIN: step.dir === "right" ? labels.ROT_RIGHT_DECL_X : labels.ROT_LEFT_DECL_Y,
                                    DECL_AUX: step.dir === "right" ? labels.ROT_RIGHT_DECL_T2 : labels.ROT_LEFT_DECL_T2,
                                    SET_FIRST_LINK: step.dir === "right" ? labels.SET_X_RIGHT_LINK : labels.SET_Y_LEFT_LINK2,
                                    SET_SECOND_LINK: step.dir === "right" ? labels.SET_Y_LEFT_LINK : labels.SET_X_RIGHT_LINK2
                                }
                            }
                        );
                    } else if (step.phase === 0) {
                        // Animación para primer paso de rotación doble (LR/RL)
                        await animateEspecialBSTsRotation(
                            treeG,
                            parentOfUnbalanced,
                            unbalancedNode,
                            sonOfUnbalanced!,
                            rotationNode,
                            repositionAVLTree,
                            {
                                nodes: layoutNodes,
                                links: layoutLinks,
                                positions: deletionData.positions
                            },
                            {
                                bus,
                                stepId: "delete",
                                labels: {
                                    DECL_MAIN: step.dir === "right" ? labels.ROT_RIGHT_DECL_X : labels.ROT_LEFT_DECL_Y,
                                    DECL_AUX: step.dir === "right" ? labels.ROT_RIGHT_DECL_T2 : labels.ROT_LEFT_DECL_T2,
                                    SET_FIRST_LINK: step.dir === "right" ? labels.SET_X_RIGHT_LINK : labels.SET_Y_LEFT_LINK2,
                                    SET_SECOND_LINK: step.dir === "right" ? labels.SET_Y_LEFT_LINK : labels.SET_X_RIGHT_LINK2
                                }
                            }
                        );
                    } else {
                        const firstRotationLabel = rotation.type === "LR" ? labels.APPLY_LR_LEFT_ROT : labels.APPLY_RL_RIGHT_ROT;
                        bus.emit("step:progress", { stepId: "delete", lineIndex: firstRotationLabel });
                        if (prevParentOfUnbalanced && prevSonOfUnbalanced) {
                            await treeG.select<SVGGElement>(`g#link-${prevParentOfUnbalanced}-${prevSonOfUnbalanced}`)
                                .transition()
                                .duration(800)
                                .style("opacity", 1)
                                .end();
                        } else {
                            await delay(600);
                        }

                        const secondRotationLabel = rotation.type === "LR" ? labels.APPLY_LR_RIGHT_ROT : labels.APPLY_RL_LEFT_ROT;
                        bus.emit("step:progress", { stepId: "delete", lineIndex: secondRotationLabel });
                        await delay(600);

                        // Animación para segundo paso de rotación compuesta (LR/RL)
                        await animateEspecialBSTsRotation(
                            treeG,
                            parentOfUnbalanced,
                            unbalancedNode,
                            sonOfUnbalanced!,
                            rotationNode,
                            repositionAVLTree,
                            {
                                nodes: layoutNodes,
                                links: layoutLinks,
                                positions: deletionData.positions
                            },
                            {
                                bus,
                                stepId: "delete",
                                labels: {
                                    DECL_MAIN: step.dir === "right" ? labels.ROT_RIGHT_DECL_X : labels.ROT_LEFT_DECL_Y,
                                    DECL_AUX: step.dir === "right" ? labels.ROT_RIGHT_DECL_T2 : labels.ROT_LEFT_DECL_T2,
                                    SET_FIRST_LINK: step.dir === "right" ? labels.SET_X_RIGHT_LINK : labels.SET_Y_LEFT_LINK2,
                                    SET_SECOND_LINK: step.dir === "right" ? labels.SET_Y_LEFT_LINK : labels.SET_X_RIGHT_LINK2
                                }
                            }
                        );
                    }

                    // Actualizar la altura del primer nodo
                    const recalFirstNodeHeightLabel = step.dir === "right" ? labels.ROT_RIGHT_RECALC_Y : labels.ROT_LEFT_RECALC_X;

                    bus.emit("step:progress", { stepId: "delete", lineIndex: recalFirstNodeHeightLabel });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_LEFT_HEIGHT });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_RIGHT_HEIGHT });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_HEIGHT });
                    await updateSingleAvlMetricsBadge(nodesLayer, layoutNodes, step.pivot);

                    // Actualizar la altura del segundo nodo
                    const recalSecondNodeHeightLabel = step.dir === "right" ? labels.ROT_RIGHT_RECALC_X : labels.ROT_LEFT_RECALC_Y;
                    const secondRotateNodeId = rotation.type === "LL" || rotation.type === "RR" ? rotation.yId : rotation.xId!;

                    bus.emit("step:progress", { stepId: "delete", lineIndex: recalSecondNodeHeightLabel });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_LEFT_HEIGHT });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.GET_RIGHT_HEIGHT });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_HEIGHT });
                    await updateSingleAvlMetricsBadge(nodesLayer, layoutNodes, secondRotateNodeId);

                    const returnRotationLabel = step.dir === "right" ? labels.ROT_RIGHT_RETURN : labels.ROT_LEFT_RETURN;
                    bus.emit("step:progress", { stepId: "delete", lineIndex: returnRotationLabel });
                    await delay(600);

                    if ((isDouble && step.phase === 1) || isSimple) {
                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RETURN_REBALANCED });
                        await delay(600);
                    }

                    prevParentOfUnbalanced = parentOfUnbalanced;
                    prevSonOfUnbalanced = sonOfUnbalanced;
                    break;
                }
                case "return": {
                    const isMatchReturn = lastStep?.type === "match";
                    const isRotationReturn = lastStep?.type === "rotate";
                    if (!isMatchReturn) {
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

                    if (isMatchReturn) {
                        // Salida y reemplazo del nodo a eliminar
                        if (removalNodeId) {
                            await animateReplaceChildNode(
                                treeG,
                                removalNodeId,
                                parentRemovalNodeId,
                                replacementNodeId
                            );

                            // Reposicionamiento de los nodos y enlaces del árbol luego de la salida del nodo
                            await repositionAVLTree(treeG, deletionData.remainingNodesData, deletionData.remainingLinksData, deletionData.positions);
                        }
                    }

                    if (isRotationReturn) {
                        // Establecimiento del nuevo enlace del nodo padre del nodo rotado
                        if (prevParentOfUnbalanced && prevSonOfUnbalanced) {
                            await treeG.select<SVGGElement>(`g#link-${prevParentOfUnbalanced}-${prevSonOfUnbalanced}`)
                                .transition()
                                .duration(800)
                                .style("opacity", 1)
                                .end();
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
 * Función encargada de construir el badge de métricas (factor de balance y altura) para cada nodo dentro del árbol AVL.
 * @param nodesLayer La selección D3 del grupo SVG (`<g>`) que contiene los nodos del árbol.
 * @param nodes Array de nodos de jerarquía D3 que representan los nodos del árbol AVL.
 */
function buildAvlMetricsBadge(
    nodesLayer: Selection<SVGGElement, unknown, null, undefined>,
    nodes: HierarchyNode<HierarchyNodeData<number>>[]
) {
    const {
        PANEL_OFFSET_Y,
        ROW_H_LABEL, ROW_H_VALUE,
        COL_BF, COL_H,
        EXTRA_W,
        CORNER,
        BACKGROUND_COLOR, STROKE_COLOR, STROKE_WIDTH,
        LABEL_FONT_SIZE, LABEL_FONT_WEIGHT, LABEL_COLOR,
        ELEMENT_TEXT_SIZE, ELEMENT_TEXT_WEIGHT,
        HVAL_COLOR,
    } = SVG_AVL_TREE_VALUES;

    const W = COL_BF + COL_H + EXTRA_W;
    const H = ROW_H_LABEL + ROW_H_VALUE + 1;

    // Selección de los grupos de cada nodo ya dibujado
    const nodeGroups = nodesLayer
        .selectAll<SVGGElement, HierarchyNode<HierarchyNodeData<number>>>("g.node")
        .data(nodes, d => d.data.id);

    // JOIN anidado - 1 panel por nodo
    const panels = nodeGroups.selectAll<SVGGElement, HierarchyNode<HierarchyNodeData<number>>>("g.avl-panel")
        .data(d => [d], (d) => d.data.id);

    // Creación del grupo contenedor del panel
    const gEnter = panels.enter()
        .append("g")
        .attr("class", "avl-panel")
        .style("pointer-events", "none")
        .attr("transform", `translate(0, ${PANEL_OFFSET_Y})`);

    // Fondo
    gEnter
        .append("rect")
        .attr("class", "panel-bg")
        .attr("rx", CORNER)
        .attr("ry", CORNER)
        .attr("x", -W / 2)
        .attr("y", -1)
        .attr("width", W)
        .attr("height", H)
        .attr("fill", BACKGROUND_COLOR)
        .attr("stroke", STROKE_COLOR)
        .attr("stroke-width", STROKE_WIDTH)
        .attr("filter", "url(#chipShadow)"); // OJO

    // Separadores
    gEnter
        .append("line")
        .attr("class", "sep-h")
        .attr("x1", -W / 2)
        .attr("y1", ROW_H_LABEL)
        .attr("x2", W / 2)
        .attr("y2", ROW_H_LABEL)
        .attr("stroke", STROKE_COLOR)
        .attr("stroke-width", STROKE_WIDTH);

    gEnter.append("line")
        .attr("class", "sep-v")
        .attr("x1", -W / 2 + COL_BF)
        .attr("y1", -1)
        .attr("x2", -W / 2 + COL_BF)
        .attr("y2", H - 1)
        .attr("stroke", STROKE_COLOR)
        .attr("stroke-width", STROKE_WIDTH);

    // Etiquetas
    gEnter.append("text")
        .attr("class", "lbl-bf")
        .attr("x", -W / 2 + COL_BF / 2)
        .attr("y", ROW_H_LABEL / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", LABEL_FONT_SIZE)
        .style("font-weight", LABEL_FONT_WEIGHT)
        .attr("fill", LABEL_COLOR)
        .text("bf");

    gEnter.append("text")
        .attr("class", "lbl-h")
        .attr("x", W / 2 - COL_H / 2)
        .attr("y", ROW_H_LABEL / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", LABEL_FONT_SIZE)
        .style("font-weight", LABEL_FONT_WEIGHT)
        .attr("fill", LABEL_COLOR)
        .text("h");

    // Valores
    gEnter.append("text")
        .attr("class", "val-bf")
        .attr("x", -W / 2 + COL_BF / 2)
        .attr("y", ROW_H_LABEL + ROW_H_VALUE / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", ELEMENT_TEXT_SIZE)
        .style("font-weight", ELEMENT_TEXT_WEIGHT)
        .attr("fill", (d) => bfColor(d.data.bf!))
        .text((d) => d.data.bf!);

    gEnter.append("text")
        .attr("class", "val-h")
        .attr("x", W / 2 - COL_H / 2)
        .attr("y", ROW_H_LABEL + ROW_H_VALUE / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", ELEMENT_TEXT_SIZE)
        .style("font-weight", ELEMENT_TEXT_WEIGHT)
        .attr("fill", HVAL_COLOR)
        .text((d) => d.data.height ?? 0);
}

async function updateSingleAvlMetricsBadge(
    nodesLayer: Selection<SVGGElement, unknown, null, undefined>,
    nodes: HierarchyNode<HierarchyNodeData<number>>[],
    nodeId: string
) {
    const nodeData = nodes.find((n) => n.data.id === nodeId);
    if (!nodeData) return;

    // Grupo correspondiente al panel de ese nodo
    const panel = nodesLayer
        .select<SVGGElement>(`g.node#${nodeId}`)
        .select<SVGGElement>("g.avl-panel");

    // Actualizar altura
    await panel.select<SVGTextElement>("text.val-h")
        .transition()
        .duration(450)
        .style("opacity", 0)
        .transition()
        .duration(450)
        .text(nodeData.data.height ?? 0)
        .style("opacity", 1)
        .end();

    // Actualizar bf
    await panel.select<SVGTextElement>("text.val-bf")
        .transition()
        .duration(400)
        .style("opacity", 0)
        .transition()
        .duration(400)
        .attr("fill", bfColor(nodeData.data.bf!))
        .text(nodeData.data.bf!)
        .style("opacity", 1)
        .end();
}

/**
 * Función encargada de actualizar los valores del badge de métricas (factor de balance y altura) para cada nodo dentro del árbol AVL.
 * @param nodesLayer La selección D3 del grupo SVG (`<g>`) que contiene los nodos del árbol.
 * @param nodes Array de nodos de jerarquía D3 que representan los nodos del árbol AVL.
 */
export function updateAvlMetricsBadge(
    nodesLayer: Selection<SVGGElement, unknown, null, undefined>,
    nodes: HierarchyNode<HierarchyNodeData<number>>[]
) {
    // Selección de los grupos de cada nodo ya dibujado
    const nodeGroups = nodesLayer
        .selectAll<SVGGElement, HierarchyNode<HierarchyNodeData<number>>>("g.node")
        .data(nodes, d => d.data.id);

    // JOIN anidado - 1 panel por nodo
    const panels = nodeGroups.selectAll<SVGGElement, HierarchyNode<HierarchyNodeData<number>>>("g.avl-panel")
        .data(d => [d], (d) => d.data.id);

    panels.select<SVGTextElement>("text.val-bf")
        .attr("fill", d => bfColor(d.data.bf!))
        .text(d => d.data.bf!);

    panels.select<SVGTextElement>("text.val-h")
        .text(d => d.data.height ?? 0);
}

/**
 * Función encargada de reubicar los nodos y ajustar los enlaces de conexión de un árbol AVL.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param nodes Array de nodos de jerarquía que representan la estructura del árbol.
 * @param linksData Array de objetos de datos de enlace que representan las conexiones entre nodos.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @returns Una promesa que se resuelve cuando se han completado todas las transiciones de nodos y enlaces.
 */
async function repositionAVLTree(
    g: Selection<SVGGElement, unknown, null, undefined>,
    nodes: HierarchyNode<HierarchyNodeData<number>>[],
    linksData: TreeLinkData[],
    positions: Map<string, { x: number; y: number }>
) {
    return repositionTree(g, nodes, linksData, positions, straightPath);
}

/**
 * Función encargada de animar la aparición del nodo de un árbol AVL.
 * @param nodeGroup Selección D3 del elemento de grupo SVG que representa el nodo del árbol. 
 */
async function appearAVLTreeNode(
    nodeGroup: Selection<SVGGElement, unknown, null, undefined>
) {
    // Selección del panel de métricas del nodo actual
    const panel = nodeGroup.select<SVGGElement>(`g.avl-panel`).style("opacity", 0);

    // Animación de aparición del nodo
    await defaultAppearTreeNode(nodeGroup);

    // Aparición del panel de métricas
    await panel
        .transition()
        .duration(500)
        .style("opacity", 1)
        .end();
}

// Función para determinar el color del valor del factor de equilibrio del nodo
const bfColor = (bf: number) => {
    const a = Math.abs(bf ?? 0);
    if (a <= 1) return "#71c562";
    if (a === 2) return "#f4bf50";
    return "#e25555";
};