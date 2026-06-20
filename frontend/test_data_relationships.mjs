import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import fs from "fs";

// Read Firebase config from the frontend code
const configContent = fs.readFileSync("./src/config/firebase.js", "utf-8");
const configMatch = configContent.match(/const firebaseConfig = ({[\s\S]*?});/);

if (!configMatch) {
  console.error("Could not find firebaseConfig");
  process.exit(1);
}

const firebaseConfig = eval("(" + configMatch[1] + ")");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

import { getAuth, signInAnonymously } from "firebase/auth";

let TEST_USER_ID = "";

async function setupMockUser() {
  const auth = getAuth(app);
  const userCredential = await signInAnonymously(auth);
  TEST_USER_ID = userCredential.user.uid;
  console.log(`\n--- [Setup] Authenticated Anonymously. Creating Mock User: ${TEST_USER_ID} ---`);
  
  const userRef = doc(db, "users", TEST_USER_ID);
  await setDoc(userRef, {
    uid: TEST_USER_ID,
    displayName: "Test Player",
    teamName: "Test FC",
    email: "test@example.com",
    role: "player",
    hasJoinedGame: false,
    balls: 0,
    userPoints: 0,
    createdAt: new Date(),
  });
  console.log("Mock User created.");
}

async function testPart1Economy() {
  console.log(`\n========================================================`);
  console.log(` Part 1: Testing User & Economy System Data Relationships`);
  console.log(`========================================================`);
  
  const userRef = doc(db, "users", TEST_USER_ID);
  
  // 1. Initial State
  const initialSnap = await getDoc(userRef);
  const initialBalls = initialSnap.data().balls;
  console.log(`Initial Balls: ${initialBalls}`);

  // 2. Perform Transaction (Add 100 Balls)
  const amountToAdd = 100;
  console.log(`Adding ${amountToAdd} Balls...`);
  
  const batch = writeBatch(db);
  batch.update(userRef, { balls: initialBalls + amountToAdd });
  const txRef = doc(collection(db, "users", TEST_USER_ID, "transactions"));
  batch.set(txRef, {
    amount: amountToAdd,
    type: "earn",
    source: "test_script",
    description: "Integration Test Bonus",
    timestamp: new Date(),
    status: "success"
  });
  await batch.commit();

  // 3. Verify User Document
  const afterAddSnap = await getDoc(userRef);
  const afterAddBalls = afterAddSnap.data().balls;
  if (afterAddBalls === initialBalls + amountToAdd) {
    console.log(`✅ User Document Updated Correctly! (Balls: ${afterAddBalls})`);
  } else {
    console.error(`❌ User Document Update Failed! Expected: ${initialBalls + amountToAdd}, Got: ${afterAddBalls}`);
  }

  // 4. Verify Transaction Document exists
  const txSnap = await getDocs(collection(db, "users", TEST_USER_ID, "transactions"));
  if (txSnap.size > 0) {
    const txData = txSnap.docs[0].data();
    console.log(`✅ Transaction Document Created! (Amount: ${txData.amount}, Source: ${txData.source})`);
  } else {
    console.error(`❌ Transaction Document NOT Created!`);
  }
}

import { runTransaction } from "firebase/firestore";

