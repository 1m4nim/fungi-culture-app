import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
   apiKey: "AIzaSyAMveKv0LB3LDAptU4fOEmjGsvLjBGxLUM",
  authDomain: "fungi-culture-app.firebaseapp.com",
  projectId: "fungi-culture-app",
  storageBucket: "fungi-culture-app.appspot.com",

  messagingSenderId: "617143521523",
  appId: "1:617143521523:web:b5bc548bb55749d485e786",
  measurementId: "G-W1NTTCHEXD",
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const storage = getStorage(app)
