import { useState } from "react";
import { CardList } from "./CardList";
import { NavBar } from "./NavBar";
import { FilterState } from "../../types";
import { data } from "../../constants/data-cards";

export function Home() {
    const [filter, setFilter] = useState<FilterState>({
        query: "",
        type: "none",
    });

    return (
        <div className="w-full m-auto bg-[#f5f4f4] min-h-screen">
            <NavBar filter={filter} setFilter={setFilter} />
            <CardList data={data} filter={filter} />
        </div>
    );
}
