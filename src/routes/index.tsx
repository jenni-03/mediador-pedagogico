import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../pages/home/Home.js";

export const Route = createFileRoute("/")({
    component: Index,
});

function Index() {
    return <Home></Home>;
}
