import { type HierarchyNode, type Selection } from "d3";
import { HierarchyNodeData, RotationType, SplayFrame, SplayInsertStep, SplayRotation, SplayRotationTag, TreeLinkData } from "../../../domain/utils/types";
import type { Dispatch, SetStateAction } from "react";
import { defaultAppearTreeNode, defaultDeleteTreeNode, drawTreeLinks, drawTreeNodes, repositionTree, showTreeHint } from "./drawActionsUtilities";
import { SVG_BINARY_TREE_VALUES, SVG_SPLAY_TREE_VALUES, SVG_STYLE_VALUES } from "../../../domain/constants/consts";
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
        rotations: SplayRotation[],
        frames: SplayFrame[]
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
                        await treeG.select<SVGGElement>(`g#${step.at} circle.node-container`)
                            .transition()
                            .duration(800)
                            .attr("fill", SVG_SPLAY_TREE_VALUES.HIGHLIGHT_COLOR)
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
                        // Pulsasión del nodo identificado
                        await treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`)
                            .transition()
                            .duration(300)
                            .attr("r", 30)
                            .transition()
                            .duration(300)
                            .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
                            .end();

                        // Restablecimiento del estilo visual original del nodo identificado
                        await treeG.select<SVGGElement>(`g#${step.at} circle.node-container`)
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
                    await treeG.select<SVGGElement>(`g#${step.from} circle.node-container`)
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
                        { label: parentNodeId ? "Nueva Raíz" : "Splay", value: parentNodeId ? "Splay" : "ya en raíz" },
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
 * Función encargada de animar el proceso de eliminación de un nodo específico dentro de un árbol Splay
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Desplazamiento del árbol dentro del SVG.
 * @param deletionData Objeto con información del árbol necesaria para la animación. 
 * @param resetQueryValues Función para restablecer los valores de la query del usuario. 
 * @param setIsAnimating Función para establecer el estado de animación. 
 */
