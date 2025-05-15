import { useEffect, useRef } from "react";
import { BaseQueryOperations, IndicatorPositioningConfig, StackNodeData } from "../../../../../types";
import { SVG_STACK_VALUES, SVG_STYLE_VALUES } from "../../../../../shared/constants/consts";
import * as d3 from "d3";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import {
    animatePopNode,
    drawStackNodes,
    highlightTopNode,
    animatePushNode,
    animateClearStack,
} from "../../../../../shared/utils/draw/stackDrawActions";
import { drawArrowIndicator } from "../../../../../shared/utils/draw/drawActionsUtilities";

export function useStackRender(
    stackNodes: StackNodeData[],
    query: BaseQueryOperations<"pila">,
    resetQueryValues: () => void
) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Mapa para guardar posiciones {x, y} de nodos, persistente entre renders
    const nodePositions = useRef(
        new Map<string, { x: number; y: number }>()
    ).current;

    // Estado previo de la pila
    const prevNodes = usePrevious(stackNodes);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

    // Renderizado base de la pila
    useEffect(() => {
        // Verificamos que el array de nodos no sea nulo y que la referencia al SVG se haya establecido
        if (!stackNodes || !svgRef.current) return;

        // Margenes para el svg
        const margin = {
            left: SVG_STACK_VALUES.MARGIN_LEFT,
            right: SVG_STACK_VALUES.MARGIN_RIGHT,
        };

        // Dimensiones para cada nodo
        const elementWidth = SVG_STACK_VALUES.ELEMENT_WIDTH;
        const elementHeight = SVG_STACK_VALUES.ELEMENT_HEIGHT;

        // Espaciado entre nodos
        const spacing = SVG_STACK_VALUES.SPACING;
        const verticalSpacing = elementHeight + spacing;

        // Ancho del SVG
        const width = margin.left + SVG_STACK_VALUES.WIDTH + margin.right;

        // Cálculo de la altura de la SVG considerando un espacio adicional en la parte superior para la animación
        const animationTopSpace = elementHeight * 2;
        const displayLength = Math.max(stackNodes.length, prevNodes?.length ?? 0);
        const nodesHeight = SVG_STACK_VALUES.MARGIN_TOP + displayLength * verticalSpacing + SVG_STACK_VALUES.MARGIN_BOTTOM;
        const height = animationTopSpace + nodesHeight;

        // Configuración del contenedor SVG
        const svg = d3
            .select(svgRef.current)
            .attr("height", height)
            .attr("width", width);

        // Renderizado de los nodos pertenecientes a la pila
        drawStackNodes(svg, stackNodes, nodePositions, {
            margin,
            elementWidth,
            elementHeight,
            verticalSpacing,
            height,
            nodesHeight
        });

        // Transición de aparición del indicador
        const indicatorPositioningTransform: IndicatorPositioningConfig = {
            calculateTransform: (pos, d) => `translate(${pos.x + d.elementWidth + 30}, ${pos.y - d.elementHeight / 2})`
        };

        // Creación de indicador para elemento tope
        const headId = stackNodes.length > 0 ? stackNodes[0].id : null;
        const headPos = headId ? nodePositions.get(headId)! : null;
        const arrowHeadPathData = "M0,0 L10,9.5 L10,4 L20,4 L20,-4 L10,-4 L10,-9.5 Z";

        // Configuración de estilos y de posicionamiento para el indicador de tope
        const headStyleConfig = {
            text: "TOPE",
            textColor: SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR,
            arrowColor: SVG_STYLE_VALUES.RECT_STROKE_COLOR,
            fontSize: "18px",
            fontWeight: "bold",
            arrowPathData: arrowHeadPathData,
            textRelativeX: headPos ? (elementWidth / 2) - 10 : undefined,
            textRelativeY: headPos ? elementHeight + 10 : -30,
            arrowTransform: `translate(-20, ${elementHeight + 5})`
        }

        // Renderizado del indicador de tope
        drawArrowIndicator(
            svg,
            "tope-indicator",
            "tope-indicator-group",
            headPos,
            headStyleConfig,
            indicatorPositioningTransform,
            { elementWidth, elementHeight }
        );
    }, [stackNodes]);

    // Efecto para manejar la operación push (apilar)
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (
            !stackNodes ||
            !svgRef.current ||
            !query.toPushNode ||
            !prevNodes
        )
            return;

        // Id del nodo apilado
        const nodeIdEnqueued = query.toPushNode;

        // Ubicamos el nodo insertado
        const newNode = stackNodes.find((node) => node.id === nodeIdEnqueued);

        // En caso de no ubicar al nuevo nodo
        if (!newNode) {
            resetQueryValues();
            setIsAnimating(false);
            return;
        }

        // Seleccionamos el elemento SVG de acuerdo a su referencia
        const svg = d3.select(svgRef.current);

        // Animación de inserción del nuevo nodo
        animatePushNode(
            svg,
            nodeIdEnqueued,
            stackNodes.slice(1),
            nodePositions,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toPushNode, stackNodes, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la operación pop (desapilar)
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (
            !stackNodes ||
            !query.toPopNode ||
            !svgRef.current ||
            !prevNodes ||
            prevNodes.length === 0
        )
            return;

        // Obtenemos el nodo superior que va a ser eliminado
        const nodeToRemove = query.toPopNode;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Ejecutamos la animación de pop
        animatePopNode(
            svg,
            nodeToRemove,
            stackNodes,
            nodePositions,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toPopNode, stackNodes, prevNodes, resetQueryValues]);

    // Operación de obtención de elemento tope
    useEffect(() => {
        if (
            !svgRef.current ||
            !stackNodes ||
            stackNodes.length === 0 ||
            !query.toGetTop
        )
            return;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Identificador del nodo tope de la pila
        const topNodeId = query.toGetTop;

        // Animación de resaltado para nodo tope de la pila
        highlightTopNode(
            svg,
            topNodeId,
            () => {
                resetQueryValues();
                setIsAnimating(false);
            });
    }, [query.toGetTop, stackNodes, resetQueryValues, setIsAnimating]);

    // Operación de limpieza
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!stackNodes || !svgRef.current || !query.toClear) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Animación de limpieza de la cola
        animateClearStack(svg, nodePositions, resetQueryValues, setIsAnimating);
    }, [query.toClear, stackNodes, resetQueryValues, setIsAnimating]);

    return { svgRef };
}