export default class Vector2 {

    constructor(public x: number, public y: number) {}

    public static Zero() {
        return new Vector2(0, 0)
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
}