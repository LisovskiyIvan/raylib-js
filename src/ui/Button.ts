import { UIComponent } from "./UIComponent";
import type Raylib from "../Raylib";
import type { RaylibResult } from "../types";
import { Colors } from "../constants";
import { Ok } from "../result";
import { UIRenderer } from "./UIRenderer";

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
    private buttonStyle: ButtonStyle;
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
        this.buttonStyle = { ...DefaultButtonStyle, ...style };
    }

    public setText(text: string): void {
        this.text = text;
    }

    public setButtonStyle(style: Partial<ButtonStyle>): void {
        this.buttonStyle = { ...this.buttonStyle, ...style };
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

        // Use new styling system if style is set, otherwise use legacy buttonStyle
        if (Object.keys(this.style).length > 0) {
            return this.drawWithNewStyle(rl);
        }

        // Legacy rendering
        // Determine color based on state
        let bgColor = this.buttonStyle.normalColor;
        if (this.state.isDisabled) {
            bgColor = this.buttonStyle.disabledColor;
        } else if (this.state.isPressed) {
            bgColor = this.buttonStyle.pressedColor;
        } else if (this.state.isHovered) {
            bgColor = this.buttonStyle.hoverColor;
        }

        // Draw button background
        const result = rl.drawRectangleRec(this.bounds, bgColor);
        if (result.isErr()) return result;

        // Draw border
        if (this.buttonStyle.borderWidth > 0) {
            const borderResult = this.drawBorder(rl);
            if (borderResult.isErr()) return borderResult;
        }

        // Draw text centered
        const textX = this.bounds.x + this.bounds.width / 2 - (this.text.length * this.buttonStyle.fontSize) / 4;
        const textY = this.bounds.y + this.bounds.height / 2 - this.buttonStyle.fontSize / 2;

        return rl.drawText(
            this.text,
            textX,
            textY,
            this.buttonStyle.fontSize,
            this.buttonStyle.textColor
        );
    }

    private drawWithNewStyle(rl: Raylib): RaylibResult<void> {
        // Draw styled rectangle
        const result = UIRenderer.drawStyledRectangle(rl, this.computedBounds, this.style);
        if (result.isErr()) return result;

        // Draw text
        if (this.style.text) {
            const textX = this.computedBounds.x + this.computedBounds.width / 2;
            const textY = this.computedBounds.y + this.computedBounds.height / 2 - this.style.text.fontSize / 2;
            return UIRenderer.drawStyledText(rl, this.text, textX, textY, this.style.text);
        }

        // Fallback text rendering
        const textX = this.computedBounds.x + this.computedBounds.width / 2 - (this.text.length * 20) / 4;
        const textY = this.computedBounds.y + this.computedBounds.height / 2 - 10;
        return rl.drawText(this.text, textX, textY, 20, Colors.BLACK);
    }

    private drawBorder(rl: Raylib): RaylibResult<void> {
        const w = this.buttonStyle.borderWidth;

        // Top
        let result = rl.drawRectangle(
            this.bounds.x,
            this.bounds.y,
            this.bounds.width,
            w,
            this.buttonStyle.borderColor
        );
        if (result.isErr()) return result;

        // Bottom
        result = rl.drawRectangle(
            this.bounds.x,
            this.bounds.y + this.bounds.height - w,
            this.bounds.width,
            w,
            this.buttonStyle.borderColor
        );
        if (result.isErr()) return result;

        // Left
        result = rl.drawRectangle(
            this.bounds.x,
            this.bounds.y,
            w,
            this.bounds.height,
            this.buttonStyle.borderColor
        );
        if (result.isErr()) return result;

        // Right
        return rl.drawRectangle(
            this.bounds.x + this.bounds.width - w,
            this.bounds.y,
            w,
            this.bounds.height,
            this.buttonStyle.borderColor
        );
    }
}
