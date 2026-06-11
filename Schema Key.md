# Schema Key

This document outlines the standard data structures used across the SSR Team Fantasy application.

## 1. Player Schema
`artifacts/{appId}/public/data/players/{sku}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `sku`       | String | Unique identifier for the player (e.g. 'PLY-001' or 'API-1234') |
| `name`      | String | Short name used in game UI (e.g. 'Saka') |
| `fullName`  | String | Full name of the player |
| `imageUrl`  | String | URL to the player's photo |
| `position`  | String | FWD, MID, DEF, GK |
| `team`      | String | Club name (e.g. 'Arsenal') |
| `price`     | Number | Fantasy price (e.g. 12.5) |
| `totalPoints`| Number | Total fantasy points accumulated |
| `status`    | String | 'active', 'injured', or 'suspended' |
| `createdAt` | Timestamp | Firestore server timestamp |
| `updatedAt` | Timestamp | Firestore server timestamp |
| `isActive`  | Boolean | Logical deletion flag |

### 1.1 Player Stats Object (`stats`)
Inside the Player Schema, there is a `stats` object mapping to game attributes.
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

## 5. Card Schema (การ์ดเสริมพลัง)
`artifacts/{appId}/public/data/cards/{cardId}`

| Field         | Type    | Description |
| ------------- | ------- | ----------- |
| `name`        | String  | ชื่อการ์ด (เช่น 'รอดพ้นใบเหลือง') |
| `description` | String  | คำอธิบายความสามารถ |
| `icon`        | String  | Emoji ไอคอน (เช่น '🛡️') |
| `effectLogic` | Object  | `{"type":"IMMUNE_YELLOW"}` |
| `isActive`    | Boolean | เปิด/ปิดการ์ดในเกม |

## 2. Squad Schema (ทีมของผู้เล่น)
`artifacts/{appId}/users/{userId}/game_data/squad`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `mySquad`   | Array  | เก็บนักเตะ `[{ playerId, position, isStarting, slotIndex, appliedCardId }]` |
| `budgetLeft`| Number | งบประมาณที่เหลืออยู่ |
| `formation` | String | แผนการเล่นปัจจุบัน (เช่น '4-4-2') |
| `managerId` | String | รหัสผู้จัดการทีมที่เลือกใช้งาน |
| `captainId` | String | รหัสผู้เล่น (playerId) ที่เป็นกัปตันทีม |
| `updatedAt` | Timestamp | Firestore server timestamp |

## 3. Manager Schema (ผู้จัดการทีม)
`artifacts/{appId}/public/data/managers/{managerId}`

| Field         | Type    | Description |
| ------------- | ------- | ----------- |
| `name`        | String  | ชื่อผู้จัดการทีม |
| `avatarUrl`   | String  | ลิงก์รูปภาพของผู้จัดการทีม |
| `description` | String  | คำอธิบายความสามารถ (แสดงผลให้ผู้ใช้เห็น) |
| `effectLogic` | Object  | JSON Object กำหนดความสามารถพิเศษ เช่น `{"type":"BUDGET_BONUS", "value":25}` หรือ `{"type":"UNLOCK_FORMATION", "formations":["3-3-4"]}` |
| `isActive`    | Boolean | สถานะเปิด/ปิดการใช้งาน |
| `updatedAt`   | Timestamp| Firestore server timestamp |

## 4. User Schema
`users/{userId}`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `uid`       | String | รหัสผู้ใช้งาน |
| `displayName`| String | ชื่อที่แสดงผล |
| `email`     | String | อีเมล |
| `photoURL`  | String | URL รูปภาพโปรไฟล์ |
| `role`      | String | บทบาท ('player', 'admin') |
| `balls`     | Number | ทรัพยากรสำหรับดึงตัวนักเตะ |
| `userPoints`| Number | คะแนนรวม |
| `rank`      | Number | อันดับของผู้เล่น |
| `createdAt` | Timestamp | วันที่สร้าง |
| `lastLoginAt`| Timestamp | ล็อกอินล่าสุด |

## 6. System Config Schema (การตั้งค่าระบบ)
`public_data/system_config`

| Field              | Type    | Description |
| ------------------ | ------- | ----------- |
| `currentGameweek`  | String  | สัปดาห์การแข่งขันปัจจุบัน (เช่น 'WEEK 1') |
| `isMarketOpen`     | Boolean | สถานะตลาดซื้อขาย (เปิด = true, ปิด = false) |
| `totalJoinedTeams` | Number  | จำนวนทีมที่เข้าร่วมแล้ว (16 คนครบ) |
| `isNoAdsMode`      | Boolean | โหมดปิดโฆษณา |
| `themeConfig`      | Object  | `{"loginBackgroundUrl":"", "floatingObjectUrl":""}` |
