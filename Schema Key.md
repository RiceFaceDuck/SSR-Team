# Schema Key

This document outlines the standard data structures used across the SSR Team Fantasy application.

## 1. Player Schema
`artifacts/{appId}/public/data/players/{sku}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `sku`       | String | Unique identifier (e.g. 'API-1234' or 'EXCEL-...'). **[IMMUTABLE]** ห้ามเปลี่ยนค่าเด็ดขาดเพราะเป็น Document ID |
| `name`      | String | Short name used in game UI (e.g. 'Saka') |
| `fullName`  | String | Full name of the player |
| `imageUrl`  | String | URL to the player's photo |
| `position`  | String | FWD, MID, DEF, GK |
| `team`      | String | Club name (e.g. 'Arsenal') |
| `price`     | Number | Fantasy price (e.g. 12.5) |
| `totalPoints`| Number | Total fantasy points accumulated |
| `status`    | String | 'active', 'injured', or 'suspended' |
| `dataSource`| String | Source of data: 'API', 'EXCEL', 'MANUAL' |
| `createdAt` | Timestamp | Firestore server timestamp |
| `updatedAt` | Timestamp | Firestore server timestamp |
| `isActive`  | Boolean | Logical deletion flag |

### 1.1 Player Stats Object (`stats`)
Inside the Player Schema, there is a `stats` object mapping to game attributes.
*(Note on Optimization: When fetching all players in Admin, the query uses `limit(1500)` to cap memory usage.)*
| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `pace`      | Number | 0-99 speed rating |
| `shooting`  | Number | 0-99 shooting rating |
| `passing`   | Number | 0-99 passing rating |
| `dribbling` | Number | 0-99 dribbling rating |
| `defending` | Number | 0-99 defending rating |
| `physical`  | Number | 0-99 physical rating |
| `goals`     | Number | Real-world goals |
| `assists`   | Number | Real-world assists |
| `cleanSheets`| Number | Real-world clean sheets |
| `yellowCards`| Number | Real-world yellow cards |
| `redCards`  | Number | Real-world red cards |

## 1.5 Team Schema (สโมสรต้นสังกัด)
`artifacts/{appId}/public/data/teams/{teamId}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `id`        | String | รหัสทีม หรืออ้างอิง Slug (เช่น 'arsenal') **[IMMUTABLE]** |
| `name`      | String | ชื่อทีมแบบเต็ม (เช่น 'Arsenal') |
| `shortName` | String | ชื่อย่อตัวพิมพ์ใหญ่ 3-4 ตัว (เช่น 'ARS') ใช้สำหรับ UI |
| `logo`      | String | URL รูปภาพโลโก้สโมสร |
| `updatedAt` | Timestamp | วันเวลาที่อัปเดตข้อมูลล่าสุด |

## 5. Card Schema (การ์ดเสริมพลัง)
`artifacts/{appId}/public/data/cards/{cardId}`

| Field         | Type    | Description |
| ------------- | ------- | ----------- |
| `name`        | String  | ชื่อการ์ด (เช่น 'รอดพ้นใบเหลือง') |
| `description` | String  | คำอธิบายความสามารถ |
| `icon`        | String  | Emoji ไอคอน (เช่น '🛡️') |
| `rarity`      | String  | ระดับความหายาก ('COMMON', 'RARE', 'EPIC', 'LEGENDARY') |
| `effectLogic` | Object  | `{"type":"IMMUNE_YELLOW"}` |
| `price`       | Number  | ราคาในการซื้อ (Balls) |
| `isActive`    | Boolean | เปิด/ปิดการ์ดในเกม |

