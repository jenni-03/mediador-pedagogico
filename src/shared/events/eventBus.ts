type Listener<T = any> = (p: T) => void;

export class EventBus {
    private m = new Map<string, Set<Listener>>();

    on<T = any>(evt: string, fn: Listener<T>) {
        if (!this.m.has(evt)) this.m.set(evt, new Set());
        this.m.get(evt)!.add(fn);
        return () => this.off(evt, fn);
    }

    off<T = any>(evt: string, fn: Listener<T>) {
        this.m.get(evt)?.delete(fn);
    }

    emit<T = any>(evt: string, payload: T) {
        this.m.get(evt)?.forEach((fn) => fn(payload));
    }
}

export const createBus = () => new EventBus();