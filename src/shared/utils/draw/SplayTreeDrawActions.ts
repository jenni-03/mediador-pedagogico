import { type HierarchyNode, type Selection } from "d3";
import { HierarchyNodeData, RotationType, SplayDeleteStep, SplayFrame, SplayInsertStep, SplayRotation, SplayRotationTag, SplaySearchStep, TreeLinkData } from "../../../domain/utils/types";
import type { Dispatch, SetStateAction } from "react";
import { defaultAppearTreeNode, defaultDeleteTreeNode, drawTreeLinks, drawTreeNodes, repositionTree, showTreeHint } from "./drawActionsUtilities";
import { SVG_BINARY_TREE_VALUES, SVG_STYLE_VALUES } from "../../../domain/constants/consts";
import { animateEspecialBSTsRotation } from "./BinaryTreeDrawActions";
import { straightPath } from "../../../domain/utils/treeUtils";
import type { EventBus } from "../../events/eventBus";
import { getArbolSplayCode } from "../../../domain/constants/pseudocode/arbolSplayCode";
import { delay } from "../../../domain/utils/simulatorUtils";

const arbolSplayCode = getArbolSplayCode();

/**
 * Función encargada de animar el proceso de inserción de un nodo en un árbol Splay.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param insertionData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateInsertSplayNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    insertionData: {
        targetNodeId: string;
        parentNodeId: string | null;
        inserted: boolean;
        insertSteps: SplayInsertStep[];
        nodesData: HierarchyNode<HierarchyNodeData<number>>[];
        linksData: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
        rotations: SplayRotation[];
        frames: SplayFrame[];
        highlightColor: string;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = arbolSplayCode.insert.labels;

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

        // Grupos correspondientes a los nuevos elementos producto de la inserción
        let newNodeGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
        let parentNodeNewLinkGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
        if (inserted) {
            newNodeGroup = treeG.select<SVGGElement>(`g#${targetNodeId}`);
            newNodeGroup.style("opacity", 0);

            if (parentNodeId) {
                parentNodeNewLinkGroup = treeG.select<SVGGElement>(
                    `g#link-${parentNodeId}-${targetNodeId}`
                );
            }
        }

        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.DECLARE_PARENT });
        await delay(600);

        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.DECLARE_CURSOR });
        await delay(600);

        for (const step of insertSteps) {
            switch (step.type) {
                case "visit": {
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.BST_WHILE });

                    if (step.at) {
                        // Resaltado del nodo actual
                        await treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("fill", insertionData.highlightColor)
                            .end();
                    } else {
                        await delay(600);
                    }
                    break;
                }
                case "compare": {
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.DECLARE_CMP });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_DUPLICATE });
                    await delay(600);

                    if (step.cmp === 0) {
                        const nodeCircleElement = treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`);

                        // Pulsasión del nodo identificado
                        await nodeCircleElement
                            .transition()
                            .duration(300)
                            .attr("r", 30)
                            .transition()
                            .duration(300)
                            .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
                            .end();

                        // Restablecimiento del estilo visual original del nodo identificado
                        await nodeCircleElement
                            .transition()
                            .duration(800)
                            .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                            .end();

                        // Indicador visual de que el nodo a insertar ya existe en el árbol
                        await showTreeHint(
                            svg,
                            { type: "node", id: step.at },
                            { label: "Elemento", value: `ya existente` },
                            insertionData.positions,
                            treeOffset,
                            {
                                size: { width: 80, height: 35 },
                                typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                                anchor: { side: "below", dx: 10, dy: -8 },
                                palette: { bg: "#1b2330", stroke: "#14b8a6" }
                            }
                        );
                    }
                    break;
                }
                case "advance": {
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_PARENT });
                    await delay(600);

                    // Restablecimiento del estilo visual original del nodo visitado
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ADVANCE_CURSOR });
                    await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                        .transition()
                        .duration(800)
                        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                        .end();
                    break;
                }
                case "createNode": {
                    // Aparición del nuevo nodo
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CREATE_NODE });
                    await repositionSplayTree(treeG, layoutNodes, layoutLinks, insertionData.positions);
                    if (newNodeGroup) await defaultAppearTreeNode(newNodeGroup);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_NODE_PARENT });
                    await delay(600);
                    break;
                }
                case "attachNode": {
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_P_NULL });
                    await delay(600);

                    if (step.side === "root") {
                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_ROOT });
                        await delay(600);
                    } else {
                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_IF_ATTACH_LEFT });
                        await delay(600);

                        if (step.side === "left") {
                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ATTACH_NODE_LEFT });
                        } else {
                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_ATTACH_RIGHT });
                            await delay(600);

                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ATTACH_NODE_RIGHT });
                        }
                    }

                    // Establecimiento del nuevo enlace entre el nodo padre y el nuevo nodo
                    if (parentNodeNewLinkGroup) {
                        await parentNodeNewLinkGroup
                            .transition()
                            .duration(800)
                            .style("opacity", 1)
                            .end();
                    }
                    break;
                }
                case "splayCall": {
                    const splayCallIndex = step.reason === "insertion"
                        ? labels.SPLAY_NEW : labels.SPLAY_EXISTING;
                    bus.emit("step:progress", { stepId: "insert", lineIndex: splayCallIndex });
                    await delay(600);
                    break;
                }
                case "splayWhileCheck": {
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SPLAY_WHILE });
                    await delay(600);
                    break;
                }
                case "resolvePG": {
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SPLAY_DECLARE_P });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SPLAY_DECLARE_G });
                    await delay(600);
                    break;
                }
                case "splayCase": {
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_G_NULL });
                    await delay(600);

                    if (step.kind !== "zig") {
                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_G_NOT_NULL });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.DECL_X_IS_LEFT });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.DECL_P_IS_LEFT });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_ZIGZIG_LL });
                        await delay(600);

                        if (step.kind !== "zig-zig" || (step.kind === "zig-zig" && step.shape === "RR")) {
                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_IF_ZIGZIG_RR });
                            await delay(600);

                            if (step.kind !== "zig-zig") {
                                bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_IF_ZIGZAG_LR });
                                await delay(600);

                                if (step.shape === "RL") {
                                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_ZIGZAG_RL });
                                    await delay(600);
                                }
                            }
                        }
                    }

                    // Indicador visual del caso de splay a realizar
                    await showTreeHint(
                        svg,
                        { type: "node", id: targetNodeId },
                        { label: "Splay", value: `${step.kind} (${step.kind === "zig" ? step.shape.charAt(0) : step.shape})` },
                        insertionData.positions,
                        treeOffset,
                        {
                            size: { width: 80, height: 35 },
                            typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                            anchor: { side: "below", dx: 10, dy: -8 },
                            palette: { bg: "#1b2330", stroke: "#14b8a6" }
                        }
                    );
                    break;
                }
                case "rotate": {
                    // Frame correspondiente a la rotación actual
                    const frame = insertionData.frames[step.frameIndex + 1];
                    const rotation = insertionData.rotations[step.rotationIndex];
                    const rotationInfo = rotation.step;

                    if (step.subkind === "zig") {
                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_X_LEFT_ZIG });
                        await delay(600);

                        if (step.dir === "right") {
                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ZIG_ROTATE_RIGHT_P });
                        } else {
                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_X_RIGHT_ZIG });
                            await delay(600);

                            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ZIG_ROTATE_LEFT_P });
                        }
                    } else if (step.subkind === "zigzig-1" || step.subkind === "zigzig-2") {
                        if (step.subkind === "zigzig-1") {
                            const firstRotationIndex = step.dir === "right" ? labels.ZIGZIG_LL_ROT1 : labels.ZIGZIG_RR_ROT1;
                            bus.emit("step:progress", { stepId: "insert", lineIndex: firstRotationIndex });
                        } else {
                            const secondRotationIndex = step.dir === "right" ? labels.ZIGZIG_LL_ROT2 : labels.ZIGZIG_RR_ROT2;
                            bus.emit("step:progress", { stepId: "insert", lineIndex: secondRotationIndex });
                        }
                    } else {
                        if (step.subkind === "zigzag-1") {
                            const firstRotationIndex = step.dir === "left" ? labels.ZIGZAG_LR_ROT1 : labels.ZIGZAG_RL_ROT1;
                            bus.emit("step:progress", { stepId: "insert", lineIndex: firstRotationIndex });
                        } else {
                            const secondRotationIndex = step.dir === "right" ? labels.ZIGZAG_LR_ROT2 : labels.ZIGZAG_RL_ROT2;
                            bus.emit("step:progress", { stepId: "insert", lineIndex: secondRotationIndex });
                        }
                    }
                    await delay(600);

                    // Actualizar el layout al frame de la rotación
                    layoutNodes = frame.nodes;
                    layoutLinks = frame.links;

                    // Determinar el indicador del tipo de rotación a aplicar
                    const rotationOrder = step.subkind === "zig" || step.subkind === "zigzag-1" || step.subkind === "zigzig-1" ? "first" : "second";
                    const rotationIndicator = determineSplayRotationIndicatorTag(rotation.tag, rotationInfo.type, rotationOrder);

                    // Indicador visual del tipo de rotación a aplicar
                    await showTreeHint(
                        svg,
                        { type: "node", id: rotationInfo.zId },
                        { label: "Rotación", value: `${rotationIndicator}` },
                        insertionData.positions,
                        treeOffset,
                        {
                            size: { width: 80, height: 35 },
                            typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                            anchor: { side: "below", dx: 10, dy: -8 },
                            palette: { bg: "#1b2330", stroke: "#14b8a6" }
                        }
                    );

                    // Renderizado de los nuevos enlaces y actualización de la posición de los nodos según el nuevo layout
                    drawTreeLinks(linksLayer, layoutLinks, insertionData.positions);
                    drawTreeNodes(nodesLayer, layoutNodes, insertionData.positions);

                    const parentOfUnbalanced = rotationInfo.parentOfZId ?? null;
                    const unbalancedNode = rotationInfo.zId;
                    const sonOfUnbalanced = rotationInfo.yId;
                    const rotationNode = rotationInfo.BId ?? null;

                    const isRightRotation = step.dir === "right";

                    const baseLabels = {
                        DECL_MAIN: isRightRotation ? labels.ROT_R_DECL_X : labels.ROT_L_DECL_Y,
                        DECL_AUX: isRightRotation ? labels.ROT_R_DECL_T2 : labels.ROT_L_DECL_T2,
                        SET_FIRST_LINK: isRightRotation ? labels.ROT_R_SET_X_RIGHT : labels.ROT_L_SET_Y_LEFT,
                        SET_SECOND_LINK: isRightRotation ? labels.ROT_R_SET_Y_LEFT : labels.ROT_L_SET_X_RIGHT,
                        SET_MAIN_PARENT: isRightRotation ? labels.ROT_R_SET_X_PARENT : labels.ROT_L_SET_Y_PARENT,
                        SET_UNBALANCED_PARENT: isRightRotation ? labels.ROT_R_SET_Y_PARENT : labels.ROT_L_SET_X_PARENT,
                        IF_AUX_NOT_NULL: isRightRotation ? labels.ROT_R_IF_T2_NOT_NULL : labels.ROT_L_IF_T2_NOT_NULL,
                        SET_AUX_PARENT: rotationNode
                            ? (isRightRotation ? labels.ROT_R_SET_T2_PARENT : labels.ROT_L_SET_T2_PARENT)
                            : undefined,
                    };

                    const parentRelinkLabels =
                        step.pivotSideOnParent === "root"
                            ? {
                                IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_R_IF_Y_PARENT_NULL : labels.ROT_L_IF_X_PARENT_NULL,
                                SET_ROOT: isRightRotation ? labels.ROT_R_SET_ROOT : labels.ROT_L_SET_ROOT,
                            }
                            : step.pivotSideOnParent === "right"
                                ? {
                                    IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_R_IF_Y_PARENT_NULL : labels.ROT_L_IF_X_PARENT_NULL,
                                    ELSE_IF_UNBALANCED_SIDE1: isRightRotation ? labels.ROT_R_ELSE_IF_Y_IS_RIGHT : labels.ROT_L_ELSE_IF_X_IS_LEFT,
                                    SET_UNBALANCED_PARENT_SIDE1: isRightRotation ? labels.ROT_R_SET_PARENT_RIGHT : labels.ROT_L_SET_PARENT_LEFT,
                                }
                                : {
                                    IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_R_IF_Y_PARENT_NULL : labels.ROT_L_IF_X_PARENT_NULL,
                                    ELSE_IF_UNBALANCED_SIDE1: isRightRotation ? labels.ROT_R_ELSE_IF_Y_IS_RIGHT : labels.ROT_L_ELSE_IF_X_IS_LEFT,
                                    ELSE_UNBALANCED_SIDE2: isRightRotation ? labels.ROT_R_ELSE_Y_IS_LEFT : labels.ROT_L_ELSE_X_IS_RIGHT,
                                    SET_UNBALANCED_PARENT_SIDE2: isRightRotation ? labels.ROT_R_SET_PARENT_LEFT : labels.ROT_L_SET_PARENT_RIGHT,
                                };

                    // Animación para rotación simple del subárbol
                    await animateEspecialBSTsRotation(
                        treeG,
                        parentOfUnbalanced,
                        unbalancedNode,
                        sonOfUnbalanced!,
                        rotationNode,
                        repositionSplayTree,
                        {
                            nodes: layoutNodes,
                            links: layoutLinks,
                            positions: insertionData.positions
                        },
                        {
                            bus,
                            stepId: "insert",
                            labels: {
                                ...baseLabels,
                                ...parentRelinkLabels
                            }
                        }
                    );
                    break;
                }
                case "setRoot": {
                    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_ROOT_END });
                    await delay(600);
                    break;
                }
                case "return": {
                    if (inserted) {
                        bus.emit("step:progress", { stepId: "insert", lineIndex: labels.INC_SIZE });
                        await delay(600);
                    }

                    const returnIndex = inserted ? labels.RETURN_TRUE : labels.RETURN_FALSE;
                    bus.emit("step:progress", { stepId: "insert", lineIndex: returnIndex });

                    // Indicador visual de que el nodo objetivo ya corresponde con la raíz del árbol
                    await showTreeHint(
                        svg,
                        { type: "node", id: insertionData.targetNodeId },
                        { label: "Splay", value: "ya en raíz" },
                        insertionData.positions,
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
        }

        // Fin de la operación
        bus.emit("op:done", { op: "insert" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de eliminación de un nodo en un árbol Splay.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param insertionData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDeleteSplayNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    deletionData: {
        targetNodeId: string;
        maxLeftNodeId: string | null;
        deleted: boolean;
        searchSteps: SplaySearchStep[];
        deleteSteps: SplayDeleteStep[];
        remainingNodesData: HierarchyNode<HierarchyNodeData<number>>[];
        remainingLinksData: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
        rotations: SplayRotation[];
        frames: SplayFrame[];
        highlightColor: string;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = arbolSplayCode.delete.labels;

    // Elementos implicados en la inserción
    const { targetNodeId, maxLeftNodeId, deleted, searchSteps, deleteSteps } = deletionData;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "delete" });

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g#tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido (inicialmente oculto)
        const seqG = svg.select<SVGGElement>("g#seq-container");
        seqG.style("opacity", 0);

        // Grupo correspondiente al nodo objetivo
        const targetNodeGroup = treeG.select<SVGGElement>(`g#${targetNodeId}`);

        // Layout base
        let layoutNodes = deletionData.remainingNodesData;
        let layoutLinks = deletionData.remainingLinksData;

        // Capas internas para nodos y enlaces
        const linksLayer = treeG.select<SVGGElement>("g#links-layer");
        const nodesLayer = treeG.select<SVGGElement>("g#nodes-layer");

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.VALIDATE_EMPTY });
        await delay(600);

        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SEARCH_CALL });
        await delay(600);

        // Búsqueda del nodo especificado
        await animateSearchNodeSteps(
            svg,
            treeG,
            treeOffset,
            {
                targetNodeId,
                found: deleted,
                searchSteps,
                positions: deletionData.positions,
                rotations: deletionData.rotations,
                frames: deletionData.frames,
                highlightColor: deletionData.highlightColor,
                stepId: "delete",
                labels
            },
            bus
        );

        for (const step of deleteSteps) {
            switch (step.type) {
                case "checkFoundNode": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_NOT_FOUND });
                    await delay(600);
                    break;
                }
                case "split": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECLARE_ROOT });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECLARE_L_SUB });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECLARE_R_SUB });
                    await delay(600);
                    break;
                }
                case "detachParent": {
                    const checkSubTreeIndex = step.side === "left" ? labels.IF_L_SUB_IS_NOT_NULL : labels.IF_R_SUB_IS_NOT_NULL;
                    bus.emit("step:progress", { stepId: "delete", lineIndex: checkSubTreeIndex });
                    await delay(600);

                    if (step.nodeId) {
                        const detachSubTreeIndex = step.side === "left" ? labels.SET_L_SUB_PARENT_NULL : labels.SET_R_SUB_PARENT_NULL;
                        bus.emit("step:progress", { stepId: "delete", lineIndex: detachSubTreeIndex });
                        await delay(600);
                    }
                    break;
                }
                case "cutChild": {
                    const cutChildIndex = step.side === "right" ? labels.SET_ROOT_RIGHT_NULL : labels.SET_ROOT_LEFT_NULL;
                    bus.emit("step:progress", { stepId: "delete", lineIndex: cutChildIndex });

                    if (step.childId) {
                        // Desconexión del actual enlace entre el nodo a eliminar y su hijo (izq/der)
                        await treeG.select<SVGGElement>(`g#link-${targetNodeId}-${step.childId}`)
                            .transition()
                            .duration(800)
                            .style("opacity", 0)
                            .remove()
                            .end();
                    } else {
                        await delay(600);
                    }
                    break;
                }
                case "setRoot": {
                    const setRootIndex = step.side === "null" ? labels.SET_ROOT_NULL
                        : step.side === "right" ? labels.SET_ROOT_R_SUB
                            : step.side === "left" ? labels.SET_ROOT_L_SUB
                                : labels.SET_ROOT_END;
                    bus.emit("step:progress", { stepId: "delete", lineIndex: setRootIndex });

                    if (step.side === "null") {
                        // Salida del nodo a eliminar
                        await defaultDeleteTreeNode(targetNodeGroup)
                    } else if (step.side === "right" && step.rootId !== null) {
                        // Actualización de las posiciones de los nodos
                        drawTreeNodes(nodesLayer, layoutNodes, deletionData.positions);

                        // Reposicionamiento de los nodos y enlaces del árbol
                        await repositionSplayTree(treeG, layoutNodes, layoutLinks, deletionData.positions);
                    } else {
                        await delay(600);
                    }
                    break;
                }
                case "joinCase": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_L_SUB_IS_NULL });
                    await delay(600);
                    break;
                }
                case "traverseMaxLeftStart": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECLARE_MAXL });
                    await delay(600);
                    break;
                }
                case "moveToRight": {
                    const nodeCircleElement = treeG.select<SVGCircleElement>(`g#${step.fromId} circle.node-container`);

                    // Resaltado del nodo actual
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.MAXL_WHILE });
                    await nodeCircleElement
                        .transition()
                        .duration(800)
                        .attr("fill", deletionData.highlightColor)
                        .end();

                    // Restablecimiento del estilo visual original del nodo visitado
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_MAXL_RIGHT });
                    await nodeCircleElement
                        .transition()
                        .duration(800)
                        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                        .end();
                    break;
                }
                case "maxLeftFound": {
                    const nodeCircleElement = treeG.select<SVGCircleElement>(`g#${step.nodeId} circle.node-container`);
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.MAXL_WHILE });

                    // Resaltado del nodo identificado
                    await nodeCircleElement
                        .transition()
                        .duration(800)
                        .attr("fill", deletionData.highlightColor)
                        .end();

                    // Pulsasión del nodo identificado
                    await nodeCircleElement
                        .transition()
                        .duration(300)
                        .attr("r", 30)
                        .transition()
                        .duration(300)
                        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
                        .end();

                    // Restablecimiento del estilo visual original del nodo identificado
                    await nodeCircleElement
                        .transition()
                        .duration(800)
                        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                        .end();
                    break;
                }
                case "splayCall": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SPLAY_MAXL });
                    await delay(600);
                    break;
                }
                case "splayWhileCheck": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SPLAY_WHILE });
                    await delay(600);
                    break;
                }
                case "resolvePG": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SPLAY_DECLARE_P });
                    await delay(600);

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SPLAY_DECLARE_G });
                    await delay(600);
                    break;
                }
                case "splayCase": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_G_NULL });
                    await delay(600);

                    if (step.kind !== "zig") {
                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_G_NOT_NULL });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECL_X_IS_LEFT });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECL_P_IS_LEFT });
                        await delay(600);

                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_ZIGZIG_LL });
                        await delay(600);

                        if (step.kind !== "zig-zig" || (step.kind === "zig-zig" && step.shape === "RR")) {
                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_IF_ZIGZIG_RR });
                            await delay(600);

                            if (step.kind !== "zig-zig") {
                                bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_IF_ZIGZAG_LR });
                                await delay(600);

                                if (step.shape === "RL") {
                                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_ZIGZAG_RL });
                                    await delay(600);
                                }
                            }
                        }
                    }

                    // Indicador visual del caso de splay a realizar
                    await showTreeHint(
                        svg,
                        { type: "node", id: targetNodeId },
                        { label: "Splay", value: `${step.kind} (${step.kind === "zig" ? step.shape.charAt(0) : step.shape})` },
                        deletionData.positions,
                        treeOffset,
                        {
                            size: { width: 80, height: 35 },
                            typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                            anchor: { side: "below", dx: 10, dy: -8 },
                            palette: { bg: "#1b2330", stroke: "#14b8a6" }
                        }
                    );
                    break;
                }
                case "rotate": {
                    // Frame correspondiente a la rotación actual
                    const frame = deletionData.frames[step.frameIndex + 1];
                    const rotation = deletionData.rotations[step.rotationIndex];
                    const rotationInfo = rotation.step;

                    if (step.subkind === "zig") {
                        bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_X_LEFT_ZIG });
                        await delay(600);

                        if (step.dir === "right") {
                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ZIG_ROTATE_RIGHT_P });
                        } else {
                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_X_RIGHT_ZIG });
                            await delay(600);

                            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ZIG_ROTATE_LEFT_P });
                        }
                    } else if (step.subkind === "zigzig-1" || step.subkind === "zigzig-2") {
                        if (step.subkind === "zigzig-1") {
                            const firstRotationIndex = step.dir === "right" ? labels.ZIGZIG_LL_ROT1 : labels.ZIGZIG_RR_ROT1;
                            bus.emit("step:progress", { stepId: "delete", lineIndex: firstRotationIndex });
                        } else {
                            const secondRotationIndex = step.dir === "right" ? labels.ZIGZIG_LL_ROT2 : labels.ZIGZIG_RR_ROT2;
                            bus.emit("step:progress", { stepId: "delete", lineIndex: secondRotationIndex });
                        }
                    } else {
                        if (step.subkind === "zigzag-1") {
                            const firstRotationIndex = step.dir === "left" ? labels.ZIGZAG_LR_ROT1 : labels.ZIGZAG_RL_ROT1;
                            bus.emit("step:progress", { stepId: "delete", lineIndex: firstRotationIndex });
                        } else {
                            const secondRotationIndex = step.dir === "right" ? labels.ZIGZAG_LR_ROT2 : labels.ZIGZAG_RL_ROT2;
                            bus.emit("step:progress", { stepId: "delete", lineIndex: secondRotationIndex });
                        }
                    }
                    await delay(600);

                    // Actualizar el layout al frame de la rotación
                    layoutNodes = frame.nodes;
                    layoutLinks = frame.links;

                    // Determinar el indicador del tipo de rotación a aplicar
                    const rotationOrder = step.subkind === "zig" || step.subkind === "zigzag-1" || step.subkind === "zigzig-1" ? "first" : "second";
                    const rotationIndicator = determineSplayRotationIndicatorTag(rotation.tag, rotationInfo.type, rotationOrder);

                    // Indicador visual del tipo de rotación a aplicar
                    await showTreeHint(
                        svg,
                        { type: "node", id: rotationInfo.zId },
                        { label: "Rotación", value: `${rotationIndicator}` },
                        deletionData.positions,
                        treeOffset,
                        {
                            size: { width: 80, height: 35 },
                            typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                            anchor: { side: "below", dx: 10, dy: -8 },
                            palette: { bg: "#1b2330", stroke: "#14b8a6" }
                        }
                    );

                    // Renderizado de los nuevos enlaces y actualización de la posición de los nodos según el nuevo layout
                    drawTreeLinks(linksLayer, layoutLinks, deletionData.positions);
                    drawTreeNodes(nodesLayer, layoutNodes, deletionData.positions);

                    const parentOfUnbalanced = rotationInfo.parentOfZId ?? null;
                    const unbalancedNode = rotationInfo.zId;
                    const sonOfUnbalanced = rotationInfo.yId;
                    const rotationNode = rotationInfo.BId ?? null;

                    const isRightRotation = step.dir === "right";

                    const baseLabels = {
                        DECL_MAIN: isRightRotation ? labels.ROT_R_DECL_X : labels.ROT_L_DECL_Y,
                        DECL_AUX: isRightRotation ? labels.ROT_R_DECL_T2 : labels.ROT_L_DECL_T2,
                        SET_FIRST_LINK: isRightRotation ? labels.ROT_R_SET_X_RIGHT : labels.ROT_L_SET_Y_LEFT,
                        SET_SECOND_LINK: isRightRotation ? labels.ROT_R_SET_Y_LEFT : labels.ROT_L_SET_X_RIGHT,
                        SET_MAIN_PARENT: isRightRotation ? labels.ROT_R_SET_X_PARENT : labels.ROT_L_SET_Y_PARENT,
                        SET_UNBALANCED_PARENT: isRightRotation ? labels.ROT_R_SET_Y_PARENT : labels.ROT_L_SET_X_PARENT,
                        IF_AUX_NOT_NULL: isRightRotation ? labels.ROT_R_IF_T2_NOT_NULL : labels.ROT_L_IF_T2_NOT_NULL,
                        SET_AUX_PARENT: rotationNode
                            ? (isRightRotation ? labels.ROT_R_SET_T2_PARENT : labels.ROT_L_SET_T2_PARENT)
                            : undefined,
                    };

                    const parentRelinkLabels =
                        step.pivotSideOnParent === "root"
                            ? {
                                IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_R_IF_Y_PARENT_NULL : labels.ROT_L_IF_X_PARENT_NULL,
                                SET_ROOT: isRightRotation ? labels.ROT_R_SET_ROOT : labels.ROT_L_SET_ROOT,
                            }
                            : step.pivotSideOnParent === "right"
                                ? {
                                    IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_R_IF_Y_PARENT_NULL : labels.ROT_L_IF_X_PARENT_NULL,
                                    ELSE_IF_UNBALANCED_SIDE1: isRightRotation ? labels.ROT_R_ELSE_IF_Y_IS_RIGHT : labels.ROT_L_ELSE_IF_X_IS_LEFT,
                                    SET_UNBALANCED_PARENT_SIDE1: isRightRotation ? labels.ROT_R_SET_PARENT_RIGHT : labels.ROT_L_SET_PARENT_LEFT,
                                }
                                : {
                                    IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_R_IF_Y_PARENT_NULL : labels.ROT_L_IF_X_PARENT_NULL,
                                    ELSE_IF_UNBALANCED_SIDE1: isRightRotation ? labels.ROT_R_ELSE_IF_Y_IS_RIGHT : labels.ROT_L_ELSE_IF_X_IS_LEFT,
                                    ELSE_UNBALANCED_SIDE2: isRightRotation ? labels.ROT_R_ELSE_Y_IS_LEFT : labels.ROT_L_ELSE_X_IS_RIGHT,
                                    SET_UNBALANCED_PARENT_SIDE2: isRightRotation ? labels.ROT_R_SET_PARENT_LEFT : labels.ROT_L_SET_PARENT_RIGHT,
                                };

                    // Animación para rotación simple del subárbol
                    await animateEspecialBSTsRotation(
                        treeG,
                        parentOfUnbalanced,
                        unbalancedNode,
                        sonOfUnbalanced!,
                        rotationNode,
                        repositionSplayTree,
                        {
                            nodes: layoutNodes,
                            links: layoutLinks,
                            positions: deletionData.positions
                        },
                        {
                            bus,
                            stepId: "delete",
                            labels: {
                                ...baseLabels,
                                ...parentRelinkLabels
                            }
                        }
                    );
                    break;
                }
                case "attachRight": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_ROOT_RIGHT_R_SUB });

                    if (step.rightId) {
                        layoutNodes = deletionData.remainingNodesData;
                        layoutLinks = deletionData.remainingLinksData;

                        // Actualización de las posiciones de los nodos
                        drawTreeNodes(nodesLayer, layoutNodes, deletionData.positions);

                        // Reposicionamiento de los nodos y enlaces del árbol
                        await repositionSplayTree(treeG, layoutNodes, layoutLinks, deletionData.positions);

                        // Renderizado del nuevo enlace entre la nueva raíz y el subárbol derecho
                        drawTreeLinks(linksLayer, layoutLinks, deletionData.positions);

                        // Estado visual inicial del nuevo enlace derecho de la raíz
                        const newRootRightLink = treeG.select<SVGGElement>(`g#link-${step.parentId}-${step.rightId}`);
                        newRootRightLink.style("opacity", 0);

                        // Establecimiento del nuevo enlace entre la nueva raíz y el subárbol derecho
                        await newRootRightLink
                            .transition()
                            .duration(800)
                            .style("opacity", 1)
                            .end();
                    } else {
                        await delay(600);
                    }

                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_R_SUB_IS_NOT_NULL2 });
                    await delay(600);
                    break;
                }
                case "setParent": {
                    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_R_SUB_PARENT_ROOT });
                    await delay(600);
                    break;
                }
                case "decSize": {
                    const decSizeIndex = deleted && maxLeftNodeId ? labels.DEC_SIZE2 : labels.DEC_SIZE1;
                    bus.emit("step:progress", { stepId: "delete", lineIndex: decSizeIndex });
                    await delay(600);
                    break;
                }
                case "return": {
                    const returnIndex = deleted && maxLeftNodeId ? labels.RETURN_DELETED2
                        : deleted && !maxLeftNodeId ? labels.RETURN_DELETED1
                            : labels.RETURN_NOT_FOUND;
                    bus.emit("step:progress", { stepId: "insert", lineIndex: returnIndex });
                    await delay(600)
                    break;
                }
            }
        }

        if (deleted) {
            // Limpiamos el registro del nodo eliminado
            deletionData.positions.delete(targetNodeId!);
        }

        // Fin de la operación
        bus.emit("op:done", { op: "delete" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de búsqueda de un nodo en un árbol Splay.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param searchData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSearchSplayNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    searchData: {
        targetNodeId: string;
        found: boolean;
        searchSteps: SplaySearchStep[];
        positions: Map<string, { x: number, y: number }>;
        rotations: SplayRotation[];
        frames: SplayFrame[];
        highlightColor: string;
    },
    bus: EventBus,
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Etiquetas para el registro de eventos
    const labels = arbolSplayCode.search.labels;

    try {
        // Inicio de la operación
        bus.emit("op:start", { op: "search" });

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g#tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido (inicialmente oculto)
        const seqG = svg.select<SVGGElement>("g#seq-container");
        seqG.style("opacity", 0);

        // Búsqueda del nodo especificado
        await animateSearchNodeSteps(
            svg,
            treeG,
            treeOffset,
            {
                targetNodeId: searchData.targetNodeId,
                found: searchData.found,
                searchSteps: searchData.searchSteps,
                positions: searchData.positions,
                rotations: searchData.rotations,
                frames: searchData.frames,
                highlightColor: searchData.highlightColor,
                stepId: "search",
                labels
            },
            bus
        );

        // Fin de la operación
        bus.emit("op:done", { op: "search" });
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar la búsqueda recursiva de un nodo en un árbol binario.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param operationData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
async function animateSearchNodeSteps(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    operationData: {
        targetNodeId: string;
        found: boolean;
        searchSteps: SplaySearchStep[];
        positions: Map<string, { x: number, y: number }>;
        rotations: SplayRotation[];
        frames: SplayFrame[];
        highlightColor: string;
        stepId: string;
        labels: Record<string, number>;
    },
    bus: EventBus
) {
    // Elementos implicados en la operación 
    const { targetNodeId, found, searchSteps, stepId, labels } = operationData;

    // Grupo correspondiente al nodo objetivo
    const targetNodeGroup = treeG.select<SVGCircleElement>(`g#${targetNodeId} circle.node-container`);

    // Capas internas para nodos y enlaces
    const linksLayer = treeG.select<SVGGElement>("g#links-layer");
    const nodesLayer = treeG.select<SVGGElement>("g#nodes-layer");

    bus.emit("step:progress", { stepId, lineIndex: labels.DECLARE_CURRENT });
    await delay(600);

    bus.emit("step:progress", { stepId, lineIndex: labels.DECLARE_LAST });
    await delay(600);

    for (const step of searchSteps) {
        switch (step.type) {
            case "visit": {
                bus.emit("step:progress", { stepId, lineIndex: labels.BST_WHILE });

                if (step.at) {
                    // Resaltado del nodo actual
                    await treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`)
                        .transition()
                        .duration(800)
                        .attr("fill", operationData.highlightColor)
                        .end();
                } else {
                    await delay(600);
                }

                bus.emit("step:progress", { stepId, lineIndex: labels.SET_LAST_TO_CURR });
                await delay(600);
                break;
            }
            case "compare": {
                bus.emit("step:progress", { stepId, lineIndex: labels.DECLARE_CMP });
                await delay(600);

                bus.emit("step:progress", { stepId, lineIndex: labels.IF_FOUND });
                await delay(600);

                if (step.cmp === 0) {
                    // Pulsasión del nodo identificado
                    await targetNodeGroup
                        .transition()
                        .duration(300)
                        .attr("r", 30)
                        .transition()
                        .duration(300)
                        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
                        .end();

                    // Restablecimiento del estilo visual original del nodo identificado
                    await targetNodeGroup
                        .transition()
                        .duration(800)
                        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                        .end();
                }
                break;
            }
            case "advance": {
                // Restablecimiento del estilo visual original del nodo visitado
                bus.emit("step:progress", { stepId, lineIndex: labels.ADVANCE_CURRENT });
                await treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`)
                    .transition()
                    .duration(800)
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .end();
                break;
            }
            case "splayCall": {
                const splayCallIndex = step.reason === "search-found"
                    ? labels.SPLAY_FOUND : labels.SPLAY_LAST;
                bus.emit("step:progress", { stepId, lineIndex: splayCallIndex });

                if (!found) {
                    // Indicador visual de que el nodo indicado no existe en el árbol
                    await showTreeHint(
                        svg,
                        { type: "node", id: targetNodeId },
                        { label: "Elemento", value: "no ubicado" },
                        operationData.positions,
                        treeOffset,
                        {
                            size: { width: 80, height: 35 },
                            typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                            anchor: { side: "below", dx: 10, dy: -8 },
                            palette: { bg: "#1b2330", stroke: "#14b8a6" }
                        }
                    );
                } else {
                    await delay(600);
                }
                break;
            }
            case "splayWhileCheck": {
                bus.emit("step:progress", { stepId, lineIndex: labels.SPLAY_WHILE });
                await delay(600);
                break;
            }
            case "resolvePG": {
                bus.emit("step:progress", { stepId, lineIndex: labels.SPLAY_DECLARE_P });
                await delay(600);

                bus.emit("step:progress", { stepId, lineIndex: labels.SPLAY_DECLARE_G });
                await delay(600);
                break;
            }
            case "splayCase": {
                bus.emit("step:progress", { stepId, lineIndex: labels.IF_G_NULL });
                await delay(600);

                if (step.kind !== "zig") {
                    bus.emit("step:progress", { stepId, lineIndex: labels.ELSE_G_NOT_NULL });
                    await delay(600);

                    bus.emit("step:progress", { stepId, lineIndex: labels.DECL_X_IS_LEFT });
                    await delay(600);

                    bus.emit("step:progress", { stepId, lineIndex: labels.DECL_P_IS_LEFT });
                    await delay(600);

                    bus.emit("step:progress", { stepId, lineIndex: labels.IF_ZIGZIG_LL });
                    await delay(600);

                    if (step.kind !== "zig-zig" || (step.kind === "zig-zig" && step.shape === "RR")) {
                        bus.emit("step:progress", { stepId, lineIndex: labels.ELSE_IF_ZIGZIG_RR });
                        await delay(600);

                        if (step.kind !== "zig-zig") {
                            bus.emit("step:progress", { stepId, lineIndex: labels.ELSE_IF_ZIGZAG_LR });
                            await delay(600);

                            if (step.shape === "RL") {
                                bus.emit("step:progress", { stepId, lineIndex: labels.ELSE_ZIGZAG_RL });
                                await delay(600);
                            }
                        }
                    }
                }

                // Indicador visual del caso de splay a realizar
                await showTreeHint(
                    svg,
                    { type: "node", id: targetNodeId },
                    { label: "Splay", value: `${step.kind} (${step.kind === "zig" ? step.shape.charAt(0) : step.shape})` },
                    operationData.positions,
                    treeOffset,
                    {
                        size: { width: 80, height: 35 },
                        typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                        anchor: { side: "below", dx: 10, dy: -8 },
                        palette: { bg: "#1b2330", stroke: "#14b8a6" }
                    }
                );
                break;
            }
            case "rotate": {
                // Frame correspondiente a la rotación actual
                const frame = operationData.frames[step.frameIndex + 1];
                const rotation = operationData.rotations[step.rotationIndex];
                const rotationInfo = rotation.step;

                if (step.subkind === "zig") {
                    bus.emit("step:progress", { stepId, lineIndex: labels.IF_X_LEFT_ZIG });
                    await delay(600);

                    if (step.dir === "right") {
                        bus.emit("step:progress", { stepId, lineIndex: labels.ZIG_ROTATE_RIGHT_P });
                    } else {
                        bus.emit("step:progress", { stepId, lineIndex: labels.ELSE_X_RIGHT_ZIG });
                        await delay(600);

                        bus.emit("step:progress", { stepId, lineIndex: labels.ZIG_ROTATE_LEFT_P });
                    }
                } else if (step.subkind === "zigzig-1" || step.subkind === "zigzig-2") {
                    if (step.subkind === "zigzig-1") {
                        const firstRotationIndex = step.dir === "right" ? labels.ZIGZIG_LL_ROT1 : labels.ZIGZIG_RR_ROT1;
                        bus.emit("step:progress", { stepId, lineIndex: firstRotationIndex });
                    } else {
                        const secondRotationIndex = step.dir === "right" ? labels.ZIGZIG_LL_ROT2 : labels.ZIGZIG_RR_ROT2;
                        bus.emit("step:progress", { stepId, lineIndex: secondRotationIndex });
                    }
                } else {
                    if (step.subkind === "zigzag-1") {
                        const firstRotationIndex = step.dir === "left" ? labels.ZIGZAG_LR_ROT1 : labels.ZIGZAG_RL_ROT1;
                        bus.emit("step:progress", { stepId, lineIndex: firstRotationIndex });
                    } else {
                        const secondRotationIndex = step.dir === "right" ? labels.ZIGZAG_LR_ROT2 : labels.ZIGZAG_RL_ROT2;
                        bus.emit("step:progress", { stepId, lineIndex: secondRotationIndex });
                    }
                }
                await delay(600);

                // Actualizar el layout al frame de la rotación
                const layoutNodes = frame.nodes;
                const layoutLinks = frame.links;

                // Determinar el indicador del tipo de rotación a aplicar
                const rotationOrder = step.subkind === "zig" || step.subkind === "zigzag-1" || step.subkind === "zigzig-1" ? "first" : "second";
                const rotationIndicator = determineSplayRotationIndicatorTag(rotation.tag, rotationInfo.type, rotationOrder);

                // Indicador visual del tipo de rotación a aplicar
                await showTreeHint(
                    svg,
                    { type: "node", id: rotationInfo.zId },
                    { label: "Rotación", value: `${rotationIndicator}` },
                    operationData.positions,
                    treeOffset,
                    {
                        size: { width: 80, height: 35 },
                        typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                        anchor: { side: "below", dx: 10, dy: -8 },
                        palette: { bg: "#1b2330", stroke: "#14b8a6" }
                    }
                );

                // Renderizado de los nuevos enlaces y actualización de la posición de los nodos según el nuevo layout
                drawTreeLinks(linksLayer, layoutLinks, operationData.positions);
                drawTreeNodes(nodesLayer, layoutNodes, operationData.positions);

                const parentOfUnbalanced = rotationInfo.parentOfZId ?? null;
                const unbalancedNode = rotationInfo.zId;
                const sonOfUnbalanced = rotationInfo.yId;
                const rotationNode = rotationInfo.BId ?? null;

                const isRightRotation = step.dir === "right";

                const baseLabels = {
                    DECL_MAIN: isRightRotation ? labels.ROT_R_DECL_X : labels.ROT_L_DECL_Y,
                    DECL_AUX: isRightRotation ? labels.ROT_R_DECL_T2 : labels.ROT_L_DECL_T2,
                    SET_FIRST_LINK: isRightRotation ? labels.ROT_R_SET_X_RIGHT : labels.ROT_L_SET_Y_LEFT,
                    SET_SECOND_LINK: isRightRotation ? labels.ROT_R_SET_Y_LEFT : labels.ROT_L_SET_X_RIGHT,
                    SET_MAIN_PARENT: isRightRotation ? labels.ROT_R_SET_X_PARENT : labels.ROT_L_SET_Y_PARENT,
                    SET_UNBALANCED_PARENT: isRightRotation ? labels.ROT_R_SET_Y_PARENT : labels.ROT_L_SET_X_PARENT,
                    IF_AUX_NOT_NULL: isRightRotation ? labels.ROT_R_IF_T2_NOT_NULL : labels.ROT_L_IF_T2_NOT_NULL,
                    SET_AUX_PARENT: rotationNode
                        ? (isRightRotation ? labels.ROT_R_SET_T2_PARENT : labels.ROT_L_SET_T2_PARENT)
                        : undefined,
                };

                const parentRelinkLabels =
                    step.pivotSideOnParent === "root"
                        ? {
                            IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_R_IF_Y_PARENT_NULL : labels.ROT_L_IF_X_PARENT_NULL,
                            SET_ROOT: isRightRotation ? labels.ROT_R_SET_ROOT : labels.ROT_L_SET_ROOT,
                        }
                        : step.pivotSideOnParent === "right"
                            ? {
                                IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_R_IF_Y_PARENT_NULL : labels.ROT_L_IF_X_PARENT_NULL,
                                ELSE_IF_UNBALANCED_SIDE1: isRightRotation ? labels.ROT_R_ELSE_IF_Y_IS_RIGHT : labels.ROT_L_ELSE_IF_X_IS_LEFT,
                                SET_UNBALANCED_PARENT_SIDE1: isRightRotation ? labels.ROT_R_SET_PARENT_RIGHT : labels.ROT_L_SET_PARENT_LEFT,
                            }
                            : {
                                IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_R_IF_Y_PARENT_NULL : labels.ROT_L_IF_X_PARENT_NULL,
                                ELSE_IF_UNBALANCED_SIDE1: isRightRotation ? labels.ROT_R_ELSE_IF_Y_IS_RIGHT : labels.ROT_L_ELSE_IF_X_IS_LEFT,
                                ELSE_UNBALANCED_SIDE2: isRightRotation ? labels.ROT_R_ELSE_Y_IS_LEFT : labels.ROT_L_ELSE_X_IS_RIGHT,
                                SET_UNBALANCED_PARENT_SIDE2: isRightRotation ? labels.ROT_R_SET_PARENT_LEFT : labels.ROT_L_SET_PARENT_RIGHT,
                            };

                // Animación para rotación simple del subárbol
                await animateEspecialBSTsRotation(
                    treeG,
                    parentOfUnbalanced,
                    unbalancedNode,
                    sonOfUnbalanced!,
                    rotationNode,
                    repositionSplayTree,
                    {
                        nodes: layoutNodes,
                        links: layoutLinks,
                        positions: operationData.positions
                    },
                    {
                        bus,
                        stepId,
                        labels: {
                            ...baseLabels,
                            ...parentRelinkLabels
                        }
                    }
                );
                break;
            }
            case "setRoot": {
                bus.emit("step:progress", { stepId, lineIndex: labels.SET_ROOT_END });
                await delay(600);
                break;
            }
            case "return": {
                const returnIndex = found ? labels.RETURN_TRUE : labels.RETURN_FALSE;
                bus.emit("step:progress", { stepId, lineIndex: returnIndex });

                // Indicador visual de que el nodo objetivo ya corresponde con la raíz del árbol
                await showTreeHint(
                    svg,
                    { type: "node", id: targetNodeId },
                    { label: "Splay", value: "ya en raíz" },
                    operationData.positions,
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
    }
}

/**
 * Función que determina la etiqueta de rotación en función de la operación splay, el tipo y el orden de rotación.
 * @param splayCase Tipo de operación splay ("Zig", "Zig-Zig", or "Zig-Zag").
 * @param rotationType Tipo de rotación ("LL", "RR", "RL", "LR").
 * @param rotationOrder Especifica si la rotación es la "primera" o "segunda" de una secuencia.
 * @returns Cadena que representa la etiqueta de rotación.
 */
