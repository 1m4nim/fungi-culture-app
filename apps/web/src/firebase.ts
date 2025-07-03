<<<<<<< HEAD
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// Firebaseの設定はFirebaseコンソールで確認してください
const firebaseConfig = {
  apiKey: "AIzaSyAMveKv0LB3LDAptU4fOEmjGsvLjBGxLUM",
  authDomain: "fungi-culture-app.firebaseapp.com",
  projectId: "fungi-culture-app",
  storageBucket: "fungi-culture-app.appspot.com", // バケットURL修正しました（firebasestorage.app → appspot.comが正しいです）
=======

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
   apiKey: "AIzaSyAMveKv0LB3LDAptU4fOEmjGsvLjBGxLUM",
  authDomain: "fungi-culture-app.firebaseapp.com",
  projectId: "fungi-culture-app",
  storageBucket: "fungi-culture-app.appspot.com",
>>>>>>> bba55227 (ログが反映されるようになった。空でも送れてしまうのは問題)
  messagingSenderId: "617143521523",
  appId: "1:617143521523:web:b5bc548bb55749d485e786",
  measurementId: "G-W1NTTCHEXD",
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
<<<<<<< HEAD
export const provider = new GoogleAuthProvider()
=======
>>>>>>> bba55227 (ログが反映されるようになった。空でも送れてしまうのは問題)
export const storage = getStorage(app)
