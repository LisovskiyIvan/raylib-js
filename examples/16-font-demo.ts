// Example 16: Font System Demo - Custom Fonts, Text Measurement, Wrapping, and Alignment
import { Raylib, Colors, Vector2, TextAlignment } from '../src/index'

const rl = new Raylib()

// Initialize window
const initResult = rl.initWindow(1200, 800, "Raylib - Font System Demo")
if (initResult.isErr()) {
    console.error("Initialization error:", initResult.error)
    process.exit(1)
}

rl.setTargetFPS(60)

// Load custom font
// Note: You need to provide your own TTF/OTF font file in assets/fonts/
// For this demo, we'll try to load a font, but fall back to default if not available
console.log("Loading custom font...")
const fontPath = "assets/fonts/times.ttf"
const fontResult = rl.loadFont(fontPath, 32)

let customFont: any = null
let usingCustomFont = false

if (fontResult.isOk()) {
    customFont = fontResult.unwrap()
    usingCustomFont = true
    console.log(`Font loaded successfully! Base size: ${customFont.baseSize}, Glyphs: ${customFont.glyphCount}`)
} else {
    console.log("Custom font not found, using default font")
    console.log("To use custom fonts, place a TTF/OTF file at: assets/fonts/custom.ttf")
}

// Demo state
let currentDemo = 0
const demoNames = [
    "Text Measurement",
    "Text Rendering Sizes",
    "Text Wrapping",
    "Text Alignment",
    "Letter & Line Spacing",
    "Unicode Characters"
]

// Demo 1: Text Measurement
function drawTextMeasurementDemo() {
    rl.drawText("Demo 1: Text Measurement", 20, 20, 24, Colors.BLACK)
    rl.drawText("Measuring text dimensions before rendering", 20, 50, 16, Colors.DARKGRAY)

    const sampleTexts = [
        "Hello World!",
        "Raylib Font System",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    ]

    let yPos = 120

    for (const text of sampleTexts) {
        // Measure text
        let measurement
        if (usingCustomFont && customFont) {
            measurement = rl.measureTextEx(customFont, text, 24, 1.0).unwrapOr({ width: 0, height: 0 })
        } else {
            measurement = rl.measureText(text, 24).unwrapOr({ width: 0, height: 0 })
        }

        // Draw text
        if (usingCustomFont && customFont) {
            rl.drawTextEx(customFont, text, new Vector2(50, yPos), 24, 1.0, Colors.BLUE)
        } else {
            rl.drawText(text, 50, yPos, 24, Colors.BLUE)
        }

        // Draw bounding box
        rl.drawRectangle(50, yPos, measurement.width, measurement.height, 0x00FF0030) // Semi-transparent green
        rl.drawRectangle(50, yPos, measurement.width, measurement.height, Colors.GREEN) // Border only

        // Display measurements
        rl.drawText(`Width: ${measurement.width.toFixed(1)}px, Height: ${measurement.height.toFixed(1)}px`,
            50, yPos + measurement.height + 5, 14, Colors.DARKGRAY)

        yPos += measurement.height + 60
    }
}

// Demo 2: Text Rendering at Different Sizes
function drawTextRenderingSizesDemo() {
    rl.drawText("Demo 2: Text Rendering at Different Sizes", 20, 20, 24, Colors.BLACK)
    rl.drawText("Same text rendered at various font sizes", 20, 50, 16, Colors.DARKGRAY)

    const text = "Raylib Font System"
    const sizes = [12, 18, 24, 32, 48, 64]
    const colors = [Colors.RED, Colors.ORANGE, Colors.YELLOW, Colors.GREEN, Colors.BLUE, Colors.PURPLE]

    let yPos = 120

    for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i]!
        const color = colors[i]!

        if (usingCustomFont && customFont) {
            rl.drawTextEx(customFont, text, new Vector2(50, yPos), size, 1.0, color)
        } else {
            rl.drawText(text, 50, yPos, size, color)
        }

        rl.drawText(`${size}px`, 10, yPos, 12, Colors.DARKGRAY)

        yPos += size + 20
    }
}

