import { useEffect, useState } from "react";
import { CardList } from "./components/CardList";
import { NavBar } from "./components/NavBar";
import { FilterState } from "../../types";
import { data } from "../../shared/constants/data-cards";
import { Welcome } from "./components/Welcome";
import { Filters } from "./components/Filters";

export function Home() {
    const [filter, setFilter] = useState<FilterState>({
        query: "",
        type: "none",
    });

    const [showButton, setShowButton] = useState(false);

    // Detectar scroll para mostrar/ocultar el botón
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowButton(true);
            } else {
                setShowButton(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <>
            <NavBar />
            <Welcome />
            <Filters filter={filter} setFilter={setFilter} />
            <CardList data={data} filter={filter} />
            {/* Botón de volver arriba */}
            {showButton && (
                <button
                    aria-label="Arrow Up"
                    id="arrowUp"
                    className="fixed bottom-4 right-4 w-12 h-12 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-all"
                    onClick={scrollToTop}
                >
                    <i className="pi pi-chevron-circle-up text-2xl"></i>
                </button>
            )}
        </>
    )
}
