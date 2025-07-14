import { useEffect, useMemo, useRef } from "react";
import { BaseQueryOperations, LinkData, ListNodeData } from "../../../../../types";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { LIST_RENDER_CONFIGS, SVG_LINKED_LIST_VALUES, SVG_STYLE_VALUES } from "../../../../../shared/constants/consts";
import * as d3 from "d3";
import { animateClearList, drawArrowIndicator, drawListLinks, drawListNodes } from "../../../../../shared/utils/draw/drawActionsUtilities";
import { animateInsertAtPosition, animateInsertFirst, animateInsertLast, animateRemoveFirst, animateRemoveLast, animateRemoveAtPosition, animateSearchElement } from "../../../../../shared/utils/draw/LinkedListDrawActions";

export function useLinkedListRender(
    listNodes: ListNodeData[],
    query: BaseQueryOperations<"lista_enlazada">,
    resetQueryValues: () => void,
    listType: keyof typeof LIST_RENDER_CONFIGS
) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Mapa para guardar posiciones {x, y} de los nodos dentro del SVG
    const nodePositions = useRef(new Map<string, { x: number, y: number }>()).current;

    // Estado previo de la lista
    const prevNodes = usePrevious(listNodes);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

    // Configuración de animación predefinida para la lista
    const config = LIST_RENDER_CONFIGS[listType];

    // Memo para calcular los enlaces entre nodos
    const linksData = useMemo<LinkData[]>(() => {
        const links: LinkData[] = [];

        listNodes.forEach((n, i, arr) => {
            if (n.next) {
                const isCircularNext =
                    i === arr.length - 1 &&
                    config.showCircularLinks &&
                    n.next === arr[0].id;

                links.push({
                    sourceId: n.id,
                    targetId: n.next,
                    type: isCircularNext ? "circular-next" : "next"
                });
            }
            if (n.prev) {
                const isCircularPrev =
                    i === 0 &&
                    config.showCircularLinks &&
                    n.prev === arr[arr.length - 1].id;

                links.push({
                    sourceId: n.id,
                    targetId: n.prev,
                    type: isCircularPrev ? "circular-prev" : "prev"
                });
            }
        });
        return links;
    }, [listNodes, config.showCircularLinks]);

    console.log("Tipo de lista: ", listType);
    console.log("Configuración");
    console.log(config);
    console.log("Nodos de la lista");
    console.log(listNodes);
    console.log("Data de los enlaces de la lista");
    console.log(linksData);
    console.log("Query actual");
    console.log(query);
    console.log("Nodos previos de la lista");
    console.log(prevNodes);
    console.log("Posiciones de los nodos");
    console.log(nodePositions);

    // Renderizado base de la lista enlazada
    useEffect(() => {
        // Verificamos que el array de nodos no sea nulo y que la referencia al SVG se haya establecido
        if (!listNodes || !svgRef.current) return;

        // Margenes para el svg
        const margin = { left: SVG_LINKED_LIST_VALUES.MARGIN_LEFT, right: SVG_LINKED_LIST_VALUES.MARGIN_RIGHT };

        // Dimensiones para cada nodo
        const elementWidth = SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH;
        const elementHeight = SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT;

        // Espaciado entre nodos
        const spacing = SVG_LINKED_LIST_VALUES.SPACING;
        const nodeSpacing = elementWidth + spacing;

        // Cálculo del ancho del SVG en base al número de nodos presentes
        const displayLength = Math.max(listNodes.length, prevNodes?.length ?? 0);
        console.log("displayLength", displayLength);
        const width = margin.left + displayLength * nodeSpacing - (listNodes.length > 0 ? spacing : 0) + margin.right;
        console.log("width", width);

        // Alto del SVG
        const height = SVG_LINKED_LIST_VALUES.HEIGHT;

        // Configuración del contenedor SVG
        const svg = d3.select(svgRef.current)
            .attr("height", height)
            .attr("width", width);

        // Renderizado de los nodos pertenecientes a la lista
        drawListNodes(
            svg,
            listNodes,
            nodePositions,
            { margin, elementWidth, elementHeight, nodeSpacing, height }
        );

        // Renderizado de los enlaces entre nodos
        drawListLinks(
            svg,
            linksData,
            nodePositions,
            elementWidth,
            elementHeight
        );

        // Creación de indicador para elemento cabeza
        if (config.showHeadIndicator) {
            const headId = listNodes.length > 0 ? listNodes[0].id : null;
            const headPos = headId ? nodePositions.get(headId)! : null;

            // Configuración de estilos y de posicionamiento para el indicador del elemento cabeza
            const headStyleConfig = {
                text: "CABEZA",
                textColor: SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR,
                arrowColor: SVG_STYLE_VALUES.RECT_STROKE_COLOR,
                fontSize: "14px",
                fontWeight: "bold",
                arrowPathData: "M0,0 L-9.5,-10 L-4,-10 L-4,-20 L4,-20 L4,-10 L9.5,-10 Z",
                textRelativeY: -30,
                arrowTransform: `translate(0, -5)`
            }

            // Renderizado del indicador de cabeza
            drawArrowIndicator(
                svg,
                "head-indicator",
                "head-indicator-group",
                headPos,
                headStyleConfig,
                { calculateTransform: (pos, d) => `translate(${pos.x + d.elementWidth / 2}, ${pos.y})` },
                { elementWidth, elementHeight }
            );
        }

        // Creación de indicador para elemento cabeza
        if (config.showTailIndicator) {
            const tailId = listNodes.length > 0 ? listNodes[listNodes.length - 1].id : null;
            const tailPos = tailId ? nodePositions.get(tailId)! : null;

            // Configuración de estilos y de posicionamiento para el indicador del elemento cola
            const tailStyleConfig = {
                text: "COLA",
                textColor: SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR,
                arrowColor: SVG_STYLE_VALUES.RECT_STROKE_COLOR,
                fontSize: "14px",
                fontWeight: "bold",
                arrowPathData: "M0,0 L-9.5,10 L-4,10 L-4,20 L4,20 L4,10 L9.5,10 Z",
                textRelativeY: elementHeight + 70,
                arrowTransform: `translate(0, ${elementHeight + 35})`
            }

            // Renderizado del indicador de cola
            drawArrowIndicator(
                svg,
                "tail-indicator",
                "tail-indicator-group",
                tailPos,
                tailStyleConfig,
                { calculateTransform: (pos, d) => `translate(${pos.x + d.elementWidth / 2}, ${pos.y})` },
                { elementWidth, elementHeight }
            );
        }
    }, [listNodes, linksData, prevNodes, config]);

    // Efecto para manejar la inserción de un nuevo nodo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!listNodes || !svgRef.current || (!query.toAddFirst && !query.toAddLast && query.toAddAt.length !== 2) || !prevNodes) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Si la inserción es en la cabeza de la lista
        if (query.toAddFirst) {
            // Id del nuevo nodo cabeza
            const newHeadNode = query.toAddFirst;

            // Obtenemos el Id del nodo que era la cabeza de la lista antes de la inserción
            const prevHeadNode = listNodes.length > 1 ? listNodes[1].id : null;

            // Obtenemos el Id del último nodo de la lista (solo para uso de listas circulares) 
            const lastNode = listNodes[listNodes.length - 1].id;

            // Filtramos los enlaces que requieren posicionamiento producto de la inserción 
            const existingLinksData = linksData.filter(link => link.sourceId !== newHeadNode && link.targetId !== newHeadNode);

            if (config.showCircularLinks) {
                existingLinksData.push({ sourceId: lastNode, targetId: prevHeadNode ?? newHeadNode, type: "circular-next" });
                if (config.showDoubleLinks) existingLinksData.push({ sourceId: prevHeadNode ?? newHeadNode, targetId: lastNode, type: "circular-prev" });
            }

            // Animación de inserción del nodo como nuevo primer elemento de la lista
            animateInsertFirst(
                svg,
                { newHeadNode, prevHeadNode, lastNode },
                {
                    existingNodesData: prevNodes,
                    existingLinksData,
                    showDoubleLinks: config.showDoubleLinks,
                    showTailIndicator: config.showTailIndicator,
                    showNextCircularLink: config.showNextCircularLink ?? false,
                    showPrevCircularLink: config.showPrevCircularLink ?? false
                },
                nodePositions,
                resetQueryValues,
                setIsAnimating
            );
        } else if (query.toAddLast) {
            // Id del nuevo nodo final
            const newLastNode = query.toAddLast;

            // Obtenemos el nodo final anterior a la inserción
            const prevLastNode = prevNodes.length > 0 ? prevNodes[prevNodes.length - 1].id : null;

            // Obtenemos el Id del nodo cabeza de la lista (solo para uso de listas circulares) 
            const headNode = listNodes[0].id;

            // Animación de inserción del nodo como nuevo último elemento de la lista
            animateInsertLast(
                svg,
                { newLastNode, prevLastNode, headNode },
                {
                    existingNodesData: prevNodes,
                    showDoubleLinks: config.showDoubleLinks,
                    showTailIndicator: config.showTailIndicator,
                    showNextCircularLink: config.showNextCircularLink ?? false,
                    showPrevCircularLink: config.showPrevCircularLink ?? false
                },
                nodePositions,
                resetQueryValues,
                setIsAnimating
            );
        } else {
            const [newNode, insertionPosition] = query.toAddAt;

            if (!newNode || insertionPosition === undefined) return;

            if (insertionPosition === 0) {
                // Obtenemos el nodo que era la cabeza antes de la inserción
                const prevHeadNode = prevNodes.length > 0 ? prevNodes[0].id : null;

                // Obtenemos el Id del último nodo de la lista (solo para uso de listas circulares) 
                const lastNode = listNodes[listNodes.length - 1].id;

                // Filtramos los enlaces que no pertenecen al nuevo nodo cabeza
                const existingLinksData = linksData.filter(link => link.sourceId !== newNode);

                if (config.showCircularLinks) {
                    existingLinksData.push({ sourceId: lastNode, targetId: prevHeadNode ?? newNode, type: "circular-next" });
                    if (config.showDoubleLinks) existingLinksData.push({ sourceId: prevHeadNode ?? newNode, targetId: lastNode, type: "circular-prev" });
                }

                // Animación de inserción del nodo como nuevo primer elemento de la lista
                animateInsertFirst(
                    svg,
                    { newHeadNode: newNode, prevHeadNode, lastNode },
                    {
                        existingNodesData: prevNodes,
                        existingLinksData,
                        showDoubleLinks: config.showDoubleLinks,
                        showTailIndicator: config.showTailIndicator,
                        showNextCircularLink: config.showNextCircularLink ?? false,
                        showPrevCircularLink: config.showPrevCircularLink ?? false
                    },
                    nodePositions,
                    resetQueryValues,
                    setIsAnimating
                );
            } else if (insertionPosition === prevNodes.length) {
                // Obtenemos el nodo final anterior a la inserción
                const prevLastNode = prevNodes.length > 0 ? prevNodes[prevNodes.length - 1].id : null;

                // Obtenemos el Id del nodo cabeza de la lista (solo para uso de listas circulares) 
                const headNode = listNodes[0].id;

                // Animación de inserción del nodo como nuevo último elemento de la lista
                animateInsertLast(
                    svg,
                    { newLastNode: newNode, prevLastNode, headNode },
                    {
                        existingNodesData: prevNodes,
                        showDoubleLinks: config.showDoubleLinks,
                        showTailIndicator: config.showTailIndicator,
                        showNextCircularLink: config.showNextCircularLink ?? false,
                        showPrevCircularLink: config.showPrevCircularLink ?? false
                    },
                    nodePositions,
                    resetQueryValues,
                    setIsAnimating
                );
            } else {
                // Obtenemos el nodo anterior al nodo insertado
                const prevNode = listNodes[insertionPosition - 1].id;

                // Obtenemos el nodo siguiente al nodo insertado
                const nextNode = listNodes[insertionPosition + 1].id;

                // Filtramos los enlaces que no pertenecen al nuevo nodo
                const existingLinksData = linksData.filter(link => link.sourceId !== newNode || link.targetId !== newNode);

                // Animación de inserción del nodo en una posición especifica
                animateInsertAtPosition(
                    svg,
                    { newNode, prevNode, nextNode },
                    {
                        existingNodesData: listNodes,
                        existingLinksData,
                        showDoubleLinks: config.showDoubleLinks,
                        showTailIndicator: config.showTailIndicator
                    },
                    insertionPosition,
                    nodePositions,
                    resetQueryValues,
                    setIsAnimating
                );
            }
        }
    }, [query.toAddFirst, query.toAddLast, query.toAddAt, listNodes, linksData, prevNodes, config, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la eliminación de un nodo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!listNodes || !svgRef.current || (!query.toDeleteFirst && !query.toDeleteLast && query.toDeleteAt.length !== 2) || !prevNodes) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Si la eliminación es en la cabeza de la lista
        if (query.toDeleteFirst) {
            // Id del nodo cabeza anterior (nodo eliminado)
            const prevHeadNode = query.toDeleteFirst;

            // Obtenemos el Id del nodo cabeza actual de la lista
            const newHeadNode = listNodes.length > 0 ? listNodes[0].id : null;

            // Obtenemos el Id del último nodo de la lista (solo para uso de listas circulares) 
            const lastNode = listNodes.length > 0 ? listNodes[listNodes.length - 1].id : null;

            // Animación de eliminación del primer nodo de la lista
            animateRemoveFirst(
                svg,
                { prevHeadNode, newHeadNode, lastNode },
                {
                    remainingNodesData: listNodes,
                    remainingLinksData: linksData,
                    showDoubleLinks: config.showDoubleLinks,
                    showTailIndicator: config.showTailIndicator,
                    showNextCircularLink: config.showNextCircularLink ?? false,
                    showPrevCircularLink: config.showPrevCircularLink ?? false
                },
                nodePositions,
                resetQueryValues,
                setIsAnimating
            );
        } else if (query.toDeleteLast) {
            // Id del último nodo anterior (nodo eliminado)
            const prevLastNode = query.toDeleteLast;

            // Obtenemos el Id del nuevo último nodo de la lista
            const newLastNode = listNodes.length > 0 ? listNodes[listNodes.length - 1].id : null;

            // Obtenemos el Id del nodo cabeza actual de la lista (solo para uso de listas circulares)
            const headNode = listNodes.length > 0 ? listNodes[0].id : null;

            // Animación de eliminación del último nodo de la lista
            animateRemoveLast(
                svg,
                { prevLastNode, newLastNode, headNode },
                {
                    remainingNodesData: listNodes,
                    showDoubleLinks: config.showDoubleLinks,
                    showTailIndicator: config.showTailIndicator,
                    showNextCircularLink: config.showNextCircularLink ?? false,
                    showPrevCircularLink: config.showPrevCircularLink ?? false
                },
                nodePositions,
                resetQueryValues,
                setIsAnimating
            );
        } else {
            const [nodeToRemove, deletePosition] = query.toDeleteAt;

            if (!nodeToRemove || deletePosition === undefined) return;

            if (deletePosition === 0) {
                // Obtenemos el Id del nodo cabeza actual de la lista
                const newHeadNode = listNodes.length > 0 ? listNodes[0].id : null;

                // Obtenemos el Id del último nodo de la lista (solo para uso de listas circulares) 
                const lastNode = listNodes.length > 0 ? listNodes[listNodes.length - 1].id : null;

                // Animación de eliminación de primer nodo de la lista
                animateRemoveFirst(
                    svg,
                    { prevHeadNode: nodeToRemove, newHeadNode, lastNode },
                    {
                        remainingNodesData: listNodes,
                        remainingLinksData: linksData,
                        showDoubleLinks: config.showDoubleLinks,
                        showTailIndicator: config.showTailIndicator,
                        showNextCircularLink: config.showNextCircularLink ?? false,
                        showPrevCircularLink: config.showPrevCircularLink ?? false
                    },
                    nodePositions,
                    resetQueryValues,
                    setIsAnimating
                );
            } else if (deletePosition === prevNodes.length - 1) {
                // Obtenemos el Id del nuevo último nodo de la lista
                const newLastNode = listNodes.length > 0 ? listNodes[listNodes.length - 1].id : null;

                // Obtenemos el Id del nodo cabeza actual de la lista (solo para uso de listas circulares)
                const headNode = listNodes.length > 0 ? listNodes[0].id : null;

                // Animación de eliminación del último nodo de la lista
                animateRemoveLast(
                    svg,
                    { prevLastNode: nodeToRemove, newLastNode, headNode },
                    {
                        remainingNodesData: listNodes,
                        showDoubleLinks: config.showDoubleLinks,
                        showTailIndicator: config.showTailIndicator,
                        showNextCircularLink: config.showNextCircularLink ?? false,
                        showPrevCircularLink: config.showPrevCircularLink ?? false
                    },
                    nodePositions,
                    resetQueryValues,
                    setIsAnimating
                );
            } else {
                // Obtenemos el nodo anterior al nodo a eliminar
                const prevNode = prevNodes[deletePosition - 1].id;

                // Obtenemos el nodo siguiente al nodo a eliminar
                const nextNode = prevNodes[deletePosition + 1].id;

                // Animación de eliminación del nodo en una posición especifica
                animateRemoveAtPosition(
                    svg,
                    { nodeToRemove, prevNode, nextNode },
                    {
                        existingNodesData: prevNodes,
                        existingLinksData: linksData,
                        showDoubleLinks: config.showDoubleLinks,
                        showTailIndicator: config.showTailIndicator
                    },
                    deletePosition,
                    nodePositions,
                    resetQueryValues,
                    setIsAnimating
                );
            }
        }
    }, [query.toDeleteFirst, query.toDeleteLast, query.toDeleteAt, listNodes, linksData, prevNodes, config, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la búsqueda de un nodo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!listNodes || !svgRef.current || !query.toSearch || !prevNodes) return;

        // Obtenemos el elemento de la lista a buscar
        const elementToSearch = query.toSearch;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Animación de búsqueda del elemento especificado
        animateSearchElement(
            svg,
            elementToSearch,
            listNodes,
            resetQueryValues,
            setIsAnimating
        );

    }, [listNodes, prevNodes, query.toSearch, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la limpieza de lienzo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!listNodes || !svgRef.current || !query.toClear) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Animación de limpieza de la lista
        animateClearList(svg, nodePositions, resetQueryValues, setIsAnimating);
    }, [query.toClear, listNodes, resetQueryValues, setIsAnimating]);

    return { svgRef };
}