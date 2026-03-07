import Foundation
import UIKit

/// Helper for the ShieldConfiguration extension.
/// Pet-themed warm Atelier design matching PhoNo's pixel art aesthetic.
class ShieldConfigurationHelper {

    // MARK: - Properties

    private let userDefaults: UserDefaults

    // MARK: - Initialization

    init(userDefaults: UserDefaults? = nil) {
        self.userDefaults = userDefaults ?? SharedConstants.sharedUserDefaults ?? UserDefaults.standard
    }

    // MARK: - Shield Attempt Tracking

    func recordShieldAttempt() {
        let currentAttempts = userDefaults.integer(forKey: SharedConstants.StorageKeys.shieldAttempts)
        userDefaults.set(currentAttempts + 1, forKey: SharedConstants.StorageKeys.shieldAttempts)
        userDefaults.set(Date().timeIntervalSince1970, forKey: SharedConstants.StorageKeys.lastShieldAttempt)
    }

    var shieldAttempts: Int {
        userDefaults.integer(forKey: SharedConstants.StorageKeys.shieldAttempts)
    }

    var lastShieldAttemptTimestamp: TimeInterval {
        userDefaults.double(forKey: SharedConstants.StorageKeys.lastShieldAttempt)
    }

    func resetShieldAttempts() {
        userDefaults.set(0, forKey: SharedConstants.StorageKeys.shieldAttempts)
        userDefaults.set(0, forKey: SharedConstants.StorageKeys.lastShieldAttempt)
    }

    // MARK: - Messages

    static let shieldMessages = [
        "You set this up yourself. Think about that.",
        "A baby bunny earned XP for you today. Don't betray the baby bunny.",
        "Your island pets are literally watching you right now. Awkward.",
        "Every time you open a blocked app, a pixel pet loses its shimmer.",
        "There's a legendary pet waiting at the end of this session. This isn't it.",
        "Your pets pooled their coins to block this. Respect the hustle.",
        "You literally set this up. Your pets are proud of that.",
        "This is a sign. Not a metaphorical one. A literal one. Go back.",
        "Plot twist: the app you actually need is already open.",
        "Three minutes from now you won't even remember why you tapped this.",
        "This screen has a 100% success rate. Nobody has ever died from not scrolling.",
        "Whatever you were about to scroll through — it wasn't worth it.",
        "The notification can wait. It's never as urgent as it feels.",
        "You were on a roll. This is the part where the main character stays focused.",
        "Close your eyes. Take a breath. Now go do literally anything else.",
        "No.",
        "Nope. Not today.",
        "Nice try though.",
        "Your screen time report will remember this. Even if you won't.",
        "The best version of you doesn't need to open this right now.",
    ]

    func getMotivationalMessage() -> String {
        Self.shieldMessages.randomElement() ?? Self.shieldMessages[0]
    }

    func getAllMotivationalMessages() -> [String] {
        Self.shieldMessages
    }

    // MARK: - Title

    func getTitle() -> String {
        return "PhoNo"
    }

    // MARK: - Pixel Art App Icon

