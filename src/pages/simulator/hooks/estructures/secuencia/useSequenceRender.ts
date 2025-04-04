import { useEffect, useRef } from "react"
import { SequenceOperations } from "../../../../../types";
import * as d3 from "d3";
import { drawBaseSequence, animateInsertionSequence, animateUpdateSequence, animateDeleteLastElementSequence, animateSearchSequence, animateDeleteElementWithDisplacement } from "../../../../../shared/utils/draw/sequenceDrawActions";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { SVG_SEQUENCE_VALUES } from "../../../../../shared/constants/consts";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";

export function useSequenceRender(sequence: (number | null)[], memory: number[], query: SequenceOperations, resetQueryValues: () => void) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Estado previo de la secuencia
    const prevSequence = usePrevious(sequence);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

    // Renderizado de la secuencia
    useEffect(() => {
        // Verificamos que la secuencia sea válida y que la referencia al SVG se haya establecido
        if (!sequence || !svgRef.current) return;

        // Margenes para el SVG
        const margin = { left: SVG_SEQUENCE_VALUES.MARGIN_LEFT, right: SVG_SEQUENCE_VALUES.MARGIN_RIGHT };

        // Dimensiones de cada elemento (rectángulos)
        const elementWidth = SVG_SEQUENCE_VALUES.ELEMENT_WIDTH;
        const elementHeight = SVG_SEQUENCE_VALUES.ELEMENT_HEIGHT;

        // Espaciado entre elementos (rectángulos)
        const spacing = SVG_SEQUENCE_VALUES.SPACING;

        // Ancho y alto del SVG dependiendo del número de elementos de la secuencia
        const width = margin.left + sequence.length * (elementWidth + spacing) - spacing;
        const height = SVG_SEQUENCE_VALUES.HEIGHT;

        // Configuración del contenedor SVG
        const svg = d3.select(svgRef.current)
            .attr("height", height)
            .attr("width", width);

        // Renderizado de la estructura base de la secuencia en el SVG
        drawBaseSequence(svg,
            sequence,
            memory,
            { margin, elementWidth, elementHeight, spacing, height }
        );
    }, [sequence]);

    // Operación de inserción
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!sequence || !svgRef.current || query.toAdd === null || !prevSequence) return;

        // Indice donde se insertó el nuevo elemento
        const newElementIndex = sequence.findIndex((actualValue, i) => actualValue !== prevSequence[i]);

        // Si hubo una inserción
        if (newElementIndex !== -1) {
            // Seleccionamos el elemento SVG de acuerdo a su referencia
            const svg = d3.select(svgRef.current);

            // Grupo del lienzo correspondiente al nuevo elemento
            const targetGroup = svg
                .selectAll<SVGGElement, number | null>("g.element")
                .filter((_d, i) => i === newElementIndex);

            // Dimensiones del SVG
            const dims = {
                margin: { left: SVG_SEQUENCE_VALUES.MARGIN_LEFT, right: SVG_SEQUENCE_VALUES.MARGIN_RIGHT },
                elementWidth: SVG_SEQUENCE_VALUES.ELEMENT_WIDTH,
                elementHeight: SVG_SEQUENCE_VALUES.ELEMENT_HEIGHT,
                spacing: SVG_SEQUENCE_VALUES.SPACING,
                height: SVG_SEQUENCE_VALUES.HEIGHT
            }

            // Animación de inserción del nuevo elemento
            animateInsertionSequence(svg,
                targetGroup,
                query.toAdd,
                newElementIndex,
                dims,
                resetQueryValues,
                setIsAnimating
            );
        }
    }, [query.toAdd]);

    // Operación de eliminación por posición
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!sequence || !svgRef.current || query.toDelete === null || !prevSequence) return;

        // Indice del elemento eliminado
        const deletedIndexElement = query.toDelete;

        // Valor del elemento eliminado
        const deletedElement = prevSequence[deletedIndexElement] ?? -1;

        // Indice correspondiente al elemento vacio producto de la eliminación
        const firstNullIndex = sequence.findIndex(val => val === null);

        // Si se encontró una posición nula
        if (firstNullIndex !== -1) {
            // Dimensiones del SVG
            const dims = {
                margin: { left: SVG_SEQUENCE_VALUES.MARGIN_LEFT, right: SVG_SEQUENCE_VALUES.MARGIN_RIGHT },
                elementWidth: SVG_SEQUENCE_VALUES.ELEMENT_WIDTH,
                elementHeight: SVG_SEQUENCE_VALUES.ELEMENT_HEIGHT,
                spacing: SVG_SEQUENCE_VALUES.SPACING,
                height: SVG_SEQUENCE_VALUES.HEIGHT
            }

            // Seleccionamos el elemento SVG de acuerdo a su referencia
            const svg = d3.select(svgRef.current);

            // Determinamos la animación a aplicar en base a si es necesario realizar un desplazamiento o no 
            if (deletedIndexElement === firstNullIndex) {
                // Grupo del lienzo correspondiente al ultimo elemento con valor de la secuencia
                const targetGroup = svg
                    .selectAll<SVGGElement, number | null>("g.element")
                    .filter((_d, i) => i === deletedIndexElement);

                // Animación para eliminar el elemento seleccionado
                animateDeleteLastElementSequence(svg,
                    targetGroup,
                    deletedElement,
                    deletedIndexElement,
                    dims,
                    resetQueryValues,
                    setIsAnimating
                );
            } else {
                // Grupos afectados cuyo índice esté entre deletedIndexElement y firstNullIndex
                const affectedGroups = svg.selectAll<SVGGElement, number | null>("g.element")
                    .filter((_d, i) => i >= deletedIndexElement && i <= firstNullIndex);

                // Grupo correspondiente al elemento que pasa a ser nulo
                const nullGroup = svg.selectAll<SVGGElement, number | null>("g.element")
                    .filter((_d, i) => i === firstNullIndex);

                // Animación para eliminar el elemento seleccionado y desplazar los elementos afectados
                animateDeleteElementWithDisplacement(
                    svg,
                    affectedGroups,
                    nullGroup,
                    prevSequence,
                    deletedIndexElement,
                    firstNullIndex,
                    dims,
                    resetQueryValues,
                    setIsAnimating
                );
            }
        }
    }, [query.toDelete]);

    // Operación de actualización
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!sequence || !svgRef.current || !query.toUpdate || !prevSequence) return;

        // Verificamos la estructura de la query del usuario
        if (!Array.isArray(query.toUpdate) || query.toUpdate.length !== 2) return;

        // Posición del elemento a actualizar y el nuevo valor a asignar
        const [pos, newVal] = query.toUpdate;

        // Guardamos el valor previo a su actualización para su uso en la transición
        const oldVal = prevSequence[pos] ?? -1;

        // Seleccionamos el elemento SVG de acuerdo a su referencia
        const svg = d3.select(svgRef.current);

        // Grupo que correspondiente al elemento actualizado
        const updatedGroup = svg
            .selectAll<SVGGElement, number | null>("g.element")
            .filter((_d, i) => i === pos);

        // Dimensiones del SVG
        const dims = {
            margin: { left: SVG_SEQUENCE_VALUES.MARGIN_LEFT, right: SVG_SEQUENCE_VALUES.MARGIN_RIGHT },
            elementWidth: SVG_SEQUENCE_VALUES.ELEMENT_WIDTH,
            elementHeight: SVG_SEQUENCE_VALUES.ELEMENT_HEIGHT,
            spacing: SVG_SEQUENCE_VALUES.SPACING,
            height: SVG_SEQUENCE_VALUES.HEIGHT
        }

        // Animacíon del proceso de actualización del elemento
        animateUpdateSequence(
            svg,
            updatedGroup,
            oldVal,
            newVal,
            pos,
            dims,
            resetQueryValues,
            () => setIsAnimating(false)
        );
    }, [query.toUpdate]);

    // Operación de búsqueda
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!sequence || !svgRef.current || query.toSearch === null) return;

        // Seleccionamos el elemento SVG de acuerdo a su referencia
        const svg = d3.select(svgRef.current);

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
            dims,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toSearch]);

    return { svgRef }
}