import type { HierarchyNode, Selection } from "d3";
import { AvlFrame, HierarchyNodeData, RotationStep, TreeLinkData } from "../../../types";
import { drawTreeLinks, drawTreeNodes, highlightTreePath, repositionTreeNodes } from "./drawActionsUtilities";
import { SVG_AVL_TREE_VALUES, SVG_BINARY_TREE_VALUES } from "../../constants/consts";
import { animateLeafOrSingleChild, animateTwoChildren } from "./BinaryTreeDrawActions";

/**
 * Función encargada de animar la inserción de un nuevo nodo en el árbol AVL.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Objeto con los offsets (x, y) del árbol dentro del SVG.
 * @param insertionData Objeto con información del árbol necesaria para la animación.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateAVLTreeInsert(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    insertionData: {
        newNodeId: string;
        parentId: string | null;
        nodesData: HierarchyNode<HierarchyNodeData<number>>[];
        linksData: TreeLinkData[];
        pathToParent: HierarchyNode<HierarchyNodeData<number>>[];
        rotations: RotationStep[],
        frames: AvlFrame[];
    },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Elementos del árbol requeridos para la animación 
    const { newNodeId, parentId, nodesData, linksData, pathToParent, rotations, frames } = insertionData;

    // Grupo contenedor de nodos y enlaces del árbol
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Grupo contenedor de los valores de la secuencia de recorrido
    const seqG = svg.select<SVGGElement>("g.seq-container");

    // Capas de nodos y enlaces
    const linksLayer = treeG.select<SVGGElement>("g.links-layer");
    const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");

    // Renderizado del árbol previo a cualquier rotación
    drawTreeNodes(nodesLayer, nodesData, positions);
    drawTreeLinks(linksLayer, linksData, positions);

    // Renderizado de métricas para los nodos del árbol
    buildAvlMetricsBadge(nodesLayer, nodesData);

    // Elevamos la capa de nodos
    nodesLayer.raise();

    // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
    seqG.style("opacity", 0);

    // Grupo del lienzo correspondiente al nuevo nodo
    const newNodeGroup = treeG.select<SVGGElement>(`g#${newNodeId}`);

    // Estado inicial del nuevo nodo
    newNodeGroup.style("opacity", 0);

    if (parentId) {
        // Grupo del lienzo correspondiente al enlace del nodo padre que apunta al nuevo nodo
        const newNodeLinkGroup = treeG.select<SVGGElement>(
            `g#link-${parentId}-${newNodeId}`
        );

        // Estado visual inicial del enlace
        newNodeLinkGroup.select("path.tree-link").style("opacity", 0);

        // Reposicionamiento de los nodos y enlaces del árbol
        await repositionTreeNodes(treeG, nodesData, linksData, positions);

        // Animación de recorrido desde el nodo raíz hasta el nodo padre del nuevo nodo
        await highlightTreePath(treeG, pathToParent, SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR);

        // Aparición del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();

        // Establecimiento del enlace del nodo padre al nuevo nodo
        await newNodeLinkGroup
            .select("path.tree-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    } else {
        await newNodeGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    }

    // Actualización de las métricas para los nodos del árbol
    updateAvlMetricsBadge(nodesLayer, nodesData);

    // Definición de las rotaciones a aplicar.
    const rotationsSteps: Array<{ tag: string; stepInfo: RotationStep }> = [];
    for (const r of rotations) {
        if (r.type === "LL") {
            rotationsSteps.push({ tag: "LL", stepInfo: r });
        } else if (r.type === "RR") {
            rotationsSteps.push({ tag: "RR", stepInfo: r });
        } else if (r.type === "LR") {
            // 1) rotIzq(y)
            rotationsSteps.push({ tag: "L(y)", stepInfo: r });
            // 2) rotDer(z)
            rotationsSteps.push({ tag: "R(z)", stepInfo: r });
        } else /* RL */ {
            // 1) rotDer(y)
            rotationsSteps.push({ tag: "R(y)", stepInfo: r });
            // 2) rotIzq(z)
            rotationsSteps.push({ tag: "L(z)", stepInfo: r });
        }
    }

    // Aplicación de rotaciones
    for (let i = 1; i < frames.length; i++) {
        const { nodes, links } = frames[i];
        const rotation = rotationsSteps[i - 1];

        // Mostrar badge de rotación segun la rotación a aplicar
        if (rotation.tag === "LL" || rotation.tag === "RR" || rotation.tag === "R(z)" || rotation.tag === "L(z)") {
            await showRotationHint(svg, { type: rotation.tag, pivotId: rotation.stepInfo.zId }, positions, treeOffset);
        } else {
            await showRotationHint(svg, { type: rotation.tag, pivotId: rotation.stepInfo.yId }, positions, treeOffset);
        }

        // Renderizar los nuevos enlaces
        drawTreeLinks(linksLayer, links, positions);

        // Actualizar la posición de los nodos según el estado actual
        drawTreeNodes(nodesLayer, nodes, positions);

        if (rotation.tag === "LL" || rotation.tag === "RR") {
            // Animación para rotación simple
            await animateRotation(
                treeG,
                rotation.stepInfo.parentOfZId ?? null,
                rotation.stepInfo.zId,
                rotation.stepInfo.yId,
                rotation.stepInfo.BId ?? null,
                {
                    nodes,
                    links,
                    positions
                }
            );
        } else if (rotation.tag === "L(y)" || rotation.tag === "R(y)") {
            // Animación para primer paso de rotación doble LR/RL
            await animateRotation(
                treeG,
                rotation.stepInfo.zId,
                rotation.stepInfo.yId,
                rotation.stepInfo.xId!,
                rotation.tag === "L(y)" ? rotation.stepInfo.xLeftId ?? null : rotation.stepInfo.xRightId ?? null,
                {
                    nodes,
                    links,
                    positions
                }
            );
        } else {
            // Animación para segundo paso de rotación compuesta LR/RL
            await animateRotation(
                treeG,
                rotation.stepInfo.parentOfZId ?? null,
                rotation.stepInfo.zId,
                rotation.stepInfo.xId!,
                rotation.tag === "L(z)" ? rotation.stepInfo.xLeftId ?? null : rotation.stepInfo.xRightId ?? null,
                {
                    nodes,
                    links,
                    positions
                }
            );
        }

        // Actualización de las métricas para los nodos del árbol
        updateAvlMetricsBadge(nodesLayer, nodes);
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación de un nodo dentor del árbol AVL.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Objeto con los offsets (x, y) del árbol dentro del SVG.
 * @param deletionData Objeto con información del árbol necesaria para la animación.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateAVLTreeDelete(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    deletionData: {
        prevRootNode: HierarchyNode<HierarchyNodeData<number>>;
        nodeToDelete: HierarchyNode<HierarchyNodeData<number>>;
        nodeToUpdate: HierarchyNode<HierarchyNodeData<number>> | null;
        remainingNodesData: HierarchyNode<HierarchyNodeData<number>>[];
        remainingLinksData: TreeLinkData[];
        rotations: RotationStep[],
        frames: AvlFrame[];
    },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Elementos del árbol requeridos para la animación 
    const { nodeToDelete, prevRootNode, remainingNodesData, remainingLinksData, nodeToUpdate, rotations, frames } = deletionData;

    // Grupo contenedor de nodos y enlaces del árbol
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Grupo contenedor de los valores de la secuencia de recorrido
    const seqG = svg.select<SVGGElement>("g.seq-container");

    // Capas de nodos y enlaces
    const linksLayer = treeG.select<SVGGElement>("g.links-layer");
    const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");

    // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
    seqG.style("opacity", 0);

    if (!nodeToUpdate) {
        // Nodo padre del nodo a eliminar
        const parentNode = nodeToDelete.parent;

        // Ruta desde el nodo raíz hasta el nodo padre del nodo a eliminar
        const pathToParent = parentNode ? prevRootNode.path(parentNode) : [];

        // Animación especifica de eliminación para nodo hoja o nodo con único hijo
        await animateLeafOrSingleChild(
            treeG,
            nodeToDelete,
            parentNode ? parentNode.data.id : null,
            pathToParent
        );
    } else {
        // Ruta desde el nodo raiz hasta el nodo a actualizar
        const pathToUpdateNode = prevRootNode.path(nodeToUpdate);

        // Ruta desde el nodo a actualizar hasta el nodo a eliminar
        const pathToRemovalNode = nodeToUpdate.path(nodeToDelete);

        // Animación especifica de eliminación para nodo con 2 hijos
        await animateTwoChildren(
            treeG,
            nodeToDelete,
            nodeToUpdate,
            pathToUpdateNode,
            pathToRemovalNode
        );
    }

    // Limpiamos el registro del nodo eliminado
    positions.delete(nodeToDelete.data.id);

    // Renderizado del árbol previo
    drawTreeNodes(nodesLayer, remainingNodesData, positions);
    drawTreeLinks(linksLayer, remainingLinksData, positions);

    // Actualización de las métricas para los nodos del árbol
    updateAvlMetricsBadge(nodesLayer, remainingNodesData);

    // Reposicionamiento de los nodos y enlaces del árbol
    await repositionTreeNodes(treeG, remainingNodesData, remainingLinksData, positions);

    // Definición de las rotaciones a aplicar.
    const rotationsSteps: Array<{ tag: string; stepInfo: RotationStep }> = [];
    for (const r of rotations) {
        if (r.type === "LL") {
            rotationsSteps.push({ tag: "LL", stepInfo: r });
        } else if (r.type === "RR") {
            rotationsSteps.push({ tag: "RR", stepInfo: r });
        } else if (r.type === "LR") {
            // 1) rotIzq(y)
            rotationsSteps.push({ tag: "L(y)", stepInfo: r });
            // 2) rotDer(z)
            rotationsSteps.push({ tag: "R(z)", stepInfo: r });
        } else /* RL */ {
            // 1) rotDer(y)
            rotationsSteps.push({ tag: "R(y)", stepInfo: r });
            // 2) rotIzq(z)
            rotationsSteps.push({ tag: "L(z)", stepInfo: r });
        }
    }

    // Aplicación de rotaciones
    for (let i = 1; i < frames.length; i++) {
        const { nodes, links } = frames[i];
        const rotation = rotationsSteps[i - 1];

        // Mostrar badge de rotación segun la rotación a aplicar
        if (rotation.tag === "LL" || rotation.tag === "RR" || rotation.tag === "R(z)" || rotation.tag === "L(z)") {
            showRotationHint(svg, { type: rotation.tag, pivotId: rotation.stepInfo.zId }, positions, treeOffset);
        } else {
            showRotationHint(svg, { type: rotation.tag, pivotId: rotation.stepInfo.yId }, positions, treeOffset);
        }

        // Renderizar los nuevos enlaces
        drawTreeLinks(linksLayer, links, positions);

        // Actualizar la posición de los nodos según el estado actual
        drawTreeNodes(nodesLayer, nodes, positions);

        if (rotation.tag === "LL" || rotation.tag === "RR") {

            // Animación para rotación simple
            await animateRotation(
                treeG,
                rotation.stepInfo.parentOfZId ?? null,
                rotation.stepInfo.zId,
                rotation.stepInfo.yId,
                rotation.stepInfo.BId ?? null,
                {
                    nodes,
                    links,
                    positions
                }
            );
        } else if (rotation.tag === "L(y)" || rotation.tag === "R(y)") {

            // Animación para primer paso de rotación doble LR/RL
            await animateRotation(
                treeG,
                rotation.stepInfo.zId,
                rotation.stepInfo.yId,
                rotation.stepInfo.xId!,
                rotation.tag === "L(y)" ? rotation.stepInfo.xLeftId ?? null : rotation.stepInfo.xRightId ?? null,
                {
                    nodes,
                    links,
                    positions
                }
            );
        } else {

            // Animación para segundo paso de rotación compuesta LR/RL
            await animateRotation(
                treeG,
                rotation.stepInfo.parentOfZId ?? null,
                rotation.stepInfo.zId,
                rotation.stepInfo.xId!,
                rotation.tag === "L(z)" ? rotation.stepInfo.xLeftId ?? null : rotation.stepInfo.xRightId ?? null,
                {
                    nodes,
                    links,
                    positions
                }
            );
        }

        // Actualización de las métricas para los nodos del árbol
        updateAvlMetricsBadge(nodesLayer, nodes);
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la rotación de nodos y enlaces del árbol AVL.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param parentOfUnbalanced ID del nodo padre del nodo desbalanceado (o null si no hay).
 * @param unbalancedNode ID del nodo desbalanceado (el nodo donde ocurre la rotación).
 * @param sonOfUnbalanced ID del nodo hijo involucrado en la rotación.
 * @param rotationNode ID del nodo del subárbol afectado por la rotación (o null si no hay).
 */
async function animateRotation(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    parentOfUnbalanced: string | null,
    unbalancedNode: string,
    sonOfUnbalanced: string,
    rotationNode: string | null,
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
        treeG.select<SVGGElement>(`g#link-${parentOfUnbalanced}-${sonOfUnbalanced}`)
            .select("path.tree-link")
            .style("opacity", 0);
    }

    // Fade out del nuevo enlace entre y y z
    treeG.select<SVGGElement>(`g#link-${sonOfUnbalanced}-${unbalancedNode}`)
        .select("path.tree-link")
        .style("opacity", 0);

    // Fade out del nuevo enlace entre z y B (si B)
    if (rotationNode) {
        treeG.select<SVGGElement>(`g#link-${unbalancedNode}-${rotationNode}`)
            .select("path.tree-link")
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
    await repositionTreeNodes(treeG, nodes, links, positions);

    // Fade in del nuevo enlace entre p y y (si p)
    if (parentOfUnbalanced) {
        await treeG.select<SVGGElement>(`g#link-${parentOfUnbalanced}-${sonOfUnbalanced}`)
            .select("path.tree-link")
            .transition()
            .duration(800)
            .style("opacity", 1)
            .end();
    }

    // Fade in del nuevo enlace entre y y z
    await treeG.select<SVGGElement>(`g#link-${sonOfUnbalanced}-${unbalancedNode}`)
        .select("path.tree-link")
        .transition()
        .duration(800)
        .style("opacity", 1)
        .end();

    // Fade in del nuevo enlace entre z y B (si B)
    if (rotationNode) {
        await treeG.select<SVGGElement>(`g#link-${unbalancedNode}-${rotationNode}`)
            .select("path.tree-link")
            .transition()
            .duration(800)
            .style("opacity", 1)
            .end();
    }

}

/**
 * Función encargada de mostrar un indicador visual para el tipo de rotación
 * @param svg Selección D3 del elemento SVG donde se renderizará el elemento.
 * @param rotation Objeto que contiene información sobre la rotación a realizar.
 * @param nodePositions Mapa que relaciona los IDs de los nodos con sus posiciones en el SVG.
 * @param treeOffset Objeto con los offsets (x, y) del árbol dentro del SVG.
 */
export async function showRotationHint(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    rotation: { type: string; pivotId: string; },
    nodePositions: Map<string, { x: number; y: number }>,
    treeOffset: { x: number; y: number }
) {
    // Capa overlay
    let overlay = svg.select<SVGGElement>("g.overlay-top");
    if (overlay.empty()) overlay = svg.append("g").attr("class", "overlay-top");
    overlay.selectAll("g.avl-rotation-hint").remove();

    // Asegura que el overlay quede arriba de todo
    overlay.raise();

    // Constantes visuales
    const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;
    const CHIP_W = 50, CHIP_H = 34, CHIP_R = 10;
    const BG = "#1b2330", STK = "#ff6b6b", TXT1 = "#f4a6a6", TXT2 = "#ffd5d5";
    const LABEL_FZ = 10, LABEL_FW = 600, KIND_FZ = 13, KIND_FW = 800;

    // Posición base del pivote
    const pivot = nodePositions.get(rotation.pivotId);
    if (!pivot) return;

    // Lado preferido (a la izq para LL/LR, a la der para RR/RL)
    const SIDE_OFFSET = r + 13;

    // const cy = treeOffset.y + pivot.y - UP_OFFSET;
    const cx = treeOffset.x + pivot.x + SIDE_OFFSET;
    const cy = treeOffset.y + pivot.y - 10;

    // grupo contenedor del badge
    const g = overlay.append("g")
        .attr("class", "avl-rotation-hint")
        .attr("transform", `translate(${cx}, ${cy}) scale(0.92)`)
        .style("opacity", 0);

    // Fondo
    g.append("rect")
        .attr("x", -CHIP_W / 2).attr("y", -CHIP_H / 2)
        .attr("width", CHIP_W).attr("height", CHIP_H)
        .attr("rx", CHIP_R).attr("ry", CHIP_R)
        .attr("fill", BG).attr("stroke", STK).attr("stroke-width", 1);

    // Textos (centrados dentro del chip de tamaño fijo)
    const textG = g.append("g").attr("class", "txt");
    textG.append("text")
        .attr("text-anchor", "middle").attr("y", -4)
        .style("font-size", `${LABEL_FZ}px`).style("font-weight", LABEL_FW)
        .attr("fill", TXT1).text("rotación");

    textG.append("text")
        .attr("text-anchor", "middle").attr("y", 12)
        .style("font-size", `${KIND_FZ}px`).style("font-weight", KIND_FW)
        .attr("fill", TXT2).text(rotation.type);

    // Animación: pop-in y fade-out
    await g.transition()
        .duration(500)
        .style("opacity", 1)
        .attr("transform", `translate(${cx}, ${cy}) scale(1)`)
        .end();

    await g.transition()
        .delay(1200)
        .duration(250)
        .style("opacity", 0)
        .remove()
        .end();
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

// Función para determinar el color del valor del factor de equilibrio del nodo
const bfColor = (bf: number) => {
    const a = Math.abs(bf ?? 0);
    if (a <= 1) return "#71c562";
    if (a === 2) return "#f4bf50";
    return "#e25555";
};