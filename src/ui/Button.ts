import { UIComponent } from "./UIComponent";
import type Raylib from "../Raylib";
import type { RaylibResult } from "../types";
import { Colors } from "../constants";
import { Ok } from "../result";

export interface ButtonStyle {
    normalColor: number;
    hoverColor: number;
    pressedColor: number;
    disabledColor: number;
    textColor: number;
    fontSize: number;
    borderWidth: number;
    borderColor: number;
}

export const DefaultButtonStyle: ButtonStyle = {
    normalColor: Colors.LIGHTGRAY,
    hoverColor: Colors.GRAY,
    pressedColor: Colors.DARKGRAY,
    disabledColor: Colors.DARKGRAY,
    textColor: Colors.BLACK,
    fontSize: 20,
    borderWidth: 2,
    borderColor: Colors.BLACK,
};

export class Button extends UIComponent {
    private text: string;
    private style: ButtonStyle;
    private onClick?: () => void;
    private wasPressed: boolean = false;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        style: Partial<ButtonStyle> = {}
    ) {
        super(x, y, width, height);
        this.text = text;
        this.style = { ...DefaultButtonStyle, ...style };
    }

    public setText(text: string): void {
        this.text = text;
    }

    public setStyle(style: Partial<ButtonStyle>): void {
        this.style = { ...this.style, ...style };
    }

    public setOnClick(callback: () => void): void {
        this.onClick = callback;
    }

    public update(rl: Raylib): void {
        this.updateState(rl);

        // Detect click (button released while hovering)
        if (this.wasPressed && !this.state.isPressed && this.state.isHovered) {
            if (this.onClick && !this.state.isDisabled) {
                this.onClick();
            }
        }

        this.wasPressed = this.state.isPressed;
    }

    public draw(rl: Raylib): RaylibResult<void> {
        if (!this.visible) return new Ok(undefined);

        // Determine color based on state
        let bgColor = this.style.normalColor;
        if (this.state.isDisabled) {
            bgColor = this.style.disabledColor;
        } else if (this.state.isPressed) {
            bgColor = this.style.pressedColor;
        } else if (this.state.isHovered) {
            bgColor = this.style.hoverColor;
        }

        // Draw button background
        const result = rl.drawRectangleRec(this.bounds, bgColor);
        if (result.isErr()) return result;

        // Draw border
        if (this.style.borderWidth > 0) {
            const borderResult = this.drawBorder(rl);
            if (borderResult.isErr()) return borderResult;
        }

        // Draw text centered
        const textX = this.bounds.x + this.bounds.width / 2 - (this.text.length * this.style.fontSize) / 4;
        const textY = this.bounds.y + this.bounds.height / 2 - this.style.fontSize / 2;

        return rl.drawText(
            this.text,
            textX,
            textY,
            this.style.fontSize,
            this.style.textColor
        );
    }

    private drawBorder(rl: Raylib): RaylibResult<void> {
        const w = this.style.borderWidth;

        // Top
        let result = rl.drawRectangle(
            this.bounds.x,
            this.bounds.y,
            this.bounds.width,
            w,
            this.style.borderColor
        );
        if (result.isErr()) return result;

        // Bottom
        result = rl.drawRectangle(
            this.bounds.x,
            this.bounds.y + this.bounds.height - w,
            this.bounds.width,
            w,
            this.style.borderColor
        );
        if (result.isErr()) return result;

        // Left
        result = rl.drawRectangle(
            this.bounds.x,
            this.bounds.y,
            w,
            this.bounds.height,
            this.style.borderColor
        );
        if (result.isErr()) return result;

        // Right
        return rl.drawRectangle(
            this.bounds.x + this.bounds.width - w,
            this.bounds.y,
            w,
            this.bounds.height,
            this.style.borderColor
        );
    }
}
