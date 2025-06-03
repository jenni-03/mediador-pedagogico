import { useEffect, useMemo, useRef } from "react";
import { BaseQueryOperations, IndicatorPositioningConfig, LinkData, ListNodeData } from "../../../../../types";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { SVG_LINKED_LIST_VALUES, SVG_STYLE_VALUES } from "../../../../../shared/constants/consts";
import * as d3 from "d3";
import { drawArrowIndicator, drawListLinks, drawListNodes } from "../../../../../shared/utils/draw/drawActionsUtilities";
import { animateInsertAtPosition, animateInsertFirst, animateInsertLast, animateDeleteFirst, animateDeleteLast, animateSearchElement, animateClearList } from "../../../../../shared/utils/draw/LinkedListDrawActions";

export function useLinkedListRender(
    listNodes: ListNodeData[],
    query: BaseQueryOperations<"lista_enlazada">,
    resetQueryValues: () => void
) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Mapa para guardar posiciones {x, y} de los nodos dentro del SVG
    const nodePositions = useRef(new Map<string, { x: number, y: number }>()).current;

    // Estado previo de la lista
    const prevNodes = usePrevious(listNodes);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

    // Memo para calcular los enlaces entre nodos
    const linksData = useMemo<LinkData[]>(() => {
        const links: LinkData[] = [];
        listNodes.forEach(n => {
            if (n.next) {
                links.push({
                    sourceId: n.id,
                    targetId: n.next,
                    type: "next"
                })
            }
        });
        return links;
    }, [listNodes]);

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

        // Transición inicial del indicador de cabeza
        const indicatorPositioningTransform: IndicatorPositioningConfig = {
            calculateTransform: (pos, d) => `translate(${pos.x + d.elementWidth / 2}, ${pos.y})`
        };

        // Creación de indicador para elemento cabeza de la cola
        const headId = listNodes.length > 0 ? listNodes[0].id : null;
        const headPos = headId ? nodePositions.get(headId)! : null;
        const arrowHeadPathData = "M0,0 L-9.5,-10 L-4,-10 L-4,-20 L4,-20 L4,-10 L9.5,-10 Z";

        // Configuración de estilos y de posicionamiento para el indicador de cabeza
        const headStyleConfig = {
            text: "INICIO",
            textColor: SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR,
            arrowColor: SVG_STYLE_VALUES.RECT_STROKE_COLOR,
            fontSize: "14px",
            fontWeight: "bold",
            arrowPathData: arrowHeadPathData,
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
            indicatorPositioningTransform,
            { elementWidth, elementHeight }
        );
    }, [listNodes, linksData, prevNodes]);

    // Efecto para manejar la inserción de un nuevo nodo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!listNodes || !svgRef.current || (!query.toAddFirst && !query.toAddLast && query.toAddAt.length !== 2) || !prevNodes) return;

        // Si la inserción es en la cabeza de la lista
        if (query.toAddFirst) {
            // Id del nuevo nodo cabeza
            const newHeadNode = query.toAddFirst;

            // Obtenemos el Id del nodo que era la cabeza de la lista antes de la inserción
            const prevHeadNode = prevNodes.length > 0 ? prevNodes[0].id : null;

            // Selección del elemento SVG a partir de su referencia
            const svg = d3.select(svgRef.current);

            // Filtramos los enlaces que no pertenecen al nuevo nodo cabeza
            const existingLinksData = linksData.filter(link => link.sourceId !== newHeadNode);

            // Animación de inserción del nodo como nuevo primer elemento de la lista
            animateInsertFirst(
                svg,
                { newHeadNode, prevHeadNode },
                { existingNodesData: prevNodes, existingLinksData },
                nodePositions,
                resetQueryValues,
                setIsAnimating
            );
        } else if (query.toAddLast) {
            // Id del nuevo nodo final
            const newLastNode = query.toAddLast;

            // Obtenemos el nodo final anterior a la inserción
            const prevLastNode = prevNodes.length > 0 ? prevNodes[prevNodes.length - 1].id : null;

            // Selección del elemento SVG a partir de su referencia
            const svg = d3.select(svgRef.current);

            // Animación de inserción del nodo como nuevo último elemento de la lista
            animateInsertLast(
                svg,
                { newLastNode, prevLastNode },
                prevNodes,
                nodePositions,
                resetQueryValues,
                setIsAnimating
            );
        } else {
            const [newNode, insertionPosition] = query.toAddAt;

            if (!newNode || insertionPosition === undefined) return;

            // Selección del elemento SVG a partir de su referencia
            const svg = d3.select(svgRef.current);

            if (insertionPosition === 0) {
                // Obtenemos el nodo que era la cabeza antes de la inserción
                const prevHeadNode = prevNodes.length > 0 ? prevNodes[0].id : null;

                // Filtramos los enlaces que no pertenecen al nuevo nodo cabeza
                const existingLinksData = linksData.filter(link => link.sourceId !== newNode);

                // Animación de inserción del nodo como nuevo primer elemento de la lista
                animateInsertFirst(
                    svg,
                    { newHeadNode: newNode, prevHeadNode },
                    { existingNodesData: prevNodes, existingLinksData },
                    nodePositions,
                    resetQueryValues,
                    setIsAnimating
                );
            } else if (insertionPosition === prevNodes.length) {
                // Obtenemos el nodo final anterior a la inserción
                const prevLastNode = prevNodes.length > 0 ? prevNodes[prevNodes.length - 1].id : null;

                // Animación de inserción del nodo como nuevo último elemento de la lista
                animateInsertLast(
                    svg,
                    { newLastNode: newNode, prevLastNode },
                    prevNodes,
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
                    { existingNodesData: listNodes, existingLinksData },
                    insertionPosition,
                    nodePositions,
                    resetQueryValues,
                    setIsAnimating
                );
            }
        }
    }, [query.toAddFirst, query.toAddLast, query.toAddAt, listNodes, linksData, prevNodes, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la eliminación de un nodo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!listNodes || !svgRef.current || (!query.toDeleteFirst && !query.toDeleteLast && query.toDeleteAt.length !== 2) || !prevNodes) return;

        // Si la eliminación es en la cabeza de la lista
        if (query.toDeleteFirst) {
            // Id del nodo cabeza anterior (nodo eliminado)
            const prevHeadNode = query.toDeleteFirst;

            // Obtenemos el Id del nodo cabeza actual de la lista
            const newHeadNode = listNodes.length > 0 ? listNodes[0].id : null;

            // Selección del elemento SVG a partir de su referencia
            const svg = d3.select(svgRef.current);

            // Animación de eliminación del primer nodo de la lista
            animateDeleteFirst(
                svg,
                { prevHeadNode, newHeadNode },
                { remainingNodesData: listNodes, remainingLinksData: linksData },
                nodePositions,
                resetQueryValues,
                setIsAnimating
            );
        } else if (query.toDeleteLast) {
            // Id del último nodo anterior (nodo eliminado)
            const prevLastNode = query.toDeleteLast;

            // Obtenemos el Id del nuevo último nodo de la lista
            const newLastNode = listNodes.length > 0 ? listNodes[listNodes.length - 1].id : null;

            // Selección del elemento SVG a partir de su referencia
            const svg = d3.select(svgRef.current);

            // Animación de eliminación del primer nodo de la lista
            animateDeleteLast(
                svg,
                { prevLastNode, newLastNode },
                listNodes,
                nodePositions,
                resetQueryValues,
                setIsAnimating
            );
        }
    });

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