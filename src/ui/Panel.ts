import { UIComponent } from "./UIComponent";
import type Raylib from "../Raylib";
import type { RaylibResult } from "../types";
import { Colors } from "../constants";
import { Ok } from "../result";

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
    private style: PanelStyle;
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
        this.style = { ...DefaultPanelStyle, ...style };
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

    public setStyle(style: Partial<PanelStyle>): void {
        this.style = { ...this.style, ...style };
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

        // Draw background
        let result = rl.drawRectangleRec(this.bounds, this.style.backgroundColor);
        if (result.isErr()) return result;

        // Draw border
        if (this.style.borderWidth > 0) {
            result = this.drawBorder(rl);
            if (result.isErr()) return result;
        }

        // Draw title if present
        if (this.title) {
            const titleX = this.bounds.x + this.style.padding;
            const titleY = this.bounds.y + this.style.padding;
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
