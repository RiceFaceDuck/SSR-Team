import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const configContent = fs.readFileSync("./src/config/firebase.js", "utf-8");
const configMatch = configContent.match(/const firebaseConfig = ({[\s\S]*?});/);
const config = eval("(" + configMatch[1] + ")");
const app = initializeApp(config);
const db = getFirestore(app);

async function check() {
  const querySnapshot = await getDocs(collection(db, "players"));
  let count0 = 0;
  let countTotal = 0;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    countTotal++;
    if (!data.totalPoints || data.totalPoints === 0) count0++;
  });
  console.log(`Total players: ${countTotal}, Players with 0 points: ${count0}`);
}
check().then(() => process.exit(0));
