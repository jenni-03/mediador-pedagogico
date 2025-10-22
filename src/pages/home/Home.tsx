import { useEffect, useState } from "react";
import { CardList } from "./components/CardList";
import { NavBar } from "./components/NavBar";
import { FilterState } from "../../types";
import { data } from "../../shared/constants/data-cards";
import { Welcome } from "./components/Welcome";
import { Filters } from "./components/Filters";
import { Introduction } from "./components/Introduction";
import { motion } from "framer-motion";
import { AboutModal } from "./components/AboutModal";

export function Home() {
  const [filter, setFilter] = useState<FilterState>({
    query: "",
    type: "none",
  });

  const [showButton, setShowButton] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-white">
      <NavBar />
      <Welcome />
      <Introduction />
      <Filters filter={filter} setFilter={setFilter} />
      <CardList data={data} filter={filter} />

      {showButton && (
        <button
          aria-label="Arrow Up"
          id="arrowUp"
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50"
        >
          <i className="pi pi-chevron-circle-up text-2xl"></i>
        </button>
      )}

      {/* Botón flotante “Colaboradores” */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAboutOpen(true)}
        className="fixed bottom-4 left-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-semibold transition-all z-50"
      >
        <i className="pi pi-users text-2xl"></i>
        Colaboradores
      </motion.button>

      {/* Modal del equipo */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Footer */}
      <footer className="relative bg-[#111] text-gray-400 text-center py-6 mt-16 border-t border-gray-800">
        <p className="text-sm">
          © 2025 Equipo SEEDigital — Licencia{" "}
          <a
            href="https://creativecommons.org/licenses/by-nc/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 hover:text-red-400 underline font-semibold"
          >
            CC BY-NC 4.0
          </a>
        </p>
      </footer>
    </div>
  );
}
