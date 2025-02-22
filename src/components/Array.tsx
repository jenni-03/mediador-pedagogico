import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

export function D3Array() {
    // Estado que almacena el arreglo de números
    const [array, setArray] = useState<number[]>([1, 2, 3, 4, 5]);

    // Referencia al svg que se usará para renderizar la visualización
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Constantes para el ancho y alto de cada rectangulo que representa un elemento del arreglo
    const rectWidth = 60;
    const rectHeight = 40;
    const spacing = 10;

    // Actualiza la visualización del svg cada vez que el arreglo cambia
    const updateVisualization = () => {
        // Comprueba que el svg exista y lo selecciona
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);

        // Calculamos las medidas del svg
        const width = (rectWidth + spacing) * array.length + spacing;
        const height = 100;
        svg.attr("width", width).attr("height", height);

        // Selecciona todos los rectangulos dentro del svg y se vinculan los datos del arreglo
        const rects = svg
            .selectAll<SVGRectElement, number>("rect")
            .data(array, (d) => d.toString());

        // Salida
        rects.exit().transition().duration(500).attr("opacity", 0).remove();

        // Entrada (rectángulos nuevos)
        const rectsEnter = rects
            .enter()
            .append("rect")
            .attr("x", (d, i) => spacing + i * (rectWidth + spacing))
            .attr("y", 30)
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .attr("fill", "#fbbf24")
            .attr("opacity", 0);

        // Enter + Update (unimos la selección de entrada con la existente)
        rectsEnter
            .merge(rects)
            .transition()
            .duration(500)
            .attr("x", (d, i) => spacing + i * (rectWidth + spacing))
            .attr("y", 30)
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .attr("fill", "#fbbf24")
            .attr("opacity", 1);

        // --- Texto ---
        // Vinculamos datos (array) a los elementos <text>
        const texts = svg
            .selectAll<SVGTextElement, number>("text")
            .data(array, (d) => d.toString());

        // Salida
        texts.exit().remove();

        // Entrada
        const textsEnter = texts
            .enter()
            .append("text")
            .attr(
                "x",
                (d, i) => spacing + i * (rectWidth + spacing) + rectWidth / 2
            )
            .attr("y", 30 + rectHeight / 2)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("fill", "#000")
            .text((d) => d);

        // Enter + Update
        textsEnter
            .merge(texts)
            .transition()
            .duration(500)
            .attr(
                "x",
                (d, i) => spacing + i * (rectWidth + spacing) + rectWidth / 2
            )
            .attr("y", 30 + rectHeight / 2)
            .text((d) => d);
    };

    // Cada vez que el arreglo cambia se actualiza la visualización del svg
    useEffect(() => {
        updateVisualization();
    }, [array]);

    const handlePush = () => {
        const newItem = array.length ? array[array.length - 1] + 1 : 1;
        setArray([...array, newItem]);
    };

    const handlePop = () => {
        setArray(array.slice(0, -1));
    };

    const handleUnshift = () => {
        const newItem = array.length ? array[0] - 1 : 1;
        setArray([newItem, ...array]);
    };

    const handleShift = () => {
        setArray(array.slice(1));
    };

    return (
        <div className="p-4">
            <div className="flex space-x-2 mb-4">
                <button
                    onClick={handlePush}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                    Push
                </button>
                <button
                    onClick={handlePop}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                    Pop
                </button>
                <button
                    onClick={handleUnshift}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                    Unshift
                </button>
                <button
                    onClick={handleShift}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                    Shift
                </button>
            </div>
            <svg ref={svgRef} className="border border-gray-300" />
        </div>
    );
}
