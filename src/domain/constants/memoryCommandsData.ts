export type MemoryCommandEntry = {
  title: string;
  description: string;
  estructura: string;
  ejemplo: string;
  autoCommand: string;
};

export type MemoryCommandCategory = {
  key: string;
  label: string;
  icon: string;
  commands: MemoryCommandEntry[];
};

export const memoryCommandCategories: MemoryCommandCategory[] = [
  {
    key: "primitivos",
    label: "Primitivos",
    icon: "🔢",
    commands: [
      {
        title: "int",
        description:
          "Declara una variable entera de 4 bytes en el Stack. El valor se almacena directamente en la RAM.",
        estructura: "int nombre = valor;",
        ejemplo: "int edad = 25;",
        autoCommand: "int a = 10;",
      },
      {
        title: "double",
        description:
          "Declara una variable de punto flotante de 8 bytes (doble precisión IEEE-754).",
        estructura: "double nombre = valor;",
        ejemplo: "double precio = 9.99;",
        autoCommand: "double pi = 3.14;",
      },
      {
        title: "boolean",
        description:
          "Declara una variable booleana de 1 byte. Solo puede ser true o false.",
        estructura: "boolean nombre = valor;",
        ejemplo: "boolean activo = true;",
        autoCommand: "boolean flag = true;",
      },
      {
        title: "char",
        description:
          "Declara un carácter de 2 bytes (UTF-16). Se escribe entre comillas simples.",
        estructura: "char nombre = 'valor';",
        ejemplo: "char inicial = 'A';",
        autoCommand: "char letra = 'A';",
      },
      {
        title: "long",
        description:
          "Declara un entero largo de 8 bytes. Útil para valores grandes.",
        estructura: "long nombre = valor;",
        ejemplo: "long poblacion = 8000000;",
        autoCommand: "long big = 999999;",
      },
      {
        title: "byte",
        description:
          "Declara un entero de 1 byte. Rango: -128 a 127.",
        estructura: "byte nombre = valor;",
        ejemplo: "byte nivel = 5;",
        autoCommand: "byte b = 127;",
      },
    ],
  },
  {
    key: "strings",
    label: "Strings",
    icon: "📝",
    commands: [
      {
        title: "String",
        description:
          "Crea un String en el Heap. En el Stack se guarda una referencia (puntero) que apunta al objeto String en el Heap. Cada carácter ocupa 2 bytes (UTF-16).",
        estructura: 'String nombre = "texto";',
        ejemplo: 'String saludo = "Hola mundo";',
        autoCommand: 'String s = "hola";',
      },
      {
        title: "Reasignar String",
        description:
          "Reasigna un String existente. Se crea un nuevo objeto en el Heap y la referencia en el Stack se actualiza.",
        estructura: 'nombre = "nuevo texto";',
        ejemplo: 's = "adios";',
        autoCommand: 's = "mundo";',
      },
    ],
  },
  {
    key: "arrays",
    label: "Arrays",
    icon: "📊",
    commands: [
      {
        title: "Array con valores",
        description:
          "Crea un arreglo con valores iniciales. En el Stack se guarda la referencia; en el Heap se almacena un header (tipo y tamaño) + los datos.",
        estructura: "tipo[] nombre = new tipo[]{val1, val2, ...};",
        ejemplo: "int[] notas = new int[]{85, 90, 78};",
        autoCommand: "int[] arr = new int[]{1,2,3};",
      },
      {
        title: "Array vacío",
        description:
          "Crea un arreglo de tamaño fijo con valores por defecto (0 para int). El Heap reserva espacio para todos los elementos.",
        estructura: "tipo[] nombre = new tipo[tamaño];",
        ejemplo: "int[] datos = new int[5];",
        autoCommand: "int[] vacio = new int[4];",
      },
      {
        title: "Modificar elemento",
        description:
          "Cambia el valor de un elemento del arreglo en la posición indicada. Modifica directamente los bytes en la RAM.",
        estructura: "nombre[índice] = nuevoValor;",
        ejemplo: "arr[0] = 99;",
        autoCommand: "arr[0] = 99;",
      },
    ],
  },
  {
    key: "objetos",
    label: "Clases y Objetos",
    icon: "🏗️",
    commands: [
      {
        title: "Definir clase",
        description:
          "Define un tipo personalizado con campos. No reserva memoria todavía — solo registra la estructura para usarla después.",
        estructura: "class Nombre(tipo campo1, tipo campo2, ...);",
        ejemplo: "class Punto(int x, int y);",
        autoCommand: "class Persona(int id, String nombre);",
      },
      {
        title: "Crear objeto",
        description:
          "Instancia un objeto de la clase definida. En el Heap se almacena un header + los campos. En el Stack queda la referencia.",
        estructura: 'Clase nombre = new Clase(val1, val2, ...);',
        ejemplo: 'Persona p = new Persona(1, "Ana");',
        autoCommand: 'Persona p = new Persona(7, "Ana");',
      },
      {
        title: "Modificar campo",
        description:
          "Cambia el valor de un campo del objeto. Si el campo es primitivo se modifica in-place; si es String se crea un nuevo objeto.",
        estructura: "nombre.campo = nuevoValor;",
        ejemplo: "p.id = 10;",
        autoCommand: "p.id = 10;",
      },
    ],
  },
  {
    key: "especial",
    label: "Especial",
    icon: "🧹",
    commands: [
      {
        title: "Limpiar memoria",
        description:
          "Borra toda la memoria simulada: stack, heap y RAM vuelven al estado inicial. Como reiniciar el programa.",
        estructura: "clear",
        ejemplo: "clear",
        autoCommand: "clear",
      },
    ],
  },
];
