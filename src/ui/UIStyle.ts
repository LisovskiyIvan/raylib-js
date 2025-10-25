import { Colors } from "../constants";

/**
 * CSS-like styling system for UI components
 */

// Spacing (padding/margin)
export interface Spacing {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

// Border styling
export interface BorderStyle {
    width: number;
    color: number;
    radius?: number; // Border radius for rounded corners
}

// Shadow effect
export interface ShadowStyle {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: number;
}

// Text styling
export interface TextStyle {
    fontSize: number;
    color: number;
    fontFamily?: string;
    lineHeight?: number;
    letterSpacing?: number;
    textAlign?: "left" | "center" | "right";
    textDecoration?: "none" | "underline" | "line-through";
}

// Background styling
export interface BackgroundStyle {
    color?: number;
    opacity?: number; // 0.0 to 1.0
    gradient?: {
        type: "linear" | "radial";
        startColor: number;
        endColor: number;
        angle?: number; // For linear gradient
    };
}

// Layout properties
export interface LayoutStyle {
    display?: "block" | "inline" | "flex" | "none";
    position?: "static" | "relative" | "absolute";
    flexDirection?: "row" | "column";
    justifyContent?: "start" | "center" | "end" | "space-between" | "space-around";
    alignItems?: "start" | "center" | "end" | "stretch";
    gap?: number;
}

// Transform properties
export interface TransformStyle {
    translateX?: number;
    translateY?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number; // In degrees
    originX?: number; // 0.0 to 1.0 (0 = left, 0.5 = center, 1 = right)
    originY?: number; // 0.0 to 1.0 (0 = top, 0.5 = center, 1 = bottom)
}

// Animation/Transition
export interface TransitionStyle {
    property: string;
    duration: number; // In milliseconds
    easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
    delay?: number;
}

// Complete UI Style
export interface UIStyleProperties {
    // Dimensions
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;

    // Spacing
    padding?: Spacing | number; // number applies to all sides
    margin?: Spacing | number;

    // Border
    border?: BorderStyle;
    borderTop?: BorderStyle;
    borderRight?: BorderStyle;
    borderBottom?: BorderStyle;
    borderLeft?: BorderStyle;

    // Background
    background?: BackgroundStyle;

    // Text
    text?: TextStyle;

    // Shadow
    shadow?: ShadowStyle;

    // Layout
    layout?: LayoutStyle;

    // Transform
    transform?: TransformStyle;

    // Transitions
    transitions?: TransitionStyle[];

    // Cursor
    cursor?: "default" | "pointer" | "text" | "move" | "not-allowed";

    // Opacity
    opacity?: number; // 0.0 to 1.0

    // Z-index for layering
    zIndex?: number;

    // Overflow behavior
    overflow?: "visible" | "hidden" | "scroll";
}

/**
 * Helper functions for working with styles
 */
export class UIStyleHelper {
    /**
     * Convert number or Spacing to full Spacing object
     */
    static normalizeSpacing(value: number | Spacing | undefined): Spacing {
        if (value === undefined) {
            return { top: 0, right: 0, bottom: 0, left: 0 };
        }
        if (typeof value === "number") {
            return { top: value, right: value, bottom: value, left: value };
        }
        return value;
    }

    /**
     * Merge two style objects (second overrides first)
     */
    static mergeStyles(
        base: Partial<UIStyleProperties>,
        override: Partial<UIStyleProperties>
    ): UIStyleProperties {
        return {
            ...base,
            ...override,
            padding: override.padding !== undefined
                ? override.padding
                : base.padding,
            margin: override.margin !== undefined
                ? override.margin
                : base.margin,
            border: override.border !== undefined
                ? { ...base.border, ...override.border }
                : base.border,
            background: override.background !== undefined
                ? { ...base.background, ...override.background }
                : base.background,
            text: override.text !== undefined
                ? { ...base.text, ...override.text }
                : base.text,
            shadow: override.shadow !== undefined
                ? { ...base.shadow, ...override.shadow }
                : base.shadow,
            layout: override.layout !== undefined
                ? { ...base.layout, ...override.layout }
                : base.layout,
            transform: override.transform !== undefined
                ? { ...base.transform, ...override.transform }
                : base.transform,
        };
    }

