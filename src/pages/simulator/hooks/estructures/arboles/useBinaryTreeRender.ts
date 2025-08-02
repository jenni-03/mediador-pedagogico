import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";
import { BaseQueryOperations, HierarchyNodeData, TreeLinkData } from "../../../../../types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { SVG_BINARY_TREE_VALUES } from "../../../../../shared/constants/consts";
import { drawTreeLinks, drawTreeNodes } from "../../../../../shared/utils/draw/drawActionsUtilities";
import { animateDeleteNode, animateInsertNode, animateSearchNode } from "../../../../../shared/utils/draw/BinaryTreeDrawActions";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";

export function useBinaryTreeRender(
    treeData: HierarchyNodeData<number> | null,
    query: BaseQueryOperations<"arbol_binario">,
    resetQueryValues: () => void
) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Mapa para guardar posiciones {x, y} de los nodos dentro del SVG
    const nodePositions = useRef(new Map<string, { x: number, y: number }>()).current;

    // Nodo raíz D3 jerárquico que representa la estructura del árbol
    const root = useMemo(() => {
        return treeData ? d3.hierarchy(treeData) : null;
    }, [treeData]);

    // Estado previo de la raíz
    const prevRoot = usePrevious(root);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

    // Memo para calcular los enlaces entre nodos
    const linksData: TreeLinkData[] = useMemo(() => {
        if (!root) return [];
        return root.links().map(link => ({
            sourceId: link.source.data.id,
            targetId: link.target.data.id
        }))
    }, [root]);

    console.log("Nodo raiz del arbol");
    console.log(root?.descendants());
    console.log("Nodo raíz previo");
    console.log(prevRoot?.descendants())
    console.log("Data de los enlaces del arbol");
    console.log(linksData);
    console.log("Query actual");
    console.log(query);
    console.log("Posiciones de los nodos");
    console.log(nodePositions);

    // Renderizado base del árbol
    useEffect(() => {
        // Verificamos que la raiz no sea nula y que la referencia al SVG se haya establecido
        if (!root || !svgRef.current) return;

        // Margenes para el svg
        const margin = { left: SVG_BINARY_TREE_VALUES.MARGIN_LEFT, right: SVG_BINARY_TREE_VALUES.MARGIN_RIGHT, top: SVG_BINARY_TREE_VALUES.MARGIN_TOP, bottom: SVG_BINARY_TREE_VALUES.MARGIN_BOTTOM };

        // Separación horizontal entre nodos y vertical entre niveles
        const nodeSpacing = SVG_BINARY_TREE_VALUES.NODE_SPACING;
        const levelSpacing = SVG_BINARY_TREE_VALUES.LEVEL_SPACING;

        // Creación del layout del árbol
        const treeLayout = d3.tree<HierarchyNodeData<number>>()
            .nodeSize([nodeSpacing, levelSpacing]);
        treeLayout(root);

        // Valores minimos y máximos del árbol en cada eje
        const currNodes = root.descendants();
        const prevNodes = prevRoot?.descendants() ?? currNodes;
        const [minX, maxX] = d3.extent([...prevNodes, ...currNodes], d => d.x);
        const [minY, maxY] = d3.extent([...prevNodes, ...currNodes], d => d.y);

        // Cálculo del ancho y alto del SVG
        const width = (maxX! - minX!) + margin.left + margin.right;
        const height = (maxY! - minY!) + margin.top + margin.bottom;

        // Configuración del contenedor SVG
        const svg = d3.select(svgRef.current)
            .attr("height", height)
            .attr("width", width);

        // Contenedor interno para los nodos y enlaces del árbol
        let g = svg.select<SVGGElement>("g.tree-container");
        if (g.empty()) {
            g = svg.append("g")
                .classed("tree-container", true);
        }
        g.attr("transform", `translate(${margin.left - minX!},${margin.top - minY!})`);


        // Renderizado de los nodos del árbol
        drawTreeNodes(g, currNodes, nodePositions);

        // Renderizado de los enlaces entre nodos
        drawTreeLinks(g, linksData, nodePositions);
    }, [root, linksData]);

    // Efecto para manejar la inserción de nuevos nodos
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!root || !svgRef.current || (!query.toInsertLeft && !query.toInsertRight)) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Grupo contenedor de nodos y enlaces del árbol
        const g = svg.select<SVGGElement>("g.tree-container");

        // Determinamos el ID del nuevo nodo a insertar
        const nodeToInsert = query.toInsertLeft ? query.toInsertLeft : query.toInsertRight!;

        // Ubicamos al nuevo nodo en el árbol
        const newNode = root.descendants().find(d => d.data.id === nodeToInsert);
        if (!newNode) return;

        // Obtenemos el recorrido o ruta desde el nodo raíz hasta el nodo padre del nuevo nodo
        let parentNode: d3.HierarchyNode<HierarchyNodeData<number>> | null = null;
        let pathToParent: d3.HierarchyNode<HierarchyNodeData<number>>[] = [];
        if (newNode.parent !== null) {
            parentNode = newNode.parent;
            pathToParent = root.path(parentNode);
        }

        // Animación de inserción del nuevo nodo
        animateInsertNode(
            g,
            {
                newNodeId: newNode.data.id,
                parentId: parentNode?.data.id ?? null,
                nodesData: root.descendants(),
                linksData,
                pathToParent
            },
            nodePositions,
            resetQueryValues,
            setIsAnimating
        );
    }, [root, linksData, query.toInsertLeft, query.toInsertRight, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la eliminación de un nodo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!prevRoot || !svgRef.current || !query.toDelete) return;

        // Verificación de la estructura de la query del usuario
        if (query.toDelete.length !== 2) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Grupo contenedor de nodos y enlaces del árbol
        const g = svg.select<SVGGElement>("g.tree-container");

        // Determinamos el ID del nodo a eliminar
        const nodeToDeleteId = query.toDelete[0];

        // Ubicamos al nodo a eliminar en el árbol
        const nodeToDelete = prevRoot.descendants().find(d => d.data.id === nodeToDeleteId);
        if (!nodeToDelete) return;

        // Ubicamos el nodo a actualizar en el arbol (si aplica)
        let nodeToUpdate: d3.HierarchyNode<HierarchyNodeData<number>> | null = null;
        if (query.toDelete[1]) {
            nodeToUpdate = prevRoot.descendants().find(d => d.data.id === query.toDelete[1])!;
        }

        // Animación de inserción del nuevo nodo
        animateDeleteNode(
            g,
            {
                prevRootNode: prevRoot,
                nodeToDelete,
                nodeToUpdate,
                remainingNodesData: root ? root.descendants() : [],
                remainingLinksData: linksData
            },
            nodePositions,
            resetQueryValues,
            setIsAnimating
        );
    }, [root, prevRoot, linksData, query.toDelete, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la búsqueda de un nodo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!root || !svgRef.current || !query.toSearch) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Grupo contenedor de nodos y enlaces del árbol
        const g = svg.select<SVGGElement>("g.tree-container");

        // Ubicamos al nodo a buscar en el árbol
        const nodeToSearch = root.descendants().find(d => d.data.value === query.toSearch);
        if (!nodeToSearch) return;

        // Ruta de búsqueda del nodo
        const pathToNode = root.path(nodeToSearch);

        // Animación de búsqueda del nodo
        animateSearchNode(g, nodeToSearch.data.id, pathToNode, resetQueryValues, setIsAnimating);
    }, [root, query.toSearch, resetQueryValues, setIsAnimating]);

    return { svgRef };
}