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
                className={`block p-2 rounded-xl transition-colors duration-200 cursor-pointer bg-gray-100 text-gray-600 ${
                    isActive
                        // ? "bg-gray-300 font-medium"
                        // : "bg-white text-gray-600 hover:bg-gray-200"
                        ? "shadow-[inset_4px_4px_6px_#b8b8b8,inset_-4px_-4px_6px_#ffffff] border-2 border-gray-100 text-red-500" 
                        : "shadow-[6px_6px_10px_#b8b8b8,-6px_-6px_10px_#ffffff]"
                }`}
            >
                <i
                    className={`pi ${isActive ? "pi-star-fill text-red-500" : "pi-star-fill"} mr-3`}
                ></i>
                {label}
            </Link>
        </li>
    );
}
