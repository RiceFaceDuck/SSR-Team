# 🔴 Schema CRITICAL — แก้ผิดแล้วระบบพัง / โดนโกงได้

> **⚠️ DANGER ZONE**: Schema ในไฟล์นี้เกี่ยวกับ Security, เงิน, คะแนน และกติกาเกม
> ทุกการแก้ไขต้อง double-check เสมอ ผิดพลาดแม้แค่ field เดียวอาจทำให้ระบบพังทั้งหมด

---

## C1. System Config Schema (การตั้งค่าระบบ)
`public_data/system_config`

> 🔒 **Security**: สวิตช์กลางควบคุมทั้งระบบ — เปลี่ยนค่าผิดกระทบผู้เล่นทุกคนทันที

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

---

## C2. Gameweek Config Schema
`public_data/gameweeks/weeks/{gameweekId}`

> 🔒 **Security**: กำหนดสถานะสัปดาห์ — ผิดจะทำให้ประมวลผลคะแนนพลาดทั้งระบบ

| Field         | Type    | Description |
| ------------- | ------- | ----------- |
| `gameweekId`  | String  | รหัสสัปดาห์ (เช่น 'GW1') |
| `status`      | String  | 'upcoming', 'active', 'completed' |
| `deadlineAt`  | Timestamp| เวลาปิดรับการจัดทีม |
| `updatedAt`   | Timestamp| วันที่อัปเดต |

---

## C3. Game Rules
`public_data/game_rules`

> 🔒 **Security**: กติกาพื้นฐานในการจัดทีม — ผิดจะทำให้ผู้เล่นจัดทีมผิดกติกา
> *หมายเหตุ: ค่าเหล่านี้ถูกดึงไปใช้ฝั่ง Frontend โดยมีระบบ Cache 1 ชั่วโมงผ่าน `gameRulesService.js`*

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

---

## C4. Scoring Rules (The 10k Scale)
`public_data/scoring_rules`

> 🔒 **Security**: กติกาการให้คะแนน — ผิดจะทำให้คะแนนผิดทุกคน ทุกสัปดาห์
> อ้างอิงข้อมูลจาก API-Football Pro

| Field | Type | Description |
| --- | --- | --- |
| `playBase` | Object | `{"value": 200, "isActive": true}` |
| `goal` | Object | `{"FWD": 800, "MID": 1000, "DEF": 1200, "GK": 1500, "isActive": true}` |
| `assist` | Object | `{"value": 600, "isActive": true}` |
| `cleanSheet` | Object | `{"DEF": 500, "GK": 500, "MID": 200, "FWD": 0, "isActive": true}` |
| `yellowCard` | Object | `{"value": -200, "isActive": true}` |
| `redCard` | Object | `{"value": -600, "isActive": true}` |
| `saves` | Object | `{"value": 50, "per": 1, "isActive": true}` |

---

## C5. Game Conditions
`public_data/game_conditions`

> 🔒 **Security**: เงื่อนไขสภาพแวดล้อมและข้อจำกัดในแต่ละ Gameweek

| Field | Type | Description |
| --- | --- | --- |
| `cardLimitPerGW` | Object | `{"value": 1, "isActive": true}` |
| `deadlineOffsetMinutes`| Object | `{"value": 90, "isActive": true}` |
| `allowedFormations` | Object | `{"isActive": true, "formations": {"4-4-2": true, "3-5-2": false}}` |

---

## C6. Gameweek History Sub-collection
`users/{userId}/gameweek_history/{gameweekId}`

> 🔒 **Security**: เขียนได้เฉพาะ Cloud Functions / Admin เท่านั้น เพื่อป้องกันการปลอมแปลงคะแนนย้อนหลัง

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `gameweekId`| String | รหัสสัปดาห์ (เช่น 'GW1') |
| `squad`     | Array  | Snapshot ทีมในสัปดาห์นั้น `[{ playerId, position, isStarting, pointsEarned }]` |
| `managerId` | String | ผู้จัดการทีมที่ใช้ |
| `captainId` | String | กัปตันทีม |
| `mvpId`     | String | ผู้เล่นที่ได้ MVP ประจำสัปดาห์ |
| `points`    | Number | คะแนนรวมที่ได้ในสัปดาห์นี้ |
| `createdAt` | Timestamp | วันที่บันทึก |

---

## C7. Transactions Sub-collection
`users/{userId}/transactions/{transactionId}`

