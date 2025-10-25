import { UIComponent } from "./UIComponent";
import type Raylib from "../Raylib";
import type { RaylibResult } from "../types";
import { Colors } from "../constants";
import { Ok } from "../result";
import { UIRenderer } from "./UIRenderer";

export interface PanelStyle {
    backgroundColor: number;
    borderColor: number;
    borderWidth: number;
    padding: number;
}

export const DefaultPanelStyle: PanelStyle = {
    backgroundColor: Colors.RAYWHITE,
    borderColor: Colors.DARKGRAY,
    borderWidth: 2,
    padding: 10,
};

export class Panel extends UIComponent {
    private children: UIComponent[] = [];
    private panelStyle: PanelStyle;
    private title?: string;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        title?: string,
        style: Partial<PanelStyle> = {}
    ) {
        super(x, y, width, height);
        this.title = title;
        this.panelStyle = { ...DefaultPanelStyle, ...style };
    }

    public addChild(component: UIComponent): void {
        this.children.push(component);
    }

    public removeChild(component: UIComponent): void {
        const index = this.children.indexOf(component);
        if (index > -1) {
            this.children.splice(index, 1);
        }
    }

    public clearChildren(): void {
        this.children = [];
    }

    public getChildren(): UIComponent[] {
        return this.children;
    }

    public setPanelStyle(style: Partial<PanelStyle>): void {
        this.panelStyle = { ...this.panelStyle, ...style };
    }

    public setTitle(title: string): void {
        this.title = title;
    }

    public update(rl: Raylib): void {
        this.updateState(rl);

        if (!this.visible) return;

        // Update all children
        for (const child of this.children) {
            child.update(rl);
        }
    }

    public draw(rl: Raylib): RaylibResult<void> {
        if (!this.visible) return new Ok(undefined);

        // Use new styling system if style is set
        if (Object.keys(this.style).length > 0) {
            return this.drawWithNewStyle(rl);
        }

        // Legacy rendering
        // Draw background
        let result = rl.drawRectangleRec(this.bounds, this.panelStyle.backgroundColor);
        if (result.isErr()) return result;

        // Draw border
        if (this.panelStyle.borderWidth > 0) {
            result = this.drawBorder(rl);
            if (result.isErr()) return result;
        }

        // Draw title if present
        if (this.title) {
            const titleX = this.bounds.x + this.panelStyle.padding;
            const titleY = this.bounds.y + this.panelStyle.padding;
            result = rl.drawText(this.title, titleX, titleY, 20, Colors.BLACK);
            if (result.isErr()) return result;
        }

        // Draw all children
        for (const child of this.children) {
            result = child.draw(rl);
            if (result.isErr()) return result;
        }

        return new Ok(undefined);
    }

    private drawWithNewStyle(rl: Raylib): RaylibResult<void> {
        // Draw styled rectangle
        let result = UIRenderer.drawStyledRectangle(rl, this.computedBounds, this.style);
        if (result.isErr()) return result;

        // Draw title if present
        if (this.title && this.style.text) {
            const titleX = this.computedBounds.x + 10;
            const titleY = this.computedBounds.y + 10;
            result = UIRenderer.drawStyledText(rl, this.title, titleX, titleY, this.style.text);
            if (result.isErr()) return result;
        } else if (this.title) {
            const titleX = this.computedBounds.x + 10;
            const titleY = this.computedBounds.y + 10;
            result = rl.drawText(this.title, titleX, titleY, 20, Colors.BLACK);
            if (result.isErr()) return result;
        }

        // Draw all children
        for (const child of this.children) {
            result = child.draw(rl);
            if (result.isErr()) return result;
        }

        return new Ok(undefined);
    }

    private drawBorder(rl: Raylib): RaylibResult<void> {
        const w = this.panelStyle.borderWidth;

        // Top
        let result = rl.drawRectangle(
            this.bounds.x,
            this.bounds.y,
            this.bounds.width,
            w,
            this.panelStyle.borderColor
        );
        if (result.isErr()) return result;

        // Bottom
        result = rl.drawRectangle(
            this.bounds.x,
            this.bounds.y + this.bounds.height - w,
            this.bounds.width,
            w,
            this.panelStyle.borderColor
        );
        if (result.isErr()) return result;

        // Left
        result = rl.drawRectangle(
            this.bounds.x,
            this.bounds.y,
            w,
            this.bounds.height,
            this.panelStyle.borderColor
        );
        if (result.isErr()) return result;

        // Right
        return rl.drawRectangle(
            this.bounds.x + this.bounds.width - w,
            this.bounds.y,
            w,
            this.bounds.height,
            this.panelStyle.borderColor
        );
    }
}
