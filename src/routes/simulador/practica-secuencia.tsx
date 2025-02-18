import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/simulador/practica-secuencia')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/simulador/practica-secuencia"!</div>
}
