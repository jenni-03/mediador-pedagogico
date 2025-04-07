export function NavBar() {
  const handleScroll = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    const filtersSection = document.getElementById("filters-section");
    if (filtersSection) {
      filtersSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-[#0f0f0f] border-b border-red-600 shadow-xl">
      <div className="max-w-[1400px] m-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo y título */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">
          <span className="text-white">Mediador</span>
          <span className="text-red-500">Pedagógico</span>
        </h1>

        {/* Enlace a la sección */}
        <a
          href="#filters-section"
          onClick={handleScroll}
          className="text-sm sm:text-base font-semibold text-white hover:text-red-400 transition-colors duration-200"
        >
          Ver Estructuras de Datos <span aria-hidden="true">→</span>
        </a>
      </div>
    </header>
  );
}
