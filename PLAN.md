# ScrollingStop — Implementation Plan

## Context

Users waste hours scrolling social media but want to channel that energy into crypto trading. This app blocks social media apps (Instagram, TikTok, YouTube, etc.) after a daily time limit, and only unlocks when the user makes a profitable trade ($100+ configurable) on Binance or a Solana DEX. If the user wants to bypass without trading, they must type a shame phrase ("I choose scrolling over making money"), creating psychological friction.

**Platform**: Android (native Kotlin)
**Distribution**: Google Play Store (free)
**No backend** — all data and API keys stored on-device only

---

## Architecture

**Foreground Service + UsageStatsManager + SYSTEM_ALERT_WINDOW overlay**

```
UI Layer (Jetpack Compose)
├── OnboardingScreen (permissions, app picker, trading setup)
├── DashboardScreen (daily stats, trading status, streaks)
└── SettingsScreen (configure apps, limits, API keys, wallet)

Service Layer
├── UsageMonitorService (foreground service, polls foreground app every ~1s)
└── BlockOverlayService (draws full-screen overlay on blocked apps)

Trade Verification Layer
├── BinanceTradeChecker (REST API, HMAC-SHA256 signed requests)
└── SolanaTradeChecker (Helius API + Birdeye historical prices)

Data Layer
├── Room DB (DailyUsage, TradeUnlock, BypassLog, BlockedApp)
└── EncryptedSharedPreferences (API keys, wallet, settings)
```

**Permissions**: `PACKAGE_USAGE_STATS`, `SYSTEM_ALERT_WINDOW`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_SPECIAL_USE`, `RECEIVE_BOOT_COMPLETED`, `INTERNET`

---

## Block Screen Design

```
┌─────────────────────────────────┐
│                                 │
│     🔒 TIME'S UP               │
│                                 │
│   You've scrolled for 1h 00m   │
│   today across blocked apps    │
│                                 │
│  ┌───────────────────────────┐  │
│  │  💰 MAKE $100 TO UNLOCK  │  │
│  │                           │  │
│  │  Binance: No trade today  │  │
│  │  Solana:  No trade today  │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌─────────────┐ ┌───────────┐  │
│  │ Open Binance│ │Open Phantom│ │
│  └─────────────┘ └───────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🔄 I just made a trade   │  │
│  │    (check now)            │  │
│  └───────────────────────────┘  │
│                                 │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  Or type to bypass:             │
│  "I choose scrolling over      │
│   making money"                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  🔥 3-day trade streak          │
│                                 │
└─────────────────────────────────┘
```

- **"Open Binance" / "Open Phantom"** — deep links to trading apps
- **"I just made a trade"** — triggers immediate trade check
- **Friction bypass** — must type the exact shame phrase to dismiss
- **Auto-check** — service checks for trades every 5 minutes automatically
- **Streak counter** — consecutive days where user traded to unlock

---

## Data Model

```kotlin
@Entity
data class BlockedApp(
    @PrimaryKey val packageName: String,   // "com.instagram.android"
    val displayName: String,                // "Instagram"
    val iconUri: String?
)

@Entity
data class DailyUsage(
    @PrimaryKey(autoGenerate = true) val id: Long,
    val date: LocalDate,
    val packageName: String,
    val usedSeconds: Int
)

@Entity
data class TradeUnlock(
    @PrimaryKey(autoGenerate = true) val id: Long,
    val date: LocalDate,
    val source: String,                     // "binance" or "solana"
    val profitUsd: Double,
    val tradeDetails: String,               // JSON
    val unlockedAt: Instant
)

@Entity
data class BypassLog(
    @PrimaryKey(autoGenerate = true) val id: Long,
    val date: LocalDate,
    val bypassedAt: Instant
)

