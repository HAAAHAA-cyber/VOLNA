import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function login(email, password) {
  try {
    const user = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (e) {
    console.error(e);
  }
}

export async function register(email, password) {
  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    return user;
  } catch (e) {
    console.error(e);
  }
}