## 2. Squad Schema (ทีมของผู้เล่น)
`artifacts/{appId}/users/{userId}/game_data/squad`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `mySquad`   | Array  | เก็บนักเตะ `[{ playerId, position, isStarting, slotIndex, appliedCardId, appliedCard, isLocked }]` **(เมื่อประมวลผล Gameweek เสร็จ appliedCard จะถูกลบทิ้งอัตโนมัติ เพราะเป็นไอเทมใช้ครั้งเดียว)** |
| `budgetLeft`| Number | งบประมาณที่เหลืออยู่ (Base + Carried Over) **[Secured by Client-side Transaction]** |
| `carriedOverBudget`| Number | งบประมาณโบนัสที่ยกยอดมาจากสัปดาห์ก่อนหน้า (ถ้ามี) |
| `formation` | String | แผนการเล่นปัจจุบัน (เช่น '4-4-2') |
| `managerId` | String | รหัสผู้จัดการทีมที่เลือกใช้งาน |
| `captainId` | String | รหัสผู้เล่น (playerId) ที่เป็นกัปตันทีม |
| `viceCaptainId`| String | รหัสผู้เล่น (playerId) ที่เป็นรองกัปตันทีม (สำรองกรณีกัปตันไม่ได้ลง) |
| `currentStreak`| Number | จำนวนสัปดาห์ที่ส่งทีมติดต่อกัน (Streak) |
| `updatedAt` | Timestamp | Firestore server timestamp |

## 3. Manager Schema (ผู้จัดการทีม)
`artifacts/{appId}/public/data/managers/{managerId}`

| Field         | Type    | Description |
| ------------- | ------- | ----------- |
| `name`        | String  | ชื่อผู้จัดการทีม |
| `avatarUrl`   | String  | ลิงก์รูปภาพของผู้จัดการทีม |
| `description` | String  | คำอธิบายความสามารถ (แสดงผลให้ผู้ใช้เห็น) |
| `effectLogic` | Object  | JSON Object กำหนดความสามารถพิเศษ เช่น `{"type":"BUDGET_BONUS", "value":25}` หรือ `{"type":"UNLOCK_FORMATION", "formations":["3-3-4"]}` |
| `price`       | Number  | ราคาในการซื้อ (Balls) |
| `isActive`    | Boolean | สถานะเปิด/ปิดการใช้งาน |
| `updatedAt`   | Timestamp| Firestore server timestamp |

## 4. User Schema
`users/{userId}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `uid`          | String    | รหัสผู้ใช้งาน |
| `displayName`  | String    | ชื่อที่แสดงผล |
| `teamName`     | String    | ชื่อทีมของผู้เล่น (แสดงใน Leaderboard และ Profile) |
| `email`        | String    | อีเมล |
| `photoURL`     | String    | URL รูปภาพโปรไฟล์ |
| `role`         | String    | บทบาท ('player', 'admin') |
| `hasJoinedGame`| Boolean   | สถานะเข้าร่วมเกม (จัดทีมครั้งแรกสำเร็จ) ใช้กรองใน Leaderboard |
| `balls`        | Number    | เหรียญ/แต้มสำหรับใช้ทำกิจกรรม (แชท, สุ่มกาชา) |
| `userPoints`   | Number    | คะแนนสะสมโดยรวมของผู้เล่น |
| `lastGameweekPoints`| Number | คะแนนที่ได้ใน Gameweek ล่าสุด (ใช้จัดอันดับประจำสัปดาห์) |
| `clubSpentExp` | Number    | จำนวน EXP รวมที่ใช้อัพเกรดสโมสร (ใช้จัดอันดับ MY CLUB) |
| `equippedTitle`| String    | ฉายาที่ผู้เล่นเลือกแสดงผลข้างชื่อ |
| `createdAt`    | Timestamp | วันเวลาที่สร้างบัญชี |
| `lastLoginAt`  | Timestamp | วันเวลาที่ล็อกอินล่าสุด **(Indexed: ใช้ประเมิน DAU สำหรับ Quota Analyzer)** |
| `lastFreeChatAt`| Timestamp | วันเวลาที่ส่งแชทฟรีครั้งล่าสุด |
| `tutorialState`| Object    | สถานะการดูสอนเล่น เช่น `{"hasSeenMarket": true, "hasSeenPitch": false}` |

### 4.0 Private Data Sub-collection
`users/{userId}/private/fcm_tokens`
เก็บ Tokens สำหรับส่ง Push Notifications (FCM)
| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `{token}`   | Boolean| Token FCM ของอุปกรณ์ (ค่าเป็น `true` หากยังใช้งานได้) |

### 4.1 Gameweek History Sub-collection
`users/{userId}/gameweek_history/{gameweekId}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `gameweekId`| String | รหัสสัปดาห์ (เช่น 'GW1') |
| `squad`     | Array  | Snapshot ทีมในสัปดาห์นั้น `[{ playerId, position, isStarting, pointsEarned }]` |
| `managerId` | String | ผู้จัดการทีมที่ใช้ |
| `captainId` | String | กัปตันทีม |
| `mvpId`     | String | ผู้เล่นที่ได้ MVP ประจำสัปดาห์ |
| `points`    | Number | คะแนนรวมที่ได้ในสัปดาห์นี้ |
| `createdAt` | Timestamp | วันที่บันทึก |

