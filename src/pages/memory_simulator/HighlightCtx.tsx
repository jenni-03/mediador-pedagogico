import React, { createContext, useCallback, useContext, useState } from "react";

export type ByteRange = { start: number; len: number };

type HighlightState = {
  heapId?: string;         // p.ej. "heap-0x10"
  stackId?: string;        // p.ej. "slot-2-x"
  ranges: ByteRange[];     // rangos a resaltar en RAM
};

type ApiType = {
  setRanges: (r: ByteRange[] | null, extra?: { heapId?: string; stackId?: string }) => void;
  clear: () => void;
};

const StateCtx = createContext<HighlightState>({ ranges: [] });
const ApiCtx = createContext<ApiType>({
  setRanges: () => {},
  clear: () => {},
});

export function HighlightProvider({ children }: { children: React.ReactNode }) {
  const [highlight, setHighlight] = useState<HighlightState>({ ranges: [] });

  const setRanges = useCallback(
    (r: ByteRange[] | null, extra?: { heapId?: string; stackId?: string }) => {
      setHighlight({
        heapId: extra?.heapId,
        stackId: extra?.stackId,
        ranges: r ?? [],
      });
    },
    []
  );

  const clear = useCallback(() => setHighlight({ ranges: [] }), []);

  return (
    <StateCtx.Provider value={highlight}>
      <ApiCtx.Provider value={{ setRanges, clear }}>
        {children}
      </ApiCtx.Provider>
    </StateCtx.Provider>
  );
}

/** Lee el estado de highlight (re-renderiza cuando cambia) */
export const useHighlightState = () => useContext(StateCtx);

/** Accede a setRanges/clear sin re-renderizar al cambiar el estado */
export const useHighlightApi = () => useContext(ApiCtx);

/** Compatibilidad: retorna state + api combinados */
export const useHighlight = () => {
  const highlight = useContext(StateCtx);
  const api = useContext(ApiCtx);
  return { highlight, ...api };
};
