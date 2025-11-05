type Props = {
  onReset: () => void;
  onStep: () => void;
  onRunAll: () => void;
  onLoadExample: () => void;
};

export function Controls({ onReset, onStep, onRunAll, onLoadExample }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="px-3 py-1.5 rounded-lg bg-slate-800 text-white"
        onClick={onLoadExample}
      >
        Cargar ejemplo
      </button>
      <button
        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white"
        onClick={onStep}
      >
        Paso (▶)
      </button>
      <button
        className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white"
        onClick={onRunAll}
      >
        Ejecutar todo (⏭)
      </button>
      <button
        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white"
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}
