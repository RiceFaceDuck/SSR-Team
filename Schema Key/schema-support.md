# 🟢 Schema SUPPORT — ฟีเจอร์เสริมที่แก้ไขได้โดยไม่กระทบ Core

> **สำหรับ AI**: Schema ในไฟล์นี้เป็นฟีเจอร์อิสระ แก้ไขได้โดยไม่กระทบระบบหลัก

---

## S1. Achievement Schema (ฉายาและความสำเร็จ)
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

---

## S2. Global Chat Schema
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

---

## S3. League Schema (ลีกส่วนตัว)
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

---

## S4. Live Match Schema
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

### S4.1 Live Match Events Sub-collection
`public_data/live_match/events/{eventId}`

| Field             | Type   | Description |
| ----------------- | ------ | ----------- |
| `homeScore`       | Number | คะแนนขณะเกิดเหตุการณ์ |
| `awayScore`       | Number | คะแนนขณะเกิดเหตุการณ์ |
| `minute`          | String | นาที |
| `primaryDetail`   | String | เช่น 'B. Sesko Goal ⚽' |
| `secondaryDetail` | String | เช่น 'B. Fernandes Assist 👟' |
| `timestamp`       | Timestamp | เวลาเกิดเหตุการณ์ |

### S4.2 Live Gameweek Stats
`public_data/live_gameweek_stats/players/{playerId}`
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

---

## S5. Friends Sub-collection
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

---

## S6. Historical Data Archive (คลังข้อมูลในอดีต)
ข้อมูลสถิติในอดีตใช้สำหรับอ้างอิงและประมวลผล (เช่น Value Engine) ไม่แสดงผลสดเพื่อประหยัด Reads

### S6.1 Historical Players
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

### S6.2 Historical Teams
`public_data/historical_teams/{season_teamId}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `id`        | String | ID ที่รวม Season และ Team ID (เช่น '2022_33') |
| `teamId`    | String | รหัสทีม ('33' = Man Utd) |
| `season`    | Number | ปีฤดูกาล |
| `name`      | String | ชื่อทีม |
| `stats`     | Object | สถิติรวมของทีม (played, wins, draws, loses, goalsFor, goalsAgainst) |
| `updatedAt` | Timestamp | เวลาที่ดึงข้อมูล |

### S6.3 API Fetch History
`admin_data/api_fetch_history/{fetchId}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `type`      | String | 'PLAYERS', 'TEAMS', 'FIXTURES' |
| `season`    | Number | ปีฤดูกาลที่ดึง |
| `status`    | String | 'SUCCESS', 'FAILED', 'IN_PROGRESS' |
| `recordsFetched` | Number | จำนวนที่ดึงมาได้ |
| `timestamp` | Timestamp | เวลาที่ทำการดึง |
| `adminId`   | String | UID แอดมินที่สั่งดึง |

---

## S7. Ads Configuration Schema
`public_data/ads_config`
จัดการตั้งค่าการแสดงผลโฆษณาทั้งแบบ Custom Links และ Google AdSense

| Field | Type | Description |
| --- | --- | --- |
| `adLinks` | Array | รายการโฆษณาแบบกำหนดเอง `[{ id, position, imageUrl, linkUrl, isActive }]` |
| `googleAdsense` | Object | การตั้งค่า Google AdSense `{"clientId": "", "slotId": "", "isActive": false}` |

---

## S8. Leaderboard Cache Schema
`public_data/leaderboard_cache`
ข้อมูลการจัดอันดับและไฟล์ Export ที่ถูกคำนวณและสร้างไว้ล่วงหน้าจาก Cloud Functions เพื่อประหยัด Reads (ลดจาก N Reads เหลือ 1 Read)

| Field | Type | Description |
| --- | --- | --- |
| `weekly` | Array | รายชื่อ Top 100 ผู้เล่นที่คะแนน `lastGameweekPoints` สูงสุด `[{ id, displayName, teamName, photoURL, lastGameweekPoints, displayRank }]` |
| `season` | Array | รายชื่อ Top 100 ผู้เล่นที่คะแนน `userPoints` สูงสุด `[{ id, displayName, teamName, photoURL, userPoints, displayRank }]` |
| `club` | Array | รายชื่อ Top 100 ผู้เล่นที่ใช้ `clubSpentExp` สูงสุด `[{ id, displayName, teamName, photoURL, clubSpentExp, displayRank }]` |
| `exportDataTxt` | String | ข้อมูล String (.txt) ที่ถูกสร้างไว้แล้วล่วงหน้า สำหรับดาวน์โหลดทีมของ Top 50 ผู้เข้าแข่งขัน |
| `updatedAt` | Timestamp | เวลาที่ประมวลผลการจัดอันดับครั้งล่าสุด |
