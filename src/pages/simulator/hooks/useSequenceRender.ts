import { useEffect, useRef } from "react"
import { BaseQueryOperations } from "../../../types";
import * as d3 from "d3";
import { drawBaseSequence, animateInsertionSequence, animateUpdateSequence, animateDeleteElementSequence, animateSearchSequence, animateTransformDeleteSequence } from "../../../shared/utils/sequenceDrawActions";
import { usePrevious } from "../../../shared/hooks/usePrevious";
import { SVG_SEQUENCE_VALUES } from "../../../shared/constants/consts";

export function useSequenceRender(secuencia: (number | null)[], query: BaseQueryOperations, resetQueryValues: () => void) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Estado previo de la secuencia
    const prevSecuencia = usePrevious(secuencia);

    console.log("Secuencia previa xd")
    console.log(prevSecuencia)
    console.log("--------")
    console.log(secuencia);
    console.log(query);

    useEffect(() => {
        // Verificamos que la secuencia sea válida y que la referencia al SVG se haya establecido
        if (!secuencia || !svgRef.current) return;

        console.log("RENDERIZANDO (data join con snapshot)");

        // Margenes para el SVG
        const margin = { left: SVG_SEQUENCE_VALUES.MARGIN_LEFT, right: SVG_SEQUENCE_VALUES.MARGIN_RIGHT };

        // Dimensiones de cada elemento (rectángulos)
        const elementWidth = SVG_SEQUENCE_VALUES.ELEMENT_WIDTH;
        const elementHeight = SVG_SEQUENCE_VALUES.ELEMENT_HEIGHT;

        // Espaciado entre elementos (rectángulos)
        const spacing = SVG_SEQUENCE_VALUES.SPACING;

        // Definimos las dimensiones para el SVG dependiendo del número de elementos de la secuencia
        const width = margin.left + secuencia.length * (elementWidth + spacing) - spacing;
        const height = SVG_SEQUENCE_VALUES.HEIGHT;

        // Configuración del contenedor SVG
        const svg = d3.select(svgRef.current)
            .attr("height", height)
            .attr("width", width);

        // Creamos la estructura base de la secuencia en el lienzo
        drawBaseSequence(svg, secuencia, { margin, elementWidth, elementHeight, spacing, height });
    }, [secuencia]);

    // Operación de inserción
    useEffect(() => {
        // Verificamos que la secuencia sea válida, que la referencia al SVG se haya establecido y que query.toAdd no sea nulo
        if (!secuencia || !svgRef.current || query.toAdd === null) return;

        // Seleccionamos el elemento SVG de acuerdo a su referencia
        const svg = d3.select(svgRef.current);

        // Animamos la inserción del nuevo elemento
        animateInsertionSequence(svg, query.toAdd, resetQueryValues);
    }, [query.toAdd]);

    // Operación de eliminación
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!secuencia || !svgRef.current || query.toDelete === null || !prevSecuencia) return;

        console.log("ELIMINANDO");

        // Determinamos el indice del elemento que se elimino
        const indexEliminado = secuencia.findIndex(
            (val, i) => val !== prevSecuencia[i]
        );

        // Determinamos el primer indice con null en la secuencia actual
        let firstNullIndex = secuencia.findIndex(val => val === null);
        if (firstNullIndex === -1) firstNullIndex = secuencia.length;

        // Seleccionamos el elemento SVG de acuerdo a su referencia
        const svg = d3.select(svgRef.current);

        console.log("Indice eliminado", indexEliminado);
        console.log("Primer elemento nulo", firstNullIndex);

        // Determinamos la animación a aplicar en base a si el elemento siguiente al elemento a eliminar es nulo o no
        if (indexEliminado === secuencia.length - 1 || prevSecuencia[indexEliminado + 1] === null) {
            const targetGroup = svg
                .selectAll<SVGGElement, number | null>("g.element")
                .filter((_d, i) => i === indexEliminado);

            animateDeleteElementSequence(targetGroup, resetQueryValues, query.toDelete);
        } else {
            // Valor actual luego de ser eliminado el elemento
            const newVal = secuencia[indexEliminado];

            // Ultimo valor de la secuencia que se traslada producto de la eliminación
            const repVal = prevSecuencia[firstNullIndex];

            // Grupo del lienzo correspondiente al elemento eliminado
            const deletedGroup = svg
                .selectAll<SVGGElement, number | null>("g.element")
                .filter((_d, i) => i === indexEliminado);

            // Filtramos los grupos afectados cuyo índice esté entre indexEliminado y firstNullIndex
            const affectedGroups = svg.selectAll<SVGGElement, number | null>("g.element")
                .filter((_d, i) => i >= indexEliminado && i < firstNullIndex);

            // Grupo del elemento que pasa a ser nulo
            const nullGroup = svg.selectAll<SVGGElement, number | null>("g.element")
                .filter((_d, i) => i === firstNullIndex);

            // Animación del proceso de eliminación
            animateTransformDeleteSequence(deletedGroup, affectedGroups, nullGroup, resetQueryValues, query.toDelete, newVal, repVal);
        }
    }, [query.toDelete]);

    // Operación de actualización
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!secuencia || !svgRef.current || !query.toUpdate || !prevSecuencia) return;

        // Verificamos la estructura de la query del usuario
        if (!Array.isArray(query.toUpdate) || query.toUpdate.length !== 2) return;

        // Obtenemos la posición a actualizar y el nuevo valor de la query
        const [pos, newVal] = query.toUpdate;

        // Guardamos el valor previo para su uso en la transición
        const oldVal = Number(prevSecuencia[pos]);

        // Seleccionamos el elemento SVG de acuerdo a su referencia
        const svg = d3.select(svgRef.current);

        // Filtramos el grupo que corresponde a la posición actualizada
        const updatedGroup = svg
            .selectAll<SVGGElement, number | null>("g.element")
            .filter((_d, i) => i === pos);

        // Animamos el proceso de actualización del elemento
        animateUpdateSequence(updatedGroup, resetQueryValues, oldVal, newVal);
    }, [query.toUpdate]);

    // Operación de búsqueda
    useEffect(() => {
        // Verificamos que la secuencia sea válida, que la referencia al SVG se haya establecido y que query.toSearch no sea nulo
        if (!secuencia || !svgRef.current || query.toSearch === null) return;

        console.log("BUSCANDO");

        // Seleccionamos el elemento SVG de acuerdo a su referencia
        const svg = d3.select(svgRef.current);

        // Animamos la búsqueda del elemento
        animateSearchSequence(svg, query.toSearch);
    }, [query.toSearch]);

    return { svgRef }
}