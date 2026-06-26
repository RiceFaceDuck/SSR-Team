# 🏛️ System Architecture & Guidelines

> **AI INSTRUCTION**: ALWAYS read this file before modifying code. Refer to the Quick-Lookup Table (Section 7) to find exact files directly without scanning folders.

This document serves as the high-level architecture guide for the **SSR Team Fantasy System**. It is designed to give developers (and AI agents) a rapid understanding of the system's structure, design patterns, and core domains to maximize efficiency, speed, and accuracy.

## 1. Monorepo Structure

The project is structured as a monorepo containing several interconnected applications:

- **`frontend/`**: The user-facing application for playing Fantasy Football. Built with React and Vite. Handles squad management, market, live scores, leaderboards, and social features.
- **`admin/`**: The administrative backoffice dashboard. Built with React and Vite. Handles player data management, gameweek pipelines, game rules configuration, and live match control.
- **`functions/`**: Firebase Cloud Functions acting as the secure backend. Handles heavy game engine logic (score calculations), economy transactions, rate limiting, and API endpoints.
- **`Schema Key/`**: Database Schema Reference directory (CRITICAL for AI). Contains Firestore paths, rules, and data structures.

## 2. Tech Stack

- **Frontend & Admin**: React (Vite)
- **Backend / Database**: Firebase (Firestore, Authentication, Cloud Storage, Cloud Functions for Node.js)
- **State Management (Frontend)**: Zustand (Multiple focused slices)
- **Validation**: Zod (in Cloud Functions)

## 3. Core Design Patterns

To maintain a clean and scalable codebase, this project strictly enforces Clean Architecture and the following patterns:

### Single Responsibility Principle (SRP)
Services, hooks, and Zustand slices are aggressively refactored to handle single tasks.
*Example: Instead of a massive `squadSlice.js`, the logic is split into `squadCoreSlice`, `squadFormationSlice`, `squadPlacementSlice`, and `squadPitchSlice`.*

### Facade Pattern
Complex logic or Firebase operations are often hidden behind a Facade service or hook that provides a simplified API to the UI components.
*Example: `usePitchLogic.js` acts as a facade, delegating specific tasks to `usePitchDataLoad`, `usePitchEnrichment`, and `usePitchActions`.*

### Custom Hooks for Business Logic
UI components (`.jsx` files) MUST remain as "dumb" as possible (purely presentational). Business logic, state management, and side effects are extracted into custom hooks.
*Example: `admin/src/features/dashboard/hooks/useDashboardData.js` handles data orchestration, keeping `Dashboard.jsx` clean.*

### Layered Dependency Rules (Clean Architecture)
- ✅ **Presentation** (UI/Components) → **Application** (Hooks/Zustand) → **Domain** (Engine/Rules) → **Infrastructure** (Firebase/APIs)
- ❌ **Domain** MUST NOT import Infrastructure directly.
- ❌ **Infrastructure** MUST NOT import Presentation.
- ✅ Shared utilities (`utils/`) can be referenced across layers.

## 4. Key Business Domains

- **Game Engine & Rules (`functions/src/engine/`)**: The core of the game. Handles massive batch calculations for Gameweeks, player value algorithms, and complex modifier pipelines (Captain, Synergy, Power Cards).
- **Economy (`functions/src/economy/`)**: Secure transaction management for "Balls" (in-game currency) and Club upgrades. Heavily relies on Firestore `runTransaction` for concurrency safety.
- **Squad Management (`frontend/src/store/slices/`)**: Complex client-side state machine for drafting, formations, auto-filling, and market transactions.
- **Live Match (`frontend/src/features/live/`)**: Real-time match status, live events, and live chat using Firestore real-time listeners.

## 5. Coding Rules & Conventions

1. **Naming Conventions**: 
   - React Components = `PascalCase` (`PlayerCard.jsx`)
   - Hooks = `camelCase` with `use` prefix (`useMarketFilters.js`)
   - Zustand Slices = `camelCase` (`squadCoreSlice.js`)
   - Firebase Collections = `snake_case` or `camelCase` (Always verify via schema)
2. **State Management**: Use Zustand for global state. Divide stores into very small, domain-focused slices inside `src/store/slices/`.
3. **Database Security**: All critical write operations (Economy, GW Score updates) MUST happen in Cloud Functions or be strictly protected by Firestore Rules. Never trust client-side calculations for sensitive data.
4. **Immutable IDs**: Core Firestore Document IDs (like Gameweek IDs e.g. `GW1` or third-party Player API IDs) are IMMUTABLE.

---

## 6. AI Workflow Guide

To operate with maximum speed and accuracy, AI agents MUST follow this strict workflow:

1. **Understand Request**: Analyze the user's intent.
2. **Direct Path Lookup**: Use the **Quick-Lookup Table (Section 7)** below to find the exact target file path.
3. **Check Data Schema**: If Firestore reads/writes are needed, IMMEDIATELY read `Schema Key/README.md`.
4. **Targeted Edit**: Open the exact file(s) via absolute path and apply changes. **DO NOT scan directories manually.**
5. **Verify Architecture**: Ensure modifications do not violate the Dependency Rules (Section 3).

## 7. Quick-Lookup Table (For AI & Devs)

> **🎯 FAST NAVIGATION**: Use this table to jump directly to the code you need. Bypassing directory scanning saves ~70% context processing time.

| Target Area | Architecture Layer | Exact File Path to Open |
|---|---|---|
| **Frontend: Market UI** | Presentation | `frontend/src/features/market/components/PlayerRow.jsx` |
| **Frontend: Market Logic** | Application | `frontend/src/features/market/hooks/useMarketFilters.js` |
| **Frontend: Pitch/Squad UI** | Presentation | `frontend/src/features/pitch/PitchScreen.jsx` |
| **Frontend: Pitch Logic (Facade)**| Application | `frontend/src/features/pitch/hooks/usePitchLogic.js` |
| **Frontend: Auto-Fill Engine** | Domain | `frontend/src/features/pitch/utils/autofill/AutoFillOrchestrator.js` |
| **Frontend: Live Match & Chat** | Presentation | `frontend/src/features/live/LiveScoreScreen.jsx` |
| **Frontend: Zustand (Squad Core)**| Application | `frontend/src/store/slices/squadCoreSlice.js` |
| **Frontend: Zustand (Auth Sync)** | Application | `frontend/src/hooks/useAuthSync.js` |
| **Admin: Player Management** | Presentation | `admin/src/features/players/views/PlayerList.jsx` |
| **Admin: Gameweek Dashboard** | Presentation | `admin/src/features/dashboard/views/Dashboard.jsx` |
| **Admin: Game Rules Config** | Application | `admin/src/features/gameRules/hooks/useGameRulesManager.js` |
| **Backend: GW Score Engine** | Domain | `functions/src/engine/gameweekCalculation.js` |
| **Backend: Score Modifiers** | Domain | `functions/src/engine/modifiers/rules/` |
| **Backend: Economy Transactions** | Infrastructure | `functions/src/economy/transactionService.js` |
| **Backend: API Schemas (Zod)** | Domain | `functions/src/api/schemas.js` |
| **Backend: Rate Limiting** | Infrastructure | `functions/src/middleware/rateLimiter.js` |
| **Database: Schema Reference** | Reference | `Schema Key/README.md` |
