import type { HierarchyNode, Selection } from "d3";
import { AvlFrame, HierarchyNodeData, RotationStep, TreeLinkData } from "../../../types";
import { defaultAppearTreeNode, defaultDeleteTreeNode, drawTreeLinks, drawTreeNodes, repositionTree, showTreeHint } from "./drawActionsUtilities";
import { SVG_AVL_TREE_VALUES, SVG_BINARY_TREE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { animateBSTInsertCore, animateEspecialBSTsRotation, animateLeafOrSingleChild, animateTwoChildren, highlightBinaryTreePath } from "./BinaryTreeDrawActions";
import type { Dispatch, SetStateAction } from "react";
import { straightPath } from "../treeUtils";

/**
 * Función encargada de animar el proceso de inserción de un nuevo nodo en el árbol AVL.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Desplazamiento del árbol dentro del SVG.
 * @param insertionData Objeto con información del árbol necesaria para la animación.
 * @param animationOpts Objeto con opciones de animación para el proceso de inserción.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateAVLTreeInsert(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    insertionData: {
        targetNodeId: string;
        parentId: string | null;
        exists: boolean;
        currentNodes: HierarchyNode<HierarchyNodeData<number>>[];
        currentLinks: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
        pathToTarget: string[];
        rotations: RotationStep[];
        frames: AvlFrame[];
    },
    animationOpts: { highlightColor: string; },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    try {
        // Desestructuración de elementos requeridos para la animación (con uso más frecuente) 
        const { positions, targetNodeId, parentId, rotations, frames, currentNodes, currentLinks } = insertionData;

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g.tree-container");

        // Grupo contenedor de los valores de la secuencia de recorrido
        const seqG = svg.select<SVGGElement>("g.seq-container");

        // Si el nodo a insertar ya se encuentra dentro del árbol
        if (insertionData.exists) {
            // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
            seqG.style("opacity", 0);

            // Animación de recorrido hasta el nodo objetivo
            await highlightBinaryTreePath(treeG, insertionData.pathToTarget, animationOpts.highlightColor);

            // Restablecimiento del estilo visual original del nodo objetivo
            await treeG.select<SVGGElement>(`g#${targetNodeId} circle.node-container`)
                .transition()
                .duration(800)
                .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                .end();

            // Mostrar indicador visual de que el nodo ya estaba presente dentro del árbol
            await showTreeHint(
                svg,
                { type: "node", id: targetNodeId },
                { label: "Nodo", value: "ya insertado" },
                positions,
                treeOffset,
                {
                    size: { width: 75, height: 35 },
                    typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                    anchor: { side: "below", dx: 10, dy: -8 },
                    palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
                }
            );
        } else {
            // Selección de capas de nodos y enlaces
            const linksLayer = treeG.select<SVGGElement>("g.links-layer");
            const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");

            // Renderizado de los elementos correspondientes al nuevo nodo
            drawTreeNodes(nodesLayer, currentNodes, positions);
            drawTreeLinks(linksLayer, currentLinks, positions);

            // Renderizado de métricas para los nodos del árbol
            buildAvlMetricsBadge(nodesLayer, currentNodes);

            // Animación de inserción del elemento como BST
            await animateBSTInsertCore(
                treeG,
                seqG,
                {
                    newNodeId: targetNodeId,
                    parentId,
                    nodesData: currentNodes,
                    linksData: currentLinks,
                    pathToParent: insertionData.pathToTarget,
                    positions: positions
                },
                {
                    reposition: repositionAVLTree,
                    appearNode: appearAVLTreeNode,
                    highlight: highlightBinaryTreePath,
                    highlightColor: animationOpts.highlightColor
                }
            );

            // Restablecimiento del color original del padre del nuevo nodo (si aplica)
            if (parentId) {
                await treeG.select<SVGGElement>(`g#${insertionData.parentId} circle.node-container`)
                    .transition()
                    .duration(800)
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .end();
            }

            // Actualización de las métricas para los nodos del árbol
            updateAvlMetricsBadge(nodesLayer, currentNodes);

            // Aplicación de rotaciones
            let rotationIndex = 0;
            let framesPerDoubleRotation = 0;
            for (let i = 1; i < frames.length; i++) {
                // Iniciamos desde el segundo frame debido a que el primero corresponde al frame pre-rotación
                const { nodes, links } = frames[i];
                const rotation = rotations[rotationIndex];

                // Mostrar badge de rotación segun la rotación a aplicar
                if (framesPerDoubleRotation < 1) {
                    await showTreeHint(
                        svg,
                        { type: "node", id: rotation.zId },
                        { label: "Rotación", value: rotation.type },
                        positions,
                        treeOffset,
                        {
                            size: { width: 60, height: 35, radius: 10 },
                            typography: { labelFz: "10px", valueFz: "12px", labelFw: 900, valueFw: 900 },
                            anchor: { side: "right", dx: 0.5, dy: -10 },
                            palette: { stroke: "#ff6b6b" }
                        }
                    );
                }

                // Renderizar los nuevos enlaces
                drawTreeLinks(linksLayer, links, positions);

                // Actualizar la posición de los nodos según el estado actual
                drawTreeNodes(nodesLayer, nodes, positions);

                if (rotation.type === "LL" || rotation.type === "RR") {
                    // Animación para rotación simple (RR/LL)
                    await animateEspecialBSTsRotation(
                        treeG,
                        rotation.parentOfZId ?? null,
                        rotation.zId,
                        rotation.yId,
                        rotation.BId ?? null,
                        repositionAVLTree,
                        {
                            nodes,
                            links,
                            positions
                        }
                    );
                } else if (framesPerDoubleRotation < 1) {
                    // Animación para primer paso de rotación doble (LR/RL)
                    await animateEspecialBSTsRotation(
                        treeG,
                        rotation.zId,
                        rotation.yId,
                        rotation.xId!,
                        rotation.type === "LR" ? rotation.xLeftId ?? null : rotation.xRightId ?? null,
                        repositionAVLTree,
                        {
                            nodes,
                            links,
                            positions
                        }
                    );
                } else {
                    // Animación para segundo paso de rotación compuesta (LR/RL)
                    await animateEspecialBSTsRotation(
                        treeG,
                        rotation.parentOfZId ?? null,
                        rotation.zId,
                        rotation.xId!,
                        rotation.type === "RL" ? rotation.xLeftId ?? null : rotation.xRightId ?? null,
                        repositionAVLTree,
                        {
                            nodes,
                            links,
                            positions
                        }
                    );
                }

                // Actualización de las métricas para los nodos del árbol
                updateAvlMetricsBadge(nodesLayer, nodes);

                // Cálculo del indice para la siguiente rotación
                if (rotation.type === "RL" || rotation.type === "LR") {
                    framesPerDoubleRotation += 1;
                    if (framesPerDoubleRotation === 2) {
                        framesPerDoubleRotation = 0;
                        rotationIndex += 1;
                    }
                } else {
                    rotationIndex += 1;
                }
            }
        }
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar la eliminación de un nodo especifico en el árbol AVL.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Desplazamiento del árbol dentro del SVG.
 * @param deletionData Objeto con información del árbol necesaria para la animación.
 * @param animationOpts Objeto con opciones de animación para el proceso de eliminación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateAVLTreeDelete(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    deletionData: {
        targetNodeId: string;
        parentId: string | null;
        successorNodeId: string | null;
        replacementNodeId: string | null;
        exists: boolean;
        currentNodes: HierarchyNode<HierarchyNodeData<number>>[];
        currentLinks: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
        pathToTarget: string[];
        pathToSuccessor: string[];
        rotations: RotationStep[];
        frames: AvlFrame[];
    },
    animationOpts: {
        highlightTargetColor: string;
        highlightSuccessorColor: string;
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    try {
        // Desestructuración de elementos requeridos para la animación (con uso más frecuente)
        const { targetNodeId, parentId, successorNodeId, positions, currentNodes, currentLinks, rotations, frames } = deletionData;

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g.tree-container");

        // Grupo contenedor de los valores de la secuencia de recorrido
        const seqG = svg.select<SVGGElement>("g.seq-container");

        // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
        seqG.style("opacity", 0);

        // En caso de que el nodo objetivo no se encuentre dentro del árbol (no se elimina nada)
        if (!deletionData.exists) {
            // Animación de recorrido hasta el último nodo visitado
            await highlightBinaryTreePath(treeG, deletionData.pathToTarget, animationOpts.highlightTargetColor);

            // Mostrar indicador visual de que el nodo no fue encontrado
            await showTreeHint(
                svg,
                { type: "node", id: targetNodeId },
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

            // Restablecimiento del fondo original del último nodo visitado.
            await treeG.select<SVGGElement>(`g#${targetNodeId} circle.node-container`)
                .transition()
                .duration(800)
                .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                .end();
        } else {
            // Selección de capa de nodos y enlaces
            const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
            const linksLayer = treeG.select<SVGGElement>("g.links-layer");

            // Renderizado de elementos posteriores a la eliminación
            drawTreeNodes(nodesLayer, currentNodes, positions);
            drawTreeLinks(linksLayer, currentLinks, positions);

            // Determinamos el nodo a eliminar
            const nodeToDeleteId = successorNodeId ? successorNodeId : targetNodeId;

            if (!successorNodeId) {
                // Animación especifica de eliminación para nodo hoja o nodo con único hijo
                await animateLeafOrSingleChild(
                    treeG,
                    nodeToDeleteId,
                    parentId,
                    deletionData.replacementNodeId,
                    deletionData.pathToTarget,
                    {
                        deleteNode: defaultDeleteTreeNode,
                        highlightNodePath: highlightBinaryTreePath,
                        highlightColor: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR,
                        buildPath: straightPath
                    }
                );

                // Restablecimiento del color original del padre del nodo a eliminar (si aplica)
                if (parentId) {
                    await treeG.select<SVGGElement>(`g#${parentId} circle.node-container`)
                        .transition()
                        .duration(800)
                        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                        .end();
                }
            } else {
                // Animación específica de eliminación para nodo con 2 hijos
                await animateTwoChildren(
                    treeG,
                    nodeToDeleteId,
                    targetNodeId,
                    parentId!,
                    deletionData.replacementNodeId,
                    deletionData.pathToTarget,
                    deletionData.pathToSuccessor,
                    {
                        highlightNodePath: highlightBinaryTreePath,
                        highlightTargetColor: animationOpts.highlightTargetColor,
                        highlightSuccessorColor: animationOpts.highlightSuccessorColor
                    }
                );

                // Restablecimiento del color original del nodo actualizado
                await treeG.select<SVGGElement>(`g#${targetNodeId} circle.node-container`)
                    .transition()
                    .duration(800)
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .end();
            }

            // Limpiamos el registro del nodo eliminado
            positions.delete(nodeToDeleteId);

            // Actualización de las métricas para los nodos del árbol
            updateAvlMetricsBadge(nodesLayer, currentNodes);

            // Reposicionamiento de los nodos y enlaces del árbol
            await repositionAVLTree(treeG, currentNodes, currentLinks, positions);

            // Aplicación de rotaciones
            let rotationIndex = 0;
            let framesPerDoubleRotation = 0;
            for (let i = 1; i < frames.length; i++) {
                // Iniciamos desde el segundo frame debido a que el primero corresponde al frame pre-rotación
                const { nodes, links } = frames[i];
                const rotation = rotations[rotationIndex];

                // Mostrar badge de rotación segun la rotación a aplicar
                if (framesPerDoubleRotation < 1) {
                    await showTreeHint(
                        svg,
                        { type: "node", id: rotation.zId },
                        { label: "Rotación", value: rotation.type },
                        positions,
                        treeOffset,
                        {
                            size: { width: 50, height: 35, radius: 10 },
                            typography: { labelFz: "10px", valueFz: "12px", labelFw: 900, valueFw: 900 },
                            anchor: { side: "right", dx: 0.5, dy: -10 },
                            palette: { stroke: "#ff6b6b" }
                        }
                    );
                }

                // Renderizar los nuevos enlaces
                drawTreeLinks(linksLayer, links, positions);

                // Actualizar la posición de los nodos según el estado actual
                drawTreeNodes(nodesLayer, nodes, positions);

                if (rotation.type === "LL" || rotation.type === "RR") {
                    // Animación para rotación simple (RR/LL)
                    await animateEspecialBSTsRotation(
                        treeG,
                        rotation.parentOfZId ?? null,
                        rotation.zId,
                        rotation.yId,
                        rotation.BId ?? null,
                        repositionAVLTree,
                        {
                            nodes,
                            links,
                            positions
                        }
                    );
                } else if (framesPerDoubleRotation < 1) {
                    // Animación para primer paso de rotación doble (LR/RL)
                    await animateEspecialBSTsRotation(
                        treeG,
                        rotation.zId,
                        rotation.yId,
                        rotation.xId!,
                        rotation.type === "LR" ? rotation.xLeftId ?? null : rotation.xRightId ?? null,
                        repositionAVLTree,
                        {
                            nodes,
                            links,
                            positions
                        }
                    );
                } else {
                    // Animación para segundo paso de rotación compuesta (LR/RL)
                    await animateEspecialBSTsRotation(
                        treeG,
                        rotation.parentOfZId ?? null,
                        rotation.zId,
                        rotation.xId!,
                        rotation.type === "RL" ? rotation.xLeftId ?? null : rotation.xRightId ?? null,
                        repositionAVLTree,
                        {
                            nodes,
                            links,
                            positions
                        }
                    );
                }

                // Actualización de las métricas para los nodos del árbol
                updateAvlMetricsBadge(nodesLayer, nodes);

                // Cálculo del indice para la siguiente rotación
                if (rotation.type === "RL" || rotation.type === "LR") {
                    framesPerDoubleRotation += 1;
                    if (framesPerDoubleRotation === 2) {
                        framesPerDoubleRotation = 0;
                        rotationIndex += 1;
                    }
                } else {
                    rotationIndex += 1;
                }
            }
        }
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
export function buildAvlMetricsBadge(
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