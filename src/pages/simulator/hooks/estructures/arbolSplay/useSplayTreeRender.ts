import { useRef } from "react";
import { BaseQueryOperations, HierarchyNodeData } from "../../../../../types";

export function useSplayTreeRender(
    treeData: HierarchyNodeData<number> | null,
    query: BaseQueryOperations<"arbol_splay">,
    resetQueryValues: () => void
) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    return { svgRef };
}