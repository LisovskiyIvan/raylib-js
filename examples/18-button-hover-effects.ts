import { Raylib, Colors, Button, Panel, Label } from "../src/index";

const rl = new Raylib();

// Initialize window
const result = rl
    .initWindow(800, 600, "Button Hover Effects Demo")
    .andThen(() => rl.setTargetFPS(60))
    .andThen(() => {
        // Create main panel
        const panel = new Panel(50, 50, 700, 500, "Button Hover Animation Demo");

        // Title
        const titleLabel = new Label(70, 90, "Hover over buttons to see animations!", {
            fontSize: 24,
            textColor: Colors.DARKBLUE,
        });

        // Different styled buttons with border radius
        const button1 = new Button(70, 150, 200, 60, "Rounded 10", {
            borderRadius: 10,
        });
        let count1 = 0;
        button1.setOnClick(() => {
            count1++;
            console.log(`Button 1 clicked ${count1} times!`);
        });

        const button2 = new Button(300, 150, 200, 60, "Rounded 20", {
            normalColor: Colors.RED,
            hoverColor: Colors.MAROON,
            textColor: Colors.WHITE,
            borderColor: Colors.DARKGRAY,
            borderRadius: 20,
        });
        let count2 = 0;
        button2.setOnClick(() => {
            count2++;
            console.log(`Button 2 clicked ${count2} times!`);
        });

        const button3 = new Button(530, 150, 200, 60, "Rounded 30", {
            normalColor: Colors.GREEN,
            hoverColor: Colors.LIME,
            textColor: Colors.WHITE,
            borderColor: Colors.DARKGREEN,
            borderRadius: 30,
        });
        let count3 = 0;
        button3.setOnClick(() => {
            count3++;
            console.log(`Button 3 clicked ${count3} times!`);
        });

        const button4 = new Button(70, 240, 200, 60, "Pill Shape", {
            normalColor: Colors.BLUE,
            hoverColor: Colors.SKYBLUE,
            textColor: Colors.WHITE,
            borderColor: Colors.DARKBLUE,
            borderRadius: 30,
        });
        let count4 = 0;
        button4.setOnClick(() => {
            count4++;
            console.log(`Button 4 clicked ${count4} times!`);
        });

        const button5 = new Button(300, 240, 200, 60, "Circle Corners", {
            normalColor: Colors.PURPLE,
            hoverColor: Colors.VIOLET,
            textColor: Colors.WHITE,
            borderColor: Colors.VIOLET,
            borderRadius: 15,
        });
        let count5 = 0;
        button5.setOnClick(() => {
            count5++;
            console.log(`Button 5 clicked ${count5} times!`);
        });

        const button6 = new Button(530, 240, 200, 60, "Sharp Edges", {
            normalColor: Colors.ORANGE,
            hoverColor: Colors.GOLD,
            textColor: Colors.WHITE,
            borderColor: Colors.BROWN,
            borderRadius: 0,
        });
        let count6 = 0;
        button6.setOnClick(() => {
            count6++;
            console.log(`Orange button clicked ${count6} times!`);
        });

        // Large button with rounded corners
        const largeButton = new Button(150, 330, 400, 80, "Large Rounded Button", {
            normalColor: Colors.DARKGRAY,
            hoverColor: Colors.GRAY,
            textColor: Colors.WHITE,
            fontSize: 30,
            borderWidth: 3,
            borderColor: Colors.BLACK,
            borderRadius: 25,
        });
        let largeCount = 0;
        largeButton.setOnClick(() => {
            largeCount++;
            console.log(`Large button clicked ${largeCount} times!`);
        });

        // Info label
        const infoLabel = new Label(70, 440, "Hover to see scale + color animation with rounded corners!", {
            fontSize: 18,
            textColor: Colors.DARKGRAY,
        });

        // Add all components to panel
        panel.addChild(titleLabel);
        panel.addChild(button1);
        panel.addChild(button2);
        panel.addChild(button3);
        panel.addChild(button4);
        panel.addChild(button5);
        panel.addChild(button6);
        panel.addChild(largeButton);
        panel.addChild(infoLabel);

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
    () => console.log("Button hover effects demo completed successfully!"),
    (error) => {
        console.error("Error:", error.message);
        if (error.context) console.error("Context:", error.context);
    }
);
