export const memory_address = {
    secuencia: {
        create: `
            INICIO
                // Definir variables
                Definir vectorMemoria como un arreglo de tamaño n
                Definir i como entero

                // Recorrer todas las posiciones del vector
                PARA i ← 0 HASTA n - 1 HACER
                    vectorMemoria[i] ← direccionBase + (i * tamanioNodo)
                FIN PARA
            FIN
        `,
    },
    cola: {
        create: `
            INICIO         
                // Asignar direcciones de memoria a cada posición
                PARA i ← 0 HASTA n-1 HACER
                    vectorMemoria[i] ← direccionBase + (i * tamanioNodo)
                FIN PARA
            FIN
        `,
    }
}