### 4.2 Transactions Sub-collection
`users/{userId}/transactions/{transactionId}`
เก็บประวัติการได้รับหรือใช้จ่าย Balls ของผู้เล่น
**(IMPORTANT: ทุกครั้งที่มีการเพิ่ม/ลด Balls จะต้องเขียนข้อมูลลง Collection นี้เสมอด้วย `appendTransactionLog` หรือ `processTransaction` เพื่อให้ประวัติกับยอดเงินตรงกัน)**

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `amount`    | Number | ยอดเงินที่ทำรายการ (บวก/ลบ) |
| `type`      | String | 'earn' หรือ 'spend' |
| `source`    | String | แหล่งที่มา (เช่น 'daily_login', 'sponsor_ad') |
| `description`| String | คำอธิบายรายการสำหรับ UI |
| `timestamp` | Timestamp | วันเวลาที่ทำรายการ |
| `status`    | String | สถานะ (เช่น 'success') |

### 4.3 Club Upgrades Sub-collection
`users/{userId}/game_data/club`
เก็บข้อมูลระดับการอัพเกรดสโมสรของผู้เล่น

| Field                 | Type   | Description |
| --------------------- | ------ | ----------- |
| `stadiumLevel`        | Number | เลเวลของสนามแข่ง (1-10) |
| `trainingGroundLevel` | Number | เลเวลของสนามฝึกซ้อม (1-10) |
| `hospitalLevel`       | Number | เลเวลของโรงพยาบาล (1-10) |
| `gymLevel`            | Number | เลเวลของยิม (1-10) |
| `youthAcademyLevel`   | Number | เลเวลของศูนย์ฝึกเยาวชน (1-10) |
| `spentExp`            | Number | แต้มสะสมรวมที่ถูกใช้ไปเพื่ออัพเกรด |
| `updatedAt`           | Timestamp | เวลาอัปเดตล่าสุด |

### 4.4 Friends Sub-collection
`users/{userId}/friends/{friendId}`
เก็บข้อมูลเพื่อนและสถานะคำขอเป็นเพื่อน

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `uid`       | String | รหัสผู้ใช้งานของเพื่อน |
| `displayName`| String | ชื่อเพื่อน |
| `photoURL`  | String | รูปเพื่อน |
| `status`    | String | สถานะ: 'pending' (รอรับ), 'requested' (ส่งคำขอไปแล้ว), 'accepted' (เป็นเพื่อนกันแล้ว) |
| `createdAt` | Timestamp | วันที่บันทึก |
| `updatedAt` | Timestamp | เวลาอัปเดตสถานะล่าสุด |

## 6. System Config Schema (การตั้งค่าระบบ)
`public_data/system_config`

