import { type HierarchyNode, type Selection } from "d3";
import { HierarchyNodeData, RotationType, SplayFrame, SplayRotation, SplayRotationTag, TreeLinkData } from "../../../types";
import type { Dispatch, SetStateAction } from "react";
import { defaultAppearTreeNode, drawTreeLinks, drawTreeNodes, repositionTree, showTreeHint } from "./drawActionsUtilities";
import { SVG_BINARY_TREE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { animateBSTInsertCore, animateEspecialBSTsRotation, highlightBinaryTreePath } from "./BinaryTreeDrawActions";
import { straightPath } from "../treeUtils";

/**
 * Función encargada de animar la inserción de un nuevo nodo en el árbol Splay.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Desplazamiento del árbol dentro del SVG.
 * @param insertionData Objeto con información del árbol necesaria para la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateSplayInsertNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    insertionData: {
        newNodeId: string;
        inserted: boolean;
        parentId: string | null;
        currentNodes: HierarchyNode<HierarchyNodeData<number>>[];
        currentLinks: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
        pathToNode: HierarchyNode<HierarchyNodeData<number>>[];
        rotations: SplayRotation[],
        frames: SplayFrame[]
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Desestructuración de elementos requeridos para la animación (con uso más frecuente) 
    const { positions, currentNodes, currentLinks } = insertionData;

    // Grupo contenedor principal de los elementos del árbol (nodos y enlaces)
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Grupo contenedor de la secuencia de valores de recorrido
    const seqG = svg.select<SVGGElement>("g.seq-container");

    // Capas auxiliares especificas de nodos y enlaces
    const linksLayer = treeG.select<SVGGElement>("g.links-layer");
    const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");

    // Renderizado del estado del árbol previo a cualquier rotación
    drawTreeNodes(nodesLayer, currentNodes, positions);
    drawTreeLinks(linksLayer, currentLinks, positions);

    // Si el nodo a insertar ya se encuentra dentro del árbol
    if (!insertionData.inserted) {
        // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
        seqG.style("opacity", 0);

        // Animación de recorrido hasta el nodo objetivo
        await highlightBinaryTreePath(treeG, insertionData.pathToNode, SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR);

        // Restablecimiento del estilo visual original del nodo objetivo
        await treeG.select<SVGGElement>(`g#${insertionData.newNodeId} circle.node-container`)
            .transition()
            .duration(800)
            .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
            .end();

        // Mostrar indicador visual de que el nodo ya estaba presente dentro del árbol
        await showTreeHint(
            svg,
            { type: "node", id: insertionData.newNodeId },
            { label: "Nodo", value: "ya insertado" },
            positions,
            treeOffset,
            {
                size: { width: 78, height: 35 },
                typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                anchor: { side: "below", dx: 10, dy: -8 },
                palette: { bg: "#0c2b2e", stroke: "#14b8a6" }
            }
        );
    } else {
        // Animación de inserción del nuevo nodo como BST
        await animateBSTInsertCore(
            treeG,
            seqG,
            {
                newNodeId: insertionData.newNodeId,
                parentId: insertionData.parentId,
                nodesData: currentNodes,
                linksData: currentLinks,
                pathToParent: insertionData.pathToNode,
                positions: positions
            },
            {
                reposition: repositionSplayTree,
                appearNode: defaultAppearTreeNode,
                highlight: highlightBinaryTreePath,
                highlightColor: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR
            }
        );

        // Restablecimiento del estilo visual original del padre del nuevo nodo (si aplica)
        if (insertionData.parentId) {
            await treeG.select<SVGGElement>(`g#${insertionData.parentId} circle.node-container`)
                .transition()
                .duration(800)
                .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                .end();
        }
    }

    // Aplicación de rotaciones
    let frameCount = 1;
    for (const rotationStep of insertionData.rotations) {
        // Rotación a aplicar
        const rotation = rotationStep.rotation;
        const { nodes, links } = insertionData.frames[frameCount];

        // Mostrar indicador visual del caso splay (antes de aplicar cualquier rotación)
        if (rotationStep.rotationOrder === "first") {
            await showTreeHint(
                svg,
                { type: "node", id: insertionData.newNodeId },
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
        { type: "node", id: insertionData.newNodeId },
        { label: "Splay", value: "ya en raíz" },
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
 * Función encargada de animar la búsqueda de un nodo dentro del árbol Splay.
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
        targetNodeId: string;
        found: boolean;
        currentNodes: HierarchyNode<HierarchyNodeData<number>>[];
        currentLinks: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
        pathToTargetNode: HierarchyNode<HierarchyNodeData<number>>[];
        rotations: SplayRotation[],
        frames: SplayFrame[]
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Desestructuración de elementos requeridos para la animación (con uso más frecuente) 
    const { positions, currentNodes, currentLinks } = searchData;

    // Grupo contenedor principal de los elementos del árbol (nodos y enlaces)
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Grupo contenedor de la secuencia de valores de recorrido
    const seqG = svg.select<SVGGElement>("g.seq-container");

    // Capas especificas de nodos y enlaces
    const linksLayer = treeG.select<SVGGElement>("g.links-layer");
    const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");

    // Renderizado del estado del árbol previo a cualquier rotación
    drawTreeNodes(nodesLayer, currentNodes, positions);
    drawTreeLinks(linksLayer, currentLinks, positions);

    // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
    seqG.style("opacity", 0);

    // Grupo correspondiente al nodo objetivo
    const targetNodeGroup = treeG.select<SVGCircleElement>(`g#${searchData.targetNodeId} circle.node-container`);

    // Animación de recorrido hasta el nodo objetivo
    await highlightBinaryTreePath(treeG, searchData.pathToTargetNode, SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR);

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
            { type: "node", id: searchData.targetNodeId },
            { label: "Nodo", value: "no encontrado" },
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
                { type: "node", id: searchData.targetNodeId },
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
        { type: "node", id: searchData.targetNodeId },
        { label: "Splay", value: "ya en raíz" },
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
function determineSplayRotationIndicatorTag(splayCase: SplayRotationTag, rotationType: RotationType, rotationOrder: "first" | "second") {
    if (splayCase === "Zig") {
        return rotationType === "LL" ? "R(padre)" : "L(padre)"
    } else if (splayCase === "Zig-Zig") {
        if (rotationOrder === "first") return rotationType === "LL" ? "R(abuelo)" : "L(abuelo)";
        else return rotationType === "LL" ? "R(padre)" : "L(padre)";
    } else {
        if (rotationOrder === "first") return rotationType === "RL" ? "R(padre)" : "L(padre)";
        else return rotationType === "RL" ? "L(abuelo)" : "R(abuelo)";
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