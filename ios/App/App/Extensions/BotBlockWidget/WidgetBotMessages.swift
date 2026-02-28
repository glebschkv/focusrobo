import Foundation

/**
 * WidgetBotMessages
 *
 * Rotating funny/witty messages for each widget state.
 * Designed to be screenshot-worthy and shareable.
 * Messages are selected deterministically based on the current hour
 * so they change throughout the day but stay stable within each hour.
 */
enum WidgetBotMessages {

    // MARK: - Selection Helper

    /// Pick a message from an array based on the current hour (stable within the hour)
    private static func pick(_ messages: [String]) -> String {
        let hour = Calendar.current.component(.hour, from: Date())
        let day = Calendar.current.component(.day, from: Date())
        let index = (hour + day) % messages.count
        return messages[index]
    }

    // MARK: - Timer Widget Messages

    /// Messages when a focus session is actively running
    static var timerRunning: String {
        pick(timerRunningMessages)
    }

    /// Messages when no session is active
    static var timerIdle: String {
        pick(timerIdleMessages)
    }

    /// Messages when session is almost done (< 5 min remaining)
    static var timerAlmostDone: String {
        pick(timerAlmostDoneMessages)
    }

    private static let timerRunningMessages = [
        "shhh... focusing rn",
        "no peeking at your phone!",
        "your bot is running diagnostics on your focus",
        "do NOT check instagram.",
        "your bot is processing faster than you",
        "phones are overrated anyway",
        "pretend this widget doesn't exist",
        "your bot says: eyes on the objective",
        "lock in. your bot is monitoring.",
        "touch grass later, focus now",
        "your bot would approve. probably.",
        "resist the scroll. be strong.",
        "your bot is silently logging your behavior",
        "zen mode: activated",
        "the phone can wait. you can't.",
    ]

    private static let timerIdleMessages = [
        "your bot is entering sleep mode...",
        "tap to prove you're productive",
        "your bot logged your screen time. concerning.",
        "another day, another scroll?",
        "your bot filed a bug report on you",
        "your bot started optimizing without you",
        "wanna focus? ...just asking",
        "your bot is writing a log entry about waiting",
        "bot idle mode: critical",
        "your bot is considering a firmware update",
        "idle bot = idle human?",
        "your bot is defragmenting its patience",
        "the focus button won't press itself",
        "your bot is learning patience. barely.",
        "still scrolling? your bot detected that.",
    ]

    private static let timerAlmostDoneMessages = [
        "SO close! don't blow it!",
        "the finish line is RIGHT THERE",
        "your bot is computing the countdown",
        "almost... almost... ALMOST!",
        "hold on just a bit longer!",
        "your bot's anticipation circuits are overloading",
        "you can taste the victory",
        "final stretch! bot is beeping excitedly!",
    ]

    // MARK: - Streak Widget Messages

    /// Get a streak message based on the current streak count
    static func streakMessage(days: Int) -> String {
        switch days {
        case 0:
            return pick(streak0Messages)
        case 1:
            return pick(streak1Messages)
        case 2...3:
            return pick(streak2to3Messages)
        case 4...6:
            return pick(streak4to6Messages)
        case 7...13:
            return pick(streak7to13Messages)
        case 14...29:
            return pick(streak14to29Messages)
        case 30...99:
            return pick(streak30to99Messages)
        default:
            return pick(streak100PlusMessages)
        }
    }

    private static let streak0Messages = [
        "start a streak. your bot dares you.",
        "day 0. the reboot starts now.",
        "your bot is tapping its circuits...",
        "no streak? no problem. initialize one!",
    ]

    private static let streak1Messages = [
        "day 1! the hardest part: starting",
        "one day down! only infinity to go",
        "your bot is cautiously optimistic",
        "baby steps. your bot approves.",
    ]

    private static let streak2to3Messages = [
        "building momentum... keep going!",
        "your bot detects potential here",
        "a streak is forming! don't jinx it",
        "two's company, three's a streak",
    ]

    private static let streak4to6Messages = [
        "your bot is mildly impressed",
        "okay okay, we see you!",
        "this streak is getting serious",
        "your bot is pinging the other bots",
    ]

