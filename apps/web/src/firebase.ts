import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {  
  apiKey: "AIzaSyAMveKv0LB3LDAptU4fOEmjGsvLjBGxLUM",
  authDomain: "fungi-culture-app.firebaseapp.com",
  projectId: "fungi-culture-app",
  storageBucket: "fungi-culture-app.firebasestorage.app",
  messagingSenderId: "617143521523",
  appId: "1:617143521523:web:b5bc548bb55749d485e786",
  measurementId: "G-W1NTTCHEXD"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)