| Field              | Type    | Description |
| ------------------ | ------- | ----------- |
| `currentGameweek`  | String  | สัปดาห์การแข่งขันปัจจุบัน (เช่น 'GW1') |
| `isMarketOpen`     | Boolean | สถานะตลาดซื้อขาย (เปิด = true, ปิด = false) |
| `totalJoinedTeams` | Number  | จำนวนทีมที่เข้าร่วมแล้ว (16 คนครบ) |
| `isNoAdsMode`      | Boolean | โหมดปิดโฆษณา |
| `themeConfig`      | Object  | `{"loginBackgroundUrl":"", "floatingObjectUrl":"", "marketBackgroundUrl":""}` |
| `buttonAdsConfig`  | Object  | `{ "autoPick": {cooldownSeconds: 15, adLinkUrl: ""}, "reset": {...} }` |
| `chatConfig`       | Object  | `{"normalChatCost":2, "superChatCost":15, "superChatDuration":30, "superChatCostIncrement":5, "superChatResetTime":60, "normalChatFreeInterval":300}` |
| `latestSuperChatEndTime` | Timestamp | เวลาสิ้นสุดของ Super Chat ตัวสุดท้าย (ใช้คำนวณคิว) |

## 6.5 Achievement Schema (ฉายาและความสำเร็จ)
`public_data/achievements/list/{achievementId}`

| Field              | Type    | Description |
| ------------------ | ------- | ----------- |
| `title`            | String  | ชื่อฉายา (เช่น 'ROOKIE') |
| `desc`             | String  | คำอธิบายการปลดล็อค |
| `iconType`         | String  | ชื่อไอคอนสำหรับ UI (เช่น 'Star', 'Shield', 'Trophy', 'Award') |
| `rarity`           | String  | ระดับความหายาก ('common', 'rare', 'epic', 'legendary') |
| `conditionType`    | String  | ตัวแปรเงื่อนไข ('userPoints', 'lastGameweekPoints', 'balls', 'clubSpentExp', 'stadiumLevel', 'streak', 'admin', 'none') |
| `conditionValue`   | Number  | ค่าที่ต้องผ่านเงื่อนไขถึงจะปลดล็อค |
| `isActive`         | Boolean | สถานะการเปิดใช้งาน |
| `createdAt`        | Timestamp | เวลาที่สร้าง |
| `updatedAt`        | Timestamp | เวลาที่อัปเดต |

## 7. Gameweek Config Schema
`public_data/gameweeks/weeks/{gameweekId}`

| Field         | Type    | Description |
| ------------- | ------- | ----------- |
| `gameweekId`  | String  | รหัสสัปดาห์ (เช่น 'GW1') |
| `status`      | String  | 'upcoming', 'active', 'completed' |
| `deadlineAt`  | Timestamp| เวลาปิดรับการจัดทีม |
| `updatedAt`   | Timestamp| วันที่อัปเดต |

## 8. Global Chat Schema
`global_chat/{messageId}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `userId`    | String | รหัสผู้ส่ง |
| `userName`  | String | ชื่อผู้ส่ง |
| `userPhoto` | String | รูปโปรไฟล์ผู้ส่ง |
| `text`      | String | ข้อความแชท |
| `createdAt` | Timestamp | วันที่ส่ง |
| `isSystem`  | Boolean | เป็นข้อความระบบหรือไม่ |
| `isSuperChat`| Boolean| เป็นข้อความพิเศษหรือไม่ (หัก Balls เยอะกว่า) |
| `startTime`  | Timestamp| เวลาที่เริ่มแสดง Super Chat (ตามคิว) |
| `pinnedUntil`| Timestamp| เวลาที่สิ้นสุดการปักหมุดข้อความ (สำหรับ Super Chat) |

## 9. League Schema (ลีกส่วนตัว)
`leagues/{leagueId}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `name`      | String | ชื่อลีกหรือการดวล |
| `code`      | String | รหัส 6 หลักสำหรับเข้าร่วม |
| `creatorId` | String | รหัสผู้สร้างลีก |
| `mode`      | String | 'classic' หรือ 'duel' |
| `customRules`| Object | กติกาพิเศษ เช่น `{ captainMultiplier: 2, goal: 800, assist: 600 }` |
| `members`   | Array  | เก็บข้อมูลผู้เข้าร่วม `[{ id, displayName, photoURL, teamName, userPoints, updatedAt }]` (updatedAt ใช้ทำ Tie-breaker) |
| `createdAt` | Timestamp | วันที่สร้าง |
## 10. Live Match Schema
`public_data/live_match` (Main real-time document)

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `homeTeam`  | Object | `{"code":"MUN", "logo":"url", "name":"Manchester United"}` |
| `awayTeam`  | Object | `{"code":"LIV", "logo":"url", "name":"Liverpool"}` |
| `homeScore` | Number | คะแนนทีมเย้า |
| `awayScore` | Number | คะแนนทีมเยือน |
| `minute`    | String | นาทีของการแข่งขัน (เช่น '47', 'HT', 'FT') |
| `status`    | String | 'upcoming', 'LIVE', 'FT' |
| `latestEvent`| Object | เก็บเหตุการณ์ล่าสุด (`primaryDetail`, `secondaryDetail`, `timestamp`) เพื่อความประหยัด Reads |
| `updatedAt` | Timestamp | เวลาอัปเดตล่าสุด |

