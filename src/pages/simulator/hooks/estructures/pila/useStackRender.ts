import { useEffect, useRef, useState } from "react";
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

    // Guardar una copia de los nodos que se van a eliminar para la animación
    const [nodesToAnimate, setNodesToAnimate] = useState<StackNodeData[]>([]);

    // Control de bloqueo de animación
    const { setIsAnimating, isAnimating } = useAnimation();

    // Referencia al nodo que se está eliminando para evitar que se elimine
    // antes de completar la animación
    const poppingNodeRef = useRef<string | null>(null);

    // Renderizado base de la pila
    useEffect(() => {
        // Verificamos que el array de nodos no sea nulo y que la referencia al SVG se haya establecido
        if (!svgRef.current) return;

        // Creamos un array combinado de nodos para el renderizado
        // Esto incluye los nodos actuales y cualquier nodo que estemos animando para eliminar
        const nodesForRendering = [...stackNodes, ...nodesToAnimate];

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
            nodesForRendering.length == 0
                ? SVG_STACK_VALUES.HEIGHT
                : animationTopSpace +
                  SVG_STACK_VALUES.MARGIN_TOP +
                  nodesForRendering.length * (elementHeight + spacing) +
                  SVG_STACK_VALUES.MARGIN_BOTTOM;

        // Configuración del contenedor SVG
        const svg = d3
            .select(svgRef.current)
            .attr("height", height)
            .attr("width", width);

        // Renderizado de los nodos pertenecientes a la pila
        drawNodes(
            svg,
            nodesForRendering,
            nodePositions,
            { margin, elementWidth, elementHeight, verticalSpacing, height },
            setIsAnimating
        );
    }, [stackNodes, nodesToAnimate, isAnimating]);

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

        // Ubicamos el nodo que anteriormente era el último
        const prevLastNode = prevNodes.length > 0 ? prevNodes[0] : null;

        // En caso de no ubicar al nuevo nodo
        if (!newNode) return;

        // Seleccionamos el elemento SVG de acuerdo a su referencia
        const svg = d3.select(svgRef.current);

        // Grupo del lienzo correspondiente al nuevo elemento
        const newNodeGroup = svg.select<SVGGElement>(`#${newNode.id}`);

        // Grupo del lienzo correspondiente al nuevo enlace
        const nextLinkGroup = prevLastNode
            ? svg.select<SVGGElement>(
                  `#link-${prevLastNode.id}-${newNode.id}-next`
              )
            : null;

        // Animación de inserción del nuevo nodo
        pushNode(
            newNodeGroup,
            nextLinkGroup,
            nodeIdEnqueued,
            prevLastNode?.id,
            nodePositions,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toPushNode, isAnimating]);

    // Efecto para manejar la operación pop (desapilar)
    useEffect(() => {
        // Solo procesamos si hay un cambio en toPopNode y no estamos ya animando
        if (!query.toPopNode || isAnimating || !svgRef.current || !prevNodes)
            return;

        // Verificamos que efectivamente haya habido un pop (la pila anterior tenía más elementos)
        const popped = prevNodes.length > stackNodes.length;
        if (!popped) return;

        // Obtenemos el nodo superior que va a ser eliminado
        const nodeToRemove = prevNodes[0];
        if (!nodeToRemove) {
            resetQueryValues();
            return;
        }

        // Agregamos el nodo a eliminar a nuestro estado para mantenerlo renderizado
        // mientras se realiza la animación
        setNodesToAnimate([nodeToRemove]);

        // Guardamos el ID del nodo que estamos quitando
        poppingNodeRef.current = nodeToRemove.id;

        console.log(
            "Preparando la animación de pop para el nodo:",
            nodeToRemove.id
        );

        // Ejecutamos la animación en el siguiente ciclo de renderizado
        // para asegurarnos de que el nodo esté dibujado en el DOM
        setTimeout(() => {
            // Seleccionamos el elemento SVG
            const svg = d3.select(svgRef.current);

            // Seleccionamos el nodo que queremos eliminar
            const nodeElement = svg.select<SVGGElement>(`#${nodeToRemove.id}`);

            // Verificamos que hayamos encontrado el nodo
            if (nodeElement.empty()) {
                console.error(
                    "No se encontró el nodo a eliminar:",
                    nodeToRemove.id
                );
                resetQueryValues();
                setNodesToAnimate([]);
                return;
            }

            console.log(
                "Nodo encontrado, iniciando animación:",
                nodeToRemove.id
            );

            // Ejecutamos la animación de pop
            animateNodePopExit(
                nodeElement,
                nodeToRemove.id,
                nodePositions,
                SVG_STACK_VALUES.ELEMENT_HEIGHT,
                SVG_STACK_VALUES.ELEMENT_WIDTH,
                stackNodes[0]?.id, // El nuevo nodo superior (si existe)
                () => {
                    // Limpiamos el estado una vez que se completa la animación
                    resetQueryValues();
                    setNodesToAnimate([]);
                },
                setIsAnimating
            );
        }, 0);
    }, [query.toPopNode, isAnimating]);

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

