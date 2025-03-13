import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface MemoryMapProps {
    memoryData: Record<string, Record<string, any>> | null;
}

export function MemoryMapComponent({ memoryData }: MemoryMapProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!memoryData || !svgRef.current) return;

        const width = 500;  // Ajusta el tamaño del mapa
        const height = 300;
        
        const nodes: any[] = [];
        const links: any[] = [];

        Object.entries(memoryData).forEach(([type, addresses]) => {
            Object.entries(addresses).forEach(([address, value]) => {
                nodes.push({ id: address, type, value });

                if (Array.isArray(value)) {
                    value.forEach((ref: string) => {
                        links.push({ source: address, target: ref });
                    });
                }
            });
        });

        const svg = d3.select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", "100%")
            .attr("height", "100%")
            .style("background", "#111");

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => (d as any).id).distance(50))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide(30));

        const link = svg.append("g")
            .attr("stroke", "#FFD700")
            .attr("stroke-opacity", 0.8)
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke-width", 2);

        const node = svg.append("g")
            .selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("r", 12)
            .attr("fill", d => d.type === "array" ? "blue" : "green")
            .call(d3.drag<SVGCircleElement, any>()
                .on("start", (event, d: any) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d: any) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event, d: any) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                })
            );

        const labels = svg.append("g")
            .selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .attr("dy", -15)
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", "10px")
            .text(d => d.id);

        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as any).x)
                .attr("y1", d => (d.source as any).y)
                .attr("x2", d => (d.target as any).x)
                .attr("y2", d => (d.target as any).y);

            node
                .attr("cx", d => Math.max(15, Math.min(width - 15, (d as any).x)))
                .attr("cy", d => Math.max(15, Math.min(height - 15, (d as any).y)));

            labels
                .attr("x", d => Math.max(15, Math.min(width - 15, (d as any).x)))
                .attr("y", d => Math.max(15, Math.min(height - 15, (d as any).y)));
        });

        return () => {
            svg.selectAll("*").remove();
        };

    }, [memoryData]);

    return <svg ref={svgRef}></svg>;
}
