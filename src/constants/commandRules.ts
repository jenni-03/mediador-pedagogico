// Reglas de comandos para cada estructura de datos
export const commandRules: Record<string, (parts: string[]) => boolean> = {
    secuencia: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "insert":
            case "delete":
            case "create":
            case "search":
                return parts.length === 2 && !isNaN(Number(parts[1])); // Válida que solo venga el comando y el elemento, y además que el elemento sea un número
            case "update":
                return parts.length === 3 && !isNaN(Number(parts[1])) && !isNaN(Number(parts[2])); // Válida que venga el comando y dos elementos, y que los dos elementos sean números
            case "clean":
                return parts.length === 1;
            default:
                return false;
        }
    },
    pila: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "push":
                return parts.length === 2 && !isNaN(Number(parts[1])); // Solo permite agregar números
            case "pop":
            case "top":
            case "clean":
                return parts.length === 1;
            default:
                return false;
        }
    },
    cola: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "enqueue":
                return parts.length === 2 && !isNaN(Number(parts[1])); // Agrega elementos a la cola
            case "dequeue":
            case "front":
            case "rear":
            case "clean":
                return parts.length === 1;
            default:
                return false;
        }
    },
};