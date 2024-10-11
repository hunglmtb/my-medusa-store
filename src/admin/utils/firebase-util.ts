import { initializeApp } from 'firebase/app'
import { FacebookAuthProvider, getAuth, GoogleAuthProvider } from 'firebase/auth'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Auth, User } from '@firebase/auth'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { MEDUSA_BACKEND_URL } from '../../constants/medusa-backend-url'

export const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [GoogleAuthProvider.PROVIDER_ID, FacebookAuthProvider.PROVIDER_ID],
}

const authPath = 'admin/auth/firebase'
const authUrl = `${MEDUSA_BACKEND_URL}/${authPath}` // 'http://localhost:9000/admin/auth/firebase'
// console.log('process.env', process.env)
const firebaseConfig = {
  apiKey: process.env.MEDUSA_ADMIN_FIREBASE_API_KEY,
  authDomain: 'novatopos.firebaseapp.com',
  projectId: 'novatopos',
  storageBucket: 'novatopos.appspot.com',
  messagingSenderId: '674597022011',
  appId: '1:674597022011:web:169de5ca81d0a87f5daf1e',
  measurementId: 'G-7J27JSFXW9',
}

export interface FirebaseUIAuth {
  firebaseAuth: Auth | null
  currentUser: User | null
  logout?: () => any
  firebaseLogin: (token: string) => Promise<Response>
}

const firebaseUIAuth: FirebaseUIAuth = {
  firebaseAuth: null,
  currentUser: null,
  firebaseLogin: async (token: string) => {
    return fetch(authUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    })
  },
}

const initializeFirebaseApp = () => {
  let firebaseAuth: Auth | null = null
  try {
    const firebaseApp = initializeApp(firebaseConfig)
    firebaseAuth = getAuth(firebaseApp)
    firebaseAuth.onAuthStateChanged((user) => {
      firebaseUIAuth.currentUser = user
      /* user?.getIdToken().then(token => {
        firebaseUIAuth.firebaseLogin(token).then(session => {
          console.log('firebaseLogin session', session)
        })
      }) */
    })
  } catch (e) {
    console.log(`initializeFirebaseApp error`, e)
  }
  return firebaseAuth
}

firebaseUIAuth.firebaseAuth = initializeFirebaseApp()
firebaseUIAuth.logout = async () => firebaseUIAuth.firebaseAuth.signOut()

export default firebaseUIAuth
