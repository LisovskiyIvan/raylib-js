export default class Rectangle {
    public x: number
    public y: number
    public width: number
    public height: number

    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    public static Zero(): Rectangle {
        return new Rectangle(0, 0, 0, 0)
    }

    public static create(x: number, y: number, width: number, height: number): Rectangle {
        return new Rectangle(x, y, width, height)
    }

    public copyFrom(other: Rectangle): void {
        this.x = other.x
        this.y = other.y
        this.width = other.width
        this.height = other.height
    }

    public clone(): Rectangle {
        return new Rectangle(this.x, this.y, this.width, this.height)
    }

    public toString(): string {
        return `Rectangle(${this.x}, ${this.y}, ${this.width}, ${this.height})`
    }
}