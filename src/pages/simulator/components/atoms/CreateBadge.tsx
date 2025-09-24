interface CreatedBadgeProps {
  /** Nombre legible de la estructura (ej: "arbol_nario") */
  structureType: string;
  /** Identificador/slug corto (ej: "arbolNario") */
  slug: string;
  /** Resalta brevemente cuando acaba de crearse */
  highlight?: boolean;
}

/**
 * Chip persistente que indica qué objeto está activo en la consola.
 * Se muestra en la cabecera de la consola. No roba foco ni bloquea.
 */
export function CreatedBadge({
  structureType,
  slug,
  highlight = false,
}: CreatedBadgeProps) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm shadow " +
    "border-green-500/30 bg-green-500/10 text-green-300";
  const hl = highlight ? " ring-2 ring-green-400/60 animate-pulse" : "";

  return (
    <div className={base + hl} title={`Objeto activo: ${structureType}`}>
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-green-400"
        aria-hidden="true"
      >
        <path
          d="M20 6L9 17l-5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-medium">Objeto Creado:</span>
      <span className="font-mono text-green-200">{slug}</span>
    </div>
  );
}
