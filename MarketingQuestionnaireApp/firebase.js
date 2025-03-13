import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, collection, addDoc, query, onSnapshot, where, updateDoc, deleteDoc, writeBatch, getDoc, setDoc, increment } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCXb3jeztUITEOH3sq2twktTC4dt0367Gk",
  authDomain: "marketingquestionnaireapp.firebaseapp.com",
  projectId: "marketingquestionnaireapp",
  storageBucket: "marketingquestionnaireapp.firebasestorage.app",
  messagingSenderId: "597112144324",
  appId: "1:597112144324:web:80c0db71e69689e3392491",
  measurementId: "G-M0TTP98Q2K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // AsyncStorage not needed with getAuth, warning is benign
export const db = getFirestore(app);

export { 
  doc, collection, addDoc, query, onSnapshot, where, updateDoc, deleteDoc, writeBatch, getDoc, setDoc, increment,
  signInAnonymously, onAuthStateChanged
};

export const getUserDoc = (userId) => doc(db, 'users', userId);