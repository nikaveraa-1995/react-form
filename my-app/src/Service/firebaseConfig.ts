// firebaseConfig.ts
// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database'; // добавляем

const firebaseConfig = {
  apiKey: `${process.env.REACT_APP_API_KEY}`,
  authDomain: 'reakt-form.firebaseapp.com',
  projectId: 'reakt-form',
  databaseURL: `${process.env.REACT_APP_API_URL}`,
  storageBucket: 'reakt-form.appspot.com', // исправила здесь на правильный адрес
  messagingSenderId: '481078524373',
  appId: '1:481078524373:web:337b3dd224aaa478cde55c',
  measurementId: 'G-HKMS4VE772',
};

const app = initializeApp(firebaseConfig);

// добавляем это:
const db = getDatabase(app);

// экспортируем нужное:
export { app, db };
