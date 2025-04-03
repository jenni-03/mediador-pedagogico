export class Pila {
  private elementos: number[];

  constructor() {
    this.elementos = [];
  }

  insertar(valor: number) {
    this.elementos.push(valor);
  }

  eliminar() {
    if (this.elementos.length === 0) throw new Error("La pila está vacía");
    this.elementos.pop();
  }

  buscar(valor: number): boolean {
    return this.elementos.includes(valor);
  }

  vaciar() {
    this.elementos = [];
  }

  actualizar(indice: number, valor: number) {
    if (indice < 0 || indice >= this.elementos.length)
      throw new Error("Índice fuera de rango");
    this.elementos[indice] = valor;
  }

  getVector() {
    return [...this.elementos];
  }

  getMemoria() {
    return [...this.elementos]; 
  }
}
