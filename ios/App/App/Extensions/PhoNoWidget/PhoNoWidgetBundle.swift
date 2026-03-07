import SwiftUI
import WidgetKit

/**
 * PhoNoWidgetBundle
 *
 * Main entry point for all PhoNo widgets.
 * Bundles together Timer, Streak, Progress, and Stats widgets.
 */
@main
struct PhoNoWidgetBundle: WidgetBundle {
    var body: some Widget {
        PhoNoTimerWidget()
        PhoNoStreakWidget()
        PhoNoProgressWidget()
        PhoNoStatsWidget()
    }
}
