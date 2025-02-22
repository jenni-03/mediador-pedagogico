import { Link, useMatchRoute } from "@tanstack/react-router";
import { SideBarItemProps } from "../types";

export function SidebarItem({ to, params, label }: SideBarItemProps) {
    const matchRoute = useMatchRoute();
    const isActive = !!matchRoute({ to });

    return (
        <li>
            <Link
                to={to}
                params={params}
                className={`block p-2 rounded-lg transition-colors duration-200 ${
                    isActive
                        ? "bg-gray-300 font-medium"
                        : "bg-white text-gray-600 hover:bg-gray-200"
                }`}
            >
                <i
                    className={`pi ${isActive ? "pi-star-fill" : "pi-star"} mr-3`}
                ></i>
                {label}
            </Link>
        </li>
    );
}
