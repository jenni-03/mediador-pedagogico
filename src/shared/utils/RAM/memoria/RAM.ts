import AlmacenMemoria from "./AlmacenMemoria";

class RAM {
    protected static instance: RAM;
    protected almacen: AlmacenMemoria;

    protected constructor() {
        this.almacen = AlmacenMemoria.getInstance();
    }

    public static getInstance(): RAM {
        if (!RAM.instance) {
            RAM.instance = new RAM();
        }
        return RAM.instance;
    }

    public allocate(nombre: string, tipo: string, valor: any, subTipos?: Record<string, string>): string | null {
        const direccion = this.almacen.obtenerNuevaDireccion(tipo); 

        if (Array.isArray(valor)) {
            const arrayElementKey = `${nombre}.elemento`;
            if (!subTipos || !subTipos[arrayElementKey]) {
                console.error(`Debe especificarse el tipo de los elementos del array '${nombre}'`);
                return null;
            }

            const arrayDir: string[] = [];
            valor.forEach((element, index) => {
                const elementType = subTipos[arrayElementKey];
                const elementAddress = this.allocate(`${nombre}[${index}]`, elementType, element);
                if (elementAddress) {
                    arrayDir.push(elementAddress);
                }
            });

            this.almacen.insertar("array", direccion, arrayDir);
        } else if (typeof valor === "object" && valor !== null) {
            if (!subTipos) {
                console.error(`Debe especificarse el tipo de los atributos del objeto '${nombre}'`);
                return null;
            }

            const objectDir: Record<string, string> = {};

            Object.entries(valor).forEach(([key, attrValue]) => {
                const keyPath = `${nombre}.${key}`;
                if (!subTipos[keyPath]) {
                    console.error(`Falta especificar el tipo del atributo '${key}' en el objeto '${nombre}'`);
                    return;
                }
                const attrAddress = this.allocate(keyPath, subTipos[keyPath], attrValue, subTipos);
                if (attrAddress) {
                    objectDir[key] = attrAddress;
                }
            });

            this.almacen.insertar("object", direccion, objectDir);
        } else {
            this.almacen.insertar(tipo, direccion, valor);
        }

        return direccion;
    }

    public getValue(direccion: string): any | null {
        return this.almacen.obtener(direccion);
    }

    public free(direccion: string): boolean {
        return this.almacen.eliminar(direccion);
    }

    public dumpMemory(): Record<string, Record<string, any>> {
        return this.almacen.obtenerEstado();
    }
}

export default RAM;
