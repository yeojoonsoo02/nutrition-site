import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDx1iH_CQjD3t-wDz173cQx0H-MrXQEoe8",
  authDomain: "nutrition-site-c9249.firebaseapp.com",
  projectId: "nutrition-site-c9249",
  storageBucket: "nutrition-site-c9249.firebasestorage.app",
  messagingSenderId: "139796418952",
  appId: "1:139796418952:web:fe676c89e77b68bd60ea3d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
