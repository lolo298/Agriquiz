import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA5MsyYVZQQ4rAyGiOLzBk61B0XQHZwf4M",
  authDomain: "test-db-2833d.firebaseapp.com",
  databaseURL: "https://test-db-2833d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "test-db-2833d",
  storageBucket: "test-db-2833d.appspot.com",
  messagingSenderId: "1079299527330",
  appId: "1:1079299527330:web:48b5cdd6b23b72e56a3dfb",
  measurementId: "G-EER7KFEKGG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