### 10.1 Live Match Events Sub-collection
`public_data/live_match/events/{eventId}`

| Field             | Type   | Description |
| ----------------- | ------ | ----------- |
| `homeScore`       | Number | คะแนนขณะเกิดเหตุการณ์ |
| `awayScore`       | Number | คะแนนขณะเกิดเหตุการณ์ |
| `minute`          | String | นาที |
| `primaryDetail`   | String | เช่น 'B. Sesko Goal ⚽' |
| `secondaryDetail` | String | เช่น 'B. Fernandes Assist 👟' |
| `timestamp`       | Timestamp | เวลาเกิดเหตุการณ์ |

### 10.2 Live Gameweek Stats
`public_data/live_gameweek_stats/{playerId}`
เก็บสถิติและคะแนนเฉพาะในสัปดาห์ปัจจุบัน (Gameweek ปัจจุบัน) แบบ Real-time เพื่อประหยัดโควต้าการอ่าน (Query เพียงนักเตะที่มีในทีมด้วย `in`)
| Field             | Type   | Description |
| ----------------- | ------ | ----------- |
| `goals`           | Number | จำนวนประตูที่ทำได้ในสัปดาห์นี้ |
| `assists`         | Number | จำนวนแอสซิสต์ในสัปดาห์นี้ |
| `cleanSheets`     | Number | จำนวนคลีนชีตในสัปดาห์นี้ |
| `yellowCards`     | Number | จำนวนใบเหลืองในสัปดาห์นี้ |
| `redCards`        | Number | จำนวนใบแดงในสัปดาห์นี้ |
| `gwPoints`        | Number | คะแนนรวมที่ทำได้ในสัปดาห์นี้ |
| `updatedAt`       | Timestamp | เวลาอัปเดตล่าสุด |

## 11. Inventory Schema (คลังเก็บของรายสัปดาห์)
`users/{userId}/game_data/inventory`

| Field            | Type   | Description |
| ---------------- | ------ | ----------- |
| `ownedManagers`  | Array  | รายการ ID ของผู้จัดการทีมที่ซื้อไว้ (เช่น `['A', 'C']`) |
| `ownedCards`     | Object | จำนวนการ์ดแต่ละชนิดที่มีในคลัง (เช่น `{"CARD_01": 2, "CARD_02": 1}`) |
| `lastUpdatedGW`  | String | รหัสสัปดาห์ล่าสุดที่มีการอัปเดต (ใช้เพื่อ Reset เมื่อเปลี่ยนสัปดาห์) |

## 12. Game Rules Schema (กติกาและเงื่อนไข)

