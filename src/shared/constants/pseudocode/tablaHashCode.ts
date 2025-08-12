import { OperationCode } from "./typesPseudoCode";

export const getTablaHashCode = (): OperationCode => ({
create: [
            `/**`,
            ` * Constructor de una tabla hash con n slots.`,
            ` * <b>post:</b> se crean los buckets vacíos y se inicia el contador en 0.`,
            ` */`,
            `public TablaHash(int n){`,
            `    this.capacidad   = n;`,
            `    this.contador    = 0;`,
            `    this.buckets     = new Lista[n];     // arreglo de listas`,
            `    inicializarBuckets();`,
            `}`,
        ],

        /* ───────────────── set(k,v) ───────────────── */
        set: [
            `/**`,
            ` * Inserta o actualiza un par clave→valor.`,
            ` * <b>post:</b> si la clave existe se actualiza el valor,`,
            ` *            si no existe se agrega un nuevo nodo.`,
            ` */`,
            `public void put(int key,int value){`,
            `    int idx = hash(key);`,
            `    Nodo n = buscarNodo(idx,key);`,
            `    if(n != null) n.value = value;       // update`,
            `    else {`,
            `        buckets[idx].agregar(new Nodo(key,value));`,
            `        contador++;`,
            `    }`,
            `}`,
        ],

        /* ───────────────── get(k) ───────────────── */
        get: [
            `/**`,
            ` * Retorna el valor asociado a la clave o lanza excepción.`,
            ` */`,
            `public int get(int key){`,
            `    Nodo n = buscarNodo(hash(key),key);`,
            `    if(n==null) throw new Error("Clave no encontrada");`,
            `    return n.value;`,
            `}`,
        ],

        /* ───────────────── remove(k) ───────────────── */
        delete: [
            `/**`,
            ` * Elimina el nodo con la clave dada.`,
            ` * <b>post:</b> contador se decrementa si la clave existía.`,
            ` */`,
            `public void remove(int key){`,
            `    Lista bucket = buckets[hash(key)];`,
            `    if(bucket.eliminar(key)) contador--;`,
            `}`,
        ],

        /* ───────────────── clean() ───────────────── */
        clean: [
            `/**`,
            ` * Vacía por completo la tabla hash.`,
            ` * <b>post:</b> contador = 0 y todos los buckets quedan vacíos.`,
            ` */`,
            `public void clean(){`,
            `    limpiarBuckets();`,
            `    contador = 0;`,
            `}`,
        ],
});
