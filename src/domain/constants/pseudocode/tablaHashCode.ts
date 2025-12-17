import { OperationCode } from "./typesPseudoCode";

export const getTablaHashCode = (): Record<string, OperationCode> => ({
  /* ───────────────── create(n) ─────────────────
   * Constructor Java-like: valida rango y luego inicializa contador, slots y arreglo de listas.
   */
  create: {
    lines: [
      `/**`,
      ` * Constructor de una tabla hash con n slots.`,
      ` * <b>post:</b> numeroDatos = 0 y cada slot contiene una lista vacía.`,
      ` */`,
      `public TablaHash(int {0}){`,
      `    // Validar rango permitido para los slots (1..21)`,
      `    if ({0} < 1 || {0} > 21){`,
      `        throw new IllegalArgumentException("La cantidad de slots debe estar entre 1 y 21.");`,
      `    }`,
      ``,
      `    this.numeroSlots  = {0};`,
      `    this.numeroDatos  = 0;`,
      `    this.informacionEntrada = new ListaCD[this.numeroSlots];`,
      `    inicializarListas();`,
      `}`,
      ``,
      ``,
      `/**`,
      ` * Método auxiliar que inicializa las listas de cada slot.`,
      ` */`,
      `private void inicializarListas(){`,
      `    for (int i = 0; i < informacionEntrada.length; i++){`,
      `        informacionEntrada[i] = new ListaCD();`,
      `    }`,
      `}`,
    ],
    labels: {
      // Firma del constructor (para CREATE_NON_INTEGER)
      CREATE_SIGNATURE: 4,       // public TablaHash(int {0}){

      // Validación de rango
      VALIDATE_RANGE: 6,         // if ({0} < 1 || {0} > 21){
      THROW_RANGE_ERROR: 7,      // throw new IllegalArgumentException...

      // Constructor
      SET_CAP: 10,               // this.numeroSlots  = {0};
      SET_COUNT: 11,             // this.numeroDatos  = 0;
      ALLOC_BUCKETS: 12,         // new ListaCD[this.numeroSlots];
      INIT_BUCKETS: 13,          // inicializarListas();

      // Método auxiliar inicializarListas()
      INIT_LISTS_FOR: 21,        // for (int i = 0; ...
      INIT_LISTS_ASSIGN: 22,     // informacionEntrada[i] = new ListaCD();
    },

    // Planes de error para que el simulador sepa qué líneas resaltar
    errorPlans: {
      // slots no entero → planId: CREATE_NON_INTEGER (hook: DomainError.code)
      CREATE_NON_INTEGER: [
        { lineLabel: "CREATE_SIGNATURE", hold: 600 },
      ],
      // slots fuera de rango [1..21] → INVALID_CAPACITY_RANGE
      INVALID_CAPACITY_RANGE: [
        { lineLabel: "VALIDATE_RANGE", hold: 600 },
        { lineLabel: "THROW_RANGE_ERROR", hold: 800 },
      ],
    },
  },

  /* ───────────────── set(k,v) ─────────────────
   * Versión inspirada en insertar(clave, objeto) de Java:
   * - valida que la tabla exista y que (k,v) sean válidos
   * - calcula índice con hash()
   * - busca nodo existente en el bucket
   * - si existe → update
   * - si no existe → inserta y contador++
   */
  set: {
    lines: [
      `/**`,
      ` * Inserta o actualiza un par clave→valor en la tabla hash.`,
      ` * <b>post:</b> si la clave existe se actualiza el valor,`,
      ` *              de lo contrario se inserta un nuevo nodo y se incrementa el contador.`,
      ` */`,
      `public void set(int {0}, int {1}){`,
      `    // Validar que la tabla esté creada`,
      `    if (this.informacionEntrada == null || this.numeroSlots == 0){`,
      `        throw new IllegalStateException("Primero debes crear la tabla con create(n).");`,
      `    }`,
      ``,
      `    // Validar que clave y valor sean enteros de hasta 4 dígitos`,
      `    if (!esEnteroValido({0}) || !esEnteroValido({1})){`,
      `        throw new IllegalArgumentException("Clave y valor deben ser enteros (≤ 4 dígitos).");`,
      `    }`,
      ``,
      `    int idx = hash({0});`,
      `    Nodo n = buscarNodo(idx, {0});`,
      ``,
      `    if (n != null){`,
      `        n.value = {1};`,
      `    } else {`,
      `        Nodo nuevo = new Nodo({0}, {1});`,
      `        // Si el bucket ya está lleno (máx 5 nodos), no permitimos más colisiones`,
      `        if (buckets[idx].size() >= 5){`,
      `            throw new RuntimeException("Bucket lleno: no se permiten más colisiones en este slot.");`,
      `        }`,
      `        buckets[idx].insertarAlFinal(nuevo);`,
      `        {2}++;`,
      `    }`,
      `}`,
      ``,
      ``,
      `/**`,
      ` * Función hash basada en módulo para dispersar mejor las claves.`,
      ` */`,
      `private int hash(int clave){`,
      `    int hcode = clave % numeroSlots;`,
      `    if (hcode < 0){`,
      `        hcode += numeroSlots;`,
      `    }`,
      `    return hcode;`,
      `}`,
      ``,
      ``,
      `/**`,
      ` * Determina si un entero está dentro del rango permitido (0..9999).`,
      ` */`,
      `private boolean esEnteroValido(int x){`,
      `    return (x >= 0 && x <= 9999);`,
      `}`,
      ``,
      ``,
      `/**`,
      ` * Busca dentro del bucket el nodo cuya clave coincide.`,
      ` */`,
      `private Nodo buscarNodo(int idx, int clave){`,
      `    Lista bucket = buckets[idx];`,
      `    for (int i = 0; i < bucket.size(); i++){`,
      `        Nodo actual = bucket.get(i);`,
      `        if (actual.key == clave){`,
      `            return actual;`,
      `        }`,
      `    }`,
      `    return null;`,
      `}`,
    ],
    labels: {
      // Validación tabla creada
      TABLE_EXISTS_IF: 7,          // if (this.informacionEntrada == null || this.numeroSlots == 0){
      TABLE_EXISTS_THROW: 8,       // throw new IllegalStateException...

      // Validación tipo / rango de (k,v)
      VALIDATE_KEYVAL: 12,         // if (!esEnteroValido({0}) || !esEnteroValido({1})){
      THROW_INVALID_KEYVAL: 13,    // throw new IllegalArgumentException...

      // Método set(...)
      HASH: 16,                    // int idx = hash({0});
      SEARCH_NODE: 17,             // Nodo n = buscarNodo(idx, {0});
      IF_FOUND: 19,                // if (n != null){
      UPDATE_VALUE: 20,            // n.value = {1};
      ELSE_INSERT: 21,             // } else {
      NEW_NODE: 22,                // Nodo nuevo = new Nodo({0}, {1});
      CHECK_BUCKET_FULL: 24,       // if (buckets[idx].size() >= 5){
      THROW_BUCKET_FULL: 25,       // throw new RuntimeException("Bucket lleno...");
      INSERT_NODE: 27,             // buckets[idx].insertarAlFinal(nuevo);
      INCREMENT_COUNT: 28,         // {2}++;

      // hash(int clave)
      HASH_FN_COMPUTE: 37,         // int hcode = ...
      HASH_FN_IF_NEG: 38,          // if (hcode < 0){
      HASH_FN_ADJUST: 39,          // hcode += numeroSlots;
      HASH_FN_RETURN: 41,          // return hcode;

      // buscarNodo(int idx, int clave)
      SEARCH_GET_BUCKET: 57,       // Lista bucket = buckets[idx];
      SEARCH_FOR_LOOP: 58,         // for (int i = 0; ...
      SEARCH_CHECK_KEY: 60,        // if (actual.key == clave){
      SEARCH_RETURN_FOUND: 61,     // return actual;
      SEARCH_RETURN_NULL: 64,      // return null;
    },
    errorPlans: {
      // validateTableExists() → TABLE_NOT_CREATED
      TABLE_NOT_CREATED: [
        { lineLabel: "TABLE_EXISTS_IF", hold: 600 },
        { lineLabel: "TABLE_EXISTS_THROW", hold: 800 },
      ],

      // !Number.isInteger(key) || !Number.isInteger(value)
      INVALID_KEY_OR_VALUE_TYPE: [
        { lineLabel: "VALIDATE_KEYVAL", hold: 600 },
        { lineLabel: "THROW_INVALID_KEYVAL", hold: 800 },
      ],

      // key/value fuera de 0..9999 (KEY_OR_VALUE_TOO_LARGE)
      KEY_OR_VALUE_TOO_LARGE: [
        { lineLabel: "VALIDATE_KEYVAL", hold: 600 },
        { lineLabel: "THROW_INVALID_KEYVAL", hold: 800 },
      ],

      // bucket lleno
      BUCKET_FULL: [
        { lineLabel: "HASH", hold: 400 },
        { lineLabel: "SEARCH_NODE", hold: 400 },
        { lineLabel: "ELSE_INSERT", hold: 400 },
        { lineLabel: "CHECK_BUCKET_FULL", hold: 600 },
        { lineLabel: "THROW_BUCKET_FULL", hold: 800 },
      ],
    },
  },

  /* ───────────────── get(k) ─────────────────
   * Versión inspirada en getObjeto(clave) de Java:
   * - valida que la tabla exista y que la clave sea válida
   * - calcula índice con hash()
   * - busca en el bucket
   * - si no lo encuentra → lanza excepción
   * - si lo encuentra → retorna el valor
   */
  get: {
    lines: [
      `/**`,
      ` * Retorna el valor asociado a la clave dada.`,
      ` */`,
      `public int get(int {0}){`,
      `    // Validar que la tabla esté creada`,
      `    if (this.informacionEntrada == null || this.numeroSlots == 0){`,
      `        throw new IllegalStateException("Primero debes crear la tabla con create(n).");`,
      `    }`,
      ``,
      `    // Validar que la clave sea un entero de hasta 4 dígitos`,
      `    if (!esEnteroValido({0})){`,
      `        throw new IllegalArgumentException("La clave debe ser un entero (≤ 4 dígitos).");`,
      `    }`,
      ``,
      `    int idx = hash({0});`,
      `    Nodo n = buscarNodo(idx, {0});`,
      `    if (n == null){`,
      `        throw new RuntimeException("Clave no encontrada");`,
      `    }`,
      `    return n.value;`,
      `}`,
      `\n`,
      `\n`,
      `/**`,
      ` * Función hash basada en módulo para dispersar mejor las claves.`,
      ` */`,
      `private int hash(int clave){`,
      `    int hcode = clave % numeroSlots;`,
      `    if (hcode < 0){`,
      `        hcode += numeroSlots;`,
      `    }`,
      `    return hcode;`,
      `}`,
      `\n`,
      `\n`,
      `/**`,
      ` * Busca dentro del bucket el nodo cuya clave coincide.`,
      ` */`,
      `private Nodo buscarNodo(int idx, int clave){`,
      `    Lista bucket = buckets[idx];`,
      `    for (int i = 0; i < bucket.size(); i++){`,
      `        Nodo actual = bucket.get(i);`,
      `        if (actual.key == clave){`,
      `            return actual;`,
      `        }`,
      `    }`,
      `    return null;`,
      `}`,
    ],
    labels: {
      // Validación tabla creada
      TABLE_EXISTS_IF: 5,         // if (this.informacionEntrada == null || this.numeroSlots == 0){
      TABLE_EXISTS_THROW: 6,      // throw new IllegalStateException(...);

      // Validación de clave
      VALIDATE_KEY: 10,           // if (!esEnteroValido({0})){
      THROW_INVALID_KEY: 11,      // throw new IllegalArgumentException(...);

      // Método get(...)
      HASH: 14,                   // int idx = hash({0});
      SEARCH_NODE: 15,            // Nodo n = buscarNodo(idx, {0});
      IF_NOT_FOUND: 16,           // if (n == null){
      THROW_NOT_FOUND: 17,        // throw new RuntimeException("Clave no encontrada");
      RETURN_VALUE: 19,           // return n.value;

      // hash(int clave)
      HASH_FN_COMPUTE: 27,        // int hcode = clave % numeroSlots;
      HASH_FN_IF_NEG: 28,         // if (hcode < 0){
      HASH_FN_ADJUST: 29,         // hcode += numeroSlots;
      HASH_FN_RETURN: 31,         // return hcode;

      // buscarNodo(int idx, int clave)
      SEARCH_GET_BUCKET: 39,      // Lista bucket = buckets[idx];
      SEARCH_FOR_LOOP: 40,        // for (int i = 0; i < bucket.size(); i++){
      SEARCH_CHECK_KEY: 42,       // if (actual.key == clave){
      SEARCH_RETURN_FOUND: 43,    // return actual;
      SEARCH_RETURN_NULL: 46,     // return null;
    },
    errorPlans: {
      TABLE_NOT_CREATED: [
        { lineLabel: "TABLE_EXISTS_IF", hold: 600 },
        { lineLabel: "TABLE_EXISTS_THROW", hold: 800 },
      ],
      // type/rango inválido → INVALID_KEY_TYPE
      INVALID_KEY_TYPE: [
        { lineLabel: "VALIDATE_KEY", hold: 600 },
        { lineLabel: "THROW_INVALID_KEY", hold: 800 },
      ],
      KEY_NOT_FOUND: [
        { lineLabel: "IF_NOT_FOUND", hold: 600 },
        { lineLabel: "THROW_NOT_FOUND", hold: 800 },
      ],
    },
  },

 /* ───────────────── delete(k) ─────────────────
 * Inspirado en eliminar(clave) de Java:
 * - valida que la tabla exista y que la clave sea válida
 * - calcula índice con hash()
 * - obtiene el bucket
 * - intenta eliminar por clave mediante un método auxiliar
 * - si no la encuentra → lanza excepción
 * - si la encuentra → decrementa contador
 */
delete: {
  lines: [
    `/**`,
    ` * Elimina la entrada asociada a la clave dada.`,
    ` * <b>post:</b> si existía la clave se elimina el nodo y se decrementa el contador.`,
    ` */`,
    `public void delete(int {0}){`,
    `    // Validar que la tabla esté creada`,
    `    if (this.informacionEntrada == null || this.numeroSlots == 0){`,
    `        throw new IllegalStateException("Primero debes crear la tabla con create(n).");`,
    `    }`,
    ``,
    `    // Validar que la clave sea un entero de hasta 4 dígitos`,
    `    if (!esEnteroValido({0})){`,
    `        throw new IllegalArgumentException("La clave debe ser un entero (≤ 4 dígitos).");`,
    `    }`,
    ``,
    `    int idx = hash({0});`,
    `    Lista bucket = buckets[idx];`,
    `    boolean eliminado = eliminarEnBucket(bucket, {0});`,
    `    if (!eliminado){`,
    `        throw new RuntimeException("Clave no encontrada");`,
    `    }`,
    `    {1}--;                              // contador--`,
    `}`,
    `\n`,
    `\n`,
    `/**`,
    ` * Función hash basada en módulo para dispersar mejor las claves.`,
    ` */`,
    `private int hash(int clave){`,
    `    int hcode = clave % numeroSlots;`,
    `    if (hcode < 0){`,
    `        hcode += numeroSlots;`,
    `    }`,
    `    return hcode;`,
    `}`,
    ``,
    ``,
    `/**`,
    ` * Elimina dentro de un bucket el nodo cuya clave coincide.`,
    ` */`,
    `private boolean eliminarEnBucket(Lista bucket, int clave){`,
    `    for (int i = 0; i < bucket.size(); i++){`,
    `        Nodo actual = bucket.get(i);`,
    `        if (actual.key == clave){`,
    `            bucket.eliminarEn(i);`,
    `            return true;`,
    `        }`,
    `    }`,
    `    return false;`,
    `}`,
  ],
  labels: {
    // Validación tabla creada
    TABLE_EXISTS_IF: 6,        // if (this.informacionEntrada == null || this.numeroSlots == 0){
    TABLE_EXISTS_THROW: 7,     // throw new IllegalStateException(...);

    // Validación de clave
    VALIDATE_KEY: 11,          // if (!esEnteroValido({0})){
    THROW_INVALID_KEY: 12,     // throw new IllegalArgumentException(...);

    // Método delete(...)
    HASH: 15,                  // int idx = hash({0});
    GET_BUCKET: 16,            // Lista bucket = buckets[idx];
    DELETE_NODE: 17,           // boolean eliminado = eliminarEnBucket(bucket, {0});
    IF_NOT_FOUND: 18,          // if (!eliminado){
    THROW_NOT_FOUND: 19,       // throw new RuntimeException("Clave no encontrada");
    DECREMENT_COUNT: 21,       // {1}--;

    // hash(int clave)
    HASH_FN_COMPUTE: 29,       // int hcode = clave % numeroSlots;
    HASH_FN_IF_NEG: 30,        // if (hcode < 0){
    HASH_FN_ADJUST: 31,        // hcode += numeroSlots;
    HASH_FN_RETURN: 33,        // return hcode;

    // eliminarEnBucket(...)  (opcional, por si luego quieres animarlo)
    DELETE_HELPER_FOR: 41,         // for (int i = 0; i < bucket.size(); i++){
    DELETE_HELPER_CHECK_KEY: 43,   // if (actual.key == clave){
    DELETE_HELPER_REMOVE: 44,      // bucket.eliminarEn(i);
    DELETE_HELPER_RETURN_TRUE: 45, // return true;
    DELETE_HELPER_RETURN_FALSE: 48 // return false;
  },
  errorPlans: {
    TABLE_NOT_CREATED: [
      { lineLabel: "TABLE_EXISTS_IF", hold: 600 },
      { lineLabel: "TABLE_EXISTS_THROW", hold: 800 },
    ],
    INVALID_KEY_TYPE: [
      { lineLabel: "VALIDATE_KEY", hold: 600 },
      { lineLabel: "THROW_INVALID_KEY", hold: 800 },
    ],
    KEY_NOT_FOUND: [
      { lineLabel: "GET_BUCKET", hold: 600 },
      { lineLabel: "DELETE_NODE", hold: 600 },
      { lineLabel: "IF_NOT_FOUND", hold: 600 },
      { lineLabel: "THROW_NOT_FOUND", hold: 800 },
    ],
  },
},

  /* ───────────────── clean() ─────────────────
   * Similar a eliminarTodo(): limpia estructuras internas
   * y reinicia el contador.
   */
  clean: {
    lines: [
      `/**`,
      ` * Vacía por completo la tabla hash.`,
      ` * <b>post:</b> numeroDatos = 0 y todos los buckets quedan sin nodos.`,
      ` */`,
      `public void clean(){`,
      `    limpiarBuckets();`,
      `    numeroDatos = 0;`,
      `}`,
      `\n`,
      `\n`,
      `/**`,
      ` * Método auxiliar que borra el contenido de todos los slots.`,
      ` */`,
      `private void limpiarBuckets(){`,
      `    for (int i = 0; i < informacionEntrada.length; i++){`,
      `        informacionEntrada[i] = null;`,
      `    }`,
      `}`,
    ],
    labels: {
      // Método clean()
      CLEAR_BUCKETS: 5,     // limpiarBuckets();
      RESET_COUNT: 6,       // numeroDatos = 0;

      // limpiarBuckets()
      CLEAR_FOR: 14,        // for (int i = 0; ...
      CLEAR_ASSIGN: 15,     // informacionEntrada[i] = null;
    },
  },
});
