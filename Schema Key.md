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

## 2. Squad Schema (ทีมของผู้เล่น)
`artifacts/{appId}/users/{userId}/game_data/squad`

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `mySquad`   | Array  | เก็บรายชื่อนักเตะในทีมแบบย่อ `[{ playerId, position, isStarting, slotIndex }]` |
| `budgetLeft`| Number | งบประมาณที่เหลืออยู่ |
| `formation` | String | แผนการเล่นปัจจุบัน (เช่น '4-4-2') |
| `updatedAt` | Timestamp | Firestore server timestamp |

## 3. User Schema
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
| `createdAt` | Timestamp | วันที่สร้าง |
| `lastLoginAt`| Timestamp | ล็อกอินล่าสุด |
