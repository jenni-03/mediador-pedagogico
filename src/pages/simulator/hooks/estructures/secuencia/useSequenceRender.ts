import { useEffect, useRef } from "react"
import { BaseQueryOperations } from "../../../../../types";
import { select } from "d3";
import { drawBaseSequence, animateInsertionSequence, animateGetElementSequence, animateUpdateSequence, animateDeleteElementSequence, animateSearchSequence } from "../../../../../shared/utils/draw/sequenceDrawActions";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { SVG_SEQUENCE_VALUES } from "../../../../../shared/constants/consts";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { useBus } from "../../../../../shared/hooks/useBus";
import { getSecuenciaCode } from "../../../../../shared/constants/pseudocode/secuenciaCode";
import { delay } from "../../../../../shared/utils/simulatorUtils";

export function useSequenceRender(sequence: (number | null)[], memory: string[], query: BaseQueryOperations<"secuencia">, resetQueryValues: () => void) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Estado previo de la secuencia
    const prevSequence = usePrevious(sequence);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

    // Bus para la emisión de eventos de código
    const bus = useBus();

    console.log(query);

    // Efecto para renderizado base de la secuencia
    useEffect(() => {
        // Verificamos que la secuencia sea válida y que la referencia al SVG se haya establecido
        if (!sequence || !svgRef.current || !query.create) return;

        // Margenes para el SVG
        const margin = { left: SVG_SEQUENCE_VALUES.MARGIN_LEFT, right: SVG_SEQUENCE_VALUES.MARGIN_RIGHT };

        // Dimensiones de cada elemento (rectángulos)
        const elementWidth = SVG_SEQUENCE_VALUES.ELEMENT_WIDTH;
        const elementHeight = SVG_SEQUENCE_VALUES.ELEMENT_HEIGHT;

        // Espaciado entre elementos (rectángulos)
        const spacing = SVG_SEQUENCE_VALUES.SPACING;

        // Ancho y alto del SVG dependiendo del número de elementos de la secuencia
        const displayLength = Math.max(sequence.length, prevSequence?.length ?? 0);
        const width = margin.left + displayLength * (elementWidth + spacing) - spacing;
        const height = SVG_SEQUENCE_VALUES.HEIGHT;

        // Configuración del contenedor SVG
        const svg = select(svgRef.current)
            .attr("height", height)
            .attr("width", width);

        const labels = getSecuenciaCode().create.labels!;

        // Inicio de la operación
        bus.emit("op:start", { op: "create" });
        bus.emit("step:enter", { stepId: "create" });

        (async () => {
            // justo antes de arrancar las transiciones “grandes”
            setIsAnimating(true);

            bus.emit("step:progress", { stepId: "create", lineIndex: labels.IF });
            await delay(600);

            // Renderizado de la estructura base de la secuencia en el SVG
            bus.emit("step:progress", { stepId: "create", lineIndex: labels.ALLOC });
            drawBaseSequence(
                svg,
                sequence,
                memory,
                { margin, elementWidth, elementHeight, spacing, height }
            );

            await delay(1000);
            bus.emit("step:progress", { stepId: "create", lineIndex: labels.CANT0 });

            await delay(1000);
            bus.emit("step:progress", { stepId: "create", lineIndex: labels.ASSIGN });
            await delay(1000);

            // Cierre de la operación
            bus.emit("step:done", { stepId: "create" });
            bus.emit("op:done", { op: "create" });

            resetQueryValues();
            setIsAnimating(false);
        })();
    }, [sequence, query.create, prevSequence, bus, memory, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la animación de inserción de un elemento
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!sequence || !svgRef.current || !query.toAdd) return;

        // Extraemos los datos de inserción de la query
        const { element, index } = query.toAdd;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Dimensiones del SVG
        const dims = {
            margin: { left: SVG_SEQUENCE_VALUES.MARGIN_LEFT, right: SVG_SEQUENCE_VALUES.MARGIN_RIGHT },
            elementWidth: SVG_SEQUENCE_VALUES.ELEMENT_WIDTH,
            elementHeight: SVG_SEQUENCE_VALUES.ELEMENT_HEIGHT,
            spacing: SVG_SEQUENCE_VALUES.SPACING,
            height: SVG_SEQUENCE_VALUES.HEIGHT
        }

        // Animación de inserción del nuevo elemento
        animateInsertionSequence(
            svg,
            element,
            index,
            dims,
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toAdd, sequence, prevSequence, bus, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la animación de eliminación por posición
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!sequence || !svgRef.current || !query.toDelete) return;

        // Extraemos los datos de eliminación de la query
        const { index, firstNullIndex } = query.toDelete;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Dimensiones del SVG
        const dims = {
            margin: { left: SVG_SEQUENCE_VALUES.MARGIN_LEFT, right: SVG_SEQUENCE_VALUES.MARGIN_RIGHT },
            elementWidth: SVG_SEQUENCE_VALUES.ELEMENT_WIDTH,
            elementHeight: SVG_SEQUENCE_VALUES.ELEMENT_HEIGHT,
            spacing: SVG_SEQUENCE_VALUES.SPACING,
            height: SVG_SEQUENCE_VALUES.HEIGHT
        }

        // Animación para eliminar el elemento en la posición especificada
        animateDeleteElementSequence(
            svg,
            {
                deleteIndexElement: index,
                firstNullIndex,
                sequence
            },
            dims,
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toDelete, sequence, bus, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la obtención de un elemento especifico 
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!sequence || !svgRef.current || query.toGet === null) return;

        // Extraemos los datos de obtención de la query
        const getIndexElement = query.toGet;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Dimensiones del SVG
        const dims = {
            margin: { left: SVG_SEQUENCE_VALUES.MARGIN_LEFT, right: SVG_SEQUENCE_VALUES.MARGIN_RIGHT },
            elementWidth: SVG_SEQUENCE_VALUES.ELEMENT_WIDTH,
            elementHeight: SVG_SEQUENCE_VALUES.ELEMENT_HEIGHT,
            spacing: SVG_SEQUENCE_VALUES.SPACING,
            height: SVG_SEQUENCE_VALUES.HEIGHT
        }

        // Animación de obtención de elemento
        animateGetElementSequence(
            svg,
            getIndexElement,
            dims,
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toGet, sequence, bus, resetQueryValues, setIsAnimating]);

    // Operación de actualización por posición
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!sequence || !svgRef.current || !query.toUpdate) return;

        // Obtenemos los datos de actualización de la query
        const { newValue, index } = query.toUpdate;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Dimensiones del SVG
        const dims = {
            margin: { left: SVG_SEQUENCE_VALUES.MARGIN_LEFT, right: SVG_SEQUENCE_VALUES.MARGIN_RIGHT },
            elementWidth: SVG_SEQUENCE_VALUES.ELEMENT_WIDTH,
            elementHeight: SVG_SEQUENCE_VALUES.ELEMENT_HEIGHT,
            spacing: SVG_SEQUENCE_VALUES.SPACING,
            height: SVG_SEQUENCE_VALUES.HEIGHT
        }

        // Animacíon de actualización del elemento
        animateUpdateSequence(
            svg,
            {
                newValue,
                pos: index
            },
            dims,
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toUpdate, sequence, bus, resetQueryValues, setIsAnimating]);

    // Operación de búsqueda
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!sequence || !svgRef.current || query.toSearch === null) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Índice correspondiente al primer elemento nulo de la secuencia
        const firstNullIndex = sequence.findIndex(val => val === null);

        // Dimensiones del SVG
        const dims = {
            margin: { left: SVG_SEQUENCE_VALUES.MARGIN_LEFT, right: SVG_SEQUENCE_VALUES.MARGIN_RIGHT },
            elementWidth: SVG_SEQUENCE_VALUES.ELEMENT_WIDTH,
            elementHeight: SVG_SEQUENCE_VALUES.ELEMENT_HEIGHT,
            spacing: SVG_SEQUENCE_VALUES.SPACING,
            height: SVG_SEQUENCE_VALUES.HEIGHT
        }

        // Animación de búsqueda del elemento
        animateSearchSequence(
            svg,
            query.toSearch,
            firstNullIndex !== -1 ? firstNullIndex : sequence.length,
            dims,
            bus,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toSearch, sequence, bus, resetQueryValues, setIsAnimating]);

    return { svgRef }
}