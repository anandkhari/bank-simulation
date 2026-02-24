import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD4aC2pnpUebSQNgmATX6XY6xzcISWLxSg",
  authDomain: "bank-simulator-4a2d5.firebaseapp.com",
  projectId: "bank-simulator-4a2d5",
  storageBucket: "bank-simulator-4a2d5.firebasestorage.app",
  messagingSenderId: "887128041852",
  appId: "1:887128041852:web:330376a0bcde8d5df61cf9"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
