# ScrollStop

**Stop scrolling. Start trading.**

ScrollStop is an Android app that blocks social media after your daily time limit. The only way to unlock? Make a profitable crypto trade. Or type a shame phrase to bypass — your choice, your conscience.

---

## How It Works

1. **Set your daily limit** — choose how many minutes per day you're allowed on social media
2. **Use your apps normally** — ScrollStop monitors usage in the background
3. **Hit your limit?** — a full-screen overlay blocks the app
4. **Make a profitable trade** on Binance or Solana to unlock for the rest of the day
5. **Or type the shame phrase** — *"I choose scrolling over making money"*

## Features

### Core Blocking
- Real-time usage tracking via AccessibilityService
- Full-screen block overlay (SYSTEM_ALERT_WINDOW)
- Configurable daily limits and profit thresholds
- Battery optimization exclusion for reliable background monitoring

### Trade Verification
- Binance spot + futures trade checking (HMAC-SHA256 authenticated)
- Solana DEX swap detection via Helius + Birdeye price APIs
- Phantom wallet deep link integration
- Configurable minimum profit threshold

### Stats & Gamification
- **Forced Profits Tracker** — lifetime earnings from trades you were forced to make
- **Animated Dashboard** — progress ring, streak counter, daily stats bento grid
- **8 Achievements** — First Trade, 7-Day Streak, $1K Profits, Diamond Hands, and more
- **Streak Shields** — earn 1 shield per 7-day streak, auto-protects 1 missed day

### Sharing
- **Share Card** — export a branded stats image for social media

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React Native 0.76 (bare workflow) |
| Language | TypeScript + Kotlin (native modules) |
| State | Zustand 5 |
| Navigation | React Navigation 7 (stack + bottom tabs) |
| API | Axios + Crypto-JS (HMAC signing) |
| UI | Custom components, React Native SVG, Vector Icons |
| Native | AccessibilityService, OverlayService, UsageStats, BatteryOpt |
| Min SDK | 24 (Android 7.0) |

## Project Structure

```
src/
├── components/ui/       # GlassCard, BottomNavBar, ProgressRing, ToggleSwitch
├── hooks/               # useCountdown, useDailyReset, usePermissions, useTradeCheck
├── navigation/          # RootNavigator, OnboardingStack, MainTabs
├── screens/
│   ├── onboarding/      # Welcome, Permissions, TradingSetup, SetLimits
│   ├── main/            # Dashboard, Achievements, Settings
│   └── modals/          # BypassModal, ShareStats, TradeUnlockCelebration
├── services/            # blockingManager, achievementEngine, binanceApi, solanaApi
├── stores/              # 5 Zustand stores (app, settings, stats, onboarding, trade)
├── theme/               # colors, spacing, typography
├── types/               # models, native module interfaces, navigation
└── utils/               # constants, formatters

android/app/src/main/java/com/scrollstop76/
├── MainActivity.kt
└── MainApplication.kt
```

## Setup

### Prerequisites
- Node.js 18+
- JDK 17
- Android SDK (API 24+)
- Android emulator or physical device

### Install & Run

```bash
git clone https://github.com/oniani1/ScrollingStop.git
cd ScrollingStop
npm install
npx react-native start          # Terminal 1: Metro bundler
npx react-native run-android    # Terminal 2: Build & install
```

If using an emulator, make sure to reverse the port:
```bash
adb reverse tcp:8081 tcp:8081
```

### Permissions Required
- **Usage Access** — to monitor which app is in the foreground
- **Draw Over Apps** — to show the block overlay
- **Battery Optimization Exemption** — to keep the monitor service running

### Trading Setup (Optional)
- **Binance**: Create a read-only API key at [binance.com](https://www.binance.com/en/my/settings/api-management)
- **Solana**: Connect a Phantom wallet or paste your public address + get a free [Helius](https://helius.dev) API key

## Design

Dark theme with deep navy background (#0A0E1A), blue/violet accent (#4A90D9), and mint green (#34D399) for profit displays. Glass-morphism cards with subtle borders and generous spacing.

## License

[MIT](LICENSE)

---

Built by [Nika Oniani](https://github.com/oniani1)
