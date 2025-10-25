import { Raylib, Colors, Button, Slider, Checkbox, Panel, Label } from "../src/index";

const rl = new Raylib();

// Initialize window
const result = rl
    .initWindow(800, 600, "UI Components Demo")
    .andThen(() => rl.setTargetFPS(60))
    .andThen(() => {
        // Create UI components
        const panel = new Panel(50, 50, 700, 500, "UI Components Demo");

        // Title label
        const titleLabel = new Label(70, 90, "Raylib UI System", {
            fontSize: 30,
            textColor: Colors.BLUE,
        });

        // Button
        const button = new Button(70, 140, 200, 50, "Click Me!");
        let clickCount = 0;
        button.setOnClick(() => {
            clickCount++;
            console.log(`Button clicked ${clickCount} times!`);
        });

        // Slider
        const slider = new Slider(70, 220, 300, 0, 100, 50);
        const sliderLabel = new Label(70, 190, "Volume: 50", {
            fontSize: 20,
            textColor: Colors.DARKGRAY,
        });
        slider.setOnChange((value) => {
            sliderLabel.setText(`Volume: ${Math.round(value)}`);
        });

        // Checkboxes
        const checkbox1 = new Checkbox(70, 270, "Enable Sound", true);
        const checkbox2 = new Checkbox(70, 310, "Enable Music", false);
        const checkbox3 = new Checkbox(70, 350, "Fullscreen", false);

        checkbox1.setOnChange((checked) => {
            console.log(`Sound: ${checked ? "ON" : "OFF"}`);
        });

        checkbox2.setOnChange((checked) => {
            console.log(`Music: ${checked ? "ON" : "OFF"}`);
        });

        checkbox3.setOnChange((checked) => {
            console.log(`Fullscreen: ${checked ? "ON" : "OFF"}`);
        });

        // Color buttons
        const colorLabel = new Label(70, 400, "Choose Color:", {
            fontSize: 20,
            textColor: Colors.DARKGRAY,
        });

        let selectedColor = Colors.BLUE;
        const colorDisplay = new Panel(70, 430, 100, 50);
        colorDisplay.setStyle({ backgroundColor: selectedColor, borderColor: Colors.BLACK });

        const redButton = new Button(190, 430, 80, 50, "Red", {
            normalColor: Colors.RED,
            hoverColor: Colors.CYAN,
            textColor: Colors.WHITE,
        });
        redButton.setOnClick(() => {
            selectedColor = Colors.RED;
            colorDisplay.setStyle({ backgroundColor: selectedColor });
        });

        const greenButton = new Button(280, 430, 80, 50, "Green", {
            normalColor: Colors.GREEN,
            hoverColor: Colors.BLUE,
            textColor: Colors.WHITE,
        });
        greenButton.setOnClick(() => {
            selectedColor = Colors.GREEN;
            colorDisplay.setStyle({ backgroundColor: selectedColor });
        });

        const blueButton = new Button(370, 430, 80, 50, "Blue", {
            normalColor: Colors.BLUE,
            hoverColor: Colors.GREEN,
            textColor: Colors.WHITE,
        });
        blueButton.setOnClick(() => {
            selectedColor = Colors.BLUE;
            colorDisplay.setStyle({ backgroundColor: selectedColor });
        });

        // Disabled button example
        const disabledButton = new Button(500, 140, 200, 50, "Disabled");
        disabledButton.setDisabled(true);

        // Toggle button
        const toggleButton = new Button(500, 220, 200, 50, "Toggle Disabled");
        toggleButton.setOnClick(() => {
            disabledButton.setDisabled(!disabledButton.isDisabled());
        });

        // Add all components to panel
        panel.addChild(titleLabel);
        panel.addChild(button);
        panel.addChild(sliderLabel);
        panel.addChild(slider);
        panel.addChild(checkbox1);
        panel.addChild(checkbox2);
        panel.addChild(checkbox3);
        panel.addChild(colorLabel);
        panel.addChild(colorDisplay);
        panel.addChild(redButton);
        panel.addChild(greenButton);
        panel.addChild(blueButton);
        panel.addChild(disabledButton);
        panel.addChild(toggleButton);

        // Game loop
        while (true) {
            const shouldClose = rl.windowShouldClose().unwrapOr(true);
            if (shouldClose) break;

            // Update
            panel.update(rl);

            // Draw
            rl.beginDrawing()
                .andThen(() => rl.clearBackground(Colors.RAYWHITE))
                .andThen(() => panel.draw(rl))
                .andThen(() => rl.drawFPS(10, 10))
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
    () => console.log("UI demo completed successfully!"),
    (error) => {
        console.error("Error:", error.message);
        if (error.context) console.error("Context:", error.context);
    }
);
