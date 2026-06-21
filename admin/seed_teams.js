import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMhbAlH6UxbYK0I6VULTbvM9uLhsBidHQ",
  authDomain: "ssr-team.firebaseapp.com",
  projectId: "ssr-team",
  storageBucket: "ssr-team.firebasestorage.app",
  messagingSenderId: "349137449851",
  appId: "1:349137449851:web:9c4ae3504a269a57b183de"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function update() {
  const teamsToUpdate = [
    {
      id: "arsenal",
      name: "Arsenal",
      shortName: "ARS",
      logo: "https://drive.google.com/uc?export=view&id=1UFrRRvrILn1S-bBj3XBMsZNQxW14jYi4"
    },
    {
      id: "aston-villa",
      name: "Aston Villa",
      shortName: "AVL",
      logo: "https://drive.google.com/uc?export=view&id=1lQEXj54RM2fAv6L-HRGwUQ8TDD2TiQME"
    },
    {
      id: "bournemouth",
      name: "Bournemouth",
      shortName: "BOU",
      logo: "https://drive.google.com/uc?export=view&id=1myTvy4Ve-L3VPrrKkpofFaT-GzDRbXOJ"
    }
  ];

  for (const team of teamsToUpdate) {
    const docRef = doc(db, 'artifacts', 'ssr-team', 'public', 'data', 'teams', team.id);
    try {
      await setDoc(docRef, team, { merge: true });
      console.log(`Updated ${team.name}`);
    } catch(e) {
      console.error(e);
    }
  }
  process.exit(0);
}
update();
