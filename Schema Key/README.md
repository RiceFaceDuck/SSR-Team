# Schema Key — สารบัญหลัก

> **สำหรับ AI**: เปิดไฟล์นี้ก่อนเสมอ → ดู Path ที่ต้องการ → เปิดไฟล์ที่ถูกต้อง **แค่ 1 ใน 3**

## ระบบ 3 ไฟล์

| ระดับ | ไฟล์ | ใช้เมื่อไหร่ |
|-------|------|-------------|
| 🔴 CRITICAL | [schema-critical.md](./schema-critical.md) | แก้ไขระบบคะแนน, กติกา, ธุรกรรมเงิน, Security, Cloud Functions |
| 🟡 CORE | [schema-core.md](./schema-core.md) | แก้ไขข้อมูลนักเตะ, ทีม, ผู้เล่น, Squad, การ์ด, Inventory |
| 🟢 SUPPORT | [schema-support.md](./schema-support.md) | แก้ไขแชท, ลีก, Live Match, ฉายา, ข้อมูลในอดีต, โฆษณา |

---

## Firestore Path Quick Reference

| Firestore Path | Schema | ไฟล์ |
|----------------|--------|------|
| `artifacts/{appId}/public/data/players/{sku}` | Player + Stats | 🟡 CORE B1 |
| `artifacts/{appId}/public/data/teams/{teamId}` | Team | 🟡 CORE B2 |
| `artifacts/{appId}/users/{userId}/game_data/squad` | Squad | 🟡 CORE B3 |
| `artifacts/{appId}/public/data/managers/{managerId}` | Manager | 🟡 CORE B4 |
| `artifacts/{appId}/public/data/cards/{cardId}` | Card | 🟡 CORE B5 |
| `users/{userId}` | User | 🟡 CORE B6 |
| `users/{userId}/private/fcm_tokens` | FCM Tokens | 🟡 CORE B6.1 |
| `users/{userId}/game_data/inventory` | Inventory | 🟡 CORE B7 |
| `public_data/system_config` | System Config | 🔴 CRITICAL C1 |
| `public_data/gameweeks/weeks/{gameweekId}` | Gameweek Config | 🔴 CRITICAL C2 |
| `public_data/game_rules` | Game Rules | 🔴 CRITICAL C3 |
| `public_data/scoring_rules` | Scoring Rules | 🔴 CRITICAL C4 |
| `public_data/game_conditions` | Game Conditions | 🔴 CRITICAL C5 |
| `users/{userId}/gameweek_history/{gameweekId}` | Gameweek History | 🔴 CRITICAL C6 |
| `users/{userId}/transactions/{transactionId}` | Transactions | 🔴 CRITICAL C7 |
| `users/{userId}/game_data/club` | Club Upgrades | 🔴 CRITICAL C8 |
| `public_data/achievements/list/{achievementId}` | Achievement | 🟢 SUPPORT S1 |
| `global_chat/{messageId}` | Global Chat | 🟢 SUPPORT S2 |
| `leagues/{leagueId}` | League | 🟢 SUPPORT S3 |
| `public_data/live_match` | Live Match | 🟢 SUPPORT S4 |
| `public_data/live_match/events/{eventId}` | Live Match Events | 🟢 SUPPORT S4.1 |
| `public_data/live_gameweek_stats/players/{playerId}` | Live Gameweek Stats | 🟢 SUPPORT S4.2 |
| `users/{userId}/friends/{friendId}` | Friends | 🟢 SUPPORT S5 |
| `public_data/historical_players/{season_sku}` | Historical Players | 🟢 SUPPORT S6.1 |
| `public_data/historical_teams/{season_teamId}` | Historical Teams | 🟢 SUPPORT S6.2 |
| `admin_data/api_fetch_history/{fetchId}` | API Fetch History | 🟢 SUPPORT S6.3 |
| `public_data/ads_config` | Ads Config | 🟢 SUPPORT S7 |
| `public_data/leaderboard_cache` | Leaderboard Cache | 🟢 SUPPORT S8 |

---

## Cross-Reference Map

| ถ้าแก้ Schema นี้... | ต้องเช็ค Schema เหล่านี้ด้วย |
|----------------------|-------------------------------|
| Player (B1) | Squad (B3), Live Stats (S4.2), Historical (S6), Scoring Rules (C4) |
| Squad (B3) | Player (B1), Manager (B4), Card (B5), Game Rules (C3), Gameweek History (C6) |
| User (B6) | Transactions (C7), Club Upgrades (C8), Friends (S5), Leaderboard (S8) |
| Scoring Rules (C4) | Gameweek History (C6), Live Stats (S4.2), Player (B1) |
| Game Rules (C3) | Squad (B3), Inventory (B7) |
| System Config (C1) | Gameweek Config (C2), Game Conditions (C5) |
| Transactions (C7) | User.balls (B6), Inventory (B7) |
| Manager (B4) | Squad.managerId (B3), Inventory.ownedManagers (B7) |
| Card (B5) | Squad.appliedCardId (B3), Inventory.ownedCards (B7), Game Conditions (C5) |
