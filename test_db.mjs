import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from "fs";

// Read Firebase config from the frontend code
const configContent = fs.readFileSync("./frontend/src/config/firebase.js", "utf-8");
const configMatch = configContent.match(/const firebaseConfig = ({[\s\S]*?});/);

if (!configMatch) {
  console.error("Could not find firebaseConfig");
  process.exit(1);
}

const firebaseConfig = eval("(" + configMatch[1] + ")");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log("Checking system_config...");
  const docRef = doc(db, "public_data", "system_config");
  const snap = await getDoc(docRef);
  
  if (snap.exists()) {
    console.log("system_config data:", snap.data());
  } else {
    console.log("system_config DOES NOT EXIST!");
  }
  process.exit(0);
}

test();
