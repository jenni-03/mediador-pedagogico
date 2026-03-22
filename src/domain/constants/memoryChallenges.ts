export type MemoryChallenge = {
  id: number;
  title: string;
  description: string;
  hint: string;
  /** Panel que el estudiante debería observar */
  watchPanel?: string;
  /** Regex para detectar éxito en los logs */
  successPattern: RegExp;
};

export const memoryChallenges: MemoryChallenge[] = [
  {
    id: 1,
    title: "Declara un entero",
    description: "Crea una variable de tipo int y asígnale un valor.",
    hint: "int x = 42;",
    watchPanel: "Stack",
    successPattern: /int.*compatible|Almacenado/i,
  },
  {
    id: 2,
    title: "Declara un boolean",
    description: "Crea una variable booleana con valor true o false.",
    hint: "boolean activo = true;",
    watchPanel: "Stack",
    successPattern: /boolean.*compatible|Almacenado/i,
  },
  {
    id: 3,
    title: "Crea un String",
    description: "Declara un String. Observa cómo aparece en el Heap (no en el Stack).",
    hint: 'String s = "hola";',
    watchPanel: "Heap",
    successPattern: /String.*compatible|Almacenado/i,
  },
  {
    id: 4,
    title: "Crea un arreglo",
    description: "Crea un arreglo de enteros con valores. Mira el header y los datos en el Heap.",
    hint: "int[] arr = new int[]{1,2,3};",
    watchPanel: "Heap + RAM",
    successPattern: /arreglo.*válidos|array.*Almacenado/i,
  },
  {
    id: 5,
    title: "Modifica un elemento",
    description: "Cambia el valor del primer elemento del arreglo.",
    hint: "arr[0] = 99;",
    watchPanel: "RAM",
    successPattern: /arr\[0\]|asignado|Almacenado/i,
  },
  {
    id: 6,
    title: "Define una clase",
    description: "Define un tipo personalizado con al menos 2 campos.",
    hint: "class Persona(int id, String nombre);",
    watchPanel: "",
    successPattern: /class.*registrad|definid/i,
  },
  {
    id: 7,
    title: "Instancia un objeto",
    description: "Crea una instancia de la clase que definiste. Observa el Heap.",
    hint: 'Persona p = new Persona(7, "Ana");',
    watchPanel: "Heap",
    successPattern: /Persona.*compatible|instanci|Almacenado/i,
  },
  {
    id: 8,
    title: "Limpia la memoria",
    description: "Ejecuta el comando clear para reiniciar toda la memoria.",
    hint: "clear",
    watchPanel: "Todos",
    successPattern: /clear|limpi|reinici/i,
  },
];