async function testPart2Inventory() {
  console.log(`\n========================================================`);
  console.log(` Part 2: Testing Inventory & Card/Manager System`);
  console.log(`========================================================`);
  
  const APP_ID = "ssr-team";
  const userRef = doc(db, "users", TEST_USER_ID);
  const invRef = doc(db, "artifacts", APP_ID, "users", TEST_USER_ID, "game_data", "inventory");

  // 1. Purchase a Card (Cost 50 Balls)
  console.log("Purchasing TEST_CARD_01 for 50 Balls...");
  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const invSnap = await transaction.get(invRef);
    
    const currentBalls = userSnap.data().balls;
    transaction.update(userRef, { balls: currentBalls - 50 });
    
    let invData = invSnap.exists() ? invSnap.data() : { ownedManagers: [], ownedCards: {} };
    if (!invData.ownedCards) invData.ownedCards = {};
    invData.ownedCards["TEST_CARD_01"] = (invData.ownedCards["TEST_CARD_01"] || 0) + 1;
    transaction.set(invRef, invData, { merge: true });
    
    // Add transaction log
    const txRef = doc(collection(db, "users", TEST_USER_ID, "transactions"));
    transaction.set(txRef, { amount: -50, type: "spend", source: "buy_card", timestamp: new Date() });
  });

  // 2. Purchase a Manager (Cost 30 Balls)
  console.log("Purchasing TEST_MANAGER_01 for 30 Balls...");
  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const invSnap = await transaction.get(invRef);
    
    const currentBalls = userSnap.data().balls;
    transaction.update(userRef, { balls: currentBalls - 30 });
    
    let invData = invSnap.exists() ? invSnap.data() : { ownedManagers: [], ownedCards: {} };
    if (!invData.ownedManagers) invData.ownedManagers = [];
    invData.ownedManagers.push("TEST_MANAGER_01");
    transaction.set(invRef, invData, { merge: true });
    
    const txRef = doc(collection(db, "users", TEST_USER_ID, "transactions"));
    transaction.set(txRef, { amount: -30, type: "spend", source: "buy_manager", timestamp: new Date() });
  });

  // 3. Verify
  const afterUserSnap = await getDoc(userRef);
  const afterInvSnap = await getDoc(invRef);
  
  if (afterUserSnap.data().balls === 20) {
    console.log(`✅ Balls correctly deducted to 20.`);
  } else {
    console.error(`❌ Balls deduction failed. Expected 20, Got: ${afterUserSnap.data().balls}`);
  }
  
  const inv = afterInvSnap.data();
  if (inv.ownedCards["TEST_CARD_01"] === 1 && inv.ownedManagers.includes("TEST_MANAGER_01")) {
    console.log(`✅ Inventory Updated! Cards: ${JSON.stringify(inv.ownedCards)}, Managers: ${JSON.stringify(inv.ownedManagers)}`);
  } else {
    console.error(`❌ Inventory Update Failed!`);
  }
}

async function testPart3Squad() {
  console.log(`\n========================================================`);
  console.log(` Part 3: Testing Squad Management System`);
  console.log(`========================================================`);

  const APP_ID = "ssr-team";
  const squadRef = doc(db, "artifacts", APP_ID, "users", TEST_USER_ID, "game_data", "squad");
  const invRef = doc(db, "artifacts", APP_ID, "users", TEST_USER_ID, "game_data", "inventory");

  // 1. Initialize Squad and Add a Player
  console.log("Initializing Squad with 100 Budget and Adding Player TEST_PLAYER_01 (Price: 15)...");
  
  await setDoc(squadRef, {
    budgetLeft: 100,
    carriedOverBudget: 0,
    formation: "4-4-2",
    managerId: "",
    captainId: "",
    viceCaptainId: "",
    currentStreak: 1,
    mySquad: [],
    updatedAt: new Date()
  });

  const playerPrice = 15;
  
  // Simulate adding a player
  await runTransaction(db, async (transaction) => {
    const squadSnap = await transaction.get(squadRef);
    let squadData = squadSnap.data();
    
    if (squadData.budgetLeft < playerPrice) throw new Error("Not enough budget");
    
    squadData.budgetLeft -= playerPrice;
    squadData.mySquad.push({
      playerId: "TEST_PLAYER_01",
      position: "FWD",
      isStarting: true,
      slotIndex: 0,
      appliedCardId: null,
      isLocked: false
    });
    
    squadData.managerId = "TEST_MANAGER_01"; // assigning the manager we bought
    squadData.captainId = "TEST_PLAYER_01";
    
    transaction.set(squadRef, squadData, { merge: true });
  });

  // 2. Apply the Card we bought in Part 2
  console.log("Applying TEST_CARD_01 to TEST_PLAYER_01...");
  await runTransaction(db, async (transaction) => {
    const invSnap = await transaction.get(invRef);
    const squadSnap = await transaction.get(squadRef);
    
    let invData = invSnap.data();
    let squadData = squadSnap.data();
    
    if (!invData.ownedCards || invData.ownedCards["TEST_CARD_01"] <= 0) {
      throw new Error("Card not found in inventory");
    }
    
    // Deduct card
    invData.ownedCards["TEST_CARD_01"] -= 1;
    transaction.set(invRef, invData, { merge: true });
    
    // Apply card to player
    const playerIndex = squadData.mySquad.findIndex(p => p.playerId === "TEST_PLAYER_01");
    if (playerIndex !== -1) {
      squadData.mySquad[playerIndex].appliedCardId = "TEST_CARD_01";
      transaction.set(squadRef, squadData, { merge: true });
    }
  });

  // 3. Verify Squad Data
  const finalSquadSnap = await getDoc(squadRef);
  const squad = finalSquadSnap.data();
  
  if (squad.budgetLeft === 85) {
    console.log(`✅ Squad Budget Updated Correctly! (Budget Left: 85)`);
  } else {
    console.error(`❌ Squad Budget Update Failed! Expected: 85, Got: ${squad.budgetLeft}`);
  }
  
  const testPlayer = squad.mySquad.find(p => p.playerId === "TEST_PLAYER_01");
  if (testPlayer && testPlayer.appliedCardId === "TEST_CARD_01" && squad.managerId === "TEST_MANAGER_01") {
    console.log(`✅ Player, Card, and Manager Applied Successfully to Squad!`);
  } else {
    console.error(`❌ Squad Integration Failed!`);
  }
}

