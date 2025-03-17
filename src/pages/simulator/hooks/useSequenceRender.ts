import { useEffect, useRef } from "react"
import { BaseQueryOperations } from "../../../types";
import * as d3 from "d3";
import { drawBaseSequence, animateInsertionSequence, animateUpdateSequence, animateDeleteElementSequence, animateSearchSequence, animateTransformDeleteSequence } from "../../../shared/utils/sequenceDrawActions";
import { usePrevious } from "../../../shared/hooks/usePrevious";
import { SVG_SEQUENCE_VALUES } from "../../../shared/constants/consts";
import { useAnimation } from "../../../shared/hooks/useAnimation";

export function useSequenceRender(secuencia: (number | null)[], memoria: number[], query: BaseQueryOperations, resetQueryValues: () => void) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Estado previo de la secuencia
    const prevSecuencia = usePrevious(secuencia);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

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
        drawBaseSequence(svg, secuencia, memoria, { margin, elementWidth, elementHeight, spacing, height });
    }, [secuencia]);

    // Operación de inserción
    useEffect(() => {
        // Verificamos que la secuencia sea válida, que la referencia al SVG se haya establecido y que query.toAdd no sea nulo
        if (!secuencia || !svgRef.current || query.toAdd === null || !prevSecuencia) return;

        console.log("INSERTANDO");

        // Buscamos el primer índice donde la secuencia actual difiere del estado previo
        const newIndex = secuencia.findIndex((valorActual, i) => valorActual !== prevSecuencia[i]);

        // Si se encontro una diferencia
        if (newIndex !== -1) {
            // Seleccionamos el elemento SVG de acuerdo a su referencia
            const svg = d3.select(svgRef.current);

            // 🚨 Interrumpir cualquier animación en curso antes de iniciar una nueva
            svg.selectAll("g.element").interrupt();

            // Seleccionamos el grupo dentro del lienzo que se va a animar
            const targetGroup = svg
                .selectAll<SVGGElement, number | null>("g.element")
                .filter((_d, i) => i === newIndex);

            // Animamos la inserción del nuevo elemento
            animateInsertionSequence(targetGroup, resetQueryValues, () => setIsAnimating(false));
        }
    }, [query.toAdd]);

    // Operación de eliminación
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!secuencia || !svgRef.current || query.toDelete === null || !prevSecuencia) return;

        console.log("ELIMINANDO");

        // Determinamos el indice del elemento que se elimino
        const indexEliminado = query.toDelete;
        console.log("Indice eliminado: ", indexEliminado)

        // Determinamos el elemento que se elimino
        const deletedElement = prevSecuencia[indexEliminado];
        console.log("Elemento eliminado: ", deletedElement)

        // Determinamos el primer indice con null en la secuencia actual
        let firstNullIndex = secuencia.findIndex(val => val === null);
        if (firstNullIndex === -1) firstNullIndex = secuencia.length;
        console.log("Primer elemento nulo", firstNullIndex);

        // Seleccionamos el elemento SVG de acuerdo a su referencia
        const svg = d3.select(svgRef.current);

        // 🚨 Interrumpir cualquier animación en curso antes de iniciar una nueva
        svg.selectAll("g.element").interrupt();

        // Determinamos la animación a aplicar en base a si el elemento siguiente al elemento a eliminar es nulo o no
        if (indexEliminado === firstNullIndex) {
            const targetGroup = svg
                .selectAll<SVGGElement, number | null>("g.element")
                .filter((_d, i) => i === indexEliminado);

            animateDeleteElementSequence(targetGroup, resetQueryValues, deletedElement);
        } else {

            console.log("Secuencia actual usada en eliminación");
            console.log(secuencia);
            console.log("------------");
            console.log("Secuencia previa usada en eliminación");
            console.log(prevSecuencia);

            // Grupo del lienzo correspondiente al elemento eliminado
            const deletedGroup = svg
                .selectAll<SVGGElement, number | null>("g.element")
                .filter((_d, i) => i === indexEliminado);

            // Grupos afectados cuyo índice esté entre indexEliminado y firstNullIndex
            const affectedGroups = svg.selectAll<SVGGElement, number | null>("g.element")
                .filter((_d, i) => i >= indexEliminado && i <= firstNullIndex);

            // Forzamos que los elementos afectados por la eliminación muestren sus valores anteriores
            affectedGroups.select("text")
                .text((_d, i) => {
                    return prevSecuencia[indexEliminado + i];
                });

            // Grupo correspondiente al elemento que pasa a ser nulo
            const nullGroup = svg.selectAll<SVGGElement, number | null>("g.element")
                .filter((_d, i) => i === firstNullIndex);

            // Pintamos el grupo antes de comenzar a animar
            nullGroup.select("rect")
                .attr("fill", "skyblue");

            // Animación para desvanecimiento del texto
            deletedGroup.select("text")
                .text("")
                .transition()
                .delay(100)
                .duration(1500)
                .style("opacity", 0)
                .on("end", function () {
                    d3.select(this)
                        .text("");
                });

            // Animación de eliminación (fade-out del elemento a eliminar)
            deletedGroup.select("rect")
                .transition()
                .duration(1500)
                .attr("fill", "gray")
                .style("opacity", 0)
                .transition()
                .duration(1000)
                .attr("fill", "lightgray")
                .style("opacity", 1)
                .on("end", function () {
                    // Devolvemos el color original al contenedor del elemento eliminado
                    deletedGroup.select("rect")
                        .transition()
                        .duration(1500)
                        .attr("fill", "skyblue");

                    // Actualizamos los valores de los elementos afectados a sus valores actuales
                    affectedGroups.select("text")
                        .transition()
                        .duration(1500)
                        .style("opacity", 0)
                        .transition()
                        .duration(1500)
                        .text((_d, i) => {
                            return secuencia[indexEliminado + i] ?? "";
                        })
                        .style("opacity", 1)
                        .on("end", function () {
                            nullGroup.select("rect")
                                .transition()
                                .duration(800)
                                .attr("fill", "lightgray")
                                .on("end", () => {
                                    // Una vez completada la animación, actualizamos el estado final
                                    resetQueryValues();
                                });
                        });
                });
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