// Demo 3: Text Wrapping
function drawTextWrappingDemo() {
    rl.drawText("Demo 3: Text Wrapping", 20, 20, 24, Colors.BLACK)
    rl.drawText("Automatic text wrapping within specified width", 20, 50, 16, Colors.DARKGRAY)

    const longText = "This is a long text that demonstrates the text wrapping functionality. " +
        "The text will automatically break into multiple lines when it exceeds the maximum width. " +
        "Word boundaries are respected, and long words are broken at character boundaries if necessary."

    const maxWidths = [300, 500, 700]
    let yPos = 120

    for (const maxWidth of maxWidths) {
        // Draw container box
        rl.drawRectangle(50, yPos, maxWidth, 200, 0xF0F0F0FF)
        rl.drawRectangle(50, yPos, maxWidth, 200, Colors.DARKGRAY)

        // Wrap and draw text
        if (usingCustomFont && customFont) {
            const wrappedResult = rl.wrapTextEx(customFont, longText, maxWidth, 18, 1.0)
            if (wrappedResult.isOk()) {
                const wrappedText = wrappedResult.unwrap()
                const lines = wrappedText.split('\n')
                let lineY = yPos + 10
                for (const line of lines) {
                    rl.drawTextEx(customFont, line, new Vector2(60, lineY), 18, 1.0, Colors.BLACK)
                    lineY += 22
                }
            }
        } else {
            const wrappedResult = rl.wrapText(longText, maxWidth, 18)
            if (wrappedResult.isOk()) {
                const wrappedText = wrappedResult.unwrap()
                const lines = wrappedText.split('\n')
                let lineY = yPos + 10
                for (const line of lines) {
                    rl.drawText(line, 60, lineY, 18, Colors.BLACK)
                    lineY += 22
                }
            }
        }

        rl.drawText(`Max Width: ${maxWidth}px`, 50, yPos + 205, 14, Colors.DARKGRAY)

        yPos += 250
    }
}

// Demo 4: Text Alignment
function drawTextAlignmentDemo() {
    rl.drawText("Demo 4: Text Alignment", 20, 20, 24, Colors.BLACK)
    rl.drawText("Left, Center, and Right text alignment", 20, 50, 16, Colors.DARKGRAY)

    const text = "Aligned Text Example\nMultiple Lines\nDifferent Lengths"
    const containerWidth = 500
    const containerX = 350
    let yPos = 120

    const alignments = [
        { name: "Left Alignment", align: TextAlignment.LEFT },
        { name: "Center Alignment", align: TextAlignment.CENTER },
        { name: "Right Alignment", align: TextAlignment.RIGHT }
    ]

    for (const { name, align } of alignments) {
        // Draw container
        rl.drawRectangle(containerX, yPos, containerWidth, 150, 0xF0F0F0FF)
        rl.drawRectangle(containerX, yPos, containerWidth, 150, Colors.DARKGRAY)

        // Draw center line for reference
        if (align === TextAlignment.CENTER) {
            rl.drawLine(containerX + containerWidth / 2, yPos, containerX + containerWidth / 2, yPos + 150, Colors.RED)
        }

        // Draw aligned text
        if (usingCustomFont && customFont) {
            rl.drawTextFormatted(
                customFont,
                text,
                new Vector2(containerX, yPos + 20),
                {
                    fontSize: 20,
                    spacing: 1.0,
                    lineSpacing: 30,
                    alignment: align,
                    maxWidth: containerWidth
                },
                Colors.BLUE
            )
        } else {
            // Fallback: manual alignment for default font
            const lines = text.split('\n')
            let lineY = yPos + 20
            for (const line of lines) {
                const measurement = rl.measureText(line, 20).unwrapOr({ width: 0, height: 0 })
                let x = containerX
                if (align === TextAlignment.CENTER) {
                    x = containerX + (containerWidth - measurement.width) / 2
                } else if (align === TextAlignment.RIGHT) {
                    x = containerX + containerWidth - measurement.width
                }
                rl.drawText(line, x, lineY, 20, Colors.BLUE)
                lineY += 30
            }
        }

        rl.drawText(name, containerX, yPos + 155, 16, Colors.DARKGRAY)

        yPos += 200
    }
}

// Demo 5: Letter and Line Spacing
function drawSpacingDemo() {
    rl.drawText("Demo 5: Letter & Line Spacing", 20, 20, 24, Colors.BLACK)
    rl.drawText("Adjusting spacing between characters and lines", 20, 50, 16, Colors.DARKGRAY)

    const text = "Spacing Demo"
    const multiLineText = "Line 1\nLine 2\nLine 3"

    // Letter spacing demo
    rl.drawText("Letter Spacing:", 50, 100, 18, Colors.DARKGRAY)
    const letterSpacings = [0.5, 1.0, 2.0, 4.0]
    let yPos = 130

    for (const spacing of letterSpacings) {
        if (usingCustomFont && customFont) {
            rl.drawTextEx(customFont, text, new Vector2(50, yPos), 24, spacing, Colors.BLUE)
        } else {
            rl.drawText(`${text} (spacing: ${spacing})`, 50, yPos, 24, Colors.BLUE)
        }
        rl.drawText(`Spacing: ${spacing}`, 350, yPos + 5, 14, Colors.DARKGRAY)
        yPos += 40
    }

    // Line spacing demo
    rl.drawText("Line Spacing:", 50, 350, 18, Colors.DARKGRAY)
    const lineSpacings = [20, 30, 40, 50]
    let xPos = 50

    for (const lineSpacing of lineSpacings) {
        if (usingCustomFont && customFont) {
            rl.drawTextFormatted(
                customFont,
                multiLineText,
                new Vector2(xPos, 380),
                {
                    fontSize: 20,
                    spacing: 1.0,
                    lineSpacing: lineSpacing,
                    alignment: TextAlignment.LEFT
                },
                Colors.GREEN
            )
        } else {
            const lines = multiLineText.split('\n')
            let lineY = 380
            for (const line of lines) {
                rl.drawText(line, xPos, lineY, 20, Colors.GREEN)
                lineY += lineSpacing
            }
        }
        rl.drawText(`${lineSpacing}px`, xPos, 520, 14, Colors.DARKGRAY)
        xPos += 150
    }
}

