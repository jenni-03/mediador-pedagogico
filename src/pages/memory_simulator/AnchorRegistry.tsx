import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

type AnchorCtx = {
  bind: (id: string) => (el: HTMLElement | null) => void;
  getRect: (id: string) => DOMRect | null;
};

const Ctx = createContext<AnchorCtx>({
  bind: () => () => {},
  getRect: () => null,
});

export function AnchorRegistryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const mapRef = useRef(new Map<string, HTMLElement>());

  const bind = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      const m = mapRef.current;
      if (!el) m.delete(id);
      else m.set(id, el);
    },
    []
  );

  const getRect = useCallback((id: string) => {
    const el = mapRef.current.get(id);
    return el?.getBoundingClientRect() ?? null;
  }, []);

  const value = useMemo<AnchorCtx>(() => ({ bind, getRect }), [bind, getRect]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAnchors = () => useContext(Ctx);
