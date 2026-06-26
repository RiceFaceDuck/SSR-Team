# 🟡 Schema CORE — โครงสร้างหลักของเกมที่ใช้บ่อยที่สุด

> **สำหรับ AI**: ไฟล์นี้คือ Schema ที่ใช้ในการพัฒนาบ่อยที่สุด — ข้อมูลนักเตะ, ทีม, ผู้เล่น, Squad

## Field Summary

| Schema | Fields | Sub-collections | เชื่อมกับ |
|--------|--------|----------------|-----------|
| B1. Player | 12 + 11 stats | — | Squad (B3), Scoring (C4), Live Stats (S4.2) |
| B2. Team | 5 | — | Player.team (B1) |
| B3. Squad | 10 | — | Player (B1), Manager (B4), Card (B5), Game Rules (C3) |
| B4. Manager | 7 | — | Squad.managerId (B3), Inventory (B7) |
| B5. Card | 6 | — | Squad.appliedCardId (B3), Inventory (B7) |
| B6. User | 14 | Private (B6.1) | Transactions (C7), Club (C8), Friends (S5) |
| B7. Inventory | 3 | — | Manager (B4), Card (B5) |

---

## B1. Player Schema
`artifacts/{appId}/public/data/players/{sku}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `sku`       | String | Unique identifier (e.g. 'API-1234' or 'EXCEL-...'). **[IMMUTABLE]** ห้ามเปลี่ยนค่าเด็ดขาดเพราะเป็น Document ID. (กฏ Data Overlap: `API-` คือ Foundation เสมอ) |
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

### B1.1 Player Stats Object (`stats`)
Inside the Player Schema, there is a `stats` object mapping to game attributes.
*(Note on Optimization: When fetching all players in Admin, the query uses `limit(1500)` to cap memory usage.)*
*(Note on Auto-Kick: หากนักเตะถูกลบ หรือตั้งค่า `isActive: false` ระบบประมวลผล Gameweek จะทำการเตะนักเตะออกอัตโนมัติ พร้อมคืนเงินค่าตัวให้กับผู้เล่น)*

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

### 🔗 Frontend Data Relationships (marketDataParser.js)
The frontend consumes the exact fields defined above. Specifically, `marketDataParser.js` ensures strict compliance:
- **`position`**: Fallbacks to 'RES' if missing, normalizes 'ATTACKER' to 'FW'.
- **`totalPoints`**: If missing or 0, fallback points are calculated using `stats`.
- **`price`**: If > 1000, divides by 1,000,000 to convert to float (e.g. 50000000 -> 50.0).

---

## B2. Team Schema (สโมสรต้นสังกัด)
`artifacts/{appId}/public/data/teams/{teamId}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `id`        | String | รหัสทีม หรืออ้างอิง Slug (เช่น 'arsenal') **[IMMUTABLE]** |
| `apiTeamId` | Number | รหัส Team ID จาก API (ใช้สำหรับระบบ Sync นักเตะ) |
| `name`      | String | ชื่อทีมแบบเต็ม (เช่น 'Arsenal') |
| `shortName` | String | ชื่อย่อตัวพิมพ์ใหญ่ 3-4 ตัว (เช่น 'ARS') ใช้สำหรับ UI |
| `logo`      | String | URL รูปภาพโลโก้สโมสร |
| `updatedAt` | Timestamp | วันเวลาที่อัปเดตข้อมูลล่าสุด |

---

## B3. Squad Schema (ทีมของผู้เล่น)
`artifacts/{appId}/users/{userId}/game_data/squad`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `mySquad`   | Array  | เก็บนักเตะ `[{ playerId, position, isStarting, slotIndex, appliedCardId, appliedCard, isLocked }]` **(Secure: ผ่านการ Validate ด้วย Zod Schema อย่างเข้มงวด เมื่อประมวลผล Gameweek เสร็จ appliedCard จะถูกลบทิ้งอัตโนมัติ)** |
| `budgetLeft`| Number | งบประมาณที่เหลืออยู่ (Base + Carried Over) **[Secured by Client-side Transaction]** |
| `carriedOverBudget`| Number | งบประมาณโบนัสที่ยกยอดมาจากสัปดาห์ก่อนหน้า (ถ้ามี) |
| `formation` | String | แผนการเล่นปัจจุบัน (เช่น '4-4-2') |
| `managerId` | String | รหัสผู้จัดการทีมที่เลือกใช้งาน |
| `captainId` | String | รหัสผู้เล่น (playerId) ที่เป็นกัปตันทีม |
| `viceCaptainId`| String | รหัสผู้เล่น (playerId) ที่เป็นรองกัปตันทีม (สำรองกรณีกัปตันไม่ได้ลง) |
| `currentStreak`| Number | จำนวนสัปดาห์ที่ส่งทีมติดต่อกัน (Streak) |
| `updatedAt` | Timestamp | Firestore server timestamp |

---

## B4. Manager Schema (ผู้จัดการทีม)
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

---

## B5. Card Schema (การ์ดเสริมพลัง)
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

---

## B6. User Schema
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

### B6.1 Private Data Sub-collection
`users/{userId}/private/fcm_tokens`
เก็บ Tokens สำหรับส่ง Push Notifications (FCM)

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `{token}`   | Boolean| Token FCM ของอุปกรณ์ (ค่าเป็น `true` หากยังใช้งานได้) |

---

## B7. Inventory Schema (คลังเก็บของรายสัปดาห์)
`users/{userId}/game_data/inventory`

| Field            | Type   | Description |
| ---------------- | ------ | ----------- |
| `ownedManagers`  | Array  | รายการ ID ของผู้จัดการทีมที่ซื้อไว้ (เช่น `['A', 'C']`) |
| `ownedCards`     | Object | จำนวนการ์ดแต่ละชนิดที่มีในคลัง (เช่น `{"CARD_01": 2, "CARD_02": 1}`) |
| `lastUpdatedGW`  | String | รหัสสัปดาห์ล่าสุดที่มีการอัปเดต (ใช้เพื่อ Reset เมื่อเปลี่ยนสัปดาห์) |