    /// Creates a pixel art bunny icon with "PhoNo" text and sage-green glow.
    /// Matches PhoNo's warm pixel art pet aesthetic.
    /// Rendered at 240x120pt @3x (720x360px) for maximum visual impact.
    func createAppIcon() -> UIImage? {
        let size = CGSize(width: 240, height: 120)
        let renderer = UIGraphicsImageRenderer(size: size, format: {
            let format = UIGraphicsImageRendererFormat()
            format.scale = 3.0
            return format
        }())

        return renderer.image { ctx in
            let context = ctx.cgContext

            // Radial glow backdrop — soft sage-green light behind the bunny
            let center = CGPoint(x: size.width / 2, y: size.height / 2 - 8)
            let radius = size.width * 0.40
            let colorSpace = CGColorSpaceCreateDeviceRGB()
            let glowColors = [
                PhoNoColors.primary.withAlphaComponent(0.15).cgColor,
                PhoNoColors.primary.withAlphaComponent(0.05).cgColor,
                UIColor.clear.cgColor,
            ] as CFArray
            let locations: [CGFloat] = [0.0, 0.5, 1.0]
            if let gradient = CGGradient(colorsSpace: colorSpace, colors: glowColors, locations: locations) {
                context.drawRadialGradient(
                    gradient,
                    startCenter: center, startRadius: 0,
                    endCenter: center, endRadius: radius,
                    options: .drawsAfterEndLocation
                )
            }

            // Pixel art bunny face — 14 columns × 10 rows
            // Color codes: 0=transparent, 1=white, 2=pink, 3=dark (eyes), 4=sage outline
            let bunnyPixels: [[Int]] = [
                [0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0],  // ear tips
                [0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0],  // ears
                [0, 0, 0, 1, 2, 0, 0, 0, 0, 2, 1, 0, 0, 0],  // ears pink
                [0, 0, 0, 1, 2, 0, 0, 0, 0, 2, 1, 0, 0, 0],  // ears pink
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],  // head top
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // head
                [0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0],  // eyes
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // face
                [0, 0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0],  // nose
                [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],  // chin
            ]

            let pixelColors: [UIColor] = [
                .clear,                                                              // 0: transparent
                UIColor.white,                                                       // 1: white body
                UIColor(red: 255/255, green: 182/255, blue: 193/255, alpha: 1.0),   // 2: pink
                PhoNoColors.textColor,                                               // 3: dark eyes
            ]

            let pixelSize: CGFloat = 5.0
            let bunnyWidth = 14
            let bunnyHeight = 10
            let originX = (size.width - CGFloat(bunnyWidth) * pixelSize) / 2
            let originY = (size.height - CGFloat(bunnyHeight) * pixelSize) / 2 - 16

            for row in 0..<bunnyHeight {
                for col in 0..<bunnyWidth {
                    let colorCode = bunnyPixels[row][col]
                    guard colorCode != 0 else { continue }
                    context.setFillColor(pixelColors[colorCode].cgColor)
                    context.fill(CGRect(
                        x: originX + CGFloat(col) * pixelSize,
                        y: originY + CGFloat(row) * pixelSize,
                        width: pixelSize,
                        height: pixelSize
                    ))
                }
            }

            // "PhoNo" text below the bunny
            let text = "PhoNo"
            let fontSize: CGFloat = 18
            let font: UIFont
            if let desc = UIFont.systemFont(ofSize: fontSize, weight: .semibold)
                        .fontDescriptor.withDesign(.rounded) {
                font = UIFont(descriptor: desc, size: fontSize)
            } else {
                font = UIFont.systemFont(ofSize: fontSize, weight: .semibold)
            }

            let paragraphStyle = NSMutableParagraphStyle()
            paragraphStyle.alignment = .center

            let attributes: [NSAttributedString.Key: Any] = [
                .font: font,
                .foregroundColor: PhoNoColors.primary,
                .kern: 2.0,
                .paragraphStyle: paragraphStyle,
            ]

            let attrString = NSAttributedString(string: text, attributes: attributes)
            let textSize = attrString.size()
            let textRect = CGRect(
                x: (size.width - textSize.width) / 2,
                y: originY + CGFloat(bunnyHeight) * pixelSize + 6,
                width: textSize.width,
                height: textSize.height
            )
            attrString.draw(in: textRect)
        }
    }

    // MARK: - Secondary Button

    static let secondaryButtonTexts = [
        "I can wait",
        "My pets need me",
        "You're right",
        "Fair enough",
    ]

    func getSecondaryButtonText() -> String {
        Self.secondaryButtonTexts.randomElement() ?? Self.secondaryButtonTexts[0]
    }

    // MARK: - Colors

    static var shieldBackgroundColor: UIColor { PhoNoColors.background }
    static var shieldTitleColor: UIColor { PhoNoColors.textColor }
    static var shieldSubtitleColor: UIColor { PhoNoColors.subtitleColor }
    static var shieldButtonColor: UIColor { PhoNoColors.primary }

    // MARK: - Accessibility

    static var shieldAccessibilityDescription: String {
        "This app is blocked to help you stay focused. Tap the button to return to PhoNo."
    }

    static var returnButtonAccessibilityLabel: String {
        "Return to PhoNo app"
    }

    static var returnButtonAccessibilityHint: String {
        "Double tap to close this blocked app and return to PhoNo"
    }
}

// MARK: - PhoNo Color Palette (warm Atelier theme)

private enum PhoNoColors {
    /// Sage green primary — matches PhoNo --primary #40856A
    static let primary = UIColor(red: 64/255, green: 133/255, blue: 106/255, alpha: 1.0)

    /// Light sage accent — lighter variant of primary
    static let primaryLight = UIColor(red: 90/255, green: 174/255, blue: 137/255, alpha: 1.0)

    /// Deep forest text — matches PhoNo --foreground #1C211E
    static let textColor = UIColor(red: 28/255, green: 33/255, blue: 30/255, alpha: 1.0)

    /// Sage grey subtitle — matches PhoNo --muted-foreground #5E6961
    static let subtitleColor = UIColor(red: 94/255, green: 105/255, blue: 97/255, alpha: 1.0)

    /// Warm cream background — matches PhoNo --background #F8F8F4
    static let background = UIColor(red: 248/255, green: 248/255, blue: 244/255, alpha: 0.97)
}
