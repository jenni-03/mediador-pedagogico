import { Link, useMatchRoute } from "@tanstack/react-router";
import { SideBarItemProps } from "../../../types";

export function SidebarItem({ to, params, label }: SideBarItemProps) {
  const matchRoute = useMatchRoute();
  const isActive = !!matchRoute({ to });

  return (
    <li>
      <Link
        to={to}
        params={{ estructura: params }}
        className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
          ${
            isActive
              ? "bg-red-600 text-white shadow-[inset_4px_4px_6px_#991b1b,inset_-4px_-4px_6px_#dc2626]"
              : "bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a] shadow-md hover:text-white"
          }`}
      >
        <i
          className={`pi pi-star-fill ${
            isActive ? "text-white" : "text-gray-400"
          }`}
        ></i>
        {label}
      </Link>
    </li>
  );
}
