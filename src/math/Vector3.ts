export default class Vector3 {

    constructor(public x: number, public y: number, public z: number) { }

    public static Zero() {
        return new Vector3(0, 0, 0)
    }

    public static One() {
        return new Vector3(1, 1, 1)
    }

    public static Up() {
        return new Vector3(0, 1, 0)
    }

    public static Down() {
        return new Vector3(0, -1, 0)
    }

    public static Left() {
        return new Vector3(-1, 0, 0)
    }

    public static Right() {
        return new Vector3(1, 0, 0)
    }

    public static Forward() {
        return new Vector3(0, 0, -1)
    }

    public static Back() {
        return new Vector3(0, 0, 1)
    }

    public add(vector: Vector3) {
        return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z)
    }

    public addInPlace(vector: Vector3) {
        this.x += vector.x
        this.y += vector.y
        this.z += vector.z
    }

    public subtract(vector: Vector3) {
        return new Vector3(this.x - vector.x, this.y - vector.y, this.z - vector.z)
    }

    public subtractInPlace(vector: Vector3) {
        this.x -= vector.x
        this.y -= vector.y
        this.z -= vector.z
    }

    public copyFrom(vector: Vector3) {
        this.x = vector.x
        this.y = vector.y
        this.z = vector.z
    }

    public length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }

    public normalize() {
        const len = this.length()
        if (len === 0) return Vector3.Zero()
        return new Vector3(this.x / len, this.y / len, this.z / len)
    }

    public normalizeInPlace() {
        const len = this.length()
        if (len === 0) {
            this.x = 0
            this.y = 0
            this.z = 0
            return
        }
        this.x /= len
        this.y /= len
        this.z /= len
    }

    public dot(vector: Vector3) {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z
    }

    public cross(vector: Vector3) {
        return new Vector3(
            this.y * vector.z - this.z * vector.y,
            this.z * vector.x - this.x * vector.z,
            this.x * vector.y - this.y * vector.x
        )
    }

    public scale(scalar: number) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar)
    }

    public scaleInPlace(scalar: number) {
        this.x *= scalar
        this.y *= scalar
        this.z *= scalar
    }
}