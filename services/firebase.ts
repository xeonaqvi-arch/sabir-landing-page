import * as firebase from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDoc, doc } from "firebase/firestore";
import { GeneratedPage } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyCtoc-IaMoM4PcHMrb3ViZH-aFdjO3as8c",
  authDomain: "fir-test-project-f958d.firebaseapp.com",
  projectId: "fir-test-project-f958d",
  storageBucket: "fir-test-project-f958d.firebasestorage.app",
  messagingSenderId: "174070814944",
  appId: "1:174070814944:web:6ffe33d952e841d1335885",
  measurementId: "G-YHGEY3DDTR"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Publish a page to the 'published_pages' collection
export const publishPage = async (page: GeneratedPage, userId: string): Promise<string> => {
  const data = {
    title: page.title,
    html: page.html,
    css: page.css,
    js: page.js,
    prompt: page.prompt,
    createdAt: Date.now(),
    userId: userId,
    originalId: page.id
  };
  
  const docRef = await addDoc(collection(db, "published_pages"), data);
  return docRef.id;
};

// Fetch a published page by ID (public access)
export const getPublishedPage = async (id: string): Promise<GeneratedPage | null> => {
  try {
    const docRef = doc(db, "published_pages", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as GeneratedPage;
    }
    return null;
  } catch (e) {
    console.error("Error fetching published page:", e);
    return null;
  }
};