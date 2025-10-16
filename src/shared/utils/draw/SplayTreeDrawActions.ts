import { type HierarchyNode, type Selection } from "d3";
import { HierarchyNodeData, RotationType, SplayFrame, SplayRotation, SplayRotationTag, TreeLinkData } from "../../../types";
import type { Dispatch, SetStateAction } from "react";
import { defaultAppearTreeNode, defaultDeleteTreeNode, drawTreeLinks, drawTreeNodes, repositionTree, showTreeHint } from "./drawActionsUtilities";
import { SVG_BINARY_TREE_VALUES, SVG_SPLAY_TREE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { animateBSTInsertCore, animateEspecialBSTsRotation, highlightBinaryTreePath } from "./BinaryTreeDrawActions";
import { straightPath } from "../treeUtils";

/**
 * Función encargada de animar el proceso de inserción de un nuevo nodo dentro de un árbol Splay.
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

    // Si el nodo a insertar ya se encuentra dentro del árbol
    if (!insertionData.inserted) {
        // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
        seqG.style("opacity", 0);

        // Animación de recorrido hasta el nodo objetivo
        await highlightBinaryTreePath(treeG, insertionData.pathToNode, SVG_SPLAY_TREE_VALUES.HIGHLIGHT_COLOR);

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
        // Renderizado de los elementos correspondientes al nuevo nodo
        drawTreeNodes(nodesLayer, currentNodes, positions);
        drawTreeLinks(linksLayer, currentLinks, positions);

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
                highlightColor: SVG_SPLAY_TREE_VALUES.HIGHLIGHT_COLOR
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

    // Aplicación de operación splay sobre el nodo objetivo
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
        { label: insertionData.parentId ? "Nueva Raíz" : "Splay", value: insertionData.parentId ? "Splay" : "ya en raíz" },
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
function determineSplayRotationIndicatorTag(splayCase: SplayRotationTag, rotationType: RotationType, rotationOrder: "first" | "second") {
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