    /**
     * Create a default text style
     */
    static defaultTextStyle(): TextStyle {
        return {
            fontSize: 20,
            color: Colors.BLACK,
            textAlign: "left",
            textDecoration: "none",
        };
    }

    /**
     * Create a default border style
     */
    static defaultBorderStyle(): BorderStyle {
        return {
            width: 1,
            color: Colors.DARKGRAY,
        };
    }

    /**
     * Create a default background style
     */
    static defaultBackgroundStyle(): BackgroundStyle {
        return {
            color: Colors.LIGHTGRAY,
            opacity: 1.0,
        };
    }

    /**
     * Interpolate between two colors (for animations)
     * Colors in format 0xAABBGGRR
     */
    static lerpColor(color1: number, color2: number, t: number): number {
        // Extract RGBA components (format: 0xAABBGGRR)
        const r1 = color1 & 0xff;
        const g1 = (color1 >> 8) & 0xff;
        const b1 = (color1 >> 16) & 0xff;
        const a1 = (color1 >> 24) & 0xff;

        const r2 = color2 & 0xff;
        const g2 = (color2 >> 8) & 0xff;
        const b2 = (color2 >> 16) & 0xff;
        const a2 = (color2 >> 24) & 0xff;

        // Interpolate
        const r = Math.round(r1 + (r2 - r1) * t) & 0xff;
        const g = Math.round(g1 + (g2 - g1) * t) & 0xff;
        const b = Math.round(b1 + (b2 - b1) * t) & 0xff;
        const a = Math.round(a1 + (a2 - a1) * t) & 0xff;

        // Combine back in format 0xAABBGGRR
        return (a << 24) | (b << 16) | (g << 8) | r;
    }

    /**
     * Apply easing function
     */
    static applyEasing(t: number, easing: string = "linear"): number {
        switch (easing) {
            case "ease-in":
                return t * t;
            case "ease-out":
                return t * (2 - t);
            case "ease-in-out":
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            default:
                return t;
        }
    }
}

/**
 * Predefined style themes
 */
export const UIThemes = {
    default: {
        button: {
            padding: 10,
            border: { width: 2, color: Colors.DARKGRAY },
            background: { color: Colors.LIGHTGRAY },
            text: { fontSize: 20, color: Colors.BLACK, textAlign: "center" as const },
        },
        panel: {
            padding: 10,
            border: { width: 2, color: Colors.DARKGRAY },
            background: { color: Colors.RAYWHITE },
        },
        label: {
            text: { fontSize: 20, color: Colors.BLACK, textAlign: "left" as const },
        },
    },
    dark: {
        button: {
            padding: 10,
            border: { width: 2, color: Colors.GRAY },
            background: { color: Colors.DARKGRAY },
            text: { fontSize: 20, color: Colors.RAYWHITE, textAlign: "center" as const },
        },
        panel: {
            padding: 10,
            border: { width: 2, color: Colors.GRAY },
            background: { color: Colors.BLACK },
        },
        label: {
            text: { fontSize: 20, color: Colors.RAYWHITE, textAlign: "left" as const },
        },
    },
    modern: {
        button: {
            padding: 12,
            border: { width: 0, color: Colors.BLANK, radius: 8 },
            background: { color: Colors.BLUE },
            text: { fontSize: 18, color: Colors.WHITE, textAlign: "center" as const },
            shadow: { offsetX: 0, offsetY: 2, blur: 4, color: Colors.GRAY },
        },
        panel: {
            padding: 16,
            border: { width: 1, color: Colors.LIGHTGRAY, radius: 12 },
            background: { color: Colors.WHITE },
            shadow: { offsetX: 0, offsetY: 4, blur: 8, color: Colors.LIGHTGRAY },
        },
        label: {
            text: { fontSize: 16, color: Colors.DARKGRAY, textAlign: "left" as const },
        },
    },
};
