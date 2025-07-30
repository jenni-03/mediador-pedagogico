import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";
import {
  ComplexityArbolRojinegro,
  ComplexityArbolBinarioBusqueda,
  ComplexityArbolBinario,
  ComplexityCola,
  ComplexityColaPrioridad,
  ComplexityListaSimple,
  ComplexityPila,
  ComplexitySecuencia,
  ComplexityTablaHash,
  ComplexityListaDoble,
  ComplexityListaCSimple,
  ComplexityListaCDoble,
  ComplexityArbolAVL,
} from "./concepts";

// Mapea los nombres a sus respectivos componentes
const componentMap: Record<string, React.FC> = {
  Secuencia: ComplexitySecuencia, // Si nombre = "Secuencia", renderiza <ComplexitySecuencia />
  Cola: ComplexityCola,
  "Cola de Prioridad": ComplexityColaPrioridad,
  "Lista Simplemente Enlazada": ComplexityListaSimple,
  "Árbol Binario": ComplexityArbolBinario,
  Pila: ComplexityPila,
  tabla_hash: ComplexityTablaHash,
  "Lista Doblemente Enlazada": ComplexityListaDoble,
  "Lista Circular Simplemente Enlazada": ComplexityListaCSimple,
  "Lista Circular Doblemente Enlazada": ComplexityListaCDoble,
  "Árbol AVL": ComplexityArbolAVL,
  "Árbol Binario de Búsqueda": ComplexityArbolBinarioBusqueda,
  "Árbol RojiNegro": ComplexityArbolRojinegro,
};

export function Complexity() {
  const route = getRouteApi("/conceptos/$estructura/complejidad");

  const { estructura } = route.useParams();
  const nombre = conceptosData[estructura].nombre;

  // Buscar el componente correspondiente en el mapeo, si no existe, usar un fallback
  const DynamicComponent =
    componentMap[nombre] || (() => <p>Componente no encontrado</p>);

  return (
    <div>
      <DynamicComponent /> {/* Renderiza el componente dinámico aquí */}
    </div>
  );
}
