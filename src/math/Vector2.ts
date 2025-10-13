export default class Vector2 {

    constructor(public x: number, public y: number) { }

    public static Zero() {
        return new Vector2(0, 0)
    }

    public static One() {
        return new Vector2(1, 1)
    }

    public add(vector: Vector2) {
        return new Vector2(this.x + vector.x, this.y + vector.y)
    }

    public addInPlace(vector: Vector2) {
        this.x + vector.x
        this.y + vector.y
    }

    public subtract(vector: Vector2) {
        return new Vector2(this.x - vector.x, this.y - vector.y)
    }

    public subtractInPlace(vector: Vector2) {
        this.x - vector.x
        this.y - vector.y
    }

    public copyFrom(vector: Vector2) {
        this.x = vector.x
        this.y = vector.y
    }

    public length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    public normalize() {
        const len = this.length()
        if (len === 0) return Vector2.Zero()
        return new Vector2(this.x / len, this.y / len)
    }

    public normaliseInPlace() {
        const len = this.length()
        if (len === 0) return Vector2.Zero()
        this.x /= len
        this.y /= len
    }

    public dot(vector: Vector2) {
        return this.x * vector.x + this.y * vector.y
    }

    public cross(vector: Vector2) {
        return this.x * vector.y - this.y * vector.x
    }

    public scale(scalar: number) {
        return new Vector2(this.x * scalar, this.y * scalar)
    }

    public scaleInPlace(scalar: number) {
        this.x *= scalar
        this.y *= scalar
    }
}