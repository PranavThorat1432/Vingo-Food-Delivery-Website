// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "vingo-food-delivery-aac8d.firebaseapp.com",
  projectId: "vingo-food-delivery-aac8d",
  storageBucket: "vingo-food-delivery-aac8d.firebasestorage.app",
  messagingSenderId: "664650142508",
  appId: "1:664650142508:web:c6d8bbb2ad4f389711d289"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {app, auth};