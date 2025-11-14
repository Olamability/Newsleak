// mobile/src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'emulator',
  authDomain: 'localhost',
  projectId: 'newsleak-project',
};

const app = initializeApp(firebaseConfig);

export async function getAuthInstance() {
  const auth = getAuth(app);
  if (__DEV__) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  }
  return auth;
}