### 12.1 Game Rules
`public_data/game_rules`
เก็บกติกาพื้นฐานในการจัดทีม เช่น โควต้าผู้เล่น กัปตัน
*หมายเหตุ: ค่าเหล่านี้ถูกดึงไปใช้ฝั่ง Frontend โดยมีระบบ Cache 1 ชั่วโมงผ่าน `gameRulesService.js`*
| Field | Type | Description |
| --- | --- | --- |
| `maxPlayersTotal` | Object | `{"value": 15, "isActive": true}` (เพิ่มใหม่เพื่อใช้แทน Hardcode) |
| `positionLimits` | Object | `{"GK": 2, "DF": 5, "MF": 5, "FW": 3, "isActive": true}` (เพิ่มใหม่เพื่อความยืดหยุ่น) |
| `startingBudget` | Object | `{"value": 100, "isActive": true}` |
| `maxPlayersPerTeam` | Object | `{"value": 3, "isActive": true}` |
| `freeTransfers` | Object | `{"value": 1, "isActive": true}` |
| `captainMultiplier` | Object | `{"value": 2, "isActive": true}` |
| `viceCaptainSystem` | Object | `{"isActive": true}` เปิดใช้งานระบบรองกัปตัน |
| `budgetCarryOver` | Object | `{"percent": 50, "isActive": true}` หักเปอรเซ็นต์เงินคงเหลือยกยอดไปสัปดาห์หน้า |
| `synergyBonus` | Object | `{"sameTeamThreshold": 3, "sameNationThreshold": 4, "bonusPercent": 5, "isActive": true}` เปิดใช้งานโบนัสทีม/ชาติเดียวกัน |
| `playStreaks` | Object | `{"streakTarget": 3, "rewardType": "budget", "rewardValue": 5, "isActive": true}` เปิดใช้งานแจกรางวัลคนส่งทีมต่อเนื่อง |

### 12.2 Scoring Rules (The 10k Scale)
`public_data/scoring_rules`
เก็บกติกาการให้คะแนนสำหรับแต่ละเหตุการณ์ โดยอ้างอิงข้อมูลจาก API-Football Pro
| Field | Type | Description |
| --- | --- | --- |
| `playBase` | Object | `{"value": 200, "isActive": true}` |
| `goal` | Object | `{"FWD": 800, "MID": 1000, "DEF": 1200, "GK": 1500, "isActive": true}` |
| `assist` | Object | `{"value": 600, "isActive": true}` |
| `cleanSheet` | Object | `{"DEF": 500, "GK": 500, "MID": 200, "FWD": 0, "isActive": true}` |
| `yellowCard` | Object | `{"value": -200, "isActive": true}` |
| `redCard` | Object | `{"value": -600, "isActive": true}` |
| `saves` | Object | `{"value": 50, "per": 1, "isActive": true}` |

### 12.3 Game Conditions
`public_data/game_conditions`
เก็บเงื่อนไขสภาพแวดล้อมและข้อจำกัดในแต่ละ Gameweek
| Field | Type | Description |
| --- | --- | --- |
| `cardLimitPerGW` | Object | `{"value": 1, "isActive": true}` |
| `deadlineOffsetMinutes`| Object | `{"value": 90, "isActive": true}` |
| `allowedFormations` | Object | `{"isActive": true, "formations": {"4-4-2": true, "3-5-2": false}}` |

## 13. Historical Data Archive (คลังข้อมูลในอดีต)
ข้อมูลสถิติในอดีตใช้สำหรับอ้างอิงและประมวลผล (เช่น Value Engine) ไม่แสดงผลสดเพื่อประหยัด Reads

### 13.1 Historical Players
`public_data/historical_players/{season_sku}` (เช่น `2022_API-1234`)

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `id`        | String | ID ที่รวม Season และ Player ID (เช่น '2022_API-1234') |
| `sku`       | String | รหัสอ้างอิงดั้งเดิม ('API-1234') |
| `season`    | Number | ปีฤดูกาล (เช่น 2022) |
| `name`      | String | ชื่อนักเตะ |
| `team`      | String | ชื่อทีม |
| `position`  | String | ตำแหน่งหลักในฤดูกาลนั้น |
| `stats`     | Object | สถิติรวมของฤดูกาลนั้น (goals, assists, cleanSheets ฯลฯ) |
| `updatedAt` | Timestamp | เวลาที่ดึงข้อมูล |

