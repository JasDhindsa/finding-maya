// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLVyHl3fYUV38W4B8LKetspawaZV4cOBc",
  authDomain: "finding-maya.firebaseapp.com",
  projectId: "finding-maya",
  storageBucket: "finding-maya.firebasestorage.app",
  messagingSenderId: "21248969890",
  appId: "1:21248969890:web:990fb5ff610dfc679adbfb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);