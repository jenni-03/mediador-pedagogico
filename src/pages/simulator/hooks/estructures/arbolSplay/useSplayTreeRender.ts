import { useEffect, useMemo, useRef } from "react";
import { BaseQueryOperations, HierarchyNodeData, TraversalNodeType, TreeLinkData } from "../../../../../types";
import { hierarchy, HierarchyNode, select, tree } from "d3";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { computeSvgTreeMetrics, hierarchyFrom } from "../../../../../shared/utils/treeUtils";
import { SVG_BINARY_TREE_VALUES, SVG_SPLAY_TREE_VALUES } from "../../../../../shared/constants/consts";
import { animateSplayDeleteNode, animateSplayInsertNode, animateSplaySearch } from "../../../../../shared/utils/draw/SplayTreeDrawActions";
import { animateClearTree, animateTreeTraversal, drawTraversalSequence } from "../../../../../shared/utils/draw/drawActionsUtilities";

export function useSplayTreeRender(
    treeData: HierarchyNodeData<number> | null,
    query: BaseQueryOperations<"arbol_splay">,
    resetQueryValues: () => void
) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Mapas de posiciones actuales (nodos) y de la secuencia (recorridos)
    const nodePositions = useRef(new Map<string, { x: number; y: number }>()).current;
    const seqPositions = useRef(new Map<string, { x: number; y: number }>()).current;

    // Offsets para contenedores de árbol y secuencia
    const treeOffset = useRef({ x: 0, y: 0 }).current;
    const seqOffset = useRef({ x: 0, y: 0 }).current;

    // Raíz jerárquica D3 (final post-operación)
    const root = useMemo(() => (treeData ? hierarchy(treeData) : null), [treeData]);

    // Nodos “reales” (sin placeholders)
    const currentNodes = useMemo(
        () => (root ? root.descendants().filter((d) => !d.data.isPlaceholder) : []),
        [root]
    );

    // Estado previo (para delete)
    const prevRoot = usePrevious(root);

    // Control de animación global
    const { setIsAnimating } = useAnimation();

    // Enlaces actuales (sin placeholders)
    const linksData: TreeLinkData[] = useMemo(() => {
        if (!root) return [];
        return root.links().reduce<TreeLinkData[]>((acc, link) => {
            if (!link.target.data.isPlaceholder) {
                acc.push({ sourceId: link.source.data.id, targetId: link.target.data.id })
            }
            return acc;
        }, []);
    }, [root]);

    // Layouts para las rotaciones del árbol
    const splayFramesLayouts = useMemo(() => {
        const frames = query.splayTrace?.hierarchies.bst
            ? [query.splayTrace.hierarchies.bst, ...query.splayTrace.hierarchies.mids]
            : [];
        return frames.map(frame => hierarchyFrom(frame, SVG_SPLAY_TREE_VALUES.NODE_SPACING, SVG_SPLAY_TREE_VALUES.LEVEL_SPACING));
    }, [query.splayTrace?.hierarchies.bst, query.splayTrace?.hierarchies.mids]);

    // Renderizado base del árbol
    useEffect(() => {
        // Verificamos que la raiz no sea nula y que la referencia al SVG se haya establecido
        if (!root || !svgRef.current) return;

        // Margenes para el svg
        const margin = {
            left: SVG_BINARY_TREE_VALUES.MARGIN_LEFT,
            right: SVG_BINARY_TREE_VALUES.MARGIN_RIGHT,
            top: SVG_BINARY_TREE_VALUES.MARGIN_TOP,
            bottom: SVG_BINARY_TREE_VALUES.MARGIN_BOTTOM,
        };

        // Separación horizontal entre nodos y vertical entre niveles
        const nodeSpacing = SVG_SPLAY_TREE_VALUES.NODE_SPACING;
        const levelSpacing = SVG_SPLAY_TREE_VALUES.LEVEL_SPACING;

        // Creación del layout del árbol
        const treeLayout = tree<HierarchyNodeData<number>>()
            .nodeSize([nodeSpacing, levelSpacing]);
        treeLayout(root);

        // Aplanar los nodos de todos los frames
        const splayFramesNodes = splayFramesLayouts.flatMap(frame => frame.nodes);
        const nodesForMetrics = splayFramesNodes.length > 0 ? splayFramesNodes : currentNodes;

        // Cálculo de las dimensiones del lienzo y sus contenedores
        const metrics = computeSvgTreeMetrics(
            nodesForMetrics,
            prevRoot?.descendants() ?? nodesForMetrics,
            margin,
            currentNodes.length,
            SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING + 10,
            SVG_BINARY_TREE_VALUES.SEQUENCE_HEIGHT,
            SVG_SPLAY_TREE_VALUES.EXTRA_WIDTH
        );

        // Configuración del contenedor SVG
        const svg = select(svgRef.current)
            .attr("height", metrics.height)
            .attr("width", metrics.width);

        // Desplazamiento para el contenedor principal (evita que partes queden fuera si las coordenadas son negativas)
        treeOffset.x = metrics.treeOffset.x;
        treeOffset.y = metrics.treeOffset.y;

        // Contenedor principal de los elementos del árbol (nodos y enlaces)
        let treeG = svg.select<SVGGElement>("g.tree-container");
        if (treeG.empty()) treeG = svg.append("g").classed("tree-container", true);
        treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

        // Desplazamiento para el contenedor de la secuencia de recorrido de nodos
        seqOffset.x = metrics.seqOffset.x;
        seqOffset.y = metrics.seqOffset.y;

        // Contenedor de la secuencia de recorrido de nodos
        let seqG = svg.select<SVGGElement>("g.seq-container");
        if (seqG.empty()) seqG = svg.append("g").classed("seq-container", true);
        seqG.attr("transform", `translate(${seqOffset.x}, ${seqOffset.y})`);

        // Capas auxiliares para nodos y enlaces
        let linksLayer = treeG.select<SVGGElement>("g.links-layer");
        if (linksLayer.empty()) linksLayer = treeG.append("g").attr("class", "links-layer");

        let nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
        if (nodesLayer.empty()) nodesLayer = treeG.append("g").attr("class", "nodes-layer");

        // Elevamos la capa de nodos
        nodesLayer.raise();
    }, [root, currentNodes, treeOffset, seqOffset, prevRoot, linksData, splayFramesLayouts]);

    // Efecto para manejar la inserción de nuevos nodos
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!root || !svgRef.current || !query.toInsert || !query.splayTrace) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Obtenemos el layout inicial previo a cualquier rotación (en caso de presentarse)
        const preLayout = query.splayTrace.hierarchies.bst ? splayFramesLayouts[0] : null;

        // Extraemos los datos de inserción de la query
        const { targetNodeId, inserted } = query.toInsert;

        // Ubicamos al nuevo nodo en el árbol
        const newNode = preLayout ? preLayout.root.find(d => d.data.id === targetNodeId) : root.find(d => d.data.id === targetNodeId);
        if (!newNode) return;

        // Obtenemos el recorrido o ruta desde el nodo raíz hasta el nodo objetivo (dependiendo si ya se encontraba dentro del árbol o no)
        let parentNode: HierarchyNode<HierarchyNodeData<number>> | null = null;
        let pathToNode: HierarchyNode<HierarchyNodeData<number>>[] = [];
        if (newNode.parent && preLayout) {
            parentNode = newNode.parent;
            pathToNode = inserted ? preLayout.root.path(parentNode) : preLayout.root.path(newNode);
        }

        // Animación de inserción splay
        animateSplayInsertNode(
            svg,
            treeOffset,
            {
                newNodeId: newNode.data.id,
                inserted,
                parentId: parentNode?.data.id ?? null,
                currentNodes: preLayout ? preLayout.nodes : currentNodes,
                currentLinks: preLayout ? preLayout.links : linksData,
                positions: nodePositions,
                pathToNode,
                rotations: query.splayTrace.phases.insertion,
                frames: splayFramesLayouts
            },
            resetQueryValues,
            setIsAnimating
        );
    }, [root, currentNodes, linksData, query.toInsert, query.splayTrace, splayFramesLayouts, treeOffset, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la eliminación de un nodo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!prevRoot || !svgRef.current || query.toDelete == null || !query.splayTrace) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Obtenemos el layout inicial previo a cualquier rotación (en caso de presentarse)
        const preLayout = query.splayTrace.hierarchies.bst ? splayFramesLayouts[0] : null;

        // Extraemos los datos de eliminación de la query
        const { nodeId, removed, maxLeftId } = query.toDelete;

        // Obtenemos los pasos de rotación pertenecientes al splay del nodo objetivo y del nodo maxL
        const targetNodeRotations = query.splayTrace.phases.search;
        const maxLeftRotations = query.splayTrace.phases.deletion;

        // Ubicamos al nodo objetivo en el árbol (si el nodo objetivo no es la raíz usamos el layout pre-rotación)
        const targetNode = targetNodeRotations.length > 0 ? preLayout!.root.find(d => d.data.id === nodeId) : prevRoot.find(d => d.data.id === nodeId);
        if (!targetNode) return;

        // Obtenemos el recorrido o ruta desde el nodo raíz hasta el nodo objetivo (Si el nodo objetivo no es la raíz usamos el layout pre-rotación)
        const pathToTargetNode = targetNodeRotations.length > 0 ? preLayout!.root.path(targetNode) : prevRoot.path(targetNode);

        // Obtenemos el nodo con mayor valor del subárbol izq y el recorrido o ruta desde el nuevo nodo raíz hasta este (si aplica)
        let maxLeftNode: HierarchyNode<HierarchyNodeData<number>> | null = null;
        let pathToMaxLeftNode: HierarchyNode<HierarchyNodeData<number>>[] = [];
        if (maxLeftId) {
            // Obtenemos el frame donde el nodo a eliminar es la nueva raíz del árbol
            const targetFrame = targetNodeRotations.length > 0 ? splayFramesLayouts[targetNodeRotations.length].root : targetNode;
            maxLeftNode = targetFrame.find(d => d.data.id === maxLeftId)!;
            pathToMaxLeftNode = targetFrame.path(maxLeftNode);
        }

        // Animación de eliminación splay
        animateSplayDeleteNode(
            svg,
            treeOffset,
            {
                targetNode,
                maxLeftNode,
                removed,
                currentNodes,
                currentLinks: linksData,
                positions: nodePositions,
                pathToTargetNode,
                pathToMaxLeftNode,
                targetNodeRotations,
                maxLeftRotations,
                frames: splayFramesLayouts
            },
            resetQueryValues,
            setIsAnimating
        );
    }, [prevRoot, currentNodes, linksData, query.toDelete, query.splayTrace, splayFramesLayouts, treeOffset, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la búsqueda de un nodo
    useEffect(() => {
        if (!root || !svgRef.current || !query.toSearch || !query.splayTrace) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Obtenemos el layout inicial previo a cualquier rotación (en caso de presentarse)
        const preLayout = query.splayTrace.hierarchies.bst ? splayFramesLayouts[0] : null;

        // Extraemos los datos de búsqueda de la query
        const { nodeId, found } = query.toSearch;

        // Ubicamos al nodo objetivo en el árbol
        const targetNode = preLayout ? preLayout.root.find(d => d.data.id === nodeId) : root.find(d => d.data.id === nodeId);
        if (!targetNode) return;

        // Obtenemos el recorrido o ruta desde el nodo raíz hasta el nodo objetivo (dependiendo si ya se encontraba dentro del árbol o no)
        const pathToTargetNode = preLayout ? preLayout.root.path(targetNode) : root.path(targetNode);

        // Animación de búsqueda splay
        animateSplaySearch(
            svg,
            treeOffset,
            {
                targetNode,
                found,
                positions: nodePositions,
                pathToTargetNode,
                rotations: query.splayTrace.phases.search,
                frames: splayFramesLayouts
            },
            resetQueryValues,
            setIsAnimating
        );
    }, [root, currentNodes, linksData, query.toSearch, query.splayTrace, splayFramesLayouts, treeOffset, resetQueryValues, setIsAnimating]);

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

        // Grupo contenedor principal de los elementos del árbol (nodos y enlaces)
        const treeG = svg.select<SVGGElement>("g.tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido
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
        animateTreeTraversal(
            treeG,
            seqG,
            nodes,
            seqPositions,
            resetQueryValues,
            setIsAnimating,
            {
                recolor: false,
                strokeColor: SVG_SPLAY_TREE_VALUES.TRAVERSAL_HIGHLIGHT_COLOR
            }
        );
    }, [query.toGetInOrder, query.toGetPreOrder, query.toGetPostOrder, query.toGetLevelOrder, seqOffset, treeOffset, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la limpieza de lienzo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!svgRef.current || !query.toClear) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Grupo contenedor principal de los elementos del árbol (nodos y enlaces)
        const treeG = svg.select<SVGGElement>("g.tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido
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