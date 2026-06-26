# 📝 งานที่ค้างอยู่ (Pending Tasks)

## 1. ปัญหาการเชื่อมต่อ Cloud Functions (สถานะ: รอการอัปเกรด Firebase Blaze Plan)
- **ปัญหา:** ผู้เล่นกดรับรางวัลจากเควสต์ไม่ได้ (ขึ้นแจ้งเตือน `internal`)
- **สาเหตุ:**
  1. บัคที่หน้าเว็บ (แก้แล้ว): หน้าเว็บเดิมมีคำสั่ง `require('firebase/functions')` ซึ่งพังบน Vite ทำให้ยิง API ไม่ไปถึงหลังบ้าน (ขึ้น Error ภายในฝั่ง Frontend)
  2. บัคที่ Cloud Functions (แก้แล้วแต่ยังไม่ได้ Deploy): เมื่อแก้ Frontend ให้ยิง API ไปได้แล้ว ไปชนกับบัคบน Firestore ที่ไม่อนุญาตให้ใช้ `transaction.update` บน `dailyQuests` (กรณีที่ผู้เล่นใหม่ยังไม่มี Object นี้) ทำให้หลังบ้านพังและคืนค่า `internal`
  3. สาเหตุที่ยังค้างอยู่: โปรเจกต์ `ssr-team` ยังอยู่ใน **Spark Plan (ฟรี)** ทำให้ระบบ **ไม่อนุญาตให้ใช้งานและ Deploy Cloud Functions** ได้อีกต่อไป (Google บังคับใช้ Blaze Plan)
- **สิ่งที่ต้องทำต่อ (Next Steps):**
  - [ ] **ผู้ใช้ (USER):** ดำเนินการอัปเกรดโปรเจกต์ `ssr-team` ใน Firebase ให้เป็น **Blaze Plan (Pay-as-you-go)** โดยผูกบัตรเครดิต/เดบิต ที่ลิงก์: [อัปเกรด Firebase](https://console.firebase.google.com/project/ssr-team/usage/details)
  - [ ] **Antigravity (AI):** หลังจากผู้ใช้อัปเกรดเสร็จแล้ว ให้รันคำสั่ง `npx firebase-tools deploy --only functions:claimQuestReward` หรือ `npx firebase-tools deploy --only functions` เพื่อเอาโค้ดใน `rewardService.js` ชุดใหม่ขึ้นไปบนเซิร์ฟเวอร์
  - [ ] **Antigravity (AI):** แนะนำให้เคลียร์ยอดโควต้าที่พุ่งทะลุ 86K ด้วยการทำ Optimize การโหลดข้อมูล Firestore เพิ่มเติม ตามที่เคยทำแผน Audit ไว้

---
*หมายเหตุ: ไฟล์นี้สร้างขึ้นเพื่อให้ AI ตัวถัดไป (หรือผมเองในอนาคต) กลับมาอ่านและสานต่องานได้ทันทีโดยไม่ต้องวิเคราะห์ซ้ำ*
