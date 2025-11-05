import { createFileRoute } from "@tanstack/react-router";
import MemoryApp from "../../pages/memory_simulator/MemoryApp";

export const Route = createFileRoute("/simulador/memoria")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MemoryApp />;
}
