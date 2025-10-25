import { UIComponent } from "./UIComponent";
import type Raylib from "../Raylib";
import type { RaylibResult } from "../types";
import { Colors } from "../constants";
import { Ok } from "../result";
import Vector2 from "../math/Vector2";

export interface SliderStyle {
    trackColor: number;
    handleColor: number;
    handleHoverColor: number;
    handlePressedColor: number;
    handleRadius: number;
    trackHeight: number;
}

export const DefaultSliderStyle: SliderStyle = {
    trackColor: Colors.DARKGRAY,
    handleColor: Colors.LIGHTGRAY,
    handleHoverColor: Colors.GRAY,
    handlePressedColor: Colors.WHITE,
    handleRadius: 10,
    trackHeight: 6,
};

export class Slider extends UIComponent {
    private value: number;
    private minValue: number;
    private maxValue: number;
    private style: SliderStyle;
    private onChange?: (value: number) => void;
    private isDragging: boolean = false;

    constructor(
        x: number,
        y: number,
        width: number,
        minValue: number = 0,
        maxValue: number = 100,
        initialValue: number = 50,
        style: Partial<SliderStyle> = {}
    ) {
        super(x, y, width, DefaultSliderStyle.handleRadius * 2);
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.value = Math.max(minValue, Math.min(maxValue, initialValue));
        this.style = { ...DefaultSliderStyle, ...style };
    }

    public getValue(): number {
        return this.value;
    }

    public setValue(value: number): void {
        const oldValue = this.value;
        this.value = Math.max(this.minValue, Math.min(this.maxValue, value));

        if (oldValue !== this.value && this.onChange) {
            this.onChange(this.value);
        }
    }

    public setOnChange(callback: (value: number) => void): void {
        this.onChange = callback;
    }

    public setStyle(style: Partial<SliderStyle>): void {
        this.style = { ...this.style, ...style };
    }

    public update(rl: Raylib): void {
        this.updateState(rl);

        if (this.state.isDisabled) {
            this.isDragging = false;
            return;
        }

        const mousePos = rl.getMousePosition().unwrapOr(Vector2.Zero());
        const isMouseDown = rl.isMouseButtonDown(0).unwrapOr(false);

        // Start dragging
        if (this.state.isHovered && isMouseDown && !this.isDragging) {
            this.isDragging = true;
        }

        // Stop dragging
        if (!isMouseDown) {
            this.isDragging = false;
        }

        // Update value while dragging
        if (this.isDragging) {
            const relativeX = mousePos.x - this.bounds.x;
            const percentage = Math.max(0, Math.min(1, relativeX / this.bounds.width));
            const newValue = this.minValue + percentage * (this.maxValue - this.minValue);
            this.setValue(newValue);
        }
    }

    public draw(rl: Raylib): RaylibResult<void> {
        if (!this.visible) return new Ok(undefined);

        const trackY = this.bounds.y + this.bounds.height / 2 - this.style.trackHeight / 2;

        // Draw track
        let result = rl.drawRectangle(
            this.bounds.x,
            trackY,
            this.bounds.width,
            this.style.trackHeight,
            this.style.trackColor
        );
        if (result.isErr()) return result;

        // Calculate handle position
        const percentage = (this.value - this.minValue) / (this.maxValue - this.minValue);
        const handleX = this.bounds.x + percentage * this.bounds.width;
        const handleY = this.bounds.y + this.bounds.height / 2;

        // Determine handle color
        let handleColor = this.style.handleColor;
        if (this.isDragging) {
            handleColor = this.style.handlePressedColor;
        } else if (this.state.isHovered) {
            handleColor = this.style.handleHoverColor;
        }

        // Draw handle
        return rl.drawCircle(handleX, handleY, this.style.handleRadius, handleColor);
    }
}
