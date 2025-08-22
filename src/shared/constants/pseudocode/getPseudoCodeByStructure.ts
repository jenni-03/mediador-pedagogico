import { OperationCode } from "./typesPseudoCode";
import { getSecuenciaCode } from "./secuenciaCode";
import { getListaSimplementeEnlazadaCode } from "./listaSimplementeEnlazadaCode";
import { getListaDoblementeEnlazadaCode } from "./listDoblementeEnlazadaCode";
import { getListaCircularSimplementeEnlazadaCode } from "./listaCircularSimplementeEnlazadaCode";
import { getListaCircularDoblementeEnlazadaCode } from "./listaCircularDoblementeEnlazadaCode";
import { getPilaCode } from "./pilaCode";
import { getColaCode } from "./colaCode";
import { getColaPrioridadCode } from "./colaPrioridadCode";
import { getTablaHashCode } from "./tablaHashCode";
import { getArbolBinarioCode } from "./arbolBinarioCode";
import { getArbolAVLCode } from "./arbolAVLCode";
import { getArbolRNCode } from "./arbolRNCode";

// Mapa de funciones para cargar operaciones según estructura
const pseudoCodeLoaders: Record<string, () => OperationCode> = {
  secuencia: getSecuenciaCode,
  lista_simplemente_enlazada: getListaSimplementeEnlazadaCode,
  lista_doblemente_enlazada: getListaDoblementeEnlazadaCode,
  lista_circular_simplemente_enlazada: getListaCircularSimplementeEnlazadaCode,
  lista_circular_doblemente_enlazada: getListaCircularDoblementeEnlazadaCode,
  pila: getPilaCode,
  cola: getColaCode,
  "cola de prioridad": getColaPrioridadCode,
  tabla_hash: getTablaHashCode,
  arbol_binario: getArbolBinarioCode,
  arbol_avl: getArbolAVLCode,
  arbol_rojinegro: getArbolRNCode,
};

// Devuelve el pseudocódigo correspondiente, o {} si no existe
export const getPseudoCodeByStructure = (structure: string): OperationCode => {
  const loader = pseudoCodeLoaders[structure];
  return loader ? loader() : {};
};

// Alias export para mantener compatibilidad con imports existentes
export const operationsCode = pseudoCodeLoaders;
