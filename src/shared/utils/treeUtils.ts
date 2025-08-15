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