// Demo 6: Unicode Characters
function drawUnicodeDemo() {
    rl.drawText("Demo 6: Unicode Character Support", 20, 20, 24, Colors.BLACK)
    rl.drawText("Rendering various character sets", 20, 50, 16, Colors.DARKGRAY)

    // Show font info
    if (usingCustomFont && customFont) {
        rl.drawText(`Current font has ${customFont.glyphCount} glyphs`, 20, 75, 14, Colors.DARKBLUE)
    }

    const unicodeSamples = [
        { name: "Latin (Basic)", text: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", color: Colors.BLUE },
        { name: "Numbers", text: "0123456789", color: Colors.GREEN },
        { name: "Punctuation", text: "!@#$%^&*()_+-=[]{}|;:',.<>?/", color: Colors.ORANGE },
        { name: "Special ASCII", text: "~`\"\\", color: Colors.PURPLE },
        { name: "Latin Extended", text: "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ", color: Colors.RED },
        { name: "Cyrillic", text: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя", color: Colors.MAROON },
        { name: "Greek", text: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω", color: Colors.DARKBLUE },
        { name: "Symbols", text: "©®™€£¥¢§¶†‡•…‰′″‹›«»¿¡¬°±×÷", color: Colors.DARKGREEN }
    ]

    let yPos = 110

    for (const sample of unicodeSamples) {
        rl.drawText(sample.name + ":", 50, yPos, 16, Colors.DARKGRAY)

        if (usingCustomFont && customFont) {
            rl.drawTextEx(customFont, sample.text, new Vector2(250, yPos - 2), 18, 1.0, sample.color)
        } else {
            rl.drawText(sample.text, 250, yPos, 18, sample.color)
        }

        yPos += 35
    }

    // Note about font support
    rl.drawRectangle(50, yPos + 10, 1100, 120, 0xFFE0E0FF)
    rl.drawText("IMPORTANT: Unicode character rendering depends on the loaded font's glyph coverage!",
        60, yPos + 25, 16, Colors.RED)
    rl.drawText("• Basic fonts (like the test font) only support ASCII characters (95 glyphs)",
        60, yPos + 50, 14, Colors.DARKGRAY)
    rl.drawText("• Missing glyphs will appear as boxes (□) or question marks (?)",
        60, yPos + 70, 14, Colors.DARKGRAY)
    rl.drawText("• For full Unicode support, use fonts like: Noto Sans, Arial Unicode MS, or DejaVu Sans",
        60, yPos + 90, 14, Colors.DARKGRAY)
    rl.drawText("• These fonts contain thousands of glyphs covering multiple languages and symbols",
        60, yPos + 110, 14, Colors.DARKGRAY)
}

// Main game loop
console.log("Starting font demo...")
console.log("Press SPACE to cycle through demos")
console.log("Press ESC to exit")

while (true) {
    const shouldClose = rl.windowShouldClose().unwrap()
    if (shouldClose) break

    // Input handling
    const keyPressed = rl.getKeyPressed().unwrap()
    if (keyPressed === 32) { // SPACE key - switch demo
        currentDemo = (currentDemo + 1) % demoNames.length
        console.log(`Switched to: ${demoNames[currentDemo]}`)
    }

    // Drawing
    rl.beginDrawing()
    rl.clearBackground(Colors.RAYWHITE)

    // Draw current demo
    switch (currentDemo) {
        case 0:
            drawTextMeasurementDemo()
            break
        case 1:
            drawTextRenderingSizesDemo()
            break
        case 2:
            drawTextWrappingDemo()
            break
        case 3:
            drawTextAlignmentDemo()
            break
        case 4:
            drawSpacingDemo()
            break
        case 5:
            drawUnicodeDemo()
            break
    }

    // Draw navigation info
    rl.drawRectangle(0, 750, 1200, 50, Colors.LIGHTGRAY)
    rl.drawText("SPACE - Next Demo", 20, 760, 16, Colors.BLACK)
    rl.drawText("ESC - Exit", 200, 760, 16, Colors.BLACK)
    rl.drawText(`Demo ${currentDemo + 1}/${demoNames.length}: ${demoNames[currentDemo]}`,
        400, 760, 16, Colors.DARKBLUE)

    // Font status
    const fontStatus = usingCustomFont ? "Custom Font Loaded" : "Using Default Font"
    rl.drawText(fontStatus, 900, 760, 16, usingCustomFont ? Colors.GREEN : Colors.ORANGE)

    rl.drawFPS(1150, 10)
    rl.endDrawing()
}

// Cleanup
console.log("Cleaning up...")
if (usingCustomFont && customFont) {
    rl.unloadFont(customFont).unwrap()
    console.log("Font unloaded")
}
rl.closeWindow()
console.log("Font demo completed!")
