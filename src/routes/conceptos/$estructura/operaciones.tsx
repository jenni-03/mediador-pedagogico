import { createFileRoute } from "@tanstack/react-router";
import { Operation } from "../../../pages/concepts/Operation";

export const Route = createFileRoute("/conceptos/$estructura/operaciones")({
    component: RouteComponent,
});

function RouteComponent() {
    return <Operation></Operation>;
}
