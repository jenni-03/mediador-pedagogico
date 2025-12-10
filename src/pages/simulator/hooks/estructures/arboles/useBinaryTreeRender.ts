import { useEffect, useMemo, useRef } from "react";
import { BaseQueryOperations, BinaryTreeTraversalStep, HierarchyNodeData, TraversalNodeType } from "../../../../../types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { SVG_BINARY_TREE_VALUES, SVG_STYLE_VALUES } from "../../../../../shared/constants/consts";
import { animateClearTree, drawTraversalSequence, drawTreeLinks, drawTreeNodes } from "../../../../../shared/utils/draw/drawActionsUtilities";
import { animateDeleteBinaryNode, animateInsertBinaryNode, animateLevelOrderTraversal, animateRecursiveTraversal, animateSearchBinaryNode } from "../../../../../shared/utils/draw/BinaryTreeDrawActions";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { computeSvgTreeMetrics, hierarchyFrom } from "../../../../../shared/utils/treeUtils";
import { select } from "d3";
import { useBus } from "../../../../../shared/hooks/useBus";
import { getArbolBinarioCode } from "../../../../../shared/constants/pseudocode/arbolBinarioCode";

export function useBinaryTreeRender(
    treeData: HierarchyNodeData<number> | null,
    query: BaseQueryOperations<"arbol_binario">,
    resetQueryValues: () => void
) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Mapas de posiciones actuales (nodos) y de la secuencia (recorridos)
    const nodePositions = useRef(new Map<string, { x: number, y: number }>()).current;
    const seqPositions = useRef(new Map<string, { x: number, y: number }>()).current;

    // offsets para contenedores de árbol y secuencia
    const treeOffset = useRef({ x: 0, y: 0 }).current;
    const seqOffset = useRef({ x: 0, y: 0 }).current;

    // Construcción de la jerarquía e inicialización del layout del árbol
    const { root, nodes: currentNodes, links: linksData } = useMemo(() => {
        if (!treeData) return { root: null, nodes: [], links: [] }
        return hierarchyFrom(
            treeData,
            SVG_BINARY_TREE_VALUES.NODE_SPACING,
            SVG_BINARY_TREE_VALUES.LEVEL_SPACING
        );
    }, [treeData]);

    // Estado previo de la raíz
    const prevRoot = usePrevious(root);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

    // Bus para la emisión de eventos de código
    const bus = useBus();

    // Renderizado base del árbol
    useEffect(() => {
        if (!root || !svgRef.current) return;

        // Margenes para el svg
        const margin = {
            left: SVG_BINARY_TREE_VALUES.MARGIN_LEFT,
            right: SVG_BINARY_TREE_VALUES.MARGIN_RIGHT,
            top: SVG_BINARY_TREE_VALUES.MARGIN_TOP,
            bottom: SVG_BINARY_TREE_VALUES.MARGIN_BOTTOM
        };

        // Cálculo de las dimensiones del lienzo y sus contenedores
        const metrics = computeSvgTreeMetrics(
            currentNodes,
            prevRoot?.descendants() ?? currentNodes,
            margin,
            currentNodes.length,
            SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING,
            SVG_BINARY_TREE_VALUES.SEQUENCE_HEIGHT,
            SVG_BINARY_TREE_VALUES.EXTRA_WIDTH,
            SVG_BINARY_TREE_VALUES.EXTRA_HEIGHT,
        );

        // Configuración del contenedor SVG
        const svg = select(svgRef.current)
            .attr("height", metrics.height)
            .attr("width", metrics.width);

        // Desplazamiento para el contenedor de los nodos (evita que partes queden fuera si las coordenadas son negativas)
        treeOffset.x = metrics.treeOffset.x;
        treeOffset.y = metrics.treeOffset.y;

        // Contenedor interno para nodos y enlaces del árbol
        let treeG = svg.select<SVGGElement>("#tree-container");
        if (treeG.empty()) treeG = svg.append("g").attr("id", "tree-container");
        treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

        // Desplazamiento para el contenedor de la secuencia de recorrido de nodos
        seqOffset.x = metrics.seqOffset.x;
        seqOffset.y = metrics.seqOffset.y;

        // Contenedor interno para la secuencia de recorrido de los nodos
        let seqG = svg.select<SVGGElement>("#seq-container");
        if (seqG.empty()) seqG = svg.append("g").attr("id", "seq-container");
        seqG.attr("transform", `translate(${seqOffset.x}, ${seqOffset.y})`);

        // Capas internas para nodos y enlaces
        let nodesLayer = treeG.select<SVGGElement>("#nodes-layer");
        if (nodesLayer.empty()) nodesLayer = treeG.append("g").attr("id", "nodes-layer");

        let linksLayer = treeG.select<SVGGElement>("#links-layer");
        if (linksLayer.empty()) linksLayer = treeG.append("g").attr("id", "links-layer");

        // Renderizado de los nodos del árbol
        drawTreeNodes(nodesLayer, currentNodes, nodePositions);

        // Renderizado de los enlaces entre nodos
        drawTreeLinks(linksLayer, linksData, nodePositions);

        // Elevamos la capa de nodos
        nodesLayer.raise();
    }, [root, currentNodes, prevRoot, linksData]);

    // Efecto para manejar la inserción de un nuevo nodo
    useEffect(() => {
        if (!root || !svgRef.current || (!query.toInsertLeft && !query.toInsertRight)) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Obtenemos los datos de inserción de la query
        const { steps, parentNodeId, targetNodeId, inserted } = query.toInsertLeft ? query.toInsertLeft : query.toInsertRight!;

        // Animación de inserción del nuevo nodo
        animateInsertBinaryNode(
            svg,
            treeOffset,
            {
                newNodeId: targetNodeId,
                parentNodeId,
                inserted,
                side: query.toInsertLeft ? "izquierdo" : "derecho",
                searchSteps: steps,
                nodesData: currentNodes,
                linksData,
                positions: nodePositions,
                highlightColor: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR
            },
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toInsertLeft, query.toInsertRight, root, currentNodes, linksData, bus, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la eliminación de un nodo
    useEffect(() => {
        if (!svgRef.current || !query.toDelete) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Obtenemos los datos de eliminación de la query
        const deletionData = query.toDelete;

        // Animación de eliminación de un nodo especifico
        animateDeleteBinaryNode(
            svg,
            treeOffset,
            {
                targetNodeId: deletionData.targetNodeId,
                parentNodeId: deletionData.parentNodeId,
                successorNodeId: deletionData.successorNodeId,
                successorParentNodeId: deletionData.successorParentNodeId,
                replacementNodeId: deletionData.replacementNodeId,
                deleted: deletionData.deleted,
                targetSide: deletionData.targetSide,
                searchSteps: deletionData.steps,
                pathToSuccessor: deletionData.pathToSuccessorIds,
                remainingNodesData: currentNodes,
                remainingLinksData: linksData,
                positions: nodePositions,
                highlightTargetColor: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR,
                highlightSuccessorColor: SVG_BINARY_TREE_VALUES.UPDATE_STROKE_COLOR
            },
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toDelete, currentNodes, linksData, bus, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la búsqueda de un nodo
    useEffect(() => {
        if (!root || !svgRef.current || !query.toSearch) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Obtenemos los datos de búsqueda de la query
        const { targetNodeId, found, steps } = query.toSearch;

        // Animación de búsqueda del nodo
        animateSearchBinaryNode(
            svg,
            treeOffset,
            {
                targetNodeId,
                found,
                searchSteps: steps,
                positions: nodePositions,
                highlightColor: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR
            },
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toSearch, root, currentNodes, bus, resetQueryValues, setIsAnimating]);

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
                    highlightColor: "#8aa0ff",
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
                    strokeColor: "#8aa0ff",
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
        const arbolBinarioCode = getArbolBinarioCode();
        const labels = arbolBinarioCode.clean.labels!;

        // Animación de limpieza del árbol
        animateClearTree(
            svg,
            { nodePositions, seqPositions },
            bus,
            { CLEAR_ROOT: labels.CLEAR_ROOT },
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toClear, bus, resetQueryValues, setIsAnimating]);

    return { svgRef };
}