// EncryptedSharedPreferences (AES-256-SIV)
// - binance_api_key, binance_api_secret
// - solana_wallet_address, solana_wallet_verified
// - daily_limit_seconds (default 3600)
// - profit_threshold_usd (default 100.0)
// - bypass_phrase
```

---

## Implementation Steps

### Step 1: Project Scaffold
- Create Android project with Kotlin, Jetpack Compose, Gradle KTS
- Min SDK 26 (Android 8.0), Target SDK 34
- Dependencies: Compose BOM + Material 3, Room + KSP, Retrofit + OkHttp + Moshi, Hilt, AndroidX Security, Kotlin Coroutines + Flow, TweetNaCl-java
- Package structure:
  ```
  com.scrollingstop/
  ├── ui/ (onboarding/, dashboard/, settings/, overlay/)
  ├── service/ (UsageMonitorService.kt, BootReceiver.kt)
  ├── trade/
  │   ├── binance/ (BinanceApi.kt, BinanceTradeChecker.kt, BinanceSignatureInterceptor.kt)
  │   └── solana/ (HeliusApi.kt, BirdeyeApi.kt, SolanaTradeChecker.kt, PhantomWalletConnector.kt)
  ├── data/ (db/, model/, preferences/)
  └── di/ (AppModule.kt)
  ```
- **Verify**: Project compiles, runs empty Compose activity

### Step 2: Data Layer
- Room entities: BlockedApp, DailyUsage, TradeUnlock, BypassLog
- DAOs: getUsageForDate(), getTotalUsageForDate(), getUnlockForDate(), getBypassCountForWeek(), getStreakDays()
- EncryptedSharedPreferences wrapper for API keys + settings
- **Verify**: Unit tests for DAOs

### Step 3: Usage Monitor Service
- Foreground service with persistent notification
- Coroutine loop every ~1s: poll UsageStatsManager → check foreground app → increment timer → trigger overlay if limit exceeded
- BootReceiver to restart on device reboot
- Battery optimization exemption request
- **Verify**: Open Instagram, see timer increment in logs, overlay appears after limit

### Step 4: Block Overlay
- WindowManager.addView() with TYPE_APPLICATION_OVERLAY
- Full-screen overlay: time used, trading status, quick-launch buttons, trade check button, friction bypass input, streak counter
- Intercept back button and recent apps
- **Verify**: Overlay can't be dismissed except via trade or bypass phrase

### Step 5: Binance Integration
- Retrofit interface: GET /api/v3/myTrades (spot), GET /fapi/v1/userTrades (futures)
- HMAC-SHA256 signing interceptor
- Trade checker: fetch today's trades → group by symbol → match buys/sells → calculate profit
- Read-only API key requirement, validation on save
- **Verify**: Enter Binance API key, make test trade, app detects it

### Step 6: Solana DEX Integration
- Phantom wallet connection via deep links + Ed25519 signature verification
- Helius API for parsed swap transactions
- Birdeye API for historical token prices at block timestamp
- Profit calculation: stablecoin sides use amount directly, non-stablecoin uses Birdeye price
- Fallback: Solana RPC if Helius rate-limited
- **Verify**: Connect Phantom, make Jupiter swap, app detects and calculates profit

### Step 7: Onboarding UI
- Multi-step Compose flow: Welcome → Permissions → App Picker → Limits → Trading Connection → Start
- Permission checks block progression
- Deep link handling for Phantom return
- **Verify**: Complete full onboarding flow on device

### Step 8: Dashboard UI
- Circular progress (time used/limit, color-coded)
- Status badge (Locked/Unlocked)
- Today's qualifying trade details
- Weekly stats: trade unlocks vs bypasses
- Streak counter
- Pull-to-refresh triggers trade check
- **Verify**: Dashboard shows accurate data

### Step 9: Settings UI
- Blocked apps add/remove, time limit, profit threshold, bypass phrase
- Binance API key management (masked display)
- Solana wallet management (connect/disconnect)
- Test connection buttons
- Battery optimization prompt
- **Verify**: All settings persist and take effect immediately

### Step 10: Polish & Play Store Prep
- App icon + Material You theming
- Edge cases: service killed by OS, midnight rollover, timezone changes
- Privacy policy
- ProGuard/R8 rules
- Multi-device testing (Android 8.0, 12, 13, 14)
- **Verify**: Full end-to-end test on real device

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Blocking mechanism | UsageStatsManager + Overlay | Play Store compliant, reliable |
| UI framework | Jetpack Compose | Modern, declarative, less boilerplate |
| API client | Retrofit + OkHttp | Industry standard for Android |
| Database | Room | Official Android ORM, compile-time SQL verification |
| DI | Hilt | Official Android DI, integrates with Compose |
| Crypto storage | EncryptedSharedPreferences | AES-256-SIV, no backend needed |
| Solana prices | Birdeye (historical) | Accurate historical pricing for volatile tokens |
| Wallet connect | Phantom deep links | Native Android support, no WalletConnect needed |
| Profit definition | Single trade >= threshold | Simple to verify, clear unlock condition |
| API key storage | On-device only, read-only required | Maximum security, no backend risk |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Play Store rejects for SYSTEM_ALERT_WINDOW use | Frame as "digital wellness" app, similar to existing approved apps (StayFree, AppBlock) |
| Foreground service killed by aggressive OEMs (Samsung, Xiaomi) | Battery optimization exemption prompt, auto-restart on kill, FOREGROUND_SERVICE_SPECIAL_USE |
| Binance API changes | Version-pin API endpoints, handle errors gracefully |
| Helius free tier insufficient | Fall back to Solana RPC (no API key needed, slower) |
| User finds way to dismiss overlay | Overlay intercepts back button; if force-stopped, BootReceiver + JobScheduler restart it |
| Meme coin with no price data | Skip swap, log warning, don't block unlock for other valid trades |
| Network unavailable during trade check | Retry in 30 seconds, don't penalize user |

---

## External APIs & Free Tiers

| API | Purpose | Free Tier |
|-----|---------|-----------|
| Binance REST API | Trade history, account info | Unlimited with API key |
| Helius | Parsed Solana transactions | 1,000 credits/day |
| Birdeye | Historical token prices | 100 req/min |
| Jupiter Price API | Token price lookups (fallback) | Unlimited, no key needed |
| Solana RPC | Transaction data (Helius fallback) | Public endpoints available |
