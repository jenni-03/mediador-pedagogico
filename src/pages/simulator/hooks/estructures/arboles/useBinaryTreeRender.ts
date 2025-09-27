import { useEffect, useMemo, useRef } from "react";
import { BaseQueryOperations, HierarchyNodeData, TraversalNodeType, TreeLinkData } from "../../../../../types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { SVG_BINARY_TREE_VALUES } from "../../../../../shared/constants/consts";
import { animateClearTree, animateTreeTraversal, drawTraversalSequence, drawTreeLinks, drawTreeNodes } from "../../../../../shared/utils/draw/drawActionsUtilities";
import { animateDeleteNode, animateInsertNode, animateSearchNode } from "../../../../../shared/utils/draw/BinaryTreeDrawActions";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { computeSvgTreeMetrics } from "../../../../../shared/utils/treeUtils";
import { hierarchy, type HierarchyNode, select, tree } from "d3";

export function useBinaryTreeRender(
    treeData: HierarchyNodeData<number> | null,
    query: BaseQueryOperations<"arbol_binario">,
    resetQueryValues: () => void
) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Mapa para guardar posiciones {x, y} de los nodos dentro del lienzo
    const nodePositions = useRef(new Map<string, { x: number, y: number }>()).current;

    // Mapa para guardar posiciones {x, y} de los valores de secuencia dentro del lienzo
    const seqPositions = useRef(new Map<string, { x: number, y: number }>()).current;

    // offsets para contenedores de árbol y secuencia
    const treeOffset = useRef({ x: 0, y: 0 }).current;
    const seqOffset = useRef({ x: 0, y: 0 }).current;

    // Nodo raíz D3 jerárquico que representa la estructura del árbol
    const root = useMemo(() => {
        return treeData ? hierarchy(treeData) : null;
    }, [treeData]);

    // Lista de nodos actuales (sin placeholders)
    const currentNodes = useMemo(() => {
        return root ? root.descendants().filter(d => !d.data.isPlaceholder) : [];
    }, [root]);

    // Estado previo de la raíz
    const prevRoot = usePrevious(root);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

    // Memo para calcular los enlaces entre nodos
    const linksData: TreeLinkData[] = useMemo(() => {
        if (!root) return [];
        return root.links().reduce<TreeLinkData[]>((acc, link) => {
            if (!link.target.data.isPlaceholder) {
                acc.push({ sourceId: link.source.data.id, targetId: link.target.data.id })
            }
            return acc;
        }, []);
    }, [root]);

    // Renderizado base del árbol
    useEffect(() => {
        // Verificamos que la raiz no sea nula y que la referencia al SVG se haya establecido
        if (!root || !svgRef.current) return;

        // Margenes para el svg
        const margin = {
            left: SVG_BINARY_TREE_VALUES.MARGIN_LEFT,
            right: SVG_BINARY_TREE_VALUES.MARGIN_RIGHT,
            top: SVG_BINARY_TREE_VALUES.MARGIN_TOP,
            bottom: SVG_BINARY_TREE_VALUES.MARGIN_BOTTOM
        };

        // Separación horizontal entre nodos y vertical entre niveles
        const nodeSpacing = SVG_BINARY_TREE_VALUES.NODE_SPACING;
        const levelSpacing = SVG_BINARY_TREE_VALUES.LEVEL_SPACING;

        // Creación del layout del árbol
        const treeLayout = tree<HierarchyNodeData<number>>()
            .nodeSize([nodeSpacing, levelSpacing]);
        treeLayout(root);

        // Cálculo de las dimensiones del lienzo y sus contenedores
        const metrics = computeSvgTreeMetrics(
            currentNodes,
            prevRoot?.descendants() ?? currentNodes,
            margin,
            currentNodes.length,
            SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING,
            SVG_BINARY_TREE_VALUES.SEQUENCE_HEIGHT
        );

        // Configuración del contenedor SVG
        const svg = select(svgRef.current)
            .attr("height", metrics.height)
            .attr("width", metrics.width);

        // Desplazamiento para el contenedor de los nodos (evita que partes queden fuera si las coordenadas son negativas)
        treeOffset.x = metrics.treeOffset.x;
        treeOffset.y = metrics.treeOffset.y;

        // Contenedor interno para los nodos y enlaces del árbol
        let treeG = svg.select<SVGGElement>("g.tree-container");
        if (treeG.empty()) {
            treeG = svg.append("g")
                .classed("tree-container", true);
        }
        treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

        // Desplazamiento para el contenedor de la secuencia de recorrido de nodos
        seqOffset.x = metrics.seqOffset.x;
        seqOffset.y = metrics.seqOffset.y;

        // Contenedor interno para la secuencia de recorrido de los nodos
        let seqG = svg.select<SVGGElement>("g.seq-container");
        if (seqG.empty()) {
            seqG = svg.append("g").classed("seq-container", true);
        }
        seqG.attr(
            "transform",
            `translate(${seqOffset.x}, ${seqOffset.y})`
        );

        // Capas internas para nodos y enlaces
        let linksLayer = treeG.select<SVGGElement>("g.links-layer");
        if (linksLayer.empty()) linksLayer = treeG.append("g").attr("class", "links-layer");

        let nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
        if (nodesLayer.empty()) nodesLayer = treeG.append("g").attr("class", "nodes-layer");

        // Renderizado de los nodos del árbol
        drawTreeNodes(nodesLayer, currentNodes, nodePositions);

        // Renderizado de los enlaces entre nodos
        drawTreeLinks(linksLayer, linksData, nodePositions);

        nodesLayer.raise();
    }, [root, currentNodes, treeOffset, seqOffset, prevRoot, linksData]);

    // Efecto para manejar la inserción de nuevos nodos
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!root || !svgRef.current || (!query.toInsertLeft && !query.toInsertRight)) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g.tree-container");

        // Grupo contenedor de los valores de la secuencia de recorrido
        const seqG = svg.select<SVGGElement>("g.seq-container");

        // Determinamos el ID del nuevo nodo a insertar
        const nodeToInsert = query.toInsertLeft ? query.toInsertLeft : query.toInsertRight!;

        // Ubicamos al nuevo nodo en el árbol
        const newNode = currentNodes.find(d => d.data.id === nodeToInsert);
        if (!newNode) return;

        // Obtenemos el recorrido o ruta desde el nodo raíz hasta el nodo padre del nuevo nodo
        let parentNode: HierarchyNode<HierarchyNodeData<number>> | null = null;
        let pathToParent: HierarchyNode<HierarchyNodeData<number>>[] = [];
        if (newNode.parent !== null) {
            parentNode = newNode.parent;
            pathToParent = root.path(parentNode);
        }

        // Animación de inserción del nuevo nodo
        animateInsertNode(
            treeG,
            seqG,
            {
                newNodeId: newNode.data.id,
                parentId: parentNode?.data.id ?? null,
                nodesData: currentNodes,
                linksData,
                positions: nodePositions,
                pathToParent
            },
            resetQueryValues,
            setIsAnimating
        );
    }, [root, currentNodes, linksData, query.toInsertLeft, query.toInsertRight, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la eliminación de un nodo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!prevRoot || !svgRef.current || !query.toDelete) return;

        // Verificación de la estructura de la query del usuario
        if (query.toDelete.length !== 2) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g.tree-container");

        // Grupo contenedor de los valores de la secuencia de recorrido
        const seqG = svg.select<SVGGElement>("g.seq-container");

        // Determinamos el ID del nodo a eliminar
        const nodeToDeleteId = query.toDelete[0];

        // Ubicamos al nodo a eliminar en el árbol
        const nodeToDelete = prevRoot.descendants().find(d => d.data.id === nodeToDeleteId);
        if (!nodeToDelete) return;

        // Ubicamos el nodo a actualizar en el arbol (si aplica)
        let nodeToUpdate: HierarchyNode<HierarchyNodeData<number>> | null = null;
        if (query.toDelete[1]) {
            nodeToUpdate = prevRoot.descendants().find(d => d.data.id === query.toDelete[1])!;
        }

        // Animación de eliminación de un nodo especifico
        animateDeleteNode(
            treeG,
            seqG,
            {
                prevRootNode: prevRoot,
                nodeToDelete,
                nodeToUpdate,
                remainingNodesData: currentNodes,
                remainingLinksData: linksData,
                positions: nodePositions
            },
            resetQueryValues,
            setIsAnimating
        );
    }, [prevRoot, currentNodes, linksData, query.toDelete, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la búsqueda de un nodo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!root || !svgRef.current || !query.toSearch) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g.tree-container");

        // Grupo contenedor de los valores de la secuencia de recorrido
        const seqG = svg.select<SVGGElement>("g.seq-container");

        // Ubicamos al nodo a buscar en el árbol
        const nodeToSearch = currentNodes.find(d => d.data.value === query.toSearch);
        if (!nodeToSearch) return;

        // Ruta de búsqueda del nodo
        const pathToNode = root.path(nodeToSearch);

        // Animación de búsqueda del nodo
        animateSearchNode(treeG, seqG, nodeToSearch.data.id, pathToNode, resetQueryValues, setIsAnimating);
    }, [root, currentNodes, query.toSearch, resetQueryValues, setIsAnimating]);

    // Efecto para manejar los recorridos del árbol
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!svgRef.current) return;

        // Determinar el tipo de recorrido a animar
        const traversalType =
            query.toGetPreOrder.length > 0 ? "pre" :
                query.toGetInOrder.length > 0 ? "in" :
                    query.toGetPostOrder.length > 0 ? "post" :
                        query.toGetLevelOrder.length > 0 ? "level" :
                            null;

        if (!traversalType) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g.tree-container");

        // Grupo contenedor de los valores de la secuencia de recorrido
        const seqG = svg.select<SVGGElement>("g.seq-container");

        let nodes: TraversalNodeType[] = [];
        if (traversalType === "pre") nodes = query.toGetPreOrder;
        else if (traversalType === "in") nodes = query.toGetInOrder;
        else if (traversalType === "post") nodes = query.toGetPostOrder;
        else if (traversalType === "level") nodes = query.toGetLevelOrder;

        // Renderizado de los valores para la secuencia del recorrido
        drawTraversalSequence(
            seqG,
            nodes,
            {
                nodePositions,
                seqPositions,
                treeOffset,
                seqOffset
            }
        );

        // Animación de recorrido de los nodos del árbol
        animateTreeTraversal(treeG, seqG, nodes, seqPositions, resetQueryValues, setIsAnimating);
    }, [query.toGetInOrder, query.toGetPreOrder, query.toGetPostOrder, query.toGetLevelOrder, seqOffset, treeOffset, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la limpieza de lienzo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!svgRef.current || !query.toClear) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Grupo contenedor de nodos y enlaces del árbol
        const treeG = svg.select<SVGGElement>("g.tree-container");

        // Grupo contenedor de los valores de la secuencia de recorrido
        const seqG = svg.select<SVGGElement>("g.seq-container");

        // Animación de limpieza del árbol
        animateClearTree(
            treeG,
            seqG,
            { nodePositions, seqPositions },
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toClear, resetQueryValues, setIsAnimating]);

    return { svgRef };
}