function determineSplayRotationIndicatorTag(
    splayCase: SplayRotationTag,
    rotationType: RotationType,
    rotationOrder: "first" | "second"
) {
    if (splayCase === "Zig") {
        return rotationType === "LL" ? "Der(padre)" : "Izq(padre)"
    } else if (splayCase === "Zig-Zig") {
        if (rotationOrder === "first") return rotationType === "LL" ? "Der(abuelo)" : "Izq(abuelo)";
        else return rotationType === "LL" ? "Der(padre)" : "Izq(padre)";
    } else {
        if (rotationOrder === "first") return rotationType === "RL" ? "Der(padre)" : "Izq(padre)";
        else return rotationType === "RL" ? "Izq(abuelo)" : "Der(abuelo)";
    }
}

/**
 * Función encargada de reubicar los nodos y ajustar los enlaces de conexión de un árbol Splay.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param nodes Array de nodos de jerarquía que representan la estructura del árbol.
 * @param linksData Array de objetos de datos de enlace que representan las conexiones entre nodos.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @returns Una promesa que se resuelve cuando se han completado todas las transiciones de nodos y enlaces.
 */
async function repositionSplayTree(
    g: Selection<SVGGElement, unknown, null, undefined>,
    nodes: HierarchyNode<HierarchyNodeData<number>>[],
    linksData: TreeLinkData[],
    positions: Map<string, { x: number; y: number }>
) {
    return repositionTree(g, nodes, linksData, positions, straightPath);
}