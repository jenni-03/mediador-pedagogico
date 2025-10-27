import { OperationCode } from "./typesPseudoCode";

export const getTablaHashCode = (): OperationCode => ({
  create: [
    `/**`,
    ` * Constructor de una tabla hash con n slots.`,
    ` * <b>post:</b> se crean los buckets vacíos y se inicia el contador en 0.`,
    ` */`,
    `public TablaHash(int {0}){`,
    `    this.capacidad   = {0};`,
    `    this.contador    = 0;`,
    `    this.buckets     = new Lista[{0}];     // arreglo de listas`,
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
    `public void put(int {0},int {1}){`,
    `    int idx = hash({0});`,
    `    Nodo n = buscarNodo(idx,{0});`,
    `    if(n != null) n.{1} = {1};       // update`,
    `    else {`,
    `        buckets[idx].agregar(new Nodo({0},{1}));`,
    `        {2}++;`,
    `    }`,
    `}`,
  ],

  /* ───────────────── get(k) ───────────────── */
  get: [
    `/**`,
    ` * Retorna el valor asociado a la clave o lanza excepción.`,
    ` */`,
    `public int get(int {0}){`,
    `    Nodo n = buscarNodo(hash({0}),{0});`,
    `    if(n==null) throw new RuntimeException("Clave no encontrada");`,
    `    return n.value;`,
    `}`,
  ],

  /* ───────────────── remove(k) ───────────────── */
  delete: [
    `/**`,
    ` * Elimina el nodo con la clave dada.`,
    ` * <b>post:</b> contador se decrementa si la clave existía.`,
    ` */`,
    `public void remove(int {0}){`,
    `    Lista bucket = buckets[hash({0})];`,
    `    if(bucket.eliminar({0})) {1}--;`,
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
