import { UIComponent } from "./UIComponent";
import type Raylib from "../Raylib";
import type { RaylibResult } from "../types";
import { Colors } from "../constants";

export interface LabelStyle {
    textColor: number;
    fontSize: number;
    backgroundColor?: number;
}

export const DefaultLabelStyle: LabelStyle = {
    textColor: Colors.BLACK,
    fontSize: 20,
};

export class Label extends UIComponent {
    private text: string;
    private style: LabelStyle;

    constructor(
        x: number,
        y: number,
        text: string,
        style: Partial<LabelStyle> = {}
    ) {
        // Approximate width based on text length
        const fontSize = style.fontSize || DefaultLabelStyle.fontSize;
        const width = text.length * fontSize * 0.5;
        const height = fontSize;

        super(x, y, width, height);
        this.text = text;
        this.style = { ...DefaultLabelStyle, ...style };
    }

    public setText(text: string): void {
        this.text = text;
        // Update bounds based on new text
        this.bounds.width = text.length * this.style.fontSize * 0.5;
    }

    public setStyle(style: Partial<LabelStyle>): void {
        this.style = { ...this.style, ...style };
        // Update bounds if font size changed
        this.bounds.width = this.text.length * this.style.fontSize * 0.5;
        this.bounds.height = this.style.fontSize;
    }

    public update(rl: Raylib): void {
        // Labels don't need state updates
    }

    public draw(rl: Raylib): RaylibResult<void> {
        if (!this.visible) return rl.drawText("", 0, 0, 1, Colors.BLACK);

        // Draw background if specified
        if (this.style.backgroundColor !== undefined) {
            const bgResult = rl.drawRectangleRec(this.bounds, this.style.backgroundColor);
            if (bgResult.isErr()) return bgResult;
        }

        // Draw text
        return rl.drawText(
            this.text,
            this.bounds.x,
            this.bounds.y,
            this.style.fontSize,
            this.style.textColor
        );
    }
}
