// FIREBASE CONFIG & INITIALIZATION
// DO NOT EDIT THIS CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCDZboynGCZ1f5DQNpVfnwL8VzQrP_gLGs",
  authDomain: "cash-bd-a4d4c.firebaseapp.com",
  databaseURL: "https://cash-bd-a4d4c-default-rtdb.firebaseio.com",
  projectId: "cash-bd-a4d4c",
  storageBucket: "cash-bd-a4d4c.firebasestorage.app",
  messagingSenderId: "912652856482",
  appId: "1:912652856482:web:b67534a9a1db2234277bfb",
  measurementId: "G-VZSTY5TPJP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();