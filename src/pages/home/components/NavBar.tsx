export function NavBar() {
    const handleScroll = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault(); // Evita el comportamiento por defecto del enlace

        const filtersSection = document.getElementById("filters-section");
        if (filtersSection) {
            filtersSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

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
                <a
                    href="#filters-section"
                    className="text-lg font-semibold leading-6 "
                    onClick={handleScroll}
                >
                    Ver Estructuras de Datos <span aria-hidden="true">&rarr;</span>
                </a>
            </div>
        </header>
    );
}
