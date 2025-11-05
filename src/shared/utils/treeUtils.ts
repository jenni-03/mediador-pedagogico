import { extent, hierarchy, type HierarchyNode, tree } from "d3";
import { HierarchyNodeData, TreeLinkData } from "../../types";

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

/**
 * Función que calcula las métricas necesarias para definir el tamaño del SVG que contendrá el árbol y la secuencia de recorrido.
 * @param currentNodes Nodos actuales del árbol.
 * @param prevNodes Nodos previos del árbol.
 * @param margin Márgenes a aplicar alrededor del árbol y la secuencia.
 * @param sequenceCount Número de elementos en la secuencia.
 * @param sequencePadding Espaciado entre elementos de la secuencia.
 * @param sequenceHeight Altura de cada elemento de la secuencia.
 * @param extraTreeWidth Ancho extra a añadir al árbol.
 * @returns Objeto que contiene las métricas calculadas del árbol para el SVG.
 */
export function computeSvgTreeMetrics(
    currentNodes: HierarchyNode<HierarchyNodeData<number>>[],
    prevNodes: HierarchyNode<HierarchyNodeData<number>>[],
    margin: { left: number; right: number; top: number; bottom: number },
    sequenceCount: number,
    sequencePadding: number,
    sequenceHeight: number,
    extraTreeWidth: number = 0
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
    const width = Math.max(treeWidth, seqWidth) + extraTreeWidth;
    const height = treeHeight + sequencePadding + sequenceHeight;

    // Desplazamientos iniciales para los contenedores (evita que partes queden fuera si las coordenadas son negativas)
    const treeOffset = { x: margin.left - minX!, y: margin.top - minY! };
    const seqOffset = {
        x: margin.left,
        y: treeOffset.y + (maxY! - minY!) + sequencePadding + sequenceHeight
    };

    return {
        width,
        height,
        treeOffset,
        seqOffset
    }
}

/**
 * Función que genera una jerarquía a partir de los datos proporcionados.
 * @param data Datos de entrada para construir la jerarquía.
 * @param node_spacing Distancia entre nodos en el mismo nivel.
 * @param level_spacing Distancia entre niveles de nodos.
 * @returns Objeto que contiene la raíz de la jerarquía, los nodos y los enlaces.
 */
export const hierarchyFrom = (data: HierarchyNodeData<number>, node_spacing: number, level_spacing: number) => {
    const h = hierarchy(data);
    tree<HierarchyNodeData<number>>()
        .nodeSize([node_spacing, level_spacing])(h);
    const nodes = h.descendants().filter(d => !d.data.isPlaceholder);
    const links = h.links().reduce<TreeLinkData[]>((acc, l) => {
        if (!l.target.data.isPlaceholder) acc.push({ sourceId: l.source.data.id, targetId: l.target.data.id });
        return acc;
    }, []);
    return { root: h, nodes, links };
}

/**
 * Función que genera una ruta SVG para una curva entre 2 puntos.
 * @param s Coordenadas del punto de partida.
 * @param t Coordenadas del punto de destino.
 * @param r Radio vertical utilizado para desplazar las posiciones de inicio y fin.
 * @returns Cadena de ruta SVG que representa la línea curva.
 */
export function curvedPath(
    s: { x: number; y: number },
    t: { x: number; y: number },
    r: number
) {
    const y1 = s.y + r;
    const y2 = t.y - r;
    const midY = (y1 + y2) / 2;
    return `M${s.x},${y1} C ${s.x},${midY} ${t.x},${midY} ${t.x},${y2}`;
}

/**
 * Función que genera una ruta SVG para una línea recta entre 2 puntos con un desplazamiento vertical.
 * @param s Coordenadas del punto de partida.
 * @param t Coordenadas del punto de destino.
 * @param r Desplazamiento vertical a aplicar a las coordenadas de inicio y fin.
 * @returns Cadena de ruta SVG que representa la línea recta.
 */
export function straightPath(
    s: { x: number; y: number },
    t: { x: number; y: number },
    r: number
) {
    return `M${s.x},${s.y + r} L${t.x},${t.y - r}`;
}