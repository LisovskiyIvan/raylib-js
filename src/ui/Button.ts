import { UIComponent } from "./UIComponent";
import type Raylib from "../Raylib";
import type { RaylibResult } from "../types";
import { Colors } from "../constants";
import { Ok } from "../result";
import { UIRenderer } from "./UIRenderer";
import Rectangle from "../math/Rectangle";
import Vector2 from "../math/Vector2";

export interface ButtonStyle {
    normalColor: number;
    hoverColor: number;
    pressedColor: number;
    disabledColor: number;
    textColor: number;
    fontSize: number;
    borderWidth: number;
    borderColor: number;
    borderRadius: number;
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
    borderRadius: 0,
};

export class Button extends UIComponent {
    private text: string;
    private buttonStyle: ButtonStyle;
    private onClick?: () => void;
    private wasPressed: boolean = false;

    // Hover animation properties
    private hoverScale: number = 1.0;
    private targetHoverScale: number = 1.0;
    private hoverAnimationSpeed: number = 0.15;
    private maxHoverScale: number = 1.1;
    private colorTransition: number = 0.0; // 0 to 1

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

        // Update hover animation
        this.updateHoverAnimation();
    }

    private updateHoverAnimation(): void {
        // Update target scale based on hover state
        if (this.state.isHovered && !this.state.isDisabled) {
            this.targetHoverScale = this.maxHoverScale;
            this.colorTransition = Math.min(1.0, this.colorTransition + this.hoverAnimationSpeed);
        } else {
            this.targetHoverScale = 1.0;
            this.colorTransition = Math.max(0.0, this.colorTransition - this.hoverAnimationSpeed);
        }

        // Smoothly interpolate current scale towards target
        this.hoverScale += (this.targetHoverScale - this.hoverScale) * this.hoverAnimationSpeed;
    }

    public draw(rl: Raylib): RaylibResult<void> {
        if (!this.visible) return new Ok(undefined);

        // Use new styling system if style is set, otherwise use legacy buttonStyle
        if (Object.keys(this.style).length > 0) {
            return this.drawWithNewStyle(rl);
        }

        // Legacy rendering with hover animation
        // Determine base color based on state with smooth transition
        let bgColor = this.buttonStyle.normalColor;
        if (this.state.isDisabled) {
            bgColor = this.buttonStyle.disabledColor;
        } else if (this.state.isPressed) {
            bgColor = this.buttonStyle.pressedColor;
        } else if (this.colorTransition > 0.5) {
            // Use hover color when transition is more than halfway
            bgColor = this.buttonStyle.hoverColor;
        }

        // Calculate scaled bounds for hover effect
        const scaledBounds = this.getScaledBounds();

        // Draw button background with scale and border radius
        const scaledRadius = this.buttonStyle.borderRadius * this.hoverScale;
        let result: RaylibResult<void>;

        if (scaledRadius > 0) {
            result = this.drawRoundedRectangle(rl, scaledBounds, scaledRadius, bgColor);
        } else {
            result = rl.drawRectangleRec(scaledBounds, bgColor);
        }
        if (result.isErr()) return result;

        // Draw border
        if (this.buttonStyle.borderWidth > 0) {
            const borderResult = scaledRadius > 0
                ? this.drawRoundedBorder(rl, scaledBounds, scaledRadius)
                : this.drawBorderScaled(rl, scaledBounds);
            if (borderResult.isErr()) return borderResult;
        }

        // Draw text centered with scale
        const scaledFontSize = this.buttonStyle.fontSize * this.hoverScale;
        const textX = scaledBounds.x + scaledBounds.width / 2 - (this.text.length * scaledFontSize) / 4;
        const textY = scaledBounds.y + scaledBounds.height / 2 - scaledFontSize / 2;

        return rl.drawText(
            this.text,
            textX,
            textY,
            scaledFontSize,
            this.buttonStyle.textColor
        );
    }

    private getScaledBounds(): Rectangle {
        const centerX = this.bounds.x + this.bounds.width / 2;
        const centerY = this.bounds.y + this.bounds.height / 2;

        const scaledWidth = this.bounds.width * this.hoverScale;
        const scaledHeight = this.bounds.height * this.hoverScale;

        return new Rectangle(
            centerX - scaledWidth / 2,
            centerY - scaledHeight / 2,
            scaledWidth,
            scaledHeight
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

    private drawBorderScaled(rl: Raylib, bounds: Rectangle): RaylibResult<void> {
        const w = this.buttonStyle.borderWidth * this.hoverScale;

        // Top
        let result = rl.drawRectangle(
            bounds.x,
            bounds.y,
            bounds.width,
            w,
            this.buttonStyle.borderColor
        );
        if (result.isErr()) return result;

        // Bottom
        result = rl.drawRectangle(
            bounds.x,
            bounds.y + bounds.height - w,
            bounds.width,
            w,
            this.buttonStyle.borderColor
        );
        if (result.isErr()) return result;

        // Left
        result = rl.drawRectangle(
            bounds.x,
            bounds.y,
            w,
            bounds.height,
            this.buttonStyle.borderColor
        );
        if (result.isErr()) return result;

        // Right
        return rl.drawRectangle(
            bounds.x + bounds.width - w,
            bounds.y,
            w,
            bounds.height,
            this.buttonStyle.borderColor
        );
    }

    private drawRoundedRectangle(rl: Raylib, bounds: Rectangle, radius: number, color: number): RaylibResult<void> {
        const r = Math.min(radius, Math.min(bounds.width, bounds.height) / 2);

        // Draw main rectangles (center cross)
        // Center horizontal rectangle
        let result = rl.drawRectangle(
            bounds.x + r,
            bounds.y,
            bounds.width - 2 * r,
            bounds.height,
            color
        );
        if (result.isErr()) return result;

        // Left vertical rectangle
        result = rl.drawRectangle(
            bounds.x,
            bounds.y + r,
            r,
            bounds.height - 2 * r,
            color
        );
        if (result.isErr()) return result;

        // Right vertical rectangle
        result = rl.drawRectangle(
            bounds.x + bounds.width - r,
            bounds.y + r,
            r,
            bounds.height - 2 * r,
            color
        );
        if (result.isErr()) return result;

        // Draw filled circles at corners for smooth rounded edges
        // Top-left corner
        result = rl.drawCircle(bounds.x + r, bounds.y + r, r, color);
        if (result.isErr()) return result;

        // Top-right corner
        result = rl.drawCircle(bounds.x + bounds.width - r, bounds.y + r, r, color);
        if (result.isErr()) return result;

        // Bottom-right corner
        result = rl.drawCircle(bounds.x + bounds.width - r, bounds.y + bounds.height - r, r, color);
        if (result.isErr()) return result;

        // Bottom-left corner
        return rl.drawCircle(bounds.x + r, bounds.y + bounds.height - r, r, color);
    }

    private drawRoundedBorder(rl: Raylib, bounds: Rectangle, radius: number): RaylibResult<void> {
        const w = this.buttonStyle.borderWidth * this.hoverScale;
        const r = Math.min(radius, Math.min(bounds.width, bounds.height) / 2);
        const color = this.buttonStyle.borderColor;

        // Draw border lines
        // Top line
        let result = rl.drawRectangle(
            bounds.x + r,
            bounds.y,
            bounds.width - 2 * r,
            w,
            color
        );
        if (result.isErr()) return result;

        // Bottom line
        result = rl.drawRectangle(
            bounds.x + r,
            bounds.y + bounds.height - w,
            bounds.width - 2 * r,
            w,
            color
        );
        if (result.isErr()) return result;

        // Left line
        result = rl.drawRectangle(
            bounds.x,
            bounds.y + r,
            w,
            bounds.height - 2 * r,
            color
        );
        if (result.isErr()) return result;

        // Right line
        result = rl.drawRectangle(
            bounds.x + bounds.width - w,
            bounds.y + r,
            w,
            bounds.height - 2 * r,
            color
        );
        if (result.isErr()) return result;

        // Draw corner arcs
        const segments = 8;
        const arcThickness = w;

        // Top-left corner
        result = this.drawCircleArc(
            rl,
            bounds.x + r,
            bounds.y + r,
            r,
            180,
            270,
            segments,
            arcThickness,
            color
        );
        if (result.isErr()) return result;

        // Top-right corner
        result = this.drawCircleArc(
            rl,
            bounds.x + bounds.width - r,
            bounds.y + r,
            r,
            270,
            360,
            segments,
            arcThickness,
            color
        );
        if (result.isErr()) return result;

        // Bottom-right corner
        result = this.drawCircleArc(
            rl,
            bounds.x + bounds.width - r,
            bounds.y + bounds.height - r,
            r,
            0,
            90,
            segments,
            arcThickness,
            color
        );
        if (result.isErr()) return result;

        // Bottom-left corner
        return this.drawCircleArc(
            rl,
            bounds.x + r,
            bounds.y + bounds.height - r,
            r,
            90,
            180,
            segments,
            arcThickness,
            color
        );
    }

    private drawCircleArc(
        rl: Raylib,
        centerX: number,
        centerY: number,
        radius: number,
        startAngle: number,
        endAngle: number,
        segments: number,
        thickness: number,
        color: number
    ): RaylibResult<void> {
        const angleStep = (endAngle - startAngle) / segments;
        const innerRadius = radius - thickness;

        for (let i = 0; i < segments; i++) {
            const angle1 = (startAngle + i * angleStep) * (Math.PI / 180);
            const angle2 = (startAngle + (i + 1) * angleStep) * (Math.PI / 180);

            const outerX1 = centerX + Math.cos(angle1) * radius;
            const outerY1 = centerY + Math.sin(angle1) * radius;
            const outerX2 = centerX + Math.cos(angle2) * radius;
            const outerY2 = centerY + Math.sin(angle2) * radius;

            const innerX1 = centerX + Math.cos(angle1) * innerRadius;
            const innerY1 = centerY + Math.sin(angle1) * innerRadius;
            const innerX2 = centerX + Math.cos(angle2) * innerRadius;
            const innerY2 = centerY + Math.sin(angle2) * innerRadius;

            // Draw two triangles to form a quad
            let result = rl.drawTriangle(
                new Vector2(outerX1, outerY1),
                new Vector2(innerX1, innerY1),
                new Vector2(outerX2, outerY2),
                color
            );
            if (result.isErr()) return result;

            result = rl.drawTriangle(
                new Vector2(innerX1, innerY1),
                new Vector2(innerX2, innerY2),
                new Vector2(outerX2, outerY2),
                color
            );
            if (result.isErr()) return result;
        }

        return new Ok(undefined);
    }
}
