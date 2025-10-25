import {
    Raylib,
    Colors,
    Button,
    Panel,
    Label,
    UIThemes,
    UIStyleHelper,
    UIRenderer,
} from "../src/index";

const rl = new Raylib();

// Initialize window
const result = rl
    .initWindow(1000, 700, "Advanced UI Styling Demo")
    .andThen(() => rl.setTargetFPS(60))
    .andThen(() => {
        // Example 1: Button with custom CSS-like styling
        const styledButton = new Button(50, 50, 200, 60, "Styled Button");
        styledButton.setStyle({
            padding: 15,
            border: {
                width: 3,
                color: Colors.BLUE,
            },
            background: {
                color: Colors.SKYBLUE,
            },
            text: {
                fontSize: 22,
                color: Colors.DARKBLUE,
                textAlign: "center",
            },
            shadow: {
                offsetX: 3,
                offsetY: 3,
                blur: 5,
                color: Colors.GRAY,
            },
        });

        // Example 2: Simple styled button
        const gradientButton = new Button(270, 50, 200, 60, "Purple Button");
        gradientButton.setStyle({
            padding: 12,
            border: { width: 2, color: Colors.VIOLET },
            background: { color: Colors.PURPLE },
            text: {
                fontSize: 20,
                color: Colors.WHITE,
                textAlign: "center",
            },
        });

        // Example 3: Panel with modern theme
        const modernPanel = new Panel(50, 140, 440, 250, "Modern Panel");
        modernPanel.applyStyle(UIThemes.modern.panel);

        // Example 4: Label with custom spacing and borders
        const fancyLabel = new Label(70, 180, "Fancy Label with Styling");
        fancyLabel.setStyle({
            padding: { top: 10, right: 20, bottom: 10, left: 20 },
            margin: 5,
            border: {
                width: 2,
                color: Colors.ORANGE,
            },
            background: {
                color: Colors.GOLD,
            },
            text: {
                fontSize: 18,
                color: Colors.DARKBROWN,
                textDecoration: "underline",
                textAlign: "left",
            },
        });

        // Example 5: Buttons with different border styles
        const topBorderButton = new Button(70, 240, 150, 40, "Top Border");
        topBorderButton.setStyle({
            borderTop: { width: 4, color: Colors.RED },
            background: { color: Colors.LIGHTGRAY },
            text: { fontSize: 16, color: Colors.BLACK, textAlign: "center" },
        });

        const bottomBorderButton = new Button(240, 240, 150, 40, "Bottom Border");
        bottomBorderButton.setStyle({
            borderBottom: { width: 4, color: Colors.GREEN },
            background: { color: Colors.LIGHTGRAY },
            text: { fontSize: 16, color: Colors.BLACK, textAlign: "center" },
        });

        const leftBorderButton = new Button(70, 300, 150, 40, "Left Border");
        leftBorderButton.setStyle({
            borderLeft: { width: 4, color: Colors.BLUE },
            background: { color: Colors.LIGHTGRAY },
            text: { fontSize: 16, color: Colors.BLACK, textAlign: "center" },
        });

        const rightBorderButton = new Button(240, 300, 150, 40, "Right Border");
        rightBorderButton.setStyle({
            borderRight: { width: 4, color: Colors.YELLOW },
            background: { color: Colors.LIGHTGRAY },
            text: { fontSize: 16, color: Colors.BLACK, textAlign: "center" },
        });

        // Example 6: Dark theme panel
        const darkPanel = new Panel(520, 50, 440, 340, "Dark Theme Panel");
        darkPanel.applyStyle(UIThemes.dark.panel);

        const darkLabel1 = new Label(540, 90, "Dark theme is enabled");
        darkLabel1.applyStyle(UIThemes.dark.label);

        const darkButton1 = new Button(540, 130, 180, 50, "Dark Button 1");
        darkButton1.applyStyle(UIThemes.dark.button);

        const darkButton2 = new Button(740, 130, 180, 50, "Dark Button 2");
        darkButton2.applyStyle(UIThemes.dark.button);

        // Example 7: Transform demonstration
        const transformLabel = new Label(540, 200, "Transformed Text");
        transformLabel.setStyle({
            text: { fontSize: 24, color: Colors.RAYWHITE, textAlign: "left" },
            transform: {
                translateX: 10,
                translateY: 5,
                scaleX: 1.2,
                scaleY: 1.0,
            },
        });

        // Example 8: Opacity demonstration
        const colorPanel1 = new Panel(540, 260, 120, 100);
        colorPanel1.setStyle({
            background: { color: Colors.RED },
            border: { width: 1, color: Colors.BLACK },
        });

        const colorPanel2 = new Panel(680, 260, 120, 100);
        colorPanel2.setStyle({
            background: { color: Colors.GREEN },
            border: { width: 1, color: Colors.BLACK },
        });

        const colorPanel3 = new Panel(820, 260, 120, 100);
        colorPanel3.setStyle({
            background: { color: Colors.BLUE },
            border: { width: 1, color: Colors.BLACK },
        });

        const colorLabel = new Label(540, 370, "Colors: Red  Green  Blue");
        colorLabel.setStyle({
            text: { fontSize: 16, color: Colors.RAYWHITE, textAlign: "left" },
        });

        // Example 9: Spacing demonstration
        const spacingPanel = new Panel(50, 420, 910, 250, "Spacing & Padding Demo");
        spacingPanel.setStyle({
            padding: 20,
            border: { width: 2, color: Colors.DARKGRAY },
            background: { color: Colors.BEIGE },
        });

        const innerPanel1 = new Panel(70, 460, 150, 80);
        innerPanel1.setStyle({
            padding: 5,
            margin: 10,
            background: { color: Colors.SKYBLUE },
            border: { width: 2, color: Colors.BLUE },
        });

        const innerPanel2 = new Panel(240, 460, 150, 80);
        innerPanel2.setStyle({
            padding: 15,
            margin: 5,
            background: { color: Colors.LIME },
            border: { width: 2, color: Colors.GREEN },
        });

        const innerPanel3 = new Panel(410, 460, 150, 80);
        innerPanel3.setStyle({
            padding: { top: 5, right: 20, bottom: 5, left: 20 },
            margin: { top: 10, right: 5, bottom: 10, left: 5 },
            background: { color: Colors.PINK },
            border: { width: 2, color: Colors.MAROON },
        });

        const spacingLabel1 = new Label(70, 560, "Padding: 5, Margin: 10");
        spacingLabel1.setStyle({ text: { fontSize: 14, color: Colors.DARKGRAY, textAlign: "left" } });

        const spacingLabel2 = new Label(240, 560, "Padding: 15, Margin: 5");
        spacingLabel2.setStyle({ text: { fontSize: 14, color: Colors.DARKGRAY, textAlign: "left" } });

        const spacingLabel3 = new Label(410, 560, "Custom P & M");
        spacingLabel3.setStyle({ text: { fontSize: 14, color: Colors.DARKGRAY, textAlign: "left" } });

        // Style merging example
        const mergeButton = new Button(590, 460, 180, 50, "Merge Styles");
        const baseStyle = UIThemes.modern.button;
        const customStyle = {
            background: { color: Colors.ORANGE },
            text: { fontSize: 18, color: Colors.WHITE, textAlign: "center" as const },
        };
        mergeButton.applyStyle(UIStyleHelper.mergeStyles(baseStyle, customStyle));

        // Add click handlers
        styledButton.setOnClick(() => console.log("Styled button clicked!"));
        gradientButton.setOnClick(() => console.log("Gradient button clicked!"));
        darkButton1.setOnClick(() => console.log("Dark button 1 clicked!"));
        darkButton2.setOnClick(() => console.log("Dark button 2 clicked!"));
        mergeButton.setOnClick(() => console.log("Merged style button clicked!"));

        // Add components to panels
        modernPanel.addChild(fancyLabel);
        modernPanel.addChild(topBorderButton);
        modernPanel.addChild(bottomBorderButton);
        modernPanel.addChild(leftBorderButton);
        modernPanel.addChild(rightBorderButton);

        darkPanel.addChild(darkLabel1);
        darkPanel.addChild(darkButton1);
        darkPanel.addChild(darkButton2);
        darkPanel.addChild(transformLabel);
        darkPanel.addChild(colorPanel1);
        darkPanel.addChild(colorPanel2);
        darkPanel.addChild(colorPanel3);
        darkPanel.addChild(colorLabel);

        spacingPanel.addChild(innerPanel1);
        spacingPanel.addChild(innerPanel2);
        spacingPanel.addChild(innerPanel3);
        spacingPanel.addChild(spacingLabel1);
        spacingPanel.addChild(spacingLabel2);
        spacingPanel.addChild(spacingLabel3);
        spacingPanel.addChild(mergeButton);

        // Game loop
        while (true) {
            const shouldClose = rl.windowShouldClose().unwrapOr(true);
            if (shouldClose) break;

            // Update
            styledButton.update(rl);
            gradientButton.update(rl);
            modernPanel.update(rl);
            darkPanel.update(rl);
            spacingPanel.update(rl);

            // Draw
            rl.beginDrawing()
                .andThen(() => rl.clearBackground(Colors.DARKGRAY))
                .andThen(() => styledButton.draw(rl))
                .andThen(() => gradientButton.draw(rl))
                .andThen(() => modernPanel.draw(rl))
                .andThen(() => darkPanel.draw(rl))
                .andThen(() => spacingPanel.draw(rl))
                .andThen(() =>
                    rl.drawText(
                        "Advanced CSS-like Styling System",
                        10,
                        10,
                        20,
                        Colors.RAYWHITE
                    )
                )
                .andThen(() => rl.drawFPS(900, 10))
                .andThen(() => rl.endDrawing())
                .match(
                    () => { },
                    (error) => {
                        console.error("Frame error:", error.message);
                        return;
                    }
                );
        }

        return rl.closeWindow();
    });

result.match(
    () => console.log("Advanced styling demo completed successfully!"),
    (error) => {
        console.error("Error:", error.message);
        if (error.context) console.error("Context:", error.context);
    }
);
