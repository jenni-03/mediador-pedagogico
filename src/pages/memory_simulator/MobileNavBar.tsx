import { useEffect, useState, useCallback } from "react";

const SECTIONS = [
  { id: "section-stack", icon: "📚", label: "Stack" },
  { id: "section-heap", icon: "🏗️", label: "Heap" },
  { id: "section-ram", icon: "💾", label: "RAM" },
  { id: "section-comandos", icon: "⌨️", label: "Cmds" },
] as const;

export default function MobileNavBar() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Detectar qué sección es visible
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    ) as HTMLElement[];
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex justify-around items-center border-t"
      style={{
        background: "#1F1F22",
        borderColor: "#2E3948",
        height: "60px",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {SECTIONS.map((s) => {
        const isActive = activeId === s.id;
        return (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
              isActive
                ? "text-emerald-400"
                : "text-zinc-500 active:text-zinc-300"
            }`}
          >
            <span className="text-base leading-none">{s.icon}</span>
            <span
              className={`text-[9px] font-medium tracking-wide ${
                isActive ? "text-emerald-300" : "text-zinc-500"
              }`}
            >
              {s.label}
            </span>
            {isActive && (
              <span className="absolute top-0 h-[2px] w-8 rounded-b bg-emerald-400" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
