// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "to-dozen",
  "appId": "1:230052641887:web:4130a244a7b4deb9392fea",
  "storageBucket": "to-dozen.firebasestorage.app",
  "apiKey": "AIzaSyA5F5Tb3uUa9UBrLhl6tqsHgi83p2GIzFM",
  "authDomain": "to-dozen.firebaseapp.com",
  "messagingSenderId": "230052641887"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
