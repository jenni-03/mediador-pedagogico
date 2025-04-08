import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useRef, useEffect } from "react";

type MenuType = "sim" | "concepts";

interface DropdownMenuProps {
  type: MenuType;
  items: { title: string; to: string }[];
  onClose: () => void;
}

export function DropdownMenu({ type, items, onClose }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    // No "fixed inset-0", ni "pointer-events-none".
    // Con "absolute top-full", el menú aparece debajo del header,
    // pero el scroll lo maneja la página.
    <div
      ref={menuRef}
      className="absolute top-full left-0 w-full z-40 bg-[#1f1f1f] 
                 border-t border-[#2a2a2a] shadow-xl py-6 px-4 sm:px-10"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-bold text-lg">
          {type === "sim"
            ? "Simuladores disponibles"
            : "Conceptos disponibles"}
        </h2>
        <button
          onClick={onClose}
          className="text-white hover:text-red-400"
          title="Cerrar"
        >
          <X />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item) => (
          <Link
            key={item.title}
            to={item.to}
            onClick={onClose}
            className="block px-4 py-2 bg-[#262626] rounded 
                       hover:bg-red-500 hover:text-black transition
                       font-medium text-sm text-white 
                       border border-transparent hover:border-red-300"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
