import type Raylib from "../Raylib";
import type { RaylibResult } from "../types";
import { Ok } from "../result";
import Rectangle from "../math/Rectangle";
import type {
    UIStyleProperties,
    BorderStyle,
    ShadowStyle,
    BackgroundStyle,
    TextStyle,
    TransformStyle,
} from "./UIStyle";
import { UIStyleHelper } from "./UIStyle";

/**
 * Advanced UI rendering utilities with CSS-like styling support
 */
export class UIRenderer {
    /**
     * Draw a styled rectangle with all style properties applied
     */
    static drawStyledRectangle(
        rl: Raylib,
        bounds: Rectangle,
        style: Partial<UIStyleProperties>
    ): RaylibResult<void> {
        const padding = UIStyleHelper.normalizeSpacing(style.padding);
        const innerBounds = new Rectangle(
            bounds.x + padding.left,
            bounds.y + padding.top,
            Math.max(1, bounds.width - padding.left - padding.right),
            Math.max(1, bounds.height - padding.top - padding.bottom)
        );

        // Apply transform if present
        const transformedBounds = this.applyTransform(innerBounds, style.transform);

        // Draw shadow first (behind everything)
        if (style.shadow) {
            const shadowResult = this.drawShadow(rl, transformedBounds, style.shadow);
            if (shadowResult.isErr()) return shadowResult;
        }

        // Draw background
        if (style.background) {
            const bgResult = this.drawBackground(rl, transformedBounds, style.background);
            if (bgResult.isErr()) return bgResult;
        }

        // Draw borders
        if (style.border) {
            const borderResult = this.drawBorder(rl, transformedBounds, style.border);
            if (borderResult.isErr()) return borderResult;
        }

        // Draw individual borders if specified
        if (style.borderTop) {
            const result = this.drawBorderSide(rl, transformedBounds, style.borderTop, "top");
            if (result.isErr()) return result;
        }
        if (style.borderRight) {
            const result = this.drawBorderSide(rl, transformedBounds, style.borderRight, "right");
            if (result.isErr()) return result;
        }
        if (style.borderBottom) {
            const result = this.drawBorderSide(rl, transformedBounds, style.borderBottom, "bottom");
            if (result.isErr()) return result;
        }
        if (style.borderLeft) {
            const result = this.drawBorderSide(rl, transformedBounds, style.borderLeft, "left");
            if (result.isErr()) return result;
        }

        return new Ok(undefined);
    }

    /**
     * Draw text with styling
     */
    static drawStyledText(
        rl: Raylib,
        text: string,
        x: number,
        y: number,
        style: TextStyle
    ): RaylibResult<void> {
        if (typeof style.color !== 'number' || isNaN(style.color)) {
            return new Ok(undefined);
        }

        let finalX = x;

        // Apply text alignment
        if (style.textAlign === "center") {
            const textWidth = text.length * style.fontSize * 0.5;
            finalX = x - textWidth / 2;
        } else if (style.textAlign === "right") {
            const textWidth = text.length * style.fontSize * 0.5;
            finalX = x - textWidth;
        }

        // Draw text decoration (underline/strikethrough)
        if (style.textDecoration === "underline") {
            const textWidth = text.length * style.fontSize * 0.5;
            const lineY = y + style.fontSize + 2;
            const result = rl.drawLine(finalX, lineY, finalX + textWidth, lineY, style.color);
            if (result.isErr()) return result;
        } else if (style.textDecoration === "line-through") {
            const textWidth = text.length * style.fontSize * 0.5;
            const lineY = y + style.fontSize / 2;
            const result = rl.drawLine(finalX, lineY, finalX + textWidth, lineY, style.color);
            if (result.isErr()) return result;
        }

        return rl.drawText(text, finalX, y, style.fontSize, style.color);
    }

    /**
     * Draw shadow effect
     */
    private static drawShadow(
        rl: Raylib,
        bounds: Rectangle,
        shadow: ShadowStyle
    ): RaylibResult<void> {
        if (typeof shadow.color !== 'number' || isNaN(shadow.color)) {
            return new Ok(undefined);
        }

        const shadowBounds = new Rectangle(
            bounds.x + shadow.offsetX,
            bounds.y + shadow.offsetY,
            bounds.width,
            bounds.height
        );

        // Simple shadow (blur not fully implemented, just offset)
        return rl.drawRectangleRec(shadowBounds, shadow.color);
    }

    /**
     * Draw background with gradient support
     */
    private static drawBackground(
        rl: Raylib,
        bounds: Rectangle,
        background: BackgroundStyle
    ): RaylibResult<void> {
        if (background.gradient) {
            return this.drawGradient(rl, bounds, background.gradient);
        }

        if (background.color !== undefined && typeof background.color === 'number' && !isNaN(background.color)) {
            let color = background.color;

            // Apply opacity if specified
            if (background.opacity !== undefined && background.opacity < 1.0) {
                const alpha = Math.round(background.opacity * 255);
                // Format: 0xAABBGGRR - replace alpha channel
                color = (color & 0x00ffffff) | (alpha << 24);
            }

            return rl.drawRectangleRec(bounds, color);
        }

        return new Ok(undefined);
    }

