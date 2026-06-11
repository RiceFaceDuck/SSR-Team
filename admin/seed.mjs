import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMhbAlH6UxbYK0I6VULTbvM9uLhsBidHQ",
  authDomain: "ssr-team.firebaseapp.com",
  projectId: "ssr-team",
  storageBucket: "ssr-team.firebasestorage.app",
  messagingSenderId: "349137449851",
  appId: "1:349137449851:web:9c4ae3504a269a57b183de",
  measurementId: "G-F5KCM3V0XM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const mockManagers = [
  { id: 'A', name: 'Arthur Shield', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A', effectLogic: { type: 'DEF_CLEAN_SHEET_BONUS', value: 2 }, description: 'กองหลังได้รับ +2 คะแนน เมื่อทำคลีนชีตสำเร็จ', isActive: true },
  { id: 'B', name: 'Victor Wealth', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B', effectLogic: { type: 'BUDGET_BONUS', value: 25 }, description: 'เพิ่มงบประมาณสโมสรในการซื้อนักเตะ +25M', isActive: true },
  { id: 'C', name: 'Prof. Tacticus', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=C', effectLogic: { type: 'UNLOCK_FORMATION' }, description: 'ปลดล็อกแผนการเล่นพิเศษเพื่อใช้จัดทีม', isActive: true },
  { id: 'D', name: 'Max Firepower', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=D', effectLogic: { type: 'FW_GOAL_FEST_BONUS', value: 2 }, description: 'กองหน้าได้รับ +2 คะแนน เมื่อทีมยิงได้ 3 ประตูขึ้นไป', isActive: true },
  { id: 'E', name: 'Simon Synergy', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=E', effectLogic: { type: 'CLUB_SYNERGY_BONUS', value: 1 }, description: 'นักเตะที่มาจากสโมสรเดียวกัน 3 คนขึ้นไป ได้รับโบนัสคนละ +1 คะแนน', isActive: true },
  { id: 'F', name: 'Nigel Negotiator', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=F', effectLogic: { type: 'MARKET_DISCOUNT', value: 10 }, description: 'ลดราคานักเตะในตลาดซื้อขายลง 10%', isActive: true },
  { id: 'G', name: 'Master Commander', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=G', effectLogic: { type: 'CAPTAIN_TRIPLE_BONUS' }, description: 'กัปตันทีมจะได้รับโบนัสคะแนนคูณ 3 (จากเดิมคูณ 2)', isActive: true },
];

const appId = 'ssr-team';
const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'managers');

async function seed() {
  console.log('Seeding managers...');
  for (const m of mockManagers) {
    const docRef = doc(colRef, m.id);
    await setDoc(docRef, {
      ...m,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log(`Saved ${m.name}`);
  }
  console.log('Done!');
  process.exit(0);
}

seed().catch(console.error);