export async function animateSplayDeleteNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    deletionData: {
        targetNode: HierarchyNode<HierarchyNodeData<number>>;
        maxLeftNode: HierarchyNode<HierarchyNodeData<number>> | null;
        removed: boolean;
        currentNodes: HierarchyNode<HierarchyNodeData<number>>[];
        currentLinks: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
        pathToTargetNode: HierarchyNode<HierarchyNodeData<number>>[];
        pathToMaxLeftNode: HierarchyNode<HierarchyNodeData<number>>[];
        targetNodeRotations: SplayRotation[],
        maxLeftRotations: SplayRotation[],
        frames: SplayFrame[]
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Desestructuración de elementos requeridos para la animación (con uso más frecuente) 
    const { positions, targetNode, maxLeftNode, frames } = deletionData;

    // Grupo contenedor principal de los elementos del árbol (nodos y enlaces)
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Grupo contenedor de la secuencia de valores de recorrido
    const seqG = svg.select<SVGGElement>("g.seq-container");

    // Capas especificas de nodos y enlaces
    const linksLayer = treeG.select<SVGGElement>("g.links-layer");
    const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");

    // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
    seqG.style("opacity", 0);

    // Grupo correspondiente al nodo objetivo
    const targetNodeGroup = treeG.select<SVGGElement>(`g#${targetNode.data.id}`);

    // Animación de recorrido hasta el nodo objetivo
    await highlightBinaryTreePath(treeG, deletionData.pathToTargetNode, SVG_SPLAY_TREE_VALUES.HIGHLIGHT_COLOR);

    // En caso de que el nodo objetivo no se encuentre dentro del árbol (no se elimina nada)
    if (!deletionData.removed) {
        // Mostrar indicador visual de que el nodo no fue encontrado
        await showTreeHint(
            svg,
            { type: "node", id: targetNode.data.id },
            { label: "Nodo", value: "no ubicado" },
            positions,
            treeOffset,
            {
                size: { width: 80, height: 35 },
                typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                anchor: { side: "below", dx: 10, dy: -8 },
                palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
            }
        );
    }

    // Restablecimiento del estilo visual original del nodo objetivo
    await targetNodeGroup
        .select("circle.node-container")
        .transition()
        .duration(800)
        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
        .end();

    // Aplicación de operación splay sobre el nodo objetivo (nodo a eliminar si el nodo se encuentra dentro del árbol o último visitado en caso contrario)
    let frameCount = 1;
    for (const rotationStep of deletionData.targetNodeRotations) {
        // Rotación a aplicar
        const rotation = rotationStep.rotation;
        const { nodes, links } = frames[frameCount];

        // Mostrar indicador visual del caso splay (antes de aplicar cualquier rotación)
        if (rotationStep.rotationOrder === "first") {
            await showTreeHint(
                svg,
                { type: "node", id: targetNode.data.id },
                { label: "Splay", value: `${rotationStep.tag} (${rotationStep.tag === "Zig" ? rotation.type.charAt(0) : rotation.type})` },
                positions,
                treeOffset,
                {
                    size: { width: 78, height: 35 },
                    typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                    anchor: { side: "below", dx: 10, dy: -8 },
                    palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
                }
            );
        }

        // Determinar el indicador del tipo de rotación a aplicar
        const rotationIndicator = determineSplayRotationIndicatorTag(rotationStep.tag, rotation.type, rotationStep.rotationOrder);

        // Mostrar indicador visual de la rotación a aplicar
        await showTreeHint(
            svg,
            { type: "node", id: rotation.zId },
            { label: "Rotación", value: `${rotationIndicator}` },
            positions,
            treeOffset,
            {
                size: { width: 78, height: 35 },
                typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                anchor: { side: "below", dx: 10, dy: -8 },
                palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
            }
        );

        // Renderizar los nuevos enlaces (post-rotación)
        drawTreeLinks(linksLayer, links, positions);

        // Actualizar la posición de los nodos (post-rotación)
        drawTreeNodes(nodesLayer, nodes, positions);

        // Animación de rotación a aplicar
        await animateEspecialBSTsRotation(
            treeG,
            rotation.parentOfZId ?? null,
            rotation.zId,
            rotation.yId,
            rotation.BId ?? null,
            repositionSplayTree,
            {
                nodes,
                links,
                positions
            }
        );

        frameCount++;
    }

    // Mostrar indicador visual de que el nodo objetivo ya corresponde con la raíz del árbol
    await showTreeHint(
        svg,
        { type: "node", id: targetNode.data.id },
        { label: targetNode.parent ? "Nueva Raíz" : "Splay", value: targetNode.parent ? "Splay" : "ya en raíz" },
        positions,
        treeOffset,
        {
            size: { width: 70, height: 35 },
            typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
            anchor: { side: "below", dx: 10, dy: -8 },
            palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
        }
    );

    // En caso de que el nodo objetivo si se encuentre dentro del árbol (animamos el proceso de eliminación)
    if (deletionData.removed) {
        // El nodo a eliminar corresponde ahora a la raíz actual del árbol (si el nodo objetivo contaba con un nodo padre, usamos el 
        // último frame post-rotación durante su búsqueda para obtener su estado actual)
        const nodeToDelete = targetNode.parent ? frames[frameCount - 1].root : targetNode;

        // Mostrar indicador visual de eliminación del nodo raíz
        await showTreeHint(
            svg,
            { type: "node", id: nodeToDelete.data.id },
            { label: "Eliminar", value: "Raíz" },
            positions,
            treeOffset,
            {
                size: { width: 78, height: 35 },
                typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                anchor: { side: "below", dx: 10, dy: -8 },
                palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
            }
        );

        // Si el nodo a eliminar cuenta con nodos hijos
        let leftChild: HierarchyNodeData<number> | null = null;
        let rightChild: HierarchyNodeData<number> | null = null;
        if (nodeToDelete.data.children) {
            // Desconexión de los enlaces entre el nodo a eliminar y sus hijos
            leftChild = nodeToDelete.data.children[0];
            rightChild = nodeToDelete.data.children[1];

            if (!leftChild.isPlaceholder) {
                await linksLayer.select<SVGGElement>(`g#link-${nodeToDelete.data.id}-${leftChild.id}`)
                    .transition()
                    .duration(800)
                    .style("opacity", 0)
                    .remove()
                    .end();
            }

            if (!rightChild.isPlaceholder) {
                await linksLayer.select<SVGGElement>(`g#link-${nodeToDelete.data.id}-${rightChild.id}`)
                    .transition()
                    .duration(800)
                    .style("opacity", 0)
                    .remove()
                    .end();
            }
        }

        // Salida del nodo a eliminar
        await defaultDeleteTreeNode(targetNodeGroup);

        // Limpiamos el registro del nodo eliminado
        positions.delete(nodeToDelete.data.id);

        // Si el nodo a eliminar cuenta con subárbol izquierdo (trabajamos con el nodo con máximo valor de dicho subárbol)
        if (maxLeftNode) {
            // Grupo correspondiente al nodo con mayor valor del subárbol izq.
            const maxLeftNodeGroup = treeG.select<SVGGElement>(`g#${maxLeftNode.data.id}`);

            // Mostrar indicador visual de búsqueda de la nueva raíz del árbol
            await showTreeHint(
                svg,
                { type: "node", id: leftChild!.id },
                { label: "Buscar Máx.", value: "Subárbol Izq." },
                positions,
                treeOffset,
                {
                    size: { width: 80, height: 35 },
                    typography: { labelFz: "9.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                    anchor: { side: "below", dx: 10, dy: -8 },
                    palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
                }
            );

            // Animación de recorrido hasta el nodo objetivo
            await highlightBinaryTreePath(treeG, deletionData.pathToMaxLeftNode, SVG_SPLAY_TREE_VALUES.HIGHLIGHT_COLOR);

            // Restablecimiento del estilo visual original del nodo objetivo
            await maxLeftNodeGroup
                .select("circle.node-container")
                .transition()
                .duration(800)
                .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                .end();

            // Aplicación de operación splay sobre el nodo objetivo (nodo con mayor valor del subárbol izq. para convertirlo en la nueva raíz)
            for (const rotationStep of deletionData.maxLeftRotations) {
                // Rotación a aplicar
                const rotation = rotationStep.rotation;
                const { nodes, links } = frames[frameCount];

                // Mostrar indicador visual del caso splay (antes de aplicar cualquier rotación)
                if (rotationStep.rotationOrder === "first") {
                    await showTreeHint(
                        svg,
                        { type: "node", id: maxLeftNode.data.id },
                        { label: "Splay", value: `${rotationStep.tag} (${rotationStep.tag === "Zig" ? rotation.type.charAt(0) : rotation.type})` },
                        positions,
                        treeOffset,
                        {
                            size: { width: 78, height: 35 },
                            typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                            anchor: { side: "below", dx: 10, dy: -8 },
                            palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
                        }
                    );
                }

                // Determinar el indicador del tipo de rotación a aplicar
                const rotationIndicator = determineSplayRotationIndicatorTag(rotationStep.tag, rotation.type, rotationStep.rotationOrder);

                // Mostrar indicador visual de la rotación a aplicar
                await showTreeHint(
                    svg,
                    { type: "node", id: rotation.zId },
                    { label: "Rotación", value: `${rotationIndicator}` },
                    positions,
                    treeOffset,
                    {
                        size: { width: 78, height: 35 },
                        typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                        anchor: { side: "below", dx: 10, dy: -8 },
                        palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
                    }
                );

                // Renderizar los nuevos enlaces (post-rotación)
                drawTreeLinks(linksLayer, links, positions);

                // Actualizar la posición de los nodos (post-rotación)
                drawTreeNodes(nodesLayer, nodes, positions);

                // Animación de rotación a aplicar
                await animateEspecialBSTsRotation(
                    treeG,
                    rotation.parentOfZId ?? null,
                    rotation.zId,
                    rotation.yId,
                    rotation.BId ?? null,
                    repositionSplayTree,
                    {
                        nodes,
                        links,
                        positions
                    }
                );

                frameCount++;
            }

            if (rightChild && !rightChild.isPlaceholder) {
                // Renderizado del nuevo enlace entre la nueva raíz y el subárbol derecho
                drawTreeLinks(linksLayer, deletionData.currentLinks, positions);

                // Estado visual inicial del nuevo enlace
                const newRootRightLink = linksLayer.select<SVGGElement>(`g#link-${maxLeftNode.data.id}-${rightChild.id}`);
                newRootRightLink.style("opacity", 0);

                // Aparición del nuevo enlace
                await newRootRightLink
                    .transition()
                    .duration(800)
                    .style("opacity", 1)
                    .end();
            }
        }

        // Actualizar posiciones de los nodos
        drawTreeNodes(nodesLayer, deletionData.currentNodes, positions);

        // Reposición de nodos y enlaces
        await repositionSplayTree(treeG, deletionData.currentNodes, deletionData.currentLinks, positions);

        // Mostrar indicador visual de que el nodo objetivo ya corresponde con la raíz del árbol
        if (rightChild || leftChild) {
            await showTreeHint(
                svg,
                { type: "node", id: deletionData.currentNodes[0].data.id },
                { label: "Nueva Raíz", value: "Splay" },
                positions,
                treeOffset,
                {
                    size: { width: 70, height: 35 },
                    typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                    anchor: { side: "below", dx: 10, dy: -8 },
                    palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
                }
            );
        }
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar el proceso de búsqueda de un nodo dentro de un árbol Splay.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Desplazamiento del árbol dentro del SVG. 
 * @param searchData Objeto con información del árbol necesaria para la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateSplaySearch(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    searchData: {
        targetNode: HierarchyNode<HierarchyNodeData<number>>;
        found: boolean;
        positions: Map<string, { x: number, y: number }>;
        pathToTargetNode: HierarchyNode<HierarchyNodeData<number>>[];
        rotations: SplayRotation[],
        frames: SplayFrame[]
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Desestructuración de elementos requeridos para la animación (con uso más frecuente) 
    const { positions, targetNode } = searchData;

    // Grupo contenedor principal de los elementos del árbol (nodos y enlaces)
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Grupo contenedor de la secuencia de valores de recorrido
    const seqG = svg.select<SVGGElement>("g.seq-container");

    // Capas especificas de nodos y enlaces
    const linksLayer = treeG.select<SVGGElement>("g.links-layer");
    const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");

    // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
    seqG.style("opacity", 0);

    // Grupo correspondiente al nodo objetivo
    const targetNodeGroup = treeG.select<SVGCircleElement>(`g#${targetNode.data.id} circle.node-container`);

    // Animación de recorrido hasta el nodo objetivo
    await highlightBinaryTreePath(treeG, searchData.pathToTargetNode, SVG_SPLAY_TREE_VALUES.HIGHLIGHT_COLOR);

    // Resaltado final del nodo objetivo (si esta presente en el árbol)
    if (searchData.found) {
        await targetNodeGroup
            .transition()
            .duration(250)
            .attr("r", 30)
            .transition()
            .duration(250)
            .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
            .end();
    } else {
        // Mostrar indicador visual de que el nodo no fue encontrado
        await showTreeHint(
            svg,
            { type: "node", id: targetNode.data.id },
            { label: "Nodo", value: "no ubicado" },
            positions,
            treeOffset,
            {
                size: { width: 80, height: 35 },
                typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                anchor: { side: "below", dx: 10, dy: -8 },
                palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
            }
        );
    }

    // Restablecimiento del estilo visual original del nodo objetivo
    await targetNodeGroup
        .transition()
        .duration(800)
        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
        .end();

    // Aplicación de rotaciones
    let frameCount = 1;
    for (const rotationStep of searchData.rotations) {
        // Rotación a aplicar
        const rotation = rotationStep.rotation;
        const { nodes, links } = searchData.frames[frameCount];

        // Mostrar indicador visual del caso splay (antes de aplicar cualquier rotación)
        if (rotationStep.rotationOrder === "first") {
            await showTreeHint(
                svg,
                { type: "node", id: targetNode.data.id },
                { label: "Splay", value: `${rotationStep.tag} (${rotationStep.tag === "Zig" ? rotation.type.charAt(0) : rotation.type})` },
                positions,
                treeOffset,
                {
                    size: { width: 78, height: 35 },
                    typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                    anchor: { side: "below", dx: 10, dy: -8 },
                    palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
                }
            );
        }

        // Determinar el indicador del tipo de rotación a aplicar
        const rotationIndicator = determineSplayRotationIndicatorTag(rotationStep.tag, rotation.type, rotationStep.rotationOrder);

        // Mostrar indicador visual de la rotación a aplicar
        await showTreeHint(
            svg,
            { type: "node", id: rotation.zId },
            { label: "Rotación", value: `${rotationIndicator}` },
            positions,
            treeOffset,
            {
                size: { width: 78, height: 35 },
                typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                anchor: { side: "below", dx: 10, dy: -8 },
                palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
            }
        );

        // Renderizar los nuevos enlaces (post-rotación)
        drawTreeLinks(linksLayer, links, positions);

        // Actualizar la posición de los nodos (post-rotación)
        drawTreeNodes(nodesLayer, nodes, positions);

        // Animación de rotación a aplicar
        await animateEspecialBSTsRotation(
            treeG,
            rotation.parentOfZId ?? null,
            rotation.zId,
            rotation.yId,
            rotation.BId ?? null,
            repositionSplayTree,
            {
                nodes,
                links,
                positions
            }
        );

        frameCount++;
    }

    // Mostrar indicador visual de que el nodo objetivo ya corresponde con la raíz del árbol
    await showTreeHint(
        svg,
        { type: "node", id: targetNode.data.id },
        { label: targetNode.parent ? "Nueva Raíz" : "Splay", value: targetNode.parent ? "Splay" : "ya en raíz" },
        positions,
        treeOffset,
        {
            size: { width: 70, height: 35 },
            typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
            anchor: { side: "below", dx: 10, dy: -8 },
            palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
        }
    );

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
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