    /**
     * Draw gradient background (simplified implementation)
     */
    private static drawGradient(
        rl: Raylib,
        bounds: Rectangle,
        gradient: { type: string; startColor: number; endColor: number; angle?: number }
    ): RaylibResult<void> {
        if (gradient.type === "linear") {
            // Simple vertical gradient using multiple rectangles
            const steps = 20;
            const stepHeight = bounds.height / steps;

            for (let i = 0; i < steps; i++) {
                const t = i / (steps - 1);
                const color = UIStyleHelper.lerpColor(gradient.startColor, gradient.endColor, t);
                const result = rl.drawRectangle(
                    bounds.x,
                    bounds.y + i * stepHeight,
                    bounds.width,
                    stepHeight + 1, // +1 to avoid gaps
                    color
                );
                if (result.isErr()) return result;
            }

            return new Ok(undefined);
        }

        // Fallback to solid color
        return rl.drawRectangleRec(bounds, gradient.startColor);
    }

    /**
     * Draw border with optional rounded corners
     */
    private static drawBorder(
        rl: Raylib,
        bounds: Rectangle,
        border: BorderStyle
    ): RaylibResult<void> {
        if (typeof border.color !== 'number' || isNaN(border.color)) {
            return new Ok(undefined);
        }

        const w = border.width;

        if (border.radius && border.radius > 0) {
            // Rounded corners (simplified - just draw lines for now)
            // Full rounded rectangle would require more complex rendering
            return this.drawRoundedBorder(rl, bounds, border);
        }

        // Top
        let result = rl.drawRectangle(
            bounds.x,
            bounds.y,
            bounds.width,
            w,
            border.color
        );
        if (result.isErr()) return result;

        // Bottom
        result = rl.drawRectangle(
            bounds.x,
            bounds.y + bounds.height - w,
            bounds.width,
            w,
            border.color
        );
        if (result.isErr()) return result;

        // Left
        result = rl.drawRectangle(
            bounds.x,
            bounds.y,
            w,
            bounds.height,
            border.color
        );
        if (result.isErr()) return result;

        // Right
        return rl.drawRectangle(
            bounds.x + bounds.width - w,
            bounds.y,
            w,
            bounds.height,
            border.color
        );
    }

    /**
     * Draw a single border side
     */
    private static drawBorderSide(
        rl: Raylib,
        bounds: Rectangle,
        border: BorderStyle,
        side: "top" | "right" | "bottom" | "left"
    ): RaylibResult<void> {
        if (typeof border.color !== 'number' || isNaN(border.color)) {
            return new Ok(undefined);
        }

        const w = border.width;

        switch (side) {
            case "top":
                return rl.drawRectangle(bounds.x, bounds.y, bounds.width, w, border.color);
            case "bottom":
                return rl.drawRectangle(
                    bounds.x,
                    bounds.y + bounds.height - w,
                    bounds.width,
                    w,
                    border.color
                );
            case "left":
                return rl.drawRectangle(bounds.x, bounds.y, w, bounds.height, border.color);
            case "right":
                return rl.drawRectangle(
                    bounds.x + bounds.width - w,
                    bounds.y,
                    w,
                    bounds.height,
                    border.color
                );
        }
    }

    /**
     * Draw rounded border (simplified implementation)
     */
    private static drawRoundedBorder(
        rl: Raylib,
        bounds: Rectangle,
        border: BorderStyle
    ): RaylibResult<void> {
        // For now, just draw regular border
        // Full implementation would use DrawRectangleRounded from raylib
        return this.drawBorder(rl, bounds, { ...border, radius: undefined });
    }

    /**
     * Apply transform to bounds
     */
    private static applyTransform(
        bounds: Rectangle,
        transform?: TransformStyle
    ): Rectangle {
        if (!transform) return bounds;

        const result = new Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);

        // Apply translation
        if (transform.translateX) result.x += transform.translateX;
        if (transform.translateY) result.y += transform.translateY;

        // Apply scale
        if (transform.scaleX) result.width *= transform.scaleX;
        if (transform.scaleY) result.height *= transform.scaleY;

        // Rotation would require more complex transformation
        // Not implemented in this simplified version

        return result;
    }

    /**
     * Calculate text bounds with styling
     */
    static measureText(text: string, style: TextStyle): { width: number; height: number } {
        const width = text.length * style.fontSize * 0.5;
        const height = style.fontSize * (style.lineHeight || 1.0);
        return { width, height };
    }
}
