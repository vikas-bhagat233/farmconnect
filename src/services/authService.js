import { 
  auth, 
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  db,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  GoogleAuthProvider,
  signInWithCredential
} from './firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { saveUserRole as saveUserRoleToFirestore, getUserRole } from './firestoreService';

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const role = await getUserRole(userCredential.user.uid);
    return { success: true, user: userCredential.user, role };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signupWithEmail = async (email, password, displayName, securityAnswers = []) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const safeDisplayName = displayName || email.split('@')[0];
    await updateProfile(userCredential.user, { displayName: safeDisplayName });
    
    // Store security answers
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName: safeDisplayName,
      securityAnswers,
      role: null,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginWithGoogle = async () => {
  try {
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      return { success: false, error: 'Google sign-in is not configured.' };
    }

    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false
    });

    const { idToken } = await GoogleSignin.signIn();
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        displayName: result.user.displayName || result.user.email?.split('@')[0],
        role: null,
        createdAt: new Date().toISOString()
      });
    }
    const role = await getUserRole(result.user.uid);
    return { success: true, user: result.user, role };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resetPasswordWithSecurity = async (email, question, answer) => {
  try {
    const userQuery = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(userQuery);
    if (snapshot.empty) {
      return { success: false, error: 'User not found' };
    }

    const userDoc = snapshot.docs[0];
    const storedAnswers = userDoc.data().securityAnswers || [];
    const normalizedAnswer = answer.trim().toLowerCase();

    const matched = storedAnswers.some((entry) => {
      if (typeof entry === 'string') {
        return entry.trim().toLowerCase() === normalizedAnswer;
      }
      return entry?.question === question &&
        String(entry?.answer || '').trim().toLowerCase() === normalizedAnswer;
    });

    if (!matched) {
      return { success: false, error: 'Security answers incorrect' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const saveUserRole = async (userId, role) => {
  try {
    await saveUserRoleToFirestore(userId, role);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};