export function NavBar() {
  const handleScroll =
    (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0f0f0f] border-b border-red-600 shadow-xl">
      <div className="max-w-[1400px] m-auto px-6 py-4 flex items-center gap-3">
        {/* Logo y título */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">
          <span className="text-white">Mediador</span>
          <span className="text-red-500">Pedagógico</span>
        </h1>

        {/* Enlaces */}
        <div className="ml-auto flex gap-12">
          <a
            href="#introduction-section"
            onClick={handleScroll("introduction-section")}
            className="text-sm sm:text-base font-semibold text-white hover:text-red-400 transition-colors duration-200"
          >
            Introducción a los Simuladores <span aria-hidden="true">→</span>
          </a>

          <a
            href="#filters-section"
            onClick={handleScroll("filters-section")}
            className="text-sm sm:text-base font-semibold text-white hover:text-red-400 transition-colors duration-200"
          >
            Ver Estructuras de Datos <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </header>
  );
}
