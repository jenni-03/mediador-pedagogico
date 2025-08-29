import type { HierarchyNode, Selection } from "d3";
import { AvlFrame, HierarchyNodeData, RotationStep, TreeLinkData } from "../../../types";
import { drawTreeLinks, drawTreeNodes, highlightTreePath, repositionTreeNodes } from "./drawActionsUtilities";
import { SVG_AVL_TREE_VALUES, SVG_BINARY_TREE_VALUES } from "../../constants/consts";
import { animateLeafOrSingleChild, animateTwoChildren } from "./BinaryTreeDrawActions";

/**
 * Función encargada de animar la inserción de un nuevo nodo en el árbol AVL.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param seqG Selección D3 del elemento SVG del grupo (`<g>`) que contiene la secuencia de valores de recorrido.
 * @param insertionData Objeto con información del árbol necesaria para la animación.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateAVLTreeInsert(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    seqG: Selection<SVGGElement, unknown, null, undefined>,
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

    // Capas de nodos y enlaces
    const linksLayer = treeG.select<SVGGElement>("g.links-layer");
    const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");

    // Renderizado del árbol previo a cualquier rotación
    drawTreeNodes(nodesLayer, nodesData, positions);
    drawTreeLinks(linksLayer, linksData, positions);

    // Renderizado de métricas para los nodos del árbol
    renderAvlMetricsBadges(nodesLayer, nodesData);

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

        // Renderizar los nuevos enlaces
        drawTreeLinks(linksLayer, links, positions);

        // Actualizar la posición de los nodos según el estado actual
        drawTreeNodes(nodesLayer, nodes, positions);

        const rotation = rotationsSteps[i - 1];
        const rotationInfo = rotation.stepInfo;
        if (rotation.tag === "LL" || rotation.tag === "RR") {

            // Animación para rotación simple
            await animateRotation(
                treeG,
                rotationInfo.parentOfZId ?? null,
                rotationInfo.zId,
                rotationInfo.yId,
                rotationInfo.BId ?? null,
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
                rotationInfo.zId,
                rotationInfo.yId,
                rotationInfo.xId!,
                rotation.tag === "L(y)" ? rotationInfo.xLeftId ?? null : rotationInfo.xRightId ?? null,
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
                rotationInfo.parentOfZId ?? null,
                rotationInfo.zId,
                rotationInfo.xId!,
                rotation.tag === "L(z)" ? rotationInfo.xLeftId ?? null : rotationInfo.xRightId ?? null,
                {
                    nodes,
                    links,
                    positions
                }
            );
        }

        // Renderizado de métricas para los nodos del árbol
        renderAvlMetricsBadges(nodesLayer, nodes);

        // Elevamos la capa de nodos
        nodesLayer.raise();
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación de un nodo dentor del árbol AVL.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param seqG Selección D3 del elemento SVG del grupo (`<g>`) que contiene la secuencia de valores de recorrido.
 * @param deletionData Objeto con información del árbol necesaria para la animación.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateAVLTreeDelete(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    seqG: Selection<SVGGElement, unknown, null, undefined>,
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

    // Renderizado de métricas para los nodos del árbol
    renderAvlMetricsBadges(nodesLayer, remainingNodesData);

    // Elevamos la capa de nodos
    nodesLayer.raise();

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

        // Renderizar los nuevos enlaces
        drawTreeLinks(linksLayer, links, positions);

        // Actualizar la posición de los nodos según el estado actual
        drawTreeNodes(nodesLayer, nodes, positions);

        const rotation = rotationsSteps[i - 1];
        const rotationInfo = rotation.stepInfo;
        if (rotation.tag === "LL" || rotation.tag === "RR") {

            // Animación para rotación simple
            await animateRotation(
                treeG,
                rotationInfo.parentOfZId ?? null,
                rotationInfo.zId,
                rotationInfo.yId,
                rotationInfo.BId ?? null,
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
                rotationInfo.zId,
                rotationInfo.yId,
                rotationInfo.xId!,
                rotation.tag === "L(y)" ? rotationInfo.xLeftId ?? null : rotationInfo.xRightId ?? null,
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
                rotationInfo.parentOfZId ?? null,
                rotationInfo.zId,
                rotationInfo.xId!,
                rotation.tag === "L(z)" ? rotationInfo.xLeftId ?? null : rotationInfo.xRightId ?? null,
                {
                    nodes,
                    links,
                    positions
                }
            );
        }

        // Renderizado de métricas para los nodos del árbol
        renderAvlMetricsBadges(nodesLayer, nodes);

        // Elevamos la capa de nodos
        nodesLayer.raise();
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
 * Función encargada de renderizar las insignias de métricas del árbol AVL (factor de balance y altura) como paneles SVG para cada nodo.
 * @param nodesLayer La selección D3 del grupo SVG (`<g>`) que contiene los nodos del árbol.
 * @param nodes Array de nodos de jerarquía D3 que representan los nodos del árbol AVL.
 */
