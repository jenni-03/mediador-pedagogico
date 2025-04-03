export const operations_pseudoCode: Record<string, any> = {
    secuencia: {
        create: `
            función constructor(n):
                si n <= 0 entonces
                    vector ← arreglo vacío
                    cant ← 0
                    retornar
                fin si

                vector ← nuevo arreglo de tamaño n
                para i desde 0 hasta n - 1 hacer:
                    vector[i] ← null
                fin para
                cant ← 0
            fin función
        `,
        insertlast: `
            función insertar(elem):
                si cant es mayor o igual a la longitud del vector entonces
                    lanzar error "No hay espacio para insertar el elemento {elem}"
                fin si

                vector[cant] ← elem
                cant ← cant + 1
            fin función
        `,
        update: `
            función set(i, nuevo):
                si i < 0 o i >= cant entonces
                    lanzar error "Índice fuera de rango!"
                fin si
                si el vector contiene nuevo entonces
                    lanzar error "El elemento {nuevo} ya está en la secuencia"
                fin si
                vector[i] ← nuevo
            fin función
        `,
        delete: `
            función eliminar(elem):
                indice ← getIndice(elem)
                si indice es igual a -1 entonces
                    lanzar error "El elemento {elem} no está en la secuencia"
                fin si

                // Mover los elementos hacia la izquierda
                para i desde indice hasta cant - 2 hacer:
                    vector[i] ← vector[i + 1]
                fin para

                // Reducir cantidad y limpiar el último espacio
                vector[cant - 1] ← null
                cant ← cant - 1
            fin función
        `,
        search: `
            función esta(elem):
                si el vector contiene elem entonces
                    retornar true
                fin si
                lanzar error "El elemento {elem} no se encontró en la secuencia"
            fin función
        `,
        clean: `
            función vaciar():
                para i ← 0 hasta cant - 1 hacer
                    vector[i] ← nulo
                fin para
                cant ← 0
            fin función
        `
    },
    cola: {
        create: `
            función constructor(n):
                si n <= 0 entonces
                    vector ← arreglo vacío
                    cant ← 0
                    retornar
                fin si

                vector ← nuevo arreglo de tamaño n
                para i desde 0 hasta n - 1 hacer:
                    vector[i] ← null
                fin para
                cant ← 0
            fin función
        `,
        insert_last: `
            función insertar(elem):
                si cant es mayor o igual a la longitud del vector entonces
                    lanzar error "No hay espacio para insertar el elemento {elem}"
                fin si

                vector[cant] ← elem
                cant ← cant + 1
            fin función
        `,
        update: `
            función set(i, nuevo):
                si i < 0 o i >= cant entonces
                    lanzar error "Índice fuera de rango!"
                fin si
                si el vector contiene nuevo entonces
                    lanzar error "El elemento {nuevo} ya está en la secuencia"
                fin si
                vector[i] ← nuevo
            fin función
        `,
        delete: `
            función eliminar(elem):
                indice ← getIndice(elem)
                si indice es igual a -1 entonces
                    lanzar error "El elemento {elem} no está en la secuencia"
                fin si

                // Mover los elementos hacia la izquierda
                para i desde indice hasta cant - 2 hacer:
                    vector[i] ← vector[i + 1]
                fin para

                // Reducir cantidad y limpiar el último espacio
                vector[cant - 1] ← null
                cant ← cant - 1
            fin función
        `,
        search: `
            función esta(elem):
                si el vector contiene elem entonces
                    retornar true
                fin si
                lanzar error "El elemento {elem} no se encontró en la secuencia"
            fin función
        `,
        clean: `
            función vaciar():
                vector ← arreglo vacío
                cant ← 0
            fin función
        `
    }
}