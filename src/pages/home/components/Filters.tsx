import { TiDelete } from "react-icons/ti";
import { FilterTypeValue, NavBarProps } from "../../../types";
import { TYPE_FILTER } from "../../../shared/constants/consts";

export function Filters({ filter, setFilter }: NavBarProps){
    return (
        <div id="filters-section" className="m-auto flex flex-col sm:flex-row sm:flex items-center sm:justify-between px-6 w-full max-w-[1200px] h-32 sm:h-24 gap-2 sm:gap-10 scroll-mt-24">
                <div className="flex min-w-[300px] lg:w-80 items-center bg-white p-1 border border-red-300 rounded-full overflow-hidden">
                    <input
                        type="text"
                        className="w-72 px-2 lg:w-80 outline-none"
                        value={filter.query}
                        onChange={(e) =>
                            setFilter((prev) => ({
                                ...prev,
                                query: e.target.value,
                            }))
                        }
                        placeholder="Secuencia, Cola, Lista..."
                    />
                    <TiDelete
                        className="cursor-pointer rounded-full text-red-500"
                        size={25}
                        onClick={() =>
                            setFilter((prev) => ({ ...prev, query: "" }))
                        }
                    />
                </div>
                <div className="relative w-60 md:w-64 lg:w-72">
                    <select
                        onChange={(e) =>
                            setFilter((prev) => ({
                                ...prev,
                                type: e.target.value as FilterTypeValue,
                            }))
                        }
                        className="w-60 md:w-64 lg:w-72 p-1 border rounded border border-red-300 outline-none appearance-none"
                    >
                        <option value={TYPE_FILTER.NONE}>Por defecto</option>
                        <option value={TYPE_FILTER.ESTRUCTURA_LINEAL}>
                            Estructuras Lineales
                        </option>
                        <option value={TYPE_FILTER.ARBOL_BINARIO}>
                            Árboles Binarios
                        </option>
                        <option value={TYPE_FILTER.ARBOL_ENEARIO}>
                            Árboles Enearios
                        </option>
                    </select>
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        <i className="pi pi-chevron-down text-red-500"></i>
                    </div>
                </div>
            </div>
    );
}