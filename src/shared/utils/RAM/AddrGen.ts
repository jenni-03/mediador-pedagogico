export class AddrGen {
  private static readonly CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  static generate(value: number): string {
    if (value === 0) return "0x0";

    let num = Math.abs(value);
    let hash = "0x";

    while (num > 0) {
      hash += this.CHARS[Math.floor(num % this.CHARS.length)];
      num = Math.floor(num / this.CHARS.length);
    }

    // Manejo especial para decimales
    if (!Number.isInteger(value)) {
      const decimalPart = value.toString().split(".")[1] || "";
      hash += "-" + decimalPart.slice(0, 4); // Tomamos solo los primeros 4 decimales
    }

    return hash;
  }
}
