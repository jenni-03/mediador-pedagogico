import { createFileRoute } from "@tanstack/react-router";
import { Definition } from "../../../pages/concepts/Definition";

export const Route = createFileRoute("/conceptos/$estructura/definicion")({
    component: RouteComponent,
});

function RouteComponent() {
    return <Definition></Definition>;
}
