import { debug } from "console";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, getRedirectResult } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
console.log(firebaseConfig.apiKey)
export const firebaseApp = firebaseConfig;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const provider = new GoogleAuthProvider();

export function login() {
  signInWithPopup(auth, provider);
}

export async function handleRedirect() {
  try {
    alert(auth.currentUser)
    const result = await getRedirectResult(auth);
    console.log(result)
    if (result) {
      const user = result.user;
      console.log("User signed in:", user.displayName);
      alert(`Welcome, ${user.displayName || user.email}!`);
      return user;
    }
    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    alert("Authentication failed. Please try again.");
    return null;
  }
}

// Chat functions
export async function sendMessage(chatId: string, message: { text: string; senderId: string; senderName: string; type: 'text' | 'image' | 'file' }) {
  try {
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      ...message,
      timestamp: serverTimestamp(),
      read: false
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export function subscribeToMessages(chatId: string, callback: (messages: any[]) => void) {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
}

export async function uploadFile(file: File): Promise<string> {
  try {
    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function createChat(participants: string[]) {
  try {
    const chatRef = await addDoc(collection(db, 'chats'), {
      participants,
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    return chatRef.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

export function subscribeToChats(userId: string, callback: (chats: any[]) => void) {
  const chatsRef = collection(db, 'chats');

  return onSnapshot(chatsRef, (snapshot) => {
    const chats = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          participants: data.participants || []
        };
      })
      .filter(chat => chat.participants.includes(userId));
    callback(chats);
  });
}