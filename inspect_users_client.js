const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "fake-api-key",
  authDomain: "wavepos-staff.firebaseapp.com",
  projectId: "wavepos-staff",
  storageBucket: "wavepos-staff.appspot.com",
  messagingSenderId: "12345",
  appId: "1:12345:web:12345"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("--- QUERYING CLIENT FIRESTORE USERS ---");
  const querySnapshot = await getDocs(collection(db, "users"));
  if (querySnapshot.empty) {
    console.log("No users found in collection 'users'");
    return;
  }
  querySnapshot.forEach((doc) => {
    console.log(`Doc ID: [${doc.id}]`);
    console.log(JSON.stringify(doc.data(), null, 2));
    console.log("------------------------");
  });
}

run().catch(console.error);
