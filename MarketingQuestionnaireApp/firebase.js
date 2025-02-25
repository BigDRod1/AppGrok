// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyCXb3jeztUITEOH3sq2twktTC4dt0367Gk",
//   authDomain: "marketingquestionnaireapp.firebaseapp.com",
//   projectId: "marketingquestionnaireapp",
//   storageBucket: "marketingquestionnaireapp.firebasestorage.app",
//   messagingSenderId: "597112144324",
//   appId: "1:597112144324:web:80c0db71e69689e3392491",
//   measurementId: "G-M0TTP98Q2K"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// import firebase from 'firebase/app';
// import 'firebase/firestore';

// const firebaseConfig = {
//     apiKey: "AIzaSyCXb3jeztUITEOH3sq2twktTC4dt0367Gk",
//     authDomain: "marketingquestionnaireapp.firebaseapp.com",
//     projectId: "marketingquestionnaireapp",
//     storageBucket: "marketingquestionnaireapp.firebasestorage.app",
//     messagingSenderId: "597112144324",
//     appId: "1:597112144324:web:80c0db71e69689e3392491",
//     measurementId: "G-M0TTP98Q2K"
//   };
// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// }

// export const db = firebase.firestore();






import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';

const firebaseConfig = {
      apiKey: "AIzaSyCXb3jeztUITEOH3sq2twktTC4dt0367Gk",
      authDomain: "marketingquestionnaireapp.firebaseapp.com",
      projectId: "marketingquestionnaireapp",
      storageBucket: "marketingquestionnaireapp.firebasestorage.app",
      messagingSenderId: "597112144324",
      appId: "1:597112144324:web:80c0db71e69689e3392491",
      measurementId: "G-M0TTP98Q2K"
    };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// // Optional: Export utility functions for convenience
export const getUserDoc = (userId) => doc(db, 'users', userId);