### 13.2 Historical Teams
`public_data/historical_teams/{season_teamId}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `id`        | String | ID ที่รวม Season และ Team ID (เช่น '2022_33') |
| `teamId`    | String | รหัสทีม ('33' = Man Utd) |
| `season`    | Number | ปีฤดูกาล |
| `name`      | String | ชื่อทีม |
| `stats`     | Object | สถิติรวมของทีม (played, wins, draws, loses, goalsFor, goalsAgainst) |
| `updatedAt` | Timestamp | เวลาที่ดึงข้อมูล |

### 13.3 API Fetch History
`admin_data/api_fetch_history/{fetchId}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `type`      | String | 'PLAYERS', 'TEAMS', 'FIXTURES' |
| `season`    | Number | ปีฤดูกาลที่ดึง |
| `status`    | String | 'SUCCESS', 'FAILED', 'IN_PROGRESS' |
| `recordsFetched` | Number | จำนวนที่ดึงมาได้ |
| `timestamp` | Timestamp | เวลาที่ทำการดึง |
| `adminId`   | String | UID แอดมินที่สั่งดึง |

## 14. Ads Configuration Schema
`public_data/ads_config`
จัดการตั้งค่าการแสดงผลโฆษณาทั้งแบบ Custom Links และ Google AdSense

| Field | Type | Description |
| --- | --- | --- |
| `adLinks` | Array | รายการโฆษณาแบบกำหนดเอง `[{ id, position, imageUrl, linkUrl, isActive }]` |
| `googleAdsense` | Object | การตั้งค่า Google AdSense `{"clientId": "", "slotId": "", "isActive": false}` |

## 15. Cloud Functions Architecture (NEW!)
มีการย้ายลอจิกสำคัญจาก Client ไปยัง Backend (Cloud Functions) เพื่อความปลอดภัย (ป้องกันการโกง) และรวมศูนย์ (Single Responsibility):

### 15.1 API Routes & Middleware (`functions/src/api` & `functions/src/middleware`)
- **`schemas.js` & `validation.js`**: ตรวจสอบความถูกต้องของข้อมูล (Data Validation) ด้วย Zod ก่อนทำงาน
- **`rateLimiter.js`**: ป้องกันการรัวคำสั่ง (Rate Limiting) สำหรับระบบแชทและการทำธุรกรรม

### 15.2 Engine Functions (`functions/src/engine`)
- **`gameweekCalculation.js`**: คำนวณคะแนนของนักเตะแต่ละคนในสัปดาห์นั้นๆ (ใช้ 490-operation batch limit ของ Firestore เพื่อรองรับข้อมูลขนาดใหญ่)
- **`playerValueCalculation.js`**: อัปเดตและคำนวณราคานักเตะใหม่ตามสถิติของสัปดาห์
- **`leaderboardEngine.js`**: ประมวลผลและอัปเดตกระดานจัดอันดับอัตโนมัติ
- **`syncLiveStats.js`**: (NEW) ดึงข้อมูลการแข่งขันสดและอัปเดตแบบ Real-time ไปที่ `public_data/live_gameweek_stats` เพื่อประหยัด Reads

### 15.2 Economy Functions (`functions/src/economy`)
- **`transactionService.js`**: จัดการธุรกรรมทางการเงิน (เพิ่ม/ลด Balls) ผ่าน `db.runTransaction` เพื่อป้องกัน Race condition และป้องกันผู้เล่นแก้ไขยอดเงินตัวเองโดยพลการ
- **`clubService.js`**: (NEW) จัดการการอัพเกรดสโมสร (หัก EXP และเลื่อน Level อย่างปลอดภัย) ผ่าน `db.runTransaction` ป้องกันการโดนแก้ข้อมูลจากฝั่งผู้เล่น

### 15.3 Social Functions (`functions/src/social`)
- **`friendService.js`**: (NEW) ตรวจสอบและประมวลผลคำขอเป็นเพื่อนผ่านฝั่ง Server ป้องกันการปลอมแปลง UID
- **`leagueService.js`**: (NEW) สร้างและจัดการรหัสลีกส่วนตัวอย่างปลอดภัย
