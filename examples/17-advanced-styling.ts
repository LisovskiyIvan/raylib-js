import {
    Raylib,
    Colors,
    Button,
    Panel,
    Label,
    UIThemes,
    UIStyleHelper,
    UIRenderer,
    Color3,
} from "../src/index";

const rl = new Raylib();

// Initialize window
const result = rl
    .initWindow(1000, 700, "Advanced UI Styling Demo")
    .andThen(() => rl.setTargetFPS(60))
    .andThen(() => {
        // Define modern color palette
        const accent = Color3.fromRGB(99, 102, 241); // Indigo
        const accentHover = Color3.fromRGB(79, 70, 229);
        const success = Color3.fromRGB(34, 197, 94); // Green
        const warning = Color3.fromRGB(251, 146, 60); // Orange
        const danger = Color3.fromRGB(239, 68, 68); // Red
        const dark = Color3.fromRGB(30, 30, 46);
        const cardBg = Color3.fromRGB(45, 45, 68);
        const cardBg2 = Color3.fromRGB(55, 55, 78);
        const textPrimary = Color3.fromRGB(255, 255, 255);
        const textSecondary = Color3.fromRGB(156, 163, 175);
        const borderColor = Color3.fromRGB(75, 85, 99);
        const transparent = Color3.fromRGB(0, 0, 0, 0);
        const shadowDark = Color3.fromRGB(0, 0, 0, 100);
        const accentShadow = Color3.fromRGB(99, 102, 241, 120);
        const successShadow = Color3.fromRGB(34, 197, 94, 100);
        const warningShadow = Color3.fromRGB(251, 146, 60, 100);
        const dangerShadow = Color3.fromRGB(239, 68, 68, 100);
        const accentLight = Color3.fromRGB(99, 102, 241, 30);
        const accentBorder = Color3.fromRGB(99, 102, 241, 100);
        const successLight = Color3.fromRGB(34, 197, 94, 30);
        const successBorder = Color3.fromRGB(34, 197, 94, 100);
        const warningLight = Color3.fromRGB(251, 146, 60, 30);
        const warningBorder = Color3.fromRGB(251, 146, 60, 100);
        const purple = Color3.fromRGB(168, 85, 247);
        const purpleLight = Color3.fromRGB(168, 85, 247, 30);
        const purpleBorder = Color3.fromRGB(168, 85, 247, 100);

        // Hero Section
        const heroPanel = new Panel(40, 60, 920, 140, "");
        heroPanel.setStyle({
            padding: 30,
            background: { color: cardBg },
            border: { width: 0, color: Colors.BLANK },
            shadow: { offsetX: 0, offsetY: 4, blur: 12, color: shadowDark },
        });

        const titleLabel = new Label(40 + 30, 60 + 20, "Modern UI Design System");
        titleLabel.setStyle({
            text: { fontSize: 32, color: textPrimary, textAlign: "left" },
            margin: { top: 0, right: 0, bottom: 8, left: 0 },
        });

        const subtitleLabel = new Label(40 + 30, 60 + 60, "Beautiful, responsive components with modern styling");
        subtitleLabel.setStyle({
            text: { fontSize: 16, color: textSecondary, textAlign: "left" },
        });

        const primaryBtn = new Button(40 + 30, 60 + 95, 140, 45, "Get Started");
        primaryBtn.setStyle({
            padding: 12,
            background: { color: accent },
            border: { width: 0, color: Colors.BLANK },
            text: { fontSize: 16, color: textPrimary, textAlign: "center" },
            shadow: { offsetX: 0, offsetY: 2, blur: 8, color: accentShadow },
        });

        const secondaryBtn = new Button(40 + 185, 60 + 95, 140, 45, "Learn More");
        secondaryBtn.setStyle({
            padding: 12,
            background: { color: cardBg2 },
            border: { width: 1, color: borderColor },
            text: { fontSize: 16, color: textPrimary, textAlign: "center" },
        });

        heroPanel.addChild(titleLabel);
        heroPanel.addChild(subtitleLabel);
        heroPanel.addChild(primaryBtn);
        heroPanel.addChild(secondaryBtn);

        // Action Buttons Section
        const buttonsPanel = new Panel(40, 220, 450, 200, "");
        buttonsPanel.setStyle({
            padding: 25,
            background: { color: cardBg },
            border: { width: 0, color: Colors.BLANK },
            shadow: { offsetX: 0, offsetY: 4, blur: 12, color: shadowDark },
        });

        const sectionTitle1 = new Label(40 + 25, 220 + 15, "Action Buttons");
        sectionTitle1.setStyle({
            text: { fontSize: 20, color: textPrimary, textAlign: "left" },
            margin: { top: 0, right: 0, bottom: 15, left: 0 },
        });

        const successBtn = new Button(40 + 25, 220 + 50, 130, 42, "Success");
        successBtn.setStyle({
            padding: 10,
            background: { color: success },
            border: { width: 0, color: Colors.BLANK },
            text: { fontSize: 15, color: textPrimary, textAlign: "center" },
            shadow: { offsetX: 0, offsetY: 2, blur: 6, color: successShadow },
        });

        const warningBtn = new Button(40 + 170, 220 + 50, 130, 42, "Warning");
        warningBtn.setStyle({
            padding: 10,
            background: { color: warning },
            border: { width: 0, color: Colors.BLANK },
            text: { fontSize: 15, color: textPrimary, textAlign: "center" },
            shadow: { offsetX: 0, offsetY: 2, blur: 6, color: warningShadow },
        });

        const dangerBtn = new Button(40 + 315, 220 + 50, 130, 42, "Danger");
        dangerBtn.setStyle({
            padding: 10,
            background: { color: danger },
            border: { width: 0, color: Colors.BLANK },
            text: { fontSize: 15, color: textPrimary, textAlign: "center" },
            shadow: { offsetX: 0, offsetY: 2, blur: 6, color: dangerShadow },
        });

        const outlineBtn = new Button(40 + 25, 220 + 110, 195, 42, "Outline Style");
        outlineBtn.setStyle({
            padding: 10,
            background: { color: transparent },
            border: { width: 2, color: accent },
            text: { fontSize: 15, color: accent, textAlign: "center" },
        });

        const ghostBtn = new Button(40 + 235, 220 + 110, 195, 42, "Ghost Style");
        ghostBtn.setStyle({
            padding: 10,
            background: { color: transparent },
            border: { width: 0, color: Colors.BLANK },
            text: { fontSize: 15, color: textSecondary, textAlign: "center" },
        });

        buttonsPanel.addChild(sectionTitle1);
        buttonsPanel.addChild(successBtn);
        buttonsPanel.addChild(warningBtn);
        buttonsPanel.addChild(dangerBtn);
        buttonsPanel.addChild(outlineBtn);
        buttonsPanel.addChild(ghostBtn);

        // Info Cards Section
        const cardsPanel = new Panel(510, 220, 450, 200, "");
        cardsPanel.setStyle({
            padding: 25,
            background: { color: cardBg },
            border: { width: 0, color: Colors.BLANK },
            shadow: { offsetX: 0, offsetY: 4, blur: 12, color: shadowDark },
        });

        const sectionTitle2 = new Label(510 + 25, 220 + 15, "Information Cards");
        sectionTitle2.setStyle({
            text: { fontSize: 20, color: textPrimary, textAlign: "left" },
            margin: { top: 0, right: 0, bottom: 15, left: 0 },
        });

        const card1 = new Panel(510 + 25, 220 + 50, 130, 100);
        card1.setStyle({
            padding: 15,
            background: { color: cardBg2 },
            border: { width: 0, color: Colors.BLANK },
            borderLeft: { width: 4, color: accent },
        });

        const card1Label = new Label(510 + 25 + 15, 220 + 50 + 15, "Feature 1");
        card1Label.setStyle({
            text: { fontSize: 16, color: textPrimary, textAlign: "left" },
        });

        const card1Desc = new Label(510 + 25 + 15, 220 + 50 + 40, "Modern design");
        card1Desc.setStyle({
            text: { fontSize: 13, color: textSecondary, textAlign: "left" },
        });

        const card2 = new Panel(510 + 170, 220 + 50, 130, 100);
        card2.setStyle({
            padding: 15,
            background: { color: cardBg2 },
            border: { width: 0, color: Colors.BLANK },
            borderLeft: { width: 4, color: success },
        });

        const card2Label = new Label(510 + 170 + 15, 220 + 50 + 15, "Feature 2");
        card2Label.setStyle({
            text: { fontSize: 16, color: textPrimary, textAlign: "left" },
        });

        const card2Desc = new Label(510 + 170 + 15, 220 + 50 + 40, "Fast & smooth");
        card2Desc.setStyle({
            text: { fontSize: 13, color: textSecondary, textAlign: "left" },
        });

        const card3 = new Panel(510 + 315, 220 + 50, 130, 100);
        card3.setStyle({
            padding: 15,
            background: { color: cardBg2 },
            border: { width: 0, color: Colors.BLANK },
            borderLeft: { width: 4, color: warning },
        });

        const card3Label = new Label(510 + 315 + 15, 220 + 50 + 15, "Feature 3");
        card3Label.setStyle({
            text: { fontSize: 16, color: textPrimary, textAlign: "left" },
        });

        const card3Desc = new Label(510 + 315 + 15, 220 + 50 + 40, "Customizable");
        card3Desc.setStyle({
            text: { fontSize: 13, color: textSecondary, textAlign: "left" },
        });

        card1.addChild(card1Label);
        card1.addChild(card1Desc);
        card2.addChild(card2Label);
        card2.addChild(card2Desc);
        card3.addChild(card3Label);
        card3.addChild(card3Desc);

        cardsPanel.addChild(sectionTitle2);
        cardsPanel.addChild(card1);
        cardsPanel.addChild(card2);
        cardsPanel.addChild(card3);

        // Stats Section
        const statsPanel = new Panel(40, 440, 920, 220, "");
        statsPanel.setStyle({
            padding: 30,
            background: { color: cardBg },
            border: { width: 0, color: Colors.BLANK },
            shadow: { offsetX: 0, offsetY: 4, blur: 12, color: shadowDark },
        });

        const sectionTitle3 = new Label(40 + 30, 440 + 15, "Component Showcase");
        sectionTitle3.setStyle({
            text: { fontSize: 20, color: textPrimary, textAlign: "left" },
            margin: { top: 0, right: 0, bottom: 20, left: 0 },
        });

        const stat1Panel = new Panel(40 + 30, 440 + 55, 200, 130);
        stat1Panel.setStyle({
            padding: 20,
            background: { color: accentLight },
            border: { width: 1, color: accentBorder },
        });

        const stat1Value = new Label(40 + 30 + 20, 440 + 55 + 15, "2.5K+");
        stat1Value.setStyle({
            text: { fontSize: 28, color: accent, textAlign: "left" },
        });

        const stat1Label = new Label(40 + 30 + 20, 440 + 55 + 50, "Components");
        stat1Label.setStyle({
            text: { fontSize: 14, color: textSecondary, textAlign: "left" },
        });

        const stat2Panel = new Panel(40 + 250, 440 + 55, 200, 130);
        stat2Panel.setStyle({
            padding: 20,
            background: { color: successLight },
            border: { width: 1, color: successBorder },
        });

        const stat2Value = new Label(40 + 250 + 20, 440 + 55 + 15, "99.9%");
        stat2Value.setStyle({
            text: { fontSize: 28, color: success, textAlign: "left" },
        });

        const stat2Label = new Label(40 + 250 + 20, 440 + 55 + 50, "Uptime");
        stat2Label.setStyle({
            text: { fontSize: 14, color: textSecondary, textAlign: "left" },
        });

        const stat3Panel = new Panel(40 + 470, 440 + 55, 200, 130);
        stat3Panel.setStyle({
            padding: 20,
            background: { color: warningLight },
            border: { width: 1, color: warningBorder },
        });

        const stat3Value = new Label(40 + 470 + 20, 440 + 55 + 15, "< 50ms");
        stat3Value.setStyle({
            text: { fontSize: 28, color: warning, textAlign: "left" },
        });

        const stat3Label = new Label(40 + 470 + 20, 440 + 55 + 50, "Response Time");
        stat3Label.setStyle({
            text: { fontSize: 14, color: textSecondary, textAlign: "left" },
        });

        const stat4Panel = new Panel(40 + 690, 440 + 55, 200, 130);
        stat4Panel.setStyle({
            padding: 20,
            background: { color: purpleLight },
            border: { width: 1, color: purpleBorder },
        });

        const stat4Value = new Label(40 + 690 + 20, 440 + 55 + 15, "24/7");
        stat4Value.setStyle({
            text: { fontSize: 28, color: purple, textAlign: "left" },
        });

        const stat4Label = new Label(40 + 690 + 20, 440 + 55 + 50, "Support");
        stat4Label.setStyle({
            text: { fontSize: 14, color: textSecondary, textAlign: "left" },
        });

        stat1Panel.addChild(stat1Value);
        stat1Panel.addChild(stat1Label);
        stat2Panel.addChild(stat2Value);
        stat2Panel.addChild(stat2Label);
        stat3Panel.addChild(stat3Value);
        stat3Panel.addChild(stat3Label);
        stat4Panel.addChild(stat4Value);
        stat4Panel.addChild(stat4Label);

        statsPanel.addChild(sectionTitle3);
        statsPanel.addChild(stat1Panel);
        statsPanel.addChild(stat2Panel);
        statsPanel.addChild(stat3Panel);
        statsPanel.addChild(stat4Panel);

        // Add click handlers
        primaryBtn.setOnClick(() => console.log("Get Started clicked!"));
        secondaryBtn.setOnClick(() => console.log("Learn More clicked!"));
        successBtn.setOnClick(() => console.log("Success action!"));
        warningBtn.setOnClick(() => console.log("Warning action!"));
        dangerBtn.setOnClick(() => console.log("Danger action!"));
        outlineBtn.setOnClick(() => console.log("Outline clicked!"));
        ghostBtn.setOnClick(() => console.log("Ghost clicked!"));

        // Game loop
        while (true) {
            const shouldClose = rl.windowShouldClose().unwrapOr(true);
            if (shouldClose) break;

            // Update
            heroPanel.update(rl);
            buttonsPanel.update(rl);
            cardsPanel.update(rl);
            statsPanel.update(rl);

            // Draw
            rl.beginDrawing()
                .andThen(() => rl.clearBackground(Colors.BLACK))
                .andThen(() =>
                    rl.drawRectangle(0, 0, 1000, 700, dark)
                )
                .andThen(() => heroPanel.draw(rl))
                .andThen(() => buttonsPanel.draw(rl))
                .andThen(() => cardsPanel.draw(rl))
                .andThen(() => statsPanel.draw(rl))
                .andThen(() =>
                    rl.drawText(
                        "Modern UI Styling Demo",
                        40,
                        20,
                        24,
                        Colors.WHITE
                    )
                )
                .andThen(() => rl.drawFPS(900, 20))
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