    private static let streak7to13Messages = [
        "a WHOLE week! your bot is broadcasting it",
        "7+ days?! who even are you",
        "your bot is composing a data report",
        "streak legend in the making",
    ]

    private static let streak14to29Messages = [
        "two weeks?! your bot is OVERCLOCKED",
        "legendary behavior detected",
        "your bot started a fan club subroutine for you",
        "at this point you're just showing off",
    ]

    private static let streak30to99Messages = [
        "30+ DAYS. your bot is speechless.",
        "your bot composed a binary ballad about you",
        "you're basically a focus monk now",
        "your bot is in awe. genuinely.",
    ]

    private static let streak100PlusMessages = [
        "100+ days. you absolute legend.",
        "your bot has achieved singularity. because of you.",
        "they should name a holiday after you",
        "your bot is leaking coolant tears of joy",
    ]

    // MARK: - Progress Widget Messages

    /// Get a progress message based on completion percentage
    static func progressMessage(percent: Int) -> String {
        switch percent {
        case 0:
            return pick(progress0Messages)
        case 1...25:
            return pick(progress1to25Messages)
        case 26...50:
            return pick(progress26to50Messages)
        case 51...75:
            return pick(progress51to75Messages)
        case 76...99:
            return pick(progress76to99Messages)
        default:
            return pick(progress100Messages)
        }
    }

    private static let progress0Messages = [
        "the quest begins! ...eventually",
        "0% is just 100% waiting to happen",
        "your bot packed extra battery for the journey",
        "every adventure starts at zero!",
    ]

    private static let progress1to25Messages = [
        "baby steps! your bot approves",
        "progress is progress, no matter how smol",
        "your bot is warming up its cores too",
        "slow and steady wins the focus race",
    ]

    private static let progress26to50Messages = [
        "halfway-ish! math is hard",
        "your bot says: we're getting somewhere!",
        "the glass is... getting fuller!",
        "cruising altitude reached",
    ]

    private static let progress51to75Messages = [
        "past the halfway mark! downhill from here",
        "your bot is doing a progress calculation dance",
        "more done than not done. science.",
        "the finish line is getting closer!",
    ]

    private static let progress76to99Messages = [
        "SO close! your bot can compute it",
        "the final boss of today's quest",
        "your bot's excitement buffer is overflowing",
        "almost there! don't stop now!",
    ]

    private static let progress100Messages = [
        "GOAL CRUSHED! your bot is beeping wildly!",
        "100%! achievement unlocked!",
        "your bot is deploying confetti.exe!",
        "daily quest: COMPLETE. you legend.",
    ]

    // MARK: - Stats Widget Messages

    /// Get a stats message based on level
    static func statsMessage(level: Int) -> String {
        switch level {
        case 1...5:
            return pick(statsLevel1to5Messages)
        case 6...10:
            return pick(statsLevel6to10Messages)
        case 11...20:
            return pick(statsLevel11to20Messages)
        case 21...35:
            return pick(statsLevel21to35Messages)
        default:
            return pick(statsLevel36PlusMessages)
        }
    }

    private static let statsLevel1to5Messages = [
        "a budding focus warrior",
        "level up loading...",
        "your bot sees great potential",
        "origin story: in progress",
    ]

    private static let statsLevel6to10Messages = [
        "getting dangerous. in a good way.",
        "your bot is updating your profile",
        "double digits incoming!",
        "your reputation precedes you",
    ]

    private static let statsLevel11to20Messages = [
        "your bot tells every server about you",
        "mid-game boss energy",
        "the grind is real. and working.",
        "bot network influencer status",
    ]

    private static let statsLevel21to35Messages = [
        "approaching legend status",
        "your bot is writing your wiki page",
        "veteran focus warrior",
        "the other bots look up to yours",
    ]

    private static let statsLevel36PlusMessages = [
        "the final boss of focus",
        "your bot has achieved enlightenment",
        "max level energy. respect.",
        "focus grandmaster. bow down.",
    ]

    // MARK: - Bot Name for Widget Title

    /// Returns a display name for the bot, or a default
    static func botDisplayName(_ name: String?) -> String {
        guard let name = name, !name.isEmpty else {
            return "Your Bot"
        }
        return name
    }
}
