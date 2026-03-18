package com.scrollingstop.data.achievements

enum class AchievementDef(
    val id: String,
    val title: String,
    val description: String
) {
    FIRST_TRADE(
        "first_trade",
        "First Trade Unlock",
        "Unlock the app with your first profitable trade"
    ),
    STREAK_7(
        "streak_7",
        "7-Day Streak",
        "Maintain a 7-day consecutive trade unlock streak"
    ),
    STREAK_30(
        "streak_30",
        "30-Day Streak",
        "Maintain a 30-day consecutive trade unlock streak"
    ),
    PROFIT_1K(
        "profit_1k",
        "\$1,000 Forced Profits",
        "Earn \$1,000 in total forced profits from trade unlocks"
    ),
    ZERO_BYPASS_WEEK(
        "zero_bypass_week",
        "Zero Bypass Week",
        "Go 7 consecutive days without using the bypass phrase"
    ),
    UNDER_30(
        "under_30",
        "Under 30 Minutes",
        "Keep daily usage under 30 minutes for 7 days straight"
    ),
    SOLANA_DEGEN(
        "solana_degen",
        "Solana Degen",
        "Unlock with a Solana DEX trade"
    ),
    DIAMOND_HANDS(
        "diamond_hands",
        "Diamond Hands",
        "50+ consecutive trade unlocks with zero bypasses"
    )
}
