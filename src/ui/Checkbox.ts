import { UIComponent } from "./UIComponent";
import type Raylib from "../Raylib";
import type { RaylibResult } from "../types";
import { Colors } from "../constants";
import { Ok } from "../result";

export interface CheckboxStyle {
    boxColor: number;
    checkColor: number;
    hoverColor: number;
    disabledColor: number;
    borderColor: number;
    borderWidth: number;
    checkSize: number;
}

export const DefaultCheckboxStyle: CheckboxStyle = {
    boxColor: Colors.WHITE,
    checkColor: Colors.GREEN,
    hoverColor: Colors.LIGHTGRAY,
    disabledColor: Colors.GRAY,
    borderColor: Colors.BLACK,
    borderWidth: 2,
    checkSize: 20,
};

export class Checkbox extends UIComponent {
    private checked: boolean;
    private label: string;
    private style: CheckboxStyle;
    private onChange?: (checked: boolean) => void;
    private wasPressed: boolean = false;

    constructor(
        x: number,
        y: number,
        label: string = "",
        initialChecked: boolean = false,
        style: Partial<CheckboxStyle> = {}
    ) {
        const size = DefaultCheckboxStyle.checkSize;
        super(x, y, size, size);
        this.checked = initialChecked;
        this.label = label;
        this.style = { ...DefaultCheckboxStyle, ...style };
    }

    public isChecked(): boolean {
        return this.checked;
    }

    public setChecked(checked: boolean): void {
        if (this.checked !== checked) {
            this.checked = checked;
            if (this.onChange) {
                this.onChange(this.checked);
            }
        }
    }

    public toggle(): void {
        this.setChecked(!this.checked);
    }

    public setOnChange(callback: (checked: boolean) => void): void {
        this.onChange = callback;
    }

    public setLabel(label: string): void {
        this.label = label;
    }

    public setStyle(style: Partial<CheckboxStyle>): void {
        this.style = { ...this.style, ...style };
    }

    public update(rl: Raylib): void {
        this.updateState(rl);

        // Detect click
        if (this.wasPressed && !this.state.isPressed && this.state.isHovered) {
            if (!this.state.isDisabled) {
                this.toggle();
            }
        }

        this.wasPressed = this.state.isPressed;
    }

    public draw(rl: Raylib): RaylibResult<void> {
        if (!this.visible) return new Ok(undefined);

        // Determine box color
        let boxColor = this.style.boxColor;
        if (this.state.isDisabled) {
            boxColor = this.style.disabledColor;
        } else if (this.state.isHovered) {
            boxColor = this.style.hoverColor;
        }

        // Draw checkbox box
        let result = rl.drawRectangleRec(this.bounds, boxColor);
        if (result.isErr()) return result;

        // Draw border
        const w = this.style.borderWidth;

        // Top
        result = rl.drawRectangle(
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
        result = rl.drawRectangle(
            this.bounds.x + this.bounds.width - w,
            this.bounds.y,
            w,
            this.bounds.height,
            this.style.borderColor
        );
        if (result.isErr()) return result;

        // Draw check mark if checked
        if (this.checked) {
            const padding = this.bounds.width * 0.2;
            result = rl.drawRectangle(
                this.bounds.x + padding,
                this.bounds.y + padding,
                this.bounds.width - padding * 2,
                this.bounds.height - padding * 2,
                this.style.checkColor
            );
            if (result.isErr()) return result;
        }

        // Draw label if present
        if (this.label) {
            const labelX = this.bounds.x + this.bounds.width + 10;
            const labelY = this.bounds.y + this.bounds.height / 2 - 10;
            result = rl.drawText(this.label, labelX, labelY, 20, Colors.BLACK);
            if (result.isErr()) return result;
        }

        return new Ok(undefined);
    }
}
