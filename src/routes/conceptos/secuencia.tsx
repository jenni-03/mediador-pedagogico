import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/conceptos/secuencia')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/conceptos/secuencia"!</div>
}
