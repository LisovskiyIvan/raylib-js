export default class Color3 {
    private r: number;
    private g: number;
    private b: number;
    private a: number;
    constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 255) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public static fromRGB(r: number, g: number, b: number, a: number = 255): number {
        return this.toHex(r, g, b, a)
    }

    private static toHex(r: number, g: number, b: number, a: number): number {
        return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
    }
}
