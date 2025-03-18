import { Memory, PrimitiveType, ComplexType, MemoryEntry } from "./Memory";

export class MemoryManager {
  private memory: Memory;

  constructor(memory: Memory) {
    this.memory = memory;
  }

  getByAddress(address: string): MemoryEntry | null {
    for (const segment of this.memory["segments"].values()) {
      if (segment.has(address)) {
        return segment.get(address) || null;
      }
    }
    return null;
  }

  printSegment(type: PrimitiveType | ComplexType): string {
    if (!this.memory["segments"].has(type)) {
      return `🚨 Error: Segmento "${type}" no encontrado.`;
    }

    let output = `📌 Estado del segmento [${type}]:\n`;
    this.memory["segments"].get(type)!.forEach((entry) => {
      output += `  ${JSON.stringify(this.safeEntry(entry))}\n`;
    });

    return output;
  }

  clearMemory(): string {
    this.memory["segments"].forEach((segment) => segment.clear());
    return "🧹 Memoria completamente limpiada.";
  }

  getSize(address: string): string {
    const entry = this.getByAddress(address);
    if (!entry) return `🚨 Error: No se encontró la dirección ${address}`;

    const typeSizes: Record<PrimitiveType | ComplexType, number> = {
      boolean: 1,
      char: 1,
      byte: 1,
      short: 2,
      int: 4,
      long: 8,
      float: 4,
      double: 8,
      string: entry.value.length, // Depende de la longitud
      object: JSON.stringify(entry.value).length,
      array: entry.value.length * 4,
    };

    return `📏 Dirección ${address} ocupa aproximadamente ${typeSizes[entry.type]} bytes.`;
  }

  changeType(address: string, newType: PrimitiveType): string {
    const entry = this.getByAddress(address);
    if (!entry) return `🚨 Error: No se encontró la dirección ${address}`;
    if (!this.memory["segments"].has(newType))
      return `🚨 Error: Tipo de dato "${newType}" no válido.`;

    // Eliminar del segmento actual
    const currentSegment = this.memory["segments"].get(entry.type)!;
    currentSegment.delete(address);

    // Convertir valor según el nuevo tipo
    let newValue = entry.value;
    switch (newType) {
      case "int":
        newValue = parseInt(entry.value, 10) || 0;
        break;
      case "long":
        newValue = BigInt(entry.value) || BigInt(0);
        break;
      case "float":
      case "double":
        newValue = parseFloat(entry.value) || 0.0;
        break;
      case "boolean":
        newValue = Boolean(entry.value);
        break;
      case "string":
        newValue = String(entry.value);
        break;
      case "char":
        newValue = String(entry.value).charAt(0) || "";
        break;
      default:
        return `🚨 Error: Conversión no soportada a ${newType}`;
    }

    // Generar nueva dirección para el nuevo tipo
    const newAddress = this.memory["generateAddress"](newType);
    this.memory["segments"].get(newType)!.set(newAddress, {
      type: newType,
      name: entry.name,
      value: newValue,
      address: newAddress,
    });

    return `🔄 Variable "${entry.name}" convertida de ${entry.type} a ${newType} (Nueva dirección: ${newAddress})`;
  }

  private safeEntry(entry: MemoryEntry) {
    return {
      ...entry,
      value:
        typeof entry.value === "bigint" ? entry.value.toString() : entry.value,
    };
  }
}
