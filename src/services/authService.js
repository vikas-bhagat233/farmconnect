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
  getDoc
} from './firebase';
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

export const signupWithEmail = async (email, password, displayName, securityAnswers) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    // Store security answers
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName,
      securityAnswers,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
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

export const resetPasswordWithSecurity = async (email, answers) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', email));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const storedAnswers = userDoc.data().securityAnswers;
    let isValid = true;
    
    for (let i = 0; i < answers.length; i++) {
      if (storedAnswers[i] !== answers[i]) {
        isValid = false;
        break;
      }
    }
    
    if (!isValid) {
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