> 🔒 **Security**: ทุกครั้งที่มีการเพิ่ม/ลด Balls จะต้องเขียนข้อมูลลง Collection นี้เสมอด้วย `appendTransactionLog` หรือ `processTransaction` เพื่อให้ประวัติกับยอดเงินตรงกัน
> ต้องใช้ `db.runTransaction` เพื่อป้องกัน Race condition

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `amount`    | Number | ยอดเงินที่ทำรายการ (บวก/ลบ) |
| `type`      | String | 'earn' หรือ 'spend' |
| `source`    | String | แหล่งที่มา (เช่น 'daily_login', 'sponsor_ad') |
| `description`| String | คำอธิบายรายการสำหรับ UI |
| `timestamp` | Timestamp | วันเวลาที่ทำรายการ |
| `status`    | String | สถานะ (เช่น 'success') |

---

## C8. Club Upgrades Sub-collection
`users/{userId}/game_data/club`

> 🔒 **Security**: บล็อกการ Update ผ่าน Client โดยเด็ดขาด ให้อัปเกรดผ่าน Cloud Functions เพื่อป้องกันการโกง
> ต้องใช้ `db.runTransaction` เพื่อหัก EXP และเลื่อน Level อย่างปลอดภัย

| Field                 | Type   | Description |
| --------------------- | ------ | ----------- |
| `stadiumLevel`        | Number | เลเวลของสนามแข่ง (1-10) |
| `trainingGroundLevel` | Number | เลเวลของสนามฝึกซ้อม (1-10) |
| `hospitalLevel`       | Number | เลเวลของโรงพยาบาล (1-10) |
| `gymLevel`            | Number | เลเวลของยิม (1-10) |
| `youthAcademyLevel`   | Number | เลเวลของศูนย์ฝึกเยาวชน (1-10) |
| `spentExp`            | Number | แต้มสะสมรวมที่ถูกใช้ไปเพื่ออัพเกรด |
| `updatedAt`           | Timestamp | เวลาอัปเดตล่าสุด |

---

## C9. Cloud Functions Architecture

> 🔒 **Security**: แผนผัง Backend ทั้งหมด — ลอจิกสำคัญที่ย้ายจาก Client ไป Server เพื่อป้องกันการโกงและรวมศูนย์

### C9.1 API Routes & Middleware (`functions/src/api` & `functions/src/middleware`)
- **`schemas.js` & `validation.js`**: ตรวจสอบความถูกต้องของข้อมูล (Data Validation) ด้วย Zod ก่อนทำงาน
- **`rateLimiter.js`**: ป้องกันการรัวคำสั่ง (Rate Limiting) สำหรับระบบแชทและการทำธุรกรรม

### C9.2 Engine Functions (`functions/src/engine`)
- **`gameweekCalculation.js`**: คำนวณคะแนนของนักเตะแต่ละคนในสัปดาห์นั้นๆ (ใช้ 490-operation batch limit ของ Firestore เพื่อรองรับข้อมูลขนาดใหญ่)
- **`playerValueCalculation.js`**: อัปเดตและคำนวณราคานักเตะใหม่ตามสถิติของสัปดาห์
- **`leaderboardEngine.js`**: ประมวลผลและอัปเดตกระดานจัดอันดับอัตโนมัติ
- **`syncLiveStats.js`**: ดึงข้อมูลการแข่งขันสดและอัปเดตแบบ Real-time ไปที่ `public_data/live_gameweek_stats` เพื่อประหยัด Reads

### C9.3 Economy Functions (`functions/src/economy`)
- **`transactionService.js`**: จัดการธุรกรรมทางการเงิน (เพิ่ม/ลด Balls) ผ่าน `db.runTransaction` เพื่อป้องกัน Race condition และป้องกันผู้เล่นแก้ไขยอดเงินตัวเองโดยพลการ
- **`clubService.js`**: จัดการการอัพเกรดสโมสร (หัก EXP และเลื่อน Level อย่างปลอดภัย) ผ่าน `db.runTransaction` ป้องกันการโดนแก้ข้อมูลจากฝั่งผู้เล่น

### C9.4 Social Functions (`functions/src/social`)
- **`friendService.js`**: ตรวจสอบและประมวลผลคำขอเป็นเพื่อนผ่านฝั่ง Server ป้องกันการปลอมแปลง UID
- **`leagueService.js`**: สร้างและจัดการรหัสลีกส่วนตัวอย่างปลอดภัย
