import SwiftUI
import WidgetKit

/**
 * BotBlockWidgetBundle
 *
 * Main entry point for all BotBlock widgets.
 * Bundles together Timer, Streak, Progress, and Stats widgets.
 */
@main
struct BotBlockWidgetBundle: WidgetBundle {
    var body: some Widget {
        BotBlockTimerWidget()
        BotBlockStreakWidget()
        BotBlockProgressWidget()
        BotBlockStatsWidget()
    }
}
