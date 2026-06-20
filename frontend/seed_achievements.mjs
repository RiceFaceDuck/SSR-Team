import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const configContent = fs.readFileSync("./src/config/firebase.js", "utf-8");
const configMatch = configContent.match(/const firebaseConfig = ({[\s\S]*?});/);

if (!configMatch) {
  console.error("Could not find firebaseConfig");
  process.exit(1);
}

const firebaseConfig = eval("(" + configMatch[1] + ")");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ACHIEVEMENTS = [
  { id: 'achv_rookie', title: 'ROOKIE', desc: 'ลงทะเบียนเข้าสู่เกม (เด็กใหม่ไฟแรง)', iconType: 'Star', rarity: 'common', conditionType: 'none', conditionValue: 0, isActive: true },
  { id: 'achv_millionaire', title: 'MILLIONAIRE', desc: 'มียอดเงินสะสมเกิน 1,000 Balls', iconType: 'Award', rarity: 'rare', conditionType: 'balls', conditionValue: 1000, isActive: true },
  { id: 'achv_veteran', title: 'VETERAN', desc: 'ทำคะแนนรวมได้เกิน 5,000 Pts', iconType: 'Shield', rarity: 'epic', conditionType: 'userPoints', conditionValue: 5000, isActive: true },
  { id: 'achv_mastermind', title: 'MASTERMIND', desc: 'ทำคะแนนสัปดาห์ล่าสุดเกิน 1,500 Pts', iconType: 'Trophy', rarity: 'legendary', conditionType: 'lastGameweekPoints', conditionValue: 1500, isActive: true },
  { id: 'achv_president', title: 'PRESIDENT', desc: 'อัพเกรดสโมสรโดยใช้ EXP ไปแล้วมากกว่า 2,000', iconType: 'Crown', rarity: 'epic', conditionType: 'clubSpentExp', conditionValue: 2000, isActive: true },
  { id: 'achv_architect', title: 'ARCHITECT', desc: 'อัพเกรดสนามแข่งจนถึงเลเวลสูงสุด (Lv.10)', iconType: 'Award', rarity: 'legendary', conditionType: 'stadiumLevel', conditionValue: 10, isActive: true },
  { id: 'achv_onfire', title: 'ON FIRE', desc: 'ส่งทีมแข่งขันติดต่อกัน 3 สัปดาห์ขึ้นไป', iconType: 'Flame', rarity: 'rare', conditionType: 'streak', conditionValue: 3, isActive: true },
  { id: 'achv_vip', title: 'VIP', desc: 'แอดมินผู้ดูแลระบบ', iconType: 'Crown', rarity: 'legendary', conditionType: 'admin', conditionValue: 0, isActive: true },
];

async function seed() {
  console.log("Seeding achievements...");
  let count = 0;
  for (const achv of ACHIEVEMENTS) {
    const { id, ...data } = achv;
    await setDoc(doc(db, "public_data", "achievements", "list", id), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    count++;
    console.log(`Saved: ${achv.title}`);
  }
  console.log(`Successfully seeded ${count} achievements!`);
  process.exit(0);
}

seed();