// export function useStackRender(
//     stackNodes: StackNodeData[],
//     query: BaseQueryOperations<"pila">,
//     resetQueryValues: () => void
// ) {
//     // Referencia que apunta al elemento SVG del DOM
//     const svgRef = useRef<SVGSVGElement>(null);

//     // Mapa para guardar posiciones {x, y} de nodos, persistente entre renders
//     const nodePositions = useRef(
//         new Map<string, { x: number; y: number }>()
//     ).current;

//     // Estado previo de la pila
//     const prevNodes = usePrevious(stackNodes);

//     // Control de bloqueo de animación
//     const { setIsAnimating } = useAnimation();

//     // Renderizado base de la pila
//     useEffect(() => {
//         // Verificamos que el array de nodos no sea nulo y que la referencia al SVG se haya establecido
//         if (!stackNodes || !svgRef.current) return;

//         // Margenes para el svg
//         const margin = {
//             left: SVG_STACK_VALUES.MARGIN_LEFT,
//             right: SVG_STACK_VALUES.MARGIN_RIGHT,
//         };

//         // Dimensiones para cada nodo
//         const elementWidth = SVG_STACK_VALUES.ELEMENT_WIDTH;
//         const elementHeight = SVG_STACK_VALUES.ELEMENT_HEIGHT;

//         // Espaciado entre nodos
//         const spacing = SVG_STACK_VALUES.SPACING;
//         const verticalSpacing = elementHeight + spacing;

//         // Ancho y alto del SVG dependiendo del número de elementos de la pila
//         const width = margin.left + 120 + margin.right;

//         // Para la altura, consideramos un espacio adicional en la parte superior para la animación
//         // Esto permitirá que los nuevos nodos aparezcan completamente visibles desde arriba
//         const animationTopSpace = elementHeight * 2;
//         const height =
//             stackNodes.length == 0
//                 ? SVG_STACK_VALUES.HEIGHT
//                 : animationTopSpace +
//                   SVG_STACK_VALUES.MARGIN_TOP +
//                   stackNodes.length * (elementHeight + spacing) +
//                   SVG_STACK_VALUES.MARGIN_BOTTOM;

//         // Configuración del contenedor SVG
//         const svg = d3
//             .select(svgRef.current)
//             .attr("height", height)
//             .attr("width", width);

//         // Renderizado de los nodos pertenecientes a la pila
//         drawNodes(
//             svg,
//             stackNodes,
//             nodePositions,
//             { margin, elementWidth, elementHeight, verticalSpacing, height },
//             setIsAnimating
//         );
//     }, [stackNodes]);

//     useEffect(() => {
//         // Verificaciones necesarias para realizar la animación
//         if (!stackNodes || !svgRef.current || !query.toPushNode || !prevNodes)
//             return;

//         // Id del nodo apilado
//         const nodeIdEnqueued = query.toPushNode;

//         // Ubicamos el nodo insertado
//         const newNode = stackNodes.find((node) => node.id === nodeIdEnqueued);

//         // Ubicamos el nodo que anteriormente era el último
//         const prevLastNode =
//             prevNodes.length > 0 ? prevNodes[prevNodes.length - 1] : null;

//         // En caso de no ubicar al nuevo nodo
//         if (!newNode) return;

//         // Seleccionamos el elemento SVG de acuerdo a su referencia
//         const svg = d3.select(svgRef.current);

//         // Grupo del lienzo correspondiente al nuevo elemento
//         const newNodeGroup = svg.select<SVGGElement>(`#${newNode.id}`);

//         // Grupo del lienzo correspondiente al nuevo enlace
//         const nextLinkGroup = prevLastNode
//             ? svg.select<SVGGElement>(
//                   `#link-${prevLastNode.id}-${newNode.id}-next`
//               )
//             : null;

//         // Animación de inserción del nuevo nodo
//         pushNode(
//             newNodeGroup,
//             nextLinkGroup,
//             nodeIdEnqueued,
//             prevLastNode?.id,
//             nodePositions,
//             resetQueryValues,
//             setIsAnimating
//         );
//     });

//     useEffect(() => {
//         if (!svgRef.current || !prevNodes) return;

//         // Detectar si hubo pop: longitud menor
//         const popped = prevNodes.length > stackNodes.length;

//         if (!popped) return;

//         // Nodo eliminado (último del estado anterior)
//         const removedNode = prevNodes[0];
//         if (!removedNode) return;

//         // Seleccionamos el grupo SVG del nodo eliminado
//         const svg = d3.select(svgRef.current);

//         const removedGroup = svg.select<SVGGElement>(`#${removedNode.id}`);
//         console.log("REMOVIENDO...", removedGroup);

//         // Ejecutar animación de salida
//         animateNodePopExit(
//             removedGroup,
//             nodePositions,
//             SVG_STACK_VALUES.ELEMENT_HEIGHT,
//             setIsAnimating
//         );
//     }, [query.toPopNode]);

//     return { svgRef };
// }
