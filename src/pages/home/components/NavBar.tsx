import { TiDelete } from "react-icons/ti";
import { FilterTypeValue, NavBarProps } from "../../../types";
import { TYPE_FILTER } from "../../../shared/constants/consts";

export function NavBar({ filter, setFilter }: NavBarProps) {
    return (
        <header className="sticky top-0 w-full z-50 bg-white shadow">
            <div className="m-auto flex flex-col sm:flex-row sm:flex items-center sm:justify-between px-6 w-full  max-w-[1200px] bg-white h-32 sm:h-24 gap-2 sm:gap-10">
                {/* <div className="flex flex-row items-center gap-2">
                    <img
                        className="hidden sm:block object-fill h-30 w-40 sm:h-16 sm:w-16"
                        src="/assets/images/logo_ingsistemas.png"
                        alt=""
                    />
                    <h1 className="text-2xl md:w-64 lg:w-72 font-semibold">
                        <span className="text-black">Mediador</span>
                        <span className="text-red-600">Pedagógico</span>
                    </h1>
                </div> */}
                <h1 className="text-2xl md:w-64 lg:w-72 font-semibold">
                    <span className="text-black">Mediador</span>
                    <span className="text-red-600">Pedagógico</span>
                </h1>
                <div className="flex min-w-64 lg:w-64 items-center bg-white p-1 border border-red-300 rounded-full overflow-hidden">
                    <input
                        type="text"
                        className="w-52 sm:w-52 px-2 lg:w-64 outline-none"
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
        </header>
    );
}
