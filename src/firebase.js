import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDU4g3p2HJS7vhGmBfha_rI-ql5l_cPd58",
  authDomain: "time2travel-2f6d3.firebaseapp.com",
  projectId: "time2travel-2f6d3",
  storageBucket: "time2travel-2f6d3.firebasestorage.app",
  messagingSenderId: "694647034382",
  appId: "1:694647034382:web:246d14ce7ea798ab11e25f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);