import { UIComponent } from "./UIComponent";
import type Raylib from "../Raylib";
import type { RaylibResult } from "../types";
import { Colors } from "../constants";
import { UIRenderer } from "./UIRenderer";
import { Ok } from "../result";

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
    private labelStyle: LabelStyle;

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
        this.labelStyle = { ...DefaultLabelStyle, ...style };
    }

    public setText(text: string): void {
        this.text = text;
        // Update bounds based on new text
        this.bounds.width = text.length * this.labelStyle.fontSize * 0.5;
    }

    public setLabelStyle(style: Partial<LabelStyle>): void {
        this.labelStyle = { ...this.labelStyle, ...style };
        // Update bounds if font size changed
        this.bounds.width = this.text.length * this.labelStyle.fontSize * 0.5;
        this.bounds.height = this.labelStyle.fontSize;
    }

    public update(rl: Raylib): void {
        // Labels don't need state updates
    }

    public draw(rl: Raylib): RaylibResult<void> {
        if (!this.visible) return new Ok(undefined);

        // Use new styling system if style is set
        if (Object.keys(this.style).length > 0) {
            return this.drawWithNewStyle(rl);
        }

        // Legacy rendering
        // Draw background if specified
        if (this.labelStyle.backgroundColor !== undefined) {
            const bgResult = rl.drawRectangleRec(this.bounds, this.labelStyle.backgroundColor);
            if (bgResult.isErr()) return bgResult;
        }

        // Draw text
        return rl.drawText(
            this.text,
            this.bounds.x,
            this.bounds.y,
            this.labelStyle.fontSize,
            this.labelStyle.textColor
        );
    }

    private drawWithNewStyle(rl: Raylib): RaylibResult<void> {
        // Draw styled rectangle if background is set
        const result = UIRenderer.drawStyledRectangle(rl, this.computedBounds, this.style);
        if (result.isErr()) return result;

        // Draw text
        if (this.style.text) {
            return UIRenderer.drawStyledText(
                rl,
                this.text,
                this.computedBounds.x,
                this.computedBounds.y,
                this.style.text
            );
        }

        // Fallback text rendering
        return rl.drawText(this.text, this.computedBounds.x, this.computedBounds.y, 20, Colors.BLACK);
    }
}
