import { useEffect, useMemo, useRef } from "react";
import { BaseQueryOperations, ListLinkData, ListNodeData } from "../../../../../types";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { useBus } from "../../../../../shared/hooks/useBus";
import { SVG_LINKED_LIST_VALUES, SVG_STYLE_VALUES } from "../../../../../shared/constants/consts";
import { select } from "d3";
import { animateClearList, drawArrowIndicator, drawListLinks, drawListNodes } from "../../../../../shared/utils/draw/drawActionsUtilities";
import { animateSearchElement, animateSimpleDeleteAt, animateSimpleDeleteFirst, animateSimpleDeleteLast, animateSimpleInsertAt, animateSimpleInsertFirst, animateSimpleInsertLast } from "../../../../../shared/utils/draw/simpleLinkedListDrawActions";
import { getListaSimplementeEnlazadaCode } from "../../../../../shared/constants/pseudocode/listaSimplementeEnlazadaCode";

export function useSimpleLinkedListRender(
    listNodes: ListNodeData<number>[],
    query: BaseQueryOperations<"lista_enlazada">,
    resetQueryValues: () => void
) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Mapa de posiciones actuales de los nodos dentro del SVG
    const nodePositions = useRef(new Map<string, { x: number, y: number }>()).current;

    // Estado previo de la lista
    const prevNodes = usePrevious(listNodes);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

    // Bus para la emisión de eventos de código
    const bus = useBus();

    // Cálculo de enlaces entre nodos
    const linksData = useMemo<ListLinkData[]>(() => {
        const links: ListLinkData[] = [];

        listNodes.forEach((n) => {
            if (n.next) {
                links.push({
                    sourceId: n.id,
                    targetId: n.next,
                    type: "next"
                });
            }
        });
        return links;
    }, [listNodes]);

    // Renderizado base de la lista
    useEffect(() => {
        if (!listNodes || !svgRef.current) return;

        // Espaciado entre nodos
        const nodeSpacing = SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH + SVG_LINKED_LIST_VALUES.SPACING;

        // Cálculo del ancho del SVG en base al número de nodos presentes
        const displayLength = Math.max(listNodes.length, prevNodes?.length ?? 0);
        const width = SVG_LINKED_LIST_VALUES.MARGIN_LEFT + displayLength * nodeSpacing - (listNodes.length > 0 ? SVG_LINKED_LIST_VALUES.SPACING : 0) + SVG_LINKED_LIST_VALUES.MARGIN_RIGHT;

        // Configuración del contenedor SVG
        const svg = select(svgRef.current)
            .attr("height", SVG_LINKED_LIST_VALUES.HEIGHT)
            .attr("width", width);

        // Capas internas para nodos y enlaces
        let nodesLayer = svg.select<SVGGElement>("#nodes-layer");
        if (nodesLayer.empty()) nodesLayer = svg.append("g").attr("id", "nodes-layer");

        let linksLayer = svg.select<SVGGElement>("#links-layer");
        if (linksLayer.empty()) linksLayer = svg.append("g").attr("id", "links-layer");

        // Renderizado de los nodos de la lista
        drawListNodes(
            nodesLayer,
            listNodes,
            nodePositions,
            {
                margin: { left: SVG_LINKED_LIST_VALUES.MARGIN_LEFT, right: SVG_LINKED_LIST_VALUES.MARGIN_RIGHT },
                elementWidth: SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
                elementHeight: SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT,
                nodeSpacing,
                height: SVG_LINKED_LIST_VALUES.HEIGHT
            }
        );

        // Renderizado de los enlaces entre nodos
        drawListLinks(
            linksLayer,
            linksData,
            nodePositions,
            SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
            SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
        );

        // Elevamos la capa de nodos
        nodesLayer.raise();

        // Creación de indicador para elemento cabeza
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
            { elementWidth: SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, elementHeight: SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT }
        );
    }, [listNodes, linksData, prevNodes?.length]);

    // Efecto para manejar la inserción de un nuevo nodo al inicio
    useEffect(() => {
        if (!listNodes || !svgRef.current || !query.toAddFirst) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Id del nuevo nodo cabeza
        const newHeadNodeId = query.toAddFirst;

        // Id del nodo cabeza actual de la lista (anterior a la inserción)
        const currHeadNodeId = listNodes.length > 1 ? listNodes[1].id : null;

        // Animación de inserción del nodo como primer elemento de la lista
        animateSimpleInsertFirst(
            svg,
            {
                newHeadNodeId,
                currHeadNodeId,
                nodesData: listNodes,
                linksData,
                positions: nodePositions
            },
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toAddFirst, listNodes, linksData, bus, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la inserción de un nuevo nodo al final
    useEffect(() => {
        if (!listNodes || !svgRef.current || !query.toAddLast) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Id del nuevo último nodo
        const newLastNodeId = query.toAddLast;

        // Id del último nodo actual de la lista (anterior a la inserción)
        const currLastNodeId = listNodes.length > 1 ? listNodes[listNodes.length - 2].id : null;

        // Animación de inserción del nodo como último elemento de la lista
        animateSimpleInsertLast(
            svg,
            {
                newLastNodeId,
                currLastNodeId,
                nodesData: listNodes,
                positions: nodePositions
            },
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toAddLast, listNodes, bus, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la inserción de un nuevo nodo en una posicion especifica
    useEffect(() => {
        if (!listNodes || !svgRef.current || !query.toAddAt) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Extraemos los datos de inserción de la query
        const { nodeId, position } = query.toAddAt;

        // Id del nodo anterior al nuevo nodo
        const prevNodeId = position > 0 ? listNodes[position - 1].id : null;

        // Id del nodo siguiente al nuevo nodo
        const nextNodeId = position !== listNodes.length - 1 ? listNodes[position + 1].id : null;

        // Animación de inserción del nodo en una posición especifica
        animateSimpleInsertAt(
            svg,
            {
                newNodeId: nodeId,
                prevNodeId,
                nextNodeId,
                insertionPosition: position,
                nodesData: listNodes,
                linksData,
                positions: nodePositions
            },
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toAddAt, listNodes, linksData, bus, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la eliminación de un nodo al inicio
    useEffect(() => {
        if (!listNodes || !svgRef.current || !query.toDeleteFirst) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Id del nodo cabeza actual previo a la eliminación (nodo a eliminar)
        const currHeadNodeId = query.toDeleteFirst;

        // Id del nuevo nodo cabeza
        const newHeadNodeId = listNodes.length > 0 ? listNodes[0].id : null;

        // Animación de eliminación del primer nodo de la lista
        animateSimpleDeleteFirst(
            svg,
            {
                currHeadNodeId,
                newHeadNodeId,
                remainingNodesData: listNodes,
                remainingLinksData: linksData,
                positions: nodePositions
            },
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toDeleteFirst, listNodes, linksData, bus, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la eliminación de un nodo al final
    useEffect(() => {
        if (!listNodes || !svgRef.current || !query.toDeleteLast) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Id del último nodo actual previo a la eliminación (nodo a eliminar)
        const currLastNodeId = query.toDeleteLast;

        // Id del nuevo último nodo
        const newLastNodeId = listNodes.length > 0 ? listNodes[listNodes.length - 1].id : null;

        // Animación de eliminación del último nodo de la lista
        animateSimpleDeleteLast(
            svg,
            {
                currLastNodeId,
                newLastNodeId,
                remainingNodesData: listNodes,
                positions: nodePositions
            },
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toDeleteLast, listNodes, bus, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la eliminación de un nodo en una posición especifica
    useEffect(() => {
        if (!listNodes || !svgRef.current || !query.toDeleteAt || !prevNodes) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Extraemos los datos de eliminación de la query
        const { nodeId, position } = query.toDeleteAt;

        // Id del nodo anterior al nodo a eliminar
        const prevNodeId = position > 0 ? prevNodes[position - 1].id : null;

        // Id del nodo siguiente al nodo a eliminar
        const nextNodeId = position !== prevNodes.length - 1 ? prevNodes[position + 1].id : null;

        // Animación de eliminación del nodo en una posición especifica
        animateSimpleDeleteAt(
            svg,
            {
                nodeToRemoveId: nodeId,
                prevNodeId,
                nextNodeId,
                deletePosition: position,
                remainingNodesData: prevNodes,
                remainingLinksData: linksData,
                positions: nodePositions
            },
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toDeleteAt, listNodes, linksData, prevNodes, bus, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la búsqueda de un nodo
    useEffect(() => {
        if (!listNodes || !svgRef.current || !query.toSearch) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Obtenemos el elemento de la lista a buscar
        const targetElement = query.toSearch;

        // Animación de búsqueda del elemento especificado
        animateSearchElement(
            svg,
            targetElement,
            listNodes,
            bus,
            resetQueryValues,
            setIsAnimating
        );

    }, [query.toSearch, listNodes, bus, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la limpieza de lienzo
    useEffect(() => {
        if (!listNodes || !svgRef.current || !query.toClear) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Código y labels de la operación
        const listaSimpleCode = getListaSimplementeEnlazadaCode();
        const labels = listaSimpleCode.clean.labels!;

        // Animación de limpieza de la lista
        animateClearList(
            svg,
            nodePositions,
            bus,
            {
                CLEAR_HEAD: labels.CLEAR_HEAD,
                RESET_SIZE: labels.RESET_SIZE
            },
            "clean",
            resetQueryValues, setIsAnimating);
    }, [query.toClear, listNodes, bus, resetQueryValues, setIsAnimating]);

    return { svgRef }
}