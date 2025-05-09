import { useEffect, useRef } from "react";
import { BaseQueryOperations, StackNodeData } from "../../../../../types";
import { SVG_STACK_VALUES } from "../../../../../shared/constants/consts";
import * as d3 from "d3";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import {
    animateNodePopExit,
    drawNodes,
    highlightTopNode,
    pushNode,
} from "../../../../../shared/utils/draw/stackDrawActions";

//la que sirve pero mal
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
    const { setIsAnimating, isAnimating } = useAnimation();

    // Renderizado base de la pila
    useEffect(() => {
        // Verificamos que el array de nodos no sea nulo y que la referencia al SVG se haya establecido
        if (!svgRef.current || query.toPopNode) return;

        // Si hay una animación en curso, no redibujamos la pila completamente
        if (isAnimating) return;

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

        // Ancho y alto del SVG dependiendo del número de elementos de la pila
        const width = margin.left + 120 + margin.right;

        // Para la altura, consideramos un espacio adicional en la parte superior para la animación
        const animationTopSpace = elementHeight * 2;
        const height =
            stackNodes.length == 0
                ? SVG_STACK_VALUES.HEIGHT
                : animationTopSpace +
                  SVG_STACK_VALUES.MARGIN_TOP +
                  stackNodes.length * (elementHeight + spacing) +
                  SVG_STACK_VALUES.MARGIN_BOTTOM;

        // Configuración del contenedor SVG
        const svg = d3
            .select(svgRef.current)
            .attr("height", height)
            .attr("width", width);

        // Renderizado de los nodos pertenecientes a la pila
        drawNodes(svg, stackNodes, nodePositions, {
            margin,
            elementWidth,
            elementHeight,
            verticalSpacing,
            height,
        });
    }, [stackNodes, isAnimating]);

    // Efecto para manejar la operación push (apilar)
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (
            !stackNodes ||
            !svgRef.current ||
            !query.toPushNode ||
            !prevNodes ||
            isAnimating
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

        // Grupo del lienzo correspondiente al nuevo elemento
        const newNodeGroup = svg.select<SVGGElement>(`#${newNode.id}`);

        // Animación de inserción del nuevo nodo
        pushNode(
            newNodeGroup,
            nodeIdEnqueued,
            nodePositions,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toPushNode, isAnimating]);

    // Efecto para manejar la operación pop (desapilar)
    useEffect(() => {
        // Solo procesamos si hay un cambio en toPopNode y no estamos ya animando
        if (
            !stackNodes ||
            !query.toPopNode ||
            isAnimating ||
            !svgRef.current ||
            !prevNodes ||
            prevNodes.length === 0
        )
            return;

        // Obtenemos el nodo superior que va a ser eliminado
        const nodeToRemove = prevNodes[0];

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Ejecutamos la animación de pop
        animateNodePopExit(
            svg,
            nodeToRemove,
            stackNodes,
            nodePositions,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toPopNode, stackNodes, prevNodes, resetQueryValues, isAnimating]);

    useEffect(() => {
        if (
            !query.toGetTop ||
            isAnimating ||
            !svgRef.current ||
            stackNodes.length === 0
        )
            return;

        setIsAnimating(true);

        highlightTopNode(svgRef, stackNodes, () => {
            resetQueryValues();
            setIsAnimating(false);
        });
    }, [query.toGetTop, isAnimating, stackNodes]);

    return { svgRef };
}