import type Raylib from "../Raylib";
import type { RaylibResult } from "../types";
import Rectangle from "../math/Rectangle";
import Vector2 from "../math/Vector2";
import type { UIStyleProperties } from "./UIStyle";
import { UIStyleHelper } from "./UIStyle";

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
    protected style: Partial<UIStyleProperties> = {};
    protected computedBounds: Rectangle; // Bounds after applying margin/padding

    constructor(x: number, y: number, width: number, height: number) {
        this.bounds = new Rectangle(x, y, width, height);
        this.computedBounds = new Rectangle(x, y, width, height);
        this.state = {
            isHovered: false,
            isPressed: false,
            isFocused: false,
            isDisabled: false,
        };
        this.updateComputedBounds();
    }

    public setBounds(x: number, y: number, width: number, height: number): void {
        this.bounds.x = x;
        this.bounds.y = y;
        this.bounds.width = width;
        this.bounds.height = height;
        this.updateComputedBounds();
    }

    public getBounds(): Rectangle {
        return this.bounds;
    }

    public getComputedBounds(): Rectangle {
        return this.computedBounds;
    }

    /**
     * Set style properties (merges with existing style)
     */
    public setStyle(style: Partial<UIStyleProperties>): void {
        this.style = UIStyleHelper.mergeStyles(this.style, style);
        this.updateComputedBounds();
    }

    /**
     * Get current style
     */
    public getStyle(): Partial<UIStyleProperties> {
        return this.style;
    }

    /**
     * Apply a complete style (replaces existing style)
     */
    public applyStyle(style: Partial<UIStyleProperties>): void {
        this.style = { ...style };
        this.updateComputedBounds();
    }

    /**
     * Update computed bounds based on margin and padding
     */
    protected updateComputedBounds(): void {
        const margin = UIStyleHelper.normalizeSpacing(this.style.margin);
        const padding = UIStyleHelper.normalizeSpacing(this.style.padding);

        this.computedBounds = new Rectangle(
            this.bounds.x + margin.left,
            this.bounds.y + margin.top,
            this.bounds.width - margin.left - margin.right,
            this.bounds.height - margin.top - margin.bottom
        );
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

        this.state.isHovered = rl
            .checkCollisionPointRec(mousePos, this.computedBounds)
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