async function testPart4Gameweek() {
  console.log(`\n========================================================`);
  console.log(` Part 4: Testing Gameweek Engine System`);
  console.log(`========================================================`);

  const APP_ID = "ssr-team";
  const userRef = doc(db, "users", TEST_USER_ID);
  const squadRef = doc(db, "artifacts", APP_ID, "users", TEST_USER_ID, "game_data", "squad");
  const gwHistoryRef = doc(db, "users", TEST_USER_ID, "gameweek_history", "TEST_GW_1");

  console.log("Simulating Gameweek 1 End (TEST_PLAYER_01 scores 50 pts)...");

  await runTransaction(db, async (transaction) => {
    const squadSnap = await transaction.get(squadRef);
    const userSnap = await transaction.get(userRef);
    
    let squadData = squadSnap.data();
    let userData = userSnap.data();
    
    // Calculate Points
    let totalPoints = 0;
    let gwSquadSnapshot = [];
    
    squadData.mySquad.forEach(player => {
      // Simulate real match score
      let playerPoints = (player.playerId === "TEST_PLAYER_01") ? 50 : 0;
      
      // Captain Multiplier
      if (player.playerId === squadData.captainId) {
        playerPoints *= 2;
      }
      
      totalPoints += playerPoints;
      
      gwSquadSnapshot.push({
        playerId: player.playerId,
        position: player.position,
        isStarting: player.isStarting,
        pointsEarned: playerPoints
      });
      
      // Remove applied card
      player.appliedCardId = null;
    });

    // 1. Update User Points
    transaction.update(userRef, { 
      userPoints: (userData.userPoints || 0) + totalPoints,
      lastGameweekPoints: totalPoints
    });

    // 2. Save Gameweek History
    transaction.set(gwHistoryRef, {
      gameweekId: "TEST_GW_1",
      squad: gwSquadSnapshot,
      managerId: squadData.managerId,
      captainId: squadData.captainId,
      points: totalPoints,
      createdAt: new Date()
    });

    // 3. Clear applied cards in Squad
    transaction.set(squadRef, squadData, { merge: true });
  });

  // Verify updates
  const finalUserSnap = await getDoc(userRef);
  const finalHistorySnap = await getDoc(gwHistoryRef);
  const finalSquadSnap = await getDoc(squadRef);
  
  const finalUser = finalUserSnap.data();
  if (finalUser.userPoints === 100) {
    console.log(`✅ User Points Updated Correctly! (Total: 100)`);
  } else {
    console.error(`❌ User Points Update Failed! Expected: 100, Got: ${finalUser.userPoints}`);
  }
  
  const history = finalHistorySnap.data();
  if (history && history.points === 100) {
    console.log(`✅ Gameweek History Saved! (Points: 100)`);
  } else {
    console.error(`❌ Gameweek History Not Saved correctly!`);
  }
  
  const squad = finalSquadSnap.data();
  const testPlayer = squad.mySquad.find(p => p.playerId === "TEST_PLAYER_01");
  if (testPlayer && testPlayer.appliedCardId === null) {
    console.log(`✅ Applied Card properly cleared from Squad!`);
  } else {
    console.error(`❌ Applied Card was NOT cleared!`);
  }
}

async function runTests() {
  try {
    await setupMockUser();
    await testPart1Economy();
    await testPart2Inventory();
    await testPart3Squad();
    await testPart4Gameweek();
    console.log("\n✅ ALL PARTS COMPLETED SUCCESSFULLY.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test Failed:", error);
    process.exit(1);
  }
}

runTests();
