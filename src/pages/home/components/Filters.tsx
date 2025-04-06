import { TiDelete } from "react-icons/ti";
import { FilterTypeValue, NavBarProps } from "../../../types";
import { TYPE_FILTER } from "../../../shared/constants/consts";

export function Filters({ filter, setFilter }: NavBarProps) {
  return (
    <div
      id="filters-section"
      className="scroll-mt-24 px-6 py-6 max-w-[1400px] mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      {/* Input de búsqueda */}
      <div className="flex items-center w-full sm:max-w-md bg-[#1A1A1A] border border-red-500 rounded-full px-4 py-2 shadow-md">
        <input
          type="text"
          value={filter.query}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              query: e.target.value,
            }))
          }
          placeholder="Secuencia, Cola, Lista..."
          className="w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm"
        />
        <TiDelete
          size={22}
          onClick={() => setFilter((prev) => ({ ...prev, query: "" }))}
          className="cursor-pointer text-red-400 hover:text-red-500 transition"
        />
      </div>

      {/* Selector de tipo */}
      <div className="relative w-full sm:max-w-sm">
        <select
          value={filter.type}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              type: e.target.value as FilterTypeValue,
            }))
          }
          className="w-full bg-[#1A1A1A] text-white border border-red-500 rounded-full px-4 py-2 appearance-none pr-10 text-sm shadow-md outline-none"
        >
          <option value={TYPE_FILTER.NONE}>Por defecto</option>
          <option value={TYPE_FILTER.ESTRUCTURA_LINEAL}>
            Estructuras Lineales
          </option>
          <option value={TYPE_FILTER.ARBOL_BINARIO}>Árboles Binarios</option>
          <option value={TYPE_FILTER.ARBOL_ENEARIO}>Árboles Enearios</option>
        </select>
        <div className="pointer-events-none absolute right-4 top-2/4 -translate-y-1/2 text-red-400">
          ▼
        </div>
      </div>
    </div>
  );
}
