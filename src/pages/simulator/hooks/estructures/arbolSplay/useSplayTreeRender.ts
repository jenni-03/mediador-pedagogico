import { useEffect, useMemo, useRef } from "react";
import { BaseQueryOperations, BinaryTreeTraversalStep, HierarchyNodeData, TraversalNodeType } from "../../../../../domain/utils/types";
import { HierarchyNode, select } from "d3";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { computeSvgTreeMetrics, hierarchyFrom } from "../../../../../domain/utils/treeUtils";
import { SVG_BINARY_TREE_VALUES, SVG_SPLAY_TREE_VALUES, SVG_STYLE_VALUES } from "../../../../../domain/constants/consts";
import { animateSplayDeleteNode, animateInsertSplayNode, animateSearchSplayNode } from "../../../../../shared/utils/draw/SplayTreeDrawActions";
import { animateClearTree, drawTraversalSequence } from "../../../../../shared/utils/draw/drawActionsUtilities";
import { useBus } from "../../../../../shared/hooks/useBus";
import { getArbolSplayCode } from "../../../../../domain/constants/pseudocode/arbolSplayCode";
import { animateLevelOrderTraversal, animateRecursiveTraversal } from "../../../../../shared/utils/draw/BinaryTreeDrawActions";

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

    // Construcción de la jerarquía e inicialización del layout del árbol
    const { root, nodes: currentNodes, links: linksData } = useMemo(() => {
        if (!treeData) return { root: null, nodes: [], links: [] }
        return hierarchyFrom(
            treeData,
            SVG_SPLAY_TREE_VALUES.NODE_SPACING,
            SVG_SPLAY_TREE_VALUES.LEVEL_SPACING
        );
    }, [treeData]);

    // Estado previo de la raíz
    const prevRoot = usePrevious(root);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

    // Bus para la emisión de eventos de código
    const bus = useBus();

    // Layouts para las rotaciones del árbol
    const splayFramesLayouts = useMemo(() => {
        const frames = query.splayTrace?.hierarchies.bst
            ? [query.splayTrace.hierarchies.bst, ...query.splayTrace.hierarchies.mids]
            : [];
        return frames.map(frame => hierarchyFrom(frame, SVG_SPLAY_TREE_VALUES.NODE_SPACING, SVG_SPLAY_TREE_VALUES.LEVEL_SPACING));
    }, [query.splayTrace?.hierarchies.bst, query.splayTrace?.hierarchies.mids]);

    // Renderizado base del árbol
    useEffect(() => {
        if (!root || !svgRef.current) return;

        // Margenes para el svg
        const margin = {
            left: SVG_BINARY_TREE_VALUES.MARGIN_LEFT,
            right: SVG_BINARY_TREE_VALUES.MARGIN_RIGHT,
            top: SVG_BINARY_TREE_VALUES.MARGIN_TOP,
            bottom: SVG_BINARY_TREE_VALUES.MARGIN_BOTTOM,
        };

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
            SVG_SPLAY_TREE_VALUES.EXTRA_WIDTH,
            SVG_SPLAY_TREE_VALUES.EXTRA_HEIGHT
        );

        // Configuración del contenedor SVG
        const svg = select(svgRef.current)
            .attr("height", metrics.height)
            .attr("width", metrics.width);

        // Desplazamiento para el contenedor de los nodos (evita que partes queden fuera si las coordenadas son negativas)
        treeOffset.x = metrics.treeOffset.x;
        treeOffset.y = metrics.treeOffset.y;

        // Contenedor para los nodos y enlaces del árbol
        let treeG = svg.select<SVGGElement>("g#tree-container");
        if (treeG.empty()) treeG = svg.append("g").attr("id", "tree-container");
        treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

        // Desplazamiento para el contenedor de la secuencia de valores de recorrido
        seqOffset.x = metrics.seqOffset.x;
        seqOffset.y = metrics.seqOffset.y;

        // Contenedor de la secuencia de recorrido de nodos
        let seqG = svg.select<SVGGElement>("g#seq-container");
        if (seqG.empty()) seqG = svg.append("g").attr("id", "seq-container");
        seqG.attr("transform", `translate(${seqOffset.x}, ${seqOffset.y})`);

        // Capas internas para nodos y enlaces
        let nodesLayer = treeG.select<SVGGElement>("g#nodes-layer");
        if (nodesLayer.empty()) nodesLayer = treeG.append("g").attr("id", "nodes-layer");

        let linksLayer = treeG.select<SVGGElement>("g#links-layer");
        if (linksLayer.empty()) linksLayer = treeG.append("g").attr("id", "links-layer");

        // Elevamos la capa de nodos
        nodesLayer.raise();
    }, [root, currentNodes, prevRoot, linksData, splayFramesLayouts]);

    // Efecto para manejar la inserción de un nuevo nodo
    useEffect(() => {
        if (!root || !svgRef.current || !query.toInsert) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Extraemos los datos de inserción de la query
        const { parentNodeId, targetNodeId, inserted, steps } = query.toInsert;

        // Layout inicial previo a cualquier rotación (en caso de presentarse)
        const preLayout = query.splayTrace && query.splayTrace.hierarchies.bst ? splayFramesLayouts[0] : null;

        // Animación de inserción del nuevo nodo con rotaciones
        animateInsertSplayNode(
            svg,
            treeOffset,
            {
                targetNodeId,
                parentNodeId,
                inserted,
                insertSteps: steps,
                nodesData: preLayout ? preLayout.nodes : currentNodes,
                linksData: preLayout ? preLayout.links : linksData,
                positions: nodePositions,
                rotations: query.splayTrace?.rotations ?? [],
                frames: splayFramesLayouts,
                highlightColor: SVG_SPLAY_TREE_VALUES.HIGHLIGHT_COLOR
            },
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toInsert, query.splayTrace, root, currentNodes, linksData, splayFramesLayouts, bus, resetQueryValues, setIsAnimating]);

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
        if (!root || !svgRef.current || !query.toSearch) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Extraemos los datos de búsqueda de la query
        const { steps, targetNodeId, found } = query.toSearch;

        // Animación de búsqueda del nodo
        animateSearchSplayNode(
            svg,
            treeOffset,
            {
                targetNodeId,
                searchSteps: steps,
                found,
                positions: nodePositions,
                rotations: query.splayTrace?.rotations ?? [],
                frames: splayFramesLayouts,
                highlightColor: SVG_SPLAY_TREE_VALUES.HIGHLIGHT_COLOR
            },
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toSearch, query.splayTrace, root, splayFramesLayouts, bus, resetQueryValues, setIsAnimating]);

    // Efecto para manejar los recorridos del árbol
    useEffect(() => {
        if (!svgRef.current) return;

        // Determinar el tipo de recorrido a animar
        const traversalType =
            query.toGetPreOrder ? "getPreOrder" :
                query.toGetInOrder ? "getInOrder" :
                    query.toGetPostOrder ? "getPostOrder" :
                        query.toGetLevelOrder ? "getLevelOrder" :
                            null;

        if (!traversalType) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Grupo contenedor de los valores de la secuencia de recorrido
        const seqG = svg.select<SVGGElement>("g#seq-container");

        let steps: BinaryTreeTraversalStep[] = [];
        let nodes: TraversalNodeType[] = [];
        if (traversalType === "getPreOrder") {
            nodes = query.toGetPreOrder!.nodes;
            steps = query.toGetPreOrder!.steps;
        }
        else if (traversalType === "getInOrder") {
            nodes = query.toGetInOrder!.nodes;
            steps = query.toGetInOrder!.steps;
        }
        else if (traversalType === "getPostOrder") {
            nodes = query.toGetPostOrder!.nodes;
            steps = query.toGetPostOrder!.steps;
        } else {
            nodes = query.toGetLevelOrder!.nodes;
        }

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
        if (traversalType === "getLevelOrder") {
            const { steps } = query.toGetLevelOrder!;

            animateLevelOrderTraversal(
                svg,
                {
                    traversalSteps: steps,
                    seqPositions,
                    strokeColor: SVG_SPLAY_TREE_VALUES.TRAVERSAL_HIGHLIGHT_COLOR,
                    strokeWidth: 3,
                    baseStroke: SVG_STYLE_VALUES.RECT_STROKE_COLOR,
                    baseStrokeWidth: SVG_STYLE_VALUES.RECT_STROKE_WIDTH
                },
                bus,
                resetQueryValues,
                setIsAnimating
            );
        } else {
            animateRecursiveTraversal(
                svg,
                {
                    traversalSteps: steps,
                    seqPositions,
                    strokeColor: SVG_SPLAY_TREE_VALUES.TRAVERSAL_HIGHLIGHT_COLOR,
                    strokeWidth: 3,
                    baseStroke: SVG_STYLE_VALUES.RECT_STROKE_COLOR,
                    baseStrokeWidth: SVG_STYLE_VALUES.RECT_STROKE_WIDTH
                },
                traversalType,
                bus,
                resetQueryValues,
                setIsAnimating
            );
        }
    }, [query.toGetInOrder, query.toGetPreOrder, query.toGetPostOrder, query.toGetLevelOrder, bus, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la limpieza de lienzo
    useEffect(() => {
        if (!svgRef.current || !query.toClear) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Código y labels de la operación
        const arbolSplayCode = getArbolSplayCode();
        const labels = arbolSplayCode.clean.labels;

        // Animación de limpieza del árbol
        animateClearTree(
            svg,
            { nodePositions, seqPositions },
            bus,
            { CLEAR_ROOT: labels.CLEAR_ROOT },
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toClear, resetQueryValues, setIsAnimating]);

    return { svgRef };
}