export function renderAvlMetricsBadges(
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
        .selectAll<SVGGElement, d3.HierarchyNode<HierarchyNodeData<number>>>("g.node")
        .data(nodes, d => d.data.id);

    // JOIN anidado - 1 panel por nodo
    nodeGroups.selectAll<SVGGElement, d3.HierarchyNode<HierarchyNodeData<number>>>("g.avl-panel")
        .data(d => [d], (d) => d.data.id)
        .join(
            (enter) => {
                // Creación del grupo contenedor del panel
                const gEnter = enter
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

                return gEnter;
            },
            update => {
                update.select<SVGTextElement>("text.val-bf")
                    .attr("fill", (d) => bfColor(d.data.bf!))
                    .text((d) => d.data.bf!);

                update.select<SVGTextElement>("text.val-h")
                    .text((d) => d.data.height ?? 0);

                return update;
            },
            exit => exit
        );
}

export function showRotationHint(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    rotation: { type: string; pivotId: string; childId?: string },
    nodePositions: Map<string, { x: number; y: number }>,
    treeOffset: { x: number; y: number }
) {
    // Capa overlay
    let overlay = svg.select<SVGGElement>("g.overlay-top");
    if (overlay.empty()) overlay = svg.append("g").attr("class", "overlay-top");
    overlay.selectAll("g.avl-rotation-hint").remove();
    if (!rotation) return;

    // Constantes visuales
    const W = 72;            // ancho fijo del chip
    const H = 34;            // alto fijo del chip
    const RND = 10;
    const BG = "#1b2330";
    const STK = "#ff6b6b";
    const TXT1 = "#f4a6a6";
    const TXT2 = "#ffd5d5";

    const LABEL_FZ = 10;
    const LABEL_FW = 600;
    const KIND_FZ = 13;
    const KIND_FW = 800;

    const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;

    // Posición base del pivote
    const pivotPos = nodePositions.get(rotation.pivotId);
    if (!pivotPos) return;

    // Lado preferido (a la izq para LL/LR, a la der para RR/RL)
    const toLeft = rotation.type.startsWith("L");
    const dx = toLeft ? -(r + 44) : (r + 44);
    const dy = -r - 8;

    const cx = treeOffset.x + pivotPos.x + dx;
    const cy = treeOffset.y + pivotPos.y + dy;

    // ----- grupo del chip -----
    const g = overlay.append("g")
        .attr("class", "avl-rotation-hint")
        .attr("transform", `translate(${cx}, ${cy}) scale(0.92)`)
        .style("opacity", 0)
        .attr("filter", "url(#chipShadow)");

    // Fondo
    g.append("rect")
        .attr("class", "badge-bg")
        .attr("x", -W / 2).attr("y", -H / 2)
        .attr("width", W).attr("height", H)
        .attr("rx", RND).attr("ry", RND)
        .attr("fill", BG).attr("stroke", STK).attr("stroke-width", 1);

    // Textos (centrados dentro del chip de tamaño fijo)
    const textG = g.append("g").attr("class", "txt");
    textG.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("y", -4)
        .style("font-size", `${LABEL_FZ}px`)
        .style("font-weight", LABEL_FW)
        .attr("fill", TXT1)
        .text("rotación");

    textG.append("text")
        .attr("class", "kind")
        .attr("text-anchor", "middle")
        .attr("y", 12)
        .style("font-size", `${KIND_FZ}px`)
        .style("font-weight", KIND_FW)
        .attr("fill", TXT2)
        .text(rotation.type);

    // “Cola” (pequeña línea hacia el pivote)
    const vx = -dx, vy = -dy;
    const len = Math.hypot(vx, vy) || 1;
    const ux = (vx / len) * 10, uy = (vy / len) * 10;

    g.append("path")
        .attr("d", `M 0 ${H / 2} L ${ux} ${H / 2 + uy}`)
        .attr("fill", "none")
        .attr("stroke", STK)
        .attr("stroke-width", 1.2);

    // Animación: pop-in y fade-out
    g.transition().duration(200)
        .style("opacity", 1)
        .attr("transform", `translate(${cx}, ${cy}) scale(1)`)
        .transition().delay(1400).duration(280)
        .style("opacity", 0)
        .remove();

    // Asegura que el overlay quede arriba de todo
    overlay.raise();
}

const bfColor = (bf: number) => {
    const a = Math.abs(bf ?? 0);
    if (a <= 1) return "#71c562";
    if (a === 2) return "#f4bf50";
    return "#e25555";
};