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
    </div>
  );
}
