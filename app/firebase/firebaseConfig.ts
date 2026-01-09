import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDf0L31c7ZYq2HolzIxfKIsC9BIEUHgBo",
  authDomain: "viet-c02c7.firebaseapp.com",
  projectId: "viet-c02c7",
  storageBucket: "viet-c02c7.firebasestorage.app",
  messagingSenderId: "1072145094764",
  appId: "1:1072145094764:web:ca4132c031568eec79a049",
  measurementId: "G-89V2WWSB13"
};

// ✅ tránh initialize nhiều lần
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔥 Firestore (OK cho server & client)
export const db = getFirestore(app);

// ✅ Analytics CHỈ chạy ở client
let analytics;
if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}
