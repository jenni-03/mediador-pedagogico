import { extent, hierarchy, type HierarchyNode, tree } from "d3";
import { HierarchyNodeData } from "../../types";
import { SVG_BINARY_TREE_VALUES } from "../constants/consts";

export function defaultComparator<T>(a: T, b: T): number {
    if (a === b) return 0;

    // null/undefined no son comparables por defecto
    if (a == null || b == null) {
        throw new Error("No se puede comparar null/undefined sin comparador explícito.");
    }

    // Números
    if (typeof a === "number" && typeof b === "number") {
        if (Number.isNaN(a) || Number.isNaN(b)) {
            throw new Error("NaN no es comparable; proporcione un comparador.");
        }
        return a - b;
    }

    // Strings
    if (typeof a === "string" && typeof b === "string") {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    }

    // Date
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime();
    }

    // valueOf “numérico” o “string” como fallback
    const av = a?.valueOf?.();
    const bv = b?.valueOf?.();
    if (typeof av === "number" && typeof bv === "number") return av - bv;
    if (typeof av === "string" && typeof bv === "string")
        return av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });

    // Para objetos arbitrarios exigimos comparador
    throw new Error("Tipo no comparable por defecto. Proporcione un comparador para este tipo.");
}

export function computeSvgTreeMetrics(
    currentNodes: HierarchyNode<HierarchyNodeData<number>>[],
    prevNodes: HierarchyNode<HierarchyNodeData<number>>[],
    margin: { left: number; right: number; top: number; bottom: number },
    sequenceCount: number,
    sequencePadding: number,
    sequenceHeight: number
) {
    // Valores minimos y máximos del árbol en cada eje
    const [minX, maxX] = extent([...prevNodes, ...currentNodes], d => d.x);
    const [minY, maxY] = extent([...prevNodes, ...currentNodes], d => d.y);

    // Ancho y alto requerido por el árbol
    const treeWidth = (maxX! - minX!) + margin.left + margin.right;
    const treeHeight = (maxY! - minY!) + margin.top + margin.bottom;

    // Ancho requerido por la secuencia
    const seqContent = sequenceCount > 0 ? (sequenceCount - 1) * sequencePadding : 0;
    const seqWidth = seqContent + margin.left + margin.right;

    // Ancho y alto del lienzo (en base a la extensión total del árbol)
    const width = Math.max(treeWidth, seqWidth);
    const height = treeHeight;

    // Desplazamientos iniciales para los contenedores (evita que partes queden fuera si las coordenadas son negativas)
    const treeOffset = { x: margin.left - minX!, y: margin.top - minY! };
    const seqOffset = {
        x: margin.left,
        y: treeOffset.y + (maxY! - minY!) + sequencePadding + sequenceHeight
    };

    return {
        width,
        height: height + sequencePadding + sequenceHeight,
        treeOffset,
        seqOffset
    }
}

export const hierarchyFrom = (data: HierarchyNodeData<number>) => {
    const h = hierarchy(data);
    tree<HierarchyNodeData<number>>()
        .nodeSize([SVG_BINARY_TREE_VALUES.NODE_SPACING, SVG_BINARY_TREE_VALUES.LEVEL_SPACING + 15])(h);
    const nodes = h.descendants().filter(d => !d.data.isPlaceholder);
    const links = h.links().reduce<{ sourceId: string, targetId: string }[]>((acc, l) => {
        if (!l.target.data.isPlaceholder) acc.push({ sourceId: l.source.data.id, targetId: l.target.data.id });
        return acc;
    }, []);
    return { root: h, nodes, links };
}