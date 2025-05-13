/**
 * Clase encargada de gestionar la generación de direcciones de memoria.
 */
class AddressGenerator {

    // Dirección de memoria base siguiente a asignar.
    private nextBaseAddress: number;

    // Dirección de memoria base inicial.
    private readonly initialBaseAddress: number;

    // Tamaño del nodo en bytes.
    private readonly nodeSize: number;

    // Número máximo de pasos aleatorios a realizar.
    private readonly maxRandomSteps: number;

    // Tamaño del paso extra a realizar.
    private readonly extraStepSize: number;

    // Longitud de la dirección en formato hexadecimal.
    private readonly hexAddressLength: number;

    /**
     * Constructor de la clase AddressGenerator.
     * @param initialBaseAddress Dirección de memoria base inicial (opcional).
     * @param nodeSize Tamaño del nodo en bytes (opcional).
     * @param maxRandomSteps Número máximo de pasos aleatorios a realizar (opcional).   
     * @param extraStepSize Tamaño del paso extra a realizar (opcional).
     * @param hexAddressLength Longitud de la dirección en formato hexadecimal (opcional).
     */
    constructor(
        initialBaseAddress = 1000,
        nodeSize = 16,
        maxRandomSteps = 5,
        extraStepSize = 4,
        hexAddressLength = 6
    ) {
        this.initialBaseAddress = initialBaseAddress;
        this.nextBaseAddress = initialBaseAddress;
        this.nodeSize = nodeSize;
        this.maxRandomSteps = maxRandomSteps;
        this.extraStepSize = extraStepSize;
        this.hexAddressLength = hexAddressLength;
    }

    /**
     * Método que genera la siguiente dirección de memoria asignar.
     * @returns La dirección actual en formato hexadecimal.
     */
    public generateNextAddress() {
        // Dirección asignada
        const assignedAddress = this.nextBaseAddress;

        // Cálculo del incremento para la obtención de la siguiente dirección
        const randomIncrement = this.maxRandomSteps > 0
            ? Math.floor(Math.random() * (this.maxRandomSteps + 1)) * this.extraStepSize
            : 0;
        const totalIncrement = this.nodeSize + randomIncrement;

        // Siguiente dirección base a asignar
        this.nextBaseAddress += totalIncrement;

        // Conversión de la dirección asignada a hexadecimal
        const hexString = assignedAddress.toString(16).toUpperCase();
        const paddedHexString = hexString.padStart(this.hexAddressLength, "0");

        return `0x${paddedHexString}`;
    }

    /**
     * Método que restablece la dirección de memoria base a su valor inicial.
     */
    public reset() {
        this.nextBaseAddress = this.initialBaseAddress;
    }
}

// Instancia de AddressGenerator para asignación dinámica
export const dynamicAddressGenerator = new AddressGenerator(1000, 16, 4, 6);

// Instancia de AddressGenerator para asignación secuencial
export const sequentialAddressGenerator = new AddressGenerator(1000, 4, 0, 0);