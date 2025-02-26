import { TiDelete } from "react-icons/ti";
import { FilterTypeValue, NavBarProps } from "../../../types";
import { TYPE_FILTER } from "../../../shared/constants/consts";

export function NavBar({ filter, setFilter }: NavBarProps) {
    return (
        <header className="sticky top-0 w-full z-50 bg-white shadow">
            <div className="m-auto flex flex-col sm:flex-row sm:flex items-center sm:justify-between px-6 w-full  max-w-[1200px] bg-white h-32 sm:h-24 gap-2 sm:gap-10">
                <h1 className="text-2xl md:w-64 lg:w-72 font-semibold">
                    PROYECTO SEED
                </h1>
                <div className="flex min-w-64 lg:w-64 items-center bg-white p-1 border border-black rounded-full overflow-hidden">
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
                        className="cursor-pointer rounded-full"
                        size={25}
                        onClick={() =>
                            setFilter((prev) => ({ ...prev, query: "" }))
                        }
                    />
                </div>
                <select
                    onChange={(e) =>
                        setFilter((prev) => ({
                            ...prev,
                            type: e.target.value as FilterTypeValue,
                        }))
                    }
                    className="w-60 md:w-64 lg:w-72 p-1 border rounded"
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
            </div>
        </header>
    );
}
