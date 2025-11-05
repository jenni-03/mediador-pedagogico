import React, { createContext, useContext, useMemo, useState } from "react";

export type ByteRange = { start: number; len: number };

type HighlightState = {
  heapId?: string;         // p.ej. "heap-0x10"
  stackId?: string;        // p.ej. "slot-2-x"
  ranges: ByteRange[];     // rangos a resaltar en RAM
};

type CtxType = {
  highlight: HighlightState;
  setRanges: (r: ByteRange[] | null, extra?: { heapId?: string; stackId?: string }) => void;
  clear: () => void;
};

const Ctx = createContext<CtxType>({
  highlight: { ranges: [] },
  setRanges: () => {},
  clear: () => {},
});

export function HighlightProvider({ children }: { children: React.ReactNode }) {
  const [highlight, setHighlight] = useState<HighlightState>({ ranges: [] });

  const api = useMemo<CtxType>(() => ({
    highlight,
    setRanges: (r, extra) => {
      setHighlight({
        heapId: extra?.heapId,
        stackId: extra?.stackId,
        ranges: r ?? [],
      });
    },
    clear: () => setHighlight({ ranges: [] }),
  }), [highlight]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useHighlight = () => useContext(Ctx);
