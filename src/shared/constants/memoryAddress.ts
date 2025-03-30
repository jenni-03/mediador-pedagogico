export const memory_address = {
    secuencia: {
        create: `
            INICIO         
                // Asignar direcciones de memoria a cada posición
                PARA i ← 0 HASTA n-1 HACER
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