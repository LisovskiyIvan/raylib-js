import type Raylib from "../Raylib";
import type { RaylibResult } from "../types";
import Rectangle from "../math/Rectangle";
import Vector2 from "../math/Vector2";

export interface UIState {
    isHovered: boolean;
    isPressed: boolean;
    isFocused: boolean;
    isDisabled: boolean;
}

export abstract class UIComponent {
    protected bounds: Rectangle;
    protected state: UIState;
    protected visible: boolean = true;

    constructor(x: number, y: number, width: number, height: number) {
        this.bounds = new Rectangle(x, y, width, height);
        this.state = {
            isHovered: false,
            isPressed: false,
            isFocused: false,
            isDisabled: false,
        };
    }

    public setBounds(x: number, y: number, width: number, height: number): void {
        this.bounds.x = x;
        this.bounds.y = y;
        this.bounds.width = width;
        this.bounds.height = height;
    }

    public getBounds(): Rectangle {
        return this.bounds;
    }

    public setVisible(visible: boolean): void {
        this.visible = visible;
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public setDisabled(disabled: boolean): void {
        this.state.isDisabled = disabled;
    }

    public isDisabled(): boolean {
        return this.state.isDisabled;
    }

    protected updateState(rl: Raylib): void {
        if (this.state.isDisabled || !this.visible) {
            this.state.isHovered = false;
            this.state.isPressed = false;
            return;
        }

        const mousePos = rl.getMousePosition().unwrapOr(Vector2.Zero());
        const wasHovered = this.state.isHovered;

        this.state.isHovered = rl
            .checkCollisionPointRec(mousePos, this.bounds)
            .unwrapOr(false);

        if (this.state.isHovered) {
            this.state.isPressed = rl.isMouseButtonDown(0).unwrapOr(false);
        } else {
            this.state.isPressed = false;
        }
    }

    public abstract update(rl: Raylib): void;
    public abstract draw(rl: Raylib): RaylibResult<void>;
}
